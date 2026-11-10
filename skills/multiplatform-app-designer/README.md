# Multiplatform App Designer

A Claude skill that designs apps the way an award-winning studio would,
for **Android (Material 3 Expressive), iOS (iOS 26), mobile web and desktop
web**, any mix per project, and ends in a handoff a Flutter, React, Compose
or SwiftUI coding session can build from.

It grew out of App Designer (iPhone only, Mac only). What changed:

- Platforms are chosen per project in the brief; each has its own structure
  module (`references/platform-*.md`) while the concept, tokens, content and
  signature are shared.
- The device kit draws a Pixel, an iPhone, a phone browser (Chrome or Safari)
  and a desktop browser window, with the right status bars and insets.
- Fonts are bundled (Google Sans Flex, Roboto Flex, Inter, Newsreader, Roboto
  Mono, all OFL) so renders match on Windows, Mac, Linux and in claude.ai.
  Apple's faces render only on a Mac and the report says so.
- The slop scan is a browser script (`scripts/scan.js`) shared by the PNG
  renderer and by published artifacts (`#scan` on the URL).
- `HANDOFF.md` is a required output, with token exports per stack.
- Chinese UI gets its own typography rules.

## Install

**Claude.ai:** save the `.skill` file when it is offered, or upload the
folder as a skill. The container renders screens on its own.

**Claude Code (any OS):** copy this folder to `~/.claude/skills/multiplatform-app-designer`,
then once:

```bash
cd ~/.claude/skills/multiplatform-app-designer && npm install --no-fund --no-audit && npm run check
```

`npm install` pulls the renderer driver and Material Symbols. `npm run check`
renders `assets/check.html` and must print "No FAILs". You need Node 18+ and
either Google Chrome / Chromium / Edge installed, or run
`npx playwright-core install chromium` once.

## Use

Type `/multiplatform-app-designer` or just ask: *"design my app, it's a ...
for ..., android and web"*. Claude asks a few short questions (platforms,
stack, language), shows three directions, designs the set, scans and
critiques it, and hands you the folder or the artifact plus `HANDOFF.md`.

Uninstall: delete the skill folder and `~/.mpad`.
