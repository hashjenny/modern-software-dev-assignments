# Version 1 Technical Specification — Next.js Stack

## 1. 技术栈概述

| 项目 | 选择 |
|------|------|
| 框架 | Next.js (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite（通过 `better-sqlite3` 或 `libsql`） |
| ORM | Prisma（SQLite 原生支持好） |
| UI | Tailwind CSS + 内置组件 |
| 认证 | 单用户（无登录） |
| 部署 | 本地运行 |

---

## 2. 项目结构

```
notehub-nextjs/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（笔记列表）
│   ├── notes/
│   │   ├── page.tsx        # 笔记列表页
│   │   ├── new/page.tsx     # 新建笔记
│   │   ├── [id]/page.tsx    # 笔记详情
│   │   └── [id]/edit/page.tsx # 编辑笔记
│   ├── categories/
│   │   ├── page.tsx        # 分类列表
│   │   ├── new/page.tsx     # 新建分类
│   │   └── [id]/page.tsx    # 分类详情（含该分类下笔记）
│   └── search/page.tsx     # 搜索页
├── components/
│   ├── NoteCard.tsx
│   ├── CategoryCard.tsx
│   ├── NoteForm.tsx
│   ├── CategoryForm.tsx
│   └── SearchBar.tsx
├── prisma/
│   └── schema.prisma        # 数据模型
├── lib/
│   ├── prisma.ts            # Prisma 客户端单例
│   └── actions.ts           # Server Actions（CRUD）
├── app/globals.css
├── package.json
├── prisma/schema.prisma
└── README.md
```

---

## 3. 数据模型（Prisma Schema）

### 3.1 Note

```prisma
model Note {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  content     String?
  categoryId  Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  category    Category? @relation(fields: [categoryId], references: [id])
}
```

### 3.2 Category

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique @db.VarChar(100)
  createdAt DateTime @default(now())
  notes     Note[]
}
```

---

## 4. API / Server Actions 设计

所有 CRUD 通过 Next.js Server Actions 实现，无需独立 API 路由。

| Action | 说明 |
|--------|------|
| `getNotes()` | 获取所有笔记（含分页） |
| `getNote(id)` | 获取单条笔记 |
| `createNote(data)` | 创建笔记 |
| `updateNote(id, data)` | 更新笔记 |
| `deleteNote(id)` | 删除笔记 |
| `getCategories()` | 获取所有分类 |
| `createCategory(data)` | 创建分类 |
| `deleteCategory(id)` | 删除分类 |
| `searchNotes(query)` | 搜索笔记（标题 + 内容） |

---

## 5. 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页，展示最新 10 条笔记 |
| `/notes` | 全部笔记列表（分页） |
| `/notes/new` | 新建笔记表单 |
| `/notes/[id]` | 笔记详情 |
| `/notes/[id]/edit` | 编辑笔记表单 |
| `/categories` | 分类列表 |
| `/categories/new` | 新建分类 |
| `/categories/[id]` | 某分类下的所有笔记 |
| `/search?q=` | 搜索结果页 |

---

## 6. 组件设计

| 组件 | 说明 |
|------|------|
| `NoteCard` | 笔记卡片，展示标题 + 创建时间 + 分类标签 |
| `CategoryCard` | 分类卡片，展示名称 + 笔记数量 |
| `NoteForm` | 笔记表单（含标题、内容、分类选择） |
| `CategoryForm` | 分类表单（仅名称） |
| `SearchBar` | 搜索框，支持回车搜索 |

---

## 7. 验证规则

- 笔记标题：必填，最大 200 字符
- 分类名称：必填，唯一，最大 100 字符
- 错误处理：表单内提示 + 友好错误页面

---

## 8. 运行方式

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

访问 `http://localhost:3000`

---

## 9. 备注

- 本版本由 bolt.new 生成，生成后需人工补充 Prisma schema 和 README.md
- SQLite 数据库文件存储在 `prisma/dev.db`
- 单用户模式，无需登录
