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
│ pattern example, │<────>│ 4  BRIEF + START WORKERS │─────>│ W1  W2  W3  W4   (max 4) │
│ API signature    │      │    shared names first    │      │ hard part: opus · xhigh  │
└──────────────────┘      └────────────┬─────────────┘      │ simple:    sonnet · high │
                                       │                    └────────────┬─────────────┘
                                       │                                 │ reports
                                       ▼                                 │
┌──────────────────┐      ┌──────────────────────────┐                   │
│ errors in a long │<────>│ 5  AFTER THE WORKERS     │<──────────────────┘
│ log, by file     │      │    read every real diff  │
└──────────────────┘      │    merge shared files    │
                          │    final check x1        │
                          │    fail -> retry once    │─────> resume, +1 effort,
                          └────────────┬─────────────┘       or opus · xhigh
                                       ▼
                          ┌──────────────────────────┐      ┌──────────────────────────┐
                          │ 6  REVIEW                │─────>│ REVIEWER, fresh subagent │
                          │    fix confirmed bugs    │<─────│ 1st: opus · high         │
                          │    final check again     │      │ 2nd: opus · medium       │
                          └────────────┬─────────────┘      │   only if a fix changed  │
                                       ▼                    │   behavior; never a 3rd  │
                          ┌──────────────────────────┐      └──────────────────────────┘
                          │ 7  REPORT -> wait "go"   │
                          └──────────────────────────┘
```

### The steps

1. **Values and preflight.** The main chat reads the "Multi-agent" section of the project's `CLAUDE.md` and `CLAUDE.local.md`. `git status` lists the files you already changed: they are left alone. `git stash create` takes a snapshot. It changes no file, and step 5 compares against it to see exactly what the run changed.
2. **Split or not.** A small task, or parts that depend on each other: no workers start. The main chat does the task itself, runs the final check, and goes straight to step 6. 2+ independent parts: one worker per part, 4 at most. With the optional `graphify` code map, the main chat first looks for links the file names do not show.
3. **Announce.** Before any worker starts, the main chat says how many workers, what each one does, which files it owns, and its model.
4. **Brief and start the workers.** The main chat first settles what the parts share (names, interfaces). All workers start in one message, so they run in parallel. Each worker edits only its own files, runs only the worker check, and writes its report to the scratchpad.
5. **After the workers.** The main chat compares against the snapshot to see whether a worker left its files, reads every real diff and not only the summary, merges the shared files, and runs the final check (build, lint, tests) once. A part that fails is retried once at most.
6. **Review.** A fresh subagent runs `/code-review high`, or the command set in `Review command` (for example `/ponytail-review`), and gets the spec too. The reviewer changes no project file, and writes its findings to the scratchpad. The main chat fixes only the bugs it confirms in this step's change; small suggestions, and bugs that were there before, go in the report for you to decide. If a fix changed behavior, one smaller second review looks at the fixes only. There is never a third.
7. **Report.** The main chat reports what happened, then waits for your "go".

### Who runs on which model

| Who | Model | What it does |
|---|---|---|
| Main chat | The model of your session | Runs the steps. Only it edits shared files and runs the final check. |
| Helper | haiku · high | Read-only lookups with a lot to read and a short answer: find files across many folders, find the errors in a long log. It returns pointers, and the main chat reads the real file or log lines itself. Renames and every other file change stay with the main chat or the worker that owns the file. |
| Workers | The `Worker model` line in `CLAUDE.local.md`: all opus · xhigh, per part (as drawn), or all sonnet · high | Build their own files. A part that fails is resumed, started again one effort level higher, or started again on opus · xhigh. |
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
