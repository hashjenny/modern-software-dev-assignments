def test_create_list_patch_and_delete_tag(client):
    payload = {"name": "urgent", "color": "#ff0000"}
    r = client.post("/tags/", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["name"] == "urgent"
    assert data["color"] == "#ff0000"
    assert "created_at" in data and "updated_at" in data
    tag_id = data["id"]

    r = client.get("/tags/")
    assert r.status_code == 200
    items = r.json()
    assert any(t["id"] == tag_id for t in items)

    r = client.patch(f"/tags/{tag_id}", json={"color": "#00ff00"})
    assert r.status_code == 200
    patched = r.json()
    assert patched["color"] == "#00ff00"
    assert patched["name"] == "urgent"

    r = client.delete(f"/tags/{tag_id}")
    assert r.status_code == 204

    r = client.get(f"/tags/{tag_id}")
    assert r.status_code == 404


def test_tag_note_and_list_with_tags(client):
    note_payload = {"title": "Meeting Notes", "content": "Discuss Q1 goals"}
    r = client.post("/notes/", json=note_payload)
    assert r.status_code == 201
    note = r.json()
    note_id = note["id"]

    tag_payload = {"name": "meeting", "color": "#0000ff"}
    r = client.post("/tags/", json=tag_payload)
    assert r.status_code == 201
    tag = r.json()
    tag_id = tag["id"]

    r = client.put(f"/tags/notes/{note_id}", json={"tag_ids": [tag_id]})
    assert r.status_code == 200
    assigned = r.json()
    assert isinstance(assigned, list)
    assert len(assigned) == 1
    assert assigned[0]["id"] == tag_id

    r = client.get(f"/notes/{note_id}")
    assert r.status_code == 200
    note_with_tag = r.json()
    assert len(note_with_tag["tags"]) == 1
    assert note_with_tag["tags"][0]["id"] == tag_id


def test_replace_note_tags(client):
    note_payload = {"title": "Shopping List", "content": "Buy milk"}
    r = client.post("/notes/", json=note_payload)
    note = r.json()
    note_id = note["id"]

    tag1 = client.post("/tags/", json={"name": "home", "color": "#aaa"}).json()
    tag2 = client.post("/tags/", json={"name": "errands", "color": "#bbb"}).json()

    r = client.put(f"/tags/notes/{note_id}", json={"tag_ids": [tag1["id"], tag2["id"]]})
    assert r.status_code == 200
    assert len(r.json()) == 2

    r = client.put(f"/tags/notes/{note_id}", json={"tag_ids": [tag1["id"]]})
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["id"] == tag1["id"]


def test_replace_tags_invalid_id(client):
    note_payload = {"title": "Test", "content": "Content"}
    r = client.post("/notes/", json=note_payload)
    note = r.json()

    r = client.put(f"/tags/notes/{note['id']}", json={"tag_ids": [9999]})
    assert r.status_code == 400
