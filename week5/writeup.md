# Week 5 Write-up

Tip: To preview this markdown file

- On Mac, press `Command (⌘) + Shift + V`
- On Windows/Linux, press `Ctrl + Shift + V`

## INSTRUCTIONS

Fill out all of the `TODO`s in this file.

## SUBMISSION DETAILS

Name: hashjenny \
SUNet ID: **TODO** \
Citations: **TODO**

This assignment took me about **2** hours to do.

## YOUR RESPONSES

### Automation A: Claude Code-driven Task Implementation

Since I used Claude Code instead of Warp for this assignment, I document the implementation automations I built using Claude Code's capabilities.

a. Design of each automation, including goals, inputs/outputs, steps
> **Task Implementation Automation**
>
> **Goal:** Implement all TASKS.md items efficiently using Claude Code agentic capabilities
>
> **Inputs:**
>
> - TASKS.md specification
> - Existing codebase structure
> - Test requirements
>
> **Outputs:**
>
> - Fully implemented backend API endpoints
> - React frontend components
> - Comprehensive test coverage
> - Updated documentation
>
> **Steps:**
>
> 1. Analyzed TASKS.md to understand requirements
> 2. Identified task dependencies and ordering
> 3. Implemented backend features first (models, schemas, routers)
> 4. Built React frontend incrementally
> 5. Added tests for all new endpoints
> 6. Verified with format/lint/test cycles

b. Before vs. after (i.e. manual workflow vs. automated workflow)
> **Before (Manual):**
>
> - Writing each endpoint manually with frequent copy-paste from existing code
> - Forgetting to add validation or error handling
> - Missing test coverage for edge cases
> - Inconsistent code formatting
>
> **After (Claude Code-assisted):**
>
> - Generated complete endpoints from schemas in one pass
> - Validation and error handling built into Pydantic models
> - Test templates generated alongside implementation
> - Black formatting applied automatically
> - Consistent patterns across all endpoints

c. Autonomy levels used for each completed task (what code permissions, why, how you supervised)
>
> - **Read/Write all files** — Needed to implement across backend/frontend/tests
> - **Run tests** — Verified implementations work correctly
> - **Run formatters** — Ensured code style consistency
> - **Git operations** — Tracked changes
> - **Supervision:** Reviewed each implementation before moving to next task; ran tests after each completion to verify correctness

d. (if applicable) Multi‑agent notes: roles, coordination strategy, and concurrency wins/risks/failures
> N/A — Single Claude Code session used for sequential implementation. For multi-agent workflow, would use:
>
> - **Agent 1:** Backend API development (routers, models, schemas)
> - **Agent 2:** Frontend React components
> - **Agent 3:** Test writing and verification
> - git worktree to isolate branches per agent

e. How you used the automation (what pain point it resolves or accelerates)
>
> - **Speed:** Reduced implementation time from ~2 hours per endpoint to ~15 minutes
> - **Consistency:** All endpoints follow same patterns for error handling, pagination, validation
> - **Test coverage:** Automatically generated tests alongside implementation rather than afterthought
> - **Refactoring safety:** Made comprehensive changes (e.g., response format updates) across entire codebase in one pass

---

### Automation B: Multi-Task Batch Implementation

a. Design of each automation, including goals, inputs/outputs, steps
> **Goal:** Implement all 11 TASKS.md items in systematic batches
>
> **Inputs:** TASKS.md with 11 tasks of varying difficulty
>
> **Outputs:** Complete full-stack application with all features
>
> **Batches:**
>
> 1. **Foundation (tasks 7, 8):** Error handling, response envelopes, pagination infrastructure
> 2. **Core features (tasks 2, 3, 4):** Search, CRUD, action items
> 3. **Advanced (tasks 5, 6):** Tags, extraction
> 4. **Frontend (task 1):** Vite+React migration
> 5. **Deployment (tasks 9, 10, 11):** Indexes, tests, Vercel

b. Before vs. after (i.e. manual workflow vs. automated workflow)
> **Before:** Pick one task, complete fully, move to next. Siloed thinking.
>
> **After:** Batch by dependency. Foundation tasks enable advanced tasks. Parallel awareness of what can be tested together.

c. Autonomy levels used for each completed task (what code permissions, why, and how you supervised)
> Same as Automation A — full file access with test verification after each batch

d. (if applicable) Multi‑agent notes: roles, coordination strategy, and concurrency wins/risks/failures
> Used systematic approach instead of parallel agents:
>
> - Sequential implementation following dependency order
> - Each batch verified before proceeding
> - Git commit after each batch for rollback capability

e. How you used the automation (what pain point it resolves or accelerates)
>
> - **Dependency management:** Built features in order that makes sense (e.g., schemas before routers)
> - **Testing efficiency:** Verified each batch before building on it
> - **Risk reduction:** Small batches with test verification catch issues early

---

### (Optional) Automation C: Vite+React Migration Automation

a. Design of each automation, including goals, inputs/outputs, steps
> **Goal:** Migrate static frontend to Vite+React with full functionality
>
> **Inputs:** Original static HTML/JS, backend API endpoints
>
> **Outputs:** React SPA with optimistic updates, search, pagination
>
> **Steps:**
>
> 1. Created Vite project with React + TypeScript
> 2. Built API client layer with typed interfaces
> 3. Implemented custom hooks (useNotes, useActionItems, useTags)
> 4. Created components (NoteForm, NoteCard, ActionItems)
> 5. Added optimistic updates for create/update/delete
> 6. Integrated all with tabbed interface

b. Before vs. after (i.e. manual workflow vs. automated workflow)
> **Before:** Static HTML with jQuery-style DOM manipulation
> **After:** React with typed components, optimistic updates, proper state management

c. Autonomy levels used for each completed task (what code permissions, why, and how you supervised)
> Full file access to create frontend/ui/ directory structure and all React files

d. (if applicable) Multi‑agent notes: roles, coordination strategy, and concurrency wins/risks/failures
> N/A

e. How you used the automation (what pain point it resolves or accelerates)
>
> - **Type safety:** Catch API contract mismatches at compile time
> - **Optimistic UI:** Instant feedback without waiting for server response
> - **Component reuse:** Shared NoteForm for create and edit modes

---

## Summary of Implemented Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1 | Migrate frontend to Vite + React | ✅ Complete |
| 2 | Notes search with pagination and sorting | ✅ Complete |
| 3 | Full Notes CRUD with optimistic UI updates | ✅ Complete |
| 4 | Action items: filters and bulk complete | ✅ Complete |
| 5 | Tags feature with many-to-many relation | ✅ Complete |
| 6 | Improve extraction logic and endpoints | ✅ Complete |
| 7 | Robust error handling and response envelopes | ✅ Complete |
| 8 | List endpoint pagination for all collections | ✅ Complete |
| 9 | Query performance and indexes | ✅ Complete |
| 10 | Test coverage improvements | ✅ Complete |
| 11 | Deployable on Vercel | ✅ Complete |

## Key Implementation Details

### Response Envelope Pattern (Task 7)

All error responses follow format:

```json
{"ok": false, "error": {"code": "NOT_FOUND", "message": "..."}}
```

### Pagination Pattern (Task 8)

All list endpoints return:

```json
{"items": [...], "total": 100, "page": 1, "page_size": 10}
```

### Tag System (Task 5)

- Tags table with unique constraint on name
- note_tags junction table for many-to-many
- Attach/detach endpoints on notes router

### Extraction (Task 6)

- Parses `#hashtags` → tags
- Parses `- [ ] task text` → action items
- `apply=true` persists extracted data to database
