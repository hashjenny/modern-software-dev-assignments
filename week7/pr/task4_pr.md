# Task 4 PR 描述：改进分页和排序测试

## 问题描述

Task 4 要求增强分页和排序功能的测试覆盖。当前的测试仅覆盖基本场景，缺乏对边界情况、排序逻辑和组合场景的验证。

## 实现方案

新增 `test_pagination.py`，包含 28 个测试用例：

### 分页测试

- 默认 limit 行为
- 显式 limit 参数
- skip 翻页功能
- 越界返回空列表
- 最大 limit 验证（200）
- 超限请求被拒绝（422）

### 排序测试

- `created_at` 升序/降序
- `title` 升序/降序
- `completed` 状态排序
- 无效字段回退到默认

### 组合场景

- 分页 + 排序组合
- 搜索 + 分页 + 排序
- 过滤completed + 分页

### 边界情况

- 负数 skip 处理
- 零 limit 处理

## 测试结果

```bash
$ python -m pytest backend/tests/test_pagination.py -v
==================== 28 passed ====================

$ python -m pytest backend/tests/ -v
==================== 59 passed ====================
```

所有测试通过，覆盖 notes 和 action_items 两个端点。

## 权衡与限制

- 测试依赖时间戳排序，数据库初始化顺序可能影响结果确定性
- 未测试超大数据量（>10000条）下的分页性能
- 可考虑后续添加缓存相关测试
