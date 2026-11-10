# Web: mobile view and desktop view

The web has no system design language, no status bar to respect and no
component library handed to you. That is the freedom and the trap: with
nothing native to lean on, a web screen is slop by default (Tailwind greys,
blue buttons, a white card grid) unless the direction does all the work. On
the other hand the browser *is* the platform: its chrome, its scroll, its
pointer, its text selection, its resizing are what the user feels.

Two targets, designed as one responsive page where possible:

- **Mobile web** (`data-device="web-mobile"`): a phone browser. Chrome on a
  Pixel body by default (status bar 48 + address bar 56 at the top); Safari
  on an iPhone body with `data-browser="safari"` (address bar 83 at the
  bottom, above the home indicator). A web app the user installs (PWA) loses
  the address bar: show it with `data-chrome="none"` plus your own status
  bar only if the brief is a PWA.
- **Desktop web** (`data-device="web-desktop"`): a 1440 x 900 browser
  window, tab strip and address bar at the top (88px). Check 1280 x 720 with
  `--small`.

## 1. The canvas

| Target | CSS px | Safe top | Margin | Content width |
|---|---|---|---|---|
| Mobile web, Chrome on Android | 412 x 923 (visible viewport ~819) | 104 | 16 to 20 | 372 to 380 |
| Mobile web, Safari on iPhone | 402 x 874 (visible ~757) | 62 (bar at the bottom: 117) | 16 to 20 | 362 to 370 |
| Desktop | 1440 x 900 | 88 | 32 to 80 | measured: 640 to 760 for reading, 1200 to 1280 for apps, or full width with a grid |
| Laptop (check) | 1280 x 720 | 88 | 24 to 64 | the same layout, one column fewer |

The address bar eats 50 to 120px of a phone and hides on scroll. Design the
first screen for the *visible* height with the bar present, and never pin
anything important to the bottom edge of a mobile web page: Safari's bar
sits there and Chrome's gesture area does too.

## 2. Breakpoints and the one layout

Design the content once and let it reflow. Three widths are enough for most
apps: **compact** (< 600, one column, the phone), **medium** (600 to 1024,
two columns or a rail, tablets and narrow windows) and **expanded** (> 1024,
the desktop layout). The mockup shows compact and expanded; name the medium
behaviour in HANDOFF.md.

What changes between compact and expanded, in order of importance:

1. **Navigation moves:** a bottom bar or a drawer on compact becomes a left
   sidebar (240 to 280) or a top bar with inline links on expanded. Never a
   hamburger menu on a 1440px screen.
2. **The hero changes scale, not kind.** A 40px headline becomes 72 to 96;
   a full-bleed image stays full-bleed; a colour field stays a field.
3. **Lists become tables or grids** when the user compares; they stay lists
   when the user reads. A desktop table has sortable headers, column
   alignment (numbers right, text left) and a row height of 44 to 56.
4. **Details open beside, not on top.** A phone pushes a detail screen; a
   desktop shows a master-detail split or a side panel. Modals on desktop
   are for decisions, not for content.
5. **Density rises.** Desktop users compare; 13 to 14px metadata, 15 to 16px
   body and 24 to 32 row spacing are normal. Do not blow the phone layout
   up to 1440 with 20px text and 48px gaps: the "stretched phone" is the
   desktop slop.

Measure: body copy stays under 75 characters per line (`max-width: 65ch`).
A dashboard uses the full width with a 12-column grid (gutter 24, margin 32
to 48); an article uses a centred 680px column; a product page is a grid of
cards or a two-column hero. The scan warns on lines over ~80ch and on
desktop pages that leave both flanks empty for no reason.

## 3. Structure

### Mobile web

Behave like the platform the browser runs on, without pretending to be a
native app:

- Top: a slim header (56) with the title and one or two actions, or no
  header at all and a large title in the content. Sticky headers shrink.
- Bottom: a bottom navigation (56 to 64) is fine for an app-like product;
  a page-like product has none and uses the header. **Leave the last 24px
  clear** (the gesture area) and remember Safari's bar covers the bottom
  117px until the user scrolls.
- Forms: native inputs styled, 48px tall, labels above, one column, the
  primary button full width at the end. The keyboard takes half the screen:
  design the form so the active field and the button survive that.
- Touch targets 44px; swipe only where there is also a visible control.
- A QR-entry page (menus, tickets, check-in) has one job above the fold:
  the first screen is the action, not a landing page.

### Desktop web

- **App shells:** sidebar (240 to 280, `surface-container`-like tone) with
  the primary navigation and the brand mark, a thin top bar (56 to 64) with
  search, user and global actions, and the content area with its own page
  title (28 to 40) and actions on the same line. Or a top-nav shell when
  there are fewer than six destinations. Pick one and keep it on every
  screen.
- **Pages and sites:** a header (64 to 80) with the mark left and links
  right, a hero that owns the first viewport, sections at 96 to 160px
  rhythm, a footer that is information, not an afterthought.
- **Tables:** header row 44, body rows 48 to 56, zebra only if dense, hover
  highlight always, a row action menu on hover or a trailing glyph, and a
  real empty state. Sticky header on scroll. Numbers tabular and right
  aligned.
- **Panels and dialogs:** side panels (400 to 480) for a record's details
  and forms; dialogs (480 to 640) for a decision; toasts bottom-left or
  top-right, one at a time.
- **Keyboard and focus:** every control has a visible focus ring (2px,
  offset 2, the accent or ink); the primary flow works with Tab and Enter;
  `/` focuses search in an app shell. Draw the focus state on one frame.
- **Hover:** rows, cards and links show a hover state (a tone change, an
  underline, a revealed action). Draw one on the frame the brief asks for.
  Hover is not a substitute for a visible control: what hover reveals must
  also be reachable another way.
- **Cursor and selection:** text is selectable, pointer on tappables, the
  default cursor elsewhere. Do not disable selection or scrollbars.

## 4. The web's own slop

- **The white SaaS dashboard.** White ground, grey-50 content area, a blue
  `#2563EB` primary button, a 3- or 4-stat card row, a line chart card, a
  table card, Inter, a sidebar with 12 icons. It is the Tailwind UI default
  and the most common generated desktop screen.
- **The hero-with-two-buttons landing page.** Centred 64px headline, grey
  subhead, a filled and an outlined button, a product screenshot in a
  gradient frame, three feature columns with icons, a logo bar.
- **The glassmorphism card** and the **mesh gradient background** on web.
- **The stretched phone** at desktop width, and the **hamburger on desktop**.
- `#F9FAFB` / `#111827` Tailwind greys, 1px `#E5E7EB` borders on everything,
  `rounded-xl shadow-sm` on every block.

Cures are the same as everywhere (slop.md): a concept, one accent with one
job, real content, a hero that owns the screen, richness on the first view.
On desktop, richness is often **scale** (a 120px headline, a full-viewport
image, a table that fills the screen with real data) and **negative space
with intent**, because there is finally room.

## 5. Type on the web

No system face, so the direction must choose (type.md). Load it from Google
Fonts in a published artifact; in the mockup the bundled faces stand in
(`var(--web-sans)` Inter, `var(--web-serif)` Newsreader, `var(--web-mono)`
Roboto Mono) **until the direction picks**, then `@import` or link the real
one. Inter standing in for a face you have not chosen yet is a stage, not a
decision: the scan warns on it until you replace or defend it.

Desktop sizes run larger: display 56 to 120, page titles 28 to 40, body 15
to 17, metadata 12 to 13 (12px is the web floor; 11 only in dense tables).
Set `font-optical-sizing: auto` and `text-wrap: balance` on headlines.

## 6. Colour on the web

Dark mode follows `prefers-color-scheme`; design both. Backgrounds are
rarely pure `#FFFFFF` in a crafted site: a tinted bone, a warm grey, or a
colour field. Links are the accent only if the accent's role is "action";
otherwise ink with an underline.

## 7. Motion on the web

CSS transitions and springs via `linear()` (motion.md §2), `transform` and
`opacity` only, `prefers-reduced-motion` respected. View Transitions for
page-to-page morphs. Hover transitions 120 to 180ms. No scroll-jacking, no
parallax by default, no fade-up on every section.

## 8. Icons and imagery

Material Symbols or Phosphor / Lucide from a CDN, one set, one weight, sized
to the adjacent text. SVG inline for the mark. Imagery per imagery.md;
desktop gives photography room, so a web direction with no imagery must
have a very strong typographic or colour idea.

Favicon and PWA icon: the `.app-icon[data-device="web"]` master (512 master,
maskable with a safe zone, plus a 32px favicon that is a simplified mark).

## 9. Quality bar

- Reflows from 360 to 1440 without horizontal scroll; the small shoot
  (`--small`) is clean.
- Visible focus states; the primary flow works by keyboard.
- Text zoom to 200% survives; `rem` units, no fixed heights on text boxes.
- Colour contrast measured; hover and focus states measured too.
- Real browser chrome in the mockup (the address bar is part of the first
  impression).

## 10. Building it (for HANDOFF.md)

- **React / Next.js:** tokens as CSS custom properties on `:root` with a
  `[data-theme="dark"]` block, mirrored into `tailwind.config` (`theme.extend.colors`
  reading the variables, `fontFamily`, `borderRadius`, `spacing` scale);
  components as small primitives (Button, Field, Row, Panel) styled from
  tokens, not restyled per page; fonts via `next/font` or a Google Fonts
  link; `prefers-reduced-motion` media query around motion; focus-visible
  styles global.
- **Component libraries:** shadcn/ui or Radix for behaviour (menus, dialogs,
  focus management) with the tokens over them; MUI only if the direction is
  deliberately Material on the web.
- **Static site:** the same tokens in plain CSS; the mockup HTML is often a
  usable starting point for the markup.
- handoff.md has the templates.
