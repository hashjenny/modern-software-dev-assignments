# NoteHub (Blazor Server)

笔记管理应用，基于 .NET 10 + Blazor Server + Entity Framework Core 构建。

## 快速开始

```bash
cd week8/notehub-blazor

# 恢复依赖
dotnet restore

# 启动开发服务器
dotnet run
```

访问 <http://localhost:5000>

## 环境变量

无需额外配置。使用 SQLite 数据库，数据库文件位于 `App_Data/notehub.sqlite`。

## 功能

- 笔记的创建、查看、编辑、删除
- 分类管理
- 搜索功能
- Blazor Server 实时交互体验

## 技术栈

- **前端框架**: Blazor Server (.NET 10)
- **数据库**: Entity Framework Core + SQLite
- **样式**: 自定义 CSS (无第三方组件库)

## 项目结构

```
notehub-blazor/
├── Pages/            # Blazor 页面组件
│   ├── Notes/        # 笔记相关页面
│   ├── Categories/   # 分类相关页面
│   ├── Search/       # 搜索页面
│   └── Index.razor  # 首页
├── Components/      # 共享组件
├── Models/          # 数据模型
├── Services/        # 业务服务
├── Data/            # 数据库上下文
└── Program.cs       # 应用入口
```

## 运行要求

- .NET 10 SDK
- 支持的操作系统: Windows, macOS, Linux
