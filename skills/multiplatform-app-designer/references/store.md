# Store screenshots: App Store and Google Play

One poster series, exported for each store the brief needs. The composition
rules below are shared; the specs differ. Mockup: a `.screen` with
`data-chrome="none"` styled at the panel's logical size and shot at the
scale that gives the store's pixel size.

The product page is a poster series, not a feature list. Two references that
get it right, and why:

- **Apple News+.** One saturated ground (News red) across every panel, a
  two-line white caption in SF Pro semibold at the top, the real UI on a real
  device below it, the device cropped by the bottom edge. Each panel shows a
  *different kind of content* (magazines, recipes, puzzles, sports, local), so
  the series proves range. Nothing else on the panel.
- **Five Minute Journal.** Panel one is a different colour (marigold) and
  is pure proof: the claim, the review count, the press logos. Every later
  panel is the same warm grey with a serif headline using **one italic word**
  ("Keep track of your *mood*."), and the UI is shown tilted, cropped, or as
  a single blown-up component instead of always the full phone.

## Specs

**App Store (iPhone)**

- Required size for the 6.9" class: **1320 x 2868** px portrait (1290 x
  2796 also accepted). Up to 10 screenshots. The first three show in search
  results, so they carry the pitch.
- Mockup: a `.screen` with `data-chrome="none"` styled at 440 x 956 and shot
  at `--scale 3` gives 1320 x 2868.
- Readable as a thumbnail: the caption must read at about 150px wide. That
  means 2 lines, 5 to 8 words, 64 to 90px type at full size.

**Google Play (phone)**

- Phone screenshots: 2 to 8, JPEG or 24-bit PNG, each side 320 to 3840 px,
  aspect between 16:9 and 9:16. Use **1080 x 2400** (9:20 is also fine, but
  1080 x 2400 matches the Pixel frame). Mockup: a panel styled at 360 x 800
  shot at `--scale 3`.
- Feature graphic: **1024 x 500**, required, shown above the listing and as
  the video poster. No device frame needed; the mark, the claim, the ground.
  Mockup: a `.screen` with `data-chrome="none"` styled at 512 x 250 at
  `--scale 2`.
- App icon in the listing: 512 x 512, 32-bit PNG, no transparency; Play
  applies its own rounded mask.
- Play shows screenshots as a horizontal strip of tall thumbnails; the
  caption floor is the same as the App Store's.
- 7" and 10" tablet screenshots are separate uploads; make them only if the
  brief covers tablets.

**Web**: an Open Graph image (1200 x 630) and the PWA maskable icon (512)
are the equivalent "store" assets; a panel at 600 x 315 shot at 2x.

## The series

1. **Panel 1 is the promise or the proof.** Either the single most
   impressive screen with the clearest one-line claim, or a proof panel
   (awards, press, ratings) if the app has real ones. Never invent proof.
2. **Panels 2 to 5: one benefit each,** in the order a new user cares
   about. Caption says the benefit in the user's words, the screen shows it
   happening. "Plan the week in one swipe", not "Powerful planning
   features".
3. **One visual system across all panels:** same ground (or a deliberate
   sequence of grounds), same caption position, same type, same device
   treatment. Then **break it once** for rhythm: a panel with the UI blown up
   past the frame, or a component floating alone, or a tilted phone.
4. **Show real, beautiful content** inside the UI: the best photos, the
   most interesting data, a full-looking state.
5. Dark and light: if the app has a stunning dark mode, give it a panel.

## Composition

- Caption at the top, 120 to 180px from the edge (at full size), left-aligned
  or centred, **consistent** across the set.
- Device below, often cropped by the bottom edge; this reads as more
  confident than a phone floating with margin all around.
- A phone frame is optional. Frameless UI with a large radius and a soft
  shadow is equally current. Pick one.
- Never: starbursts, "NEW!" badges, laurels you did not win, five different
  background colours, clip-art arrows, feature bullet lists, the device at
  three random angles.

## Captions

- Sentence case, benefit-first, 5 to 8 words, two balanced lines.
- One emphasis device at most (an italic word, or one word in the accent).
- Localise the captions, not just the UI. For EN/中文 listings the Chinese
  caption is a separate panel set, not a second line on the same panel.
- Platform fidelity: the device in an App Store panel is an iPhone and the
  UI inside it is the iOS design; the Play panel shows the Android design
  in a Pixel body. Never ship one platform's UI in the other store.
