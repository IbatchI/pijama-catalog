# Research: Catálogo de Pijamas — Phase 0

**Feature**: 001-pijama-catalog
**Date**: 2026-08-31

---

## R-001: Next.js Static Export with App Router

**Decision**: Use Next.js 16 App Router with `output: 'export'` in `next.config.ts`.

**Rationale**: Static export produces a pure HTML/CSS/JS bundle in `/out` that can be
deployed to any CDN (including Vercel's static hosting) without a Node.js runtime.
The App Router is the current Next.js standard and supports static generation out of
the box via async Server Components that read data at build time.

**Key constraints confirmed by docs**:
1. `next/image` with the default optimizer is **incompatible** with static export.
   Solution: `images: { unoptimized: true }` in `next.config.ts`. Since our images
   are pre-sourced JPEGs (≤ 200 KB target after manual optimization), runtime
   optimization adds no value anyway.
2. `output: 'export'` replaces the deprecated `next export` CLI command (removed in v14).
3. Dynamic route segments (`[page]`) work with `generateStaticParams` — used to
   pre-render each catalog page at build time.
4. Client Components can use all browser APIs (localStorage, etc.); Server Components
   cannot. Cart logic is entirely client-side.

**Alternatives considered**:
- Vite + React (no SSG): Simpler, but loses SEO-friendly static HTML and Vercel's
  native Next.js CI/CD integration.
- Next.js with Vercel serverless functions: Over-engineered for a static catalog.
  Would violate Principle I (Static-First).

---

## R-002: Zustand v5 with Next.js App Router

**Decision**: Use the **Context-Provider + `createStore` factory** pattern recommended
by Zustand for Next.js App Router.

**Rationale**: In App Router, Server Components render on the server at build time.
A module-level Zustand store (the common pattern for plain React) would be shared
across requests and could cause hydration mismatches. The correct pattern is:

1. Define a `createCartStore()` factory in `stores/cart-store.ts` using
   `createStore` from `zustand/vanilla`.
2. Wrap the app in a `CartStoreProvider` (a Client Component) that creates one store
   instance per page load and exposes it via React Context.
3. Consume the store with a `useCartStore` hook that reads from context.

**Cart persistence**: v1 keeps cart in-memory only (lost on tab close), matching the
spec assumption. No `persist` middleware needed. If v2 requires persistence, add
`persist` + `localStorage` to the store factory with no architectural changes.

**Key API (v5)**:
```ts
// stores/cart-store.ts
import { createStore } from 'zustand/vanilla'

export const createCartStore = () =>
  createStore<CartStore>()((set, get) => ({ ... }))

// providers/cart-store-provider.tsx  (Client Component)
const CartStoreContext = createContext<CartStoreApi | null>(null)

export function CartStoreProvider({ children }) {
  const storeRef = useRef<CartStoreApi>()
  if (!storeRef.current) storeRef.current = createCartStore()
  return (
    <CartStoreContext.Provider value={storeRef.current}>
      {children}
    </CartStoreContext.Provider>
  )
}

export const useCartStore = <T,>(selector: (s: CartStore) => T) => {
  const store = useContext(CartStoreContext)
  return useStore(store, selector)
}
```

**Alternatives considered**:
- Module-level `create()` (simpler): Works fine for client-only apps but risks
  cross-request state pollution during build-time SSR in App Router. Rejected for safety.
- Jotai / Recoil: More complex, not requested. Zustand is the user's explicit choice.

---

## R-003: Shadcn/ui with Tailwind CSS v4

**Decision**: Use `shadcn@latest` CLI with Tailwind CSS v4, which is fully supported
as of Shadcn's 2025 release.

**Rationale**: Shadcn v4 rewrites its internal styles to use Tailwind v4's CSS variable
system. Running `npx shadcn@latest init` auto-detects the Next.js + Tailwind v4 setup.

**Components needed from Shadcn** (install individually):
- `card` — product card wrapper
- `sheet` — cart side drawer
- `badge` — item count indicator
- `button` — CTA actions
- `separator` — visual dividers in cart

**Setup commands**:
```bash
npx shadcn@latest init          # configures components.json + globals.css
npx shadcn@latest add card sheet badge button separator
```

**Alternatives considered**: Manual Tailwind components — more work, less accessible.
Radix primitives directly — Shadcn is the abstraction the user explicitly requested.

---

## R-004: WhatsApp `wa.me` Deep-Link Format

**Decision**: Use `https://wa.me/{E164_phone}?text={encodeURIComponent(message)}`
with a plaintext message body. No WhatsApp Business API integration for v1.

**Message format** (constructed by `lib/whatsapp.ts`):
```
Hola! Me interesan estos pijamas:

1. Pijama Verano Floral
   📷 https://mi-catalogo.vercel.app/images/IMG-20260831-WA0067.jpg

2. Pijama Invierno Polar
   📷 https://mi-catalogo.vercel.app/images/IMG-20260831-WA0080.jpg

Total: 2 pijamas seleccionados ✨
```

**Phone number handling**: The E.164 number (e.g. `5491112345678` for Argentina)
is stored as a compile-time constant in `lib/whatsapp.ts` (not an env var, as it is
public and non-sensitive). The `NEXT_PUBLIC_SITE_URL` env variable provides the base
URL for constructing absolute image paths.

**URL length risk**: Each item adds ~80–120 chars. At 20 items the URL is ~2400 chars,
near the browser URL limit (~2000 on some browsers). Mitigation: if `items.length > 15`,
the message includes a note "Ver más detalles en el catálogo" without listing all images,
and a summary count is shown instead. This edge case is documented in quickstart.md.

**Alternatives considered**:
- Meta WhatsApp Business Cloud API: Requires business approval, webhook infra.
  Over-engineered for v1 with a single vendor.
- Twilio / 360dialog: Adds cost and dependency. Unnecessary for `wa.me` use case.

---

## R-005: Image Strategy & Organization

**Decision**: Copy all images from `Downloads/Fotos pijamas /` to `public/images/`
in the project. Use kebab-case or retain original filenames. Product data file maps
each product to its image filename.

**Current image naming**: `IMG-20260831-WA0067.jpg` through `IMG-20260831-WA0116.jpg`
(139 files). For v1, product names in `data/products.ts` can be auto-generated as
`"Pijama #67"` derived from the filename suffix until the owner defines real names.

**Future-proofing**: The `Product` type includes `imagePath: string` (e.g.
`/images/verano/pijama-floral.jpg`). When images are reorganized into subfolders,
only the data file needs updating — no component changes required.

**Image optimization target**: Each JPEG should be ≤ 200 KB before committing.
Batch-resize to max 800×800px. Tooling: `sharp` CLI or `imagemagick` (not bundled in
the app, run manually or via a one-off script).

---

## R-006: Pagination Strategy

**Decision**: Client-side pagination using `useState` for the current page index.
No URL-based routing (`/page/2`) for v1 to keep the static export simple.

**Rationale**: Since the full product list is bundled at build time (small JSON, ~139
items), all data is available client-side. Slicing the array per page is instant.
No `generateStaticParams` needed for paginated routes.

**Page size**: 15 items/page (spec requirement). 139 items → 10 pages (last page has 9).

**Alternatives considered**: URL-based pagination (`/catalog?page=2`) — better for
shareability but adds complexity (query param parsing, scroll restoration). Deferred to v2.

---

## Resolved Clarifications

All `NEEDS CLARIFICATION` markers from the spec were resolved without user input,
using reasonable defaults documented in spec Assumptions. No open questions remain.
