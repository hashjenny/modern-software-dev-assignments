# Week 4 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## INSTRUCTIONS

Fill out all of the `TODO`s in this file.

## SUBMISSION DETAILS

Name: hashjenny \
SUNet ID: **TODO** \
Citations: **TODO**

This assignment took me about 1.5 hours to do.

## YOUR RESPONSES

### Automation #1

a. Design inspiration (e.g. cite the best-practices and/or sub-agents docs)
   设计灵感（例如：引用最佳实践和/或 sub-agents 文档）
> 来自 GitHub pre-commit hooks 最佳实践；参考 CLAUDE.md 的"Style & Safety Gates"部分。

b. Design of each automation, including goals, inputs/outputs, steps
   每个自动化的设计，包括目标、输入/输出、步骤
> **目标**：在提交前自动格式化代码、修复 lint 问题、清理尾部空白。
> **输入**：所有代码文件。
> **输出**：自动修复格式/代码风格问题的提交。
> **步骤**：
>
> 1. 安装 hooks：`pre-commit install`
> 2. 每次 `git commit` 时自动运行 4 个 hook：
>    - `black` — Python 格式化（line-length 100）
>    - `ruff --fix` — Lint 修复（E,F,I,UP,B 规则）
>    - `end-of-file-fixer` — 确保文件末尾有换行符
>    - `trailing-whitespace` — 去除尾部空白

c. How to run it (exact commands), expected outputs, and rollback/safety notes
   如何运行（精确命令）、预期输出以及回滚/安全注意事项
> 运行命令：
>
> ```bash
> pre-commit install          # 一次性安装
> pre-commit run --all-files  # 在所有文件上运行
> ```
>
> 预期输出：hooks 自动修复格式问题并提交。
> 回滚：`make format` 可重新格式化；`git revert` 可撤销提交。

d. Before vs. after (i.e. manual workflow vs. automated workflow)
   前后对比（即手动工作流 vs 自动化工作流）
> 之前：每次手动运行 `black .` 和 `ruff check .`；团队成员格式不一致。
> 之后：hooks 在 commit 时自动修复；`make format` 作为安全网。

e. How you used the automation to enhance the starter application
   你如何使用该自动化来增强starter应用
> 用 `pre-commit install` 安装 hooks 后，所有提交都自动通过格式检查。在实现 PUT/DELETE 端点时，hooks 确保代码格式一致，无需手动格式化。

### Automation #2

a. Design inspiration (e.g. cite the best-practices and/or sub-agents docs)
   设计灵感（例如：引用最佳实践和/或 sub-agents 文档）
> 来自测试驱动开发（TDD）工作流；参考 Claude Code CLI 文档中关于 SubAgents 的说明。

b. Design of each automation, including goals, inputs/outputs, steps
   每个自动化的设计，包括目标、输入/输出、步骤
> **目标**：将测试失败转换为通过的代码实现。
> **输入**：失败的测试名称、错误信息。
> **输出**：通过测试的实现代码。
> **步骤**：
>
> 1. **CodeAgent**（`.claude/agents/code-agent.md`）：分析失败测试 → 规划实现 → 编写代码 → 验证
> 2. **TestAutomationAgent**（`.claude/agents/test-automation-agent.md`）：代码变更后更新/验证测试

c. How to run it (exact commands), expected outputs, and rollback/safety notes
   如何运行（精确命令）、预期输出以及回滚/安全注意事项
> 在 Claude Code 中调用 agent：
>
> /code-agent "实现 PUT /notes/{id} 端点以通过 test_update_note"
>
> /test-automation-agent "为新的 priority 字段更新测试"
>
> 回滚：`git revert` 可撤销代码更改。

d. Before vs. after (i.e. manual workflow vs. automated workflow)
   前后对比（即手动工作流 vs 自动化工作流）
> 之前：手动编写测试 → 实现 → 运行 pytest → 调试循环，效率低且易出错。
> 之后：CodeAgent 从测试失败直接实现代码，TestAutomationAgent 验证；TDD 循环自动化。

e. How you used the automation to enhance the starter application
   你如何使用该自动化来增强starter应用
> 实现 PUT/DELETE 端点时，先写测试 `test_update_note`、`test_delete_note`。CodeAgent 读取失败测试，实现对应端点，测试自动通过。TestAutomationAgent 为新端点补充验证测试。

### *(Optional) Automation #3*

*If you choose to build additional automations, feel free to detail them here！*

*如果你选择构建额外的自动化，可以在这里详细说明！*

a. Design inspiration (e.g. cite the best-practices and/or sub-agents docs)
   设计灵感（例如：引用最佳实践和/或 sub-agents 文档）
> api-docs-sync 来自 Swagger/OpenAPI 文档同步最佳实践；schema agents 来自数据库迁移工作流。

b. Design of each automation, including goals, inputs/outputs, steps
   每个自动化的设计，包括目标、输入/输出、步骤
> 包括 3 个 agents 和 3 个 skills：
>
> - **api-docs-sync**（`.claude/agents/api-docs-sync.md`）：将 API.md 与 `/openapi.json` 同步
> - **步骤**：获取 OpenAPI → 解析路由 → 对比 API.md → 生成更新 → 报告偏差
> - **schema-proposer**（`.claude/agents/schema-proposer.md`）：提出 seed.sql 修改
> - **schema-refactor-agent**（`.claude/agents/schema-refactor-agent.md`）：将 seed.sql 变更传播到 models/schemas
> - **tests skill**（`.claude/skills/tests.md`）：运行 pytest，失败时显示测试名/位置，成功时显示覆盖率
> - **docs-sync skill**（`.claude/skills/docs-sync.md`）：轻量级 API.md 同步
> - **refactor-module skill**（`.claude/skills/refactor-module.md`）：安全重命名模块（git mv + 更新导入）

c. How to run it (exact commands), expected outputs, and rollback/safety notes
   如何运行（精确命令）、预期输出以及回滚/安全注意事项
> 运行方式：
>
> /docs-sync          # 同步 API 文档
> /tests              # 运行测试
>
> 回滚：`git revert` 可撤销更改。

d. Before vs. after (i.e. manual workflow vs. automated workflow)
   前后对比（即手动工作流 vs 自动化工作流）
> 之前：手动对比 OpenAPI 与 API.md 容易遗漏；seed.sql 变更后手动更新 models.py；重命名时手动 find+replace 导入。
> 之后：api-docs-sync 自动报告偏差并更新文档；schema-refactor-agent 自动传播变更；refactor-module 自动处理重命名。

e. How you used the automation to enhance the starter application
   你如何使用该自动化来增强starter应用
> 添加 PUT/DELETE 端点后，用 `/docs-sync` 自动更新 API.md。用 `/tests` 验证所有 14 个测试通过。用 `pre-commit run --all-files` 确保所有 hooks 通过。
