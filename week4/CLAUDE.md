# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Week 4 assignment - a minimal full-stack "developer's command center" starter application with FastAPI backend and static vanilla JS frontend.

## Common Commands

All commands run from the `week4/` directory using `uv`:

```bash
make run      # Start dev server: uvicorn on 127.0.0.1:8000 with reload
make test     # Run pytest tests
make format   # Run black and ruff --fix
make lint     # Run ruff check
make seed     # Apply seed data to database
```

Single test file: `uv run pytest -q backend/tests/test_notes.py`

## Architecture

```text
backend/app/
  main.py           # FastAPI app entry, mounts static frontend, includes routers
  db.py             # SQLAlchemy engine, SessionLocal, get_db dependency
  models.py         # SQLAlchemy models: Note, ActionItem (Base = declarative_base)
  schemas.py        # Pydantic schemas: NoteCreate/Read, ActionItemCreate/Read
  routers/
    notes.py        # /notes/ endpoints
    action_items.py # /action-items/ endpoints
  services/
    extract.py      # Utility service (may exist)

frontend/
  index.html        # Single-page app entry
  app.js            # Vanilla JS API client
  styles.css        # Styles

data/
  app.db            # SQLite database (created on first run)
  seed.sql          # Initial seed data

backend/tests/
  conftest.py       # TestClient fixture with temp SQLite DB
  test_*.py         # Test files
```

### Data Flow

- **Models** (`models.py`) define SQLAlchemy table structure
- **Schemas** (`schemas.py`) define Pydantic request/response shapes
- **Routers** handle HTTP, use `Depends(get_db)` for session injection
- **DB**: SQLite at `./data/app.db` (override with `DATABASE_PATH` env var)
- **Seed**: `apply_seed_if_needed()` runs on startup if DB is new

### Frontend

- Served by FastAPI at `/` and `/static/`
- Vanilla JS (no build step) - API calls to FastAPI endpoints
- API docs at `/docs` (Swagger UI)

## Code Style

- **Formatting**: Black (line-length 100)
- **Linting**: Ruff (rules: E, F, I, UP, B; ignore E501, B008)
- **Pre-commit hooks**: black, ruff --fix, end-of-file-fixer, trailing-whitespace

## Key Patterns

- Routes use `response_model=list[ModelRead]` for list endpoints
- Use `db.flush(); db.refresh(model)` after writes to get generated fields
- Test fixture uses temp file SQLite with `app.dependency_overrides[get_db]`
