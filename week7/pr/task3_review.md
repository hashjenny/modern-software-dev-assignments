# Task 3 PR 审核

## Tools

- Github Copilot
- Semgrep

## PR Link

[week7/task3](https://github.com/hashjenny/modern-software-dev-assignments/pull/1)

## Github Copilot Review

我已审查本 PR，主要修改建议如下：

week7/backend/app/schemas.py 中 NoteRead.tags 使用了可变默认值 []，建议改为 Field(default_factory=list)，避免共享可变对象风险。
week7/backend/app/routers/tags.py 的 create_tag/patch_tag 对唯一约束冲突（同名 tag）未处理，当前会返回 500；建议捕获 IntegrityError 并返回 409/400。
当前标签关联接口是 PUT /tags/notes/{note_id}（全量替换），与 PR 描述中的 POST /notes/{note_id}/tags/、DELETE /notes/{note_id}/tags/{tag_id} 不一致，建议补齐或统一文档。
由于 SQLite 默认未开启 foreign_keys=ON，删除 Tag 时不应依赖数据库级级联；建议在删除前显式解除 note.tags 关联，保证行为稳定。

## Github Copilot Fixed

已按建议完善并提交：db72970（含前一提交 ef0a0ef）。本次已完成：排序字段白名单校验、Tag 重名冲突返回 409、删除 Tag 前清理关联、replace_note_tags 去重处理、NoteRead.tags 改为 default_factory、/notes/{note_id}/tags/ 与 /notes/{note_id}/tags/{tag_id} 端点补齐、notes 查询增加 selectinload 避免 N+1，并补充对应边界测试。week7/backend/tests 全量通过（13 passed）。

## Semgrep Result

- All checks have passed.
- No conflicts with base branch
