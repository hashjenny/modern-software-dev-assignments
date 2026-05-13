# Task 2 PR 描述：扩展提取逻辑

## 问题描述

Task 2 要求增强 Action Item 提取功能，实现更复杂的模式识别和分析。当前的提取逻辑较为简单，仅能识别基础的 action item 模式。

## 实现方案

1. **结构化元数据提取**
   - 从文本中提取 action item 时返回包含优先级、截止日期等元数据的结构化对象
   - `ActionItem` 模型现在包含 `priority`、`due_date`、`assignee` 等字段

2. **增强模式识别**
   - 支持识别多种 action item 格式（如 "TODO:", "Action:", "[ ]" 等）
   - 识别 assignee（@mention）和 due date 模式

3. **模型更新**
   - 更新 `ActionItem` 模型以支持新字段
   - 更新相关 schema 以支持序列化和验证

## 测试结果

```bash
$ python -m pytest backend/tests/test_extract.py -v
==================== 28 passed ====================
```

新增测试覆盖：
- 优先级提取测试
- 截止日期提取测试
- assignee 提取测试
- 多格式识别测试

## 权衡与限制

- 优先级和截止日期为可选字段，旧数据兼容
- 正则模式可能需要根据实际文本格式调整
- 后续可添加 AI 驱动的智能提取功能
