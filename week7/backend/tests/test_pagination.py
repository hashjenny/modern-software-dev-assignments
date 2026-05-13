"""Tests for pagination and sorting in notes and action_items endpoints."""

from fastapi.testclient import TestClient

# --- Pagination tests for notes ---


def test_notes_pagination_default_limit(client: TestClient) -> None:
    """Test that default pagination returns correct number of items."""
    # Create 10 notes
    for i in range(10):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/")
    assert r.status_code == 200
    items = r.json()
    # Default limit is 50, we only have 10
    assert len(items) == 10


def test_notes_pagination_explicit_limit(client: TestClient) -> None:
    """Test pagination with explicit limit parameter."""
    # Create 15 notes
    for i in range(15):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"limit": 5})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 5


def test_notes_pagination_skip(client: TestClient) -> None:
    """Test pagination with skip parameter."""
    # Create 10 notes
    for i in range(10):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    # Get first page
    r1 = client.get("/notes/", params={"skip": 0, "limit": 5})
    assert r1.status_code == 200
    page1 = r1.json()

    # Get second page
    r2 = client.get("/notes/", params={"skip": 5, "limit": 5})
    assert r2.status_code == 200
    page2 = r2.json()

    # Pages should not overlap
    page1_ids = {item["id"] for item in page1}
    page2_ids = {item["id"] for item in page2}
    assert page1_ids.isdisjoint(page2_ids)


def test_notes_pagination_skip_beyond_total(client: TestClient) -> None:
    """Test that skip beyond total items returns empty list."""
    # Create 5 notes
    for i in range(5):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"skip": 100, "limit": 10})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 0


def test_notes_pagination_max_limit(client: TestClient) -> None:
    """Test that limit accepts the maximum allowed value (200)."""
    # Create 250 notes
    for i in range(250):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"limit": 200})
    assert r.status_code == 200
    items = r.json()
    # Should return up to 200 items
    assert len(items) == 200


def test_notes_pagination_limit_exceeds_max_rejected(client: TestClient) -> None:
    """Test that limit exceeding maximum (200) is rejected with 422."""
    client.post("/notes/", json={"title": "Test", "content": "Test"})
    r = client.get("/notes/", params={"limit": 500})
    assert r.status_code == 422  # FastAPI validates limit <= 200


def test_notes_pagination_zero_limit(client: TestClient) -> None:
    """Test pagination with zero limit returns empty."""
    client.post("/notes/", json={"title": "Test", "content": "Test"})
    r = client.get("/notes/", params={"limit": 0})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 0


# --- Sorting tests for notes ---


def test_notes_sort_ascending_by_created_at(client: TestClient) -> None:
    """Test sorting notes by created_at ascending."""
    # Create notes with different timestamps
    for i in range(5):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"sort": "created_at"})
    assert r.status_code == 200
    items = r.json()
    # Verify ascending order
    for i in range(len(items) - 1):
        assert items[i]["created_at"] <= items[i + 1]["created_at"]


def test_notes_sort_descending_by_created_at(client: TestClient) -> None:
    """Test sorting notes by created_at descending."""
    for i in range(5):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"sort": "-created_at"})
    assert r.status_code == 200
    items = r.json()
    # Verify descending order
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_notes_sort_ascending_by_title(client: TestClient) -> None:
    """Test that sorting by title falls back to default (unsupported field)."""
    titles = ["Zebra", "Apple", "Mango", "Banana"]
    for title in titles:
        client.post("/notes/", json={"title": title, "content": "Test"})

    r = client.get("/notes/", params={"sort": "title"})
    assert r.status_code == 200
    items = r.json()
    # title is not a sortable field, should fall back to desc created_at
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_notes_sort_descending_by_title(client: TestClient) -> None:
    """Test that sorting by -title falls back to default (unsupported field)."""
    titles = ["Zebra", "Apple", "Mango", "Banana"]
    for title in titles:
        client.post("/notes/", json={"title": title, "content": "Test"})

    r = client.get("/notes/", params={"sort": "-title"})
    assert r.status_code == 200
    items = r.json()
    # -title is not a sortable field, should fall back to desc created_at
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_notes_sort_invalid_field_fallback(client: TestClient) -> None:
    """Test that invalid sort field falls back to default (desc created_at)."""
    for i in range(5):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    r = client.get("/notes/", params={"sort": "invalid_field"})
    assert r.status_code == 200
    items = r.json()
    # Should fall back to descending created_at
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


# --- Pagination tests for action_items ---


def test_action_items_pagination_default_limit(client: TestClient) -> None:
    """Test that default pagination returns correct number of items."""
    for i in range(10):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 10


def test_action_items_pagination_explicit_limit(client: TestClient) -> None:
    """Test pagination with explicit limit parameter."""
    for i in range(15):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"limit": 5})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 5


def test_action_items_pagination_skip(client: TestClient) -> None:
    """Test pagination with skip parameter."""
    for i in range(10):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r1 = client.get("/action-items/", params={"skip": 0, "limit": 5})
    assert r1.status_code == 200
    page1 = r1.json()

    r2 = client.get("/action-items/", params={"skip": 5, "limit": 5})
    assert r2.status_code == 200
    page2 = r2.json()

    # Pages should not overlap
    page1_ids = {item["id"] for item in page1}
    page2_ids = {item["id"] for item in page2}
    assert page1_ids.isdisjoint(page2_ids)


def test_action_items_pagination_skip_beyond_total(client: TestClient) -> None:
    """Test that skip beyond total items returns empty list."""
    for i in range(5):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"skip": 100, "limit": 10})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 0


def test_action_items_pagination_max_limit(client: TestClient) -> None:
    """Test that limit accepts the maximum allowed value (200)."""
    for i in range(250):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"limit": 200})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 200


def test_action_items_pagination_limit_exceeds_max_rejected(client: TestClient) -> None:
    """Test that limit exceeding maximum (200) is rejected with 422."""
    client.post("/action-items/", json={"description": "Test"})
    r = client.get("/action-items/", params={"limit": 500})
    assert r.status_code == 422  # FastAPI validates limit <= 200


# --- Sorting tests for action_items ---


def test_action_items_sort_ascending_by_created_at(client: TestClient) -> None:
    """Test sorting action items by created_at ascending."""
    for i in range(5):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"sort": "created_at"})
    assert r.status_code == 200
    items = r.json()
    for i in range(len(items) - 1):
        assert items[i]["created_at"] <= items[i + 1]["created_at"]


def test_action_items_sort_descending_by_created_at(client: TestClient) -> None:
    """Test sorting action items by created_at descending."""
    for i in range(5):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"sort": "-created_at"})
    assert r.status_code == 200
    items = r.json()
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_action_items_sort_by_completed(client: TestClient) -> None:
    """Test that sorting by completed falls back to default (unsupported field)."""
    # Create mix of completed and incomplete items
    client.post("/action-items/", json={"description": "Incomplete 1"})
    item2 = client.post("/action-items/", json={"description": "Complete 1"}).json()
    client.put(f"/action-items/{item2['id']}/complete")
    client.post("/action-items/", json={"description": "Incomplete 2"})

    r = client.get("/action-items/", params={"sort": "completed"})
    assert r.status_code == 200
    items = r.json()
    # completed is not a sortable field, should fall back to desc created_at
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


def test_action_items_sort_invalid_field_fallback(client: TestClient) -> None:
    """Test that invalid sort field falls back to default (desc created_at)."""
    for i in range(5):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"sort": "invalid_field"})
    assert r.status_code == 200
    items = r.json()
    for i in range(len(items) - 1):
        assert items[i]["created_at"] >= items[i + 1]["created_at"]


# --- Combined pagination and sorting tests ---


def test_notes_pagination_with_sort(client: TestClient) -> None:
    """Test that pagination and sorting work together."""
    titles = ["Zebra", "Apple", "Mango", "Banana", "Cherry"]
    for title in titles:
        client.post("/notes/", json={"title": title, "content": "Test"})

    # Get first page sorted by created_at descending
    r = client.get("/notes/", params={"sort": "-created_at", "skip": 0, "limit": 2})
    assert r.status_code == 200
    page1 = r.json()

    # Get second page
    r = client.get("/notes/", params={"sort": "-created_at", "skip": 2, "limit": 2})
    assert r.status_code == 200
    page2 = r.json()

    # Combined results should be sorted by created_at descending
    all_timestamps = [item["created_at"] for item in page1 + page2]
    assert all_timestamps == sorted(all_timestamps, reverse=True)


def test_action_items_pagination_with_sort(client: TestClient) -> None:
    """Test that pagination and sorting work together for action items."""
    for i in range(6):
        client.post("/action-items/", json={"description": f"Item {i}"})

    r = client.get("/action-items/", params={"sort": "-created_at", "skip": 0, "limit": 3})
    assert r.status_code == 200
    page1 = r.json()

    r = client.get("/action-items/", params={"sort": "-created_at", "skip": 3, "limit": 3})
    assert r.status_code == 200
    page2 = r.json()

    # All items should be returned across pages
    all_ids = [item["id"] for item in page1 + page2]
    assert len(set(all_ids)) == 6


# --- Edge case tests ---


def test_notes_pagination_negative_skip(client: TestClient) -> None:
    """Test that negative skip is treated as 0."""
    client.post("/notes/", json={"title": "Test", "content": "Test"})
    r_negative = client.get("/notes/", params={"skip": -5, "limit": 10})
    assert r_negative.status_code == 200
    r_zero = client.get("/notes/", params={"skip": 0, "limit": 10})
    assert r_zero.status_code == 200
    assert r_negative.json() == r_zero.json()


def test_action_items_pagination_negative_skip(client: TestClient) -> None:
    """Test that negative skip is treated as 0."""
    client.post("/action-items/", json={"description": "Test"})
    r_negative = client.get("/action-items/", params={"skip": -5, "limit": 10})
    assert r_negative.status_code == 200
    r_zero = client.get("/action-items/", params={"skip": 0, "limit": 10})
    assert r_zero.status_code == 200
    assert r_negative.json() == r_zero.json()


def test_notes_search_with_pagination_and_sort(client: TestClient) -> None:
    """Test search, pagination and sorting combined."""
    # Create notes with searchable content
    for i, word in enumerate(["apple", "banana", "apple", "cherry", "apple"]):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"I like {word}"})

    # Search for "apple" sorted by title
    r = client.get("/notes/", params={"q": "apple", "sort": "-title", "limit": 10})
    assert r.status_code == 200
    items = r.json()
    assert all("apple" in item["content"].lower() for item in items)


def test_action_items_filter_completed_with_pagination(client: TestClient) -> None:
    """Test filtering by completed status with pagination."""
    # Create mix of completed and incomplete
    for i in range(5):
        client.post("/action-items/", json={"description": f"Incomplete {i}"})

    for i in range(5):
        item = client.post("/action-items/", json={"description": f"Complete {i}"}).json()
        client.put(f"/action-items/{item['id']}/complete")

    # Get only completed items with pagination
    r = client.get("/action-items/", params={"completed": True, "skip": 0, "limit": 3})
    assert r.status_code == 200
    items = r.json()
    assert all(item["completed"] for item in items)
    assert len(items) == 3
