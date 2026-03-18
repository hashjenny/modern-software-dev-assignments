from __future__ import annotations

import sqlite3
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import db
from ..services.extract import extract_action_items


router = APIRouter(prefix="/action-items", tags=["action-items"])

class ActionItemsExtractRequest(BaseModel):
    text: str = Field(..., min_length=1)
    save_note: bool = False


class ActionItemOut(BaseModel):
    id: int
    text: str


class ActionItemsExtractResponse(BaseModel):
    note_id: Optional[int]
    items: List[ActionItemOut]


class MarkDoneRequest(BaseModel):
    done: bool = True


class MarkDoneResponse(BaseModel):
    id: int
    done: bool


@router.post("/extract")
def extract(payload: ActionItemsExtractRequest) -> ActionItemsExtractResponse:
    text = payload.text.strip()
    note_id: Optional[int] = None
    try:
        if payload.save_note:
            note_id = db.insert_note(text)
        items = extract_action_items(text)
        ids = db.insert_action_items(items, note_id=note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return ActionItemsExtractResponse(
        note_id=note_id,
        items=[ActionItemOut(id=i, text=t) for i, t in zip(ids, items)],
    )


@router.get("")
def list_all(note_id: Optional[int] = None) -> List[dict]:
    try:
        rows = db.list_action_items(note_id=note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return [
        {
            "id": int(r["id"]),
            "note_id": (int(r["note_id"]) if r["note_id"] is not None else None),
            "text": str(r["text"]),
            "done": bool(r["done"]),
            "created_at": str(r["created_at"]),
        }
        for r in rows
    ]


@router.post("/{action_item_id}/done")
def mark_done(action_item_id: int, payload: MarkDoneRequest) -> MarkDoneResponse:
    try:
        db.mark_action_item_done(action_item_id, payload.done)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return MarkDoneResponse(id=action_item_id, done=payload.done)


