from __future__ import annotations

import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import db
from ..services.extract import extract_action_items, extract_action_items_llm

router = APIRouter(prefix="/action-items", tags=["action-items"])


# AI-generated (Exercise 3): explicit extract request schema.
class ActionItemsExtractRequest(BaseModel):
    text: str = Field(..., min_length=1)
    save_note: bool = False


# AI-generated (Exercise 3): explicit typed response payload for action items.
class ActionItemOut(BaseModel):
    id: int
    text: str


class ActionItemsExtractResponse(BaseModel):
    note_id: int | None
    items: list[ActionItemOut]


class MarkDoneRequest(BaseModel):
    done: bool = True


class MarkDoneResponse(BaseModel):
    id: int
    done: bool


@router.post("/extract")
def extract(payload: ActionItemsExtractRequest) -> ActionItemsExtractResponse:
    # AI-generated (Exercise 3): normalize request handling + DB exceptions.
    text = payload.text.strip()
    note_id: int | None = None
    try:
        if payload.save_note:
            note_id = db.insert_note(text)
        items = extract_action_items(text)
        ids = db.insert_action_items(items, note_id=note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return ActionItemsExtractResponse(
        note_id=note_id,
        items=[ActionItemOut(id=i, text=t) for i, t in zip(ids, items, strict=False)],
    )


@router.post("/extract-llm")
def extract_llm(payload: ActionItemsExtractRequest) -> ActionItemsExtractResponse:
    # AI-generated (Exercise 4): LLM-backed extraction endpoint used by frontend "Extract LLM".
    text = payload.text.strip()
    note_id: int | None = None
    try:
        if payload.save_note:
            note_id = db.insert_note(text)
        items = extract_action_items_llm(text)
        ids = db.insert_action_items(items, note_id=note_id)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return ActionItemsExtractResponse(
        note_id=note_id,
        items=[ActionItemOut(id=i, text=t) for i, t in zip(ids, items, strict=False)],
    )


@router.get("")
def list_all(note_id: int | None = None) -> list[dict]:
    # AI-generated (Exercise 3): centralized DB-to-JSON conversion with error handling.
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
    # AI-generated (Exercise 3): explicit request/response model for status updates.
    try:
        db.mark_action_item_done(action_item_id, payload.done)
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail="database error") from e
    return MarkDoneResponse(id=action_item_id, done=payload.done)
