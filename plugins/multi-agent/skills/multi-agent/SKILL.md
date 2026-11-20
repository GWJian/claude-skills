---
name: multi-agent
description: Run a coding task with parallel worker subagents under fixed rules - split it into independent parts, give each worker its own files, check every worker's real diff, then end with one fresh code review. Runs only when the user types /multi-agent.
argument-hint: "[task, or empty for the task agreed in this chat]"
disable-model-invocation: true
---

Run the task in `$ARGUMENTS` with worker subagents. If it is empty, use the task already agreed in this chat.

## Step 1 — Project values and preflight

Read the project's `CLAUDE.md` and `CLAUDE.local.md` for a "Multi-agent" section. It gives:

- **Shared files**: files only the main chat edits (for example translation files, the route file, docs).
- **Worker check**: the one command each worker runs (for example lint).
- **Final check**: the commands the main chat runs once at the end (for example build, then lint).
- **Spec references**: where briefs point for the requirements (for example `01/02 §` of the feature docs).
- **Worker model**: which model and effort workers get. It is personal (cost, plan limits), so it lives only in `CLAUDE.local.md`. See below.

A value is missing: take the check commands from `package.json` (or the project's build file), treat as shared any file that 2+ parts would change, and say in chat which values you used.

**Worker model, first run**: look for a `Worker model:` line in `CLAUDE.local.md`. If it is missing, ask the user once (one question, three choices):

1. **All opus · xhigh**: strongest, costs the most.
2. **Per part** (recommended): opus · xhigh for hard parts (business rules, money, stock, orders, sign-in, data writes), sonnet · high for simple parts that follow a clear pattern (a screen from the design, translations, tests). Unsure → opus.
3. **All sonnet · high**: cheapest, for projects where cost matters more than quality.

Save the answer as one line in the "Multi-agent" section of `CLAUDE.local.md`, for example `- Worker model: per part`. Create the section, or the file, if missing; a new file that `.gitignore` does not cover gets added to `.gitignore`, and say so. Then continue. Later runs read the line and never ask; the user changes it by editing or deleting the line.

**Preflight**: run `git status --short` and note every file already changed before this run. Those are the user's own edits:

- Give none of them to a worker, and leave them out of the Step 5 diff check and the Step 6 review.
- If the task must change one of them, tell the user before starting.
- List them in the final report as "left alone".

## Step 2 — Split or not

- Small task, or the parts depend on each other: do it yourself, no workers. Say so in one line, run the final check as in Step 5, then skip to Step 6.
- 2+ independent parts: one worker per part, **max 4**.

## Step 3 — Announce

Before starting any worker, say in chat how many workers, and for each one: what it does, which files it owns, and its model and effort. The user can switch any worker to opus before it starts.

## Step 4 — Brief and start the workers

Start each worker with the Agent tool, using the model and effort from the Worker model value (`opus` + `xhigh`, or `sonnet` + `high`). Send all of them in one message so they run in parallel.

Every brief has:

1. **Goal**: what this part must do.
2. **Spec references**: the exact sections to read.
3. **Settled decisions**: the names, interfaces, data shapes and translation keys that 2+ parts share, decided by you before any worker starts. The worker follows them and does not re-decide them: workers run in parallel and cannot see each other's code.
4. **Files it owns**: it may create or edit only these.
5. **Files it must not touch**: every shared file, and every file another worker owns. No git command that changes anything (commit, stash, checkout, reset, restore): all workers share one folder.
6. **Shared-file content**: anything meant for a shared file (for example new translation strings) goes into a data file in the scratchpad, such as `<scratchpad>/i18n-<part>.json`, for the main chat to merge. Data files like this are written fine.
7. **Check**: run the worker check only, never the final check. Errors in files it does not own are not its job: other workers are still editing them. Paste its real output (the last lines and the exit code) in the report. A check that could not run is reported as "not run", never as "passed".
8. **Done when**: the concrete finish line.
9. **Report**: the full report goes to a named file in the scratchpad (give the absolute path), with a short summary back. Add this line: "If the file write is refused, put the full report in your reply instead." Long reports in a reply can arrive cut off, and a subagent was once refused a file named `report-*.md`.

File ownership is what makes parallel work safe. A file that two parts must change is a shared file: only the main chat edits it.

## Step 5 — After the workers finish

1. Read each worker's real change, not only its summary: `git diff` on the files it owns, and every new file in full (`git diff` does not show new files). Run `git status --short` too: a changed file that is neither in the preflight list nor owned by a worker means a worker left its files, so read that change, then keep or undo it. A worker's "done" is a claim: a check with no pasted output counts as not run.
2. Merge the shared-file data files into the shared files yourself.
3. Run the final check once. If it cannot run, the step is unverified, not passed.
4. Fix or re-delegate whatever fails, each part once at most. A worker that left listable work undone (a missing file, a check not run) is resumed with SendMessage and told what is left: it keeps its context, and this counts as its one retry. A worker that skipped work goes again one effort level higher; one that tried hard but was still wrong goes again on opus · xhigh. A part that was already on opus · xhigh, or that fails a second time, you fix yourself or take to the user.

## Step 6 — Review

Every code step, done by you or by workers, ends with **one** fresh review subagent (Agent tool, `model: opus`, `effort: high`, whatever the session model and effort are) that runs `/code-review` on the whole step's change. Tell it which files belong to this step, which preflight files to skip, and the spec references, so it also checks the change against them: build, lint and a bug review cannot see a missed requirement. Only its findings come back. Fix what it confirms, then run the final check again. Docs-only steps need no review.

## Step 7 — Report back

Say what each worker returned, what you fixed, what the review found, which checks did not run (unverified), and which preflight files were left alone. Explain the step, then wait for the user's "go".
