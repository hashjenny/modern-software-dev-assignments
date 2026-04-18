import os
import subprocess


def _run(cmd: list[str]) -> None:
    env = os.environ.copy()
    env["PYTHONPATH"] = "."
    subprocess.run(cmd, check=True, env=env)


def run() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = os.environ.get("PORT", "8000")
    _run(["uvicorn", "backend.app.main:app", "--reload", "--host", host, "--port", port])


def test() -> None:
    _run(["pytest", "-q", "backend/tests"])


def format_code() -> None:
    _run(["black", "."])
    _run(["ruff", "check", ".", "--fix"])


def lint() -> None:
    _run(["ruff", "check", "."])


def seed() -> None:
    from backend.app.db import apply_seed_if_needed

    apply_seed_if_needed()
