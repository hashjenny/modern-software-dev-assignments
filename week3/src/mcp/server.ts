/**
 * @file server.ts
 * @desc MCP 服务器核心模块：统一注册 tools/resources/prompts 与请求处理器
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  InitializeRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  clearLogsTool,
  getClothingAdviceTool,
  getLogsTool,
  getWeatherTool,
} from "./tools.js";
import { logger } from "../lib/logger.js";
import { getApiKeyStatus } from "../lib/auth.js";

export const MCP_SERVER_INFO = {
  name: "weather-mcp-server",
  version: "1.0.0",
} as const;

export const REGISTERED_TOOLS = [
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
] as const;

/**
 * 创建并注册完整 MCP 能力。
 * 所有传输层（STDIO/HTTP/Vercel）都应复用此工厂，避免行为漂移。
 */
export function createMcpServer(): Server {
  const server = new Server(MCP_SERVER_INFO, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  });

  server.setRequestHandler(InitializeRequestSchema, async (request) => {
    logger.info("MCP Client connecting", {
      clientName: request.params.clientInfo?.name,
      clientVersion: request.params.clientInfo?.version,
      protocolVersion: request.params.protocolVersion,
    });

    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      serverInfo: MCP_SERVER_INFO,
      auth: getApiKeyStatus(),
    };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info("Tools list requested");
    return {
      tools: REGISTERED_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = REGISTERED_TOOLS.find((item) => item.name === name);

    if (!tool) {
      logger.error(`Unknown tool requested: ${name}`);
      throw new Error(`Unknown tool: ${name}`);
    }

    return tool.handler(args || {});
  });

  return server;
}
