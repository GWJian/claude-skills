---
name: spec-docs
description: Drive the Spec-Driven Development doc workflow (3-4 docs) for a new feature - research the codebase, interview the user to lock decisions, then generate docs/<feature>/ containing 01 feature spec (with LOCKED decision table), 02 implementation plan, 03 user journey (optional - multi-role features only), 04 phase tracker. Use when the user invokes /spec-docs, says "spec 流程", "四文档", "spec-driven", or asks to write requirement/design docs before coding a feature.
---

Drive the Spec-Driven Development (SDD) workflow: docs first, lock them, then code follows the docs. The deliverable is a `docs/<feature_name>/` folder with numbered documents containing **complete content — never empty skeletons**.

## Step 1 — SETUP

- Take the feature name from the arguments (convert to snake_case). If missing, ask for it.
- Decide the document set by feature size (ask if unclear):
  - **Large** (cross-repo / cross-system / multi-role / schema changes) → 01 + 02 + 04. Add 03 **only if** the feature has ≥2 distinct user roles whose journeys differ meaningfully (e.g. admin configures, customer consumes, and the flows interact) — otherwise skip 03 and cover per-role steps in 01's Flow section.
  - **Medium** (single-repo feature that still has decisions to lock) → 01 + 04 only
  - **Trivial** (done within a day, no decisions) → say so and recommend skipping this workflow; just do the change.

## Step 2 — RESEARCH (before writing anything)

- Read the relevant code, check the real database schema (use MCP tools when available), and inventory what already exists to reuse: tables, services, components, patterns.
- Record findings as **verified facts** — they become 02's current-state inventory. Never design from assumptions.
- Any question answerable from the codebase must be answered by exploring it, not by asking the user.

## Step 3 — INTERVIEW (lock the decisions)

- Interview the user one decision at a time, numbered (1/, 2/, 3/ …), each with a recommended answer and the reason, options labeled (a, b, c).
- Cover at least: scope (what's in / out / deferred), core behavior rules, eligibility & validation, edge cases & failure handling, abuse/fraud concerns, what must be configurable without a deploy, limits/caps, and which repo/service owns each part.
- Compile everything into a **Decisions (LOCKED)** table and show it for final confirmation before generating any document.

## Step 4 — GENERATE

Create `docs/<feature_name>/` and write the documents with full content following the templates below. Then report a short summary and point to Phase 1 of 04 as the next step.

## Standing rules

- Documents are written in **English**; converse with the user in their language.
- A requirement change later = add a **Rev note** at the top of 01/02 (`**Rev YYYY-MM-DD (a):** what changed and why`) and update the body to match — never rewrite from scratch, never silently edit locked decisions.
- 04 is the single source of truth for progress: during implementation, tick its checkboxes and update the status table as items complete.
- Slice phases so each is independently verifiable; backend before UI; verification as its own phase; every phase ends with a one-line objective **Done when**.
- In 04, reference 02's sections by § number instead of duplicating content.

## Templates

### 01 — `01-<feature_name>.md` (feature spec ≈ a ClickUp ticket in its complete form)

```markdown
# <Feature name>

**Type:** Feature
**Priority:** TBD
**Status:** Draft | Decisions locked — design ready
<!-- On requirement changes add a Rev note here: **Rev YYYY-MM-DD (a):** what changed and why -->

## Summary
One paragraph: what, for whom, to what effect.

## User story
As a <role>, I want <action> so <benefit>.

## Flow
1. Step one
2. Step two

## Decisions (LOCKED)
| # | Decision | Answer |
|---|----------|--------|
| 1 | Scope | … |

## Edge cases
- Edge case one

## Acceptance criteria
- [ ] Acceptance point one

## Related projects
- Which codebases / services are involved, and who owns what
```

### 02 — `02-<feature_name>_implementation_plan.md` (the blueprint)

```markdown
# <Feature name> — Implementation Plan

> Companion to 01 (the feature spec). This document is the **agreed design**, ready to build from.
> Current-state facts verified read-only against <environment>.

## 1. Context
Two or three sentences: background + what this document delivers.

## 2. Locked decisions
(Copy the decision table from 01, or reference it)

## 3. Current-state inventory (verified facts)
- Existing tables / functions / components to reuse — item by item, marked "verified"

## 4. Schema / backend design
### 4.1 Tables
### 4.2 Permissions (RLS etc.)
### 4.3 Config
### 4.4 Core functions / engine

## 5. Frontend / UI design
- Files to create/modify + existing components used as models

## 6. Verification plan
- How to prove it works (test steps)

## 7. Risks & notes

## 8. Deferred (explicitly not doing / doing later)
```

### 03 — `03-<feature_name>_journey.md` (walk it through, per role)

> **Optional** — only for multi-role features (see Step 1). If skipped, per-role steps live in 01's Flow section.

```markdown
# <Feature name> — Complete Journey

> Walk the whole feature through, per role. Companion to 01 (spec) and 02 (plan).

**One-liner:** the entire feature in one sentence.

## 👨‍💼 Role A's journey (e.g. Admin)
### Step 0 — …

## 🛒 Role B's journey (e.g. Customer)
### Step 1 — …

## ⚙️ System / engine view
- Event → what fires → result

## FAQ (from the roles' point of view)
| Question | Answer |
|---|---|
```

### 04 — `04-<feature_name>_phases.md` (the construction schedule)

```markdown
# <Feature name> — Coding Phase Tracker

> The construction schedule for 02 (the implementation plan); all § references point there.
> Update the checkboxes and status table as work progresses.

**Legend:** ⬜ Not started · 🔄 In progress · ✅ Done

## Status summary
| Phase | What | Status |
|---|---|---|
| 1 | Backend / schema | ⬜ |
| 2 | Backend verification | ⬜ |
| 3 | Service layer | ⬜ |
| 4 | UI | ⬜ |
| 5 | UI verification | ⬜ |

**Current phase:** not started

## Phase 1 — <name> — §4
- [ ] Task one
- [ ] Task two

**Done when:** an objective, verifiable completion criterion.

## Phase 2 — …
```
