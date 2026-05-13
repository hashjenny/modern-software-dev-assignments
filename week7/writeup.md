# Week 7 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## Instructions

Fill out all of the `TODO`s in this file.

## Submission Details

Name: **hashjenny**
SUNet ID: **hashjenny**
Citations: None

This assignment took me about **6** hours to do.

## Task 1: Add more endpoints and validations

a. Links to relevant commits/issues

> PR: <https://github.com/hashjenny/modern-software-dev-assignments/pull/2>
> Commits: 353b5d4, 18db20d, c70a17e

b. PR Description

> 添加删除端点（DELETE /notes/{id}, DELETE /action-items/{id}）、输入验证（Pydantic schema 长度限制）、错误处理完善。sort 参数改为白名单字段，对非法字段回退默认排序。

c. GitHub Copilot generated code review

> **审查意见：**
>
> 1. 长度校验应从 router 移到 Pydantic schema（Field(max_length=...)），PATCH 端点也需覆盖
> 2. sort 参数使用 hasattr/getattr 直接放行有风险，建议改为白名单字段，避免非法字段导致 SQLAlchemy ArgumentError 返回 500
> 3. 缺少对应测试：PATCH 超长输入应返回 422，非法 sort 应回退或返回 422
>
> **修复情况：** 已全部采纳并提交（commit 353b5d4）。将长度校验迁移到 schema，sort 改为白名单，补充了相关测试。
>
> **Semgrep 结果：** All checks passed，无安全问题。

## Task 2: Extend extraction logic

a. Links to relevant commits/issues

> PR: <https://github.com/hashjenny/modern-software-dev-assignments/pull/3>
> Commits: 3632f87, 04ac488, 7a5e30f

b. PR Description

> 扩展 ActionItem 提取逻辑，支持优先级（priority）、截止日期（due_date）、负责人（assignee）等元数据提取。修复 @YYYY-MM-DD 被误识别为 assignee 的问题，补充 [ ] checkbox 格式支持。

c. GitHub Copilot generated code review

> **审查意见：**
>
> 1. 范围问题：本次 PR 包含了 week5 目录下与任务无关的改动，应回退
> 2. 解析冲突：assignee 模式 `@[A-Za-z][A-Za-z0-9_]*` 会与截止日期 @YYYY-MM-DD 冲突，需限制为用户名格式
> 3. 需求一致性：PR 描述提到支持 [ ] 格式但代码未实现，需补充或更新描述
>
> **修复情况：** 已全部采纳并提交（commit 3632f87）。回退了 week5 相关改动，修复了 assignee 解析冲突，补充了 [ ] 格式支持及边界测试。
>
> **Semgrep 结果：** All checks passed，无安全问题。

## Task 3: Try adding a new model and relationships

a. Links to relevant commits/issues

> PR: <https://github.com/hashjenny/modern-software-dev-assignments/pull/1>
> Commits: db72970, ef0a0ef

b. PR Description

> 新增 Tag 模型，与 Note 实现多对多关系。通过 note_tags 关联表管理。添加标签 CRUD 端点及笔记-标签关联接口（POST/DELETE /notes/{id}/tags/）。

c. GitHub Copilot generated code review

> **审查意见：**
>
> 1. NoteRead.tags 使用可变默认值 []，存在共享可变对象风险，应改为 Field(default_factory=list)
> 2. create_tag/patch_tag 对唯一约束冲突未处理，会返回 500，建议捕获 IntegrityError 返回 409
> 3. 标签关联接口与 PR 描述不一致，需补齐 POST /notes/{id}/tags/、DELETE /notes/{id}/tags/{tag_id}
> 4. SQLite 默认未开启 foreign_keys=ON，删除 Tag 前需显式清理关联
>
> **修复情况：** 已全部采纳并提交（commit db72970）。实现了标签重名返回 409、删除 Tag 前清理关联、NoteRead.tags 改为 default_factory、补充了关联端点和边界测试。
>
> **Semgrep 结果：** All checks passed，无安全问题。

## Task 4: Improve tests for pagination and sorting

a. Links to relevant commits/issues

> PR: <https://github.com/hashjenny/modern-software-dev-assignments/pull/4>
> Commits: 6e43693, 501683d

b. PR Description

> 新增 test_pagination.py，包含 28 个测试用例覆盖分页和排序功能。包括：默认/显式 limit、skip 翻页、边界情况、最大 limit 验证、无效 sort 回退、分页+排序组合、搜索+分页+排序联合场景。

c. GitHub Copilot generated code review

> **审查意见：**
>
> 1. 分页测试中"两个页面不相等"的断言不够精确，应使用 isdisjoint 验证无重叠
> 2. action-items 分页 skip 场景缺少 status_code 断言
> 3. 负数 skip 测试改为与 skip=0 结果等价校验更合理
>
> **修复情况：** 已全部采纳并提交（commit 6e43693）。修复了断言逻辑，补充了 status_code 校验，提升了测试严谨性。
>
> **Semgrep 结果：** All checks passed，无安全问题。

## Brief Reflection

a. The types of comments you typically made in your manual reviews (e.g., correctness, performance, security, naming, test gaps, API shape, UX, docs).

> **人工审查关注点：**
>
> - **正确性**：参数校验是否完整，边界条件是否处理，异常路径是否覆盖
> - **安全性**：用户输入是否做充分验证，是否存在注入风险
> - **测试覆盖**：是否有遗漏的边界场景，断言是否足够严谨
> - **代码风格**：命名是否清晰，函数是否过于复杂
> - **API 设计**：接口命名是否一致，错误返回是否友好
> - **性能**：是否有 N+1 查询问题，是否有不必要的重复查询

b. A comparison of **your** comments vs. **GitHub Copilot's** AI-generated comments for each PR.

> **Task 1：** Copilot 指出 sort 参数白名单问题，这是我人工审查时遗漏的——我只关注了输入验证，忽略了 sort 参数的安全性。Copilot 还建议测试覆盖 PATCH 超长和非法 sort，这两个边界场景我的审查也未覆盖。
>
> **Task 2：** Copilot 发现我混入了 week5 的无关改动，这是一个重要问题——我的审查主要关注代码逻辑本身，未仔细核对改动范围是否限定在任务范围内。另外 Copilot 指出 @日期 解析冲突，这个边界场景我也没有考虑到。
>
> **Task 3：** Copilot 指出 NoteRead.tags 可变默认值风险，这属于 Python 经典陷阱，我人工审查时忽略了这类细节。但 Copilot 未发现的是一个更核心的问题：SQLite 外键约束默认未开启，级联删除可能不会如预期工作。
>
> **Task 4：** Copilot 对测试断言的改进建议（isdisjoint vs 不相等，负数 skip 与零等价）比我人工审查更细致。我写测试时主要关注功能覆盖，对断言严谨性关注不够。

c. When the AI reviews were better/worse than yours (cite specific examples)

> **AI 做得更好的情况：**
>
> - 边界场景覆盖：Copilot 指出 @2026-06-30 会误识别为 assignee，这是我没有想到的边界情况
> - 安全细节：sort 白名单、默认值可变对象等经典陷阱，AI 比人工更系统地覆盖
> - 测试严谨性：断言逻辑的改进建议（isdisjoint）提升了测试质量
>
> **AI 做得不如人工的情况：**
>
> - 整体架构理解：Task 3 中 Copilot 未指出 SQLite 外键约束的根本性问题——它只是建议"删除前清理关联"，而没有指出问题根源是数据库配置
> - 上下文判断：Copilot 在 Task 2 中建议回退 week5 的改动，但未理解这些改动可能是预先存在的共享代码
> - 权衡取舍：人工审查会考虑"这个改动是否值得做"，AI 倾向于提出完美的解决方案但可能过于理想化

d. Your comfort level trusting AI reviews going forward and any heuristics for when to rely on them.

> **信任级别：中等偏向信任**
>
> **可信赖的场景：**
>
> - 经典编程陷阱（可变默认值、SQL 注入、边界条件遗漏）
> - 测试覆盖度分析
> - 代码风格和命名规范
>
> **需谨慎的场景：**
>
> - 涉及外部依赖和配置的复杂问题（如数据库行为）
> - 需要理解整体架构上下文的改动
> - 需要权衡改动成本与收益的场景
>
> **启发式规则：**
>
> 1. AI 提出的安全问题是高度可信的——优先处理
> 2. AI 提出的测试建议是有价值的——应该采纳
> 3. AI 提出的架构性建议需要结合上下文判断——不要盲目接受
> 4. 当 AI 和人工审查意见冲突时，人工判断优先，除非有明确证据支持 AI
