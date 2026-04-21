# API Documentation

Generated from `openapi.json` - 2026-04-21

## Endpoints

### Notes

| Method | Path | Summary |
|--------|------|---------|
| GET | `/notes/` | List Notes |
| POST | `/notes/` | Create Note |
| GET | `/notes/search/` | Search Notes |
| GET | `/notes/{note_id}` | Get Note |
| PUT | `/notes/{note_id}` | Update Note |
| DELETE | `/notes/{note_id}` | Delete Note |
| POST | `/notes/{note_id}/extract` | Extract action items from note |

### Action Items

| Method | Path | Summary |
|--------|------|---------|
| GET | `/action-items/` | List Items |
| POST | `/action-items/` | Create Item |
| PUT | `/action-items/{item_id}/complete` | Complete Item |

### Static

| Method | Path | Summary |
|--------|------|---------|
| GET | `/` | Root |

---

## Schemas

### NoteCreate

```json
{
  "title": "string (min_length=1, max_length=200)",
  "content": "string (min_length=1)"
}
```

### NoteRead

```json
{
  "id": "integer",
  "title": "string",
  "content": "string"
}
```

### ActionItemCreate

```json
{
  "description": "string (min_length=1)"
}
```

### ActionItemRead

```json
{
  "id": "integer",
  "description": "string",
  "completed": "boolean"
}
```
