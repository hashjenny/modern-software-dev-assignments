from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ActionItem, Note
from ..schemas import ActionItemRead, NoteCreate, NoteRead
from ..services.parser import extract_action_items

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/", response_model=list[NoteRead])
def list_notes(db: Session = Depends(get_db)) -> list[NoteRead]:
    rows = db.execute(select(Note)).scalars().all()
    return [NoteRead.model_validate(row) for row in rows]


@router.post("/", response_model=NoteRead, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    note = Note(title=payload.title, content=payload.content)
    db.add(note)
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.get("/search/", response_model=list[NoteRead])
def search_notes(q: str | None = None, db: Session = Depends(get_db)) -> list[NoteRead]:
    if not q:
        rows = db.execute(select(Note)).scalars().all()
    else:
        rows = (
            db.execute(select(Note).where((Note.title.contains(q)) | (Note.content.contains(q))))
            .scalars()
            .all()
        )
    return [NoteRead.model_validate(row) for row in rows]


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteRead.model_validate(note)


@router.put(
    "/{note_id}", response_model=NoteRead, responses={404: {"description": "Note not found"}}
)
def update_note(note_id: int, payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.title = payload.title
    note.content = payload.content
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.delete("/{note_id}", status_code=204, responses={404: {"description": "Note not found"}})
def delete_note(note_id: int, db: Session = Depends(get_db)) -> Response:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.flush()
    return Response(status_code=204)


@router.post(
    "/{note_id}/extract",
    response_model=list[ActionItemRead],
    status_code=201,
    responses={404: {"description": "Note not found"}},
)
def extract_action_items_from_note(
    note_id: int, db: Session = Depends(get_db)
) -> list[ActionItemRead]:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    items = extract_action_items(note.content)
    action_items = [ActionItem(description=i) for i in items]
    for ai in action_items:
        db.add(ai)
    db.flush()
    return [ActionItemRead.model_validate(ai) for ai in action_items]
