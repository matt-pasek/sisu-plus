# Coding Principles — sisu-plus

Applies to both Claude Code and Codex. These rules reflect the refactoring patterns established across registration,
timeline, structure, and dashboard views.

---

## File Structure

Every feature folder follows this layout:

```
views/<feature>/
  <Feature>.view.tsx       # top-level view, data fetching + layout only
  types/
    <TypeName>.type.ts     # one type or interface per file
    index.ts               # barrel re-export
  util/
    <domain>.ts            # one concern per file (actions, formatters, layout...)
    index.ts               # barrel re-export if useful
  components/
    <ComponentName>.comp.tsx
    icons/
      <IconName>.comp.tsx
      index.ts
  hooks/
    use<HookName>.ts
```

**Rules:**

- One component per `.comp.tsx` file — no multiple exports from a single component file
- One type/interface per `.type.ts` file
- Util files split by domain, not by type — `actions.ts` not `functions.ts`
- Icons go in `components/icons/`, one per file, with an `index.ts` barrel
- Hooks go in `hooks/`, prefixed `use`

---

## File Size

- Typical: 100–400 lines
- Hard maximum: 800 lines
- When a file grows past ~400 lines, extract: inline components → their own `.comp.tsx`, inline helpers → their own util
  file

---

## Functions

Prefer arrow function syntax for utilities and helpers:

```typescript
// preferred
export const getStatusLabel = (status: Status): string => { ... };

// acceptable for complex multi-line logic or recursive functions
export function findOpenDashboardSlot(...) { ... }
```

React components always use arrow syntax:

```typescript
export const MyComponent: React.FC<Props> = ({ foo, bar }) => { ... };
```

---

## Immutability

Never mutate — always return new objects:

```typescript
// wrong
item.x = newX;

// correct
return { ...item, x: newX };
```

---

## Types

- Use TypeScript interfaces for object shapes, type aliases for unions/primitives
- Export types from their own `.type.ts` file; re-export from `types/index.ts`
- Import types with `import type { ... }` when no runtime value is needed
- No `any` — use `unknown` for truly dynamic values and narrow with guards

---

## Components

- Props interface defined in the same file as the component, above it
- No prop drilling more than 2 levels — extract a context or compose differently
- Lift shared state to the nearest common ancestor, not further
- Inline components are fine up to ~30 lines; beyond that, extract to a file

---

## Imports

- Use `@/` path aliases, not relative `../../` paths for cross-feature imports
- Within a feature folder, relative imports are fine (`'./util/actions'`, `'../types'`)
- Keep imports grouped: external libs → internal `@/` → local `./`

---

## Comments

Write no comments unless **why** is non-obvious: a hidden constraint, a subtle invariant, a known browser quirk. Never
document **what** — well-named identifiers do that.

---

## No Console Logs

No `console.log`, `console.warn`, or `console.error` in committed code.

---

## Error Handling

Validate at system boundaries (API responses, user input). Trust internal code and framework guarantees. Don't add
try/catch around code that cannot throw.

---

## Agent skills

### Issue tracker

Issues are tracked in Linear via MCP (Personal team, Sisu+ project). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles mapped to Linear statuses (Backlog, Todo, Cancelled). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` at root (not yet created) + `docs/adr/`. See `docs/agents/domain.md`.

<claude-mem-context>
# Memory Context

# [sisu-plus] recent context, 2026-06-07 12:58am GMT+3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note Format:
ID TIME TYPE TITLE Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,194t read) | 258,764t work | 92% savings

### Jun 6, 2026

2440 11:51p ✅ Added Study Plan canonical term to CONTEXT.md — overrides "Plan" and "HOPS" as Avoid terms 2441 11:52p ✅
Added Module canonical term to CONTEXT.md — umbrella term with subtypes used only when specifically needed 2442 11:53p
✅ Added Course and Enrolment canonical terms to CONTEXT.md — "Course Unit" and "enrollment" both banned 2443 " ✅ Added
Moodle and Moodle Token canonical terms to CONTEXT.md 2444 11:55p ✅ Added ## Views section to CONTEXT.md documenting
all four app views 2445 11:56p ✅ Added Study Period canonical term to CONTEXT.md — "Period", "term", "semester block"
all banned 2446 11:57p ✅ Added Credits canonical term to CONTEXT.md — ECTS accepted as synonym, points/units/hours
banned 2447 " ✅ Added Widget canonical term to CONTEXT.md — grid-based Dashboard panels; card/panel/tile banned 2448
11:58p ✅ Added University canonical term to CONTEXT.md — "configures" is the onboarding action verb

### Jun 7, 2026

2449 12:00a ✅ Added Onboarding canonical term to CONTEXT.md — two-part flow with Control Center walkthrough revealed
2450 12:01a ✅ Added Control Center canonical term to CONTEXT.md — FAB visible in both Sisu and Sisu+, CC abbreviation
permitted 2451 12:02a ✅ Added Active/Inactive canonical term to CONTEXT.md — Sisu+ replaces (not overlays) Sisu UI when
active 2452 12:03a ✅ Added Preferences canonical term to CONTEXT.md — "prefs" accepted as shorthand, settings/config
banned 2453 12:04a ✅ Updated Registration view description in CONTEXT.md — "realisation" introduced as domain term S268
/grill-with-docs domain interview — Q20: Implementation vs Realisation vocabulary resolved via code inspection (Jun 7 at
12:04 AM) 2454 12:06a 🔵 resolveCourseRealisations fetches KORI realisations by assessmentItemId with locale-aware
in-memory cache 2455 " 🔵 Registration view uses "Implementation" not "Realisation" as the domain term in view-layer
code S269 /grill-with-docs domain interview — Q21: "Completions" as a third potentially confusing term alongside
realisations and implementations (Jun 7 at 12:07 AM) 2456 12:07a 🟣 Added Implementation canonical term to CONTEXT.md —
"Realisation" demoted to API-layer-only usage S270 /grill-with-docs domain interview — Q21 cont: Completion Method
definition confirmed, awaiting shortening preference (Jun 7 at 12:07 AM) 2457 12:09a 🔵 Completion Method is a Structure
view concept for how courses can be completed — distinct from Attainment 2458 " 🔵 Completion Method is a
user-selectable KORI property on a Course within the Structure view Study Plan S271 /grill-with-docs domain interview —
Q22: Grade Scale naming and visibility to students (Jun 7 at 12:10 AM) 2459 12:10a ✅ Added Completion Method canonical
term to CONTEXT.md — "completion" accepted as shorthand 2460 " 🔵 Two additional resolver-backed domain concepts
identified: Grade Scale and Prerequisites S272 /grill-with-docs domain interview — Q23: Prerequisites visibility and
location in Sisu+ UI (Jun 7 at 12:11 AM) 2461 12:11a ✅ Added Grade Scale and Grade canonical terms to CONTEXT.md —
"Grading scale" permitted as synonym S273 /grill-with-docs domain interview — Q24: Study Group vs Group canonical naming
and enrolment selection (Jun 7 at 12:12 AM) 2462 12:12a ✅ Added Prerequisite canonical term to CONTEXT.md — flagged in
Timeline on conflict S274 /grill-with-docs domain interview — final check: any uncovered terms before CONTEXT.md is
declared complete (Jun 7 at 12:13 AM) 2463 12:14a ✅ Added Study Group canonical term to CONTEXT.md — includes external
selection gotcha S275 Setup matt-pocock-skills + /grill-with-docs domain interview — BOTH FULLY COMPLETE (Jun 7 at 12:14
AM) 2464 12:15a 🟣 CONTEXT.md finalized at 128 lines with 27 language terms and 4 view definitions S276 Impeccable init
— run /impeccable init on sisu-plus to produce PRODUCT.md, DESIGN.md, and live mode config (Jun 7 at 12:15 AM) 2465
12:16a 🔵 Impeccable Plugin v3.5.0 Script Inventory 2466 " 🔵 Impeccable Requires PRODUCT.md Before Initialization 2467
" 🔵 Impeccable Init Flow: 7-Step Process Documented 2468 " 🔵 sisu-plus Project Structure and Tech Stack Identified
2469 12:17a 🔵 sisu-plus Design System: Dark Theme with Green Accent 2470 12:20a 🟣 PRODUCT.md Created for sisu-plus
2471 12:21a 🔵 Impeccable document.md: DESIGN.md Generation Reference Loaded 2472 " 🔵 sisu-plus Component Inventory and
Landing Page Design Patterns 2473 12:22a 🔵 sisu-plus Core Component Design Patterns: Button and CourseCard 2474 12:23a
🔵 sisu-plus Navbar Component Design Pattern 2475 12:25a 🟣 DESIGN.md Created for sisu-plus: "The Research Console"
Design System 2476 12:26a 🟣 .impeccable/design.json Sidecar Created for sisu-plus 2477 12:27a 🟣 Impeccable Live Mode
Configured for sisu-plus Landing Page 2478 " 🔵 Impeccable critique.md Reference: Two-Assessment Design Review Flow 2479
12:28a 🔵 Impeccable Critique Started on sisu-plus Landing Page 2480 " 🔵 Landing Page Full Structure and Detect.mjs
Clean Result 2482 12:29a 🔵 Impeccable Critique Skill: Two-Assessment Architecture 2481 " 🔵 Undocumented Purple Accent
Found in Landing Feature Card CSS 2483 " 🔵 Sisu+ Landing Page: Design System and Source Structure 2484 " 🔵 Sisu+
Landing Page Component Architecture 2485 12:33a 🔵 Impeccable Critique: Sisu+ Landing Page Scored 27/40 S277 Impeccable
critique of src/landing/ — design audit of the Sisu+ landing page with actionable findings and prioritized fix plan (Jun
7 at 12:34 AM) 2486 12:34a 🔵 Impeccable Layout Reference Guide Loaded 2487 12:35a 🔵 Sisu+ Design System Context Loaded
2488 " 🔵 Sisu+ Landing Page CSS Structure Mapped 2489 12:36a 🔵 Sisu+ Landing Page Component Structure Mapped

Access 259k tokens of past work via get_observations([IDs]) or mem-search skill. </claude-mem-context>
