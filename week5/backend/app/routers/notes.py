from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ActionItem, Note, Tag
from ..schemas import (
    ExtractionResult,
    NoteCreate,
    NoteRead,
    NoteUpdate,
    PaginatedResponse,
    SuccessResponse,
    TagRead,
)

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/", response_model=PaginatedResponse)
def list_notes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    total = db.execute(select(func.count(Note.id))).scalar_one()
    offset = (page - 1) * page_size
    rows = db.execute(select(Note).offset(offset).limit(page_size)).scalars().all()
    return PaginatedResponse(
        items=[NoteRead.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/", response_model=NoteRead, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteRead:
    note = Note(title=payload.title, content=payload.content)
    db.add(note)
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.get("/search/", response_model=PaginatedResponse)
def search_notes(
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort: str = Query(default="created_desc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    query = select(Note)
    total_query = select(func.count(Note.id))

    if q:
        search_filter = (Note.title.ilike(f"%{q}%")) | (Note.content.ilike(f"%{q}%"))
        query = query.where(search_filter)
        total_query = total_query.where(search_filter)

    if sort == "title_asc":
        query = query.order_by(Note.title.asc())
    elif sort == "title_desc":
        query = query.order_by(Note.title.desc())
    elif sort == "created_desc":
        query = query.order_by(Note.id.desc())
    elif sort == "created_asc":
        query = query.order_by(Note.id.asc())

    total = db.execute(total_query).scalar_one()
    offset = (page - 1) * page_size
    rows = db.execute(query.offset(offset).limit(page_size)).scalars().all()

    return PaginatedResponse(
        items=[NoteRead.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteRead.model_validate(note)


@router.put("/{note_id}", response_model=NoteRead)
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> NoteRead:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if payload.title is not None:
        note.title = payload.title
    if payload.content is not None:
        note.content = payload.content
    db.flush()
    db.refresh(note)
    return NoteRead.model_validate(note)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)) -> None:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.flush()


@router.post("/{note_id}/tags/{tag_id}", response_model=SuccessResponse)
def attach_tag(note_id: int, tag_id: int, db: Session = Depends(get_db)) -> SuccessResponse:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag not in note.tags:
        note.tags.append(tag)
        db.flush()
    return SuccessResponse(ok=True, data={"note_id": note_id, "tag_id": tag_id})


@router.delete("/{note_id}/tags/{tag_id}", status_code=204)
def detach_tag(note_id: int, tag_id: int, db: Session = Depends(get_db)) -> None:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag in note.tags:
        note.tags.remove(tag)
        db.flush()


@router.get("/{note_id}/tags/", response_model=list[TagRead])
def list_note_tags(note_id: int, db: Session = Depends(get_db)) -> list[TagRead]:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return [TagRead.model_validate(tag) for tag in note.tags]


@router.post("/{note_id}/extract", response_model=ExtractionResult)
def extract_content(
    note_id: int, apply: bool = False, db: Session = Depends(get_db)
) -> ExtractionResult:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    import re

    tags = re.findall(r"#(\w+)", note.content)
    action_items = re.findall(r"- \[ \] (.+)", note.content)

    result = ExtractionResult(tags=list(set(tags)), action_items=list(set(action_items)))

    if apply:
        existing_tag_names = {t.name for t in db.execute(select(Tag)).scalars().all()}
        for tag_name in result.tags:
            if tag_name not in existing_tag_names:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()
            else:
                tag = db.execute(select(Tag).where(Tag.name == tag_name)).scalar_one()
            if tag not in note.tags:
                note.tags.append(tag)

        for item_text in result.action_items:
            existing = db.execute(
                select(ActionItem).where(ActionItem.description == item_text)
            ).scalar_one_or_none()
            if not existing:
                item = ActionItem(description=item_text, completed=False)
                db.add(item)
                db.flush()
        db.flush()

    return result
