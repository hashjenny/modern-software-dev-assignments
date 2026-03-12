# Assignments for CS146S: The Modern Software Developer

This is the home of the assignments for [CS146S: The Modern Software Developer](https://themodernsoftware.dev), taught at Stanford University fall 2025.

## Repo Setup

These steps work with Python 3.12.

1. Install uv (if not already installed)

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. Create and activate a virtual environment with uv

   ```bash
   uv venv --python 3.12
   source .venv/bin/activate
   ```

3. Install project dependencies with uv
   From the repository root:

   ```bash
   uv sync
   ```

   To install dev dependencies:

   ```bash
   uv sync --all-extras
   ```
