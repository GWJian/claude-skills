# multi-agent

Runs one coding task with up to 4 parallel worker subagents. This page shows the flow as a picture. The full rules are in the [skill file](skills/multi-agent/SKILL.md).

## How it works

```
        /multi-agent <task>
                │
                ▼
┌────────────────────────────────┐
│ 1  VALUES + PREFLIGHT          │  read the "Multi-agent" section
│    git status  -> user's edits │  files you already changed: left alone
│    git stash create -> SNAP    │  snapshot, to compare against later
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│ 2  SPLIT OR NOT                │  optional graphify: find hidden links
└───────┬────────────────┬───────┘
        │ small / linked │ 2+ independent parts
        │                ▼
        │   ┌────────────────────────────┐
        │   │ 3  ANNOUNCE                │   how many workers, files, models
        │   ├────────────────────────────┤
        │   │ 4  BRIEF + START WORKERS   │   shared names + interfaces first
        │   └──┬───────┬───────┬───────┬─┘
        │      ▼       ▼       ▼       ▼     one message = parallel, max 4
        │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
        │   │ W1  │ │ W2  │ │ W3  │ │ W4  │  own files, worker check only
        │   └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
        │      └───────┴───┬───┴───────┘     reports go to the scratchpad
        │                  ▼
        │   ┌────────────────────────────┐
        │   │ 5  AFTER THE WORKERS       │
        │   │    diff vs SNAP: strays?   │   did a worker leave its files?
        │   │    read every real diff    │   the diff, not only the summary
        │   │    merge shared files      │   done by the main chat
        │   │    final check x1          │   build, lint, tests: run once
        │   │    fail -> retry once      │   each part once at most
        │   └──────────────┬─────────────┘
        │                  │
        └───────┬──────────┘
                ▼
┌────────────────────────────────┐
│ 6  REVIEW (fresh subagent)     │  opus · high, gets the spec too
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│ 7  REPORT -> wait for "go"     │
└────────────────────────────────┘
```

- **Left line**: a small task, or parts that depend on each other. The main chat does the task itself, runs the final check, and goes straight to step 6.
- **SNAP**: the snapshot from `git stash create`. It changes no file. Step 5 compares against it to see exactly what the run changed.
- **Step 6**: the review runs `/code-review high`, or the command set in `Review command` (for example `/ponytail-review`).
- **Step 7**: the main chat reports what happened, then waits for your "go".

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
