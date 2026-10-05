---
name: spec-docs
description: Drive the Spec-Driven Development doc workflow (2-4 docs) for a new feature - research the codebase, interview the user to lock decisions, then generate docs/<feature>/ containing 01 feature spec (with LOCKED decision table), 02 implementation plan, 03 user journey (optional - multi-role features only), 04 phase tracker. Use when the user invokes /spec-docs, says "spec 流程", "四文档", "spec-driven", or asks to write requirement/design docs before coding a feature, or hands over a Design canvas link to turn into docs.
---

Drive the Spec-Driven Development (SDD) workflow: docs first, lock them, then code follows the docs. The deliverable is a `docs/<feature_name>/` folder with numbered documents containing **complete content — never empty skeletons**.

## Step 1 — SETUP

- Take the feature name from the arguments (convert to snake_case). If missing, ask for it.
- Decide the document set by feature size (ask if unclear):
  - **Large** (cross-repo / cross-system / multi-role / schema changes) → 01 + 02 + 04. Add 03 **only if** the feature has ≥2 distinct user roles whose journeys differ meaningfully (e.g. admin configures, customer consumes, and the flows interact) — otherwise skip 03 and cover per-role steps in 01's Flow section.
  - **Medium** (single-repo feature that still has decisions to lock) → 01 + 04 only. With no 02, 04 points to 01 (Decisions, Acceptance criteria) instead of 02 §, and 01's **Plan (02)** row says `n/a (medium)`.
  - **Trivial** (done within a day, no decisions) → say so and recommend skipping this workflow; just do the change.
  - **Already documented** (a spec or hand-off doc for this feature already exists in `docs/`) → do **not** regenerate or re-interview. Read it, map its sections onto the templates below, report the gaps in one short table, and stop. If the user wants them filled, edit that doc with a Rev note at the top. A different file layout alone is not a gap.
  - **Canvas exists** (the user gives a claude.ai Design canvas link with the UI and a DECISIONS note) → proceed from it. Read it read-only with the Artifact tool: `project/canvas.json` (sticky notes + board titles), then the `.dc.html` of the non-UI boards (DB, flows). Pick the document set by size as above. More than one canvas (e.g. a counter-proposal) → ask which one was chosen.

## Step 2 — RESEARCH (before writing anything)

- Read the relevant code, check the real database schema (use MCP tools when available), and inventory what already exists to reuse: tables, services, components, patterns.
- When a decision hinges on data that can differ per environment (existing rows and their ids, flags, deployed function versions), verify it read-only on the environment the feature ships to as well, not only on dev.
- Record findings as **verified facts** — they become 02's current-state inventory. Never design from assumptions.
- Any question answerable from the codebase must be answered by exploring it, not by asking the user.
- Facts on a canvas ("exists", "verified", row ids, function names) are claims: verify each before it goes into 02 §3.

## Step 3 — INTERVIEW (lock the decisions)

- From a canvas: pre-fill the decisions from its DECISIONS note and interview only the checklist items below that it does not answer.
- Interview the user one decision at a time, numbered (1/, 2/, 3/ …), each with a recommended answer and the reason, options labeled (a, b, c).
- Cover at least: scope (what's in / out / deferred), core behavior rules, eligibility & validation, edge cases & failure handling, abuse/fraud concerns, what must be configurable without a deploy, limits/caps, **notifications** (who is told what, when, through which channel and in which language; "nobody" is a valid answer), **finding it again** (after the main flow, how each role gets back to the result: history list, menu entry, deep link, admin filter), and which repo/service owns each part.
- Compile everything into a **Decisions (LOCKED)** table and show it for final confirmation before generating any document.

## Step 4 — GENERATE

Create `docs/<feature_name>/` and write the documents with full content following the templates below. Then report a short summary and point to Phase 1 of 04 as the next step.

**From a canvas** — copy its text into the docs, link its screens by board title (never transcribe a mockup):

| Canvas | Goes to |
|---|---|
| DECISIONS note | 01 Decisions (LOCKED) |
| Flow / per-role notes, rows of screens | 01 Flow (03 if multi-role), screens linked by board title |
| Small details: resolved ones / open ones | 01 Decisions / 01 Edge cases |
| Model / reuse notes | 02 §3, after verifying |
| Behavior-rule notes (capacity, refund, check-in …) | 02 §4.4; any rule the user chose also in 01 Decisions |
| DB boards (tables, RPCs, triggers, flows) | 02 §4, incl. the functions table with error codes |
| Phasing (v1.5, v2 …) | 02 §8 Deferred |
| "Not taken, and why" (from another canvas) | 02 §7 |

Then add what a canvas lacks: acceptance criteria, 02 §4.5 manual steps (collect any per-environment URL or secret the boards mention), 02 §6 verification, and 04.

## Standing rules

- Documents are written in **English**; converse with the user in their language.
- A requirement change later = add a **Rev note** at the top of 01/02 (`**Rev YYYY-MM-DD (a):** what changed and why`) and update the body to match — never rewrite from scratch, never silently edit locked decisions. One line per rev, newest first, directly under the status table; the **Last updated** cell names only the latest rev. The Design artifacts sync log keeps the same order.
- 04 is the single source of truth for progress: during implementation, tick its checkboxes and update the status table as items complete.
- Slice phases so each is independently verifiable; backend before UI; verification as its own phase; every phase ends with a one-line objective **Done when**; the manual steps from 02 §4.5 appear as their own checkbox items so they are not lost at promotion.
- In 04, reference 02's sections by § number instead of duplicating content.
- spec-docs does not draw wireframes. If the feature has a UI and no design exists yet, say so in 01 "Design artifacts" and suggest /ui-redesign or a Design canvas.

## Templates

### 01 — `01-<feature_name>.md` (feature spec ≈ a ClickUp ticket in its complete form)

```markdown
# <Feature name>

**Type:** Feature
**Priority:** TBD

> **Read this first if you pick this feature up in a new chat.**

| | |
|---|---|
| **Design (mockups)** | ⬜ none / ✅ canvas or 2D docs, see Design artifacts |
| **Plan (02)** | Draft / Decisions locked |
| **Implementation** | ❌ **NOT STARTED** until code lands, then "see 04" |
| **Last updated** | YYYY-MM-DD, one line on the latest rev |
<!-- On requirement changes add a Rev note here: **Rev YYYY-MM-DD (a):** what changed and why -->

## Summary
One paragraph: what, for whom, to what effect.

## User story
As a <role>, I want <action> so <benefit>.

## Flow
1. Step one
2. Step two

## Design artifacts
<!-- Only when the feature has a UI. Backend-only features omit this section. -->
- **Where the design lives:** a Claude Design canvas (URL with share key), a `docs/<target>_redesign/` folder (ASCII wireframes in its 01 doc + `mockup.html`, from /ui-redesign), or 2D ASCII wireframes inline here. Write "none yet" if nothing exists.
- **How to edit it:** for a canvas, the Artifact tool steps (read the URL, then `project/canvas.json` and `project/<Name>.dc.html`, republish to the same URL). For local files, the paths.
- **Sync log:** one line per sync, `YYYY-MM-DD (rev N): what changed on the design`, so the design and the spec never drift silently. Docs built from a canvas start it with `YYYY-MM-DD (rev N): imported into docs from version <id>`; a later canvas change = a Rev note in 01/02 plus a sync-log line. spec-docs never writes to the canvas.
- All values on mockups are sample values.

## Decisions (LOCKED)
| # | Decision | Answer |
|---|----------|--------|
| 1 | Scope | … |

## Edge cases
- Edge case one

## Acceptance criteria
- [ ] Acceptance point one

## Related paths and tools
- Absolute repo paths, and who owns each part
- MCP tool per environment, and the target environment
- Deployed-only artefacts (edge functions, DB functions) and the tool that reads them
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
- Existing tables / functions / components to reuse. Each item names its source (`path:line`, DB object name, deployed edge-function name + version, or the query used) and the date verified.
- Also list what was checked and found **not** to need change, with the reason and source, so nobody re-investigates it.

## 4. Schema / backend design
### 4.1 Tables
### 4.2 Permissions (RLS etc.)
### 4.3 Config
### 4.4 Core functions / engine
One row per RPC, trigger or edge function:

| Function | Caller | Does | Error codes |
|---|---|---|---|

### 4.5 Manual steps per environment (not in migrations)
Secrets / vault entries, function env vars, hard-coded URLs or ids that differ between environments, third-party dashboard settings. One line each: what, where, who runs it, and what changes when promoting to the next environment. Write "none" if there are none.

## 5. Frontend / UI design
**Existing files to modify**
| File | Change (with ~line refs) |
|---|---|

**New files**
| File | Purpose, and the existing component it copies |
|---|---|

## 6. Verification plan
- Open with the test environment's constraints (payment sandbox behaviour, email sandbox recipients, test accounts and roles needed) so a failing check is not mistaken for a bug
- Group by layer: database first, then each repo
- Include at least one race, one permission-denied, and one wrong-state transition
- Each phase in 04 points here for its "Done when"

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
