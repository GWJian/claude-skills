# Type

On a phone, typography *is* the design. There is no room for decoration, so
the only things that make a screen feel crafted are which face, what size,
what weight, what tracking, and how much space around it.

## 1. Choosing the face

Each platform has a system family that is free, scales with the user's text
size, renders perfectly and costs zero app size. Each is **one strong
option, not the default answer**, and each has a range almost nobody uses.

**iOS: Apple's family.**

| Face | SwiftUI | Character | Mockup family |
|---|---|---|---|
| SF Pro | default | neutral, precise | `"SF Pro"` |
| SF Pro Expanded | `.fontWidth(.expanded)` | wide, confident, architectural | `"SF Pro"; font-stretch: 125-150%` |
| SF Pro Condensed / Compressed | `.fontWidth(.condensed)` / `.compressed` | sporty, newsy, dense numerals | `font-stretch: 80%` / `60%` |
| SF Pro Rounded | `.fontDesign(.rounded)` | friendly, soft, tactile | `"SF Pro Rounded"` |
| New York | `.fontDesign(.serif)` | editorial, literary, warm | `"New York"` |
| SF Mono | `.fontDesign(.monospaced)` | technical, instrument, code | `"SF Mono"` |

Heavy SF Pro Expanded at 40pt is a far stronger look than most custom fonts,
and almost no one ships it. Off a Mac the mockup renders Inter in SF's
place (fonts.css); the report says so, the spec still says SF.

**Android: Google's family** (both OFL since late 2025, bundled with the skill).

| Face | Compose / Flutter | Character | Mockup family |
|---|---|---|---|
| Google Sans Flex | brand face for display, headline, title | geometric, warm; variable width (25 to 151%), optical size, grade, roundness | `var(--gsf)`; `font-stretch` for width |
| Google Sans Flex Expanded / Compressed | `FontVariation` wdth | wide and confident / dense numerals | `font-stretch: 125%` / `75%` |
| Roboto Flex | text face for body and label | neutral, highly legible, variable | `var(--roboto)` |
| Roboto Mono / Roboto Serif | mono for codes and figures; serif for editorial | instrument / literary | `"Roboto Mono"`; Roboto Serif via Google Fonts |

Material 3 Expressive pairs Google Sans Flex (display) with Roboto Flex
(text). Character comes from the display sizes (57, 45) and the width axis.
A custom display face over Roboto Flex body is the common crafted move.

**Web: no system face.** `system-ui` is a different font on every machine,
so a web direction must choose a face and load it. The bundled stand-ins
(`var(--web-sans)` Inter, `var(--web-serif)` Newsreader) are for the moment
before the choice; the scan warns until the choice is made or defended.

**A custom face is the other strong option**, and the right one whenever the
concept has a voice the system cannot produce: a bakery, a toy, a film, a
magazine. In an exploration of three, at least one direction should try a
non-Apple face. A custom font is a commitment: bundle it, license it for app
embedding, and map it to Dynamic Type with `Font.custom(_:size:relativeTo:)`.
Use it for display only, and keep SF for UI controls, unless the face has a
full text range.

Faces with character that are licensed for apps (OFL unless noted; always
recheck the licence):

- **Serif display:** Newsreader, Gloock, Young Serif, Libre Caslon Display,
  Bodoni Moda, Instrument Serif, Fraunces (use its "wonk" off), Brygada 1918,
  Petrona, Literata (text).
- **Grotesque / sans display:** Bricolage Grotesque, Familjen Grotesk,
  Schibsted Grotesk, Instrument Sans, Hanken Grotesk, Funnel Display, Host
  Grotesk, Mona Sans / Hubot Sans, Archivo (width axis), Big Shoulders
  Display, Geist.
- **Mono:** Geist Mono, JetBrains Mono, IBM Plex Mono, Martian Mono.
- **Fontshare (ITF free licence, check app clause):** Clash Display, Cabinet
  Grotesk, General Sans, Satoshi, Zodiak, Erode, Gambarino.

**Defaults that read as "nobody chose":** Inter, Poppins, Montserrat, Roboto,
Plus Jakarta Sans, Manrope, DM Sans, Nunito, Raleway, Outfit, Space
Grotesk, Syne, Playfair Display, DM Serif Display, Cormorant, Lora. Use one
only if you can state why it beats SF Pro for this concept.

**Two families maximum.** One is often better. A third is a costume.

**SF Mono is a seasoning.** Mono for codes, times and figures in an
instrument is right; mono for a whole app is a costume of a terminal or a
receipt (slop.md §7).

## 2. The scale

iOS ships a scale (in device.css as `.t-*` classes). The native scale is the
floor for text. The design lives in the **display moments** above it.

| Role | Size | Notes |
|---|---|---|
| Hero numeral / display | 48 to 96 | One per screen, at most. Tracking -2 to -4%. |
| Screen title | 28 to 40 | Large title is 34 by default. Push it if the direction wants. |
| Section heading | 20 to 22 | Semibold/bold. Optional: often space alone separates. |
| Body / row title | 17 | The iOS reading size. Don't drop below 15 for primary text. |
| Secondary | 15 | Subhead. |
| Metadata | 13 | Footnote. |
| Tertiary | 11 to 12 | Captions, tab labels. 11 is the floor. |

**Contrast is the point.** A screen with a 64pt number and 13pt labels feels
designed. A screen of 20, 17, 16, 15, 14 feels like a form. Skip steps. Aim
for five to seven sizes per app, total.

**Weight contrast is two steps or more.** Regular against Bold, Light against
Semibold. Medium next to Semibold is invisible and looks like a mistake.

**Heavy weights for big, light weights never small.** Black/Heavy is for 28pt
and up. Light and Thin are for 34pt and up and only on solid grounds.
Thin text at 15pt is unreadable.

## 3. Tracking and leading

- SF Pro is optically sized: let `font-optical-sizing: auto` (mockups) or
  the system (SwiftUI) do the work in the text range.
- **Display sizes need negative tracking.** At 48pt+, -1.5 to -3%. Heavier
  weights tighter, Expanded widths less tight, Compressed slightly tighter.
  SwiftUI: `.tracking(-1)` or `.kerning`.
- **Small caps labels need positive tracking**: +4 to +8% at 11 to 12pt.
- Leading: display 1.0 to 1.1, titles 1.15 to 1.25, body 1.29 (iOS default
  22/17), long prose 1.4 to 1.5.
- **Light on dark** reads thinner: one weight step up or +0.2pt tracking.

## 4. Numbers

- `font-variant-numeric: tabular-nums` / `.monospacedDigit()` for anything that
  changes, counts, or sits in a column. **Check the face has them**: many
  display faces (Big Shoulders, most serifs) have no tabular figures, so a
  ticking number jitters. Use SF for live figures, or a face that has `tnum`.
  Some serifs default to old-style figures; set `lining-nums` for clocks.
- Currency: make the cents smaller and higher, or lighter. `$1,284` large
  with `.37` at 50% size is a classic premium move.
- Units small, next to the big number, in a lighter weight or secondary colour:
  `23` big, `days` small.
- Rolling numbers on change: `.contentTransition(.numericText())`.

## 5. The emphasis word

The Five Minute Journal move: a roman headline with one italic word.
*"Keep track of your **mood**."* It works because:

- It is **one family**, roman and italic, never two families.
- The italic word is **the one that carries the meaning**, not a random
  adjective.
- It appears in **headlines only**, and not on every headline.

New York has a beautiful italic. SF Pro's italic is weaker for this; with SF,
emphasise by weight (Regular headline, one Bold word) or colour (one word in
the accent).

## 6. Alignment and wrapping

- **Left-aligned by default.** Centre only short, isolated display moments
  (an empty state, a big numeral, a celebration).
- Balance multi-line headlines (`text-wrap: balance`; in SwiftUI break
  lines deliberately or constrain width). No widows on a two-line title.
- Truncate with intent: one-line titles truncate at the tail, never
  mid-word.
- Line length on iPhone is naturally fine; do not shrink margins to fit more.

## 7. Dynamic Type and font scale

An award-level app survives the accessibility sizes. Design at the default
size, then check the largest: stacks that go horizontal at default should go
vertical at accessibility sizes (iOS `ViewThatFits`, `dynamicTypeSize`;
Android font scale 200% with `sp` everywhere; web `rem` and 200% zoom). Never
fix a text size to protect a layout.

## 8. Chinese and other CJK UI

When the brief's UI language includes Chinese (or Japanese, Korean), the
Latin rules above bend:

- **Faces.** Simplified Chinese: PingFang SC (iOS/macOS), Noto Sans CJK SC
  / Source Han Sans (Android, Linux, bundled as Noto Sans SC on Google Fonts),
  Microsoft YaHei (Windows). Traditional: PingFang TC, Noto Sans CJK TC,
  Microsoft JhengHei. Serif: Noto Serif CJK / Source Han Serif, Songti.
  Append `var(--cjk-sc)` (or `--cjk-tc`) to every Latin stack so mixed
  strings fall through correctly. In a published artifact add the Noto Sans
  SC Google Fonts link; for a local shoot the system face or
  `npm run fonts:cjk`.
- **No italics.** CJK faces have none; an italic word in a headline becomes
  a weight or colour emphasis, or a different size. The Five Minute Journal
  move does not translate; find the equivalent (one character in the
  accent, or a larger size).
- **Weight contrast is smaller.** Noto Sans CJK runs Thin to Black, but two
  steps apart reads as one step in Latin. Use three steps or size.
- **Line height is taller**: 1.5 to 1.7 for body (vs 1.3 to 1.4 Latin), 1.2
  to 1.3 for headlines. Characters are square and dense; they need air.
- **Tracking:** zero or slightly positive at text sizes; never negative
  tracking on CJK display type, it collides strokes. Latin digits and words
  inside CJK text get a thin space (`&thinsp;` or the layout's own gap).
- **Length:** Chinese strings run about 30 to 50% shorter than English in
  characters but each glyph is wider; buttons and labels change shape, not
  only length. Lay out for whichever language is longer per string and
  check both.
- **Punctuation** is full-width (，。：) and sits in its own em box;
  `text-align: justify` with `text-justify: inter-ideograph` is normal for
  body paragraphs. Numerals stay in the Latin face (tabular).
- **Mixed-script hierarchy:** when a bilingual screen shows both languages
  at once, one is primary (larger, ink) and the other secondary (ink-2,
  one step smaller), consistently, in the same order on every element.
- **Sizes:** the floor rises; 12 is the minimum CJK body on phones, 13 to
  14 is comfortable. Display CJK at 40+ needs a face with display cuts
  (Noto Sans CJK Black, or a display family) or it looks like body text
  scaled up.
