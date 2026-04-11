# 第三周 — 构建自定义 MCP 服务器

设计并实现一个将真实外部 API 封装为模型上下文协议（MCP）服务器。你可以选择：

- 在本地运行（STDIO 传输），并与 MCP 客户端（例如 Claude Desktop）集成；
- 或在远程运行（HTTP 传输），由模型代理或客户端调用。远程方式更难，但可获得额外加分。

若按照 MCP 授权规范添加认证（API 密钥或 OAuth2），可获得加分。

## 学习目标

- 理解 MCP 的核心能力：tools、resources、prompts。
- 实现带类型化参数和健壮错误处理的工具定义。
- 遵循日志与传输的最佳实践（STDIO 服务器不要把日志写到 stdout）。
- 可选：为 HTTP 传输实现授权流程。

## 要求

1. 选择一个外部 API，并说明将使用的端点。示例：天气、GitHub issues、Notion 页面、影视数据库、日历、任务管理器、金融/加密、旅行、体育统计等。
2. 暴露至少两个 MCP 工具（tools）。
3. 实现基本的鲁棒性：
   - 对 HTTP 失败、超时和空结果进行优雅处理。
   - 尊重 API 的速率限制（例如简单的退避策略或向用户提示限速）。
4. 打包与文档：
   - 提供清晰的安装步骤、环境变量说明和运行命令。
   - 包含示例调用流程（在客户端需要输入/点击什么以触发工具）。
5. 选择一种部署模式：
   - 本地：STDIO 服务器，可在你的机器上运行并能被 Claude Desktop 或 AI IDE（如 Cursor）发现。
   - 远程：HTTP 服务器，可通过网络访问，被支持 MCP 的客户端或代理运行时调用。若部署并可访问可获额外加分。
6. （可选）加分项：认证
   - 通过环境变量和客户端配置支持 API key；
   - 对于 HTTP 传输，实现 OAuth2 风格的 bearer token，校验 token 的受众（audience），并且不要将接收到的 token 传递给上游 API。

## 交付物

- 源代码放在 `week3/` 下（建议放在 `week3/server/`，并提供清晰入口，如 `main.py` 或 `app.py`）。
- `week3/README.md`，内容至少包含：
  - 先决条件、环境配置和运行说明（本地和/或远程）。
  - 如何在 MCP 客户端（例如 Claude Desktop，本地情形）或代理运行时（远程情形）中配置并调用你的服务器。
  - 工具参考：名称、参数、示例输入/输出和预期行为。

## 评估标准（共 90 分）

- 功能性（35）：实现 2 个及以上工具，正确集成外部 API，输出有意义。
- 可靠性（20）：输入校验、错误处理、日志、速率限制意识。
- 开发者体验（20）：清晰的安装/文档、本地易于运行、合理的目录结构。
- 代码质量（15）：代码可读、命名描述性、复杂度低、适当使用类型注解。
- 额外加分（10）：
  - +5 远程 HTTP MCP 服务器，可被代理/客户端（如 OpenAI/Claude SDK）调用。
  - +5 正确实现认证（使用 API key 或带受众校验的 OAuth2）。

## 有用参考

- MCP Server 快速入门： [modelcontextprotocol.io/quickstart/server](https://modelcontextprotocol.io/quickstart/server)。
  _注意：你不得直接提交该示例的完整复制实现。_
- MCP 授权（HTTP）： [modelcontextprotocol.io/specification/2025-06-18/basic/authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- 远程 MCP（Cloudflare Agents）： [developers.cloudflare.com/agents/guides/remote-mcp-server/](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)。在部署前，可使用 modelcontextprotocol inspector 工具在本地调试你的服务器。
- 如果选择远程部署，Vercel 提供了友好的免费层，参考： [vercel doc](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
