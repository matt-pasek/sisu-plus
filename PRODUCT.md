# Product

## Register

product

> Note: this project has two surfaces. The extension app (Dashboard, Timeline, Registration, Structure) is the primary
> product surface. The public landing page is a brand surface. Default to the `product` register for app work; override
> to `brand` for landing-page tasks.

## Users

Finnish university students (currently LUT and LAB) who are required to use the Sisu student portal to manage their
academic life — enrolments, study plans, degree progress, and grade records. They interact with Sisu under pressure:
deadlines, prerequisite puzzles, confusing portal layouts. Many are non-native Finnish or English speakers; layouts must
tolerate text-length variance across both languages.

## Product Purpose

Sisu+ replaces Sisu's student-facing UI with something that is both more elegant and more capable. The goal is not to
cosmetically improve Sisu — it is to make required academic administration feel effortless. Students should be able to
see their degree progress at a glance, plan and adjust their study timeline without anxiety, and handle enrolments
without hunting through multiple Sisu pages. Success means students rarely need to return to OG Sisu for anything.

## Brand Personality

Precise, clean, efficient. The tone is calm and direct — no encouragement, no gamification, no fluff. Think of a
well-designed CLI tool or a developer portal that respects the user's time. Finnish directness; say exactly what is true
and no more.

## Anti-references

- **Generic SaaS dashboards** — the purple-gradient, identical-card-grid, "streamline your workflow" aesthetic of B2B
  tools. Sisu+ should never feel like it is selling something.
- **OG Sisu / university portals** — clunky tables, institutional gray, form-over-function government UI. The whole
  point is to replace this.
- **Overly playful student apps** — rounded blobs, loud colors, cartoon illustrations, confetti on grade receipt. The
  design serves serious academic work.
- **Dark-mode IDE clones** — everything styled like VS Code or a terminal emulator is too developer-coded for general
  student use. The dark theme should feel refined, not developer-only.

## Design Principles

1. **Replace, don't decorate.** Sisu+ is a full replacement, not a skin. Every screen should feel like it was designed
   from scratch for this job — not like OG Sisu with a dark mode applied.
2. **Information density with clarity.** Students have a lot of data — credits, courses, grades, periods. Show it
   densely but never chaotically. Hierarchy and spacing are the tools; visual noise is the enemy.
3. **Calm confidence.** Academic administration is stressful. The UI should feel reassuring and competent, not exciting
   or animated for its own sake. Motion should solve problems (orient, confirm, reveal), not perform.
4. **Directness over guidance.** No tooltips explaining what a button does if the label is clear. No onboarding overlays
   for things students figure out in two seconds. Trust the user's intelligence.
5. **Language-first layouts.** Finnish and English text varies in length and rhythm. Layouts must not break when a label
   is 40% longer in one language. Design for the longer string.

## Accessibility & Inclusion

- WCAG 2.1 AA as the working baseline for contrast and keyboard navigability.
- `prefers-reduced-motion` respected: all animations have a reduced-motion fallback (crossfade or instant).
- Finnish and English languages fully supported; layouts must tolerate significant text-length variance.
- Extension runs inside a shadow DOM — accessibility tree must still be coherent (landmark roles, focus management,
  visible focus indicators).
