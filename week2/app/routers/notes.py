from __future__ import annotations

import sqlite3
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import db


router = APIRouter(prefix="/notes", tags=["notes"])

class NoteCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)


class NoteOut(BaseModel):
    id: int
    content: str
    created_at: str


@router.get("")
def list_all_notes() -> List[NoteOut]:
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
    content = payload.content.strip()
    try:
        note_id = db.insert_note(content)
        note = db.get_note(note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    if note is None:
        raise HTTPException(status_code=500, detail="note creation failed")
    return NoteOut(id=int(note["id"]), content=str(note["content"]), created_at=str(note["created_at"]))


@router.get("/{note_id}")
def get_single_note(note_id: int) -> NoteOut:
    try:
        row = db.get_note(note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    if row is None:
        raise HTTPException(status_code=404, detail="note not found")
    return NoteOut(id=int(row["id"]), content=str(row["content"]), created_at=str(row["created_at"]))


