# 第四周 — 自主编程 Agent 实战

> ***建议在开始之前完整阅读本文件。***

本周的任务是在本仓库的上下文中使用以下 **Claude Code** 功能的任意组合构建至少 **2 个自动化工具**：

- 自定义斜杠命令（提交到 `.claude/commands/*.md`）
- `CLAUDE.md` 文件（用于仓库或上下文指导）
- Claude SubAgents（角色专业化的代理协同工作）
- 集成到 Claude Code 的 MCP 服务器

你的自动化工具应该能够显著改善开发者工作流程——例如，通过简化测试、文档、重构或数据相关任务。然后你将使用你创建的自动化工具来扩展 `week4/` 中的示例应用。

## 了解 Claude Code

要更深入地了解 Claude Code 并探索你的自动化选项，请阅读以下两个资源：

1. **Claude Code 最佳实践：** [anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)
2. **SubAgents 概述：** [docs.anthropic.com/en/docs/claude-code/sub-agents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

## 探索示例应用

一个极简的全栈启动应用，设计为 **"开发者的命令中心"**。

- FastAPI 后端 + SQLite（SQLAlchemy）
- 静态前端（无需 Node 工具链）
- 极简测试（pytest）
- 预提交钩子（black + ruff）
- 练习 agent 驱动工作流程的任务

使用此应用作为你的试验场，尝试你构建的 Claude 自动化工具。

### 目录结构

```text
backend/                # FastAPI 应用
frontend/               # 静态 UI，由 FastAPI 提供服务
data/                   # SQLite 数据库 + 种子数据
docs/                   # Agent 驱动工作流程的 TASKS
```

### 快速开始

1.激活你的 conda 环境。

  ```bash
  conda activate cs146s
  ```

2.可选）安装预提交钩子

  ```bash
  pre-commit install
  ```

3.运行应用（从 `week4/` 目录）

  ```bash
  make run
  ```

4.打开 `http://localhost:8000` 访问前端，`http://localhost:8000/docs` 访问 API 文档。

5.玩转示例应用，感受其当前的功能和特性。

### 测试

运行测试（从 `week4/` 目录）

```bash
make test
```

### 格式化/检查

```bash
make format
make lint
```

## 第一部分：构建你的自动化工具（选择 2 个或更多）

现在你已经熟悉了示例应用，下一步是构建自动化工具来增强或扩展它。以下是多种自动化选项，你可以混合搭配使用。

在构建自动化工具时，请在 `writeup.md` 文件中记录你的更改——"如何使用自动化工具增强示例应用"部分暂时留空，你将在第二部分中填写的。

### A) Claude 自定义斜杠命令

斜杠命令是用于重复工作流程的功能，让你在 `.claude/commands/` 中的 Markdown 文件里创建可重用的工作流程。Claude 通过 `/` 来暴露这些命令。

- 示例 1：带覆盖率的测试运行器
  - 名称：`tests.md`
  - 意图：运行 `pytest -q backend/tests --maxfail=1 -x`，如果通过则运行覆盖率。
  - 输入：可选的 marker 或路径。
  - 输出：总结失败并建议后续步骤。
- 示例 2：文档同步
  - 名称：`docs-sync.md`
  - 意图：读取 `/openapi.json`，更新 `docs/API.md`，并列出路由变更。
  - 输出：类似 diff 的总结和待办事项。
- 示例 3：重构工具
  - 名称：`refactor-module.md`
  - 意图：重命名模块（例如 `services/extract.py` → `services/parser.py`），更新导入，运行 lint/测试。
  - 输出：修改文件的检查清单和验证步骤。

> *提示：保持命令专注，使用 `$ARGUMENTS`，并优先选择幂等步骤。考虑白名单允许安全工具和使用 headless 模式以提高可重复性。*

### B) `CLAUDE.md` 指导文件

`CLAUDE.md` 文件在开始对话时会自动读取，让你提供仓库特定的指令、上下文或指导来影响 Claude 的行为。在仓库根目录创建 `CLAUDE.md`（也可以选择在 `week4/` 子文件夹中），以指导 Claude 的行为。

- 示例 1：代码导航和入口点
  - 包含：如何运行应用、路由器在哪里（`backend/app/routers`）、测试在哪里、数据库如何填充种子数据。
- 示例 2：样式和安全防护栏
  - 包含：工具期望（black/ruff）、可安全运行的命令、需要避免的命令、lint/测试关卡。
- 示例 3：工作流程片段
  - 包含："当被要求添加端点时，先写一个失败的测试，然后实现，再运行 pre-commit。"

> *提示：像提示词一样迭代优化 `CLAUDE.md`，保持简洁和可操作，记录你期望 Claude 使用的自定义工具/脚本。*

### C) SubAgents（角色专业化）

SubAgents 是被配置为处理特定任务的专用 AI 助手，拥有自己的系统提示、工具和上下文。设计两个或更多协作代理，每个代理负责单个工作流程中的不同步骤。

- 示例 1：TestAgent + CodeAgent
  - 流程：TestAgent 编写/更新变更的测试 → CodeAgent 实现代码以通过测试 → TestAgent 验证。
- 示例 2：DocsAgent + CodeAgent
  - 流程：CodeAgent 添加新 API 路由 → DocsAgent 更新 `API.md` 和 `TASKS.md` 并检查与 `/openapi.json` 的偏差。
- 示例 3：DBAgent + RefactorAgent
  - 流程：DBAgent 提出 schema 变更（调整 `data/seed.sql`）→ RefactorAgent 更新 models/schemas/routers 并修复 lint 错误。

> *提示：使用检查清单/草稿本，在角色之间切换时重置上下文（`/clear`），对于独立任务并行运行代理。*

## 第二部分：将你的自动化工具投入使用

现在你已经构建了 2+ 个自动化工具，让我们把它们用起来！在 `writeup.md` 的 *"如何使用自动化工具增强示例应用"* 部分，描述你如何利用每个自动化工具来改进或扩展应用的功能。

例如：如果你实现了自定义斜杠命令 `/generate-test-cases`，解释你如何使用它来与示例应用交互和测试。

## 交付物

1) 两个或更多自动化工具，可包括：
   - `.claude/commands/*.md` 中的斜杠命令
   - `CLAUDE.md` 文件
   - SubAgent 提示/配置（清晰记录，如有则包括文件/脚本）

2) `week4/` 下的 write-up `writeup.md`，包括：
   - 设计灵感（例如引用最佳实践和/或 sub-agents 文档）
   - 每个自动化工具的设计，包括目标、输入/输出、步骤
   - 如何运行（精确命令）、预期输出和回滚/安全注意事项
   - 前后对比（即手动工作流程 vs 自动化工作流程）
   - 你如何使用自动化工具来增强示例应用

## 提交说明

1. 确保将所有更改推送到远程仓库以供评分。
2. **确保已将 brentju 和 febielin 添加为你仓库的协作者。**
3. 通过 Gradescope 提交。
