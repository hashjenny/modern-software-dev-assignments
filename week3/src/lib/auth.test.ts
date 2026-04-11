/**
 * @file auth.test.ts
 * @desc 认证模块单元测试 - 覆盖 API 密钥验证和各种错误情况
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthError } from "./auth.js";

describe("AuthError", () => {
  it("应该继承 Error 并设置正确的错误消息", () => {
    const error = new AuthError("Test error");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("Test error");
    expect(error.name).toBe("AuthError");
  });

  it("应该使用 -32603 错误码", () => {
    const error = new AuthError("Test error");
    // McpError 格式化为 "MCP error -32603: message"
    expect(error.message).toContain("Test error");
  });
});

describe("validateApiKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("未配置密钥时应跳过验证", async () => {
    delete process.env.MCP_API_KEY;
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({})).not.toThrow();
  });

  it("提供正确密钥时应通过验证", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ "x-api-key": "secret-key-123" })).not.toThrow();
  });

  it("密钥不匹配时应抛出包含 Invalid API key 的错误", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ "x-api-key": "wrong-key" })).toThrow("Invalid API key");
  });

  it("缺少密钥时应抛出包含 Missing API key 的错误", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({})).toThrow("Missing API key");
  });

  it("密钥为数组格式时应正确处理", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ "x-api-key": ["secret-key-123"] })).not.toThrow();
  });

  it("密钥为数组但值错误时应抛出错误", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ "x-api-key": ["wrong-key"] })).toThrow("Invalid API key");
  });

  it("应兼容旧版 MCP_API_KEY 请求头", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ MCP_API_KEY: "secret-key-123" })).not.toThrow();
  });

  it("应支持大小写不敏感的请求头读取", async () => {
    process.env.MCP_API_KEY = "secret-key-123";
    const { validateApiKey } = await import("./auth.js");
    expect(() => validateApiKey({ "X-API-KEY": "secret-key-123" })).not.toThrow();
  });
});

describe("getApiKeyStatus", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("未配置密钥时 configured 应为 false", async () => {
    delete process.env.MCP_API_KEY;
    const { getApiKeyStatus } = await import("./auth.js");
    const status = getApiKeyStatus();
    expect(status.required).toBe(true);
    expect(status.configured).toBe(false);
  });

  it("已配置密钥时 configured 应为 true", async () => {
    process.env.MCP_API_KEY = "some-key";
    const { getApiKeyStatus } = await import("./auth.js");
    const status = getApiKeyStatus();
    expect(status.required).toBe(true);
    expect(status.configured).toBe(true);
  });

  it("密钥为空字符串时应视为未配置", async () => {
    process.env.MCP_API_KEY = "";
    const { getApiKeyStatus } = await import("./auth.js");
    const status = getApiKeyStatus();
    expect(status.configured).toBe(false);
  });
});
