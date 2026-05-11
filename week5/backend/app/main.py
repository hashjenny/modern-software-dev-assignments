from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .db import apply_seed_if_needed, engine
from .models import Base
from .routers import action_items as action_items_router
from .routers import notes as notes_router
from .routers import tags as tags_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    apply_seed_if_needed()
    yield


app = FastAPI(title="Modern Software Dev Starter (Week 5)", lifespan=lifespan)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "error": {
                "code": exc.status_code == 404 and "NOT_FOUND" or "ERROR",
                "message": exc.detail,
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred",
            },
        },
    )


@app.get("/api/ok")
async def ok_endpoint():
    return {"ok": True, "data": None}


# Serve React build in production, static frontend in development
dist_path = Path("dist")
if dist_path.exists():
    app.mount("/", StaticFiles(directory="dist", html=True), name="dist")
else:
    Path("data").mkdir(parents=True, exist_ok=True)
    app.mount("/static", StaticFiles(directory="frontend"), name="static")
    @app.get("/")
    async def root() -> FileResponse:
        return FileResponse("frontend/index.html")


# Routers
app.include_router(notes_router.router)
app.include_router(action_items_router.router)
app.include_router(tags_router.router)