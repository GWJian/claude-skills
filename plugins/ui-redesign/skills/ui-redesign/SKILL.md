---
name: ui-redesign
description: Research-driven UI/UX redesign of one screen/view - lock scope with the user, explore its code, screenshot the live app, research design patterns (web/Mobbin), confirm the diagnosis and direction, then deliver a design doc under docs/<target>_redesign/ plus a mockup (self-contained HTML file or a Design canvas, the user picks). DOCS ONLY - never changes app code. Use when the user invokes /ui-redesign, asks to redesign a screen, or complains a screen is messy/cluttered/too busy. Not for small tweaks to a single element.
---

Redesign ONE screen or view through research, not guesswork. The deliverable is a
`docs/<target>_redesign/` folder with a design doc, plus a mockup the user can open and
judge: an HTML file in that folder, or a Design canvas linked from the doc.

## HARD RULE — DOCS ONLY
Never modify app code (`lib/`, `src/`, etc.) in this workflow. Implementation happens only
as a separate task the user explicitly requests after approving the design. Verify at the
end: `git status` may show only new files under `docs/<target>_redesign/`. Never commit.

## Step 1 — SCOPE (ask unless given)
First, right-size: if the request is a small tweak (one element moved, removed or
restyled), say this workflow is heavier than the change and ask whether the user wants a
direct code edit instead. If yes, stop this workflow; the edit is a normal coding task.

Checklist — ask ONLY the items the user's request didn't already answer, numbered, options
labeled (a/b/c) with a recommendation each:
1. Target: which screen/view, and which role/variant if it has several?
2. Depth: light declutter (hide, collapse, reorder) vs full reorganize (regroup sections
   into zones, move actions)?
3. Pain points (multi-select): too many sections · key info buried · visual noise · actions scattered?
4. Mockup format: self-contained HTML file (lives in the repo, opens offline) vs Design
   canvas (an Artifact on claude.ai — editable afterwards, shared by link)? Offer the
   canvas only when this session can create one (Artifact tool, Design type); if it
   cannot, say so and use HTML.
Theme, colors and typography stay as they are — a visual refresh is out of scope.
The design doc is always delivered; only the mockup format is asked.

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

## Step 3 — CONFIRM (always)
Before designing, show the user in chat:
- Diagnosis: the 3-5 biggest problems, each with its evidence (file:line or screenshot).
- 2-3 directions, one line each, with a recommendation.
Wait for the user's pick. Write no file before this.

## Step 4 — DESIGN
Build the direction the user picked, from research (a project UI/UX design agent may draft
it if one exists; otherwise design inline):
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

## Step 5 — DELIVER
Create `docs/<target>_redesign/` (target in snake_case) with:
1. **`01-<target>-redesign.md`** — sections: Status (proposal, no code changed; mockup file
   or canvas link) · Problem & Diagnosis (evidence from code + screenshots) · Design
   Principles · New IA + disposition table · Wireframes · Action Consolidation ·
   Empty/Conditional Rules · Visual Noise Rules · Implementation Notes for the future task
   (what's reused unchanged, new components, restyles, screen-level changes —
   framework-appropriate) · Open Questions · Research Sources (links).
2. **The mockup**, in the format chosen in Step 1. Either format shows side-by-side phone
   frames: BEFORE (current, faithful to screenshots/code — include its real problems) and
   AFTER per key state, in the project's actual theme colors, with conditional elements
   annotated ("only if non-empty") and a short legend under each frame.
   - **HTML** — `mockup.html`, fully self-contained (inline CSS, no external requests,
     emoji glyphs for icons), frames with internal scrolling. To preview when file:// is
     blocked for browser automation, serve the folder (`python -m http.server <port>`) and
     screenshot it to verify rendering.
   - **Design canvas** — a claude.ai Artifact. Create it with the Artifact tool (quickstart
     with intent `design`, then follow the instructions its result carries): one board per
     BEFORE/AFTER frame, titled by state. Put its claude.ai link in the 01 doc's Status
     section. No `mockup.html` is written.

## Step 6 — REPORT
Summarize: key design moves, the before/after numbers (sections, screenfuls), how to open the
mockup (file path or canvas link), open questions. State explicitly that no code changed
and nothing was committed.
Offer implementation as a separate follow-up — do not start it.

## Standing rules
- Docs in English; converse in the user's language.
- Design changes later get a Rev note at the top of 01 (`**Rev YYYY-MM-DD (a):** what/why`).
- One screen per run — if asked for several, do the most painful one first and say so.
