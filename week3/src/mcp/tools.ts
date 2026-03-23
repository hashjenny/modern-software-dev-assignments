import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  getWeather,
  getClothingAdvice,
  WeatherAPIError,
  NetworkTimeoutError,
} from "../lib/weather.js";
import { logger, LogLevel } from "../lib/logger.js";
import { z } from "zod";

const temperatureSchema = z.number();

export const getWeatherTool = {
  name: "get_weather",
  description: "获取今天的天气预报,包括最高和最低温度",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async () => {
    const startTime = Date.now();
    try {
      logger.info("Starting get_weather tool call");
      const weather = await getWeather();
      const duration = Date.now() - startTime;

      logger.logToolCall("get_weather", duration, true);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              tempMax: weather.tempMax,
              tempMin: weather.tempMin,
              date: weather.date,
            }),
          },
        ],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logToolCall(
        "get_weather",
        duration,
        false,
        error instanceof Error ? error.message : String(error),
      );

      if (error instanceof WeatherAPIError) {
        if (error.isRateLimited) {
          throw new McpError(-32000, `Rate limited: ${error.message}`);
        }
        throw new McpError(-32603, `Weather API error: ${error.message}`);
      }
      if (error instanceof NetworkTimeoutError) {
        throw new McpError(
          -32603,
          "Weather API request timed out. Please try again.",
        );
      }
      throw new McpError(
        -32603,
        `Failed to get weather: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export const getClothingAdviceTool = {
  name: "get_clothing_advice",
  description: "根据温度获取穿衣建议",
  inputSchema: {
    type: "object",
    properties: {
      temperature: {
        type: "number",
        description: "温度(摄氏度)",
      },
    },
    required: ["temperature"],
  },
  handler: async (args: { temperature?: number }) => {
    const startTime = Date.now();
    try {
      if (args.temperature === undefined || args.temperature === null) {
        throw new McpError(-32602, "Missing required parameter: temperature");
      }

      const parsed = temperatureSchema.safeParse(args.temperature);
      if (!parsed.success) {
        throw new McpError(-32602, `Invalid temperature: ${args.temperature}`);
      }

      logger.info(
        `Starting get_clothing_advice tool call with temperature: ${parsed.data}`,
      );

      const advice = getClothingAdvice(parsed.data);
      const duration = Date.now() - startTime;

      logger.logToolCall("get_clothing_advice", duration, true);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              suggestion: advice.suggestion,
              diff: advice.diff,
            }),
          },
        ],
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof McpError) {
        logger.logToolCall(
          "get_clothing_advice",
          duration,
          false,
          error.message,
        );
        throw error;
      }

      logger.logToolCall(
        "get_clothing_advice",
        duration,
        false,
        error instanceof Error ? error.message : String(error),
      );
      throw new McpError(
        -32603,
        `Failed to get clothing advice: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

const logLevelSchema = z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).optional();

export const getLogsTool = {
  name: "get_logs",
  description: "获取 MCP 服务器的日志记录,支持过滤和分页",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "返回的日志条数(默认100条,最多1000条)",
        minimum: 1,
        maximum: 1000,
      },
      level: {
        type: "string",
        description: "日志级别过滤(DEBUG/INFO/WARN/ERROR)",
        enum: ["DEBUG", "INFO", "WARN", "ERROR"],
      },
      tool: {
        type: "string",
        description: "按工具名称过滤(如 get_weather, get_clothing_advice)",
      },
      start_date: {
        type: "string",
        description: "开始时间(ISO 8601 格式,如 2026-03-01)",
      },
      end_date: {
        type: "string",
        description: "结束时间(ISO 8601 格式,如 2026-03-24)",
      },
    },
    required: [],
  },
  handler: async (args: {
    limit?: number;
    level?: string;
    tool?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      logger.info("get_logs tool called", {
        limit: args.limit,
        level: args.level,
        tool: args.tool,
      });

      const logs = logger.getLogs({
        limit: args.limit || 100,
        level: args.level as LogLevel | undefined,
        tool: args.tool,
        startDate: args.start_date,
        endDate: args.end_date,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              logs,
              total: logs.length,
              files: logger.getLogFiles(),
            }),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        -32603,
        `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export const clearLogsTool = {
  name: "clear_logs",
  description: "清除所有日志文件",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async () => {
    try {
      logger.info("clear_logs tool called");
      logger.clearLogs();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: "All logs cleared",
            }),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        -32603,
        `Failed to clear logs: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export const tools = [
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
];
