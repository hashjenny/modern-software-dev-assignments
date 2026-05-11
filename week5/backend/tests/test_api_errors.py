

def test_create_note_validation(client):
    r = client.post("/notes/", json={"title": "", "content": "test"})
    assert r.status_code == 422


def test_get_note_not_found(client):
    r = client.get("/notes/99999")
    assert r.status_code == 404
    data = r.json()
    assert data["ok"] is False
    assert data["error"]["code"] == "NOT_FOUND"


def test_update_note_not_found(client):
    r = client.put("/notes/99999", json={"title": "test"})
    assert r.status_code == 404


def test_delete_note_not_found(client):
    r = client.delete("/notes/99999")
    assert r.status_code == 404


def test_action_item_not_found(client):
    r = client.put("/action-items/99999/complete")
    assert r.status_code == 404


def test_tag_not_found(client):
    r = client.delete("/tags/99999")
    assert r.status_code == 404


def test_bulk_complete_not_found(client):
    r = client.post("/action-items/bulk-complete", json={"ids": [99999]})
    assert r.status_code == 404
    data = r.json()
    # Error response may be in detail or in error.message
    assert "99999" in (data.get("detail") or data.get("error", {}).get("message", ""))


def test_search_pagination(client):
    r = client.get("/notes/?page=1&page_size=5")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


def test_search_no_results(client):
    r = client.get("/notes/search/?q=nonexistent")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 0


def test_create_duplicate_tag(client):
    r = client.post("/tags/", json={"name": "test"})
    assert r.status_code == 201
    r = client.post("/tags/", json={"name": "test"})
    assert r.status_code == 400