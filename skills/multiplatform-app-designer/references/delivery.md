# Delivery: where you run and what you hand over

The process is the same everywhere. What changes is how screens get
rendered and what the person opens at the end. Decide this in Step 0 and
write it under the brief in DIRECTION.md as one line: "Environment: …
Deliverable: …".

## 1. Detect the environment

| Signal | Environment | Rendering | Deliverable |
|---|---|---|---|
| `Bash` on the user's own machine, `~/.claude/skills/...` paths | **Claude Code** | `shoot.mjs` with the installed Chrome (Mac renders Apple fonts) | A project folder: `DIRECTION.md`, `mockup*.html`, `shots/rN/*.png` + `sheet.png`, `CRITIQUE.md`, `HANDOFF.md` |
| A VM with a shell, subagents available, files land in an outputs folder | **Cowork** | `shoot.mjs` (Playwright's Chromium, or the host Chrome if the VM sees it); otherwise the artifact path below | Same folder, delivered through the outputs folder; a critic subagent |
| `Artifact` tool present, `/mnt/user-data/outputs`, Claude Docs tools, no persistent home | **claude.ai** | `shoot.mjs` in the container for PNGs and the scan (Playwright's Chromium is found automatically after `npm install` in the skill folder); the published artifact is what the person opens | Published artifact(s) + a Doc or `.md` for direction and handoff |

Fonts are the same in all three (bundled), except Apple's faces, which are
real only on a Mac. Material Symbols need `npm install` once in the skill
folder (`cd <skill> && npm install --no-fund --no-audit`); in claude.ai the
container reaches the npm registry, so run it at the start of the job.

If nothing can render (no Node, no Chromium, no network), say so once, skip
PNGs, deliver the HTML, and run the scan in the page (§3). Never pretend a
scan ran.

## 2. The mockup file is the product in claude.ai

A published artifact must be **self-contained**: no `file://` links to the
skill folder. So the artifact version of a mockup differs from the local
one in three mechanical ways:

1. **Inline the device kit.** Paste `assets/fonts.css` (without its
   `@font-face` bundled-file block and `@import`s) and `assets/device.css`
   into a `<style>`, and `assets/device.js` into a `<script>` at the end of
   the body. A small build step in the shell does this:

   ```bash
   S=<skill>/assets
   python3 - "$S" mockup.html artifact.html << 'EOF'
   import re,sys; S,src,dst=sys.argv[1:4]; h=open(src).read()
   css=open(f"{S}/fonts.css").read(); css=re.sub(r'@import[^\n]*\n','',css); css=re.sub(r'@font-face \{[^}]*fonts/[^}]*\}\n','',css)
   css+="\n"+open(f"{S}/device.css").read(); js=open(f"{S}/device.js").read(); scan=open(f"{S}/../scripts/scan.js").read()
   h=re.sub(r'<link[^>]*(fonts|device)\.css[^>]*>\n?','',h); h=re.sub(r'<script[^>]*device\.js[^>]*></script>\n?','',h)
   h=h.replace('</head>',f'<style>\n{css}\n</style>\n</head>',1).replace('</body>',f'<script>\n{js}\n</script>\n<script data-auto>\n{scan}\n</script>\n</body>',1)
   open(dst,'w').write(h)
   EOF
   ```

2. **Load fonts from Google Fonts.** Add the `<link>` tags listed at the
   bottom of `fonts.css` for the families the design uses (and Noto Sans SC
   for Chinese UI). The published page's content-security policy allows
   `fonts.googleapis.com` and `fonts.gstatic.com`, and nothing else
   external except the listed script CDNs. Give every face a real fallback
   stack (it already has one in the tokens).

3. **Make it a review page, not a wall of phones.** The artifact is where
   the person judges the design, so it needs: a title, the concept
   sentence, the screens in flow order with a caption each (what the screen
   is, what state it shows), a toggle or anchors per platform when several
   are present, and the signature storyboard. Keep it one file, under 16 MB
   (images as data URIs count: compress them; use verified URLs only where
   allowed). The device screens keep their exact sizes; the page around
   them is simple and quiet so it never competes with the design. Put the
   platform tabs on the hash (`#android`, `#web-desktop`) so links land on
   the right one.

The scan is still run from the shell (`shoot.mjs` gives PNGs the critic
reads); the inlined `scan.js` with `data-auto` lets anyone open the artifact
with `#scan` appended and see the same report in the page, which is how the
person checks a claim like "no FAILs".

## 3. How to split the deliverable (claude.ai)

Default, and the right call for most projects:

- **One artifact** with the mockup review page (all platforms, tabbed), the
  exploration sheet as a section at the bottom (the three directions and
  why two lost), and the signature.
- **One Claude Doc** (when the Docs tools exist; otherwise `DIRECTION.md` and
  `HANDOFF.md` as files) holding the direction, the content, the critique
  history and the handoff. The coding session will be given this and the
  artifact link.

Split further only when something earns it:

- **Three or more platforms, each with 6+ screens:** one artifact per
  platform (shared header, same tabs linking across), because one page
  with 24 phone frames is unreadable on a phone screen.
- **A redesign:** the before/after gets its own short artifact (two
  columns, old and new core screens, the keep list checked off), because it
  is what the person forwards to whoever asked for the redesign.
- **Store screenshots:** their own artifact at panel size, or PNGs
  presented as files if the person will upload them to the consoles.
- **The person asks** for a particular shape. Theirs wins.

Say which you chose, in one line, and why, in the report. Never ask the
person "artifact or file?" when the brief already said "artifacts".

## 4. Files that stay files

PNGs the person asked to download, the `.html` mockups themselves when they
want the source, `HANDOFF.md` when there are no Docs tools, store panels for
upload. Present them with the file tool; a file that is written but never
presented is unreachable on mobile.

## 5. History across environments

`~/.mpad/history.md` is the anti-repetition ledger. It persists in Claude
Code and Cowork. In claude.ai the home folder is fresh each session, so the
rule falls back to what you can see: apps earlier in this conversation and
in the person's memory notes if those mention past directions. Say in the
report that the history check was session-local.
