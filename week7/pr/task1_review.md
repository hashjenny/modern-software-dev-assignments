# Task 1 PR 审核

## Tools

- Github Copilot
- Semgrep

## PR Link

[week7/task1](https://github.com/hashjenny/modern-software-dev-assignments/pull/2)

## Github Copilot Review

已完成审查（基于提交 c70a17e），建议优先修改这 3 点：

把长度校验从 router 挪到 Pydantic schema（Field(max_length=...)），并覆盖到 PATCH；当前只在 create_* 手写校验，PATCH 仍可写入超长文本，校验逻辑也分散。
sort 参数不要用 hasattr/getattr 直接放行，建议改为白名单字段（如 id/created_at/updated_at）；例如 sort=metadata 会触发 SQLAlchemy ArgumentError，导致 500。
增加对应测试：PATCH 超长输入应返回 422，以及非法 sort 参数应回退默认排序或返回 422，避免回归。

## Github Copilot Fixed

已按建议完善完成，核心改动已合入：输入长度校验迁移到 Pydantic schema（覆盖 create + patch）、sort 改为白名单并对非法字段回退默认排序、补充了对应回归测试（PATCH 超长与非法 sort）。对应提交：353b5d4。

## Github Copilot Conflict Resolved

已完成冲突处理并推送：已将 base 分支合并进当前 PR，解决了冲突文件并通过后端测试与校验。对应提交：18db20d（包含冲突解决合并提交 e626e1d）。

## Semgrep Result

- All checks have passed.
- No conflicts with base branch
