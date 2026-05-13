def test_create_list_and_patch_notes(client):
    payload = {"title": "Test", "content": "Hello world"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["title"] == "Test"
    assert "created_at" in data and "updated_at" in data

    r = client.get("/notes/")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1

    r = client.get("/notes/", params={"q": "Hello", "limit": 10, "sort": "-created_at"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1

    note_id = data["id"]
    r = client.patch(f"/notes/{note_id}", json={"title": "Updated"})
    assert r.status_code == 200
    patched = r.json()
    assert patched["title"] == "Updated"


def test_delete_note(client):
    payload = {"title": "To be deleted", "content": "This note will be deleted"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201
    note_id = r.json()["id"]

    r = client.delete(f"/notes/{note_id}")
    assert r.status_code == 204

    r = client.get(f"/notes/{note_id}")
    assert r.status_code == 404


def test_create_note_title_too_long(client):
    payload = {"title": "x" * 201, "content": "Valid content"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 422


def test_create_note_content_too_long(client):
    payload = {"title": "Valid title", "content": "x" * 10001}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 422


def test_patch_note_content_too_long(client):
    payload = {"title": "Valid title", "content": "Valid content"}
    created = client.post("/notes/", json=payload)
    note_id = created.json()["id"]

    r = client.patch(f"/notes/{note_id}", json={"content": "x" * 10001})
    assert r.status_code == 422


def test_list_notes_invalid_sort_falls_back_to_default(client):
    client.post("/notes/", json={"title": "First", "content": "one"})
    client.post("/notes/", json={"title": "Second", "content": "two"})

    r = client.get("/notes/", params={"sort": "metadata"})
    assert r.status_code == 200

    expected = client.get("/notes/", params={"sort": "-created_at"})
    assert expected.status_code == 200
    assert r.json() == expected.json()
