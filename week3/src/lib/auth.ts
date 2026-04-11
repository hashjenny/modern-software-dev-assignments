/**
 * @file auth.ts
 * @desc 认证模块 - 提供 MCP API Key 与 OAuth2 Bearer 两种认证能力
 *
 * 功能说明：
 * - validateApiKey(): 验证客户端请求中的API密钥
 * - validateOAuthBearer(): 验证客户端 Bearer Token（JWT + audience）
 * - validateRequestAuth(): 按配置选择认证方式
 * - getApiKeyStatus(): 获取当前认证配置状态
 *
 * 认证机制（HTTP）：
 * - API Key 模式：环境变量 MCP_API_KEY + 请求头 x-api-key
 * - OAuth2 模式：环境变量 OAUTH_JWT_SECRET / OAUTH_AUDIENCE + Authorization: Bearer <JWT>
 * - 若启用 OAuth2 模式，将优先要求 Bearer Token
 *
 * 安全说明：
 * - 密钥比较使用 timingSafeEqual（防止时序攻击）
 * - 密钥通过环境变量注入，不硬编码在代码中
 */

import { timingSafeEqual } from "node:crypto";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { jwtVerify } from "jose";

type HeaderMap = Record<string, string | string[] | undefined>;

function getConfiguredApiKey(): string | undefined {
  const key = process.env.MCP_API_KEY;
  if (!key || key.trim() === "") {
    return undefined;
  }
  return key;
}

function getConfiguredOAuth() {
  const jwtSecret = process.env.OAUTH_JWT_SECRET?.trim();
  const audience = process.env.OAUTH_AUDIENCE?.trim();
  const issuer = process.env.OAUTH_ISSUER?.trim();

  if (!jwtSecret || !audience) {
    return undefined;
  }

  return {
    jwtSecret,
    audience,
    issuer,
  };
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

/**
 * 兼容读取多个头名称：
 * - x-api-key（推荐）
 * - MCP_API_KEY（兼容旧实现）
 */
function getProvidedApiKey(headers: HeaderMap): string | undefined {
  for (const [rawKey, rawValue] of Object.entries(headers)) {
    const key = rawKey.toLowerCase();
    if (key === "x-api-key" || key === "mcp_api_key") {
      return firstHeaderValue(rawValue);
    }
  }
  return undefined;
}

function isEqualApiKey(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function getAuthorizationHeader(headers: HeaderMap): string | undefined {
  for (const [rawKey, rawValue] of Object.entries(headers)) {
    if (rawKey.toLowerCase() === "authorization") {
      return firstHeaderValue(rawValue);
    }
  }
  return undefined;
}

function getBearerToken(headers: HeaderMap): string | undefined {
  const authorization = getAuthorizationHeader(headers);
  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return undefined;
  }
  return token.trim();
}

/**
 * 认证错误类
 * 继承自McpError，用于标识认证相关的错误
 */
export class AuthError extends McpError {
  constructor(message: string) {
    super(-32603, message);
    this.name = "AuthError";
  }
}

/**
 * 验证API密钥
 *
 * @param headers - HTTP请求头对象
 * @throws AuthError 当密钥缺失或无效时
 *
 * 验证逻辑：
 * 1. 若未配置MCP_API_KEY，跳过验证（开发模式）
 * 2. 检查请求头是否存在 x-api-key（兼容旧版 MCP_API_KEY）
 * 3. 比较提供的密钥与配置的密钥
 *
 * 注意：生产环境建议使用恒定时间比较防止时序攻击
 */
export function validateApiKey(
  headers: HeaderMap,
): void {
  const configuredApiKey = getConfiguredApiKey();
  if (!configuredApiKey) {
    return;
  }

  const providedKey = getProvidedApiKey(headers);
  if (!providedKey) {
    throw new AuthError("Missing API key. Provide 'x-api-key' header.");
  }

  if (!isEqualApiKey(configuredApiKey, providedKey)) {
    throw new AuthError("Invalid API key.");
  }
}

/**
 * 验证 OAuth2 Bearer Token（JWT）。
 * 说明：仅校验签名和 audience/issuer，不会把 Bearer token 传给上游天气 API。
 */
export async function validateOAuthBearer(headers: HeaderMap): Promise<void> {
  const oauthConfig = getConfiguredOAuth();
  if (!oauthConfig) {
    return;
  }

  const bearerToken = getBearerToken(headers);
  if (!bearerToken) {
    throw new AuthError("Missing bearer token. Provide 'Authorization: Bearer <token>' header.");
  }

  try {
    const secret = new TextEncoder().encode(oauthConfig.jwtSecret);
    await jwtVerify(bearerToken, secret, {
      audience: oauthConfig.audience,
      issuer: oauthConfig.issuer,
    });
  } catch (error) {
    throw new AuthError(
      `Invalid bearer token: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 统一 HTTP 认证入口：
 * - 配置 OAuth2 时：强制 Bearer + audience 校验
 * - 否则：走 API Key 校验
 */
export async function validateRequestAuth(headers: HeaderMap): Promise<void> {
  if (getConfiguredOAuth()) {
    await validateOAuthBearer(headers);
    return;
  }

  validateApiKey(headers);
}

/**
 * 获取API密钥配置状态
 *
 * @returns 认证配置状态对象
 *   - required: 是否需要认证（始终为true）
 *   - configured: 是否已配置密钥
 */
export function getApiKeyStatus(): { required: boolean; configured: boolean } {
  const configuredApiKey = getConfiguredApiKey();
  const oauthConfig = getConfiguredOAuth();
  return {
    required: true,
    configured: !!configuredApiKey || !!oauthConfig,
  };
}
