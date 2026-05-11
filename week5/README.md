# Week 5

Minimal full‑stack starter for experimenting with autonomous coding agents.

- FastAPI backend with SQLite (SQLAlchemy)
- Static frontend or Vite+React (optional)
- Minimal tests (pytest)
- Pre-commit (black + ruff)
- Tasks to practice agent-driven workflows

## Quickstart (UV Environment)

1) Install dependencies

```bash
cd week5 && uv sync --python ../.venv
```

2) Run the app

```bash
cd week5 && make run
```

3) Open `http://localhost:8000` for the frontend and `http://localhost:8000/docs` for the API docs.

## Structure

```
backend/                # FastAPI app
frontend/               # Static UI served by FastAPI
frontend/ui/            # Optional Vite+React app (build to dist/)
api/                    # Vercel serverless handler
data/                   # SQLite DB + seed
docs/                   # TASKS for agent-driven workflows
```

## Commands

```bash
make run       # Start dev server (port 8000)
make test      # Run pytest tests
make format    # Run black and ruff --fix
make lint      # Run ruff check
make seed      # Apply seed data to database

make web-install   # Install React frontend deps
make web-dev       # Run Vite dev server
make web-build     # Build React frontend to dist/
make web-test      # Run React tests
```

## Optional: Vite + React Frontend

To enable the React frontend:

```bash
make web-install   # Install dependencies
make web-build     # Build to dist/
make run           # Now serves React build
```

For Vercel deployment, see DEPLOY.md.

## Configuration

Copy `.env.example` to `.env` (in `week5/`) to override defaults like the database path.
