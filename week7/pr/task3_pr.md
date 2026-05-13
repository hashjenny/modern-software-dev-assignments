# Task 3 PR 描述：添加新模型和关系

## 问题描述

Task 3 要求创建新的数据库模型及关系，并更新应用以支持它们。需要实现笔记和标签的多对多关联。

## 实现方案

1. **新增 Tag 模型**
   - `id`, `name` (unique), `created_at`, `updated_at` 字段
   - 与 Note 的多对多关系通过 `note_tags` 关联表实现

2. **更新 Note 模型**
   - 添加 `tags` 关系属性
   - 支持标签的添加和移除

3. **新增标签相关端点**
   - `POST /tags/` — 创建标签
   - `GET /tags/` — 列出所有标签
   - `DELETE /tags/{tag_id}` — 删除标签
   - `POST /notes/{note_id}/tags/` — 为笔记添加标签
   - `DELETE /notes/{note_id}/tags/{tag_id}` — 移除笔记的标签

4. **更新 Schema**
   - `TagCreate`, `TagRead` 用于标签创建和读取
   - `NoteRead` 包含 tags 列表

## 测试结果

```bash
$ python -m pytest backend/tests/ -v
==================== 41 passed ====================
```

新增 `test_tags.py` 覆盖：

- 标签创建和列表
- 标签与笔记关联
- 标签删除
- 关联完整性验证

## 权衡与限制

- 标签删除时未实现级联清理关联表，需先移除关联
- 未实现标签重命名功能
- 可考虑后续添加标签合并功能
