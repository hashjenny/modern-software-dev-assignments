.PHONY: test format lint
UV_PYTHON := ../.venv

test:
	UV_PYTHON=$(UV_PYTHON) uv run pytest -q

format:
	UV_PYTHON=$(UV_PYTHON) uv run ruff check . --fix

lint:
	UV_PYTHON=$(UV_PYTHON) uv run ruff check .
