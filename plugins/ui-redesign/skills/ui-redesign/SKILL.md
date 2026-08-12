---
name: ui-redesign
description: Research-driven UI/UX redesign of one screen/view - explore its code, screenshot the live app, research design patterns (web/Mobbin), interview the user to lock scope, then deliver a design doc + self-contained HTML mockup under docs/<target>_redesign/. DOCS ONLY - never changes app code. Use when the user invokes /ui-redesign, asks to redesign a screen, or complains a screen is messy/cluttered/too busy.
---

Redesign ONE screen or view through research, not guesswork. The deliverable is a
`docs/<target>_redesign/` folder: a design doc + an HTML mockup the user can open and judge.

## HARD RULE — DOCS ONLY
Never modify app code (`lib/`, `src/`, etc.) in this workflow. Implementation happens only
as a separate task the user explicitly requests after approving the design. Verify at the
end: `git status` may show only new files under `docs/<target>_redesign/`. Never commit.

## Step 1 — SCOPE (ask unless given)
Checklist — ask ONLY the items the user's request didn't already answer, numbered, options
labeled (a/b/c) with a recommendation each:
1. Target: which screen/view, and which role/variant if it has several?
2. Depth: declutter + reorganize (keep theme) vs full visual refresh?
3. Pain points (multi-select): too many sections · key info buried · visual noise · actions scattered?
Deliverable is never asked — it is always design doc + HTML mockup.

## Step 2 — RESEARCH (parallelize where possible)
a. **Code**: map the target screen — exact render order of sections, per-widget content and
   visual weight, conditional show/hide rules, every action and where it lives, state
   management, and whether the project has a theme/design-token layer (read the real colors
   for mockup fidelity). Use an Explore subagent for breadth; verify key files yourself.
b. **Live app**: if a running app/URL is reachable, screenshot the target screen end-to-end
   (scroll through all states you can reach). If not reachable, ask ONCE — start the app for
   live screenshots, or proceed from code only — then proceed either way. Screenshots catch
   problems code reading misses (overlaps, empty-state noise, real scroll length).
c. **Patterns**: WebSearch the app's category (e.g. "delivery driver app order details UX",
   Mobbin screen patterns, progressive disclosure). Extract concrete patterns, not platitudes.
   Keep source URLs for the doc.

## Step 3 — DESIGN
Build the proposal from research (a project UI/UX design agent may draft it if one exists;
otherwise design inline):
- 3-5 design principles specific to this screen.
- New information architecture: group sections into named zones by user task; a disposition
  table giving EVERY current section a fate (keep / merge / restyle / render-only-when-non-empty /
  collapse / move to overflow-menu-or-sheet / relocate) with a one-line reason.
- ASCII wireframes per key state (e.g. active vs completed), mobile width.
- Action consolidation table: every action, where it lives now vs after. One primary action
  surface; exception flows move to an overflow menu/sheet with clear labels.
- Empty/conditional render rules table.
- Visual-noise rules: tinted/emphasis treatments reserved for a small number of attention
  states; secondary content flattened to plain rows; count of bold headers reduced.
Sanity checks: nothing silently dropped (all sections in the disposition table); every
action has a new home; state-management/API layer untouched (presentation-only reorg).

## Step 4 — DELIVER
Create `docs/<target>_redesign/` (target in snake_case) with:
1. **`01-<target>-redesign.md`** — sections: Status (proposal, no code changed) · Problem &
   Diagnosis (evidence from code + screenshots) · Design Principles · New IA + disposition
   table · Wireframes · Action Consolidation · Empty/Conditional Rules · Visual Noise Rules ·
   Implementation Notes for the future task (what's reused unchanged, new components, restyles,
   screen-level changes — framework-appropriate) · Open Questions · Research Sources (links).
2. **`mockup.html`** — fully self-contained (inline CSS, no external requests, emoji glyphs
   for icons), side-by-side phone frames with internal scrolling: BEFORE (current, faithful to
   screenshots/code — include its real problems) and AFTER per key state. Use the project's
   actual theme colors. Annotate conditional elements ("only if non-empty") and add a short
   legend under each frame. To preview when file:// is blocked for browser automation, serve
   the folder (`python -m http.server <port>`) and screenshot it to verify rendering.

## Step 5 — REPORT
Summarize: key design moves, the before/after numbers (sections, screenfuls), how to open the
mockup, open questions. State explicitly that no code changed and nothing was committed.
Offer implementation as a separate follow-up — do not start it.

## Standing rules
- Docs in English; converse in the user's language.
- Design changes later get a Rev note at the top of 01 (`**Rev YYYY-MM-DD (a):** what/why`).
- One screen per run — if asked for several, do the most painful one first and say so.
