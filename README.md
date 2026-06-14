# Sisu+

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G41YIDLL)

Sisu+ is a browser extension for Sisu, the study information system used by Finnish universities. It runs inside your
university's own Sisu page and turns the student side of Sisu into a faster planning workspace.

The app brings together the parts students keep checking anyway: degree progress, active courses, enrolments, Moodle
deadlines, study-right details, plan structure, and timeline editing. Native Sisu is still one click away when you need
it.

## what it does

- Replaces the `/student` Sisu view with a React app inside a shadow DOM.
- Opens on a configurable dashboard with degree progress, active courses, registrations, Moodle deadlines, credits,
  grades, workload, and notification prompts.
- Provides a timeline planner where courses can be moved between study periods, searched, added, and checked for timing
  or prerequisite problems before saving the plan back to Sisu.
- Includes a structure view for reading the degree plan, checking attainments, opening course details, and updating
  course versions in bulk.
- Shows registered and available implementations in an enrolments view, then sends the selected registration back to
  Sisu.
- Can remind you about Moodle deadlines, registration windows, and stale Sisu syncs, either inside the app or through
  desktop notifications.
- Keeps a floating control center on Sisu for pausing the extension, changing notification settings, connecting Moodle,
  and returning to native Sisu.
- Includes separate onboarding and landing page builds.

## where it works

Sisu+ supports every Finnish university that uses Sisu. During onboarding you enter your university's Sisu URL, for
example `https://sisu.example.fi`, and the extension builds its local config from that domain.

Some universities have a known Moodle domain in the app already. For everything else, Sisu+ derives the Moodle domain
from the Sisu domain by replacing `sisu.` with `moodle.`. That covers the common setup, but you may still need to adjust
the config if your university uses a different Moodle hostname.

The quick-pick list in onboarding is only there to make setup faster for common universities. It is not a supported
universities list.

## privacy and permissions

Sisu+ does not run a separate student-data backend. It reads the Sisu and Moodle pages/APIs that your browser can
already access, then renders a different interface locally.

Extension settings, including the active/paused toggle and Moodle calendar export URL, are stored with Chrome extension
storage.

Behind the scenes, Sisu+ asks Chrome for optional host permission only for the Sisu and Moodle origins you choose during
onboarding. After that, the background worker registers the content script for that Sisu origin and watches Sisu/Moodle
request headers on the selected origins so it can reuse the session your browser already has.

The extension manifest allows `https://*.fi/*` as optional host permission so the same build can work across Finnish
Sisu universities. The extension does not activate on every `.fi` site. The stored university config decides where the
content script is registered, and the content script exits unless the current host matches that configured Sisu domain.

## development setup

This repo uses Bun.

```bash
bun install
bun run generate:apis
```

`generate:apis` is required after a fresh clone. The generated Sisu API clients are large, so they are ignored by git
and rebuilt locally from Sisu's internal Swagger docs.

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
5. Open your university's Sisu.

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

`generate:apis` regenerates Sisu API clients from Sisu's internal Swagger docs:

- Kori
- Arto
- Ilmo
- Ori
- Osuva

Run it after cloning and whenever the generated types need a refresh. The command depends on the upstream Sisu API docs
being reachable.

## project layout

```text
src/content/                      content-script entrypoint and shadow-root mount
src/background/                   service worker modules
src/background/runtime/           content-script registration and host-scoped request watching
src/background/session/           per-origin Sisu/Moodle session cache
src/background/notifications/     notification prefs, cache, scheduling, and delivery
src/onboarding/                   first-run university and permission setup
src/app/                          Sisu replacement app
src/app/api/generated/            generated Sisu API clients, rebuilt locally
src/app/api/endpoints/            thin Sisu API wrappers
src/app/api/dataPoints/           composed data and mutations used by views/widgets
src/app/api/resolvers/            helpers for resolving Sisu entities
src/app/views/dashboard/          dashboard, hero, widget system, notification nudges
src/app/views/timeline/           study timeline, course search, validation, plan mutations
src/app/views/structure/          degree structure, course details, attainments, version updates
src/app/views/registration/       enrolment cards, dialogs, and registration actions
src/app/components/changelog/     in-app release notes
src/app/controlCenter/            floating pause/settings/notification panel
src/app/locales/                  English and Finnish app copy
src/app/hooks/                    shared React hooks, including Chrome storage
src/app/types/                    shared app and preference types
src/landing/                      public landing page and privacy page
src/shared/                       shared extension/onboarding helpers
docs/agents/                      agent/project workflow notes
docs/sisu-plus-notification-spec.md notification architecture notes
scripts/generate-apis.ts          generated API client refresh script
scripts/prerender-landing.tsx     static landing prerender step
```

## useful notes

- The extension app mounts into a shadow root and injects `src/app/global.css` there.
- The content script replaces the native student page body only when Sisu+ is active.
- Login pages are handed back to native Sisu so authentication still works normally.
- Dashboard layout is stored locally and can be edited in the app.
- Notification data is cached locally. Sisu data refreshes when you visit Sisu; there is no separate background polling
  backend.
- Timeline and structure saves update the Sisu plan, so changes should be reviewed before confirming.

## status

Sisu+ is currently focused on making university Sisu workflows less painful. Near-term work is mostly better course
details, calendar-first planning, cleaner empty states, and smoother setup across Sisu universities.

## acknowledgements

Sisu+ is an independent project. It is not affiliated with any university, Sisu, Moodle, or the organizations behind
those services.
