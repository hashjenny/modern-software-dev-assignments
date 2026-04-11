/**
 * @file api/mcp.ts
 * @desc Vercel HTTP 入口：复用 src/transports/http-handler.ts
 *
 * 该文件保持“薄路由”设计：
 * - 只处理 CORS / OPTIONS / 错误映射
 * - 所有 MCP 协议细节与认证逻辑都在 src 层实现
 * 这样可保证本地 HTTP 与 Vercel HTTP 行为一致，降低维护成本。
 */

import { logger } from "../src/lib/logger.js";
import { AuthError, getApiKeyStatus } from "../src/lib/auth.js";
import { REGISTERED_TOOLS } from "../src/mcp/server.js";
import {
  applyCorsHeaders,
  handleMcpHttpRequest,
} from "../src/transports/http-handler.js";

async function handler(req: any, res: any) {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    await handleMcpHttpRequest(req, res, req.body);
  } catch (error) {
    logger.error("Vercel MCP request failed", error);
    const statusCode = error instanceof AuthError ? 401 : 500;
    res.status(statusCode).json({ error: (error as Error).message });
  }
}

const authStatus = getApiKeyStatus();
logger.info("Weather MCP HTTP Server starting", {
  version: "1.0.0",
  tools: REGISTERED_TOOLS.map((tool) => tool.name),
  authRequired: authStatus.required,
  authConfigured: authStatus.configured,
});

export default handler;
