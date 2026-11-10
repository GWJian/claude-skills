# Handoff

The design is finished when a coding session that has never seen this chat
can build it from `HANDOFF.md` and the PNGs alone. Write for that reader: a
developer (often you, later, in Flutter or React) who wants values, names and
decisions, not prose about the mood.

The brief named the stack. Export the tokens for that stack (§3) and keep
everything else stack-neutral.

## 1. HANDOFF.md structure

```markdown
# <App> — design handoff

Platforms: <android, ios, web-mobile, web-desktop>   Primary: <…>
Stack: <Flutter | React/Next.js | Compose + SwiftUI | tokens only>
UI language: <English | EN/中文 …>
Mockups: <path or artifact link>   Shots: <path to latest round>   Direction: DIRECTION.md

## 1. Concept in one sentence
<App> is a <thing>. (One line on what that decides: the type, the colour, the motion.)

## 2. Tokens
### Colour (light / dark)
| role | light | dark | M3 role | notes |
| ground | #… | #… | surface | |
| … |
Accent role: <action | today | live | …>. System tint: <accent | ink>.
Dynamic colour (Android): <supported | fixed scheme>.

### Type
| style | face | size / line | weight | tracking | platform text style |
| display | … | 56/56 | 800 | -2% | iOS .largeTitle scaled; M3 displayMedium; web h1 |
| … (5 to 7 rows) |
Faces to bundle/licence: <name, licence, file>. Fallback stack: <…>.
CJK: <face per platform, line-height, rules> (if applicable).

### Space, shape, elevation
Spacing scale: 4 8 12 16 20 24 32 40 48 64. Side margin: <per platform>.
Radius family: <small / medium / capsule> → <values>. M3 corner tokens: <…>.
Elevation: <iOS glass on nav only | M3 surface containers | web shadow tokens>.

## 3. Screens
For each screen in flow order:
### <slug> (<platform>)
Purpose / state shown. Components used (native names: NavigationBar, TabView, Sheet, DataTable …).
Content source (which field, which API). Empty / error / loading behaviour.
Anything the PNG does not show (scroll behaviour, what is below the fold).

## 4. Navigation and layout
Shell per platform (iOS tabs, Android nav bar/rail + FAB, web sidebar/top nav).
Breakpoints (web): compact / medium / expanded and what changes.
Deep links and back behaviour.

## 5. Signature interaction
Trigger → frames → timing (ms, spring params) → haptic / pointer feedback → reduced-motion fallback.
Where it lives (which screen, which element).

## 6. Motion and feedback
Spring presets, durations, which native transitions (container transform, zoom, view transitions).
Haptic events list (mobile).

## 7. Icons and imagery
Icon set + weight; the glyph name for every icon in the screens.
Image art direction; where real images come from; what was a stand-in in the mockup.
App icon: layers / exports needed per platform.

## 8. Accessibility
Dynamic Type / font scale behaviour, contrast results, focus order (web), labels for icon-only controls.

## 9. Open decisions and not designed
What the user must decide; screens listed but not drawn; what the mockup could not verify.
```

## 2. Rules

- **Values, not adjectives.** "#1F6F5C" not "deep teal"; "56/56, 800,
  -1.2px" not "big and bold".
- **Native component names.** The developer should map every drawn element
  to a system or library component; say which and what is custom.
- **Say what was faked in the mockup.** Inter for SF Pro off-Mac, a colour
  field where a photo will go, a drawn glyph that is "Material Symbol:
  bolt". Honesty here saves a week later.
- **One source of truth for numbers.** If a value appears in DIRECTION.md
  and HANDOFF.md, it is the same value. Copy, do not retype.
- **Both appearances** for every colour token. A missing dark value is a
  bug.
- **Content is part of the handoff.** The real strings from Step 3 go into
  the screens section (or a `content.json` beside the file when there are
  many, or two languages).

## 3. Token export per stack

Generate the block for the stack in the brief from the DIRECTION.md tokens
and paste it into HANDOFF.md §2 (or beside it as a file). Names below are
examples; use the project's role names.

### Flutter

```dart
// theme/tokens.dart
import 'package:flutter/material.dart';

class AppColors {
  static const ground = Color(0xFFF3F1EC);
  static const ink = Color(0xFF16130F);
  static const ink2 = Color(0xFF6B655C);
  static const rule = Color(0x1F16130F);
  static const accent = Color(0xFF1F6F5C);
  static const onAccent = Color(0xFFFFFFFF);
  // dark
  static const groundDark = Color(0xFF141311);
  // …
}

ColorScheme lightScheme() => const ColorScheme(
  brightness: Brightness.light,
  primary: AppColors.accent, onPrimary: AppColors.onAccent,
  primaryContainer: Color(0xFFCDEADF), onPrimaryContainer: Color(0xFF0B3A2F),
  secondary: AppColors.ink2, onSecondary: AppColors.ground,
  secondaryContainer: Color(0xFFE4E1DC), onSecondaryContainer: AppColors.ink,
  tertiary: AppColors.accent, onTertiary: AppColors.onAccent,
  error: Color(0xFFB3261E), onError: Colors.white,
  surface: AppColors.ground, onSurface: AppColors.ink,
  onSurfaceVariant: AppColors.ink2, outline: AppColors.ink2, outlineVariant: AppColors.rule,
  surfaceContainerLowest: Colors.white, surfaceContainerLow: Color(0xFFF6F3EE),
  surfaceContainer: Color(0xFFF0EDE8), surfaceContainerHigh: Color(0xFFEAE7E2), surfaceContainerHighest: Color(0xFFE4E1DC),
  inverseSurface: AppColors.ink, onInverseSurface: AppColors.ground, inversePrimary: Color(0xFF8FD4BD),
  shadow: Colors.black, scrim: Colors.black,
);

TextTheme textTheme(TextTheme base) => base.copyWith(
  displayMedium: const TextStyle(fontFamily: 'GoogleSansFlex', fontSize: 45, height: 52 / 45, fontWeight: FontWeight.w600, letterSpacing: -0.5),
  headlineMedium: const TextStyle(fontFamily: 'GoogleSansFlex', fontSize: 28, height: 36 / 28, fontWeight: FontWeight.w600),
  titleLarge: const TextStyle(fontFamily: 'GoogleSansFlex', fontSize: 22, height: 28 / 22, fontWeight: FontWeight.w500),
  bodyLarge: const TextStyle(fontFamily: 'RobotoFlex', fontSize: 16, height: 24 / 16, letterSpacing: 0.5),
  bodyMedium: const TextStyle(fontFamily: 'RobotoFlex', fontSize: 14, height: 20 / 14, letterSpacing: 0.25),
  labelLarge: const TextStyle(fontFamily: 'RobotoFlex', fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w500, letterSpacing: 0.1),
);

ThemeData appTheme(Brightness b) => ThemeData(
  useMaterial3: true,
  colorScheme: b == Brightness.light ? lightScheme() : darkScheme(),
  textTheme: textTheme(ThemeData(brightness: b).textTheme),
  visualDensity: VisualDensity.standard,
);
```

Also list: `pubspec.yaml` font entries (the bundled OFL files), the spacing
constants (`class Space { static const s = 8.0; … }`), the radius constants,
and which widgets are native (`NavigationBar`, `FloatingActionButton.extended`,
`SegmentedButton`, `showModalBottomSheet`) versus custom. For iOS in Flutter,
say which screens use Cupertino widgets.

### React / Next.js (+ Tailwind)

```css
/* styles/tokens.css */
:root {
  --ground: #F3F1EC; --raised: #FFFFFF; --ink: #16130F; --ink-2: #6B655C; --ink-3: #9A948A;
  --rule: rgba(22,19,15,.12); --accent: #1F6F5C; --on-accent: #FFFFFF;
  --font-display: "Newsreader", Georgia, serif; --font-ui: "Inter", system-ui, sans-serif;
  --radius-s: 8px; --radius-m: 16px; --radius-pill: 999px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --measure: 65ch;
}
[data-theme="dark"], :root:not([data-theme="light"]) { @media (prefers-color-scheme: dark) {
  --ground: #141311; --raised: #1E1C19; --ink: #F2F0EB; --ink-2: #A9A399; --ink-3: #6F6A62; --rule: rgba(242,240,235,.12); --accent: #5FB79C; --on-accent: #0B2A22;
} }
```

```js
// tailwind.config.js (extend, reading the variables)
theme: { extend: {
  colors: { ground: "var(--ground)", raised: "var(--raised)", ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" }, rule: "var(--rule)", accent: { DEFAULT: "var(--accent)", on: "var(--on-accent)" } },
  fontFamily: { display: ["var(--font-display)"], ui: ["var(--font-ui)"] },
  borderRadius: { s: "var(--radius-s)", m: "var(--radius-m)", pill: "var(--radius-pill)" },
  maxWidth: { measure: "var(--measure)" },
} }
```

Also list: the type scale as classes or a `typography` object (size, line
height, weight, tracking for each of the 5 to 7 steps), breakpoints
(`sm 600`, `lg 1024` or the project's), the shell components (Sidebar,
TopBar, Page, Panel, DataTable), focus-ring and reduced-motion globals,
fonts via `next/font/google` or a `<link>`.

### Jetpack Compose + SwiftUI

Compose: a `ColorScheme(...)` with the Material roles from the table, a
`Typography(...)` with `FontFamily` for the two faces, `Shapes(...)` with
the corner values, `MaterialExpressiveTheme(colorScheme, typography, shapes,
motionScheme = MotionScheme.expressive())`. Name the expressive components
used (`FloatingToolbar`, `FloatingActionButtonMenu`, `LoadingIndicator`).

SwiftUI: the Asset Catalog colour names (Any/Dark), the `ShapeStyle` and
`Font` extensions (platform-ios.md §10), the `Space` enum, the tint decision,
the glass components used.

### Tokens only (neutral)

```json
{
  "color": { "light": { "ground": "#F3F1EC", "ink": "#16130F", "accent": "#1F6F5C" }, "dark": { "ground": "#141311", "ink": "#F2F0EB", "accent": "#5FB79C" } },
  "type": { "display": { "family": "Newsreader", "size": 56, "line": 56, "weight": 700, "tracking": -1.2 }, "body": { "family": "Inter", "size": 16, "line": 24, "weight": 400, "tracking": 0 } },
  "space": [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  "radius": { "s": 8, "m": 16, "pill": 999 },
  "margin": { "ios": 20, "android": 16, "web-mobile": 16, "web-desktop": 48 }
}
```

A W3C Design Tokens (`.tokens.json`) file is fine too when the person uses
Style Dictionary or Tokens Studio; say so.

## 4. The screen list is a contract

Every frame in the final round appears in §3 with its slug, its platform
and its state. A frame the coding session cannot find in HANDOFF.md, or a
HANDOFF.md screen with no frame, is a defect to fix before reporting done.
