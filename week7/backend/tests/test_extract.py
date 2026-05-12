from backend.app.services.extract import extract_action_items


def test_extract_action_items_basic():
    text = """
    This is a note
    - TODO: write tests
    - ACTION: review PR
    - Ship it!
    Not actionable
    """.strip()
    items = extract_action_items(text)
    descs = [item.description for item in items]
    assert "write tests" in descs
    assert "review PR" in descs
    assert "Ship it" in descs


def test_extract_priority():
    text = """
    TODO: Fix P1 bug critical!
    TODO: Do P2 task
    TODO: Review important doc
    """.strip()
    items = list(extract_action_items(text))
    priorities = {item.description.split()[0]: item.priority for item in items}
    assert priorities["Fix"] == "high"
    assert priorities["Do"] == "medium"
    assert priorities["Review"] == "medium"


def test_extract_due_date():
    text = """
    TODO: Send report due: 2026-06-30
    TODO: Review doc by 2026-07-15
    TODO: Follow up within 7 days
    TODO: Random note
    """.strip()
    items = {item.description.split()[0]: item.due_date for item in extract_action_items(text)}
    assert items["Send"] == "2026-06-30"
    assert items["Review"] == "2026-07-15"
    assert items["Follow"] == "7"


def test_extract_assignee():
    text = """
    TODO: Fix bug @alice
    TODO: Review PR assigned to: bob
    TODO: Update docs owner: carol
    """.strip()
    items = {item.description.split()[0]: item.assignee for item in extract_action_items(text)}
    assert items["Fix"] == "alice"
    assert items["Review"] == "bob"
    assert items["Update"] == "carol"


def test_strip_metadata_from_description():
    """Metadata markers should not appear in the plain description."""
    text = "TODO: P1 critical Fix login bug @alice due: 2026-06-01!"
    items = extract_action_items(text)
    assert len(items) == 1
    item = items[0]
    assert item.priority == "high"
    assert item.assignee == "alice"
    assert item.due_date == "2026-06-01"
    assert "P1" not in item.description
    assert "critical" not in item.description
    assert "@alice" not in item.description
    assert "due:" not in item.description
    assert item.description == "Fix login bug"
