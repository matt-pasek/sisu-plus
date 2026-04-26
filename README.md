# Sisu+

Sisu+ is a browser extension for LUT University's Sisu. It swaps the default student pages for a cleaner dashboard, an
editable study timeline, and a small control panel for jumping back to native Sisu when you need it.

The project is still young, but the useful parts are already here: credits, enrolments, Moodle deadlines, study-right
progress, timeline editing, and prerequisite warnings.

## what it does

- Replaces the `/student` Sisu view with a React app inside a shadow DOM.
- Shows a configurable dashboard with widgets for degree progress, active courses, Moodle deadlines, semester stats,
  grades, credits, and upcoming workload.
- Adds a timeline view where planned courses can be moved between study periods before confirming the updated plan back
  to Sisu.
- Warns about timing and prerequisite issues when you start editing the plan.
- Keeps a floating control center on Sisu so the extension can be paused, resumed, and connected to a Moodle calendar
  export URL.
- Includes a separate landing page build for the public project site.

## where it works

Right now Sisu+ targets:

- `https://sisu.lut.fi/*`
- `https://moodle.lut.fi/*` for Moodle calendar data

The code is structured around Sisu's internal APIs, so adding another university is possible, but not automatic. The
first working target is LUT.

## privacy

Sisu+ does not run a separate student-data backend. It reads the Sisu and Moodle pages/APIs that your browser can
already access, then renders a different interface locally.

Extension settings, including the active/paused toggle and Moodle calendar export URL, are stored with Chrome extension
storage.

## development setup

This repo uses Bun.

```bash
bun install
```

Run the extension build in watch mode:

```bash
bun run dev
```

Build the extension once:

```bash
bun run build
```

Then load the generated `dist/` folder in Chrome:

1. Open `chrome://extensions`.
2. Enable developer mode.
3. Choose "Load unpacked".
4. Select this repo's `dist/` folder.
5. Open `https://sisu.lut.fi/student`.

Chrome does not always pick up extension changes cleanly. If something looks stale, reload the extension from
`chrome://extensions` and refresh the Sisu tab.

## landing page

Run the landing page locally:

```bash
bun run dev:landing
```

Build it:

```bash
bun run build:landing
```

The landing build writes to `dist-landing/`.

## scripts

```bash
bun run typecheck
bun run build
bun run build:landing
bun run generate:apis
```

`generate:apis` regenerates Sisu API clients from LUT's internal Swagger docs:

- Kori
- Arto
- Ilmo
- Ori
- Osuva

Use it only when the generated types need a refresh. The command depends on the upstream Sisu API docs being reachable.

## project layout

```text
src/content/                 content-script entrypoint
src/background/              extension service worker
src/app/                     Sisu replacement app
src/app/api/endpoints/       thin Sisu API wrappers
src/app/api/dataPoints/      composed data used by views/widgets
src/app/api/resolvers/       helpers for resolving Sisu entities
src/app/views/dashboard/     dashboard and widget system
src/app/views/timeline/      study timeline UI and validation
src/app/controlCenter/       floating pause/settings panel
src/landing/                 public landing page
scripts/generate-apis.ts     generated API client refresh script
```

## useful notes

- The extension app mounts into a shadow root and injects `src/app/global.css` there.
- The content script replaces the native student page body only when Sisu+ is active.
- Login pages are handed back to native Sisu so authentication still works normally.
- Dashboard layout is stored locally and can be edited in the app.
- Timeline saves update the full Sisu plan, so changes should be reviewed before confirming.

## status

Sisu+ is currently focused on making the LUT student workflow less painful. Near-term work is mostly better course
details, calendar-first planning, cleaner empty states, and support for more Sisu universities once the LUT version is
solid.

## acknowledgements

Sisu+ is an independent project. It is not affiliated with LUT University, Sisu, Moodle, or the organizations behind
those services.
