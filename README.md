# claude-skills

Personal [Claude Code](https://claude.com/claude-code) skills marketplace. Each skill is its own plugin — install only what you need.

## Install

```
claude plugin marketplace add GWJian/claude-skills
claude plugin install ui-redesign@gwj-skills
claude plugin install spec-docs@gwj-skills
```

Install one, both, or neither — each plugin is independent.

## ui-redesign

Research-driven redesign of ONE messy screen. Docs only — it never touches app code.

It interviews you to lock scope, analyzes the screen's code, screenshots the live app (when running), researches design patterns, then delivers a `docs/<target>_redesign/` folder: a design doc + a self-contained HTML mockup you can open and judge.

**Use it when** a core screen is genuinely cluttered and you need a proposal (doc + mockup) to show others before touching code. For small tweaks — like moving one button — just edit the code directly; the full pipeline is slower than the change itself.

Trigger with `/ui-redesign`, or just complain that a screen is messy.

## spec-docs

Docs first, code second. Before coding a feature, it researches your codebase, interviews you to lock decisions (scope, core behavior, edge cases, ownership), then generates a `docs/<feature>/` folder you build from:

| Doc | What it is |
|-----|------------|
| `01` feature spec | The ticket — summary, flow, edge cases, and a LOCKED decision table |
| `02` implementation plan | The blueprint — verified current-state inventory + schema/UI design |
| `03` user journey | Per-role walkthrough of the whole feature, plus FAQ |
| `04` phase tracker | Checkbox construction schedule — the single source of truth for progress |

Scales by feature size: large features get all four docs, medium get `01` + `04`, trivial ones skip the workflow entirely.

**Use it when** a feature has real decisions to lock (cross-system, schema changes, multiple roles).

Trigger with `/spec-docs <feature-name>`, or just ask for spec-driven docs before coding.

## Update (after pushing changes)

```
claude plugin marketplace update gwj-skills
```
