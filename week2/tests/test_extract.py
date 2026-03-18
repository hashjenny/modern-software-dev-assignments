import os
import pytest

from ..app.services import extract as extract_module
from ..app.services.extract import extract_action_items, extract_action_items_llm


def test_extract_bullets_and_checkboxes():
    text = """
    Notes from meeting:
    - [ ] Set up database
    * implement API extract endpoint
    1. Write tests
    Some narrative sentence.
    """.strip()

    items = extract_action_items(text)
    assert "Set up database" in items
    assert "implement API extract endpoint" in items
    assert "Write tests" in items


def test_extract_action_items_llm_bullets(monkeypatch: pytest.MonkeyPatch):
    # AI-generated (Exercise 2): verifies happy-path structured JSON output.
    def fake_chat(**kwargs):
        # Return JSON array as required by extract_action_items_llm()
        return {"message": {"content": '["Set up database", "Write tests"]'}}

    monkeypatch.setattr(extract_module, "chat", fake_chat)

    text = """
    Notes:
    - [ ] Set up database
    1. Write tests
    """.strip()
    items = extract_action_items_llm(text)
    assert items == ["Set up database", "Write tests"]


def test_extract_action_items_llm_keyword_prefixes(monkeypatch: pytest.MonkeyPatch):
    # AI-generated (Exercise 2): validates cleanup of prefixes/bullets from model output.
    def fake_chat(**kwargs):
        # Include keyword prefixes and bullets in model output to ensure postprocess cleans them.
        return {
            "message": {
                "content": '["TODO: email Alice", "action: Prepare slides", "- [ ] Book room"]'
            }
        }

    monkeypatch.setattr(extract_module, "chat", fake_chat)

    text = """
    todo: email Alice
    action: Prepare slides
    next: book room
    """.strip()
    items = extract_action_items_llm(text)
    assert items == ["TODO: email Alice", "action: Prepare slides", "Book room"]


def test_extract_action_items_llm_empty_input(monkeypatch: pytest.MonkeyPatch):
    # AI-generated (Exercise 2): ensures empty input short-circuits before calling the model.
    called = {"n": 0}

    def fake_chat(**kwargs):
        called["n"] += 1
        return {"message": {"content": '["should not be called"]'}}

    monkeypatch.setattr(extract_module, "chat", fake_chat)

    assert extract_action_items_llm("") == []
    assert extract_action_items_llm("   \n  ") == []
    assert called["n"] == 0


def test_extract_action_items_llm_fallback_on_bad_json(monkeypatch: pytest.MonkeyPatch):
    # AI-generated (Exercise 2): ensures malformed LLM output triggers heuristic fallback.
    def fake_chat(**kwargs):
        # Not JSON; should trigger fallback to heuristic extraction.
        return {"message": {"content": "Sure! Here are some actions:\n- Set up database\n- Write tests"}}

    monkeypatch.setattr(extract_module, "chat", fake_chat)

    text = """
    Notes:
    - [ ] Set up database
    1. Write tests
    """.strip()
    items = extract_action_items_llm(text)
    assert "Set up database" in items
    assert "Write tests" in items
