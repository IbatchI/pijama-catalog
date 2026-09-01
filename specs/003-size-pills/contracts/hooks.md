# Contract: Custom Hooks — Size Feature Additions

**Directory**: `hooks/`
**Extends**: [001 hooks contract](../001-pijama-catalog/contracts/hooks.md)

---

## `useSizeSelection` — `hooks/use-size-selection.ts` (NEW)

Single responsibility: manage local size pill selection state for one ProductCard.

```ts
interface UseSizeSelectionReturn {
  selectedSize: Size | null
  selectSize: (size: Size) => void
  hasSelection: boolean    // derived: selectedSize !== null
}

export function useSizeSelection(): UseSizeSelectionReturn
```

**Behavior contracts**:
- Initial state: `selectedSize = null`, `hasSelection = false`.
- `selectSize(size)` sets `selectedSize` to `size` (replaces previous selection).
- Calling `selectSize` with the already-selected size is a no-op (stays selected).
- There is NO `clearSelection` — unmount resets state.
- MUST NOT import Zustand, lib, or any component.
- MUST NOT contain JSX.

---

## `useCart` — `hooks/use-cart.ts` (MODIFIED)

```ts
interface UseCartReturn {
  items: CartItem[]                    // items include size
  totalItems: number
  addItem: (product: Product, size: Size) => void
  removeItem: (productId: string, size: Size) => void
  clearCart: () => void
  isInCart: (productId: string, size: Size) => boolean
}
```

**Changed from 001**: all cart actions are size-aware (see cart-store contract).

---

## `useWhatsApp` — `hooks/use-whatsapp.ts` (MODIFIED)

```ts
interface UseWhatsAppReturn {
  buildCartUrl: (items: CartItem[]) => string
  buildSingleUrl: (product: Product, size: Size) => string   // was (product) only
}
```

**Behavior contracts**:
- `buildSingleUrl(product, size)` constructs `{ product, size }` as `CartItem` internally.
- `buildCartUrl` unchanged signature; items must include `size`.
- Caller MUST pass a valid `Size` — hook does not guard against `null`.

---

## `usePagination` — unchanged

No modifications for this feature.

---

## Hook Dependency Rules (updated)

```
components/catalog/ProductCard.tsx
    ↓ imports
hooks/use-size-selection.ts   → types/ (Size only)
hooks/use-cart.ts             → stores/cart-store.ts
hooks/use-whatsapp.ts         → lib/whatsapp.ts, data/sizes.ts (indirect via lib)

components/*.tsx
    ✗ NEVER import data/sizes.ts directly (use hooks or pass labels from parent)
    ✗ NEVER import stores/ or lib/whatsapp.ts directly
```

---

## Test Contracts

| Suite | File | Min cases |
|-------|------|-----------|
| `useSizeSelection` | `hooks/__tests__/use-size-selection.test.ts` | initial null, select, switch, re-select same |
| `useCart` | `hooks/__tests__/use-cart.test.ts` | update for size-aware add/remove/isInCart |
| `useWhatsApp` | `hooks/__tests__/use-whatsapp.test.ts` | buildSingleUrl with size param |
