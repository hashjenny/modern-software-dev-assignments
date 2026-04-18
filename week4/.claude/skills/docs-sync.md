# 文档同步

- 名称：`docs-sync.md`
- 意图：读取 `/openapi.json`，更新 `docs/API.md`，并列出路由变更。
- 输出：类似 diff 的总结和待办事项。

## 执行步骤

1. 启动临时服务器或使用已有服务器获取 `/openapi.json`
2. 读取现有 `docs/API.md`（如果存在）
3. 从 openapi.json 提取路由信息：
   - 路径、HTTP 方法、摘要、请求体、响应
4. 对比新旧路由，分类为：新增（`+`）、移除（`-`）、变更（`~`）
5. 生成更新后的 `docs/API.md`
6. 输出 diff 总结和待办事项

## 安全工具列表

- Bash
- Grep
