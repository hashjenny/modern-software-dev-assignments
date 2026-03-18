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

---

针对无法使用poetry的问题，我使用了uv的环境，venv文件夹位于../.venv，你也可以用uv安装pytest

---

要求2:
结合上下文,现在为 extract_action_items_llm() 编写单元测试，覆盖多种输入（例如：项目符号列表、关键字前缀行、空输入）
并且分析 writeup.md 文件, 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 2: Add Unit Tests 里相应TODO 内容

---

我本地有ollama和大模型的。从单元测试的角度，应该直接调用ollama还是写mock，哪个比较好？如果是直接调用ollama，请重新生成代码，并填写writeup.md

---

要求3:
结合上下文,在不新增和删除文件的情况下,对后端代码进行重构，重点关注清晰明确的 API 合约/模式、数据库层清理、应用生命周期/配置和错误处理。
并且分析 writeup.md 文件, 由于重构后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述,并且将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 3: Refactor Existing Code for Clarity 里相应TODO 内容,给出详尽列表.

---

要求4:
结合上下文,在不新增和删除文件的情况下,使用 Agentic 模式自动化小任务

1. 将 LLM 提取功能集成为一个新端点。更新前端，添加一个 “Extract LLM” 按钮，点击时调用新端点进行提取。
2. 暴露一个用于列出所有笔记的最终端点。更新前端，添加一个 “List Notes” 按钮，点击时获取并显示笔记列表。
3. 分析 writeup.md 文件, 由于重构后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述,并且将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 4: Use Agentic Mode to Automate a Small Task 里相应TODO 内容

---

我不小心把更改撤回了，结合上下文，请把代码文件恢复到要求3执行完的状态

---

好的，现在请把代码文件恢复到要求4执行完的状态

---

本项目是基于 LLM 的“行动项提取”功能的应用,使用 FastAPI + SQLite 的技术栈. 最近的4次git提交的代码都是cursor生成的, 你可以通过git提交记录,writeup.md, assignment.md查看前4次Exercise生成的改动,项目的原始代码可以参考https://github.com/mihail911/modern-software-dev-assignments 这个仓库的week2文件夹, 给这些ai生成的代码附上注释,并在相应代码中注释其功能与修改的内容
然后,分析 writeup.md 文件, 由于注释后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述, 并将这些生成的代码按md的规范填写到对应的Exercise 的 Generated Code Snippets
最后, 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 5: Generate a README from the Codebase 里相应TODO 内容

并生成一份结构良好的 README.md 文件。README 至少应包含：
项目简介
如何设置并运行项目
API 端点和功能说明
运行测试套件的说明
然后, 分析 writeup.md 文件,

1. 由于重构后前面生成的代码所在行数会发生变化, 请更新该md文件关于前面生成的代码所在行数的描述.
2. 按照md文件的规范,将这几次修改生成的代码,插入对应的Exercise章节中.
3. 将本次提示词和你修改的代码文件及相关行号, 写入并替换Exercise 5: Generate a README from the Codebase 里相应TODO 内容
4. 最后, 我的名字是hashjenny, 请把writeup.md 文件里面相应的TODO替换为我的名字,并计算"现有一个基于 LLM 的“行动项提取”功能的应用,使用 FastAPI + SQLite 的技术栈..."这个prompt到当前的时间间隔,把This assignment took me about **TODO** hours to do. 文本里面的TODO替换
