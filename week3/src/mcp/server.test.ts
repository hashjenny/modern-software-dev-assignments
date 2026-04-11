/**
 * @file server.test.ts
 * @desc MCP 核心注册测试：确保工具能力满足作业要求（至少2个工具）
 */

import { describe, expect, it } from "vitest";
import { createMcpServer, MCP_SERVER_INFO, REGISTERED_TOOLS } from "./server.js";

describe("MCP server registry", () => {
  it("应注册至少两个工具（当前为4个）", () => {
    expect(REGISTERED_TOOLS.length).toBeGreaterThanOrEqual(2);
    expect(REGISTERED_TOOLS.map((tool) => tool.name)).toEqual(
      expect.arrayContaining(["get_weather", "get_clothing_advice"]),
    );
  });

  it("应提供稳定的 server 元信息", () => {
    expect(MCP_SERVER_INFO.name).toBe("weather-mcp-server");
    expect(MCP_SERVER_INFO.version).toBeTruthy();
  });

  it("应能成功创建 MCP Server 实例", () => {
    const server = createMcpServer();
    expect(server).toBeTruthy();
  });
});

