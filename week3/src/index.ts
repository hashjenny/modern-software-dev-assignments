import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  getWeatherTool,
  getClothingAdviceTool,
  getLogsTool,
  clearLogsTool,
} from "./mcp/tools.js";
import { logger } from "./lib/logger.js";

const TOOLS = [getWeatherTool, getClothingAdviceTool, getLogsTool, clearLogsTool];

const server = new Server(
  {
    name: "weather-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    logger.error(`Unknown tool requested: ${name}`);
    throw new Error(`Unknown tool: ${name}`);
  }

  return await tool.handler(args || {});
});

async function main() {
  logger.info("Weather MCP Server starting", {
    version: "1.0.0",
    tools: TOOLS.map((t) => t.name),
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Weather MCP Server connected and ready");
}

main().catch((error) => {
  logger.error("Failed to start MCP server", error);
  process.exit(1);
});
