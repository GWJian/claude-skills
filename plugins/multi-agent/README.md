# multi-agent

Runs one coding task with up to 4 parallel worker subagents. This page shows the flow as a picture. The full rules are in the [skill file](skills/multi-agent/SKILL.md).

## How it works

Three lanes: the helper on the left, the main chat in the middle, and the subagents it starts on the right.

```
HELPER (read only)        MAIN CHAT                         WORKERS AND REVIEWER
haiku · high              your session model                (subagents)

                              /multi-agent <task>
                                       ▼
                          ┌──────────────────────────┐
                          │ 1  VALUES + PREFLIGHT    │
                          │    git status, snapshot  │
                          └────────────┬─────────────┘
                                       ▼
┌──────────────────┐      ┌──────────────────────────┐
│ files, callers,  │<────>│ 2  SPLIT OR NOT          │─────> small or linked task:
│ git history      │      │    independent parts?    │       no workers. The main chat
└──────────────────┘      └────────────┬─────────────┘       does it, then goes to 6.
                                       ▼  2+ independent parts
                          ┌──────────────────────────┐
                          │ 3  ANNOUNCE              │
                          │    who, files, models    │
                          └────────────┬─────────────┘
                                       ▼
┌──────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│ boards, old code │<────>│ 4  BRIEF + START WORKERS │─────>│ W1  W2  W3  W4   (max 4) │
│ pattern example  │      │    shared names first    │      │ hard part: opus · high   │
└──────────────────┘      └────────────┬─────────────┘      │ simple:    sonnet · high │
                                       │                    │ self-check, then report  │
                                       │                    └────────────┬─────────────┘
                                       │                                 │ reports
                                       ▼                                 │
┌──────────────────┐      ┌──────────────────────────┐                   │
│ errors in a long │<────>│ 5  AFTER THE WORKERS     │<──────────────────┘
│ log, by file     │      │    wait for every worker │
└──────────────────┘      │    read source diffs     │
                          │    merge shared files    │      ┌──────────────────────────┐
                          │    final check x1        │      │ RETRY, one step up:      │
                          │    fail -> retry, max 2  │─────>│ sonnet · high            │
                          │    UI check (screens)    │─┐    │  -> opus · medium        │
                          └────────────┬─────────────┘ │    │  -> opus · high          │
                                       │               │    │  -> fable · medium       │
                                       │               │    │ then the main chat       │
                                       │               │    └──────────────────────────┘
                                       │               │    ┌──────────────────────────┐
                                       │               └───>│ CHECKERS sonnet · high   │
                                       │                    │ 1-2 screens each, max 3  │
                                       │                    │ pass/fail with evidence  │
                                       │                    └──────────────────────────┘
                                       ▼
                          ┌──────────────────────────┐      ┌──────────────────────────┐
                          │ 6  REVIEW                │─────>│ REVIEWER, fresh subagent │
                          │    fix confirmed bugs    │<─────│ 1st: opus · high         │
                          │    final check again     │      │ 2nd: opus · medium       │
                          └────────────┬─────────────┘      │   only if a fix changed  │
                                       ▼                    │   behavior; never a 3rd  │
                          ┌──────────────────────────┐      └──────────────────────────┘
                          │ 7  REPORT + token table  │
                          │    then wait "go"        │
                          └──────────────────────────┘
```

### The steps

1. **Values and preflight.** The main chat reads the "Multi-agent" section of the project's `CLAUDE.md` and `CLAUDE.local.md`. `git status` lists the files you already changed: they are left alone. `git stash create` takes a snapshot. It changes no file, and step 5 compares against it to see exactly what the run changed.
2. **Split or not.** A small task, or parts that depend on each other: no workers start. The main chat does the task itself, runs the final check, and goes straight to step 6. 2+ independent parts: one worker per part, 4 at most. More than 4 parts are joined until 4 are left, unless you ask for more workers in that run. With the optional `graphify` code map, the main chat first looks for links the file names do not show.
3. **Announce.** Before any worker starts, the main chat says how many workers, what each one does, which files it owns, and its model.
4. **Brief and start the workers.** A helper first reads the long reference material (design boards, old code) and returns a short digest. The main chat then settles what the parts share (names, interfaces), checks each decision against real data, and names which part owns each shared concern. All workers start in one message, so they run in parallel. The rules that are the same for every worker are in [worker-rules.md](skills/multi-agent/worker-rules.md), so each brief holds only its own parts. Each worker edits only its own files, runs only the worker check, checks its work against the finish line and the spec, and writes a short report to the scratchpad. The report also says which decisions the worker made itself, and why.
5. **After the workers.** The main chat waits until every worker has replied. It then compares against the snapshot to see whether a worker left its files, reads every real source diff and not only the report, merges the shared files, and runs the final check (build, lint, tests) once. A part that fails is retried twice at most. A restart goes to a new worker one step up the ladder, and its brief starts with a handoff: what was wrong, the last worker's report, and the files as they were left. When the step changes a screen, checker subagents (one per 1 or 2 screens, 3 at most) open them and check the finish line before the review. They read the page as text and take a screenshot only for how something looks. A retry goes to a fresh checker with only the failed lines. The main chat never drives the browser itself.
6. **Review.** A fresh subagent runs `/code-review high`, or the command set in `Review command` (for example `/ponytail-review`), and gets the spec too. The reviewer changes no project file, and writes its findings, with those of any agent its review command starts, to one file in the scratchpad. The main chat fixes only the bugs it confirms in this step's change; small suggestions, and bugs that were there before, go in the report for you to decide. If a fix changed behavior, one smaller second review looks at the fixes only. There is never a third.
7. **Report.** The main chat reports what happened, adds a token table per agent from [run_stats.py](skills/multi-agent/run_stats.py), then waits for your "go".

### Why the main chat stays small

Every main-chat turn re-sends the whole chat, so its cost grows with each turn. In past runs the main chat used about 65% of all tokens. So long reading goes to helpers, browser checks go to small checkers, and the main chat decides, merges, fixes and checks.

### Who runs on which model

| Who | Model | What it does |
|---|---|---|
| Main chat | The model of your session | Runs the steps. Only it edits shared files and runs the final check. |
| Helper | haiku · high | Read-only lookups with a lot to read and a short answer: a digest of design boards or old code before the briefs, files across many folders, the errors in a long log. It returns pointers, and the main chat reads the real file or log lines itself. Renames and every other file change stay with the main chat or the worker that owns the file. |
| Workers | The `Worker model` line in `CLAUDE.local.md`: all opus · high, per part (as drawn), or all sonnet · high | Build their own files. A worker that left listable work undone is resumed. Any other failed part is started again one step up the ladder: sonnet · high → opus · medium → opus · high → fable · medium. After two retries, or past the top of the ladder, the main chat fixes the part or takes it to you. |
| Checker | sonnet · high | When a step changes a screen: one per 1 or 2 screens, 3 at most. Opens them before the review and returns pass or fail for each line of the finish line, with evidence. Changes no file. |
| Reviewer | opus · high. Second review: opus · medium | Reviews the whole step's change, then only the fixes. |

## Who can change which files

All workers share one project folder. File ownership keeps them apart:

```
┌──────────┬──────────┬──────────┬──────────┬────────────────┬──────────────┐
│ W1 files │ W2 files │ W3 files │ W4 files │ SHARED FILES   │ YOUR EDITS   │
│ W1 only  │ W2 only  │ W3 only  │ W4 only  │ main chat only │ left alone   │
└──────────┴──────────┴──────────┴──────────┴────────────────┴──────────────┘

 worker ──> scratchpad data file ──> main chat ──> shared file
```

- **W1–W4 files**: every file has exactly one owner. A worker creates or edits only its own files.
- **Shared files**: translation files, the route file, docs, the package file and its lock file. A worker that needs to add to one writes a data file in the scratchpad, and the main chat merges it.
- **Your edits**: files you had already changed before the run. No worker gets them. If the task must change one, the main chat tells you before starting.

## Project values (optional)

Copy these into your project's `CLAUDE.md` (shared with the team) or `CLAUDE.local.md` (only you). Fill in the `<...>` parts. Every line is optional: a missing line falls back to the default in [SKILL.md](skills/multi-agent/SKILL.md) Step 1.

```markdown
## Multi-agent

- Shared files (main chat only): <files only the main chat edits: translations, routes, package and lock files, docs>
- Worker check: <one fast check each worker runs on its own files>
- Final check: <commands the main chat runs once at the end, in order>
- Spec references: <where the requirements live>
- Worker model: <all opus · high | per part | all sonnet · high>
- Code map: <graphify | false>
- Review command: <a review slash command | false>
```

- `Worker model` goes in `CLAUDE.local.md` only: it is personal (cost, plan limits). If it is missing, the skill asks once and saves it.
- `Review command` defaults to `/code-review high`.

Examples by stack:

| Value | Node / React | Flutter | Python |
|---|---|---|---|
| Shared files | `src/i18n/*.json`, `package.json`, `package-lock.json`, docs | `lib/l10n/*.arb`, `pubspec.yaml`, `pubspec.lock`, docs | `pyproject.toml`, the lock file, docs |
| Worker check | `npm run lint` | `dart analyze` | `ruff check` |
| Final check | `npm run build`, then `npm run lint`, then `npm test` | `flutter analyze`, then `flutter test` | `ruff check`, then `pytest` |
| Spec references | `01/02 § of docs/<feature>/` | same | same |

### Code graph (graphify)

Only with `Code map: graphify`. Needs the `graphify` command and a built graph (`/graphify .` in the repo it maps).

```markdown
## Code graph (graphify)

- Graph: <path to graph.json>
- Query: graphify query "<question>" --graph <graph path>
  (the same --graph for graphify explain "<symbol>" and graphify path "A" "B")
- Refresh after a pull, in the repo it maps: <refresh command>
- Maps code only: docs, images and SQL are not in the graph.
```

- `Graph`: this repo's graph is `graphify-out/graph.json`, and that is the default when the line is missing. It can also point to another repo, for example the old app a rewrite ports: use its absolute path.
- Refresh command: for example `GRAPHIFY_BACKEND=none graphify update .` (code only, no AI call).
- The skill reads only the `Graph:` line, under any heading, and passes `--graph` to every graphify command, its workers' too.
