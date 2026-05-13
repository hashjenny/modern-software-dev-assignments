# Version 2 Technical Specification — Django + Python Stack

## 1. 技术栈概述

| 项目 | 选择 |
|------|------|
| 框架 | Django 5.x |
| 语言 | Python 3.11+ |
| 数据库 | SQLite（Django 内置） |
| ORM | Django ORM（内置） |
| 模板引擎 | Django Templates（内置） |
| CSS | Tailwind CSS（通过 `django-tailwind`） |
| 认证 | 单用户（无登录） |
| 部署 | 本地运行 |

---

## 2. 项目结构

```
notehub-django/
├── notehub/                  # 项目配置
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── notes/                    # 笔记应用
│   ├── models.py             # 数据模型
│   ├── views.py              # 视图函数
│   ├── urls.py               # 路由
│   ├── forms.py              # 表单
│   ├── admin.py              # Admin 后台
│   └── templates/
│       └── notes/
│           ├── note_list.html
│           ├── note_detail.html
│           ├── note_form.html
│           ├── note_confirm_delete.html
│           ├── category_list.html
│           ├── category_form.html
│           └── search_results.html
├── static/
│   └── css/
├── templates/
│   └── base.html             # 基础模板
├── package.json              # Tailwind 用
├── tailwind.config.js
├── manage.py
└── README.md
```

---

## 3. 数据模型（Django Models）

### 3.1 Note

```python
class Note(models.Model):
    title       = models.CharField(max_length=200)
    content     = models.TextField(blank=True, default="")
    category    = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes"
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

### 3.2 Category

```python
class Category(models.Model):
    name       = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

---

## 4. URL 设计

### 4.1 笔记路由

| URL | 视图 | 说明 |
|-----|------|------|
| `/` | `note_list` | 首页，最新笔记列表 |
| `/notes/` | `note_list` | 全部笔记 |
| `/notes/new/` | `note_create` | 新建笔记 |
| `/notes/<id>/` | `note_detail` | 笔记详情 |
| `/notes/<id>/edit/` | `note_update` | 编辑笔记 |
| `/notes/<id>/delete/` | `note_delete` | 删除笔记确认 |
| `/search/?q=` | `search` | 搜索结果 |

### 4.2 分类路由

| URL | 视图 | 说明 |
|-----|------|------|
| `/categories/` | `category_list` | 分类列表 |
| `/categories/new/` | `category_create` | 新建分类 |
| `/categories/<id>/` | `category_detail` | 某分类下的笔记 |
| `/categories/<id>/delete/` | `category_delete` | 删除分类 |

---

## 5. 表单设计（Django Forms）

| 表单 | 字段 |
|------|------|
| `NoteForm` | title（CharField），content（CharField/TextField），category（ChoiceField，可为空） |
| `CategoryForm` | name（CharField） |

---

## 6. 视图设计（Function-Based Views）

使用 Django 原生函数视图，配合 `shortcuts.render` 和 `forms`:

```python
def note_list(request):
    notes = Note.objects.all().order_by("-created_at")
    return render(request, "notes/note_list.html", {"notes": notes})

def note_create(request):
    if request.method == "POST":
        form = NoteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("note_list")
    else:
        form = NoteForm()
    return render(request, "notes/note_form.html", {"form": form})

# ... update, delete, detail 同理
```

搜索视图：
```python
def search(request):
    query = request.GET.get("q", "")
    notes = Note.objects.filter(
        Q(title__icontains=query) | Q(content__icontains=query)
    ) if query else []
    return render(request, "notes/search_results.html", {"notes": notes, "query": query})
```

---

## 7. 验证规则

- 笔记标题：必填，`max_length=200`，表单层验证
- 分类名称：必填，唯一，`max_length=100`
- 删除分类时：级联删除该分类的所有笔记（或 SET_NULL）
- 错误提示：Django 表单自带的 `form.errors`

---

## 8. 模板继承结构

```
base.html
├── navbar（导航栏）
└── content block
    └── note_list.html / note_detail.html / ...
```

---

## 9. 运行方式

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

访问 `http://localhost:8000`

---

## 10. 依赖

```
Django>=5.0
django-tailwind>=3.0
```

---

## 11. 备注

- Django 原生支持 SQLite，无需额外配置
- 使用 `django-tailwind` 集成 Tailwind CSS 构建流程
- Admin 后台默认开启，可用于管理笔记和分类
- 单用户模式，无需登录
