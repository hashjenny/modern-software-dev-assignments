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
    parser.py      # Utility service (extract_action_items)

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

## Code Navigation & Entry Points

### Running the Application

```bash
cd week4/
make run      # Starts uvicorn on 127.0.0.1:8000 with auto-reload
```

API docs available at `/docs` (Swagger UI).

### Key Locations

| What | Where |
|------|-------|
| Routers | `backend/app/routers/` |
| Models | `backend/app/models.py` |
| Schemas | `backend/app/schemas.py` |
| Tests | `backend/tests/` |
| Frontend | `frontend/` |

### Seeding Database

```bash
make seed     # Applies data/seed.sql if DB is new
```

On startup, `apply_seed_if_needed()` runs automatically if the DB is empty.

## Style & Safety Gates

### Tool Expectations

- **Formatting**: Black (line-length 100)
- **Linting**: Ruff (rules: E, F, I, UP, B; ignore E501, B008)
- **Pre-commit hooks**: black, ruff --fix, end-of-file-fixer, trailing-whitespace

### Safe Commands

```bash
make format   # Runs black + ruff --fix (safe, idempotent)
make lint     # Runs ruff check (read-only)
make test     # Runs pytest (read-only)
make seed     # Seeds DB if needed (safe)
```

### Commands to Avoid

- `git push --force` — never do this to main/master
- `git reset --hard` — discards local changes, use only if absolutely necessary
- `rm -rf` without verification — always confirm before destructive deletes

### Lint/Test Gates

- All PRs/changes must pass `make lint` and `make test`
- Run `make format` before committing to auto-fix style issues

## Workflow Snippets

### Adding a New Endpoint

1. Write a **failing test** first (e.g., in `backend/tests/test_*.py`)
2. Implement the endpoint in the router
3. Run `uv run pytest -q` to verify
4. Run `make format` then `make lint`
5. Commit with a clear message describing what was added

### Refactoring a Module

1. Find all imports: `grep -rn "from.*module_name" backend/`
2. Use `git mv` to rename the file
3. Update all import statements
4. Run lint and tests to verify

## Code Style

- **Formatting**: Black (line-length 100)
- **Linting**: Ruff (rules: E, F, I, UP, B; ignore E501, B008)
- **Pre-commit hooks**: black, ruff --fix, end-of-file-fixer, trailing-whitespace

## Key Patterns

- Routes use `response_model=list[ModelRead]` for list endpoints
- Use `db.flush(); db.refresh(model)` after writes to get generated fields
- Test fixture uses temp file SQLite with `app.dependency_overrides[get_db]`
