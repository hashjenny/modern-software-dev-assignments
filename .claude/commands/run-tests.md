# Slash Command: /tests

运行 pytest 测试，如果全部通过则生成覆盖率报告。

## 名称

`tests.md`

## 意图

运行 `pytest -q` 如有失败则总结失败并建议后续步骤；如果全部通过则运行覆盖率报告。

## 输入

可选的 marker 或路径（例如 `unit`、`backend/tests/test_notes.py`）。

## 输出

- 失败时：总结失败信息、失败的测试文件和行号，并建议使用 `-x` 快速定位。
- 通过时：运行覆盖率并汇报覆盖率摘要。

## 执行步骤

1. 构建测试命令：
   - 如果 `$ARGUMENTS` 非空：`uv run pytest -q $ARGUMENTS`
   - 否则：`uv run pytest -q backend/tests`
2. 执行测试，解析输出。
3. 如有失败：
   - 列出失败的测试名称和文件位置
   - 建议使用 `uv run pytest -x --maxfail=1` 快速定位
4. 如全部通过：
   - 运行 `uv run pytest --cov=backend --cov-report=term-missing backend/tests`
   - 报告总体覆盖率摘要

## 安全工具列表

- Bash
- Grep
