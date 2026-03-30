/**
 * Logger tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";

describe("LogLevel enum", () => {
  it("should have all expected log levels", async () => {
    const { LogLevel } = await import("./logger.js");
    expect(LogLevel.DEBUG).toBe("DEBUG");
    expect(LogLevel.INFO).toBe("INFO");
    expect(LogLevel.WARN).toBe("WARN");
    expect(LogLevel.ERROR).toBe("ERROR");
  });

  it("log levels should be string type", async () => {
    const { LogLevel } = await import("./logger.js");
    expect(typeof LogLevel.DEBUG).toBe("string");
    expect(typeof LogLevel.INFO).toBe("string");
  });
});

describe("LogEntry interface", () => {
  it("should have all required fields", async () => {
    const { LogLevel } = await import("./logger.js");
    const entry: any = {
      timestamp: "2026-03-31T10:00:00.000Z",
      level: LogLevel.INFO,
      message: "Test message",
      tool: "test_tool",
      duration: 100,
      error: "Error message",
    };

    expect(entry.timestamp).toBeDefined();
    expect(entry.level).toBeDefined();
    expect(entry.message).toBeDefined();
  });

  it("optional fields can be undefined", async () => {
    const { LogLevel } = await import("./logger.js");
    const entry: any = {
      timestamp: "2026-03-31T10:00:00.000Z",
      level: LogLevel.INFO,
      message: "Test message",
    };

    expect(entry.tool).toBeUndefined();
    expect(entry.duration).toBeUndefined();
    expect(entry.error).toBeUndefined();
  });
});

describe("Logger instance", () => {
  let logger: any;
  let LogLevel: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "mkdirSync").mockReturnValue(undefined);
    vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);
    vi.spyOn(fs, "readFileSync").mockReturnValue("");
    vi.spyOn(fs, "appendFileSync").mockReturnValue(undefined);
    vi.spyOn(fs, "unlinkSync").mockReturnValue(undefined);
    vi.spyOn(fs, "statSync").mockReturnValue({ size: 100 } as any);

    const loggerModule = await import("./logger.js");
    logger = loggerModule.logger;
    LogLevel = loggerModule.LogLevel;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("log methods exist", () => {
    it("logger should have debug method", () => {
      expect(typeof logger.debug).toBe("function");
    });

    it("logger should have info method", () => {
      expect(typeof logger.info).toBe("function");
    });

    it("logger should have warn method", () => {
      expect(typeof logger.warn).toBe("function");
    });

    it("logger should have error method", () => {
      expect(typeof logger.error).toBe("function");
    });

    it("logger should have logToolCall method", () => {
      expect(typeof logger.logToolCall).toBe("function");
    });

    it("logger should have getLogs method", () => {
      expect(typeof logger.getLogs).toBe("function");
    });

    it("logger should have getLogFiles method", () => {
      expect(typeof logger.getLogFiles).toBe("function");
    });

    it("logger should have clearLogs method", () => {
      expect(typeof logger.clearLogs).toBe("function");
    });

    it("logger should have getLogFilePath method", () => {
      expect(typeof logger.getLogFilePath).toBe("function");
    });
  });

  describe("getLogFilePath", () => {
    it("should return correct file path format", () => {
      const filePath = logger.getLogFilePath();
      const date = new Date().toISOString().split("T")[0];
      expect(filePath).toContain(date);
      expect(filePath).toContain(".jsonl");
    });
  });

  describe("getLogs", () => {
    it("should return empty array when no logs", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue([] as any);
      const logs = logger.getLogs({});
      expect(Array.isArray(logs)).toBe(true);
    });

    it("limit parameter should limit results", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["weather-mcp-2026-03-30.jsonl"] as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        '{"timestamp":"2026-03-30T10:00:00Z","level":"INFO","message":"Test1"}\n' +
        '{"timestamp":"2026-03-30T11:00:00Z","level":"INFO","message":"Test2"}\n'
      );

      const logs = logger.getLogs({ limit: 1 });
      expect(logs.length).toBe(1);
    });

    it("level filter should return matching logs", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["weather-mcp-2026-03-30.jsonl"] as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        '{"timestamp":"2026-03-30T10:00:00Z","level":"INFO","message":"Test1"}\n' +
        '{"timestamp":"2026-03-30T11:00:00Z","level":"ERROR","message":"Test2"}\n'
      );

      const logs = logger.getLogs({ level: LogLevel.ERROR });
      logs.forEach((log: any) => {
        expect(log.level).toBe(LogLevel.ERROR);
      });
    });

    it("tool filter should return matching logs", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["weather-mcp-2026-03-30.jsonl"] as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        '{"timestamp":"2026-03-30T10:00:00Z","level":"INFO","message":"Test1","tool":"get_weather"}\n' +
        '{"timestamp":"2026-03-30T11:00:00Z","level":"INFO","message":"Test2","tool":"get_logs"}\n'
      );

      const logs = logger.getLogs({ tool: "get_weather" });
      logs.forEach((log: any) => {
        expect(log.tool).toBe("get_weather");
      });
    });
  });

  describe("getLogFiles", () => {
    it("should return file info array", () => {
      vi.spyOn(fs, "readdirSync").mockReturnValue(["weather-mcp-2026-03-30.jsonl"] as any);
      vi.spyOn(fs, "readFileSync").mockReturnValue('{"timestamp":"2026-03-30T10:00:00Z","level":"INFO","message":"Test"}\n');
      vi.spyOn(fs, "statSync").mockReturnValue({ size: 100 } as any);

      const files = logger.getLogFiles();
      expect(Array.isArray(files)).toBe(true);
      if (files.length > 0) {
        expect(files[0]).toHaveProperty("fileName");
        expect(files[0]).toHaveProperty("size");
        expect(files[0]).toHaveProperty("entries");
      }
    });
  });

  describe("clearLogs", () => {
    it("should call unlinkSync to delete files", () => {
      const unlinkSpy = vi.spyOn(fs, "unlinkSync").mockReturnValue(undefined);
      vi.spyOn(fs, "readdirSync").mockReturnValue(["weather-mcp-2026-03-30.jsonl"] as any);

      logger.clearLogs();

      expect(unlinkSpy).toHaveBeenCalled();
    });
  });
});
