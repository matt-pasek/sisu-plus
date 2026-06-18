<div align="center">

# Sisu+

**Sisu, but usable.**

[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/oaimdmdjlgfgfigmblpolficgleijcoe?style=flat-square&label=version&color=6d28d9)](https://sisu-plus.matt-pasek.dev/install)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/oaimdmdjlgfgfigmblpolficgleijcoe?style=flat-square&label=users&color=0e7490)](https://sisu-plus.matt-pasek.dev/install)
[![Chrome Web Store Last Updated](https://img.shields.io/chrome-web-store/last-updated/oaimdmdjlgfgfigmblpolficgleijcoe?style=flat-square&label=updated&color=0e7490)](https://sisu-plus.matt-pasek.dev/install)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/oaimdmdjlgfgfigmblpolficgleijcoe?style=flat-square&label=rating&color=0e7490)](https://sisu-plus.matt-pasek.dev/install)
[![License](https://img.shields.io/github/license/matt-pasek/sisu-plus?style=flat-square&color=6d28d9)](./LICENSE)
[![ko-fi](https://img.shields.io/badge/ko--fi-support%20the%20project-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/G2G41YIDLL)

[![Finnish universities](https://img.shields.io/badge/🇫🇮_Finnish_universities-supported-1a1a2e?style=flat-square)](https://sisu-plus.matt-pasek.dev)
[![Built with](https://img.shields.io/badge/built_with-React_%2B_TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://sisu-plus.matt-pasek.dev)
[![MV3](https://img.shields.io/badge/manifest-v3-22c55e?style=flat-square)](https://sisu-plus.matt-pasek.dev)

<br/>

[<img src="https://img.shields.io/badge/Chrome_%7C_Firefox-Install-6d28d9?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Install for Chrome or Firefox" height="36"/>](https://sisu-plus.matt-pasek.dev/install)

</div>

---

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

The Astro landing build writes to `dist-landing/`.

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
sisu-plus/
├── scripts/
│   ├── export-translations.ts    generate an TSV file for translations
│   └── generate-apis.ts          regenerate Sisu API clients from Swagger docs
├── docs/
│   └── agents/                   agent/project workflow notes
├── src/
│   ├── content/                  content-script entrypoint and shadow-root mount
│   ├── background/               service worker
│   │   ├── runtime/              content-script registration and host-scoped request watching
│   │   ├── session/              per-origin Sisu/Moodle session cache
│   │   └── notifications/        notification prefs, cache, scheduling, and delivery
│   ├── onboarding/               first-run university and permission setup
│   ├── shared/                   helpers shared across extension and onboarding
│   ├── landing/                  Astro landing page and privacy policy
│   └── app/                      the Sisu replacement app
│       ├── api/
│       │   ├── generated/        generated Sisu API clients (rebuilt locally, not in git)
│       │   ├── endpoints/        thin wrappers around generated clients
│       │   ├── dataPoints/       composed data and mutations used by views and widgets
│       │   └── resolvers/        helpers for resolving Sisu entities
│       ├── views/
│       │   ├── dashboard/        dashboard, hero panel, widget system
│       │   ├── timeline/         study timeline, course search, validation, plan mutations
│       │   ├── structure/        degree structure, attainments, course details, version updates
│       │   └── registration/     enrolment cards, dialogs, and registration actions
│       ├── components/
│       │   └── changelog/        in-app release notes
│       ├── controlCenter/        floating pause/settings/notification panel
│       ├── locales/              English and Finnish app copy
│       ├── hooks/                shared React hooks, including Chrome storage
│       ├── types/                shared app and preference types
│       └── global.css            injected into shadow root
└── dist/                         extension build output (load this in chrome://extensions)
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

Sisu+ is under active development. The focus right now is on rounding out course details, re-creating calendar view, and
making setup seamless across every Finnish university running Sisu.

## acknowledgements

Sisu+ is an independent project. It is not affiliated with any university, Sisu, Moodle, or the organizations behind
those services.
