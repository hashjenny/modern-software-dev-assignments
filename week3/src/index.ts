/**
 * @file index.ts
 * @desc MCP STDIO 启动入口
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger } from "./lib/logger.js";
import { getApiKeyStatus } from "./lib/auth.js";
import { createMcpServer, REGISTERED_TOOLS } from "./mcp/server.js";

/**
 * 启动 STDIO MCP 服务。
 * 注意：STDIO 场景下无法通过 HTTP 头做认证，因此仅暴露认证配置状态。
 */
async function main() {
  const authStatus = getApiKeyStatus();
  const server = createMcpServer();

  logger.info("Weather MCP Server starting", {
    version: "1.0.0",
    tools: REGISTERED_TOOLS.map((tool) => tool.name),
    authRequired: authStatus.required,
    authConfigured: authStatus.configured,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Weather MCP Server connected and ready");
}

main().catch((error) => {
  logger.error("Failed to start MCP server", error);
  process.exit(1);
});
