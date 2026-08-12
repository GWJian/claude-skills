# claude-skills

Personal [Claude Code](https://claude.com/claude-code) skills marketplace. Each skill is its own plugin — install only what you need.

## Skills

| Plugin | What it does |
|--------|--------------|
| `ui-redesign` | Research-driven UI/UX redesign of one screen — code analysis, live screenshots, pattern research, then a design doc + HTML mockup. Docs only, never touches app code. |
| `spec-docs` | Spec-Driven Development four-document workflow — research, interview to lock decisions, then generate feature spec, implementation plan, user journey, and phase tracker. |

## Install

```
claude plugin marketplace add GWJian/claude-skills
claude plugin install ui-redesign@gwj-skills
claude plugin install spec-docs@gwj-skills
```

Install one, both, or neither — each plugin is independent.

## Update (after pushing changes)

```
claude plugin marketplace update gwj-skills
```
