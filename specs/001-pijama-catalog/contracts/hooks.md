# Contract: Custom Hooks — Logic Layer

**Directory**: `hooks/`
**Type**: React Client Hooks (all hooks require `'use client'` in their consumers)

These hooks are the **only** entry point for business logic in components.
Components MUST NOT import from `stores/`, `lib/whatsapp.ts`, or call Zustand directly.

---

## `useCart` — `hooks/use-cart.ts`

Single responsibility: expose cart state and actions as a clean API.
Wraps all Zustand selectors so components are decoupled from the store shape.

```ts
interface UseCartReturn {
  items: CartItem[]
  totalItems: number                       // derived: items.length
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

export function useCart(): UseCartReturn
```

**Behavior contracts**:
- `addItem` is a no-op if `isInCart(product.id)` is already `true`.
- `totalItems` is always `items.length` — no separate counter state.
- This hook MUST NOT contain any JSX or import any component.

---

## `usePagination` — `hooks/use-pagination.ts`

Single responsibility: manage current page state and compute the visible product slice.

```ts
interface UsePaginationProps {
  products: Product[]
  pageSize?: number   // default: 15
}

interface UsePaginationReturn {
  currentPage: number       // 1-based
  totalPages: number
  pageItems: Product[]      // products slice for currentPage
  goToPage: (page: number) => void
  next: () => void          // no-op if on last page
  prev: () => void          // no-op if on first page
  isFirstPage: boolean
  isLastPage: boolean
}

export function usePagination(props: UsePaginationProps): UsePaginationReturn
```

**Behavior contracts**:
- `goToPage` clamps the argument to `[1, totalPages]`.
- `next` / `prev` are safe to call at boundaries (idempotent).
- When `currentPage` changes, `pageItems` is recomputed synchronously.
- This hook MUST NOT import the cart store or any WhatsApp logic.

---

## `useWhatsApp` — `hooks/use-whatsapp.ts`

Single responsibility: produce ready-to-open `wa.me` URLs from cart or single product.
Reads `NEXT_PUBLIC_SITE_URL` and the phone constant internally.

```ts
interface UseWhatsAppReturn {
  /** Build URL for all items currently in the cart (for checkout). */
  buildCartUrl: (items: CartItem[]) => string

  /** Build URL for a single product (for "Lo quiero" shortcut). */
  buildSingleUrl: (product: Product) => string
}

export function useWhatsApp(): UseWhatsAppReturn
```

**Behavior contracts**:
- Both functions delegate to the pure utilities in `lib/whatsapp.ts`.
- The hook injects `process.env.NEXT_PUBLIC_SITE_URL` and `WHATSAPP_PHONE`
  so call sites never need to know about these constants.
- `buildCartUrl([])` returns an empty string (caller should guard before opening).
- This hook MUST NOT import any Zustand store — it receives items as arguments.

---

## Hook Dependency Rules

```
components/*.tsx
    ↓ imports
hooks/use-cart.ts       → stores/cart-store.ts
hooks/use-pagination.ts → (pure, no external deps)
hooks/use-whatsapp.ts   → lib/whatsapp.ts

components/*.tsx
    ✗ NEVER directly import stores/, lib/whatsapp.ts
```

---

## Test Contracts

| Suite | File | Min cases |
|---|---|---|
| `useCart` | `hooks/__tests__/use-cart.test.ts` | add, remove, duplicate no-op, clear, isInCart |
| `usePagination` | `hooks/__tests__/use-pagination.test.ts` | next/prev boundary, goToPage clamp, pageItems slice |
| `useWhatsApp` | `hooks/__tests__/use-whatsapp.test.ts` | single product URL, multi-item URL, empty guard |
