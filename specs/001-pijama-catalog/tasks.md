# Tasks: Catálogo de Pijamas — Navegación y Carrito

**Input**: Design documents from `specs/001-pijama-catalog/`

**Prerequisites**: plan.md ✓ | spec.md ✓ | data-model.md ✓ | contracts/ ✓ | research.md ✓ | quickstart.md ✓

**Architecture constraints** (from plan.md Architectural Principles):
- SRP enforced: types / data / lib / stores / hooks / components each have one responsibility
- Custom hooks are the **only** bridge between logic and view — components never import stores directly
- All design tokens in `app/globals.css` — no raw color values in components
- Shadcn semantic classes only (`bg-primary`, `text-muted-foreground`)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story this task belongs to (US1 / US2 / US3)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Bootstrap)

**Purpose**: Create the working Next.js project with all dependencies and tooling.

- [x] T001 Bootstrap Next.js 16 project in repo root with TypeScript, Tailwind CSS, App Router, ESLint, import alias `@/*`, no Turbopack: `npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --no-turbopack`
- [x] T002 Install Zustand v5: `pnpm add zustand` (or npm equivalent)
- [x] T003 [P] Initialize Shadcn with default/nova style: `npx shadcn@latest init`; select Zinc base color, confirm `app/globals.css` as CSS file
- [x] T004 [P] Add required Shadcn components: `npx shadcn@latest add card sheet badge button separator skeleton`
- [x] T005 Configure `next.config.ts`: set `output: 'export'` and `images: { unoptimized: true }`; verify `pnpm build` produces `/out` directory without errors
- [x] T006 Create full directory scaffold: `mkdir -p types data lib stores hooks providers components/catalog components/cart components/layout public/images scripts`

**Checkpoint**: `pnpm dev` starts without errors; `pnpm build` produces `/out` directory.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core building blocks required by all three user stories. MUST be complete before any story phase begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Define TypeScript interfaces in `types/index.ts`: `Product { id, name, price, type, imagePath }` and `CartItem { product }` — no logic, shape definitions only
- [x] T008 [P] Configure design token theme in `app/globals.css`: add `@theme { }` block with brand palette (`--color-brand-*`, `--color-neutral-*`, `--font-sans`, `--spacing-card-gap`, `--radius-card`) and `:root { }` block mapping Shadcn CSS variables (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, etc.) to brand tokens; remove all raw color values from file
- [x] T009 [P] Copy 139 product photos to `public/images/`: `cp -r "/Users/batch/Downloads/Fotos pijamas /" ./public/images/`; verify `ls public/images/ | wc -l` prints 139
- [x] T010 Create `scripts/generate-products.ts`: Node script that reads all `*.jpg` filenames from `public/images/`, derives `id` from filename suffix (e.g. `"WA0067"`), sets `name: "Pijama #67"`, `price: null`, `type: "general"`, `imagePath: "/images/<filename>"`, and writes the typed array to `data/products.ts`; run it with `npx tsx scripts/generate-products.ts`
- [x] T011 [P] Implement pure catalog utilities in `lib/products.ts`: `getProducts(): Product[]` (imports from `data/products.ts`) and `getPaginatedProducts(products, page, pageSize): Product[]` (array slice, 1-based page, defaults to PAGE_SIZE=15); no React imports
- [x] T012 [P] Implement pure WhatsApp utilities in `lib/whatsapp.ts`: `buildWhatsAppUrl(items, phoneNumber, siteBaseUrl): string` (constructs `wa.me` URL with numbered product list + image URLs + overflow guard at 15 items) and `buildSingleItemWhatsAppUrl(item, phoneNumber, siteBaseUrl): string`; export `WHATSAPP_PHONE` constant with placeholder number
- [x] T013 [P] Write unit tests for `lib/whatsapp.ts` in `lib/__tests__/whatsapp.test.ts` (constitution requirement): cover single-item URL, multi-item message (3 items), overflow at 16 items, empty array guard, phone number format, special character encoding
- [x] T014 Create Zustand cart store factory in `stores/cart-store.ts` using `createStore` from `zustand/vanilla`: store shape with `items: CartItem[]` and actions `addItem` (no-op if duplicate), `removeItem`, `clearCart`, `isInCart`; no React imports, no UI
- [x] T015 Create `providers/cart-store-provider.tsx` as Client Component: `CartStoreProvider` using `useRef` to hold one store instance per mount + React Context; export `useCartStore` selector hook; add `'use client'` directive
- [x] T016 [P] Implement `hooks/use-cart.ts` as Client hook: wraps `useCartStore` selectors/actions; exposes `{ items, totalItems, addItem, removeItem, clearCart, isInCart }`; no JSX, no store import in components
- [x] T017 [P] Implement `hooks/use-pagination.ts` as pure React hook: accepts `{ products, pageSize? }`, manages `currentPage` with `useState`; returns `{ currentPage, totalPages, pageItems, goToPage, next, prev, isFirstPage, isLastPage }`; clamps `goToPage` to `[1, totalPages]`
- [x] T018 [P] Implement `hooks/use-whatsapp.ts` as Client hook: injects `process.env.NEXT_PUBLIC_SITE_URL` and `WHATSAPP_PHONE` constant; exposes `{ buildCartUrl(items), buildSingleUrl(product) }` delegating to `lib/whatsapp.ts`
- [x] T019 Update `app/layout.tsx`: wrap `children` in `<CartStoreProvider>`; set `<html lang="es">`; import `next/font` for Geist or Inter; keep it a Server Component (no `'use client'`)
- [x] T020 Create `components/layout/Header.tsx` as Client Component: displays catalog logo/title on left; renders cart icon button on right (placeholder `onClick` for now); styled with `bg-background border-b border-border`; uses semantic tokens only

**Checkpoint**: `pnpm build` passes. `data/products.ts` has 139 entries. All hooks exist and TypeScript compiles clean.

---

## Phase 3: User Story 1 — Navegar el Catálogo (Priority: P1) 🎯 MVP

**Goal**: A visitor can open the catalog URL and browse all pajamas paginated at 15 per page with responsive card grid and working prev/next navigation.

**Independent Test**: Open `http://localhost:3000`, verify 15 photo cards appear in a responsive grid; click "Siguiente" to see next 15; reach last page and confirm button disables. No cart interaction needed.

### Implementation — US1

- [x] T021 [P] [US1] Implement `components/catalog/ProductCard.tsx` as Client Component (`'use client'`): renders a Shadcn `Card` with `<img>` (aspect-ratio 3/4, `object-cover`, full width) and two `Button` stubs below ("Agregar al carrito" and "Lo quiero"); accepts `product: Product`, `onAddToCart`, `onWantIt`, `isInCart` props per `contracts/product-card.md`; uses semantic tokens only (`bg-card`, `border-border`); uses `cn()` for conditional `isInCart` button state
- [x] T022 [P] [US1] Implement `components/catalog/ProductGrid.tsx` as Client Component: receives `{ products, cartItemIds, onAddToCart, onWantIt }`; renders responsive CSS grid (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[--spacing-card-gap]`); renders one `ProductCard` per product; shows "No hay productos" empty state with Shadcn `Empty` when `products` is empty
- [x] T023 [P] [US1] Implement `components/catalog/Pagination.tsx` as Client Component: accepts `{ currentPage, totalPages, onPageChange }`; renders "Anterior" and "Siguiente" `Button`s with `disabled` on boundaries; hides component entirely when `totalPages <= 1`; uses `variant="outline"` for buttons; accessible `aria-label` on each button
- [x] T024 [US1] Implement `app/page.tsx` as Client Component (`'use client'`): calls `getProducts()` from `lib/products.ts`; uses `usePagination` hook; passes `pageItems` to `<ProductGrid>`; renders `<Pagination>` below grid; `onAddToCart` and `onWantIt` are stub handlers for now (wired in US2/US3); scroll to top on page change
- [x] T025 [US1] Update `components/layout/Header.tsx`: wire `onClick` to open CartSheet state (use `useState` for `isSheetOpen` in a parent or pass down via props — the sheet itself is wired in US2); for US1, badge shows static 0 or is hidden

**Checkpoint (US1 complete)**: `pnpm dev` → browse all 15-item pages; all 139 photos load; grid is 2 cols on 375px, 3 on 768px, 4+ on 1280px; prev/next work correctly; last page has correct item count (9).

---

## Phase 4: User Story 2 — Carrito Multi-Item + Checkout WhatsApp (Priority: P2)

**Goal**: A visitor can add multiple pajamas from any page to the cart, view a summary, remove items, and finalize by opening WhatsApp with a pre-filled message containing product names and image URLs.

**Independent Test**: Add 3 products from different pages → open cart drawer → verify all 3 listed with thumbnails → remove 1 → badge updates → click "Finalizar pedido" → WhatsApp opens with 2 items listed with image URLs and correct total count.

### Implementation — US2

- [x] T026 [P] [US2] Implement `components/cart/CartItemRow.tsx` as Client Component: receives `{ item: CartItem, onRemove: (id: string) => void }`; renders a small thumbnail (`<img>` 48×48, `object-cover`, rounded), product name (`text-sm font-medium truncate`), and an `X` icon `Button` (variant `ghost`, size `icon`); uses `lucide-react` `X` icon with `data-icon`
- [x] T027 [P] [US2] Implement `components/cart/CartBadge.tsx` as Client Component: receives `{ count: number, onClick: () => void }`; renders Shadcn `Button` variant `ghost` with `ShoppingBag` lucide icon; overlays a `Badge` with `count` when `count > 0`; `aria-label="Ver carrito, N productos"`; hidden badge when `count === 0`
- [x] T028 [US2] Implement `components/cart/CartSheet.tsx` as Client Component: uses Shadcn `Sheet` (side panel); receives `{ isOpen, onClose, items, onRemoveItem, onCheckout }`; `SheetTitle` = "Tu carrito" (`sr-only` optional); lists `CartItemRow` for each item; shows `Empty` state when no items; footer has "Finalizar pedido" `Button` (disabled when `items.length === 0`) and `Separator` above it; uses `onCheckout` callback
- [x] T029 [US2] Wire cart into `app/page.tsx`: use `useCart` hook to get `{ addItem, isInCart, items, totalItems }`; use `useWhatsApp` hook to get `buildCartUrl`; pass real `onAddToCart` to `ProductGrid`; manage `isSheetOpen` state; pass `onCheckout={() => window.open(buildCartUrl(items), '_blank')}` to CartSheet
- [x] T030 [US2] Update `components/layout/Header.tsx`: receive `totalItems` and `onOpenCart` as props (or use `useCart` directly since Header is Client Component); render `CartBadge` with live count; `onClick` sets `isSheetOpen = true` in parent page
- [x] T031 [US2] Create `.env.local` and `.env.example`: add `NEXT_PUBLIC_SITE_URL=http://localhost:3000`; add comment `# Production: NEXT_PUBLIC_SITE_URL=https://your-catalog.vercel.app`

**Checkpoint (US2 complete)**: Cart badge shows live count; sheet opens with all added items and thumbnails; remove works; "Finalizar pedido" opens WhatsApp in new tab with product list; empty cart disables button.

---

## Phase 5: User Story 3 — "Lo Quiero" Compra Directa (Priority: P3)

**Goal**: A visitor sees a pajama they like and can click "Lo quiero" on the card to immediately open WhatsApp with a message for just that single item, without touching the cart.

**Independent Test**: Click "Lo quiero" on any card → WhatsApp opens in new tab → message contains the product name and image URL for that single item.

### Implementation — US3

- [x] T032 [US3] Wire "Lo quiero" button in `components/catalog/ProductCard.tsx`: update `onWantIt` handler in `app/page.tsx` using `useWhatsApp` → `buildSingleUrl(product)`; button renders as Shadcn `Button` with `asChild` + `<a>` tag with `href={url} target="_blank" rel="noopener noreferrer"` so it opens natively without JS click handler; variant `outline`
- [x] T033 [US3] Smoke-test "Lo quiero" end-to-end per `quickstart.md` single-item checklist: verify URL contains phone number, encoded product name, encoded image URL; verify image URL is publicly accessible when deployed

**Checkpoint (US3 complete)**: "Lo quiero" on any card opens WhatsApp with exactly one item's name and image. Does not affect cart state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Robustness, accessibility, production readiness, and constitution compliance validation.

- [x] T034 [P] Add image error fallback to `components/catalog/ProductCard.tsx`: use `onError` on `<img>` to replace `src` with a neutral placeholder (`bg-muted` div or placeholder SVG); card remains functional and layout does not break
- [x] T035 [P] Add image error fallback to `components/cart/CartItemRow.tsx`: same `onError` pattern for thumbnail
- [x] T036 [P] Accessibility audit on all components: verify `SheetTitle` present in `CartSheet`; verify all `Button`s have accessible labels (`aria-label` or visible text); verify `Pagination` buttons have `aria-label`; verify `ProductCard` image has meaningful `alt` attribute (`product.name`); verify no keyboard traps
- [x] T037 [P] Write unit tests for `hooks/use-cart.ts` in `hooks/__tests__/use-cart.test.ts`: cover addItem, duplicate no-op, removeItem, clearCart, isInCart true/false
- [x] T038 [P] Write unit tests for `hooks/use-pagination.ts` in `hooks/__tests__/use-pagination.test.ts`: cover first/last page boundaries, `next`/`prev` idempotency, `goToPage` clamping, `pageItems` slice correctness
- [x] T039 Validate static export: run `pnpm build`; verify `/out` directory contains all pages; serve locally with `npx serve out -p 4000` and repeat cart + WhatsApp checklist from `quickstart.md`
- [x] T040 [P] Update `WHATSAPP_PHONE` constant in `lib/whatsapp.ts` with the real vendor phone number in E.164 format (e.g. `5491112345678`)
- [ ] T041 [P] Configure Vercel deployment: run `npx vercel --prod`; set `NEXT_PUBLIC_SITE_URL` env var in Vercel dashboard to production URL; redeploy; verify image URLs in WhatsApp messages use the production domain

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)  ← BLOCKS all user stories
    ├─→ Phase 3 (US1)   ← P1 — start here
    ├─→ Phase 4 (US2)   ← depends on US1 components existing (ProductCard, page.tsx)
    └─→ Phase 5 (US3)   ← depends on US2 (useWhatsApp wired in page.tsx)
              ↓
        Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Only depends on Phase 2 completion. Start here.
- **US2 (P2)**: Depends on Phase 2 + US1 components (`ProductCard`, `app/page.tsx`). Wire cart into existing components.
- **US3 (P3)**: Depends on Phase 2 + US2 (since `useWhatsApp` is already set up in `page.tsx` in US2, US3 just wires the single-item button).

### Within Each Phase

- Tasks marked [P] have no shared file conflicts and can run in parallel.
- Foundation tasks T007–T020 must complete before US1 begins; however, T008–T012 and T016–T018 can all run in parallel once T007 exists (types are needed first).

---

## Parallel Execution Examples

### Phase 2 — After T007 (types defined):

```bash
# These 8 tasks can run simultaneously:
T008  Configure app/globals.css theme tokens
T009  Copy images to public/images/
T010  Create scripts/generate-products.ts
T011  lib/products.ts pure utilities
T012  lib/whatsapp.ts pure utilities
T016  hooks/use-cart.ts
T017  hooks/use-pagination.ts
T018  hooks/use-whatsapp.ts
# T013 (whatsapp unit tests) can run alongside T012 (same file group)
# T014, T015 (store + provider) run sequentially: T014 → T015
```

### Phase 3 — US1:

```bash
# These run simultaneously:
T021  components/catalog/ProductCard.tsx
T022  components/catalog/ProductGrid.tsx
T023  components/catalog/Pagination.tsx
# T024 (page.tsx) depends on T021–T023 existing
# T025 (Header) runs in parallel with T021–T023
```

### Phase 4 — US2:

```bash
# These run simultaneously:
T026  components/cart/CartItemRow.tsx
T027  components/cart/CartBadge.tsx
T031  .env.local + .env.example
# T028 (CartSheet) depends on T026
# T029 (wire page.tsx) depends on T027, T028
# T030 (Header badge) depends on T027
```

---

## Implementation Strategy

### MVP Scope (User Story 1 only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — all 14 tasks
3. Complete Phase 3 (US1) — 5 tasks
4. **STOP & VALIDATE**: Run quickstart.md catalog checklist
5. Deploy to Vercel (static only, no cart yet)

**Result**: A live, browseable catalog with all 139 photos.

### Full v1 Delivery

1. Phase 1 + Phase 2 + Phase 3 → MVP deployed
2. Phase 4 (US2) → Cart + WhatsApp checkout deployed
3. Phase 5 (US3) → "Lo quiero" deployed
4. Phase 6 (Polish) → Production hardening

---

## Notes

- `[P]` = different files, no shared state, safe to parallelize
- `[Story]` label maps each task to a user story for traceability
- US1 is the MVP — the catalog works and is valuable without the cart
- US2 and US3 are additive — they extend ProductCard and page.tsx without breaking US1
- Constitution requirement: `lib/whatsapp.ts` unit tests (T013) are **mandatory**, not optional
- All components: `bg-primary`/`text-muted-foreground` only — never raw color values
- Commit after each task or logical group; each checkpoint is a valid deploy point
