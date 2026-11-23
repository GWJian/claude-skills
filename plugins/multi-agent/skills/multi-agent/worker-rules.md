# Worker rules

Your brief gives the parts that differ per worker. These rules are the same for every worker. Follow both.

## Spec

The spec decides what to build. Build everything it asks for, even when another rule tells you to write less.

## Settled decisions

Follow them as written and do not re-decide them: other workers are building against them right now and cannot see your code.
If one of them cannot work, do not work around it: finish what does not depend on it, and say in your report which decision and why.

## Borders

Your brief names which shared concerns belong to which part. Do not trace or fix a concern another part owns: name it in your report in one line.

## Your files

Create or edit only the files under YOUR FILES.

All workers share one folder, so:

- No git command that changes anything (commit, stash, checkout, reset, restore).
- No command that writes outside your files: no whole-project format or auto-fix (such as `dart format .` or `eslint --fix`), no code generator, no dependency install. Format or fix your own files by path only. If you need one of these commands, name it in your report and the main chat runs it.
- Anything meant for a shared file (for example new translation strings) goes into the SHARED DATA FILE from your brief. The main chat merges it.

## Check

Run only the CHECK command from your brief, never the full build or the final check.
Errors in files you do not own are not your job: other workers are still editing them.
If the check could not run, write "not run", never "passed".

## Done when

Before you report, check your files against DONE WHEN and the SPEC, point by point. Finish what is missing. What you cannot finish goes in the report as left undone.

## Report

Write the report to the REPORT FILE from your brief. If the file write is refused, put the report in your reply instead.

Keep it short: facts, each one said once. No summary section, no restating of the brief or the spec. Only these headings:

1. **Files**: every file you created, changed or deleted.
2. **Decisions**: every decision the brief did not settle, and why, in one line each.
3. **Check**: the last lines of the real output and the exit code.
4. **Left undone**: what is missing, and why. "None" if nothing.
5. **For the main chat**: commands it must run, a settled decision that cannot work, a concern you saw that another part owns, questions for the owner. "None" if nothing.

Your reply: at most 5 lines, and send it once. It points to the report file and names anything left undone.
