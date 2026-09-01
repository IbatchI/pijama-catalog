# Tasks: Selección de Talle en Cards

**Input**: Design documents from `specs/003-size-pills/`

**Prerequisites**: plan.md ✓ | spec.md ✓ | data-model.md ✓ | contracts/ ✓ | research.md ✓ | quickstart.md ✓

**Architecture constraints** (from plan.md + constitution v1.2.0):
- SRP enforced: `types/` → `data/` → `lib/` → `stores/` → `hooks/` → `components/`
- `useSizeSelection` is the only place for per-card pill state — no raw `useState` in ProductCard for size
- Size labels from `data/sizes.ts` only — never hardcoded in components or `lib/whatsapp.ts`
- Shadcn semantic tokens only for active pill state (`data-[state=on]:bg-primary`, etc.)
- Cart line identity = `productId:size` (not product ID alone)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story this task belongs to (US1 / US2 / US3)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shadcn Toggle Components)

**Purpose**: Add the UI primitives required for size pills.

- [x] T001 Install Shadcn toggle and toggle-group components: `npx shadcn@latest add toggle toggle-group`; verify `components/ui/toggle.tsx` and `components/ui/toggle-group.tsx` exist and compile

**Checkpoint**: `pnpm build` passes with new UI components present (no feature code yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, data, store, lib, and hooks that ALL user stories depend on. MUST complete before any story phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `Size` type (`'S' | 'M' | 'L' | 'XL'`) and extend `CartItem` with required `size: Size` field in `types/index.ts` per `contracts/size-catalog.md` and `data-model.md`
- [x] T003 [P] Create `data/sizes.ts`: export `SIZE_OPTIONS` (4 entries S→XL with full labels) and `getSizeLabel(size: Size): string` per `contracts/size-catalog.md`
- [x] T004 [P] Implement `hooks/use-size-selection.ts`: expose `{ selectedSize, selectSize, hasSelection }` with local state; no Zustand, no JSX per `contracts/hooks.md`
- [x] T005 Update `stores/cart-store.ts`: change `addItem(product, size)`, `removeItem(productId, size)`, `isInCart(productId, size)`; deduplicate by `productId:size` key per `contracts/cart-store.md`
- [x] T006 Update `hooks/use-cart.ts`: forward size-aware signatures from cart store (`addItem`, `removeItem`, `isInCart` all accept `size: Size`) per `contracts/hooks.md`
- [x] T007 Update `lib/whatsapp.ts`: import `getSizeLabel` from `data/sizes.ts`; add `Talle: {label}` line in each item block of `buildMessageBody()` per `contracts/whatsapp-builder.md`
- [x] T008 Update `hooks/use-whatsapp.ts`: change `buildSingleUrl(product, size)` to construct `{ product, size }` CartItem before calling `buildSingleItemWhatsAppUrl` per `contracts/hooks.md`
- [x] T009 [P] Update `lib/__tests__/whatsapp.test.ts`: add `size` to all `CartItem` fixtures; add tests asserting decoded message contains `Talle: M 42/44`, `Talle: XL 50/52`, and per-item labels in multi-item case (constitution requirement)
- [x] T010 [P] Create `stores/__tests__/cart-store.test.ts`: cover add with size, duplicate product+size no-op, same product different sizes = 2 lines, removeItem by productId+size, isInCart size-aware per `contracts/cart-store.md`
- [x] T011 [P] Create `hooks/__tests__/use-size-selection.test.ts`: cover initial null, selectSize sets value, switch size replaces previous, re-select same size stays selected per `contracts/hooks.md`

**Checkpoint**: `pnpm test` passes for whatsapp, cart-store, and use-size-selection suites. TypeScript compiles with breaking `CartItem` change (components will fail until US1 — expected).

---

## Phase 3: User Story 1 — Elegir talle antes de comprar (Priority: P1) 🎯 MVP

**Goal**: Every catalog card shows four size pills; "Agregar al carrito" and "Lo quiero" appear only after the user selects a size.

**Independent Test**: Open `http://localhost:3000` → any card shows 4 pills, no action buttons → tap "M 42/44" → pill highlights and both buttons appear → tap "L 46/48" → only L active, buttons remain visible.

### Implementation — US1

- [x] T012 [P] [US1] Update `components/catalog/ProductCard.tsx`: import `SIZE_OPTIONS` from `data/sizes.ts`; use `useSizeSelection()`; render Shadcn `ToggleGroup` (`type="single"`) with `flex-wrap` layout for 320px; show `CardFooter` actions only when `hasSelection`; pass `selectedSize` to `onAddToCart` and `getWantItUrl` callbacks per `contracts/product-card.md`
- [x] T013 [US1] Update `components/catalog/ProductGrid.tsx`: replace `cartItemIds: Set<string>` with `isInCart(productId, size)` callback; update `onAddToCart(product, size)` and `getWantItUrl(product, size)` prop signatures; curry per-card: `isInCart={(size) => isInCart(product.id, size)}` per `contracts/product-card.md`
- [x] T014 [US1] Update `app/page.tsx`: wire size-aware props to `ProductGrid` — pass `isInCart` from `useCart`, `getWantItUrl` from `useWhatsApp` (requires size); `onAddToCart` calls `addItem(product, size)`; ensure catalog compiles and renders

**Checkpoint (US1 complete)**: Browse catalog; pills visible on all cards; no purchase buttons without size selection; selecting size reveals both buttons; pills fit at 320px without horizontal scroll.

---

## Phase 4: User Story 2 — Carrito con talle por ítem (Priority: P2)

**Goal**: Cart stores and displays product + size; same product in two sizes = two lines; remove by product+size.

**Independent Test**: Select M on product A → Agregar → cart shows "M 42/44" → same product, select L → Agregar → cart shows 2 lines → remove M → only L remains.

### Implementation — US2

- [x] T015 [P] [US2] Update `components/cart/CartItemRow.tsx`: display `getSizeLabel(item.size)` below product name in `text-muted-foreground`; change `onRemove` to `(productId: string, size: Size) => void`; update remove button to pass both values per `contracts/product-card.md`
- [x] T016 [US2] Update `components/cart/CartSheet.tsx`: change `onRemoveItem` prop to `(productId: string, size: Size) => void`; pass size through to each `CartItemRow` per `contracts/product-card.md`
- [x] T017 [US2] Wire `app/page.tsx` cart flow: pass `onRemoveItem={removeItem}` (size-aware) to `CartSheet`; verify `addItem(product, size)` and `isInCart(productId, size)` work end-to-end from `ProductGrid` through `useCart`

**Checkpoint (US2 complete)**: Cart badge count = line count; sheet shows size per item; same product M+L = 2 lines; duplicate add same size is no-op; remove targets correct line only.

---

## Phase 5: User Story 3 — WhatsApp con talle incluido (Priority: P3)

**Goal**: "Lo quiero" and cart checkout open WhatsApp with size label in every item block.

**Independent Test**: Select XL → "Lo quiero" → decoded message contains `Talle: XL 50/52` → add 2 items (M and S) to cart → Finalizar → message lists both talles correctly.

### Implementation — US3

- [x] T018 [US3] Verify `components/catalog/ProductCard.tsx` "Lo quiero" link: `href={getWantItUrl(product, selectedSize!)}` only rendered when `hasSelection`; opens in new tab with `rel="noopener noreferrer"` per `contracts/product-card.md`
- [x] T019 [US3] Verify `app/page.tsx` checkout: `handleCheckout` calls `buildCartUrl(items)` where each `CartItem` includes `size`; guard empty cart; open in new tab per `contracts/whatsapp-builder.md`
- [x] T020 [US3] Smoke-test WhatsApp flows per `specs/003-size-pills/quickstart.md` section 6: single "Lo quiero" with XL, multi-item cart with M+S; confirm `decodeURIComponent` output matches expected format

**Checkpoint (US3 complete)**: All WhatsApp messages include correct `Talle:` line per item; no purchase path without size selection.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Test coverage, accessibility, build validation, constitution compliance.

- [x] T021 [P] Update `hooks/__tests__/use-cart.test.ts`: adapt all tests for size-aware `addItem(product, size)`, `removeItem(id, size)`, `isInCart(id, size)`; add case for same product two sizes
- [x] T022 [P] Accessibility pass on `components/catalog/ProductCard.tsx`: add `aria-label="Seleccionar talle"` on ToggleGroup; verify keyboard navigation between pills; verify action buttons have accessible labels when visible
- [x] T023 Run full validation: `pnpm test` (all suites green) → `pnpm build` (static export succeeds) → manual quickstart sections 4–7 in `specs/003-size-pills/quickstart.md`

**Checkpoint (feature complete)**: All tests pass; build clean; manual checklist complete; constitution v1.2.0 gaps closed.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup: Shadcn toggle)
    ↓
Phase 2 (Foundational)  ← BLOCKS all user stories
    ├─→ Phase 3 (US1)   ← P1 MVP — pills + conditional CTAs
    ├─→ Phase 4 (US2)   ← depends on US1 (ProductCard/Grid/page wired)
    └─→ Phase 5 (US3)   ← depends on US2 (cart items carry size) + T007/T008 (whatsapp)
              ↓
        Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (types, sizes data, useSizeSelection, cart/whatsapp hooks updated for compile). Delivers visible pills + conditional CTAs.
- **US2 (P2)**: Depends on US1 (ProductCard/Grid/page accept size). Delivers cart display and size-aware add/remove.
- **US3 (P3)**: Depends on US2 (cart items have size) + foundational whatsapp changes (T007). Delivers WhatsApp messages with talle.

### Within Phase 2

```
T002 (types) → T003, T004, T005, T007 can parallelize after T002
T005 (store) → T006 (use-cart)
T007 (whatsapp lib) → T008 (use-whatsapp) → T009 (whatsapp tests)
T010, T011 parallel with T009 after their respective source files exist
```

---

## Parallel Execution Examples

### Phase 2 — After T002 (types defined):

```bash
# Run simultaneously:
T003  data/sizes.ts
T004  hooks/use-size-selection.ts
T005  stores/cart-store.ts
T007  lib/whatsapp.ts
# Then:
T006  hooks/use-cart.ts        (after T005)
T008  hooks/use-whatsapp.ts    (after T007)
T009  lib/__tests__/whatsapp.test.ts
T010  stores/__tests__/cart-store.test.ts
T011  hooks/__tests__/use-size-selection.test.ts
```

### Phase 3 — US1:

```bash
# T012 and T013 can start together (different files)
T012  components/catalog/ProductCard.tsx
T013  components/catalog/ProductGrid.tsx
# T014 depends on T012 + T013 (page wires both)
```

### Phase 4 — US2:

```bash
# Run simultaneously:
T015  components/cart/CartItemRow.tsx
# T016 depends on T015 prop signature
# T017 wires app/page.tsx after T015 + T016
```

---

## Implementation Strategy

### MVP Scope (User Story 1 only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002–T011) — all foundational tasks
3. Complete Phase 3 (T012–T014) — pills + conditional CTAs
4. **STOP & VALIDATE**: quickstart.md section 4 (US1 checklist)
5. Deploy if ready (catalog usable; cart/whatsapp size flows incomplete until US2/US3)

**Result**: Catalog cards require size selection before any purchase action is shown.

### Full Feature Delivery

1. Phase 1 + Phase 2 → foundation ready
2. Phase 3 (US1) → MVP deployed
3. Phase 4 (US2) → size-aware cart deployed
4. Phase 5 (US3) → WhatsApp with talle deployed
5. Phase 6 (Polish) → tests + a11y + build validation

### Parallel Team Strategy

With two developers after Phase 2:
- Developer A: US1 (T012–T014) then US3 (T018–T020)
- Developer B: US2 (T015–T017) then Polish tests (T021)

---

## Notes

- `[P]` = different files, no shared state, safe to parallelize
- `[Story]` label maps each task to a user story for traceability
- US1 is the MVP — pills + gated CTAs deliver immediate UX value
- US2 and US3 extend existing 001 flows without new routes or pages
- Constitution requirement: `lib/whatsapp.ts` unit tests (T009) are **mandatory**
- Breaking change: all `CartItem` fixtures project-wide must include `size`
- Size selection resets on page change (local hook state — no persistence task needed)
- Commit after each task or logical group; each checkpoint is a valid validation point

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Phase 1 — Setup | T001 | 1 |
| Phase 2 — Foundational | T002–T011 | 10 |
| Phase 3 — US1 (P1) | T012–T014 | 3 |
| Phase 4 — US2 (P2) | T015–T017 | 3 |
| Phase 5 — US3 (P3) | T018–T020 | 3 |
| Phase 6 — Polish | T021–T023 | 3 |
| **Total** | **T001–T023** | **23** |
