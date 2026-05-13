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


def test_create_tag_duplicate_name_returns_conflict(client):
    payload = {"name": "dup", "color": "#111111"}
    r1 = client.post("/tags/", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/tags/", json=payload)
    assert r2.status_code == 409


def test_patch_tag_duplicate_name_returns_conflict(client):
    tag1 = client.post("/tags/", json={"name": "one", "color": "#111111"}).json()
    tag2 = client.post("/tags/", json={"name": "two", "color": "#222222"}).json()

    r = client.patch(f"/tags/{tag2['id']}", json={"name": tag1["name"]})
    assert r.status_code == 409


def test_delete_tag_clears_note_association(client):
    note = client.post("/notes/", json={"title": "n1", "content": "c1"}).json()
    tag = client.post("/tags/", json={"name": "linked", "color": "#123456"}).json()
    client.put(f"/tags/notes/{note['id']}", json={"tag_ids": [tag["id"]]})

    r = client.delete(f"/tags/{tag['id']}")
    assert r.status_code == 204

    note_after = client.get(f"/notes/{note['id']}").json()
    assert note_after["tags"] == []


def test_list_tags_rejects_invalid_sort_field(client):
    client.post("/tags/", json={"name": "sort-test", "color": "#abcdef"})
    r = client.get("/tags/?sort=metadata")
    assert r.status_code == 400


def test_replace_note_tags_accepts_duplicate_tag_ids(client):
    note = client.post("/notes/", json={"title": "n2", "content": "c2"}).json()
    tag = client.post("/tags/", json={"name": "unique", "color": "#999999"}).json()

    r = client.put(f"/tags/notes/{note['id']}", json={"tag_ids": [tag["id"], tag["id"]]})
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_add_and_remove_note_tag_endpoints(client):
    note = client.post("/notes/", json={"title": "n3", "content": "c3"}).json()
    tag = client.post("/tags/", json={"name": "ops", "color": "#00aa00"}).json()

    r = client.post(f"/notes/{note['id']}/tags/", json={"tag_id": tag["id"]})
    assert r.status_code == 200
    assert len(r.json()["tags"]) == 1

    r = client.delete(f"/notes/{note['id']}/tags/{tag['id']}")
    assert r.status_code == 200
    assert r.json()["tags"] == []
