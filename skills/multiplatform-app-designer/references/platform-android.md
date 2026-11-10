# Android: Material 3 Expressive

Target Android 16 on a Pixel 10 class device, Material 3 Expressive (the
2025 revision of Material 3: springier motion, a wider size ramp, shapes
that react to touch, tonal surfaces instead of shadows). The platform gives
you a complete system; the direction gives it a voice. The failure modes are
the two extremes: a stock Material Theme Builder app that could be any Google
sample, or a web page in a phone frame that ignores the system entirely.

## 1. The canvas

| Device | dp | Status bar | Bottom inset | Margin |
|---|---|---|---|---|
| Pixel 10 / 9 (design target) | 412 x 923 | 48 | 24 gesture / 48 three-button | 16 (24 for editorial) |
| Compact small (check it fits) | 360 x 780 | 48 | 24 | 16 |
| Medium (foldable inner, small tablet) | 600+ wide | 48 | 24 | 24, navigation rail |

Design at 412 x 923 (`data-device="android"`). Check 360 x 780 with
`--small`. The corner radius of the display is about 40dp; concentric
elements near a corner follow it.

Units: dp for layout, sp for text (sp scales with the user's font size, so
text is never fixed in dp). In mockups both equal CSS px.

Edge to edge is mandatory on Android 15+: content draws behind the status
bar and the gesture area, and the system bars are transparent. Design the
top of the screen as content, not as a coloured bar.

## 2. Structure

Material has two layers too: **content** on tonal surfaces, and **navigation
and actions** (top app bar, navigation bar or rail, FAB, toolbar) that float
above it. Depth comes from surface tone (five `surface-container` levels),
not from shadows, and never from blur. Elevation shadows exist but are for
things that are truly lifted (a menu, a dragged item, a FAB).

### Top

- **Top app bar:** small 64dp; medium 112, large 120 (flexible: the title
  sits large below the bar and collapses into it on scroll). Expressive adds
  a **floating** app bar that is a pill inset from the edges. Title left,
  actions right (at most three glyphs; the rest under a three-dot overflow).
  The bar is a tonal surface, often the same as the ground, so content
  scrolls under it with a subtle tone change rather than a shadow.
- A **search bar** is a 56dp pill (not a text field) and opens a full-screen
  search view on compact widths.
- Pull-to-refresh is system (circular indicator, now wavy in Expressive).

### Bottom

- **Navigation bar:** 80dp (flexible 64 in Expressive, labels beside icons),
  three to five destinations, on `surface-container`. The selected
  destination gets a **pill indicator** (`secondary-container`) behind a
  **filled** icon and a label in `on-surface`; unselected are outlined icons
  in `on-surface-variant`. Labels always, 12sp medium. Never inset the bar
  from the sides like an iOS tab bar: it is full width, and it can hide on
  scroll (`hideOnScroll`).
- **FAB:** the primary creation action, **bottom end** (right in LTR), 16dp
  from the edges, above the navigation bar. Sizes: regular 56 (16dp
  corners), medium 80 (20dp), large 96 (28dp). **Extended FAB** carries a
  label and collapses to the icon on scroll. Expressive adds the **FAB
  menu** (the FAB opens into a stack of labelled actions). A centred FAB is
  the old docked-bottom-app-bar pattern: not current.
- **Toolbar (Expressive):** a floating pill of actions, docked at the bottom
  or vertical at the side, that can replace a FAB when there are several
  equal actions. Tonal, 64dp, 16dp from the edges.
- **Bottom sheet:** a surface with a 32dp top corner (`extra-large`) and a
  drag handle, standard (co-exists) or modal (scrim). Detents in Expressive.
- Leave about 100dp of bottom padding so the last item clears the bar and
  the FAB.

### Content

- **Lists:** rows are 56dp (one line), 72 (two lines), 88 (three), with 16dp
  side padding, no dividers by default: proximity and surface separate.
  Leading element is an icon, an avatar (40dp) or an image (56dp); trailing
  is a glyph, a switch or metadata. Segmented buttons, chips (32dp,
  8dp corners) and filter rows live above lists.
- **Cards:** three kinds and each means something: **elevated** (lifted off
  the ground, rare), **filled** (`surface-container-highest`, flat), and
  **outlined** (1dp `outline-variant`). 12dp corners (`medium`); Expressive
  allows 16 to 28 for hero cards. A card is a tappable object, not a section
  wrapper. Lists of cards with 8dp gaps are the Android slop skeleton.
- **Carousel:** the multi-browse carousel (large, medium, small items
  shrinking at the edges) is the native way to show images in a row.
- **Dialogs:** 28dp corners, `surface-container-high`, headline 24sp, text
  buttons at the end. Full-screen dialogs for forms.
- **Snackbar:** bottom, 4dp corners, inverse surface. The only toast-like
  thing you draw.

## 3. Shape

Corner scale: `none` 0, `extra-small` 4, `small` 8, `medium` 12, `large`
16, `large-increased` 20, `extra-large` 28, `extra-large-increased` 32,
`extra-extra-large` 48, `full` (pill). Components have defaults (buttons
`full`, FAB 16, cards 12, sheets 28 top, dialogs 28, text fields 4 top).

Expressive **shape morphing:** a pressed button squares off from `full` to
`medium`; a selected toggle swaps to the opposite shape; a loading indicator
cycles through the **expressive shape set** (cookie, clover, burst, pill,
and the rest). Use the set for one hero object or indicator, not for every
avatar.

A direction can override the scale (square corners for an editorial
concept, 28 everywhere for a toy) if it does so **everywhere**. Mixed radii
that follow no scale are the tell.

## 4. Colour (Material terms)

The colour roles in color.md map onto Material's scheme. Name both in
DIRECTION.md so the handoff is unambiguous:

| color.md role | Material 3 role |
|---|---|
| ground | `surface` (and `background`) |
| raised | `surface-container` … `surface-container-highest` |
| ink | `on-surface` |
| ink-2 | `on-surface-variant` |
| rule | `outline-variant` |
| accent | `primary` (+ `primary-container` for large fills, `on-primary`, `on-primary-container`) |
| positive / negative | `tertiary` / `error` |

Keep **one** expressive colour: `primary`. `secondary` is the navigation
indicator and the quiet chips; `tertiary` is for a real second meaning
only. A scheme where primary, secondary and tertiary are three different
loud hues is the Theme Builder default, and it is confetti.

**Dynamic colour** (the user's wallpaper tints the app) is a system
feature. Decide in DIRECTION.md: support it (then the direction's hue is a
default, and the design must survive any hue, so the richness cannot be the
colour alone), or opt out with a fixed brand scheme (common for a strong
concept). Say which.

Dark mode: `surface` `#131313`-class with the direction's hue, containers
stepping *lighter* (`#1E1E1E`, `#282828`, `#333333`...), primary lightened
and desaturated two steps. Not the light scheme inverted.

## 5. Type

Google Sans Flex for display, headline and title; Roboto Flex for body and
label (the Expressive pairing, `var(--gsf)` and `var(--roboto)` in the
mockup, `.m3-*` classes for the baseline scale). Expressive adds
**emphasized** styles: the same sizes one weight step up, for the one line
that leads a screen.

Character on Android comes from the **width and optical-size axes** of
Google Sans Flex (Expanded headlines, Compressed numerals) and from the
display sizes (57 and 45) that almost nobody uses. A custom face is the
other strong option, as on iOS; see type.md. Tracking in Material is
positive at small sizes (`+0.5` on body-small) and zero to negative at
display sizes.

## 6. Icons

**Material Symbols**, variable: weight 100 to 700, fill 0 or 1, grade,
optical size 20 to 48. Set the weight to the adjacent text's weight, the
optical size to the rendered size, fill only for the selected state. One
style (Outlined, Rounded or Sharp) per app; Rounded pairs with Google Sans
Flex's rounder axis.

In mockups: `<span class="msym">bolt</span>` (fonts.css loads the font after
`npm install`; `.msym.fill` for filled, `.msym.rounded` for the Rounded
style). Name the glyph in HANDOFF.md.

The **adaptive icon** is a 108dp canvas with a 72dp safe zone; the launcher
masks it (circle on Pixel, squircle elsewhere) and may animate the
foreground layer separately. Design the mark inside the 66% circle
(`.app-icon[data-device="android"]` draws the zone), with a background
layer that reads on its own. Monochrome and themed icon variants follow.

## 7. Motion and feel

Expressive motion is spring based: **spatial** springs for things that move
(fast, default, slow) and **effects** springs for colour and opacity. In
mockups approximate with `linear()` (motion.md §2). Native vocabulary:

- **Container transform** (a card grows into its detail screen), **shared
  element** between screens, **fade through** between destinations.
- Shape morph on press, the selection indicator pill that scales in place,
  the wavy progress indicator, the FAB menu bloom.
- **Predictive back:** the screen peeks and scales as the user swipes back
  from the edge; design the detail screen so it survives being shown at 90%.
- Haptics: `HapticFeedbackConstants` (CONFIRM, REJECT, SEGMENT_TICK,
  GESTURE_END). Same discipline as iOS: on state changes, not every tap.

## 8. Quality bar

- Font scale 200% (Settings → Display size and text, largest): nothing
  truncates illegibly, layouts reflow.
- Dark theme designed, not inverted. Dynamic colour decision stated.
- 48 x 48dp touch targets, 8dp between targets.
- TalkBack labels on icon-only controls; the navigation bar labelled.
- Edge to edge: content under the status bar, insets handled.
- The three-button navigation variant (`data-nav="buttons"`) still works:
  check one screen with it.

## 9. Building it (for HANDOFF.md)

Say in the handoff which of these the project uses:

- **Jetpack Compose:** `MaterialExpressiveTheme(colorScheme, motionScheme,
  shapes, typography)`, components from `androidx.compose.material3` with
  the expressive APIs (`FloatingToolbar`, `FloatingActionButtonMenu`,
  `LoadingIndicator`, `ButtonGroup`, `SplitButton`), `MaterialShapes` for the
  shape set. Tokens as a `ColorScheme`, `Typography`, `Shapes`.
- **Flutter:** `ThemeData(useMaterial3: true, colorScheme:
  ColorScheme.fromSeed(...)` or an explicit scheme, `textTheme` with
  `GoogleFonts`/bundled faces. Expressive components via the
  `material_3_expressive` package (M3E* widgets, spring motion) or hand-built
  on `material.dart`. `NavigationBar`, `FloatingActionButton.extended`,
  `BottomSheet`, `SegmentedButton` are all native widgets; restyle, do not
  rebuild.
- Compose and Flutter both read the same DIRECTION.md tokens; handoff.md
  has the templates.
