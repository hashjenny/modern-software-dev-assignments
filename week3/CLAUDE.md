# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weather MCP Server - a Model Context Protocol server providing weather queries and clothing advice. Uses `@modelcontextprotocol/sdk` with STDIO transport for Claude Desktop integration.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run build       # TypeScript compilation
pnpm run test        # Run tests (watch mode)
pnpm run test:run    # Run tests once
pnpm run mcp         # Run MCP server (Claude Desktop integration)
pnpm run cli         # Run standalone CLI mode
```

## Project Structure

```
src/
  index.ts              # MCP server entry
  cli.ts                # CLI entry
  lib/
    auth.ts             # API key authentication
    logger.ts           # JSONL logging with 7-day retention
    weather-api.ts      # QWeather API client with retry logic
    clothing.ts         # Clothing advice based on temperature
    types.ts            # Shared interfaces
  mcp/
    tools.ts            # MCP tool definitions and handlers
```

## Architecture

### MCP Server (`src/index.ts`)

- STDIO transport for MCP protocol communication
- Request handlers: Initialize, ListTools, ListResources, ListPrompts, CallTool
- Optional API key auth via `MCP_API_KEY` env var
- 4 tools: `get_weather`, `get_clothing_advice`, `get_logs`, `clear_logs`

### Tools (`src/mcp/tools.ts`)

- Each tool exports: `name`, `description`, `inputSchema`, `handler`
- Error codes: `-32602` (invalid params), `-32603` (internal error), `-32000` (rate limited)

### Weather API (`src/lib/weather-api.ts`)

- QWeather API at `https://api.qweather.com/v7/weather/3d`
- `getWeather()`: Fetches today's forecast
- `WeatherAPIError`, `NetworkTimeoutError`: Custom error classes
- Retry: 10s timeout, max 3 retries with exponential backoff (1s → 2s → 4s)
- Handles 429 rate limit with Retry-After header support

### Clothing Advice (`src/lib/clothing.ts`)

- `getClothingAdvice(temperature)`: Returns clothing suggestion based on 26°C comfort baseline
- Rules: diff ≥5 (hot), ≥2 (warm), ≥-2 (comfortable), ≥-5 (cool), ≥-8 (chilly), <-8 (cold)

### Logging (`src/lib/logger.ts`)

- JSONL files in `.logs/weather-mcp-YYYY-MM-DD.jsonl`
- Retains 7 days of logs, auto-cleanup on date change
- Logs to stderr to avoid polluting stdout MCP traffic

## Environment Variables

```env
WEATHER_HOST=https://api.qweather.com
WEATHER_KEY=<qweather-api-key>
LOC=Beijing
MCP_API_KEY=<optional>
```

## Testing

```bash
pnpm run test:run    # Run all tests once
```

Test files follow `*.test.ts` pattern alongside their source modules.
