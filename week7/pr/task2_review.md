# Task 2 PR 审核

## Tools

- Github Copilot
- Semgrep

## PR Link

[week7/task2](https://github.com/hashjenny/modern-software-dev-assignments/pull/3)

## Github Copilot Review

我已审查这次 PR，建议优先修改这 3 点：

范围问题：本次是 week7/task2，但最近提交里还改了 week5/backend/app/services/extract.py 和 week5/backend/app/models.py，建议回退这些与任务无关的改动，避免影响 week5。
解析冲突：week7/backend/app/services/extract.py 中 assignee 模式 @\w+ 会与截止日期 @YYYY-MM-DD 冲突，例如会把 @2026-06-30 误识别为 assignee=2026，建议限制 assignee 为用户名格式（如 @[A-Za-z][A-Za-z0-9_]*）或先排除日期模式。
需求一致性：PR 描述提到支持 [ ] 格式，但当前代码只识别 TODO:/ACTION:/!，建议补充 [ ] 提取或更新 PR 描述与实现保持一致。
我本地复测了 week7/backend/tests/test_extract.py，当前测试可通过，但上述边界场景还未覆盖，建议补充相应测试用例。

## Github Copilot Fixed

已按建议完善并提交，commit: 3632f87。
已完成：

回退本 PR 中不相关的 week5 改动（week5/backend/app/models.py、week5/backend/app/services/extract.py）
修复 @YYYY-MM-DD 被误判为 assignee 的冲突（assignee 改为用户名模式）
在 week7 提取逻辑中补充 [ ] action item 格式支持
新增测试覆盖 [ ] 格式与 @日期 非 assignee 边界场景
本地已通过相关 lint 与测试。

## Semgrep Result

- All checks have passed.
- No conflicts with base branch
