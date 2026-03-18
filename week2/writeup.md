# Week 2 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## INSTRUCTIONS

Fill out all of the `TODO`s in this file.

## SUBMISSION DETAILS

Name: **TODO** \
SUNet ID: **TODO** \
Citations: **TODO**

This assignment took me about **TODO** hours to do.

## YOUR RESPONSES

For each exercise, please include what prompts you used to generate the answer, in addition to the location of the generated response. Make sure to clearly add comments in your code documenting which parts are generated.

### Exercise 1: Scaffold a New Feature

Prompt:

```
现有一个基于 LLM 的“行动项提取”功能的应用,使用 FastAPI + SQLite 的技术栈

文件结构如下:

- app 文件夹是项目的FastAPI后端实现
- data 文件夹存储项目的sqlite数据库
- frontend 文件夹是项目的前端页面
- tests 文件夹是项目的单元测试文件夹
- mcp_scratch 文件夹与本项目无关请忽略
- coding_agent_from_scratch_lecture.py 文件与本项目无关请忽略

要求:

1. 分析 extract.py 中现有的 extract_action_items() 函数（当前使用预定义启发式规则）, 实现一个基于 LLM 的替代函数 extract_action_items_llm()，使用 Ollama 和大模型来执行行动项提取。
2. 分析 writeup.md 文件, 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 1: Scaffold a New Feature 里相应TODO 内容
```

Generated Code Snippets:

```
week2/app/services/extract.py: L92-L176（新增 `extract_action_items_llm()` 及其 JSON 解析/后处理/回退逻辑）
```

### Exercise 2: Add Unit Tests

Prompt:

```
要求2:
结合上下文,现在为 extract_action_items_llm() 编写单元测试，覆盖多种输入（例如：项目符号列表、关键字前缀行、空输入）
并且分析 writeup.md 文件, 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 2: Add Unit Tests 里相应TODO 内容
```

Generated Code Snippets:

```
week2/tests/test_extract.py: L1-L87（新增针对 `extract_action_items_llm()` 的单元测试：项目符号/关键字前缀/空输入/异常输出回退）
week2/writeup.md: L52-L67（更新 Exercise 2 的 Prompt 与代码行号列表）
```

### Exercise 3: Refactor Existing Code for Clarity

Prompt:

```
要求3:
结合上下文,在不新增和删除文件的情况下,对后端代码进行重构，重点关注清晰明确的 API 合约/模式、数据库层清理、应用生命周期/配置和错误处理。
并且分析 writeup.md 文件, 由于重构后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述,并且将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 3: Refactor Existing Code for Clarity 里相应TODO 内容,给出详尽列表.
```

Generated/Modified Code Snippets:

```
week2/app/main.py: L3-L20（使用 FastAPI lifespan 管理 `init_db()`，避免 import 时执行初始化）
week2/app/db.py: L16-L30（集中连接配置：row_factory、`PRAGMA foreign_keys=ON`、timeout、`check_same_thread=False`）
week2/app/routers/notes.py: L3-L57（引入 Pydantic 请求/响应模型，收紧 API 合约；补充数据库异常 -> 500 的一致错误处理）
week2/app/routers/action_items.py: L3-L97（引入 Pydantic 请求/响应模型，收紧 API 合约；补充数据库异常 -> 500 的一致错误处理）
week2/writeup.md: L69-L87（填写 Exercise 3；并核对 Exercise 1/2 引用行号：`extract.py` 仍为 L92-L176，`test_extract.py` 仍为 L1-L87）
```

### Exercise 4: Use Agentic Mode to Automate a Small Task

Prompt:

```
要求4:
结合上下文,在不新增和删除文件的情况下,使用 Agentic 模式自动化小任务

1. 将 LLM 提取功能集成为一个新端点。更新前端，添加一个 “Extract LLM” 按钮，点击时调用新端点进行提取。
2. 暴露一个用于列出所有笔记的最终端点。更新前端，添加一个 “List Notes” 按钮，点击时获取并显示笔记列表。
3. 分析 writeup.md 文件, 由于重构后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述,并且将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 4: Use Agentic Mode to Automate a Small Task 里相应TODO 内容
```

Generated Code Snippets:

```
week2/app/routers/action_items.py: L56-L70（新增 `POST /action-items/extract-llm`，调用 `extract_action_items_llm()` 并写入数据库）
week2/app/routers/notes.py: L24-L33（新增 `GET /notes`，列出所有笔记）
week2/frontend/index.html: L24-L105（新增 “Extract LLM”/“List Notes” 按钮与前端调用逻辑；新增 notes 展示区）
week2/writeup.md: L89-L109（填写 Exercise 4；并在最终版本中修正 writeup 内部行号引用）
```

### Exercise 5: Generate a README from the Codebase

Prompt:

```
TODO
```

Generated Code Snippets:

```
TODO: List all modified code files with the relevant line numbers.
```

## SUBMISSION INSTRUCTIONS

1. Hit a `Command (⌘) + F` (or `Ctrl + F`) to find any remaining `TODO`s in this file. If no results are found, congratulations – you've completed all required fields.
2. Make sure you have all changes pushed to your remote repository for grading.
3. Submit via Gradescope.
