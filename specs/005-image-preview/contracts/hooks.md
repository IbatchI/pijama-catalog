# Contract: Custom Hooks — Image Preview

**Directory**: `hooks/`
**Extends**: [003 hooks contract](../../003-size-pills/contracts/hooks.md)

---

## `useImagePreview` — `hooks/use-image-preview.ts` (NEW)

Single responsibility: which product (if any) is shown in the page-level preview overlay.

```ts
interface UseImagePreviewReturn {
  product: Product | null
  isOpen: boolean
  open: (product: Product) => void
  close: () => void
}

export function useImagePreview(): UseImagePreviewReturn
```

**Behavior contracts**:
- Initial: `product = null`, `isOpen = false`.
- `open(product)` sets `product` (replaces previous if already open).
- `close()` sets `product = null`.
- `isOpen` is derived: `product !== null`.
- MUST NOT import Zustand, lib utilities, or JSX.
- MUST NOT live inside `ProductCard` (one instance per grid, not per card).

---

## Unchanged hooks

`useCart`, `usePagination`, `useWhatsApp`, `useSizeSelection` — no signature or
behavior changes for this feature.

---

## Hook dependency rules (this feature)

```
components/catalog/ProductGrid.tsx
    ↓ imports
hooks/use-image-preview.ts        → types/ (Product only)
components/catalog/ImagePreviewDialog.tsx

components/catalog/ProductCard.tsx
    ↓ calls
onPreview(product)                ← prop from grid; no preview hook inside the card

components/*.tsx
    ✗ NEVER import stores/ or lib/ for preview
```

---

## Test contracts

| Suite | File | Min cases |
|-------|------|-----------|
| `useImagePreview` | `hooks/__tests__/use-image-preview.test.ts` | starts closed; open sets product; close clears; open B while A is open replaces A |
