/**
 * @file logger.ts
 * @desc 日志模块 - 提供本地持久化的JSONL格式日志记录
 *
 * 功能说明：
 * - 支持 DEBUG/INFO/WARN/ERROR 四种日志级别
 * - 日志持久化到 .logs/ 目录下的 JSONL 文件
 * - 自动按日期分割日志文件
 * - 自动清理超过7天的旧日志
 * - 支持按级别、工具名、时间范围过滤查询
 *
 * 文件格式：
 * - 命名规则：weather-mcp-YYYY-MM-DD.jsonl
 * - 每行一条JSON格式的日志记录
 *
 * 使用注意：
 * - STDIO传输模式下，日志输出到stderr，避免干扰MCP协议通信
 */

import fs from "fs";
import path from "path";

/**
 * 日志级别枚举
 * 按严重程度从低到高排列
 */
export enum LogLevel {
  DEBUG = "DEBUG",  // 调试信息
  INFO = "INFO",    // 一般信息
  WARN = "WARN",    // 警告信息
  ERROR = "ERROR",  // 错误信息
}

/**
 * 日志条目结构
 */
export interface LogEntry {
  timestamp: string;   // ISO 8601格式时间戳
  level: LogLevel;      // 日志级别
  message: string;      // 日志消息
  tool?: string;        // 关联的工具名称（可选）
  duration?: number;     // 执行时长（毫秒，可选）
  error?: string;       // 错误信息（可选）
}

/**
 * 日志配置接口
 */
interface LogConfig {
  logDir: string;           // 日志目录路径
  logFileName: string;       // 日志文件名前缀
  maxLogFiles: number;       // 最多保留的日志文件数
  maxEntriesPerFile: number; // 每个文件最大条目数（预留）
}

/**
 * 默认日志配置
 */
const DEFAULT_CONFIG: LogConfig = {
  logDir: ".logs",              // .logs目录
  logFileName: "weather-mcp",   // weather-mcp-YYYY-MM-DD.jsonl
  maxLogFiles: 7,               // 保留7天日志
  maxEntriesPerFile: 1000,      // 每文件最多1000条（预留）
};

/**
 * 日志记录器类
 *
 * 功能：
 * - 线程安全的文件写入
 * - 自动日志轮转（新日期创建新文件）
 * - 自动清理过期日志
 * - 支持多维度过滤查询
 *
 * 使用方式：
 * ```typescript
 * const logger = new Logger();
 * logger.info("消息内容");
 * logger.error("错误描述", errorObj);
 * logger.logToolCall("get_weather", 1234, true);
 * ```
 */
class Logger {
  private config: LogConfig;
  private currentLogFile: string;
  private entryCount: number = 0;

  constructor(config: Partial<LogConfig> = {}) {
    // 合并默认配置与自定义配置
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureLogDir();
    this.currentLogFile = this.getLogFilePath();
  }

  /**
   * 确保日志目录存在
   * 若目录不存在则递归创建
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  /**
   * 获取当日日志文件路径
   * 格式：{logDir}/{logFileName}-{YYYY-MM-DD}.jsonl
   */
  private getLogFilePath(): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.config.logDir, `${this.config.logFileName}-${date}.jsonl`);
  }

  /**
   * 检查是否需要切换日志文件
   * 当日期变化时（跨天）触发：
   * 1. 切换到新文件
   * 2. 重置条目计数
   * 3. 清理过期日志
   */
  private rotateLogsIfNeeded(): void {
    const newLogFile = this.getLogFilePath();
    if (newLogFile !== this.currentLogFile) {
      this.currentLogFile = newLogFile;
      this.entryCount = 0;
      this.cleanOldLogs();
    }
  }

  /**
   * 清理超过保留期限的旧日志文件
   * 按文件名排序后删除超出maxLogFiles数量的旧文件
   */
  private cleanOldLogs(): void {
    const files = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName))
      .sort()  // 按名称排序（日期升序）
      .reverse(); // 最新在前

    // 删除超出保留数量的旧文件
    if (files.length > this.config.maxLogFiles) {
      const toDelete = files.slice(this.config.maxLogFiles);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(this.config.logDir, file));
      }
    }
  }

  /**
   * 写入单条日志条目
   *
   * @param entry - 日志条目对象
   *
   * 写入流程：
   * 1. 检查是否需要切换日志文件
   * 2. 将条目序列化为JSON行
   * 3. 追加写入文件
   * 4. 输出到stderr（STDIO服务器要求）
   */
  private writeEntry(entry: LogEntry): void {
    this.rotateLogsIfNeeded();
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(this.currentLogFile, line, "utf-8");
    this.entryCount++;

    // STDIO服务器：日志输出到stderr，避免干扰stdout的协议通信
    console.error(`[${entry.level}] ${entry.timestamp}: ${entry.message}`);
  }

  /**
   * 格式化日志消息
   * 若有额外元数据，附加在消息后
   */
  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    if (meta) {
      return `${message} ${JSON.stringify(meta)}`;
    }
    return message;
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message: this.formatMessage(LogLevel.DEBUG, message, meta),
    });
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: this.formatMessage(LogLevel.INFO, message, meta),
    });
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message: this.formatMessage(LogLevel.WARN, message, meta),
    });
  }

  /**
   * 记录错误级别日志
   *
   * @param message - 错误描述
   * @param error - 错误对象（Error或unknown类型）
   * @param meta - 额外元数据
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    // 提取错误消息字符串
    const errorMsg = error instanceof Error ? error.message : error ? String(error) : undefined;
    this.writeEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message: this.formatMessage(LogLevel.ERROR, message, meta),
      error: errorMsg,
    });
  }

  /**
   * 记录工具调用日志
   * 专门用于记录MCP工具的调用信息
   *
   * @param toolName - 工具名称
   * @param durationMs - 执行时长（毫秒）
   * @param success - 是否成功
   * @param error - 错误信息（失败时）
   */
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

  /**
   * 查询日志
   *
   * @param options - 查询选项
   * @returns 匹配的日志条目数组
   *
   * 查询选项：
   * - limit: 返回条数上限（默认100）
   * - level: 按日志级别过滤
   * - tool: 按工具名称过滤
   * - startDate: 过滤开始时间（ISO 8601）
   * - endDate: 过滤结束时间（ISO 8601）
   *
   * 查询流程：
   * 1. 获取所有日志文件（按日期倒序）
   * 2. 逐文件逐行解析
   * 3. 应用所有过滤条件
   * 4. 达到limit后停止
   */
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

    // 获取所有日志文件（最新在前）
    const logFiles = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName))
      .sort()
      .reverse();

    // 遍历文件
    for (const file of logFiles) {
      if (logs.length >= limit) break;

      const filePath = path.join(this.config.logDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      // 逆序遍历（最新条目在前）
      for (const line of lines.reverse()) {
        if (logs.length >= limit) break;

        try {
          const entry = JSON.parse(line) as LogEntry;

          // 应用过滤条件
          if (level && entry.level !== level) continue;
          if (tool && entry.tool !== tool) continue;
          if (startDate && entry.timestamp < startDate) continue;
          if (endDate && entry.timestamp > endDate) continue;

          logs.push(entry);
        } catch {
          // 跳过格式错误的行
        }
      }
    }

    return logs;
  }

  /**
   * 获取日志文件列表及其统计信息
   *
   * @returns 文件信息数组（文件名、大小、条目数）
   */
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

  /**
   * 清除所有日志文件
   * 用于用户主动清理或测试场景
   */
  clearLogs(): void {
    const files = fs.readdirSync(this.config.logDir)
      .filter(f => f.startsWith(this.config.logFileName));
    for (const file of files) {
      fs.unlinkSync(path.join(this.config.logDir, file));
    }
  }
}

// 导出单例日志记录器
export const logger = new Logger();

export default logger;
