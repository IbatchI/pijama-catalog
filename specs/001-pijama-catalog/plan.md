# Implementation Plan: Catálogo de Pijamas — Navegación y Carrito

**Branch**: `001-pijama-catalog` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-pijama-catalog/spec.md`

## Summary

Build a fully static, paginated pajama catalog as a Next.js App Router application deployed
on Vercel. The app displays ~139 product photos in a responsive card grid (15 per page),
exposes an in-session cart powered by Zustand, and converts all purchase intents into
`wa.me` WhatsApp deep-links that embed product names and public image URLs. UI components
are built with Shadcn/ui + Tailwind CSS. No backend, no auth, no filters in v1.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS

**Framework**: Next.js 16 (App Router) with `output: 'export'` (fully static)

**Primary Dependencies**:
- `next` + `react` + `react-dom` — framework
- `zustand` v5 — client-side cart state
- `shadcn/ui` — UI component library (Button, Sheet, Badge, Card)
- `tailwindcss` v4 — utility-first styling
- `lucide-react` — icon set (bundled with Shadcn)

**Storage**: Static files only — product data in `data/products.ts`, images in `public/images/`

**Testing**: Vitest + React Testing Library (unit tests for WhatsApp message builder;
integration tests for cart add/remove flows)

**Target Platform**: Web browser (mobile-first); deployed as Vercel static CDN

**Project Type**: Web application — single-page static catalog

**Performance Goals**: First Contentful Paint < 2s on mobile (4G); all 139 product images
lazy-loaded, each ≤ 200 KB after optimization

**Constraints**:
- `output: 'export'` — no SSR at runtime, no Vercel serverless functions
- `images.unoptimized: true` — required because `next/image` default optimizer is
  incompatible with static export; images are pre-optimized at source
- Cart state is browser-memory-only (no localStorage for v1; see Assumptions)
- No external API calls at runtime; no environment secrets exposed to the client
  except the WhatsApp phone number (public, non-sensitive)
- `wa.me` deep-link cap: URL ~2000 characters; with ~20 products this is safe;
  overflow handling documented in edge cases

**Scale/Scope**: ~139 products (initial batch), single vendor, 15 items/page → 10 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Static-First Delivery | `output: 'export'` enforced; no runtime server | ✅ PASS | `images.unoptimized: true` required |
| II. WhatsApp-Driven Commerce | `wa.me` deep-link with name + image URL for both cart and "Lo quiero" | ✅ PASS | Phone number in public config constant |
| III. Card-Grid Catalog UI | Responsive grid, photo-only cards, two CTAs per card | ✅ PASS | Shadcn Card, Tailwind responsive grid |
| IV. Cart & Checkout Simplicity | Zustand module store, no accounts/payments, browser-memory only | ✅ PASS | Context-Provider pattern for App Router hydration safety |
| V. Catalog Simplicity | No filters/search/sort; pagination only | ✅ PASS | 15 items/page, prev/next navigation |

**All gates pass. No constitution violations.**

## Project Structure

### Documentation (this feature)

```text
specs/001-pijama-catalog/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── product-card.md
│   ├── cart-store.md
│   └── whatsapp-builder.md
└── tasks.md             ← Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
/
├── app/
│   ├── layout.tsx              # Root layout: CartStoreProvider + Header
│   ├── page.tsx                # Catalog page (pagination state via searchParams)
│   └── globals.css
│
├── components/
│   ├── catalog/
│   │   ├── ProductCard.tsx     # Single product card (photo + actions)
│   │   ├── ProductGrid.tsx     # Responsive grid wrapper
│   │   └── Pagination.tsx      # Prev/Next page controls
│   ├── cart/
│   │   ├── CartSheet.tsx       # Shadcn Sheet drawer with cart contents
│   │   ├── CartItemRow.tsx     # Single item row in drawer (photo + name + remove)
│   │   └── CartBadge.tsx       # Floating/header badge with item count
│   └── layout/
│       └── Header.tsx          # Top bar: logo + CartBadge
│
├── providers/
│   └── cart-store-provider.tsx # Zustand Context provider (App Router pattern)
│
├── stores/
│   └── cart-store.ts           # createStore factory (zustand/vanilla) — state shape only
│
├── hooks/                      # Logic layer — all non-trivial behavior lives here
│   ├── use-cart.ts             # Cart selectors + actions (wraps Zustand)
│   ├── use-pagination.ts       # Pagination state: currentPage, next, prev, pageItems
│   └── use-whatsapp.ts         # URL builders: buildCartUrl(), buildSingleUrl()
│
├── lib/
│   ├── products.ts             # Pure fns: getProducts(), getPaginatedProducts()
│   └── whatsapp.ts             # Pure fns: buildWhatsAppUrl(), buildSingleItemWhatsAppUrl()
│
├── data/
│   └── products.ts             # Static product definitions array
│
├── types/
│   └── index.ts                # Product, CartItem interfaces
│
├── public/
│   └── images/                 # 139 JPEG photos copied from "Fotos pijamas"
│
├── next.config.ts              # output: 'export', images.unoptimized: true
├── tailwind.config.ts
├── components.json             # Shadcn config
└── package.json
```

**Structure Decision**: Single Next.js project (Option 2 variant with no separate backend).
All data is bundled at build time. No `api/` routes needed. Shadcn components land in
`components/ui/` as per Shadcn CLI convention; custom components in named subdirectories.

## Architectural Principles

These principles were added after Phase 1 design and MUST be enforced throughout
implementation. They complement the constitution and take precedence over generic patterns.

### 1. Single Responsibility Principle (SRP)

Every file has exactly one reason to change:

| Layer | Responsibility | Example |
|---|---|---|
| `types/index.ts` | Shape definitions only — no logic | `Product`, `CartItem` interfaces |
| `data/products.ts` | Raw product data — no computation | Array of product literals |
| `lib/*.ts` | Pure functions — no React, no side effects | `buildWhatsAppUrl`, `getProducts` |
| `stores/cart-store.ts` | State shape + actions factory — no UI | `createCartStore` |
| `hooks/*.ts` | Logic + store wiring — no JSX | `useCart`, `usePagination` |
| `components/**/*.tsx` | JSX only — reads from hooks, no logic | `ProductCard`, `CartSheet` |
| `providers/*.tsx` | Context wiring — no business logic | `CartStoreProvider` |
| `app/page.tsx` | Route composition — no inline logic | Assembles components |

**Rule**: If a component file contains an `if` that isn't about rendering, the logic
belongs in a hook. If a hook imports JSX, something is wrong.

### 2. Custom Hooks — Logic/View Separation

All non-trivial behavior lives in a dedicated hook under `hooks/`. Components receive
values and callbacks only — they never call store actions directly.

```text
hooks/
├── use-cart.ts          # Zustand selectors + actions (add, remove, clear, isInCart, count)
├── use-pagination.ts    # currentPage, totalPages, goTo, next, prev, pageItems
└── use-whatsapp.ts      # buildCartUrl(), buildSingleUrl() — reads SITE_URL + PHONE constant
```

**Pattern**:
```ts
// hook (logic lives here)
export function useCart() {
  const items      = useCartStore((s) => s.items)
  const addItem    = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart  = useCartStore((s) => s.clearCart)
  const isInCart   = useCartStore((s) => s.isInCart)
  return { items, totalItems: items.length, addItem, removeItem, clearCart, isInCart }
}

// component (view only — no store imports)
export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart()
  const { buildSingleUrl }    = useWhatsApp()
  return (
    <Card>
      <img src={product.imagePath} alt={product.name} />
      <Button onClick={() => addItem(product)} disabled={isInCart(product.id)}>
        {isInCart(product.id) ? 'En carrito ✓' : 'Agregar al carrito'}
      </Button>
      <Button asChild variant="outline">
        <a href={buildSingleUrl(product)} target="_blank" rel="noopener noreferrer">
          Lo quiero
        </a>
      </Button>
    </Card>
  )
}
```

### 3. Tailwind Theme — Centralized & Configurable

The design system is defined **once** in `app/globals.css` using Tailwind v4's CSS variable
system. No raw color values anywhere in components — only semantic token names.

**Token structure in `globals.css`**:
```css
@theme {
  /* Brand palette — change these to retheme the entire app */
  --color-brand-50:  #fdf4ff;
  --color-brand-100: #fae8ff;
  --color-brand-500: #a855f7;   /* primary accent */
  --color-brand-900: #3b0764;

  /* Spacing scale extension */
  --spacing-card: 1rem;

  /* Typography */
  --font-sans: 'Geist', sans-serif;
  --font-size-xs: 0.75rem;
}

/* Semantic layer — map brand tokens to role tokens */
:root {
  --background:        var(--color-neutral-50);
  --foreground:        var(--color-neutral-900);
  --card-background:   #ffffff;
  --card-border:       var(--color-neutral-200);
  --primary:           var(--color-brand-500);
  --primary-foreground: #ffffff;
  --muted:             var(--color-neutral-100);
  --muted-foreground:  var(--color-neutral-500);
  /* ... Shadcn's full CSS variable set ... */
}
```

**Rules**:
- Components use `bg-primary`, `text-muted-foreground`, `border-card-border` etc.
- **Never** use `bg-purple-500` or any raw Tailwind palette value in a component.
- Changing the brand color means editing exactly **2 lines** in `globals.css`.
- Dark mode is handled by `:root[class~="dark"]` overrides in the same file — no
  `dark:` prefixes scattered in components.

### 4. Next.js & Shadcn Conventions

- `'use client'` only on components that use hooks, event handlers, or browser APIs.
  Server Components that only render static markup have no directive.
- `next/image` with `unoptimized` prop for all product images (static export constraint).
- `<img>` is forbidden except inside `next/image` implementation.
- Shadcn semantic colors only: `bg-primary`, `text-muted-foreground`, never raw hex.
- `cn()` for all conditional class merging — never template literals with ternaries.
- Icons: `lucide-react` with `data-icon` prop pattern per Shadcn rules.
- No `space-x-*` / `space-y-*` — use `flex gap-*` everywhere.
- Dialog/Sheet always has a `SheetTitle` (use `className="sr-only"` if visually hidden).

## Complexity Tracking

No constitution violations requiring justification.
