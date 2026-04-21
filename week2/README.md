# 基于 LLM 的行动项提取器（Week 2）

## 1. 项目简介

这是一个基于 **FastAPI + SQLite** 的行动项提取应用。用户输入会议记录或自由文本后，系统可提取待办事项，并支持勾选完成状态。

项目提供两种提取方式：

- 规则提取：使用启发式规则（项目符号、关键字前缀、复选框等）。
- LLM 提取：通过 Ollama 本地模型进行结构化提取；当模型输出异常时自动回退到规则提取。

## 2. 如何设置并运行项目

### 环境准备

- 本项目使用 `uv` 环境，虚拟环境位于：`../.venv`
- `pytest` 已安装在该环境中
- 若使用 LLM 端点，请确保 Ollama 已安装并可用

### 启动 Ollama（仅 LLM 提取需要）

```bash
ollama serve
ollama pull llama3.2
```

可选环境变量：

- `OLLAMA_MODEL`（默认：`llama3.2`）
- `OLLAMA_TEMPERATURE`（默认：`0`）

### 启动后端服务

在 `week2/` 目录执行：

```bash
../.venv/bin/python -m uvicorn app.main:app --reload
```

启动后访问：

- 前端页面：<http://127.0.0.1:8000/>
- OpenAPI 文档：<http://127.0.0.1:8000/docs>

## 3. API 端点和功能说明

### Notes

- `POST /notes`
  - 功能：创建笔记
  - 请求体：
    ```json
    { "content": "Discuss roadmap and write tests" }
    ```

- `GET /notes`
  - 功能：获取全部笔记（按 ID 倒序）

- `GET /notes/{note_id}`
  - 功能：按 ID 获取单条笔记，不存在返回 `404`

### Action Items

- `POST /action-items/extract`
  - 功能：使用规则提取行动项
  - 请求体：
    ```json
    { "text": "- [ ] Set up database\n- Write tests", "save_note": true }
    ```
  - 说明：`save_note=true` 时会先保存笔记，再保存提取到的行动项

- `POST /action-items/extract-llm`
  - 功能：使用 Ollama LLM 提取行动项
  - 说明：请求结构与 `/action-items/extract` 一致，若模型输出不合法会回退到规则提取

- `GET /action-items`
  - 功能：查询行动项列表
  - 可选参数：`note_id`（按笔记过滤）

- `POST /action-items/{action_item_id}/done`
  - 功能：更新某条行动项的完成状态
  - 请求体：
    ```json
    { "done": true }
    ```

## 4. 运行测试套件的说明

在 `week2/` 目录执行：

```bash
../.venv/bin/python -m pytest -q tests/test_extract.py
```

说明：

- 该测试文件覆盖了 LLM 提取的关键场景（正常 JSON、关键字前缀、空输入、坏 JSON 回退）。
- 在当前环境中可通过（`5 passed`）。
