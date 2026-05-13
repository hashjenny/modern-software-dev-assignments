from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Note, Tag
from ..schemas import NoteTagsPatch, TagCreate, TagPatch, TagRead

router = APIRouter(prefix="/tags", tags=["tags"])
SORTABLE_TAG_FIELDS = {"id", "name", "color", "created_at", "updated_at"}


@router.get("/", response_model=list[TagRead])
def list_tags(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(50, le=200),
    sort: str = Query("-created_at"),
) -> list[TagRead]:
    stmt = select(Tag)
    sort_field = sort.lstrip("-")
    order_fn = desc if sort.startswith("-") else asc
    if sort_field not in SORTABLE_TAG_FIELDS:
        raise HTTPException(status_code=400, detail=f"Invalid sort field: {sort_field}")
    stmt = stmt.order_by(order_fn(getattr(Tag, sort_field)))
    rows = db.execute(stmt.offset(skip).limit(limit)).scalars().all()
    return [TagRead.model_validate(row) for row in rows]


@router.post("/", response_model=TagRead, status_code=201)
def create_tag(payload: TagCreate, db: Session = Depends(get_db)) -> TagRead:
    tag = Tag(name=payload.name, color=payload.color or "#888888")
    db.add(tag)
    try:
        db.flush()
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Tag name already exists") from exc
    db.refresh(tag)
    return TagRead.model_validate(tag)


@router.get("/{tag_id}", response_model=TagRead)
def get_tag(tag_id: int, db: Session = Depends(get_db)) -> TagRead:
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return TagRead.model_validate(tag)


@router.patch("/{tag_id}", response_model=TagRead)
def patch_tag(tag_id: int, payload: TagPatch, db: Session = Depends(get_db)) -> TagRead:
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if payload.name is not None:
        tag.name = payload.name
    if payload.color is not None:
        tag.color = payload.color
    db.add(tag)
    try:
        db.flush()
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Tag name already exists") from exc
    db.refresh(tag)
    return TagRead.model_validate(tag)


@router.delete("/{tag_id}", status_code=204)
def delete_tag(tag_id: int, db: Session = Depends(get_db)) -> None:
    tag = db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.notes.clear()
    db.delete(tag)
    db.flush()


# ── Tag assignment to notes ──────────────────────────────────────────────────


@router.put("/notes/{note_id}", response_model=list[TagRead])
def replace_note_tags(
    note_id: int, payload: NoteTagsPatch, db: Session = Depends(get_db)
) -> list[TagRead]:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    unique_tag_ids = list(dict.fromkeys(payload.tag_ids))
    tags = db.execute(select(Tag).where(Tag.id.in_(unique_tag_ids))).scalars().all()
    if len(tags) != len(unique_tag_ids):
        raise HTTPException(status_code=400, detail="One or more tag IDs not found")
    note.tags = list(tags)
    db.add(note)
    db.flush()
    return [TagRead.model_validate(t) for t in note.tags]
