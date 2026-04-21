from __future__ import annotations

import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import db

router = APIRouter(prefix="/notes", tags=["notes"])


# AI-generated (Exercise 3): explicit request model to tighten API contract.
class NoteCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)


# AI-generated (Exercise 3): typed response model for stable API shape.
class NoteOut(BaseModel):
    id: int
    content: str
    created_at: str


@router.get("")
def list_all_notes() -> list[NoteOut]:
    # AI-generated (Exercise 4): new endpoint to list all notes for frontend "List Notes" button.
    try:
        rows = db.list_notes()
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return [
        NoteOut(id=int(r["id"]), content=str(r["content"]), created_at=str(r["created_at"]))
        for r in rows
    ]


@router.post("")
def create_note(payload: NoteCreateRequest) -> NoteOut:
    # AI-generated (Exercise 3): add consistent DB error handling with HTTP 500 mapping.
    content = payload.content.strip()
    try:
        note_id = db.insert_note(content)
        note = db.get_note(note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    if note is None:
        raise HTTPException(status_code=500, detail="note creation failed")
    return NoteOut(
        id=int(note["id"]), content=str(note["content"]), created_at=str(note["created_at"])
    )


@router.get("/{note_id}")
def get_single_note(note_id: int) -> NoteOut:
    # AI-generated (Exercise 3): keep typed response + explicit 404/500 behavior.
    try:
        row = db.get_note(note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    if row is None:
        raise HTTPException(status_code=404, detail="note not found")
    return NoteOut(
        id=int(row["id"]), content=str(row["content"]), created_at=str(row["created_at"])
    )
