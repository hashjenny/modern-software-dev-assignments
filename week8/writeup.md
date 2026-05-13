# Week 8 Write-up

## Submission Details

Name: **hashjenny** \
SUNet ID: **hashjenny** \
Citations: **None**

This assignment took me about **6** hours to do.

## App Concept

**NoteHub** 是一个多栈笔记管理应用，用户可以创建、阅读、编辑、删除笔记，并支持分类组织和全文搜索。三个版本（Django、Next.js、Blazor Server）实现相同的功能集，但分别使用不同的技术栈：

- Next.js (TypeScript) App Router + Prisma
- Django (Python) 后端渲染
- Blazor Server (.NET) 服务端渲染

## Version #1 Description

```text
APP DETAILS:
===============
Folder name: notehub-nextjs
AI app generation platform: bolt.new
Tech Stack: Next.js 15 + TypeScript + Prisma + SQLite + Tailwind CSS 4
Persistence: SQLite via Prisma ORM
Frameworks/Libraries Used: React 19, Lucide React, React Hook Form

REFLECTIONS:
===============
a. Issues encountered per stack and how you resolved them:
   - Bolt.new 生成的初始代码需要重构以适配我们的 SPEC.md 要求
   - 删除了 bolt.new 生成的不必要文件（如额外的组件库）
   - 后来重新使用 Next.js App Router 重构了项目结构以符合现代最佳实践

b. Prompting:
   - Bolt.new 能够快速生成基础 CRUD 页面，但对于复杂的功能需要迭代调整
   - 需要明确指定技术栈版本（如 Next.js 15）以避免版本不一致

c. Approximate time-to-first-run and time-to-feature metrics:
   - 首次运行: ~10 分钟
   - 完整功能: ~3 小时
```

## Version #2 Description

```text
APP DETAILS:
===============
Folder name: notehub-django
AI app generation platform: None (manual implementation)
Tech Stack: Django 5.x + Python + SQLite + Tailwind CSS
Persistence: SQLite via Django ORM
Frameworks/Libraries Used: Django Admin, Django Forms

REFLECTIONS:
===============
a. Issues encountered per stack and how you resolved them:
   - 手动构建，依赖管理需要创建虚拟环境
   - Tailwind CSS 主题配置需要额外设置
   - 使用 FBV 简化逻辑而非 CBV

b. Prompting:
   - 不适用（手动实现）

c. Approximate time-to-first-run and time-to-feature metrics:
   - 首次运行: ~5 分钟
   - 完整功能: ~2 小时
```

## Version #3 Description

```text
APP DETAILS:
===============
Folder name: notehub-blazor
AI app generation platform: None (manual implementation)
Tech Stack: .NET 10 + Blazor Server + Entity Framework Core + SQLite
Persistence: SQLite via EF Core
Frameworks/Libraries Used: 自定义 CSS (无第三方 UI 组件库)

REFLECTIONS:
===============
a. Issues encountered per stack and how you resolved them:
   - 搜索页面 URL 变化不会触发组件重新渲染
   - 解决方法是订阅 LocationChanged 事件并实现 IDisposable
   - 删除了所有第三方组件库依赖，改用自定义 CSS

b. Prompting:
   - 不适用（手动实现）

c. Approximate time-to-first-run and time-to-feature metrics:
   - 首次运行: ~3 分钟
   - 完整功能: ~2.5 小时
```
