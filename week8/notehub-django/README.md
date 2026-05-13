# NoteHub (Django)

笔记管理应用，基于 Django 5.x + Tailwind CSS 构建。

## 快速开始

```bash

# 创建虚拟环境
uv venv --python 3.12
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv sync

# 安装依赖
cd week8/
uv add -r requirements.txt

# 初始化数据库
uv run ./notehub-django/manage.py migrate

# 启动开发服务器
uv run ./notehub-django/manage.py runserver 127.0.0.1:8000
```

访问 <http://localhost:8000>

## 环境变量

```bash
# .env 文件（可选）
SECRET_KEY=your-secret-key
DEBUG=True
```

## 功能

- 笔记的创建、查看、编辑、删除
- 分类管理
- 搜索功能
- Admin 后台管理

## 技术栈

- **后端框架**: Django 5.x (Python)
- **数据库**: SQLite (Django ORM)
- **样式**: Tailwind CSS
- **模板引擎**: Django Templates

## 项目结构

```
notehub-django/
├── notehub/          # 项目配置
├── notes/            # 笔记应用
│   ├── models.py     # 数据模型
│   ├── views.py      # 视图函数
│   ├── forms.py      # 表单
│   └── urls.py       # 路由
├── theme/            # Tailwind 主题配置
├── templates/        # 基础模板
└── manage.py
```

## 运行要求

- Python 3.10+
- pip
