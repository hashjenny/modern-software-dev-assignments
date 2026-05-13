# NoteHub (Django)

笔记管理应用，基于 Django 5.x + Tailwind CSS 构建。

## 快速开始

```bash
cd week8/notehub-django

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 初始化数据库
python manage.py migrate

# 创建超级用户（可选）
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

访问 http://localhost:8000

## 功能

- 笔记的创建、查看、编辑、删除
- 分类管理
- 搜索功能
- Admin 后台管理

## 项目结构

```
notehub-django/
├── notehub/          # 项目配置
├── notes/            # 笔记应用
├── theme/            # Tailwind 主题
├── templates/        # 基础模板
└── manage.py
```
