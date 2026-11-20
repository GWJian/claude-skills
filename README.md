# claude-skills

Personal [Claude Code](https://claude.com/claude-code) skills marketplace. Each skill is its own plugin — install only what you need.

## Install

```
claude plugin marketplace add GWJian/claude-skills
claude plugin install ui-redesign@gwj-skills
claude plugin install spec-docs@gwj-skills
claude plugin install multi-agent@gwj-skills
```

Install any of them, or none — each plugin is independent.

## ui-redesign

Research-driven redesign of ONE messy screen. Docs only — it never touches app code.

It interviews you to lock scope, analyzes the screen's code, screenshots the live app (when running), researches design patterns, and confirms the diagnosis and direction with you. Then it delivers a `docs/<target>_redesign/` folder with a design doc, plus a mockup you can open and judge: a self-contained HTML file or a Design canvas, your choice.

**Use it when** a core screen is genuinely cluttered and you need a proposal (doc + mockup) to show others before touching code. For small tweaks — like moving one button — just edit the code directly; the full pipeline is slower than the change itself.

Trigger with `/ui-redesign`, or just complain that a screen is messy.

## spec-docs

Docs first, code second. Before coding a feature, it researches your codebase, interviews you to lock decisions (scope, core behavior, edge cases, ownership), then generates a `docs/<feature>/` folder you build from:

| Doc | What it is |
|-----|------------|
| `01` feature spec | The ticket — summary, flow, edge cases, and a LOCKED decision table |
| `02` implementation plan | The blueprint — verified current-state inventory + schema/UI design |
| `03` user journey | Per-role walkthrough of the whole feature, plus FAQ *(optional — only when ≥2 roles have meaningfully different journeys)* |
| `04` phase tracker | Checkbox construction schedule — the single source of truth for progress |
| `docs/backlog.md` | The project's one planning doc, outside the feature folder — see [The backlog](#the-backlog) |

Scales by feature size: large features get `01` + `02` + `04` (plus `03` only for genuinely multi-role features), medium get `01` + `04`, trivial ones skip the workflow entirely.

Already have a spec or hand-off doc for the feature? It isn't regenerated: the doc is read, compared with the templates, and only the gaps are reported.

Each `01` opens with a "read this first" status table, so a new chat can pick the feature up. Later requirement changes are added as dated Rev notes; locked decisions are never edited silently.

**Use it when** a feature has real decisions to lock (cross-system, schema changes, multiple roles).

Already planned on a Design canvas (UI + a DECISIONS note)? Pass the link; it's copied into the docs and only the gaps are asked.

Trigger with `/spec-docs <feature-name>`, or just ask for spec-driven docs before coding.

### The backlog

spec-docs keeps one planning doc per project, `docs/backlog.md`, with four sections: Built so far, Next features, Known issues, Left out on purpose.

| When | What happens to `docs/backlog.md` |
|------|-----------------------------------|
| First run, file missing | Created from a template, with this feature as the first row of Next features |
| Later runs | Read only, as research input: what is built, what earlier features decided |
| While the feature is being built | Not touched — `docs/<feature>/` is the truth |
| After the feature is committed, when you ask | The feature's docs are folded in (a Built so far row pointing at the commit, deferred decisions, unfixed issues), then `docs/<feature>/` is deleted; it stays readable in git |

## multi-agent

Runs one coding task with up to 4 parallel worker subagents, under fixed rules:

- Worker model: on the first run in a project it asks once — all opus · xhigh, per part (opus for hard parts, sonnet for simple ones), or all sonnet · high — and saves the answer in `CLAUDE.local.md`. The review always runs on opus · high.
- Preflight: files you had already changed before the run are listed and left out of the workers' files, the diff checks and the review.
- Small or tightly linked tasks are done without workers.
- Each worker owns a list of files and touches nothing else. Shared files (translations, routes, docs) are edited only by the main chat, from data files the workers leave in the scratchpad.
- Workers run one quick check (lint). The main chat runs the full check (build + lint) once, reads every worker's real diff, and fixes what fails. A check with no real output counts as not run and is reported as unverified, never as passed.
- Every code step ends with one fresh `/code-review` that also gets the spec references, to catch missed requirements.

Project values (shared files, check commands, where the specs live) come from a "Multi-agent" section in the project's `CLAUDE.md` or `CLAUDE.local.md`:

```
## Multi-agent
- Shared files (main chat only): `src/i18n/*.json`, `src/App.tsx`, docs
- Worker check: `npm run lint`. Final check: `npm run build` + `npm run lint`
- Spec references in briefs: 01/02 § of `docs/<feature>/`
```

No section? It reads the commands from `package.json` and says which values it picked.

Runs only when you type `/multi-agent <task>`; Claude never starts it on its own.

## Update (after pushing changes)

```
claude plugin marketplace update gwj-skills
```
