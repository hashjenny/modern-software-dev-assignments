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
TODO
```

Generated/Modified Code Snippets:

```
TODO: List all modified code files with the relevant line numbers. (We anticipate there may be multiple scattered changes here – just produce as comprehensive of a list as you can.)
```

### Exercise 4: Use Agentic Mode to Automate a Small Task

Prompt:

```
TODO
```

Generated Code Snippets:

```
TODO: List all modified code files with the relevant line numbers.
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
