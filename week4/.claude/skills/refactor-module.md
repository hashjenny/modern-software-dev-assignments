# 重构工具

- 名称：`refactor-module.md`
- 意图：重命名模块（例如 `services/extract.py` → `services/parser.py`），更新导入，运行 lint/测试。
- 输出：修改文件的检查清单和验证步骤。

## 使用方式

```markdown
重构工具
- 源模块：backend/app/services/extract.py
- 目标模块：backend/app/services/parser.py
```

## 执行步骤

1. 解析参数，提取源模块路径和目标模块路径
2. 在工作区中查找所有引用源模块的导入语句
3. 列出所有待修改文件
4. 执行重命名（git mv）
5. 更新所有导入语句
6. 运行 lint 检查
7. 运行测试
8. 输出总结

## 安全工具列表

- Bash
- Grep
- Git
