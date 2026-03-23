# Weather MCP Server

基于 Model Context Protocol (MCP) 的天气查询和穿衣建议服务器。

## 功能

提供 4 个 MCP 工具：
- `get_weather`: 获取今日天气预报（最高温度、最低温度、日期）
- `get_clothing_advice`: 根据温度获取穿衣建议
- `get_logs`: 获取 MCP 服务器日志（支持过滤和分页）
- `clear_logs`: 清除所有日志文件

## 日志持久化

日志存储在 `.logs/` 目录下的 JSONL 文件中：
- 文件命名格式: `weather-mcp-YYYY-MM-DD.jsonl`
- 默认保留最近 7 天的日志
- 每条日志包含：时间戳、级别、消息、工具名称、执行时长等

## 使用的外部 API

**和风天气 API**
- 端点: `GET https://api.qweather.com/v7/weather/3d`
- 文档: https://dev.qweather.com/docs/api/weather/weather-now/

## 前提条件

- Node.js 18+
- pnpm 8+
- 和风天气 API 密钥（免费注册：https://dev.qweather.com）

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
```

## 运行

### MCP 服务器模式（与 Claude Desktop 集成）

```bash
pnpm run mcp
```

### CLI 模式（独立命令行工具）

```bash
pnpm run cli
```

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
|------|------|------|------|
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
|---------|-----------|------|
| 环境变量缺失 | -32602 | 需要配置 WEATHER_HOST, LOC, WEATHER_KEY |
| 参数无效 | -32602 | temperature 必须为数字 |
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
