# Research: Selección de Talle en Cards — Phase 0

**Feature**: 003-size-pills
**Date**: 2026-08-31

---

## R-001: Shadcn Toggle Group for Size Pills

**Decision**: Install Shadcn `toggle` and `toggle-group` components; use `ToggleGroup`
with `type="single"` and `variant="outline"` for the four size pills per card.

**Rationale**:
- Constitution III requires toggle-style pills with a distinct active state.
- Shadcn Toggle Group is built on Radix UI — accessible (keyboard nav, `aria-pressed`),
  supports single-selection mode, and uses semantic Tailwind tokens out of the box.
- Already the project's design system (Shadcn + Tailwind v4); no custom pill component needed.
- `type="single"` with `onValueChange` maps directly to `useSizeSelection` state.
- Re-clicking the active pill: Radix keeps it selected (matches spec US1 scenario 4).

**Styling approach**:
```tsx
<ToggleGroup type="single" className="flex w-full flex-wrap justify-center gap-1">
  {SIZE_OPTIONS.map(({ value, label }) => (
    <ToggleGroupItem
      key={value}
      value={value}
      className="flex-1 min-w-0 px-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
    >
      {label}
    </ToggleGroupItem>
  ))}
</ToggleGroup>
```

**Alternatives considered**:
- **Plain `<button>` row**: Works but lacks built-in `aria-pressed` and group semantics;
  would duplicate accessibility logic.
- **Shadcn `Button` with manual active class**: No enforced single-select; more boilerplate.
- **Radio group**: Semantically correct but visually heavier; pills pattern is toggle-group.

---

## R-002: Size Type & Constant Location

**Decision**:
- `Size` union type in `types/index.ts`: `'S' | 'M' | 'L' | 'XL'`
- `SIZE_OPTIONS` array and `getSizeLabel(size: Size): string` in `data/sizes.ts`

**Rationale**:
- Constitution mandates enum in `types/`; display labels are static data → `data/`.
- `getSizeLabel('M')` → `"M 42/44"` — single source of truth for UI and WhatsApp.
- Adding/removing sizes requires constitution amendment (documented in data-model).

**Alternatives considered**:
- Labels inline in ProductCard: Violates DRY; WhatsApp and cart would duplicate strings.
- Enum in `lib/`: Constitution places shape definitions in `types/` only.

---

## R-003: Cart Identity — Product + Size

**Decision**: Change cart deduplication key from `product.id` to `` `${product.id}:${size}` ``.
Update signatures:

```ts
addItem(product: Product, size: Size): void
removeItem(productId: string, size: Size): void
isInCart(productId: string, size: Size): boolean
```

**Rationale**:
- Spec FR-006/FR-007 and Constitution IV require separate lines per size.
- `isInCart(productId, 'M')` false while `isInCart(productId, 'L')` true — enables
  "En carrito ✓" only for the exact size+product combo on the card.
- `removeItem` needs size because two lines can share the same `productId`.

**Alternatives considered**:
- Composite `lineItemId` string stored on `CartItem`: Adds field complexity; size is
  already on the item and sufficient for identity.
- Quantity field per line: Out of scope (constitution v1: one unit per line).

---

## R-004: Size Selection State — Local vs Global

**Decision**: `useSizeSelection` hook manages `selectedSize: Size | null` with
`selectSize(size: Size)` and `hasSelection: boolean`. State lives inside `ProductCard`
(one hook instance per card).

**Rationale**:
- Spec assumption: selection resets on page change — local state unmounts naturally.
- No cross-card coupling needed.
- Keeps Zustand cart store focused on cart only (SRP).
- Constitution VI explicitly names `useSizeSelection` as the hook for this concern.

**Alternatives considered**:
- Zustand map `Record<productId, Size>`: Persists across pagination if not cleared;
  contradicts spec edge case. Would need manual reset on page change.
- Lift state to ProductGrid: Couples grid to selection logic; violates hook separation.

---

## R-005: WhatsApp Message Format with Size

**Decision**: Add a `Talle:` line inside each item block:

```
1. Pijama Floral
   Talle: M 42/44
   📷 https://catalog.vercel.app/images/a.jpg
```

**Rationale**:
- Constitution II requires "label + numeric range" per item.
- Placing size between name and image keeps human readability when seller scans message.
- `getSizeLabel(size)` ensures cart and WhatsApp use identical text.

**Alternatives considered**:
- Size appended to product name (`Pijama Floral — M 42/44`): Harder to parse programmatically.
- Size only in footer: Doesn't satisfy per-item requirement.

---

## R-006: Responsive Pill Layout on 320px Viewports

**Decision**: `flex-wrap` with `flex-1 min-w-[calc(50%-4px)]` on each pill — two pills
per row on the narrowest cards, four in one row on wider cards.

**Rationale**:
- Spec SC-001: no horizontal scroll at ≥ 320px.
- Card min-width ~140px (2-column grid) → 4 pills in one row is too tight at 70px each.
- Two-row layout (2×2) fits labels like "XL 50/52" at `text-xs`.

**Alternatives considered**:
- Horizontal scroll for pills: Fails SC-001.
- Abbreviated labels (S/M/L/XL only): Constitution requires full display text.

---

## R-007: Conditional CTA Visibility

**Decision**: Render `CardFooter` action buttons only when `hasSelection === true`.
Use CSS `hidden` or conditional render (prefer conditional render to avoid focus traps).

**Rationale**:
- Spec FR-004: buttons not visible without size — not merely disabled.
- Disabled buttons still visible would confuse users ("why can't I click?").
- When size selected, both buttons appear together (no staggered reveal).

**Alternatives considered**:
- Disabled + tooltip "Seleccioná un talle": Spec says hidden, not disabled.
