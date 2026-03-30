/**
 * @file index.ts
 * @desc MCP服务器主入口 - 基于Model Context Protocol的天气服务服务器
 *
 * 功能说明：
 * - 使用STDIO传输协议与MCP客户端通信
 * - 支持4个工具：get_weather, get_clothing_advice, get_logs, clear_logs
 * - 支持认证：可配置MCP_API_KEY进行API密钥验证
 * - 完整的请求生命周期日志记录
 *
 * MCP协议支持：
 * - Initialize: 客户端连接初始化
 * - ListTools: 列出可用工具
 * - ListResources: 列出可用资源
 * - ListPrompts: 列出可用提示模板
 * - CallTool: 调用工具
 *
 * 认证流程：
 * 1. 客户端连接时发送Initialize请求
 * 2. 服务器验证请求头中的x-api-key（若配置了MCP_API_KEY）
 * 3. 验证失败返回错误，客户端需重新连接
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  InitializeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
} from "./mcp/tools.js";
import { logger } from "./lib/logger.js";
import { getApiKeyStatus } from "./lib/auth.js";

// 注册所有工具
const TOOLS = [getWeatherTool, getClothingAdviceTool, getLogsTool, clearLogsTool];

// 从环境变量读取MCP API密钥
const MCP_API_KEY = process.env.MCP_API_KEY;

/**
 * 创建MCP服务器实例
 *
 * 服务器能力（capabilities）：
 * - tools: 支持工具调用
 * - resources: 支持资源访问
 * - prompts: 支持提示模板
 */
const server = new Server(
  {
    name: "weather-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

/**
 * 认证检查中间件
 *
 * @param headers - HTTP请求头
 * @throws 当认证失败时抛出错误
 *
 * 认证逻辑：
 * - 若未配置MCP_API_KEY，跳过检查
 * - 检查x-api-key头是否存在
 * - 验证密钥是否匹配
 */
function checkAuth(headers: Record<string, string | string[] | undefined>): void {
  // 未配置密钥时，跳过认证
  if (!MCP_API_KEY) {
    return;
  }

  const providedKey = headers["x-api-key"];
  if (!providedKey) {
    throw new Error("Authentication required. Provide 'x-api-key' header.");
  }

  // 处理数组格式的header值
  const key = Array.isArray(providedKey) ? providedKey[0] : providedKey;
  if (key !== MCP_API_KEY) {
    throw new Error("Invalid API key.");
  }
}

/**
 * Initialize请求处理器
 *
 * 功能：
 * 1. 验证客户端身份（若配置了认证）
 * 2. 记录客户端连接信息
 * 3. 返回服务器能力描述
 *
 * 这是MCP客户端连接后的第一个请求
 */
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  // 从请求中提取headers
  const { headers } = request.params as { headers?: Record<string, string | string[] | undefined> };

  logger.info("MCP Client connecting", {
    clientName: request.params.clientInfo?.name,
    clientVersion: request.params.clientInfo?.version,
    protocolVersion: request.params.protocolVersion,
  });

  // 执行认证检查
  if (headers) {
    try {
      checkAuth(headers);
      logger.info("MCP Client authenticated successfully");
    } catch (error) {
      logger.error("MCP Client authentication failed", error);
      throw error;
    }
  }

  // 返回服务器信息和支持的能力
  return {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    serverInfo: {
      name: "weather-mcp-server",
      version: "1.0.0",
    },
    auth: getApiKeyStatus(),
  };
});

/**
 * ListTools请求处理器
 *
 * 功能：返回所有可用工具的定义
 * MCP客户端连接后用于发现服务器能力
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info("Tools list requested");
  return {
    tools: TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

/**
 * ListResources请求处理器
 *
 * 功能：返回所有可用资源的定义
 * 当前暴露logs资源用于日志访问
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "weather://logs",
        name: "Server Logs",
        description: "Access to MCP server logs",
        mimeType: "application/json",
      },
    ],
  };
});

/**
 * ListPrompts请求处理器
 *
 * 功能：返回所有可用提示模板的定义
 * 当前暴露weather-check模板
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "weather-check",
        description: "Get weather and clothing advice for today",
        arguments: [],
      },
    ],
  };
});

/**
 * CallTool请求处理器
 *
 * 功能：路由工具调用请求到对应的处理函数
 *
 * 请求流程：
 * 1. 根据工具名称查找对应的处理函数
 * 2. 调用处理函数，传入参数
 * 3. 返回处理结果或错误
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 查找工具
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    logger.error(`Unknown tool requested: ${name}`);
    throw new Error(`Unknown tool: ${name}`);
  }

  // 调用工具处理函数
  return await tool.handler(args || {});
});

/**
 * 服务器主函数
 *
 * 功能：
 * 1. 输出启动日志（包含认证状态）
 * 2. 创建STDIO传输层
 * 3. 连接服务器到传输层
 * 4. 进入消息循环
 */
async function main() {
  const authStatus = getApiKeyStatus();

  logger.info("Weather MCP Server starting", {
    version: "1.0.0",
    tools: TOOLS.map((t) => t.name),
    authRequired: authStatus.required,
    authConfigured: authStatus.configured,
  });

  // 创建STDIO传输层
  const transport = new StdioServerTransport();

  // 连接服务器到传输层
  await server.connect(transport);

  logger.info("Weather MCP Server connected and ready");
}

// 启动服务器，捕获并记录启动错误
main().catch((error) => {
  logger.error("Failed to start MCP server", error);
  process.exit(1);
});
