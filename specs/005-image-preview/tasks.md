# Tasks: Previsualización de Imagen en Cards

**Input**: Design documents from `specs/005-image-preview/`

**Prerequisites**: plan.md ✓ | spec.md ✓ | data-model.md ✓ | contracts/ ✓ | research.md ✓ | quickstart.md ✓

**Architecture constraints** (from plan.md + constitution v1.3.0):
- Preview state lives in `useImagePreview` at `ProductGrid` — not per-card `useState`, not Zustand
- One `ImagePreviewDialog` instance for the whole grid (FR-009)
- Hover zoom is CSS-only on `md+` (`group/photo`); touch MUST NOT depend on hover
- Same `product.imagePath` in card and overlay — no extra image pipeline
- Semantic tokens only; no `style=`; no `dark:` prefixes
- Opening/closing MUST NOT reset pagination, cart, or `useSizeSelection`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story this task belongs to (US1 / US2 / US3)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shadcn Dialog)

**Purpose**: Add the overlay primitive required for the lightbox.

- [x] T001 Install Shadcn dialog: `npx shadcn@latest add dialog` from repo root; verify `components/ui/dialog.tsx` exists and the project still compiles

**Checkpoint**: `npm run build` passes with the new Dialog primitive present (no feature code yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Preview hook (and its tests) that ALL user stories depend on. MUST complete before any story phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Implement `hooks/use-image-preview.ts`: expose `{ product, isOpen, open, close }` with `product: Product | null`, derived `isOpen`, `open(product)` replacing any previous product, `close()` setting `null`; no Zustand, no JSX per `specs/005-image-preview/contracts/hooks.md`
- [x] T003 [P] Create `hooks/__tests__/use-image-preview.test.ts`: cover starts closed, `open` sets product, `close` clears, `open(B)` while A is open replaces A per `specs/005-image-preview/contracts/hooks.md`

**Checkpoint**: `npm test` passes including `use-image-preview`. Hook is ready for grid wiring.

---

## Phase 3: User Story 1 — Ampliar foto con tap o click (Priority: P1) 🎯 MVP

**Goal**: Tap or click a loaded product photo opens a fullscreen overlay with that image, aspect-ratio preserved, without leaving the catalog.

**Independent Test**: Open `http://localhost:3000` → click/tap a product photo → overlay shows that image larger and uncropped → close overlay → same page, same cart count, same size selection on the card.

### Implementation — US1

- [x] T004 [P] [US1] Create `components/catalog/ImagePreviewDialog.tsx`: props `{ product, open, onClose }`; use shadcn Dialog; image `src={product.imagePath}` with `object-contain` and near-viewport max size (`max-h-[90svh] max-w-[90vw]` or equivalent); overlay semantic token (e.g. `bg-foreground/80`); `DialogTitle` with product name (`sr-only` OK) per `specs/005-image-preview/contracts/image-preview.md`
- [x] T005 [P] [US1] Update `components/catalog/ProductCard.tsx`: add `onPreview: (product: Product) => void`; wrap loaded photo in a button that calls `onPreview(product)` with `aria-label={`Ver foto ampliada de ${product.name}`}`; when `imageError` is true keep fallback text and do **not** call `onPreview` per `specs/005-image-preview/contracts/product-card.md`
- [x] T006 [US1] Update `components/catalog/ProductGrid.tsx`: own `useImagePreview()`; pass `onPreview={open}` to each card; render one `ImagePreviewDialog` with `{ product, open: isOpen, onClose: close }` per `specs/005-image-preview/contracts/product-card.md`

**Checkpoint (US1 complete)**: Click/tap on a loaded photo opens the overlay; broken-image cards do not; catalog page, pagination, cart, and size pills are unchanged after close.

---

## Phase 4: User Story 2 — Descubrir la ampliación en desktop con hover (Priority: P2)

**Goal**: On desktop, hovering the photo shows a magnifying-glass icon so users discover the preview. Touch devices still open preview by tap without a persistent zoom icon.

**Independent Test**: Viewport ≥ `md` → hover photo (not footer) → zoom icon appears within 1s → move cursor away → icon gone → narrow to phone width → icon never shown, tap still opens overlay.

### Implementation — US2

- [x] T007 [US2] Update `components/catalog/ProductCard.tsx`: add named group `group/photo` on the photo trigger (not the whole card); overlay Lucide `ZoomIn` with `hidden md:flex` and `opacity-0 md:group-hover/photo:opacity-100`; icon centered and must not fully cover the photo; hover on pills/CTAs must not reveal the icon per `specs/005-image-preview/contracts/product-card.md`

**Checkpoint (US2 complete)**: Desktop hover on the photo shows zoom; mobile has no hover icon; tap/click from US1 still works.

---

## Phase 5: User Story 3 — Cerrar la vista ampliada de forma intuitiva (Priority: P3)

**Goal**: Users can close the overlay via visible close control, backdrop, or Escape; focus stays in the dialog and returns to the photo trigger.

**Independent Test**: Open overlay → close button works → reopen → backdrop click/tap closes → reopen → Escape closes → Tab stays inside overlay until close; focus returns to the photo button.

### Implementation — US3

- [x] T008 [US3] Complete dismiss + a11y in `components/catalog/ImagePreviewDialog.tsx`: visible close control (`DialogClose` / Button); backdrop and Escape wired through Dialog (`onOpenChange` → `onClose`); keep focus trap from the primitive; do not add custom `z-index` on overlays per `specs/005-image-preview/contracts/image-preview.md` and constitution III Image preview

**Checkpoint (US3 complete)**: Close, backdrop, and Escape all dismiss; keyboard users are not trapped behind the overlay.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, constitution QA, static build.

- [x] T009 [P] Confirm body scroll is locked while overlay is open (Dialog primitive default); if not, enable Dialog scroll-lock in `components/catalog/ImagePreviewDialog.tsx` without touching cart Sheet behavior in `components/ui/sheet.tsx`
- [x] T010 Run full validation: `npm test` (all suites including `use-image-preview`) → `npm run build` → manual checklist in `specs/005-image-preview/quickstart.md` sections 4–8 and constitution QA (mobile tap, desktop hover+click, Escape/backdrop, cart and size unchanged)

**Checkpoint (feature complete)**: Tests pass; static export succeeds; constitution v1.3.0 Image preview checklist done.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup: Shadcn dialog)
    ↓
Phase 2 (Foundational: useImagePreview)  ← BLOCKS all user stories
    ├─→ Phase 3 (US1)   ← P1 MVP — tap/click overlay
    ├─→ Phase 4 (US2)   ← depends on US1 photo trigger (same ProductCard)
    └─→ Phase 5 (US3)   ← depends on US1 dialog existing
              ↓
        Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 + Phase 2. Delivers tap/click preview. MVP.
- **US2 (P2)**: Depends on US1 (`ProductCard` photo button exists). Adds hover zoom only.
- **US3 (P3)**: Depends on US1 (`ImagePreviewDialog` exists). Completes dismiss/a11y.

### Within Each Phase

```
T001 (dialog primitive)
T002 (hook) → T003 (hook tests, parallel after T002)
T004 + T005 in parallel (different files) → T006 (grid wires both)
T007 after T005 (same ProductCard)
T008 after T004 (same ImagePreviewDialog)
T009 + T010 after US1–US3
```

---

## Parallel Execution Examples

### Phase 2 — After T002:

```bash
T003  hooks/__tests__/use-image-preview.test.ts
```

### Phase 3 — US1:

```bash
# Run simultaneously:
T004  components/catalog/ImagePreviewDialog.tsx
T005  components/catalog/ProductCard.tsx
# Then:
T006  components/catalog/ProductGrid.tsx
```

### After US1:

```bash
# Sequential on shared files (do not parallelize):
T007  ProductCard hover (after T005)
T008  ImagePreviewDialog dismiss (after T004)
```

---

## Implementation Strategy

### MVP Scope (User Story 1 only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002–T003)
3. Complete Phase 3 (T004–T006)
4. **STOP & VALIDATE**: `specs/005-image-preview/quickstart.md` section 4
5. Preview works on tap/click; hover affordance and extra dismiss polish can follow

**Result**: Buyers can inspect the full photo in-page on any device.

### Full Feature Delivery

1. Phase 1 + Phase 2 → foundation ready
2. Phase 3 (US1) → MVP overlay
3. Phase 4 (US2) → desktop zoom icon
4. Phase 5 (US3) → close / backdrop / Escape / focus
5. Phase 6 → tests + build + constitution QA

### Parallel Team Strategy

With two developers after Phase 2:
- Developer A: T004 then T008 (dialog)
- Developer B: T005 then T007 (card); T006 after T004+T005

---

## Notes

- `[P]` = different files, no shared state, safe to parallelize
- `[Story]` label maps each task to a user story for traceability
- US1 is the MVP — overlay on tap/click delivers the core value
- US2 is CSS-only; do not use JS `matchMedia` for hover
- US3 should reuse Dialog primitives; do not reimplement focus trap
- Hook unit tests (T003) come from plan/contracts, not from a TDD request in spec.md
- Manual QA on mobile + desktop is mandatory before merge (constitution v1.3.0)
- Commit after each task or logical group; each checkpoint is a valid validation point

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Phase 1 — Setup | T001 | 1 |
| Phase 2 — Foundational | T002–T003 | 2 |
| Phase 3 — US1 (P1) | T004–T006 | 3 |
| Phase 4 — US2 (P2) | T007 | 1 |
| Phase 5 — US3 (P3) | T008 | 1 |
| Phase 6 — Polish | T009–T010 | 2 |
| **Total** | **T001–T010** | **10** |
