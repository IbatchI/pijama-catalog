# Implementation Plan: Selección de Talle en Cards

**Branch**: `003-size-pills` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-size-pills/spec.md`

## Summary

Extend the existing static pajama catalog so every product card shows four fixed size
pills (S 38/40, M 42/44, L 46/48, XL 50/52). Purchase actions ("Agregar al carrito" and
"Lo quiero") appear only after the user selects a size. Cart line items become
product + size (same product in two sizes = two lines). WhatsApp messages include the
size label for every item. Implementation adds a `Size` type, Shadcn Toggle Group pills,
a `useSizeSelection` hook, and updates cart store, ProductCard, CartItemRow, and
`lib/whatsapp.ts` — all within the existing SRP/hook architecture from feature 001.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS

**Framework**: Next.js 16 (App Router) with `output: 'export'` (unchanged)

**Primary Dependencies** (existing + new):
- `zustand` v5 — cart state (signature changes for size-aware keys)
- `shadcn/ui` — add **Toggle** + **Toggle Group** for size pills (existing: Button, Card, Sheet, Badge)
- `tailwindcss` v4 — responsive pill layout (flex-wrap on narrow cards)
- `@radix-ui/react-toggle-group` — installed transitively via Shadcn toggle-group

**Storage**: No change — cart remains browser-memory Zustand store; size is a field on `CartItem`

**Testing**: Vitest — extend `lib/__tests__/whatsapp.test.ts` for size labels; add
`stores/__tests__/cart-store.test.ts` for product+size identity; add
`hooks/__tests__/use-size-selection.test.ts`

**Target Platform**: Web browser (mobile-first); static CDN on Vercel

**Project Type**: Incremental enhancement to existing web catalog (no new routes)

**Performance Goals**: No measurable regression; pill row adds ~40px height per card

**Constraints**:
- Constitution v1.2.0 mandates fixed 4-size enum — no per-product sizes
- Size selection is **local component state** (resets on page change / unmount)
- Cart identity key: `${productId}:${size}` — not product ID alone
- `isInCart` becomes size-aware: same product M in cart does not block adding L
- WhatsApp message format gains one line per item: `Talle: {label}`
- Shadcn semantic tokens only for active pill state (`data-[state=on]:bg-primary` etc.)
- No new runtime dependencies beyond Shadcn toggle components

**Scale/Scope**: ~139 cards × 4 pills; 8 files modified, 3–4 files created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Pre-design | Post-design | Notes |
|-----------|------|------------|-------------|-------|
| I. Static-First | No server runtime added | ✅ PASS | ✅ PASS | Client-only state change |
| II. WhatsApp Commerce | Size in every message | ⚠️ GAP (001) | ✅ PASS | `lib/whatsapp.ts` contract updated |
| III. Card-Grid UI | Size pills + conditional CTAs | ⚠️ GAP (001) | ✅ PASS | Toggle Group in ProductCard |
| IV. Cart Simplicity | product + size line items | ⚠️ GAP (001) | ✅ PASS | Store key = id + size |
| V. Catalog Simplicity | No filters/search added | ✅ PASS | ✅ PASS | Unchanged |
| VI. SRP & Hooks | `useSizeSelection` hook; no store in components | ✅ PASS | ✅ PASS | New hook + `data/sizes.ts` constant |

**Pre-design**: Three constitution gaps from v1.2.0 not yet implemented in code — this
feature closes them. No violations introduced.

**Post-design**: All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/003-size-pills/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── size-catalog.md
│   ├── cart-store.md
│   ├── whatsapp-builder.md
│   ├── product-card.md
│   └── hooks.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (changes for this feature)

```text
/
├── types/index.ts                    # ADD Size type; CartItem.size: Size
├── data/sizes.ts                     # NEW — SIZE_OPTIONS constant + getSizeLabel()
├── lib/whatsapp.ts                   # MODIFY — include size in message body
├── stores/cart-store.ts              # MODIFY — size-aware add/remove/isInCart
├── hooks/
│   ├── use-cart.ts                   # MODIFY — pass size to addItem/removeItem
│   ├── use-whatsapp.ts                 # MODIFY — buildSingleUrl(product, size)
│   └── use-size-selection.ts         # NEW — local pill selection state
├── components/
│   ├── ui/toggle.tsx                 # NEW — shadcn add toggle
│   ├── ui/toggle-group.tsx           # NEW — shadcn add toggle-group
│   ├── catalog/
│   │   ├── ProductCard.tsx           # MODIFY — pills + conditional CTAs
│   │   └── ProductGrid.tsx           # MODIFY — size-aware cart checks
│   └── cart/
│       └── CartItemRow.tsx           # MODIFY — display size label
├── app/page.tsx                      # MODIFY — wire size through grid/cart
└── lib/__tests__/whatsapp.test.ts    # MODIFY — size label assertions
```

**Structure Decision**: Single-project Next.js app; feature 003 is a vertical slice
touching types → data → lib → store → hooks → components. No new top-level directories.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
