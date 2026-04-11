/**
 * @file verify-client.ts
 * @desc MCP 验证客户端：支持 stdio/http 两种连接方式，并使用 Ollama(qwen3:4b)生成结果说明
 */

import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

dotenv.config({ path: ".env", quiet: true, debug: false });

type TransportMode = "stdio" | "http";
type ToolArgs = Record<string, unknown>;

interface VerifyClientOptions {
  transport: TransportMode;
  httpUrl: string;
  stdioCommand: string;
  stdioArgs: string[];
  ollamaModel: string;
  ollamaUrl: string;
}

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 解析命令行参数，支持快速切换 transport 与模型配置。
 */
function parseArgs(argv: string[]): VerifyClientOptions {
  const options: VerifyClientOptions = {
    transport: "stdio",
    httpUrl: "http://127.0.0.1:3000",
    stdioCommand: "node",
    stdioArgs: ["build/index.js"],
    ollamaModel: "qwen3:4b",
    ollamaUrl: "http://127.0.0.1:11434/api/chat",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--transport" && (next === "stdio" || next === "http")) {
      options.transport = next;
      i++;
    } else if (arg === "--http-url" && next) {
      options.httpUrl = next;
      i++;
    } else if (arg === "--stdio-command" && next) {
      options.stdioCommand = next;
      i++;
    } else if (arg === "--stdio-args" && next) {
      options.stdioArgs = next.split(" ").filter(Boolean);
      i++;
    } else if (arg === "--ollama-model" && next) {
      options.ollamaModel = next;
      i++;
    } else if (arg === "--ollama-url" && next) {
      options.ollamaUrl = next;
      i++;
    }
  }

  return options;
}

/**
 * 调用 Ollama chat API，生成一次“验证结论”文本。
 */
async function callOllama(
  url: string,
  model: string,
  messages: OllamaMessage[],
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };
  return data.message?.content?.trim() || "";
}

function extractToolText(result: unknown): string {
  const payload = result as { content?: Array<{ type?: string; text?: string }> };
  const first = payload.content?.find((item) => item.type === "text");
  return first?.text || "";
}

/**
 * 根据 transport 创建 MCP 客户端连接。
 * - stdio: 启动本地 MCP 进程
 * - http: 连接远程/本地 HTTP MCP
 */
async function connectClient(options: VerifyClientOptions) {
  const client = new Client({
    name: "week3-verify-client",
    version: "1.0.0",
  });

  if (options.transport === "stdio") {
    const transport = new StdioClientTransport({
      command: options.stdioCommand,
      args: options.stdioArgs,
      env: process.env as Record<string, string>,
      cwd: process.cwd(),
      stderr: "inherit",
    });
    await client.connect(transport);
    return client;
  }

  const headers: Record<string, string> = {};
  if (process.env.MCP_API_KEY) {
    headers["x-api-key"] = process.env.MCP_API_KEY;
  }
  if (process.env.OAUTH_BEARER_TOKEN) {
    // Bearer token 仅发往 MCP 服务端用于认证，不会发送给天气上游 API。
    headers.Authorization = `Bearer ${process.env.OAUTH_BEARER_TOKEN}`;
  }
  const transport = new StreamableHTTPClientTransport(new URL(options.httpUrl), {
    requestInit: {
      headers,
    },
  });
  await client.connect(transport);
  return client;
}

/**
 * 执行完整验证流程：
 * 1) listTools 检查能力发现
 * 2) callTool 调用 weather + advice
 * 3) 交给 Ollama 生成可读结论
 */
async function verifyMcpWithOllama(options: VerifyClientOptions): Promise<void> {
  const client = await connectClient(options);

  try {
    const listedTools = await client.listTools();
    const toolNames = listedTools.tools.map((tool) => tool.name);
    console.log(`[MCP] transport=${options.transport} tools=${toolNames.join(", ")}`);

    const weatherResult = await client.callTool({
      name: "get_weather",
      arguments: {} as ToolArgs,
    });
    const weatherText = extractToolText(weatherResult);
    console.log(`[MCP] get_weather => ${weatherText}`);

    const weatherData = JSON.parse(weatherText) as { tempMax: number; tempMin: number; date: string };
    const adviceResult = await client.callTool({
      name: "get_clothing_advice",
      arguments: { temperature: weatherData.tempMax } as ToolArgs,
    });
    const adviceText = extractToolText(adviceResult);
    console.log(`[MCP] get_clothing_advice => ${adviceText}`);

    const finalAnswer = await callOllama(options.ollamaUrl, options.ollamaModel, [
      {
        role: "system",
        content:
          "你是测试助手。请根据MCP工具返回结果写一段简洁中文结论，包含天气、穿衣建议、以及本次验证是否成功。",
      },
      {
        role: "user",
        content: `weather=${weatherText}\nadvice=${adviceText}\ntransport=${options.transport}`,
      },
    ]);

    console.log(`[OLLAMA:${options.ollamaModel}] ${finalAnswer}`);
    console.log("[VERIFY] 成功：已通过 MCP 调用 get_weather + get_clothing_advice。");
  } finally {
    await client.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await verifyMcpWithOllama(options);
}

main().catch((error) => {
  console.error("[VERIFY] 失败:", error);
  process.exit(1);
});
