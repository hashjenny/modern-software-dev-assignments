# Week 2 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## INSTRUCTIONS

Fill out all of the `TODO`s in this file.

## SUBMISSION DETAILS

Name: **hashjenny**   
SUNet ID: **TODO**   
Citations: **TODO**

This assignment took me about **4.5** hours to do.

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
week2/app/services/extract.py: L92-L184（新增 `extract_action_items_llm()` 及其 JSON 解析/后处理/回退逻辑，并补充 AI 生成代码注释）
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
week2/tests/test_extract.py: L23-L91（新增针对 `extract_action_items_llm()` 的单元测试：项目符号/关键字前缀/空输入/异常输出回退，并补充 AI 生成代码注释）
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
week2/app/main.py: L14-L23（使用 FastAPI lifespan 管理 `init_db()`，避免 import 时执行初始化，并补充 AI 生成代码注释）
week2/app/db.py: L16-L34（集中连接配置：row_factory、`PRAGMA foreign_keys=ON`、timeout、`check_same_thread=False`，并补充 AI 生成代码注释）
week2/app/routers/notes.py: L14-L62（引入 Pydantic 请求/响应模型，收紧 API 合约；补充数据库异常 -> 500 的一致错误处理，并补充 AI 生成代码注释）
week2/app/routers/action_items.py: L15-L103（引入 Pydantic 请求/响应模型，收紧 API 合约；补充数据库异常 -> 500 的一致错误处理，并补充 AI 生成代码注释）
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
week2/app/routers/action_items.py: L59-L74（新增 `POST /action-items/extract-llm`，调用 `extract_action_items_llm()` 并写入数据库，并补充 AI 生成代码注释）
week2/app/routers/notes.py: L26-L36（新增 `GET /notes`，列出所有笔记，并补充 AI 生成代码注释）
week2/frontend/index.html: L27-L110（新增 “Extract LLM”/“List Notes” 按钮与前端调用逻辑；新增 notes 展示区，并补充 AI 生成代码注释）
```

### Exercise 5: Generate a README from the Codebase

Prompt:

```
本项目是基于 LLM 的“行动项提取”功能的应用,使用 FastAPI + SQLite 的技术栈. 最近的5次git提交的代码都是cursor生成的, 你可以通过git提交记录,writeup.md, assignment.md查看前4次Exercise生成的改动,项目的原始代码可以参考https://github.com/mihail911/modern-software-dev-assignments 这个仓库的week2文件夹, 给这些ai生成的代码附上注释,并在相应代码中注释其功能与修改的内容
然后,分析 writeup.md 文件, 由于注释后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述, 并将这些生成的代码按md的规范填写到对应的Exercise 的 Generated Code Snippets
最后, 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 5: Generate a README from the Codebase 里相应TODO 内容
```

Generated Code Snippets:

```
week2/app/services/extract.py: L92-L184（为 Exercise 1 的 LLM 提取实现补充注释，标明功能与改动点）
week2/tests/test_extract.py: L23-L91（为 Exercise 2 的 LLM 单元测试补充注释，标明覆盖场景与目的）
week2/app/db.py: L16-L34（为 Exercise 3 的数据库连接重构补充注释，标明配置意图）
week2/app/main.py: L14-L23（为 Exercise 3 的 lifespan 初始化逻辑补充注释）
week2/app/routers/notes.py: L14-L62（为 Exercise 3/4 的 notes 合约与列表端点补充注释）
week2/app/routers/action_items.py: L15-L103（为 Exercise 3/4 的请求响应模型与 LLM 端点补充注释）
week2/frontend/index.html: L27-L110（为 Exercise 4 的按钮与前端交互逻辑补充注释）
week2/writeup.md: L46-L128（更新 Exercise 1-4 的代码行号，并完成 Exercise 5 的 Prompt 与 Generated Code Snippets）
```

Prompt（本次补充）:

```
请仔细分析这个项目, 生成一份结构良好的 README.md 文件。README 至少应包含：

1. 项目简介
2. 如何设置并运行项目
3. API 端点和功能说明
4. 运行测试套件的说明

然后, 分析 writeup.md 文件, 将本次提示词和你修改的代码文件及相关行号, 补充到Exercise 5: Generate a README from the Codebase 里对应的位置
```

Generated Code Snippets（本次补充）:

```
week2/README.md: L1-L99（新增 README：项目简介、环境与运行、API 说明、测试套件说明）
week2/writeup.md: L131-L149（在 Exercise 5 追加本次 Prompt 与 Generated Code Snippets 记录）
```

## SUBMISSION INSTRUCTIONS

1. Hit a `Command (⌘) + F` (or `Ctrl + F`) to find any remaining `TODO`s in this file. If no results are found, congratulations – you've completed all required fields.
2. Make sure you have all changes pushed to your remote repository for grading.
3. Submit via Gradescope.

