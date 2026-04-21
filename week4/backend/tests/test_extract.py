from backend.app.services.parser import extract_action_items, extract_tags


def test_extract_action_items():
    text = """
    This is a note
    - TODO: write tests
    - Ship it!
    Not actionable
    """.strip()
    items = extract_action_items(text)
    assert "TODO: write tests" in items
    assert "Ship it!" in items


def test_extract_tags():
    text = "This has #python and #fastapi tags"
    tags = extract_tags(text)
    assert "python" in tags
    assert "fastapi" in tags


def test_extract_action_items_with_tags():
    text = """
    - TODO: fix bug #urgent
    - Ship it!
    """
    items = extract_action_items(text)
    assert len(items) == 2
    assert "TODO: fix bug #urgent" in items
    assert "Ship it!" in items


def test_extract_notes_endpoint(client):
    payload = {"title": "Test Note", "content": "- TODO: write tests\n- Ship it!"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201, r.text
    note_id = r.json()["id"]

    r = client.post(f"/notes/{note_id}/extract")
    assert r.status_code == 201, r.text
    items = r.json()
    assert len(items) == 2


def test_extract_notes_endpoint_not_found(client):
    r = client.post("/notes/99999/extract")
    assert r.status_code == 404, r.text
