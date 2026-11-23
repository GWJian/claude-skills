---
name: multi-agent
description: Run a coding task with parallel worker subagents under fixed rules - split it into independent parts, give each worker its own files, check every worker's real diff, then end with one fresh code review. Runs only when the user types /multi-agent.
argument-hint: "[task, or empty for the task agreed in this chat]"
disable-model-invocation: true
---

Run the task in `$ARGUMENTS` with worker subagents. If it is empty, use the task already agreed in this chat.

**Keep the main chat small.** Every main-chat turn re-sends the whole chat, so late in a run one turn costs as much as many worker turns. In past runs the main chat used about 65% of all tokens. So big reading, browser work and long jobs go to subagents. The main chat decides, briefs, merges, fixes and checks.

## Rules for every step

These three rules hold in every step. The steps point to them and do not repeat them.

1. **A check that did not run has not passed.** A check with no pasted output (its last lines and the exit code) counts as not run. Report it as "not run" or "unverified", never as "passed". A worker's "done" is a claim until you see the output.
2. **Only the main chat edits a shared file.** A shared file is one the project lists as shared, or any file that 2+ parts would change. Every other file has exactly one owner. File ownership is what makes parallel work safe.
3. **The spec decides what gets built.** The spec is the sections the Spec references value points to, or, with no spec docs, the requirements agreed in this chat. A write-less rule (such as ponytail's) or a review finding ("lean", "unused") never removes or shrinks something the spec asks for. Such a finding is not applied: list it in the report.

## Helper for lookups (any step)

A lookup with a lot to read and a short answer goes to a helper, so the reading stays out of the main chat.

**Reference material always goes to a helper.** Before you write briefs, anything long that you only need facts from (design boards, the old code a part ports, long spec sections, a large data sample) goes to helpers. Ask each for a digest: the facts each part needs, with paths and line numbers. Then read only the lines you act on. Skip the helper only for a file short enough to read in one go.

Other examples:

- **Step 2**: the files that touch a feature across many folders, or the layout of a large folder; who calls or imports a file; how a similar feature was built before (`git log`, `git blame`).
- **Step 4**: one existing file that already follows the pattern a part needs, for its brief to point to; the signature of an API in an installed package's source.
- **Step 5**: the errors in a long lint, build or test log, grouped by file.

How to use it:

- **Who**: the Agent tool with `subagent_type: Explore`, `model: haiku`, `effort: high`. Send several lookups in one message so they run in parallel. Helpers do not count toward the 4 workers.
- **Not for one command**: a single `ls`, file search, `git status` or log tail costs less done yourself than explained in a brief.
- **Not for anything that changes a file**: a rename, a move, a delete, an edit. Every file has one owner (rule 2), and a rename also changes the imports that point to the file. Say in the helper's brief: read only, change nothing.
- **Not for the checks in this file**: you read the workers' diffs yourself (Step 5), and you take a check's output and exit code yourself (rule 1). A helper may point to the failing lines in a log. It never decides that a check passed.
- **What comes back**: paths, and log lines quoted with their line numbers. Treat them as pointers: read the file or the lines yourself before you act on them.

## Step 1 — Project values and preflight

Read the "Multi-agent" section of the project's `CLAUDE.md` and `CLAUDE.local.md`:

| Value | What it is | Where it lives | If the line is missing |
|---|---|---|---|
| Shared files | Files only the main chat edits (translation files, the route file, docs) | Either file | Any file that 2+ parts would change |
| Worker check | The one command each worker runs (for example lint) | Either file | Take it from `package.json` or the project's build file |
| Final check | The commands the main chat runs once at the end (for example build, then lint) | Either file | Take them from `package.json` or the build file: build, lint, and the tests if the project has them |
| Spec references | Where briefs point for the requirements (for example `01/02 §` of the feature docs) | Either file | Write the requirements agreed in this chat into each brief and into the review instructions |
| Worker model | The model and effort workers get | `CLAUDE.local.md` only: it is personal (cost, plan limits) | Ask once and save it (below) |
| Code map | `graphify`: Step 2 uses the code graph to split the task | `CLAUDE.local.md`: it depends on the tools on this computer | No code map. Never ask, never write the line |
| Review command | The command the Step 6 review runs, for example `/ponytail-review` | `CLAUDE.local.md`, for the same reason | `/code-review high`. Never ask, never write the line |

Say in chat which values you filled in yourself, and say so when there is no spec doc.

A team where everyone has the tools may put the Code map and Review command lines in `CLAUDE.md`. If either line is there, read its section at the end of this file now, and apply it in the steps it names.

**Worker model, first run**: look for a `Worker model:` line in `CLAUDE.local.md`. If it is missing, ask the user once (one question, three choices):

1. **All opus · high**: strongest, costs the most.
2. **Per part** (recommended): opus · high for hard parts (business rules, money, stock, orders, sign-in, data writes), sonnet · high for simple parts that follow a clear pattern (a screen from the design, translations, tests). Unsure → opus.
3. **All sonnet · high**: cheapest, for projects where cost matters more than quality.

Save the answer as one line in the "Multi-agent" section of `CLAUDE.local.md`, for example `- Worker model: per part`. Create the section, or the file, if missing; a new file that `.gitignore` does not cover gets added to `.gitignore`, and say so. Then continue. Later runs read the line and never ask; the user changes it by editing or deleting the line.

**Preflight**: do all three before any file changes.

1. Run `git status --short -uall` and note every file already changed. `-uall` lists the files in a new folder one by one: without it a new folder is one line, and a change inside it stays hidden. Those files are the user's own edits:
   - Give none of them to a worker, and leave them out of the Step 6 review.
   - If the task must change one of them, tell the user before starting.
   - List them in the final report as "left alone".
2. Take a snapshot, so Step 5 can see exactly what this run changed, even inside a file the user had already edited:
   - Run `git stash create` and keep the hash it prints. It changes nothing: not the files, not the stash list. No output means nothing was changed yet: use `HEAD` as the snapshot.
   - The snapshot leaves out files git does not track (`??` in the status). For each of those, keep its `git hash-object <file>`.
   - If git cannot make a snapshot (a repository with no commit yet), say so and go on with the `git status` list alone. In Step 5, plain `git diff` then stands in for `git diff <snapshot>`.
3. Note the start time (`date -Iseconds`). Step 7 counts tokens from then on.

## Step 2 — Split or not

- Small task, or the parts depend on each other: do it yourself, no workers. Say so in one line, run the final check and the UI check as in Step 5, then skip to Step 6.
- 2+ independent parts: one worker per part, **max 4**. More than 4 parts: join the closest ones until 4 are left. Start more than 4 workers only when the user asks for more in this run.

## Step 3 — Announce

Before starting any worker, say in chat how many workers, and for each one: what it does, which files it owns, and its model and effort. The user can switch any worker to opus before it starts.

## Step 4 — Brief and start the workers

Before writing the briefs:

- Decide everything that 2+ parts share: names, interfaces, data shapes, translation keys. Workers run in parallel and cannot see each other's code, so they follow your decisions and do not re-decide them.
- Install any new dependency the task needs yourself. The package file and its lock file are shared files, and a worker may not run an install.
- **Before you settle a decision, check it.** Wrong settled decisions caused most retries in past runs. For each one:
  - A design board: look at every variant of the part (empty, loading, error, long text), not only the first.
  - A field that is shown: read one real value from the database or the old app, so you know its true form (plain text or HTML, which unit, can it be empty).
  - A saved time or id: say where it comes from (the server, the device, the moment it is saved).
- **Draw the borders.** When 2+ parts touch the same concern (a server check, a shared rule), name the one part that owns it. The others only use it.

Copy `worker-rules.md` from this skill's folder into the scratchpad once, with one `cp` (subagents can always read the scratchpad). It holds the rules that are the same for every worker, so you write them once, not in every brief.

Start each worker with the Agent tool, using the model from the Worker model value (`opus` or `sonnet`), both at effort `high`. Send all of them in one message so they run in parallel.

Every brief is this template. Fill in the `<...>` parts and keep the other lines word for word:

```text
Read <scratchpad>/worker-rules.md first and follow it. This brief fills in its parts.

GOAL
<what this part must do>

SPEC
<the exact sections to read, or, with no spec doc, this part's requirements written out>

EXAMPLE TO FOLLOW
<one existing file that already follows the pattern this part needs, or "none">

SETTLED DECISIONS
<the names, interfaces, data shapes and translation keys this part shares with other parts>

BORDERS
<the shared concerns this part owns, and the ones other parts own>

YOUR FILES
<the files this worker owns>

DO NOT TOUCH
<every shared file, and every file another worker owns>

SHARED DATA FILE
<scratchpad>/<name>-<part>.json

CHECK
<worker check>

DONE WHEN
<the concrete finish line>

REPORT FILE
<absolute path in the scratchpad>
```

Why the report goes to a file: a long report in a reply can arrive cut off. Why the fallback in the rules: a subagent was once refused a file named `report-*.md`. Data files for shared content are written fine.

## Step 5 — After the workers finish

Start this step only when every worker has replied. A worker that is still running is still changing files, so a diff or a check taken now would be wrong. Until then, answer nothing: a worker's reply, its idle notice or a repeat of its summary needs no answer, and each answer is one more turn of the whole main chat.

1. **See what the run really changed.** Run `git diff <snapshot> --stat` and `git status --short -uall`. The diff lists every tracked file changed since the snapshot, including a file the user had already edited; the status lists new files. For each untracked preflight file, run `git hash-object` again and compare. Then check ownership:
   - Compare each worker's "files changed" list with the files it owns.
   - A changed or new file that no worker owns, and that you did not change yourself: a worker left its files. Read that change, then keep it or undo it. `git restore --source=<snapshot> --worktree -- <file>` puts a file back as it was before the run; a new file is deleted.
   - A preflight file that changed is the user's: show them the diff and ask before you keep or undo anything.
2. **Read each worker's real source change**, not only its report: `git diff <snapshot>` on the source files it owns, and every new source file in full (`git diff` does not show new files). Test files and long data files (fixtures, samples, generated files) are left to the reviewer: check only that they exist and that the check ran them. In past runs, reading them in full found nothing the review did not.
3. **Merge and run what was held back.** Merge the shared-file data files into the shared files yourself. Then run, once, the commands the workers asked for (a code generator, a format).
4. **Run the final check once** (rule 1).
5. **Fix or re-delegate whatever fails**, each part twice at most. A resume and a restart each count as one retry.

   | What happened | What to do |
   |---|---|
   | The worker left listable work undone (a missing file, a check not run) | Resume it with SendMessage and say what is left. It keeps its context. |
   | A worker reported that a settled decision cannot work | Check the claim in the code. If it holds, the brief was wrong, not the worker, and a stronger model does not fix a wrong brief: settle the decision again yourself, then resume every worker whose part uses it with SendMessage and say what changed. If it does not hold, treat it as the next row. |
   | Anything else: work skipped, or work done but wrong | Start the part again with a new worker, one step up this ladder: sonnet · high → opus · medium → opus · high → fable · medium |
   | The part failed its second retry, it was already on fable · medium, or a fable worker cannot be started | Fix it yourself, or take it to the user |

   A new worker knows nothing of the last attempt. Its brief is the part's brief with a handoff added at the top, in this order:

   - What you found wrong, from the diff and the check output. This comes first: the last worker reported the part as done, so its report does not say what is wrong.
   - The path of the last worker's report, and this line: "This is the last worker's own account. It may be wrong."
   - This line: "The files are as the last attempt left them. Read them first, and keep what is right."

6. **UI check, when this step changes a screen.** Open the screen before the review, not during it: a screen that breaks on first open should be fixed before a reviewer reads the code. You never drive the browser yourself: in past runs, browser work in the main chat cost more than all the workers together.
   - **Who**: one checker subagent, the Agent tool with `model: sonnet`, `effort: high`.
   - **What you tell it**: the screens to open; the lines of DONE WHEN (and of the spec) that can be seen on screen; how to open the app (the URL, the command that starts it if it is not running, a test login if one is needed). Also check on every screen: it loads, and the console shows no error.
   - **What it may not do**: change a file in the project. A server it started, it stops at the end.
   - **What comes back**: pass or fail for each line, with what it saw as evidence (the text on screen, the console error), written to a scratchpad file. It replies with a short summary.
   - **After it**: fix what failed, run the final check again, then send the same checker the failed lines only (SendMessage). It keeps its context. Twice at most, then list what still fails in the report.

## Step 6 — Review

Every code step, done by you or by workers, ends with **one** full review by a fresh subagent. Docs-only steps need no review.

- **Who**: the Agent tool with `model: opus`, `effort: high`, whatever the session model and effort are.
- **What it runs**: the Review command (default `/code-review high`) on the whole step's change.
- **What you tell it**: which files belong to this step, which preflight files to skip, and the spec, so it also checks the change against the spec. Build, lint and a bug review cannot see a missed requirement.
- **What it may not do**: change a file in the project. No fix, no temporary test: it reports, and you fix. Any command it runs, such as the tests, gets a time limit. Say both in its instructions.
- **What comes back**: only its findings. It writes all of them to a file in the scratchpad (give it the absolute path) and replies with a short summary. If the file write is refused, the findings go in its reply. Read the file, not only the summary: a long reply can arrive cut off.
- **One list, one file**: the review command may start an agent of its own. Tell the reviewer to wait for that agent and to add its findings to the same file, each marked with where it came from. Then you read one file and answer one reply. In a past run the reviewer's file left out its own agent's findings, and one of them was the most important bug.
- **After it**: sort the findings, then run the final check again.
  - A bug in this step's change that you confirmed by reading the code: fix it.
  - A bug that was there before this step: change no code, and list it in the report. The exception is a bug that this step's change now lets happen: that one is this step's bug, so fix it.
  - A small suggestion (style, naming, a cleanup, "this could be faster"): change no code, and list it in the report. One that swaps or removes a check can take away what the check was guarding against, so the user decides.
  - A finding that goes against the spec: not applied (rule 3).

**Second review, once at most.** A fix is new code that no review has seen, so a fix that changed behavior gets one more look:

- **When**: a fix changed what the code does (a condition, a guard, the order of steps, a wait, what is saved or shown). A rename, a comment, a type or formatting did not. If no fix changed behavior, there is no second review.
- **Who**: a fresh subagent, `model: opus`, `effort: medium`. Narrowing the prompt alone has not made a review cheaper, so the effort is lower too.
- **What it runs**: `/code-review medium`, or the Review command if one is set.
- **What you tell it**: the list of fixes (for each one: the file, the place in it, and the finding it answers), and to review only those fixes and the code that calls them. The limits of the first review hold: no project file changed, a time limit on every command. Its findings come back the same way, in one scratchpad file of their own.
- **After it**: sort the findings the same way, fix what that leaves to fix, run the final check again, and stop. Never start a third review: a reviewer nearly always finds something, so reviewing until a round comes back clean does not end. What is left goes in the report.

## Step 7 — Report back

Say what each worker returned, what you fixed, what the UI check and each review found, which findings you did not apply (small suggestions, bugs that were there before this step, and rule 3), which fixes came after the last review (no review has seen them), which checks did not run (rule 1), and which preflight files were left alone.

Then add the token table, so each change to this skill can be measured. Run, with the start time from Step 1:

```bash
PYTHONIOENCODING=utf-8 python "<this skill's folder>/run_stats.py" "$HOME/.claude/projects/<project folder>" <start time>
```

`<project folder>` is the project's full path with every character that is not a letter or a digit turned into `-` (for example `D:\work\my_app` → `D--work-my-app`). Paste the table it prints as it is. If it fails, say so in one line and go on.

Explain the step, then wait for the user's "go".

## Optional: graphify (`Code map: graphify`)

Use it only when the line is there and the `graphify` command is found. No line, or a line set to `false`: no code map. The command is missing: no code map, and say so in chat.

- **No `graphify-out/graph.json` yet**: say in one line that the user can build it with `/graphify .`, and split without it.
- **Step 2, before deciding**: run `graphify query`, `graphify path` or `graphify explain` on the main components each part changes, to find links the file names do not show. Parts joined by a call or an import are not independent: merge them, or settle the interface between them first (Step 4). A file that 2+ parts reach is a shared file.
- **Limits**: the graph maps the code as it was before this run, and some links are `INFERRED`. Read the code before you rely on a link, and never use the graph to check the workers' changes.
- **Step 4, add to every brief**: "You may run `graphify query` to find existing code. Read a file before you change it. If the graphify hook refuses a Read or Grep, run one `graphify query` on that area, then try again."

## Optional: review command (`Review command: <command>`)

Step 6 runs this command in both reviews, in place of `/code-review high` and `/code-review medium`, for example `/ponytail-review`.

- No line, or a line set to `false`: `/code-review high`, then `/code-review medium` for the second review. The first review always runs.
- The command is not in your skill list: the same defaults, and say so in chat.
- A `/code-review` with no level gets `high` in the first review and `medium` in the second: without a level it reuses the one the user typed last.
