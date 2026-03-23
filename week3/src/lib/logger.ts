import fs from "fs";
import path from "path";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  tool?: string;
  duration?: number;
  error?: string;
}

interface LogConfig {
  logDir: string;
  logFileName: string;
  maxLogFiles: number;
  maxEntriesPerFile: number;
}

const DEFAULT_CONFIG: LogConfig = {
  logDir: ".logs",
  logFileName: "weather-mcp",
  maxLogFiles: 7,
  maxEntriesPerFile: 1000,
};

class Logger {
  private config: LogConfig;
  private currentLogFile: string;
  private entryCount: number = 0;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureLogDir();
    this.currentLogFile = this.getLogFilePath();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.config.logDir, `${this.config.logFileName}-${date}.jsonl`);
  }

  private rotateLogsIfNeeded(): void {
    const newLogFile = this.getLogFilePath();
    if (newLogFile !== this.currentLogFile) {
      this.currentLogFile = newLogFile;
      this.entryCount = 0;
      this.cleanOldLogs();
    }
  }

  private cleanOldLogs(): void {
    const files = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName))
      .sort()
      .reverse();

    if (files.length > this.config.maxLogFiles) {
      const toDelete = files.slice(this.config.maxLogFiles);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(this.config.logDir, file));
      }
    }
  }

  private writeEntry(entry: LogEntry): void {
    this.rotateLogsIfNeeded();
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(this.currentLogFile, line, "utf-8");
    this.entryCount++;

    // stderr for STDIO server (logs should not go to stdout)
    console.error(`[${entry.level}] ${entry.timestamp}: ${entry.message}`);
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    if (meta) {
      return `${message} ${JSON.stringify(meta)}`;
    }
    return message;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message: this.formatMessage(LogLevel.DEBUG, message, meta),
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: this.formatMessage(LogLevel.INFO, message, meta),
    });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message: this.formatMessage(LogLevel.WARN, message, meta),
    });
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMsg = error instanceof Error ? error.message : error ? String(error) : undefined;
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message: this.formatMessage(LogLevel.ERROR, message, meta),
      error: errorMsg,
    });
  }

  logToolCall(toolName: string, durationMs: number, success: boolean, error?: string): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      message: `Tool call: ${toolName}`,
      tool: toolName,
      duration: durationMs,
      error,
    });
  }

  getLogs(options: {
    limit?: number;
    level?: LogLevel;
    tool?: string;
    startDate?: string;
    endDate?: string;
  } = {}): LogEntry[] {
    const {
      limit = 100,
      level,
      tool,
      startDate,
      endDate,
    } = options;

    const logs: LogEntry[] = [];
    const logFiles = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName))
      .sort()
      .reverse();

    for (const file of logFiles) {
      if (logs.length >= limit) break;

      const filePath = path.join(this.config.logDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines.reverse()) {
        if (logs.length >= limit) break;

        try {
          const entry = JSON.parse(line) as LogEntry;

          // Apply filters
          if (level && entry.level !== level) continue;
          if (tool && entry.tool !== tool) continue;
          if (startDate && entry.timestamp < startDate) continue;
          if (endDate && entry.timestamp > endDate) continue;

          logs.push(entry);
        } catch {
          // Skip malformed lines
        }
      }
    }

    return logs;
  }

  getLogFiles(): { fileName: string; size: number; entries: number }[] {
    return fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName))
      .sort()
      .reverse()
      .map(fileName => {
        const filePath = path.join(this.config.logDir, fileName);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, "utf-8");
        const entries = content.trim().split("\n").filter(Boolean).length;
        return {
          fileName,
          size: stats.size,
          entries,
        };
      });
  }

  clearLogs(): void {
    const files = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName));
    for (const file of files) {
      fs.unlinkSync(path.join(this.config.logDir, file));
    }
  }
}

export const logger = new Logger();

export default logger;
