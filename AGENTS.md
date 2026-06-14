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

# [sisu-plus] recent context, 2026-06-07 3:37pm GMT+3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note Format:
ID TIME TYPE TITLE Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,781t read) | 490,675t work | 96% savings

### Jun 7, 2026

S270 /grill-with-docs domain interview — Q21 cont: Completion Method definition confirmed, awaiting shortening
preference (Jun 7 at 12:07 AM) S271 /grill-with-docs domain interview — Q22: Grade Scale naming and visibility to
students (Jun 7 at 12:10 AM) S272 /grill-with-docs domain interview — Q23: Prerequisites visibility and location in
Sisu+ UI (Jun 7 at 12:11 AM) S273 /grill-with-docs domain interview — Q24: Study Group vs Group canonical naming and
enrolment selection (Jun 7 at 12:12 AM) S274 /grill-with-docs domain interview — final check: any uncovered terms before
CONTEXT.md is declared complete (Jun 7 at 12:13 AM) S275 Setup matt-pocock-skills + /grill-with-docs domain interview —
BOTH FULLY COMPLETE (Jun 7 at 12:14 AM) S276 Impeccable init — run /impeccable init on sisu-plus to produce PRODUCT.md,
DESIGN.md, and live mode config (Jun 7 at 12:15 AM) S277 Impeccable critique of src/landing/ — design audit of the Sisu+
landing page with actionable findings and prioritized fix plan (Jun 7 at 12:27 AM) S278 Impeccable layout pass on
sisu-plus landing page — reducing kicker-label scaffolding and reordering sections (Jun 7 at 12:34 AM) 2489 12:36a 🔵
Sisu+ Landing Page Component Structure Mapped 2490 1:49p 🔵 Impeccable Layout Skill Reference Loaded 2491 1:50p 🔵 Sisu+
Landing Page CSS Architecture Mapped 2492 " 🔵 Sisu+ Dual-Surface Architecture Confirmed via Impeccable Context 2493 "
🔵 Landing Page Component and Section Architecture Mapped 2494 1:54p ✅ Privacy Section Kicker Removed from LandingPage
2495 " ✅ Roadmap Section Kicker Removed from LandingPage 2496 " ✅ Support Section Removed and Universities Kicker
Stripped from Landing Page 2497 1:55p ✅ Support Section Re-added After Universities, Kicker-free and Reordered 2498 "
🔵 Section Container CSS Verified — No Kicker-Dependent Spacing Found 2499 1:58p 🔵 Landing Page Responsive Architecture
— Two Breakpoints Confirmed 2500 2:03p ⚖️ Widget Redesign Initiative Started for Impeccable/Sisu 2501 " 🔵 Sisu+ Design
System Fully Documented in DESIGN.md and PRODUCT.md 2502 2:04p 🔵 Widget System File Structure Mapped in Sisu+ Dashboard
2503 " 🔵 Existing Widget Components: Shell Architecture with Drag-Resize Support 2504 " 🔵 Dashboard Widget Inventory:
10 Widgets Defined, 6 in Default Layout 2505 " 🔵 All Six Default Widget Content Components Audited Before Redesign 2506
2:05p 🔵 Dashboard.view.tsx: Full Orchestration Architecture Audited 2507 2:06p 🔵 Mockup HTML Contains New Widget
Proposals Beyond Current 10 2508 2:07p 🔵 Mockup Bundle Structure: 8 Meaningful JS Assets Identified 2509 " 🔵 Mockup
WidgetShell API and Icon Set Extracted 2510 2:08p 🔵 Redesigned Widget Patterns and 5 New Widget Designs Fully Extracted
from Mockup 2511 " 🔵 Widget Shell CSS Spec Extracted: Complete Token Set and Primitive Classes 2512 2:09p 🔵
UpcomingRegistrations Widget Design Extracted — Seats, State, and Urgency Pattern 2513 2:11p 🟣 WidgetIcon Component
Created — Shared Icon Registry for Redesigned Widgets 2514 " 🟣 Widget.comp.tsx Redesigned — New Shell with Eyebrow,
Icon, Badge, and Top Sheen 2515 2:12p 🟣 DashboardWidgetShell Updated to Pass icon/eyebrow/badge to Widget; Edit
Controls Get SVG Icons 2516 2:13p 🟣 DegreeCompletionContent Redesigned — Tighter Proportions, Module Dot Indicator,
Glow on Completion 2517 " 🟣 SemesterStatsContent Redesigned — StatStrip Pattern with Icon Circles and Sparklines 2518
2:14p 🟣 MoodleDeadlinesContent Redesigned — Timeline Connector Pattern 2519 2:16p 🟣 ActiveCoursesContent Redesigned —
Color Stripe + Module/Credits Pill Pattern 2520 " 🟣 GradeTrendContent Redesigned — Area Gradient + Curve + Trend Line +
Dots Chart 2521 " 🟣 CreditsVelocityContent Redesigned — Thinner Bars with Glow + Diagonal Stripe Pattern 2522 " 🟣
WorkloadForecastContent Redesigned — Vertical Bars with Gradient Fill + Glow + Tone-Colored Labels 2523 2:17p 🟣
GraduationCountdownContent Redesigned — 3-Tile Horizontal Layout with CountCell Component 2524 " 🟣
RecentAchievementsContent Redesigned — Grade Badge Rows with Hover + Course Code Sub-label 2525 " 🟣 TimelinePeekContent
Redesigned — Period Cards with Module Color Dot + Course Sub-row 2526 2:18p 🟣 GradeDonutContent — New Widget Component
Created 2527 " 🟣 CreditPaceContent — New Widget Component Created 2528 " 🟣 widgetDefinitions.ts Updated — grade-donut
and credit-pace Added 2530 2:19p 🟣 DashboardWidgetId.type.ts Updated — grade-donut and credit-pace Added 2532 2:20p 🟣
Dashboard.view.tsx Major Overhaul — renderHeader() Removed, WIDGET_META + Badge Pattern Introduced S279 Full dashboard
widget redesign for Sisu+ Chrome extension — unify all widgets visually, redesign existing ones, add new widget types
based on extracted mockup (Jun 7 at 2:24 PM) 2544 2:29p 🔵 Three UI Bugs Identified in Grade Dashboard Component 2545 "
🔵 Root Cause Found: Grade Trend Label Uses First/Last Delta, Not Regression Slope 2546 2:30p 🔵 GradeDonutContent
Includes 'Pass' in Donut Segments and Total Count 2547 " 🔵 sisu-plus Uses Chrome Extension i18n Format for Translations
2548 " 🔵 sisu-plus Translations Are TypeScript Files, Not JSON 2549 2:31p 🔴 Fixed Missing Bottom Padding in Widget
Content Area 2550 2:32p 🔴 Fixed Grade Trend "Improving" Badge to Use Regression Slope Instead of First/Last Delta 2551
" 🔴 Updated Grade Trend Numeric Label to Display Regression-Based slopeDelta

Access 491k tokens of past work via get_observations([IDs]) or mem-search skill. </claude-mem-context>
