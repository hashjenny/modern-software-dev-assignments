from __future__ import annotations

import os
import re
from typing import List
import json
from typing import Any
from ollama import chat
from dotenv import load_dotenv

load_dotenv()

BULLET_PREFIX_PATTERN = re.compile(r"^\s*([-*•]|\d+\.)\s+")
KEYWORD_PREFIXES = (
    "todo:",
    "action:",
    "next:",
)


def _is_action_line(line: str) -> bool:
    stripped = line.strip().lower()
    if not stripped:
        return False
    if BULLET_PREFIX_PATTERN.match(stripped):
        return True
    if any(stripped.startswith(prefix) for prefix in KEYWORD_PREFIXES):
        return True
    if "[ ]" in stripped or "[todo]" in stripped:
        return True
    return False


def extract_action_items(text: str) -> List[str]:
    lines = text.splitlines()
    extracted: List[str] = []
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        if _is_action_line(line):
            cleaned = BULLET_PREFIX_PATTERN.sub("", line)
            cleaned = cleaned.strip()
            # Trim common checkbox markers
            cleaned = cleaned.removeprefix("[ ]").strip()
            cleaned = cleaned.removeprefix("[todo]").strip()
            extracted.append(cleaned)
    # Fallback: if nothing matched, heuristically split into sentences and pick imperative-like ones
    if not extracted:
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        for sentence in sentences:
            s = sentence.strip()
            if not s:
                continue
            if _looks_imperative(s):
                extracted.append(s)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: List[str] = []
    for item in extracted:
        lowered = item.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        unique.append(item)
    return unique


def _looks_imperative(sentence: str) -> bool:
    words = re.findall(r"[A-Za-z']+", sentence)
    if not words:
        return False
    first = words[0]
    # Crude heuristic: treat these as imperative starters
    imperative_starters = {
        "add",
        "create",
        "implement",
        "fix",
        "update",
        "write",
        "check",
        "verify",
        "refactor",
        "document",
        "design",
        "investigate",
    }
    return first.lower() in imperative_starters


# AI-generated (Exercise 1):
# Post-processing helper for LLM output. It normalizes bullet/checkbox formatting,
# drops empty values, and deduplicates results while preserving order.
def _postprocess_items(items: list[Any]) -> List[str]:
    extracted: List[str] = []
    for item in items:
        if item is None:
            continue
        s = str(item).strip()
        if not s:
            continue
        s = BULLET_PREFIX_PATTERN.sub("", s).strip()
        s = s.removeprefix("[ ]").strip()
        s = s.removeprefix("[todo]").strip()
        extracted.append(s)

    seen: set[str] = set()
    unique: List[str] = []
    for item in extracted:
        lowered = item.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        unique.append(item)
    return unique


def _parse_json_array_of_strings(maybe_json: str) -> list[Any] | None:
    try:
        parsed = json.loads(maybe_json)
        if isinstance(parsed, list):
            return parsed
        return None
    except json.JSONDecodeError:
        return None


def extract_action_items_llm(text: str) -> List[str]:
    """
    AI-generated (Exercise 1):
    Extract action items using a local Ollama model (structured output).

    Returns a deduplicated list of action-item strings. On model/output failure,
    falls back to heuristic `extract_action_items()` for backward compatibility.
    Modification summary:
    - Adds Ollama chat call with JSON schema-constrained output.
    - Parses/recover JSON from model output and post-processes extracted items.
    - Preserves previous behavior on errors by falling back to heuristic extraction.
    """
    text = str(text or "").strip()
    if not text:
        return []

    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    temperature = float(os.getenv("OLLAMA_TEMPERATURE", "0"))

    schema: dict[str, Any] = {
        "type": "array",
        "items": {"type": "string"},
    }

    messages = [
        {
            "role": "system",
            "content": (
                "You extract action items from notes.\n"
                "Return ONLY valid JSON that matches the provided schema.\n"
                "Action items must be concise, imperative, and self-contained.\n"
                "Do not include non-action narrative. Do not include numbering/bullets."
            ),
        },
        {"role": "user", "content": text},
    ]

    try:
        resp = chat(
            model=model,
            messages=messages,
            format=schema,
            options={"temperature": temperature},
        )
        content = (resp.get("message") or {}).get("content") or ""
        parsed = _parse_json_array_of_strings(content.strip())
        if parsed is None:
            # Attempt to recover if the model wrapped JSON in extra text.
            m = re.search(r"\[[\s\S]*\]", content)
            if m:
                parsed = _parse_json_array_of_strings(m.group(0))
        if parsed is None:
            return extract_action_items(text)
        return _postprocess_items(parsed)
    except Exception:
        return extract_action_items(text)
