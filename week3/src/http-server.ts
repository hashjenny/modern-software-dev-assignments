/**
 * @file http-server.ts
 * @desc 本地 HTTP MCP 启动入口
 */

import http from "node:http";
import { logger } from "./lib/logger.js";
import { AuthError, getApiKeyStatus } from "./lib/auth.js";
import { REGISTERED_TOOLS } from "./mcp/server.js";
import { applyCorsHeaders, handleMcpHttpRequest } from "./transports/http-handler.js";

const PORT = process.env.PORT || 3000;

async function main() {
  const authStatus = getApiKeyStatus();

  logger.info("Weather MCP HTTP Server starting", {
    version: "1.0.0",
    tools: REGISTERED_TOOLS.map((tool) => tool.name),
    authRequired: authStatus.required,
    authConfigured: authStatus.configured,
  });

  const server = http.createServer(async (req, res) => {
    applyCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      await handleMcpHttpRequest(req, res);
    } catch (error) {
      logger.error("HTTP MCP request failed", error);
      const statusCode = error instanceof AuthError ? 401 : 500;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  });

  server.listen(PORT, () => {
    logger.info(`Weather MCP HTTP Server running on port ${PORT}`);
  });
}

main().catch((error) => {
  logger.error("Failed to start HTTP server", error);
  process.exit(1);
});
