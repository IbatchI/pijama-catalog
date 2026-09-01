# Implementation Plan: Previsualización de Imagen en Cards

**Branch**: `005-image-preview` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-image-preview/spec.md`

## Summary

Add an in-page fullscreen image preview to catalog product cards. Tap or click on a
loaded product photo opens a single shared lightbox (shadcn Dialog) showing the same
static image, aspect-ratio preserved. On `md+` viewports, hovering the photo reveals a
magnifying-glass overlay as a discoverability affordance; touch devices never depend on
hover. Closing via close control, backdrop, or Escape returns focus to the trigger and
MUST NOT reset pagination, cart, or size selection. Preview open/close state lives in
`useImagePreview` at the grid level so only one overlay can be open (FR-009).

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS

**Framework**: Next.js 16 (App Router) with `output: 'export'` (unchanged)

**Primary Dependencies** (existing + new):
- `shadcn/ui` **Dialog** (new) — lightbox overlay; project already uses Base UI Dialog
  primitives via Sheet (`@base-ui/react/dialog`)
- `lucide-react` — `ZoomIn` (or `Search`) icon for desktop hover affordance
- `tailwindcss` v4 — `md:` hover overlay; `object-contain` in dialog
- `zustand` — unchanged (preview is not cart state)

**Storage**: N/A — preview is ephemeral UI state; no persistence

**Testing**: Vitest + Testing Library
- `hooks/__tests__/use-image-preview.test.ts` — open, close, replace product, no-op on
  missing image
- Manual QA per constitution: one mobile viewport + one desktop viewport

**Target Platform**: Web browser (mobile-first); static CDN on Vercel

**Project Type**: Incremental enhancement to existing web catalog (no new routes)

**Performance Goals**: Overlay open < 1s after tap/click on cached images; hover icon
visible < 1s (SC-002); no extra image fetch (reuse `product.imagePath`)

**Constraints**:
- Constitution v1.3.0 Image preview: Dialog/lightbox; hover zoom only on `md+`
- Same static image source as the card — no CDN/image API
- Semantic Tailwind tokens only; no `dark:` prefixes; no `style=` props
- Preview state MUST NOT scatter across unrelated components (hook or focused sub-component)
- Opening/closing MUST NOT navigate or reset cart / size / pagination
- Image-error cards MUST NOT open an empty preview
- Body scroll locked while overlay is open (Dialog primitive)

**Scale/Scope**: ~139 cards, one Dialog instance; ~4 files created, 2–3 files modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Pre-design | Post-design | Notes |
|-----------|------|------------|-------------|-------|
| I. Static-First | No server runtime | ✅ PASS | ✅ PASS | Client overlay only |
| II. WhatsApp Commerce | Unchanged | ✅ PASS | ✅ PASS | No message/format change |
| III. Card-Grid UI | Image preview + hover zoom `md+` | ⚠️ GAP | ✅ PASS | Dialog + CSS hover overlay |
| IV. Cart Simplicity | Preview must not mutate cart | ✅ PASS | ✅ PASS | Isolated hook, no store writes |
| V. Catalog Simplicity | No search/filter/sort | ✅ PASS | ✅ PASS | Overlay is not a new nav mechanism |
| VI. SRP & Hooks | `useImagePreview`; no store/lib in components | ✅ PASS | ✅ PASS | Hook at grid; `ImagePreviewDialog` sub-component |

**Pre-design**: Constitution v1.3.0 added Image preview; code does not implement it yet.
This feature closes that gap. No violations introduced.

**Post-design**: All gates pass. Hover uses CSS (`hidden md:flex` + `group-hover`), not
JS media queries. One Dialog at grid level satisfies FR-009. No Complexity Tracking
entries required.

## Project Structure

### Documentation (this feature)

```text
specs/005-image-preview/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── image-preview.md
│   ├── product-card.md
│   └── hooks.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (changes for this feature)

```text
/
├── hooks/
│   ├── use-image-preview.ts              # NEW — open/close + active product
│   └── __tests__/use-image-preview.test.ts
├── components/
│   ├── ui/dialog.tsx                     # NEW — shadcn add dialog
│   └── catalog/
│       ├── ProductCard.tsx               # MODIFY — photo trigger + hover zoom
│       ├── ProductGrid.tsx               # MODIFY — own preview hook + dialog
│       └── ImagePreviewDialog.tsx        # NEW — fullscreen overlay JSX
```

**Structure Decision**: Single-project Next.js app. Preview is a vertical slice:
hook → grid-owned dialog → card trigger. No new top-level directories, no types/data/lib
changes (Product already has `imagePath` / `name`).

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
