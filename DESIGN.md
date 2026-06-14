---
name: Sisu+
description: A precise, information-dense app skin for Finnish university Sisu portals
colors:
  night-canvas: '#0d0d11'
  surface: '#15151c'
  surface-raised: '#1d1d28'
  offwhite: '#ddddf0'
  border-subtle: '#222228'
  border-visible: '#34343d'
  muted: '#7878a0'
  shadow-grey: '#454565'
  accent-green: '#419648'
  thesis-green: '#52c989'
  credit-blue: '#7ea0ff'
  warn-amber: '#f0a84d'
  danger-red: '#f06b6b'
typography:
  display:
    fontFamily: 'Fira Sans, system-ui, sans-serif'
    fontSize: 'clamp(4rem, 6.55vw, 6.55rem)'
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: '0'
  headline:
    fontFamily: 'Fira Sans, system-ui, sans-serif'
    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Fira Sans, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: 'Fira Sans, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Fira Code, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.4
rounded:
  pill: '999px'
  lg: '14px'
  md: '10px'
  sm: '8px'
  xs: '6px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.offwhite}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  button-primary-hover:
    backgroundColor: 'rgba(221,221,240,0.1)'
    textColor: '{colors.offwhite}'
  button-accent:
    backgroundColor: 'rgba(65,150,72,0.2)'
    textColor: '{colors.accent-green}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
  button-accent-hover:
    backgroundColor: 'rgba(65,150,72,0.3)'
  card-course:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.md}'
    padding: '14px'
  nav-link:
    textColor: '{colors.muted}'
    rounded: '{rounded.xs}'
    padding: '4px 12px'
  nav-link-active:
    backgroundColor: 'rgba(221,221,240,0.05)'
    textColor: '{colors.offwhite}'
---

# Design System: Sisu+

## 1. Overview

**Creative North Star: "The Research Console"**

Sisu+ is a serious instrument for academic work. Its visual language is built around the idea of a well-designed
information console: dark enough to recede, structured enough to handle density, and composed enough to inspire
confidence rather than anxiety. The palette borrows from high-contrast developer tooling (Fira's humanist sans paired
with its own monospace companion) and applies it to a domain where clarity has real stakes — a student planning their
degree is not browsing; they are making consequential decisions.

The system does not decorate. Containers are layered by tonal lightness alone: surface tokens step from near-void to
near-visible in small increments, never using shadows to claim importance. The single bright accent (Thesis Green) is
strictly rationed — it marks completed states, confirmed actions, and progress — because its rarity is what makes it
meaningful. When the green lights up, something real has happened.

The system explicitly rejects the SaaS-dashboard reflex (purple gradients, identical card grids, "streamline your
workflow" voice), the clunky institutional aesthetic of OG Sisu (table-heavy, government gray, form-over-function), the
juvenile playfulness of student apps (loud colors, rounded blobs, confetti), and the developer-monoculture look where
everything resembles a terminal emulator. Sisu+ is dark and precise, but it is built for students, not developers.

**Key Characteristics:**

- Near-void background with fine-grained tonal layering (no drop shadows at rest)
- Single accent color (Thesis Green) used for confirmable states only
- Fira humanist sans + Fira mono — one type family, two registers
- Ring shadows (single-pixel at low opacity) instead of ambient drop shadows
- Tonal hover: interactivity communicated through luminance shift, not hue change
- Finnish/English bilingual; layouts sized for the longer string

## 2. Colors: The Night Canvas Palette

A near-monochrome dark palette anchored by one earned accent.

### Primary

- **Thesis Green** (`#52c989`): The sole expressive color. Reserved for states that represent achievement or readiness —
  passing grades, fulfilled prerequisites, confirmed enrolments, progress indicators. Its rare use is the design's most
  deliberate constraint. Also used in limited quantities on the landing page for CTAs and emphasis.

### Secondary

- **Credit Blue** (`#7ea0ff`): Used exclusively for credit counts on course cards. A single-purpose accent that keeps
  numeric academic values visually distinct without competing with Thesis Green.

### Tertiary

- **Accent Green (Dark)** (`#419648`): The deeper hue underlying Thesis Green. Used for button border and background
  tints in the `accent` button variant, and for the nav bar credit badge background. Never used where Thesis Green is
  used directly.

### Neutral

- **Night Canvas** (`#0d0d11`): The void. Page background for both the app and landing page. The slight blue-violet
  shift at this lightness is intentional; pure black reads as a rendering artifact.
- **Surface** (`#15151c`): The primary container surface. Cards, nav bar, and any element that needs to sit one step
  above the background.
- **Surface Raised** (`#1d1d28`): Secondary container — footers inside cards, table rows, nested panels. One more step
  up from Surface.
- **Offwhite** (`#ddddf0`): Primary text. A blue-biased near-white (matches the hue of the dark palette) rather than a
  warm cream. Warm white on a cool-dark background creates a temperature war; this avoids it.
- **Border Subtle** (`#222228`): The resting border for all containers. Low contrast, just enough to define structure.
- **Border Visible** (`#34343d`): Hover/active border, dividers that need more visual weight.
- **Muted** (`#7878a0`): Secondary text, nav links at rest, supporting information. The mid-tone in the luminance ramp.
- **Shadow Grey** (`#454565`): Tertiary text, metadata, disabled states.

**The One Accent Rule.** Thesis Green is used on ≤10% of any given screen. If a second element wants to be "green", it
is not important enough to be green.

**The Temperature Rule.** Text is offwhite (`#ddddf0`), not warm white. Backgrounds are cool-shifted dark, not warm
neutral. There are no beige, cream, or sand tones anywhere in this system.

## 3. Typography

**Display / Body Font:** Fira Sans (humanist sans-serif) **Mono / Label Font:** Fira Code (paired monospace from the
same Fira family)

**Character:** A single type family in two registers. Fira Sans carries all prose, headings, and UI copy; Fira Code
handles course codes, credit counts, and any numeric academic data. The pairing is invisible in the best sense — it
reads as one coherent voice, not two competing ones.

### Hierarchy

- **Display** (700 weight, `clamp(4rem, 6.55vw, 6.55rem)`, line-height 0.96): Landing page hero headlines only. Tight
  leading, zero letter-spacing. Never used inside the app.
- **Headline** (700 weight, `clamp(1.5rem, 3vw, 2.25rem)`, line-height 1.1, -0.01em tracking): Section titles, view
  headings. Tightly leaded.
- **Title** (600 weight, `1rem`, line-height 1.4): Card headings, modal titles, widget names.
- **Body** (400 weight, `0.875rem`, line-height 1.6): All prose, widget content, descriptions. Keep line length ≤72ch
  where layout permits.
- **Label / Mono** (Fira Code, 500 weight, `0.75rem`, line-height 1.4): Course codes, credit values, numeric academic
  data, metadata pairs. Monospace for tabular alignment.

**The One Family Rule.** Do not introduce a third typeface. If a surface needs more variety, use weight contrast
(300/400/600/700) within Fira Sans.

## 4. Elevation

This system is flat by default. Depth is expressed through tonal surface steps, not through drop shadows. Containers are
distinguished by background color (Night Canvas → Surface → Surface Raised), not by being "lifted" off the page with
blur or shadow.

The exception is the **ring shadow**: a single-pixel `box-shadow: 0 0 0 1px rgba(255,255,255,0.055)` outline that
defines card boundaries at rest. On hover or selection, the ring becomes more visible (`rgba(255,255,255,0.10)`) or
shifts to the Thesis Green tint (`rgba(82,201,137,0.24)`) for selection state. This is not a shadow in the traditional
sense; it is a border that lives in the shadow layer.

### Shadow Vocabulary

- **Ring (rest)** (`box-shadow: 0 0 0 1px rgba(255,255,255,0.055)`): All cards and containers at rest. Barely visible —
  presence without assertion.
- **Ring (hover)** (`box-shadow: 0 0 0 1px rgba(255,255,255,0.10), 0 10px 28px rgba(0,0,0,0.18)`): Cards on hover. The
  ring brightens; a diffuse ambient shadow appears beneath.
- **Ring (selected)** (`box-shadow: 0 0 0 1px rgba(82,201,137,0.24)`): Selected course cards. Ring shifts to Thesis
  Green tint.
- **Landing Glow** (`box-shadow: 0 0 36px rgba(82,201,137,0.24)`): Primary CTAs on the landing page only. Not used
  inside the app.

**The Flat-By-Default Rule.** Shadows only appear as a response to state (hover, selection). At rest, containers are
defined by tonal layering alone. If a surface needs a shadow to communicate hierarchy, the tonal step between surface
tokens is wrong, not the shadow.

## 5. Components

### Buttons

Three variants, all sharing the same shape foundation.

- **Shape:** Gently rounded corners (8px / `rounded-sm`), minimum height 2.5rem.
- **Primary:** Dark surface background (`#15151c`), offwhite text, subtle border (`border-border`). Hover:
  `rgba(255,255,255,0.10)` background tint. The default for most actions.
- **On-Surface:** Same as Primary but uses `Surface Raised` background — for buttons placed inside card or panel
  surfaces.
- **Accent:** `rgba(65,150,72,0.20)` background with Accent Green text and Accent Green border. Used for confirmable
  actions (enrol, confirm plan). The green must mean something; use sparingly.
- **Disabled:** All variants flatten to `Surface` background, `Muted/90` text, `Border Subtle` border. No hover state,
  `cursor-not-allowed`.
- **Active press:** `scale(0.96)` on `:active` for tactile feedback.
- **Focus:** `outline: 2px solid rgba(82,201,137,0.75); outline-offset: 3px` — consistent across all interactive
  elements.

### Cards / Containers

- **Corner Style:** 10px radius (`rounded-md`) — slightly rounder than buttons, clearly distinct from fully-rounded
  pills.
- **Background:** Surface (`#15151c`) at rest.
- **Border:** Ring shadow at rest (`0 0 0 1px rgba(255,255,255,0.055)`); ring brightens on hover.
- **Hover:** Background shifts to `Surface/95` (barely lighter); ring brightens; ambient shadow appears.
- **Internal Padding:** 14px horizontal, 12px vertical for card headers.
- **Card footer:** Surface Raised background (`rgba(29,29,40,0.55)`), separated by a Border Subtle divider. Used for
  metadata rows.

### Navigation (App)

- **Container:** Sticky top bar, `bg-surface`, bottom `border-border`.
- **Nav links:** Text at `Muted` at rest; hover and active shift to Offwhite with `bg-offwhite/5` background tint.
  `rounded-xs` (6px) corners on the tint. No underline, no side accent stripe.
- **Active state:** `bg-offwhite/5` background tint + Offwhite text. The same visual weight as hover — the system does
  not need a louder active signal.
- **Credit badge:** `bg-lighterGreen/20` background, Thesis Green text, `rounded-xl` pill, `tabular-nums`. The navbar's
  only non-neutral element.

### Navigation (Landing)

- **Container:** Floating pill, fixed top, `backdrop-filter: blur(18px)`, `background: rgba(21,21,28,0.72)`,
  single-pixel border at `rgba(255,255,255,0.08)`. Bottom edge has a Thesis Green underline glow.
- **Links:** Same color transition as app nav links (Muted → Offwhite). Hover reveals a scaleX(1) underline in Thesis
  Green beneath the link.

### Inputs / Fields

- **Style:** Surface Raised background, Border Subtle stroke, 8px radius. No fill indicator at rest.
- **Focus:** Ring shifts to `rgba(82,201,137,0.4)` — the same green accent family as selection states elsewhere.
- **Error:** Ring shifts to Danger Red; error text in Danger Red below the field.

### Course Card (Signature Component)

The primary information unit in the Registration and Timeline views.

- Shape and shadows follow the card spec above.
- **Color stripe:** A 4px vertical pill on the left edge uses the module's color for category identification. Not a
  `border-left`; it is a narrow child element with its own `rounded-full` shape.
- **Course code / credits row:** Fira Code mono, `text-darkishGrey` for code, `text-[#7ea0ff]` for credits. Separated by
  a centered dot.
- **Selection:** Ring shifts to Thesis Green tint. No background fill change on selection.

## 6. Do's and Don'ts

### Do:

- **Do** use ring shadows (`0 0 0 1px rgba(255,255,255,0.055)`) as container boundaries at rest. This is the system's
  border convention.
- **Do** communicate interactivity through luminance shifts only — `bg-offwhite/5` for hover, `text-offwhite` for
  active. No hue changes for hover states.
- **Do** use Fira Code for all numeric academic values (credits, course codes, grades). Monospace alignment is a
  semantic signal in a dense academic interface.
- **Do** use `text-wrap: balance` on h1–h3 for even line lengths.
- **Do** size layouts for Finnish text — it runs ~40% longer than English equivalents in labels and button copy.
- **Do** respect `prefers-reduced-motion`: all transitions and entrance animations must have a reduced-motion fallback
  (instant or opacity-only).
- **Do** keep Thesis Green below 10% of any screen's surface area. Its rarity is its meaning.

### Don't:

- **Don't** introduce a second accent color. Credit Blue (`#7ea0ff`) is a single-purpose numeric token, not a second
  expressive accent.
- **Don't** use warm neutrals (beige, cream, sand, linen, `#f5f0e8`, any warm near-white). The temperature of this
  system is cool-to-neutral throughout.
- **Don't** use `border-left` as a colored stripe on cards or callouts. The course card's color indicator is a narrow
  child element — not a border-left decoration.
- **Don't** use drop shadows to establish hierarchy at rest. Tonal surface steps carry hierarchy; shadows are reserved
  for hover and selection state.
- **Don't** use gradient text (`background-clip: text`). Color emphasis is achieved through Thesis Green as a solid
  fill, never as a gradient.
- **Don't** make Sisu+ look like a SaaS dashboard — no purple gradients, no identical-card grids with icon + heading +
  one-line description, no "streamline your workflow" motion templates.
- **Don't** replicate OG Sisu's aesthetic — no table-heavy layouts, no institutional gray, no form-heavy page structures
  where the product's job is to replace them.
- **Don't** use playful student-app patterns — no cartoon illustrations, no confetti on grade receipt, no excessively
  rounded UI that reads as juvenile.
- **Don't** make the dark theme feel like a terminal emulator — the font choice (Fira Code) is already
  developer-adjacent; the rest of the system should pull toward refined product, not CLI tool.
- **Don't** add unnecessary motion to data-heavy views. Animation earns its place on the landing page hero and page
  transitions; inside the app, state transitions should be ≤200ms and purely functional.
