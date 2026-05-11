.PHONY: run test format lint seed
UV_PYTHON := ../.venv

run:
	UV_PYTHON=$(UV_PYTHON) uv run uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

test:
	UV_PYTHON=$(UV_PYTHON) uv run pytest -q backend/tests

format:
	UV_PYTHON=$(UV_PYTHON) uv run black . && UV_PYTHON=$(UV_PYTHON) uv run ruff check . --fix

lint:
	UV_PYTHON=$(UV_PYTHON) uv run ruff check .

seed:
	UV_PYTHON=$(UV_PYTHON) uv run python -c "from backend.app.db import apply_seed_if_needed; apply_seed_if_needed()"
