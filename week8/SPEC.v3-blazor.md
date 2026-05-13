# Version 3 Technical Specification — Blazor Server + C# Stack

## 1. 技术栈概述

| 项目 | 选择 |
|------|------|
| 框架 | Blazor Server（.NET 10） |
| 语言 | C# 13 |
| 数据库 | SQLite（嵌入式关系型） |
| ORM | Entity Framework Core（`Microsoft.EntityFrameworkCore.Sqlite`） |
| 认证 | 无（不做用户认证） |
| 部署 | Docker（.NET 官方镜像） |

---

## 2. 项目结构

```
notehub-blazor/
├── Pages/
│   ├── Index.razor           # 首页
│   ├── Notes/
│   │   ├── NoteList.razor   # 笔记列表
│   │   ├── NoteDetail.razor  # 笔记详情
│   │   ├── NoteEdit.razor    # 新建/编辑笔记
│   │   └── NoteDelete.razor  # 删除确认
│   ├── Categories/
│   │   ├── CategoryList.razor
│   │   ├── CategoryDetail.razor
│   │   └── CategoryEdit.razor
│   └── Search/
│       └── SearchResults.razor
├── Components/
│   ├── NoteCard.razor
│   ├── CategoryCard.razor
│   └── MainLayout.razor
├── Models/
│   ├── Note.cs
│   └── Category.cs
├── Services/
│   ├── INoteService.cs
│   ├── NoteService.cs
│   ├── ICategoryService.cs
│   └── CategoryService.cs
├── Data/
│   └── AppDbContext.cs      # EF Core DbContext
├── App.razor
├── Program.cs
├── notehub-blazor.csproj
├── Dockerfile
└── README.md
```

---

## 3. 数据模型

### 3.1 Note

```csharp
public class Note
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

### 3.2 Category

```csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

---

## 4. 服务层设计

### 4.1 INoteService

```csharp
public interface INoteService
{
    Task<IEnumerable<Note>> GetAllAsync();
    Task<Note?> GetByIdAsync(int id);
    Task<Note> CreateAsync(Note note);
    Task<Note> UpdateAsync(Note note);
    Task DeleteAsync(int id);
    Task<IEnumerable<Note>> SearchAsync(string query);
}
```

### 4.2 ICategoryService

```csharp
public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<Category> CreateAsync(Category category);
    Task DeleteAsync(int id);
}
```

---

## 5. 页面路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `Index.razor` | 首页 |
| `/notes` | `NoteList.razor` | 笔记列表 |
| `/notes/new` | `NoteEdit.razor` | 新建笔记 |
| `/notes/{id}` | `NoteDetail.razor` | 笔记详情 |
| `/notes/{id}/edit` | `NoteEdit.razor` | 编辑笔记 |
| `/notes/{id}/delete` | `NoteDelete.razor` | 删除确认 |
| `/categories` | `CategoryList.razor` | 分类列表 |
| `/categories/{id}` | `CategoryDetail.razor` | 某分类下的笔记 |
| `/search?q=` | `SearchResults.razor` | 搜索结果 |

---

## 6. 组件设计

| 组件 | 说明 |
|------|------|
| `NoteCard.razor` | 笔记卡片，展示标题 + 时间 + 分类 |
| `CategoryCard.razor` | 分类卡片，展示名称 + 笔记数量 |
| `MainLayout.razor` | 主布局，包含侧边栏导航和头部 |

---

## 7. 验证规则

- 笔记标题：必填，最大 200 字符（`[Required]` + `[StringLength(200)]`）
- 分类名称：必填，唯一，最大 100 字符
- 错误处理：Blazor `EditForm` 验证

---

## 8. Docker 配置

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["notehub-blazor.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "notehub-blazor.dll"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_URLS=http://+:8080
```

---

## 9. 运行方式

### 本地

```bash
dotnet restore
dotnet run
```

访问 `http://localhost:5000`

### Docker

```bash
docker-compose up --build
```

访问 `http://localhost:8080`

---

## 10. 依赖（.csproj）

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0" />
```

---

## 11. 备注

- Blazor Server 通过 SignalR 保持 WebSocket 连接，页面状态在服务端管理
- SQLite 数据文件存储在 `App_Data/notehub.sqlite`
- 搜索使用 EF Core 字符串包含查询（`Contains`）
