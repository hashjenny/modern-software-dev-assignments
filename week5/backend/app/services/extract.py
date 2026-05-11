import re
from dataclasses import dataclass


@dataclass
class ExtractionResult:
    tags: list[str]
    action_items: list[str]


def extract_action_items(text: str) -> list[str]:
    """Extract action items from text.

    Parses lines that:
    - End with "!" (exclamation mark)
    - Start with "todo:" (case-insensitive)

    Each line has "- " prefix stripped before processing.
    """
    lines = [line.strip("- ") for line in text.splitlines() if line.strip()]
    return [line for line in lines if line.endswith("!") or line.lower().startswith("todo:")]


def extract_content(text: str) -> ExtractionResult:
    """Extract hashtags and action items from text content.

    Parses:
    - #hashtags -> tags
    - - [ ] task text -> action items (unchecked checkboxes)
    """
    tags = list(set(re.findall(r"#(\w+)", text)))
    action_items = list(set(re.findall(r"- \[ \] (.+)", text)))
    return ExtractionResult(tags=tags, action_items=action_items)
