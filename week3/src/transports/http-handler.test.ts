/**
 * @file http-handler.test.ts
 * @desc HTTP 传输层单元测试：覆盖 CORS、鉴权、MCP 请求分发主链路
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  validateRequestAuthMock,
  connectMock,
  handleRequestMock,
} = vi.hoisted(() => ({
  validateRequestAuthMock: vi.fn(),
  connectMock: vi.fn(),
  handleRequestMock: vi.fn(),
}));

vi.mock("../lib/auth.js", () => ({
  validateRequestAuth: validateRequestAuthMock,
}));

vi.mock("../mcp/server.js", () => ({
  createMcpServer: vi.fn(() => ({
    connect: connectMock,
  })),
}));

vi.mock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
  StreamableHTTPServerTransport: class {
    handleRequest = handleRequestMock;
  },
}));

import { applyCorsHeaders, handleMcpHttpRequest } from "./http-handler.js";

describe("applyCorsHeaders", () => {
  it("应写入标准 CORS 响应头", () => {
    const setHeader = vi.fn();
    const res = { setHeader } as any;

    applyCorsHeaders(res);

    expect(setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    expect(setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS",
    );
    expect(setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type, x-api-key, Authorization",
    );
  });
});

describe("handleMcpHttpRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应执行鉴权、连接server并分发请求", async () => {
    const req = { headers: { "x-api-key": "abc" } } as any;
    const res = {} as any;

    await handleMcpHttpRequest(req, res);

    expect(validateRequestAuthMock).toHaveBeenCalledWith(req.headers);
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(handleRequestMock).toHaveBeenCalledWith(req, res, undefined);
  });

  it("应将 parsedBody 透传给 transport.handleRequest", async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const parsedBody = { jsonrpc: "2.0", method: "tools/list", id: 1 };

    await handleMcpHttpRequest(req, res, parsedBody);

    expect(handleRequestMock).toHaveBeenCalledWith(req, res, parsedBody);
  });
});
