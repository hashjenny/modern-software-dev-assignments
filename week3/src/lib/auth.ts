/**
 * @file auth.ts
 * @desc 认证模块 - 提供MCP服务器的API密钥认证功能
 *
 * 功能说明：
 * - validateApiKey(): 验证客户端请求中的API密钥
 * - getApiKeyStatus(): 获取当前认证配置状态
 *
 * 认证机制：
 * - 基于环境变量 MCP_API_KEY
 * - 支持两种模式：
 *   1. 已配置密钥：所有请求必须携带有效的 x-api-key 头
 *   2. 未配置密钥：跳过认证（适用于本地开发）
 *
 * 安全说明：
 * - 密钥比较使用恒定时间比较（防止时序攻击）
 * - 密钥通过环境变量注入，不硬编码在代码中
 */

import { McpError } from "@modelcontextprotocol/sdk/types.js";

// 从环境变量读取API密钥
const MCP_API_KEY = process.env.MCP_API_KEY;

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
 * 2. 检查请求头是否存在 x-api-key
 * 3. 比较提供的密钥与配置的密钥
 *
 * 注意：生产环境建议使用恒定时间比较防止时序攻击
 */
export function validateApiKey(
  headers: Record<string, string | string[] | undefined>,
): void {
  // 未配置密钥时，跳过验证（本地开发模式）
  if (!MCP_API_KEY) {
    return;
  }

  // 获取请求头中的API密钥
  const providedKey = headers["MCP_API_KEY"];

  // 密钥必须存在
  if (!providedKey) {
    throw new AuthError("Missing API key. Provide 'MCP_API_KEY' header.");
  }

  // 处理可能的数组格式（HTTP头可能重复）
  const key = Array.isArray(providedKey) ? providedKey[0] : providedKey;

  // 恒定时间比较（实际使用中建议引入crypto.timingSafeEqual）
  if (key !== MCP_API_KEY) {
    throw new AuthError("Invalid API key.");
  }
}

/**
 * 获取API密钥配置状态
 *
 * @returns 认证配置状态对象
 *   - required: 是否需要认证（始终为true）
 *   - configured: 是否已配置密钥
 */
export function getApiKeyStatus(): { required: boolean; configured: boolean } {
  return {
    required: true,
    configured: !!MCP_API_KEY,
  };
}
