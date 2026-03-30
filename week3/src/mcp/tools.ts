/**
 * @file tools.ts
 * @desc MCP工具定义模块 - 定义所有可被MCP客户端调用的工具
 *
 * 提供4个MCP工具：
 * 1. get_weather      - 获取今日天气预报
 * 2. get_clothing_advice - 根据温度获取穿衣建议
 * 3. get_logs         - 查询MCP服务器日志
 * 4. clear_logs       - 清除所有日志文件
 *
 * 每个工具包含：
 * - name: 工具唯一标识
 * - description: 工具功能描述（供AI理解使用）
 * - inputSchema: 输入参数模式（JSON Schema格式）
 * - handler: 异步处理函数
 *
 * 错误处理策略：
 * - 参数验证错误 → McpError(-32602)
 * - 业务逻辑错误 → McpError(-32603)
 * - 速率限制 → McpError(-32000)
 */

import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { getWeather, WeatherAPIError, NetworkTimeoutError } from "../lib/weather-api.js";
import { getClothingAdvice } from "../lib/clothing.js";
import { logger, LogLevel } from "../lib/logger.js";
import { z } from "zod";

// 温度参数验证模式
const temperatureSchema = z.number();

/**
 * get_weather 工具
 *
 * 功能：获取今日天气预报
 * 参数：无
 * 返回：
 *   - tempMax: 最高温度（摄氏度）
 *   - tempMin: 最低温度（摄氏度）
 *   - date: 日期（YYYY-MM-DD格式）
 *
 * 错误处理：
 * - WeatherAPIError → 转换并重新抛出
 * - NetworkTimeoutError → 返回超时提示
 * - 其他错误 → 返回通用错误消息
 */
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

      // 调用天气API
      const weather = await getWeather();
      const duration = Date.now() - startTime;

      // 记录成功调用
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

      // 记录失败调用
      logger.logToolCall(
        "get_weather",
        duration,
        false,
        error instanceof Error ? error.message : String(error),
      );

      // 分类处理错误
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

/**
 * get_clothing_advice 工具
 *
 * 功能：根据给定温度返回穿衣建议
 * 参数：
 *   - temperature: 温度值（摄氏度），必填
 * 返回：
 *   - suggestion: 穿衣建议文本
 *   - diff: 与舒适温度(26度)的差值
 *
 * 参数验证：
 * - 温度必须存在
 * - 温度必须是有效数字
 */
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
      // 参数存在性检查
      if (args.temperature === undefined || args.temperature === null) {
        throw new McpError(-32602, "Missing required parameter: temperature");
      }

      // 参数类型验证
      const parsed = temperatureSchema.safeParse(args.temperature);
      if (!parsed.success) {
        throw new McpError(-32602, `Invalid temperature: ${args.temperature}`);
      }

      logger.info(
        `Starting get_clothing_advice tool call with temperature: ${parsed.data}`,
      );

      // 获取穿衣建议
      const advice = getClothingAdvice(parsed.data);
      const duration = Date.now() - startTime;

      // 记录成功调用
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

      // 区分McpError和其他错误
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

// 日志级别验证模式（预留，目前通过字符串传递）
const logLevelSchema = z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).optional();

/**
 * get_logs 工具
 *
 * 功能：查询MCP服务器的日志记录
 * 参数（全部可选）：
 *   - limit: 返回条数（默认100，最大1000）
 *   - level: 日志级别过滤（DEBUG/INFO/WARN/ERROR）
 *   - tool: 按工具名称过滤
 *   - start_date: 开始时间（ISO 8601格式）
 *   - end_date: 结束时间（ISO 8601格式）
 * 返回：
 *   - logs: 日志条目数组
 *   - total: 返回的日志条数
 *   - files: 日志文件列表及其统计
 */
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

      // 调用日志模块查询
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

/**
 * clear_logs 工具
 *
 * 功能：清除所有日志文件
 * 参数：无
 * 返回：
 *   - success: 是否成功
 *   - message: 操作结果消息
 */
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

/**
 * 导出所有工具定义
 * 供MCP服务器主模块注册使用
 */
export const tools = [
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
];
