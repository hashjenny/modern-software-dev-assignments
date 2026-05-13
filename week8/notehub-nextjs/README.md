# NoteHub (Next.js)

笔记管理应用，基于 Next.js 15 + Prisma + Tailwind CSS 构建。

## 快速开始

```bash
cd week8/notehub-nextjs

# 安装依赖
pnpm install

# 初始化数据库
pnpm db:push

# 启动开发服务器
pnpm dev
```

访问 <http://localhost:3000>

## 环境变量

```bash
# 创建 .env.local 文件
DATABASE_URL="file:./dev.db"
```

## 功能

- 笔记的创建、查看、编辑、删除
- 分类管理
- 搜索功能
- 基于 App Router 的服务端渲染

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **数据库**: Prisma ORM + SQLite
- **样式**: Tailwind CSS 4
- **组件库**: Lucide React (图标)
- **表单处理**: React Hook Form

## 项目结构

```
notehub-nextjs/
├── app/              # Next.js App Router 页面
│   ├── notes/        # 笔记相关页面
│   ├── categories/   # 分类相关页面
│   ├── search/       # 搜索页面
│   └── page.tsx      # 首页
├── components/       # React 组件
├── lib/              # 工具函数和 Prisma 客户端
├── prisma/           # 数据库 Schema
└── package.json
```
