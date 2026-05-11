from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ActionItem
from ..schemas import ActionItemCreate, ActionItemRead, BulkCompleteRequest, PaginatedResponse

router = APIRouter(prefix="/action-items", tags=["action_items"])


@router.get("/", response_model=PaginatedResponse)
def list_items(
    completed: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse:
    query = select(ActionItem)
    count_query = select(func.count(ActionItem.id))

    if completed is not None:
        query = query.where(ActionItem.completed == completed)
        count_query = count_query.where(ActionItem.completed == completed)

    total = db.execute(count_query).scalar_one()
    offset = (page - 1) * page_size
    rows = db.execute(query.offset(offset).limit(page_size)).scalars().all()

    return PaginatedResponse(
        items=[ActionItemRead.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/", response_model=ActionItemRead, status_code=201)
def create_item(payload: ActionItemCreate, db: Session = Depends(get_db)) -> ActionItemRead:
    item = ActionItem(description=payload.description, completed=False)
    db.add(item)
    db.flush()
    db.refresh(item)
    return ActionItemRead.model_validate(item)


@router.put("/{item_id}/complete", response_model=ActionItemRead)
def complete_item(item_id: int, db: Session = Depends(get_db)) -> ActionItemRead:
    item = db.get(ActionItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    item.completed = True
    db.add(item)
    db.flush()
    db.refresh(item)
    return ActionItemRead.model_validate(item)


@router.post("/bulk-complete", response_model=list[ActionItemRead])
def bulk_complete(
    payload: BulkCompleteRequest, db: Session = Depends(get_db)
) -> list[ActionItemRead]:
    items = db.execute(select(ActionItem).where(ActionItem.id.in_(payload.ids))).scalars().all()
    if len(items) != len(payload.ids):
        found_ids = {item.id for item in items}
        missing = set(payload.ids) - found_ids
        raise HTTPException(status_code=404, detail=f"Action items not found: {missing}")

    for item in items:
        item.completed = True
        db.add(item)
    db.flush()
    return [ActionItemRead.model_validate(item) for item in items]
