# Search Enhancement Design (NoteHub Blazor)

## Context
Current search is a simple substring match on title/content and only returns a list of notes. It has no tokenization, ranking, or highlighting.

## Goals
- Case-insensitive search across title and content.
- Multi-keyword AND matching (all tokens must match).
- Ranked results (title hits weighted higher), then by UpdatedAt.
- Keyword highlighting and short snippet preview.
- Keep existing `/search?q=` route and UI structure.

## Non-Goals
- Fuzzy matching / typo correction.
- Advanced filters (category/date) or full-text indexing.
- Backend API changes beyond NoteService.SearchAsync logic.

## UX & Behavior
- Search box retains the query and supports Enter key.
- Results count remains visible for non-empty queries.
- Empty query shows guidance and does not trigger search.
- Result card shows title, category, date, and a short highlighted excerpt.

## Data & Algorithm
1. Normalize query: `Trim`, split by whitespace, drop empty tokens.
2. Database filter: for each token, apply `WHERE title OR content LIKE %token%` (case-insensitive).
3. Fetch filtered results, compute relevance score in memory:
   - Title hit: +2
   - Content hit: +1
4. Sort by `score DESC`, then `UpdatedAt DESC`.

## Highlighting & Snippets
- Encode content with `HtmlEncode` before highlighting.
- Wrap matched tokens with `<mark>`.
- Snippet: take ~120 chars around first match (fallback to start of content).
- Render highlights via `MarkupString` to avoid double-encoding.

## Error Handling
- Empty/whitespace query returns empty results without errors.
- No broad try/catch; rely on Blazor error surfacing for unexpected failures.

## Testing (Manual)
- Create notes with overlapping keywords in title/content.
- Search with single/multiple tokens and verify AND behavior.
- Verify ordering (title match appears above content-only match).
- Verify highlights and snippet rendering.
