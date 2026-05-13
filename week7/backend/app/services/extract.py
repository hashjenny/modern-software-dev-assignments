import re
from dataclasses import dataclass


@dataclass
class ActionItem:
    description: str
    priority: str | None = None
    due_date: str | None = None
    assignee: str | None = None


# Priority markers
PRIORITY_PATTERNS = {
    "high": r"\b(P1|critical|urgent|ASAP|!!!)\b",
    "medium": r"\b(P2|important|!!)\b",
    "low": r"\b(P3|low|!)\b",
}

# Due date patterns: @date, due: YYYY-MM-DD, by YYYY-MM-DD, within N days
DUE_DATE_PATTERNS = [
    r"@(\d{4}-\d{2}-\d{2})",
    r"due[:\s]+(\d{4}-\d{2}-\d{2})",
    r"by\s+(\d{4}-\d{2}-\d{2})",
    r"within\s+(\d+)\s+days?",
]

# Assignee patterns: @user, assigned to: name, owner: name
ASSIGNEE_PATTERNS = [
    r"@([A-Za-z][A-Za-z0-9_]*)",
    r"assigned\s+to[:\s]+(\w+)",
    r"owner[:\s]+(\w+)",
]


def extract_action_items(text: str) -> list[ActionItem]:
    """
    Extract action items from text with structured metadata.

    Recognizes:
    - Lines starting with TODO: or ACTION: (case-insensitive)
    - Checkbox lines starting with [ ]
    - Lines ending with !
    - Priority markers: P1/P2/P3, critical, urgent, important, low
    - Due dates: @YYYY-MM-DD, due: YYYY-MM-DD, by YYYY-MM-DD, within N days
    - Assignees: @username, assigned to: name, owner: name
    """
    lines = [line.strip("- ") for line in text.splitlines() if line.strip()]
    results: list[ActionItem] = []

    for line in lines:
        normalized = line.lower()
        if not (
            normalized.startswith("todo:") or normalized.startswith("action:") or line.endswith("!")
            or normalized.startswith("[ ]")
        ):
            continue

        priority = _extract_priority(line)
        due_date = _extract_due_date(line)
        assignee = _extract_assignee(line)
        description = _strip_metadata(line)

        results.append(
            ActionItem(
                description=description,
                priority=priority,
                due_date=due_date,
                assignee=assignee,
            )
        )

    return results


def _extract_priority(line: str) -> str | None:
    for level, pattern in PRIORITY_PATTERNS.items():
        if re.search(pattern, line, re.IGNORECASE):
            return level
    return None


def _extract_due_date(line: str) -> str | None:
    for pattern in DUE_DATE_PATTERNS:
        m = re.search(pattern, line, re.IGNORECASE)
        if m:
            return m.group(1) if m.lastindex else m.group(0)
    return None


def _extract_assignee(line: str) -> str | None:
    for pattern in ASSIGNEE_PATTERNS:
        m = re.search(pattern, line, re.IGNORECASE)
        if m:
            return m.group(1) if m.lastindex and m.group(1) else m.group(0).lstrip("@")
    return None


def _strip_metadata(line: str) -> str:
    """Remove priority, due date, and assignee markers from description."""
    result = re.sub(r"\s+", " ", line).strip()
    for prefix in ("todo:", "action:"):
        if result.lower().startswith(prefix):
            result = result[len(prefix) :].strip()
    if result.startswith("[ ]"):
        result = result[3:].strip()
    if result.endswith("!"):
        result = result[:-1].rstrip()
    for pattern in PRIORITY_PATTERNS.values():
        result = re.sub(pattern, "", result, flags=re.IGNORECASE).strip()
    for pattern in DUE_DATE_PATTERNS:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE).strip()
    for pattern in ASSIGNEE_PATTERNS:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE).strip()
    return re.sub(r"\s+", " ", result).strip()
