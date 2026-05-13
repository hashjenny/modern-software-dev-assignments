def test_create_complete_list_and_patch_action_item(client):
    payload = {"description": "Ship it"}
    r = client.post("/action-items/", json=payload)
    assert r.status_code == 201, r.text
    item = r.json()
    assert item["completed"] is False
    assert "created_at" in item and "updated_at" in item

    r = client.put(f"/action-items/{item['id']}/complete")
    assert r.status_code == 200
    done = r.json()
    assert done["completed"] is True

    r = client.get("/action-items/", params={"completed": True, "limit": 5, "sort": "-created_at"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1

    r = client.patch(f"/action-items/{item['id']}", json={"description": "Updated"})
    assert r.status_code == 200
    patched = r.json()
    assert patched["description"] == "Updated"


def test_delete_action_item(client):
    payload = {"description": "To be deleted"}
    r = client.post("/action-items/", json=payload)
    assert r.status_code == 201
    item_id = r.json()["id"]

    r = client.delete(f"/action-items/{item_id}")
    assert r.status_code == 204

    r = client.get(f"/action-items/{item_id}")
    assert r.status_code == 404


def test_create_action_item_description_too_long(client):
    payload = {"description": "x" * 2001}
    r = client.post("/action-items/", json=payload)
    assert r.status_code == 422


def test_patch_action_item_description_too_long(client):
    payload = {"description": "Valid"}
    created = client.post("/action-items/", json=payload)
    item_id = created.json()["id"]

    r = client.patch(f"/action-items/{item_id}", json={"description": "x" * 2001})
    assert r.status_code == 422


def test_list_action_items_invalid_sort_falls_back_to_default(client):
    first = client.post("/action-items/", json={"description": "First"})
    second = client.post("/action-items/", json={"description": "Second"})
    first_id = first.json()["id"]
    second_id = second.json()["id"]

    r = client.get("/action-items/", params={"sort": "metadata"})
    assert r.status_code == 200
    ids = [item["id"] for item in r.json()]
    assert ids[0] == second_id
    assert ids[1] == first_id
