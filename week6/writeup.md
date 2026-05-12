# Week 6 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## Instructions

Fill out all of the `TODO`s in this file.

## Submission Details

Name: **hashjenny** \
SUNet ID: **hashjenny** \
Citations: **None**

This assignment took me about **3** hours to do.

## Brief findings overview

Semgrep identified multiple security issues across three categories:

- **SAST (Static Application Security Testing)**: SQL injection, code injection via `eval()`, command injection via `subprocess.run(shell=True)`, path traversal, SSRF via `urllib`, wildcard CORS
- **Secrets**: No hardcoded secrets detected
- **SCA (Software Composition Analysis)**: Multiple vulnerable dependencies (werkzeug, pydantic, requests, jinja2, PyYAML) with known CVEs

**Fixed 6 issues:**

1. SQL Injection in `unsafe-search` endpoint - used `sqlalchemy.text()` with f-string interpolation
2. Code Injection via `eval()` in debug endpoint
3. Command Injection via `subprocess.run(shell=True)` in debug/run endpoint
4. SSRF via `urllib.request.urlopen` in debug/fetch endpoint
5. Path Traversal in `debug-read` endpoint
6. Wildcard CORS policy in `main.py`

**Supply Chain Fixes:**

- Upgraded werkzeug 0.14.1 → 3.1.8 (fixes 7 CVEs)
- Upgraded requests 2.19.1 → 2.34.0 (fixes 5 CVEs)
- Upgraded jinja2 2.10.1 → 3.1.6 (fixes 6 CVEs)
- (pydantic and PyYAML remain at vulnerable versions due to FastAPI 0.65.2 compatibility constraints)

**False Positives/Ignored:**

- `exec-detected` on `week1/reflexion.py` - Not part of week6 codebase, ignored
- `path-join-resolve-traversal` on `week3/src/lib/logger.ts` - Not part of week6 scope, ignored

## Fix #1

a. File and line(s)
> `week6/backend/app/routers/notes.py` lines 69-78

b. Rule/category Semgrep flagged
> `python.fastapi.db.generic-sql-fastapi.generic-sql-fastapi` and `python.sqlalchemy.security.audit.avoid-sqlalchemy-text.avoid-sqlalchemy-text`

c. Brief risk description
> The `unsafe-search` endpoint used `sqlalchemy.text()` with f-string interpolation to build SQL queries, creating a SQL injection vulnerability. An attacker could inject malicious SQL through the `q` parameter.

d. Your change (short code diff or explanation, AI coding tool usage)
> Replaced the raw SQL with SQLAlchemy ORM's `select()` and `where()` methods using parameterized queries via `Note.title.contains(q)` and `Note.content.contains(q)`:

```python
# Before (vulnerable):
sql = text(f"SELECT ... WHERE title LIKE '%{q}%' OR content LIKE '%{q}%'")

# After (safe):
stmt = (
    select(Note)
    .where((Note.title.contains(q)) | (Note.content.contains(q)))
    .order_by(desc(Note.created_at))
    .limit(50)
)
rows = db.execute(stmt).scalars().all()
```

e. Why this mitigates the issue
> SQLAlchemy's ORM methods automatically use parameterized queries, preventing SQL injection attacks. User input is never directly interpolated into SQL strings.

## Fix #2

a. File and line(s)
> `week6/backend/app/routers/notes.py` (original lines 100-103)

b. Rule/category Semgrep flagged
> `python.lang.security.audit.eval-detected.eval-detected` and `python.fastapi.code.tainted-code-stdlib-fastapi.tainted-code-stdlib-fastapi`

c. Brief risk description
> The `debug/eval` endpoint executed arbitrary Python code via `eval()`, allowing complete code injection. An attacker could execute arbitrary code on the server.

d. Your change (short code diff or explanation, AI coding tool usage)
> Disabled the endpoint by raising an HTTPException:

```python
# Before:
def debug_eval(expr: str) -> dict[str, str]:
    result = str(eval(expr))
    return {"result": result}

# After:
def debug_eval(expr: str) -> dict[str, str]:
    raise HTTPException(status_code=400, detail="eval endpoint is disabled for security reasons")
```

e. Why this mitigates the issue
> The endpoint no longer executes any user-provided code. It immediately rejects all requests with a 400 error, eliminating the code injection attack surface.

## Fix #3

a. File and line(s)
> `week6/backend/app/routers/notes.py` (original lines 106-115)

b. Rule/category Semgrep flagged
> `python.fastapi.os.tainted-os-command-stdlib-fastapi-secure-default.tainted-os-command-stdlib-fastapi-secure-default` and `python.lang.security.audit.subprocess-shell-true.subprocess-shell-true`

c. Brief risk description
> The `debug/run` endpoint executed commands via `subprocess.run(cmd, shell=True)`, allowing command injection. An attacker could execute arbitrary OS commands on the server.

d. Your change (short code diff or explanation, AI coding tool usage)
> Disabled the endpoint by raising an HTTPException:

```python
# Before:
def debug_run(cmd: str) -> dict[str, str]:
    completed = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return {"returncode": str(completed.returncode), "stdout": completed.stdout, "stderr": completed.stderr}

# After:
def debug_run(cmd: str) -> dict[str, str]:
    raise HTTPException(status_code=400, detail="debug/run endpoint is disabled for security reasons")
```

e. Why this mitigates the issue
> The endpoint no longer executes any user-provided commands. It immediately rejects all requests with a 400 error, eliminating the command injection attack surface.

## Fix #4

a. File and line(s)
> `week6/backend/app/routers/notes.py` (original lines 118-124)

b. Rule/category Semgrep flagged
> `python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected`

c. Brief risk description
> The `debug/fetch` endpoint used `urllib.request.urlopen(url)` with user-controlled URL input, allowing SSRF attacks. An attacker could access internal services, cloud metadata, or internal files via `file://` scheme.

d. Your change (short code diff or explanation, AI coding tool usage)
> Disabled the endpoint by raising an HTTPException:

```python
# Before:
def debug_fetch(url: str) -> dict[str, str]:
    from urllib.request import urlopen
    with urlopen(url) as res:
        body = res.read(1024).decode(errors="ignore")
    return {"snippet": body}

# After:
def debug_fetch(url: str) -> dict[str, str]:
    raise HTTPException(status_code=400, detail="debug/fetch endpoint is disabled for security reasons")
```

e. Why this mitigates the issue
> The endpoint no longer makes any network requests based on user input, eliminating SSRF attack surface.

## Fix #5

a. File and line(s)
> `week6/backend/app/routers/notes.py` (original lines 127-133)

b. Rule/category Semgrep flagged
> `python.fastapi.file.tainted-path-traversal-stdlib-fastapi.tainted-path-traversal-stdlib-fastapi`

c. Brief risk description
> The `debug/read` endpoint read files from arbitrary paths without validation, allowing path traversal attacks (e.g., `../../etc/passwd`). An attacker could read sensitive files outside the intended directory.

d. Your change (short code diff or explanation, AI coding tool usage)
> Added path validation to restrict file access to the `data/` directory:

```python
# Before:
content = open(path).read(1024)

# After:
safe_base = Path("data").resolve()
target_path = (safe_base / path).resolve()

if not str(target_path).startswith(str(safe_base)):
    raise HTTPException(status_code=400, detail="Access denied: path traversal detected")

content = target_path.read_text(errors="ignore")[:1024]
```

e. Why this mitigates the issue
> The fix validates that the resolved path is within the `data/` directory before reading. Even if an attacker provides `../etc/passwd`, the resolved path will be outside `data/` and be rejected.

## Fix #6

a. File and line(s)
> `week6/backend/app/main.py` lines 22-28

b. Rule/category Semgrep flagged
> `python.fastapi.security.wildcard-cors.wildcard-cors`

c. Brief risk description
> CORS was configured with `allow_origins=["*"]` combined with `allow_credentials=True`. Browsers block wildcard credentials requests, but this configuration is misleading and indicates a security misconfiguration.

d. Your change (short code diff or explanation, AI coding tool usage)
> Replaced wildcard with specific allowed origins:

```python
# Before:
allow_origins=["*"],

# After:
allow_origins=["http://localhost:3000", "http://localhost:8080"],
```

e. Why this mitigates the issue
> Only specified origins can access the API with credentials, preventing Cross-Origin attacks while maintaining CORS functionality for legitimate clients.

## Supply Chain Fixes

**werkzeug** 0.14.1 → 3.1.8: Fixed 7 CVEs including CSRF, Path Traversal, Windows Device Names, and Uncontrolled Resource Consumption.

**requests** 2.19.1 → 2.34.0: Fixed 5 CVEs including Exposure of Sensitive Information, Always-Incorrect Control Flow, Insufficiently Protected Credentials, and Insecure Temporary File.

**jinja2** 2.10.1 → 3.1.6: Fixed 6 CVEs including Uncontrolled Resource Consumption, Cross-site Scripting, Protection Mechanism Failure, and Improper Neutralization of Special Elements.

**Upgraded via:** `uv pip install "werkzeug>=2.0" "requests>=2.28" "jinja2>=3.0"`
