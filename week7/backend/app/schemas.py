from datetime import datetime

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    title: str = Field(max_length=200)
    content: str = Field(max_length=10000)


class TagCreate(BaseModel):
    name: str
    color: str | None = "#888888"


class TagRead(BaseModel):
    id: int
    name: str
    color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagPatch(BaseModel):
    name: str | None = None
    color: str | None = None


class NoteRead(BaseModel):
    id: int
    title: str
    content: str
    tags: list[TagRead] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotePatch(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    content: str | None = Field(default=None, max_length=10000)


class NoteTagsPatch(BaseModel):
    tag_ids: list[int]


class NoteTagLinkCreate(BaseModel):
    tag_id: int


class ActionItemCreate(BaseModel):
    description: str = Field(max_length=2000)


class ActionItemRead(BaseModel):
    id: int
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActionItemPatch(BaseModel):
    description: str | None = Field(default=None, max_length=2000)
    completed: bool | None = None
