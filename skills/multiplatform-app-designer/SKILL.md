---
name: multiplatform-app-designer
description: >
  Design apps that look crafted by an award-winning studio instead of
  generated, for Android (Material 3 Expressive), iOS (iOS 26), mobile web
  and desktop web, any mix per project. Interviews for concept, platforms,
  handoff stack and UI language; explores three genuinely different
  directions on the real core screen; writes real content first; designs
  every screen on each platform's native structure; renders with real device
  chrome and bundled fonts (Windows, Mac, Linux, claude.ai); scans for AI
  tells and has a fresh critic score it; ends in a handoff for Flutter,
  React, Compose or SwiftUI. Use for "design my app", "Android/iOS/web app
  UI", "dashboard or admin panel", "landing page", "mobile mockup", "make it
  look premium", "looks AI-made", "redesign this screen", "store
  screenshots", "Material 3", "Flutter UI", or any request for app or web
  screens that should look professionally designed, even if they just say
  "UI" or "make me screens".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Agent
---

# Multiplatform App Designer

AI slop is not ugly. It is **average**: every decision left at the most likely
value. Cream and terracotta because the app is calm. Lime on black because it
is money. Inter because it is a UI. "Good morning, Maya" because it is a home
screen. Each choice is defensible, and together they make an app nobody can
tell apart from the last hundred.

Award-winning apps are the opposite: a few **specific, defended decisions**,
executed with craft at every pixel, a world with **warmth and richness** in it,
and one interaction people remember. This skill is a process for making those
decisions on purpose, on whichever platforms the project needs, and proving
on the rendered screen that you made them.

**What you produce:** `DIRECTION.md` (brief, concept, tokens, content,
signature), a three-direction exploration, high-fidelity screens per chosen
platform and the app icon, a clean slop scan, a scored critique per round,
`HANDOFF.md` for the coding session, and, when asked, store screenshot panels.

`<skill>` below means this skill's folder (in Claude Code normally
`~/.claude/skills/multiplatform-app-designer`; in claude.ai the path listed
for this skill).

## Where you are running

Read [delivery.md](references/delivery.md) once at the start. In short:

- **Claude Code or Cowork with a shell:** work in a project folder, render
  with `shoot.mjs`, deliver PNGs + `sheet.png` + the markdown files. A critic
  agent is available: use it.
- **claude.ai:** the container renders too (`npm install` once in `<skill>`,
  Playwright's Chromium is found automatically). Deliver the mockup as a
  **published artifact** (self-contained HTML with Google Fonts links and
  `scan.js` inlined so `#scan` shows the report) and the direction and handoff
  as Docs or files; delivery.md says how to split them per project.
- **Fonts:** Google Sans Flex, Roboto Flex, Inter, Newsreader and Roboto Mono
  are bundled, so renders match on every machine. Apple's SF Pro and New York
  render only on a Mac; elsewhere Inter and Newsreader stand in and the
  report says so. Material Symbols come from `npm install`.

## The references

Read each one when its step needs it, not all up front:

| File | Read before |
|---|---|
| [delivery.md](references/delivery.md) | Step 0. Environment, rendering, how the deliverable is shaped |
| [slop.md](references/slop.md) | Step 1. What not to do, per platform, with what to do instead. Includes this skill's own failure mode |
| [directions.md](references/directions.md) | Step 2 |
| [type.md](references/type.md), [color.md](references/color.md) | Step 2 tokens, and Step 4. type.md has the CJK section |
| [platform-android.md](references/platform-android.md), [platform-ios.md](references/platform-ios.md), [platform-web.md](references/platform-web.md) | Step 2 and Step 4, **only the platforms in the brief** |
| [copy.md](references/copy.md) | Step 3 |
| [imagery.md](references/imagery.md) | Step 2 (what imagery you can actually get) and Step 4 |
| [motion.md](references/motion.md) | the signature in Step 2, and Step 4 |
| [critique.md](references/critique.md) | Step 5 |
| [handoff.md](references/handoff.md) | Step 7 |
| [store.md](references/store.md) | Play Store / App Store panels |

## Step 0: The brief

Ask before designing. One message, short, with tappable options where the
harness has them:

1. **What is the app, and who is it for?** In their words.
2. **The core action:** what someone does in the first ten seconds of
   opening it, every day.
3. **Three words for how it should feel**, and up to three references *from
   outside apps*: a magazine, a shop, an object, a film, a place.
4. **Platforms:** Android, iOS, mobile web, desktop web, any mix. Which one
   is **primary** (the exploration renders on it first).
5. **Handoff stack:** Flutter, React (web), Kotlin Compose + SwiftUI, or
   tokens only. This shapes HANDOFF.md, nothing before it.
6. **UI language:** English by default; EN / 中文 or other scripts switch on
   the CJK rules in type.md and change the content step.
7. **What exists already:** name, logo, colours, fonts, photos, a codebase,
   current screens (ask for screenshots if it is a redesign).
8. **What they need:** screens to look at, a redesign, store screenshots.
9. **Image generation:** if an image tool is connected and costs credits,
   ask whether you may use it.

Do not re-ask what the user already said. If they are unreachable or said
"just do it", answer the questions yourself, mark the brief **self-authored**,
pick the platform the request implies (a "dashboard" is desktop web, an "app"
with no platform is Android + iOS), and do not spend paid credits.

Create the working folder and `DIRECTION.md`, and put the brief at its top.

### If this is a redesign

An existing app changes the job: you are replacing a look, not inventing a
product. Before Step 1, add a `## Current app` section to DIRECTION.md:

1. **Audit it.** Rebuild its key screens into `before.html` (same device
   kit) and run `shoot.mjs` on them. Name which slop.md tells it hits and
   paste the scan's FAILs.
2. **Inventory: keep / lose / unknown.** Every feature, data point and
   screen, and every good idea worth carrying over. This list is a contract:
   the redesign must keep every "keep".
3. **Harvest assets** from the codebase or the user: logo, photos, icons,
   brand colours, real data. Use them before drawing anything.
4. **Decisions for the user.** Any change to the name, the navigation
   structure, the hero metric or a removed feature is a decision you list
   explicitly, not one you make silently.
5. The current look counts as a **history row** for this app: the new
   direction must differ from it on at least 3 of 5 columns.
6. The deliverable gains a **before/after**: `before-after.html` with the old
   core screen beside the new one, shot like everything else.

## Step 1: Know the traps

Read [slop.md](references/slop.md) in full, including **"The overcorrection"**:
the austere grey-paper-and-mono look that an anti-slop process falls into
when it forgets that award apps are also *rich*. Then read the history file:

```bash
mkdir -p ~/.mpad
[ -f ~/.mpad/history.md ] || printf '| date | app | platforms | source family | ground | type | accent hue | richness source |\n|---|---|---|---|---|---|---|---|\n' > ~/.mpad/history.md
cat ~/.mpad/history.md
```

Every row there is a look you may not repeat (Step 2 explains the rule). On a
fresh machine it is empty and the rule starts with your first app. Where the
home folder does not persist (a fresh container), say so in the report and
apply the rule against the apps you can see in the conversation.

## Step 2: Direction, by exploration

Read [directions.md](references/directions.md), [imagery.md](references/imagery.md)
and the platform file for the **primary** platform.

1. **Find out what imagery you can really get** (the user's assets,
   generation if allowed, verified photo URLs, or none). This decides what
   directions are honest. Do not promise photography you cannot deliver.
2. **Write three concept sentences**: "<App> is a <thing>." Each from a
   **different source family** (directions.md: printed matter, objects and
   materials, places, media, nature, play). At most one may be a printed
   form (ticket, ledger, receipt, label, timetable).
3. **Render the core screen three ways** on the primary platform, one per
   concept, in one file (`explore.html`), with real content and full craft.
   Not wireframes. The three must differ on all three axes:
   - **Ground:** one light, one dark, one saturated colour field or
     full-bleed image.
   - **Type:** three different families or designs (serif / grotesque or
     expanded / rounded or mono or custom). On Android at least one should
     try something other than Google Sans + Roboto; on iOS, other than SF.
   - **Richness source:** photography, illustration or shape language,
     colour and material. Different in each.
   - **Accent hue:** three different hue families, so the brief's mood
     does not quietly pick the palette for all three.
4. Shoot it (`node <skill>/scripts/shoot.mjs explore.html --out shots/explore`),
   look at each, and **choose**. Write in DIRECTION.md which one won, and one
   line each on why the other two lost. Picking the safest of the three is
   usually wrong: pick the one that is most *this app* and that an editor
   would remember. You may merge, but say what came from where.
5. **Check it against the history.** It must differ from every row in
   `~/.mpad/history.md` on at least 3 of the 5 design columns (platforms is
   not a design column). Use only these words, so the comparison is
   mechanical:
   - source family: `printed` `object` `place` `media` `nature` `play`
   - ground: `light` `dark` `colour-field` `image`
   - type: `serif` `grotesque` `expanded` `condensed` `rounded` `mono` `custom-display`
   - accent hue: `red` `orange` `yellow` `green` `teal` `blue` `violet` `pink` `neutral`
   - richness: `photo` `illustration` `shape` `colour-material` `3d-object`
6. **Say how the direction lands on each other platform** in one line each:
   the tokens are shared; the *structure* is native (platform-*.md). A colour
   field that fills a phone becomes a page ground with a measured column on
   desktop; a glass tab bar on iOS is a tonal navigation bar on Android.
7. Then write the rest of DIRECTION.md:
   - **The category default you are refusing**: what the top three apps in
     the category share, and which of those you are not doing. Include the
     category's colour cliché (green for money, sage for plants, navy and
     violet for sleep), which the history columns cannot catch.
   - **Tokens:** colour roles for light and dark (hex), type families, 5 to
     7 size steps with weights and tracking, side margin per platform,
     radius family, spacing scale (type.md, color.md, platform-*.md). Give
     the Material 3 token names too when Android is in scope (color.md §9).
   - **The richness source**, written as an art direction.
   - **The signature interaction** as a storyboard: trigger, frames,
     timing, haptic (mobile) or pointer feedback (web), reduced-motion
     fallback (motion.md §6).

If the user is reachable, show them the exploration sheet and your pick
before Step 3.

## Step 3: Content first

Read [copy.md](references/copy.md). In a `## Content` section of DIRECTION.md,
write the exact content of every screen before any layout: every label,
value, name, date and image subject. Specific, uneven, believable data from
the user's world, in a realistic state (some done, one overdue, one new).
Content decides the layout, never the reverse.

Bilingual UI: write every string in both languages now, and lay out for the
longer one. Chinese runs shorter than English in characters and taller in
line height; type.md §8 has the rules.

## Step 4: Design the screens

**The set per platform** (5 to 8 frames per platform in `mockup.html`, or
`mockup-<platform>.html` each, plus the icon). If the brief names more
screens than fit, pick the ones that carry the core loop and list the rest
as not designed. Platforms share tokens, content and the signature; each
follows its own structure from platform-*.md.

1. The core screen, in a realistic mid-use state.
2. A detail screen (one level deeper).
3. A second core-loop screen: creation, a list, or a different tab.
4. The signature: one storyboard panel (`data-chrome="none"`) holding 3 to 4
   `.mini` frames of the moment, or 2 to 3 full frozen frames
   (`data-freeze`). Once, on the primary platform. See motion.md §6.
5. The core screen in dark mode (`data-theme="dark"`).
6. An empty or first-run state, if the app has one worth designing.
7. The app icon (`<section class="app-icon" data-device="ios|android|web">`).
   Android gets the adaptive icon with its safe zone, web the PWA master.
   See imagery.md §4.
8. **Desktop web only:** the core screen at the small size too (shoot.mjs
   `--small` gives 1280 x 720) and one state the pointer creates (a hover,
   a focused row, an open menu) shown in a frame.

**The device kit.** Link `<skill>/assets/fonts.css` then
`<skill>/assets/device.css` in the head and `<skill>/assets/device.js` at the
end of the body (as `file://` URLs). Each
`<section class="screen" data-device="android|ios|web-mobile|web-desktop" data-name="slug">`
is one device at its real logical size with the platform's status bar,
system bars or browser frame injected. The header comment in device.css
lists every attribute: `data-time`, `data-chrome="light|none"`, `data-home`,
`data-theme="dark"`, `data-nav="buttons"`, `data-browser="safari"`,
`data-url`, `data-freeze`, `data-dense`, `data-scrolls`, `data-float`,
`data-behind`, `data-bleed`, `data-system`, `.mini`.

Fonts: `var(--sf)`, `var(--ny)`, `var(--sf-rounded)`, `var(--sf-mono)` for
iOS; `var(--gsf)` (Google Sans Flex) and `var(--roboto)` (Roboto Flex) for
Android; `var(--web-sans)`, `var(--web-serif)`, `var(--web-mono)` as neutral
web stand-ins until the direction picks a face; `var(--cjk-sc)` appended for
Chinese. Type scales: `.t-*` (iOS Dynamic Type), `.m3-*` (Material). Icons:
`<span class="msym">name</span>` for Material Symbols; SF-style inline SVG
on iOS (imagery.md §1). Floating glass as `.glass` (iOS only); tonal
surfaces as `.m3-surface-*` (Android).

Put tokens on `:root` named after the DIRECTION.md roles, and their dark
values on `.screen[data-theme="dark"]` (restate `color` there).

**Build layouts that flex**, not absolute coordinates: flex or grid columns,
heights in `%` or `flex: 1`, so the same markup survives the small-size
render. Absolute positioning is for overlays and illustration only. A screen
that genuinely scrolls may run long with `data-scroll`.

**Design rules, in the order they usually go wrong:**

1. **One hero per screen**, at least twice the size of anything else.
2. **Richness on the core screen**: the image, the colour field, the shape
   language or the material is *on* the first screen, not saved for later.
3. **Real type contrast:** a display moment (34 to 96 on phones, 48 to 120
   on desktop) against 13 to 15 metadata, weights two steps apart, negative
   tracking on display.
4. **Rhythm:** tight inside groups, loose between, a rest where the screen
   decides (dense screens are exempt). Space before boxes. More space above
   a heading than below.
5. **One accent, one role.** Neutrals tinted. Contrast measured.
6. **Native structure** from the platform file: iOS content edge to edge
   under Liquid Glass chrome; Android tonal surfaces, a navigation bar or
   rail and the FAB where Material puts it; web with real browser chrome,
   a measured column or a full-width grid, hover and focus states. Keep the
   native *behaviour*; the *look* of the navigation layer may follow the
   concept.
7. **Never** grey placeholder boxes, emoji icons, or stock illustration.

## Step 5: Shoot, scan, critique

```bash
# once per machine, in the skill folder: npm install --no-fund --no-audit
node <skill>/scripts/shoot.mjs mockup.html --out shots/r1
node <skill>/scripts/shoot.mjs mockup.html --out shots/r1-small --small   # small phone / laptop, scanned too
```

It renders every screen and the icon at device resolution, tiles `sheet.png`,
and runs `scan.js` on the rendered DOM: clipped, colliding and off-screen
text, emoji, purple gradients, too many hues, glows and blobs, greetings,
centred FABs (a FAIL on iOS and web, a warn on Android where the FAB is
native but belongs at the end), nested cards and card stacks, icon chips,
families and default fonts, flat or bloated type scales, text under the
platform floor, contrast on solid ground and on pixels under text over
images, marketing words, small targets (48 Android, 44 iOS and mobile web,
24 desktop), long lines and narrow columns on desktop, ragged left edges.
Exit code 1 on any FAIL.

In a published artifact the same scan runs in the page: inline
`<skill>/scripts/scan.js` with `<script data-auto>` and open the artifact
with `#scan` on the URL (delivery.md).

1. **Fix every FAIL. Answer every warn** (fix it, or one line on why it is
   deliberate).
2. **Open every full-size PNG**, not only the sheet. The sheet shows the
   flow; defects live in the full frames.
3. **Score it** with [critique.md](references/critique.md). If you can spawn
   an agent, spawn **one** critic for the whole job and brief it as
   critique.md says (concept, platforms, refused defaults, rubric, PNG
   paths); wait for its scores before editing. Otherwise score it yourself,
   harder than feels fair. Write scores, findings and any declined asks to
   `CRITIQUE.md`.

## Step 6: Iterate

Fix what the critique found, shoot into a new folder (`r2`, `r3`), compare.
**At least two rounds, at most four.** Done, plateau and budget are defined in
critique.md "When to stop". Always: no FAILs, every warn answered.

When you stop (done or not), append one row to the history so the next app
cannot repeat this one:

```bash
echo "| <date> | <app> | <platforms> | <source family> | <ground> | <type> | <accent hue> | <richness source> |" >> ~/.mpad/history.md
```

## Step 7: Hand off (always) and ship (when asked)

- **HANDOFF.md:** [handoff.md](references/handoff.md). Tokens exported for
  the stack from the brief (Flutter `ThemeData` + `TextTheme`, React CSS
  variables + Tailwind theme, Compose `ColorScheme` + `Typography`, SwiftUI
  asset names + `Font` extensions, or a neutral JSON), the screen list with
  the components each one uses, the signature as a spec with timing and
  haptics, the states, and what the mockup could not show. The coding
  session reads this file and the PNGs; it should not need the chat.
- **Store screenshots:** [store.md](references/store.md). Play Store and
  App Store panels from the same mockup kit.

## Hard rules

| Never | Instead |
|---|---|
| Committing to a direction without rendering three | Step 2: three concepts, three grounds, three type families |
| Designing a platform you did not read the platform file for | platform-android.md / platform-ios.md / platform-web.md, the ones in the brief |
| The category's default look (cream wellness, dark-lime fintech, purple AI, white SaaS dashboard with blue buttons) | Name the default in DIRECTION.md and refuse it |
| This skill's own default: grey paper, black ink, one red, mono, ruled rows | slop.md, "The overcorrection". At most one printed-form concept per exploration |
| A core screen with no richness (all type, all grey) | Image, colour field, shape language or material, on screen one |
| Repeating a row of `~/.mpad/history.md` | Differ on 3 of 5 design columns |
| "Good morning, Name" or any greeting header | The date, the place, or the thing itself |
| The dashboard skeleton (hero stat card, 2x2 tiles, "Recent") by default, on any platform including desktop | The core action owns the first screen; a real dashboard earns its density |
| Emoji as icons or in UI copy | Material Symbols / SF Symbols (SF-style SVG), one weight |
| Indigo/violet gradients, glows, blurred colour blobs | A colour from the concept, flat |
| More than one accent hue (plus semantic colour if the domain needs it) | One accent, one role |
| Cards inside cards, a screen that is a stack of boxes | Space and alignment, hairlines, then containers; on Android, tonal surfaces |
| Inter / Poppins / Manrope / Playfair as an unexamined default | A face with a stated reason (Inter standing in for SF off-Mac is stated in the report, not chosen) |
| A centred floating "+" over an iOS tab bar or a web page; a FAB on desktop | iOS: action in context or a toolbar button. Android: the FAB at the end or a toolbar. Desktop: the action in the layout |
| iOS chrome on an Android mockup or the reverse (a glass tab bar on Pixel, a 3-dot menu on iPhone) | Each platform's own navigation, from its platform file |
| A desktop page that is a phone layout stretched, or a narrow column with empty flanks for no reason | platform-web.md: breakpoints, a measured column or a real grid, hover and keyboard states |
| Marketing copy, exclamation marks, fake-round data, lorem | copy.md |
| Grey placeholder boxes or broken image URLs | Real images, verified, or a designed colour or shape field |
| Liquid Glass on content cards or on Android | Glass only for iOS floating navigation; Android depth is surface tone |
| Staggered fade-up on every element | Motion only where state changes; springs (M3 spatial springs on Android) |
| No signature interaction | One storyboarded, haptic, concept-born moment |
| Grading your own work and calling it done | One fresh critic, briefed on the refused defaults, critique.md's stop rule |
| Ending without HANDOFF.md | Step 7, every time |

## Report

Short: the platforms and the primary, the three concepts and why two lost,
the category default refused, the signature, the path to the latest
`sheet.png` (or the artifact link), the scan result, the rubric scores per
round, what changed between rounds, where HANDOFF.md is and which stack it
targets, and what you could not verify (real-device feel, motion timing,
Apple fonts on a non-Mac machine, Chinese fonts if the system lacked one).
Say if the brief was self-authored. For a redesign, add the before/after,
the keep list with each item checked off, and the decisions the user needs
to make.
