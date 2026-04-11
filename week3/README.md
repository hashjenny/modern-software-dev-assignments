# Weather MCP Server

基于 Model Context Protocol (MCP) 的天气查询和穿衣建议服务器。

## 功能

提供 4 个 MCP 工具：

- `get_weather`: 获取今日天气预报（最高温度、最低温度、日期）
- `get_clothing_advice`: 根据温度获取穿衣建议
- `get_logs`: 获取 MCP 服务器日志（支持过滤和分页）
- `clear_logs`: 清除所有日志文件

## 架构概览

- `src/mcp/server.ts`：统一 MCP server 工厂（tools/resources/prompts 注册）
- `src/index.ts`：STDIO 启动入口
- `src/http-server.ts`：本地 HTTP 启动入口
- `api/mcp.ts`：Vercel Serverless 入口（复用同一核心逻辑）
- `src/lib/auth.ts`：API Key + OAuth2 Bearer 认证
- `src/lib/weather-api.ts`：和风天气 API 访问（重试、超时、限流处理）
- `src/verify-client.ts`：MCP 端到端验证客户端（stdio/http + Ollama）

## 日志持久化

日志存储在 `.logs/` 目录下的 JSONL 文件中：

- 文件命名格式: `weather-mcp-YYYY-MM-DD.jsonl`
- 默认保留最近 7 天的日志
- 每条日志包含：时间戳、级别、消息、工具名称、执行时长等

## 使用的外部 API

**和风天气 API**

- 端点: `GET https://api.qweather.com/v7/weather/3d`
- 文档: <https://dev.qweather.com/docs/api/weather/weather-now/>
- 请求头: `X-QW-Api-Key: <WEATHER_KEY>`

> 说明：`X-QW-Api-Key` 是和风天气上游接口专用密钥，不用于 MCP 客户端鉴权。

## 前提条件

- Node.js 18+
- pnpm 8+
- 和风天气 API 密钥（免费注册：<https://dev.qweather.com）>
- （验证客户端可选）本地 Ollama + `qwen3:4b`

## 安装

```bash
# 安装依赖
pnpm install

# 编译 TypeScript
pnpm run build
```

## 配置

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env`：

```
WEATHER_HOST=https://api.qweather.com
WEATHER_KEY=你的API密钥
LOC=Beijing  # 可替换为其他城市（如 Shanghai, Chengdu）

# MCP 服务器认证（可选，不配置则跳过认证）
MCP_API_KEY=your_mcp_api_key

# OAuth2 Bearer（可选，启用后 HTTP 请求需携带 Bearer JWT）
OAUTH_JWT_SECRET=your_hs256_secret
OAUTH_AUDIENCE=weather-mcp
# OAUTH_ISSUER=https://your-auth-server.example.com
```

## 认证

MCP 服务器支持 API 密钥认证：

- **启用认证**：在 `.env` 中设置 `MCP_API_KEY`
- **跳过认证**：不设置 `MCP_API_KEY`（适用于本地开发）
- **客户端传递方式**：
  - STDIO（Claude Desktop）场景：通过进程环境变量注入 `MCP_API_KEY`
  - HTTP 场景：在请求头中传递 `x-api-key: <MCP_API_KEY>`

### OAuth2 Bearer 认证（HTTP）

若配置了 `OAUTH_JWT_SECRET` 和 `OAUTH_AUDIENCE`，HTTP 接口会要求：

- 请求头：`Authorization: Bearer <JWT>`
- JWT 必须：
  - 使用 `HS256` 且由 `OAUTH_JWT_SECRET` 签名
  - `aud` 与 `OAUTH_AUDIENCE` 一致
  - 若配置了 `OAUTH_ISSUER`，`iss` 也必须匹配

> 安全要求：服务端只做 token 校验，不会将 Bearer token 透传给上游天气 API。

### Claude Desktop 配置（含认证）

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/完整路径/week3/build/index.js"],
      "env": {
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 运行

### MCP 服务器模式（与 Claude Desktop 集成）

```bash
pnpm run mcp
```

### HTTP MCP 模式（本地调试）

```bash
pnpm run start:http
```

默认监听 `http://127.0.0.1:3000`，若配置了 `MCP_API_KEY`，需在请求头带上 `x-api-key`。
若启用 OAuth2，还需附带 `Authorization: Bearer <JWT>`。

### CLI 模式（独立命令行工具）

```bash
pnpm run cli
```

## 验证客户端（Ollama + MCP）

项目提供了 `verify-client`，用于自动验证 MCP 调用链路（`get_weather` + `get_clothing_advice`），并使用 Ollama `qwen3:4b` 生成总结。

### 1) 验证 STDIO 模式

```bash
pnpm run build
pnpm run verify:stdio
```

### 2) 验证 HTTP 模式

先开一个终端启动 HTTP MCP 服务：

```bash
pnpm run build
pnpm run start:http
```

再开另一个终端执行验证：

```bash
pnpm run verify:http
```

可选参数示例：

```bash
node build/verify-client.js --transport http --http-url http://127.0.0.1:3000 --ollama-model qwen3:4b
```

若你启用了 OAuth2，可额外设置：

```bash
export OAUTH_BEARER_TOKEN="<你的JWT>"
pnpm run verify:http
```

## 远程 HTTP MCP（Vercel 部署）

本项目已内置 `api/mcp.ts` 作为 Vercel Serverless 路由。部署后 MCP 地址为：

`https://<your-project>.vercel.app/api/mcp`

### 需要部署的内容

- `api/mcp.ts`（Vercel 入口）
- `src/**`（MCP 核心实现）
- `package.json` / `pnpm-lock.yaml` / `tsconfig.json` / `vercel.json`

不要部署 `build/` 目录，Vercel 会在云端安装依赖并构建。

### 部署步骤

1. 推送 `week3` 代码到 GitHub 仓库。
2. 在 Vercel `New Project` 导入该仓库。
3. **Root Directory** 选择 `week3`。
4. 构建设置：
   - Install Command: `pnpm install`
   - Build Command: `pnpm run build`
   - Output Directory: 留空（Node Serverless）
5. 在 Vercel 环境变量配置：
   - `WEATHER_HOST`
   - `WEATHER_KEY`
   - `LOC`
   - 认证二选一或同时配置：
     - API Key: `MCP_API_KEY`
     - OAuth2: `OAUTH_JWT_SECRET`, `OAUTH_AUDIENCE`（可选 `OAUTH_ISSUER`）
6. 部署完成后用 MCP inspector 或客户端访问 `https://<your-project>.vercel.app/api/mcp` 验证。

## 常见问题（FAQ）

1. `pnpm run start:http` 启动后无法调用？

- 先确认 `.env` 中 `WEATHER_HOST/WEATHER_KEY/LOC` 已配置。
- 若配了 `MCP_API_KEY`，HTTP 请求必须带 `x-api-key`。
- 若配了 `OAUTH_JWT_SECRET + OAUTH_AUDIENCE`，必须带 `Authorization: Bearer <JWT>`。

1. OAuth2 模式下 `x-api-key` 为什么不生效？

- 当前设计是 OAuth2 优先。只要配置了 OAuth 环境变量，就会强制校验 Bearer token。

1. 如何确认 token 没有被传给天气 API？

- 查看 `src/lib/weather-api.ts` 与对应测试 `src/lib/weather-api.test.ts`：上游请求头仅包含 `X-QW-Api-Key`。

## Claude Desktop 配置

在 Claude Desktop 的 MCP 服务器配置中添加：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/完整路径/week3/build/index.js"]
    }
  }
}
```

配置文件位置：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

添加配置后需重启 Claude Desktop。

## 示例调用流程

在 Claude Desktop 中与 AI 对话：

**1. 查询天气：**

```
今天的天气怎么样？
```

或直接要求：

```
调用 get_weather 工具查询今天的天气
```

**2. 获取穿衣建议：**

```
今天25度怎么穿衣？
```

AI 会调用 `get_clothing_advice` 工具，传入 `temperature: 25`。

**3. 组合使用：**

```
查询天气并给出穿衣建议
```

AI 会先调用 `get_weather` 获取温度，再调用 `get_clothing_advice` 获取建议。

**4. 查看日志：**

```
查看最近的工具调用日志
```

或

```
查看 get_weather 的错误日志
```

**5. 清除日志：**

```
清除所有日志
```

## 工具参考

### get_weather

获取今日天气预报。

**参数**: 无

**返回**:

```json
{
  "tempMax": 28,
  "tempMin": 18,
  "date": "2026-03-24"
}
```

### get_clothing_advice

根据温度获取穿衣建议。

**参数**:

| 名称 | 类型 | 必填 | 描述 |
|------|------|------|------|
| temperature | number | 是 | 温度（摄氏度） |

**返回**:

```json
{
  "suggestion": "天气较热：建议短袖 + 短裤，注意防晒。",
  "diff": 2
}
```

`diff` 表示与体感舒适温度（26度）的差值。

### get_logs

获取 MCP 服务器日志记录。

**参数**:

| 名称 | 类型 | 必填 | 描述 |
| ------ | ------ | ------ | ------ |
| limit | number | 否 | 返回条数（默认100，最大1000） |
| level | string | 否 | 日志级别过滤（DEBUG/INFO/WARN/ERROR） |
| tool | string | 否 | 按工具名称过滤 |
| start_date | string | 否 | 开始时间（ISO 8601，如 2026-03-01） |
| end_date | string | 否 | 结束时间（ISO 8601） |

**返回**:

```json
{
  "logs": [
    {
      "timestamp": "2026-03-24T10:30:00.000Z",
      "level": "INFO",
      "message": "Starting get_weather tool call",
      "tool": "get_weather",
      "duration": 1234
    }
  ],
  "total": 1,
  "files": [
    { "fileName": "weather-mcp-2026-03-24.jsonl", "size": 1024, "entries": 15 }
  ]
}
```

### clear_logs

清除所有日志文件。

**参数**: 无

**返回**:

```json
{
  "success": true,
  "message": "All logs cleared"
}
```

## 错误处理

| 错误类型 | MCP 错误码 | 说明 |
| --------- | ----------- | ------ |
| 环境变量缺失 | -32602 | 需要配置 WEATHER_HOST, LOC, WEATHER_KEY |
| 参数无效 | -32602 | temperature 必须为数字 |
| API 密钥缺失 | -32603 | 需要设置 MCP_API_KEY，并在 HTTP 请求头传递 x-api-key |
| API 密钥无效 | -32603 | 提供的 x-api-key 不正确 |
| API 请求超时 | -32603 | 10秒超时，自动重试3次 |
| API 速率限制 | -32000 | 429 状态码，等待后自动重试 |
| API 请求失败 | -32603 | HTTP 错误或其他网络问题 |
| 空数据响应 | -32603 | API 返回空数据 |

## 速率限制

- 请求超时: 10 秒
- 最大重试次数: 3 次
- 指数退避: 1s → 2s → 4s
- 遇到 429 状态码会根据 Retry-After 头等待

## 开发

```bash
# 类型检查 + 编译
pnpm run build

# 直接运行 MCP 服务器
pnpm run mcp

# 运行 CLI 模式
pnpm run cli
```
