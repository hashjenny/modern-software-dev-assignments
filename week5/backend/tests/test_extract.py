from backend.app.services.extract import extract_action_items


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


def test_extract_content():
    from backend.app.services.extract import extract_content

    text = "This is a #python note with - [ ] an action item"
    result = extract_content(text)
    assert "python" in result.tags
    assert "an action item" in result.action_items
