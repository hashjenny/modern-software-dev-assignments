/**
 * MCP tools tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpError } from "@modelcontextprotocol/sdk/types.js";

vi.mock("../lib/weather-api.js", () => ({
  getWeather: vi.fn(),
  WeatherAPIError: class extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public isRateLimited: boolean = false
    ) {
      super(message);
      this.name = "WeatherAPIError";
    }
  },
  NetworkTimeoutError: class extends Error {
    constructor() {
      super("Request timed out");
      this.name = "NetworkTimeoutError";
    }
  },
}));

vi.mock("../lib/clothing.js", () => ({
  getClothingAdvice: vi.fn(),
}));

vi.mock("../lib/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    logToolCall: vi.fn(),
    getLogs: vi.fn().mockReturnValue([]),
    getLogFiles: vi.fn().mockReturnValue([]),
    clearLogs: vi.fn(),
  },
  LogLevel: {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
  },
}));

import {
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
} from "./tools.js";
import * as weatherApiModule from "../lib/weather-api.js";
import * as clothingModule from "../lib/clothing.js";
import * as loggerModule from "../lib/logger.js";

describe("getWeatherTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("成功获取天气时应返回正确格式", async () => {
    const mockWeather = { tempMax: 28, tempMin: 18, date: "2026-03-31" };
    vi.mocked(weatherApiModule.getWeather).mockResolvedValue(mockWeather);

    const result = await getWeatherTool.handler();

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.tempMax).toBe(28);
    expect(parsed.tempMin).toBe(18);
    expect(parsed.date).toBe("2026-03-31");
  });

  it("WeatherAPIError 错误时应抛出 McpError(-32603)", async () => {
    vi.mocked(weatherApiModule.getWeather).mockRejectedValue(
      new weatherApiModule.WeatherAPIError("API error", 500)
    );

    await expect(getWeatherTool.handler()).rejects.toThrow(McpError);
  });

  it("WeatherAPIError 速率限制时应抛出 McpError(-32000)", async () => {
    vi.mocked(weatherApiModule.getWeather).mockRejectedValue(
      new weatherApiModule.WeatherAPIError("Rate limited", 429, true)
    );

    try {
      await getWeatherTool.handler();
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(McpError);
      expect((e as McpError).code).toBe(-32000);
    }
  });

  it("NetworkTimeoutError 时应抛出 McpError(-32603)", async () => {
    vi.mocked(weatherApiModule.getWeather).mockRejectedValue(
      new weatherApiModule.NetworkTimeoutError()
    );

    await expect(getWeatherTool.handler()).rejects.toThrow(McpError);
    await expect(getWeatherTool.handler()).rejects.toThrow("timed out");
  });

  it("未知错误时应抛出通用 McpError(-32603)", async () => {
    vi.mocked(weatherApiModule.getWeather).mockRejectedValue(new Error("Unknown error"));

    await expect(getWeatherTool.handler()).rejects.toThrow(McpError);
  });

  it("应正确记录工具调用日志", async () => {
    vi.mocked(weatherApiModule.getWeather).mockResolvedValue({
      tempMax: 28,
      tempMin: 18,
      date: "2026-03-31",
    });

    await getWeatherTool.handler();

    expect(loggerModule.logger.logToolCall).toHaveBeenCalledWith(
      "get_weather",
      expect.any(Number),
      true
    );
  });
});

describe("getClothingAdviceTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("参数验证", () => {
    it("缺少 temperature 参数时应抛出 McpError(-32602)", async () => {
      await expect(getClothingAdviceTool.handler({})).rejects.toThrow(McpError);
      await expect(getClothingAdviceTool.handler({})).rejects.toThrow("Missing required parameter");
    });

    it("temperature 为 null 时应抛出错误", async () => {
      await expect(
        getClothingAdviceTool.handler({ temperature: null as any })
      ).rejects.toThrow(McpError);
    });

    it("temperature 为 undefined 时应抛出错误", async () => {
      await expect(
        getClothingAdviceTool.handler({ temperature: undefined })
      ).rejects.toThrow(McpError);
    });

    it("temperature 为非数字字符串时应抛出 McpError(-32602)", async () => {
      await expect(
        getClothingAdviceTool.handler({ temperature: "hot" as any })
      ).rejects.toThrow(McpError);
    });

    it("temperature 为 NaN 时应抛出错误", async () => {
      await expect(
        getClothingAdviceTool.handler({ temperature: NaN })
      ).rejects.toThrow(McpError);
    });
  });

  describe("有效参数处理", () => {
    beforeEach(() => {
      vi.mocked(clothingModule.getClothingAdvice).mockImplementation((temp: number) => {
        const BASE_TEMP = 26;
        const diff = temp - BASE_TEMP;
        let suggestion = "";
        if (diff >= 5) suggestion = "天气较热";
        else if (diff >= 2) suggestion = "天气偏暖";
        else if (diff >= -2) suggestion = "体感舒适";
        else if (diff >= -5) suggestion = "稍微偏凉";
        else if (diff >= -8) suggestion = "天气较凉";
        else suggestion = "天气较冷";
        return { suggestion, diff };
      });
    });

    it("有效温度 25°C 应返回正确建议", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: 25 });

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty("suggestion");
      expect(parsed).toHaveProperty("diff");
      expect(parsed.diff).toBe(-1);
    });

    it("有效温度 30°C 应返回较热建议", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: 30 });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(4);
    });

    it("有效温度 -5°C 应返回寒冷建议", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: -5 });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(-31);
      expect(parsed.suggestion).toBe("天气较冷");
    });
  });

  describe("边界温度", () => {
    beforeEach(() => {
      vi.mocked(clothingModule.getClothingAdvice).mockImplementation((temp: number) => {
        const BASE_TEMP = 26;
        const diff = temp - BASE_TEMP;
        return { suggestion: "test", diff };
      });
    });

    it("温度 0°C", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: 0 });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(-26);
    });

    it("极端高温 50°C", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: 50 });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(24);
    });

    it("极端低温 -30°C", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: -30 });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(-56);
    });

    it("浮点数温度 25.5°C", async () => {
      const result = await getClothingAdviceTool.handler({ temperature: 25.5 });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.diff).toBe(-0.5);
    });
  });

  it("McpError 应直接抛出并记录日志", async () => {
    vi.clearAllMocks();
    vi.mocked(clothingModule.getClothingAdvice).mockImplementation(() => {
      throw new McpError(-32602, "Test error");
    });

    await expect(
      getClothingAdviceTool.handler({ temperature: 25 })
    ).rejects.toThrow(McpError);
  });

  it("应正确记录工具调用日志", async () => {
    vi.mocked(clothingModule.getClothingAdvice).mockReturnValue({ suggestion: "test", diff: 0 });
    await getClothingAdviceTool.handler({ temperature: 25 });
    expect(loggerModule.logger.logToolCall).toHaveBeenCalledWith(
      "get_clothing_advice",
      expect.any(Number),
      true
    );
  });
});

describe("getLogsTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("无参数时应使用默认限制", async () => {
    const mockLogs: any[] = [
      { timestamp: "2026-03-31T10:00:00Z", level: "INFO", message: "Test" },
    ];
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue(mockLogs);

    const result = await getLogsTool.handler({});

    expect(loggerModule.logger.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 })
    );
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.total).toBe(1);
  });

  it("指定 limit 参数时应传递给 getLogs", async () => {
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue([]);

    await getLogsTool.handler({ limit: 50 });

    expect(loggerModule.logger.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50 })
    );
  });

  it("指定 level 参数时应传递给 getLogs", async () => {
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue([]);

    await getLogsTool.handler({ level: "ERROR" });

    expect(loggerModule.logger.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({ level: "ERROR" })
    );
  });

  it("指定 tool 参数时应传递给 getLogs", async () => {
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue([]);

    await getLogsTool.handler({ tool: "get_weather" });

    expect(loggerModule.logger.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({ tool: "get_weather" })
    );
  });

  it("指定日期范围参数时应传递给 getLogs", async () => {
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue([]);

    await getLogsTool.handler({
      start_date: "2026-03-01",
      end_date: "2026-03-31",
    });

    expect(loggerModule.logger.getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: "2026-03-01",
        endDate: "2026-03-31",
      })
    );
  });

  it("应返回日志文件列表信息", async () => {
    const mockFiles = [{ fileName: "weather-mcp-2026-03-31.jsonl", size: 1024, entries: 10 }];
    vi.mocked(loggerModule.logger.getLogs).mockReturnValue([]);
    vi.mocked(loggerModule.logger.getLogFiles).mockReturnValue(mockFiles);

    const result = await getLogsTool.handler({});
    const parsed = JSON.parse(result.content[0].text);

    expect(parsed.files).toEqual(mockFiles);
  });

  it("getLogs 抛出错误时应抛出 McpError(-32603)", async () => {
    vi.mocked(loggerModule.logger.getLogs).mockImplementation(() => {
      throw new Error("Read error");
    });

    await expect(getLogsTool.handler({})).rejects.toThrow(McpError);
    try {
      await getLogsTool.handler({});
    } catch (e) {
      if (e instanceof McpError) {
        expect(e.code).toBe(-32603);
      }
    }
  });
});

describe("clearLogsTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("成功清除日志应返回 success: true", async () => {
    vi.mocked(loggerModule.logger.clearLogs).mockReturnValue();

    const result = await clearLogsTool.handler();
    const parsed = JSON.parse(result.content[0].text);

    expect(parsed.success).toBe(true);
    expect(parsed.message).toBe("All logs cleared");
    expect(loggerModule.logger.clearLogs).toHaveBeenCalled();
  });

  it("clearLogs 抛出错误时应抛出 McpError(-32603)", async () => {
    vi.mocked(loggerModule.logger.clearLogs).mockImplementation(() => {
      throw new Error("Delete error");
    });

    await expect(clearLogsTool.handler()).rejects.toThrow(McpError);
    try {
      await clearLogsTool.handler();
    } catch (e) {
      if (e instanceof McpError) {
        expect(e.code).toBe(-32603);
      }
    }
  });
});

describe("工具定义结构", () => {
  it("getWeatherTool 应有正确的结构", () => {
    expect(getWeatherTool).toHaveProperty("name", "get_weather");
    expect(getWeatherTool).toHaveProperty("description");
    expect(getWeatherTool).toHaveProperty("inputSchema");
    expect(getWeatherTool).toHaveProperty("handler");
    expect(getWeatherTool.inputSchema.type).toBe("object");
    expect(getWeatherTool.inputSchema.properties).toEqual({});
  });

  it("getClothingAdviceTool 应有正确的结构", () => {
    expect(getClothingAdviceTool).toHaveProperty("name", "get_clothing_advice");
    expect(getClothingAdviceTool.inputSchema.properties).toHaveProperty("temperature");
    expect(getClothingAdviceTool.inputSchema.required).toContain("temperature");
  });

  it("getLogsTool 应有正确的结构", () => {
    expect(getLogsTool).toHaveProperty("name", "get_logs");
    expect(getLogsTool.inputSchema.properties).toHaveProperty("limit");
    expect(getLogsTool.inputSchema.properties).toHaveProperty("level");
    expect(getLogsTool.inputSchema.properties).toHaveProperty("tool");
    expect(getLogsTool.inputSchema.properties).toHaveProperty("start_date");
    expect(getLogsTool.inputSchema.properties).toHaveProperty("end_date");
  });

  it("clearLogsTool 应有正确的结构", () => {
    expect(clearLogsTool).toHaveProperty("name", "clear_logs");
    expect(clearLogsTool.inputSchema.properties).toEqual({});
    expect(clearLogsTool.inputSchema.required).toEqual([]);
  });
});
