/**
 * @file http-handler.ts
 * @desc HTTP 传输公共处理：认证、CORS、MCP 请求分发
 */

import { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { validateRequestAuth } from "../lib/auth.js";
import { createMcpServer } from "../mcp/server.js";

type HeaderMap = Record<string, string | string[] | undefined>;

/**
 * 写入 CORS 头，兼容浏览器与 inspector 调试场景。
 */
export function applyCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
}

/**
 * 处理 MCP HTTP 请求：
 * 1. 按配置执行认证（API Key 或 OAuth2 Bearer）
 * 2. 复用统一 MCP server 注册逻辑
 * 3. 将请求交给 Streamable HTTP transport
 *
 * 说明：
 * - 这里不解析业务 token，也不把认证信息透传给上游天气 API。
 * - 上游 API 调用仅发生在 weather-api 模块，且只使用 WEATHER_KEY。
 */
export async function handleMcpHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  parsedBody?: unknown,
): Promise<void> {
  await validateRequestAuth(req.headers as HeaderMap);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createMcpServer();
  await server.connect(transport);

  await transport.handleRequest(req, res, parsedBody);
}
