.PHONY: test format lint migrate runserver

UV_PYTHON := ../.venv
MANAGE_PY := $(UV_PYTHON)/bin/python ./notehub-django/manage.py

test:
	UV_PYTHON=$(UV_PYTHON) uv run pytest -q

format:
	UV_PYTHON=$(UV_PYTHON) uv run ruff check . --fix

lint:
	UV_PYTHON=$(UV_PYTHON) uv run ruff check .

migrate:
	$(MANAGE_PY) migrate

makemigrations:
	$(MANAGE_PY) makemigrations notes

runserver:
	$(MANAGE_PY) runserver 0.0.0.0:8001
