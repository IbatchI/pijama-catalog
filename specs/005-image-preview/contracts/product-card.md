# Contract: Product Card & Grid (Image Preview)

**Files**: `components/catalog/ProductCard.tsx`, `components/catalog/ProductGrid.tsx`
**Extends**: [003 product-card contract](../../003-size-pills/contracts/product-card.md)

---

## ProductCard — Updated Props

```ts
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size: Size) => void
  getWantItUrl: (product: Product, size: Size) => string
  isInCart: (size: Size) => boolean
  onPreview: (product: Product) => void   // NEW
}
```

---

## ProductCard — Photo trigger

When `imageError === false`:

- The photo area is a button (or equivalent) that calls `onPreview(product)` on
  click/tap (and keyboard activation).
- `aria-label` = `Ver foto ampliada de {product.name}`.
- Named group `group/photo` on the trigger (not the whole card) so footer hover
  does not reveal the zoom icon.
- Zoom icon (`ZoomIn` from lucide): `hidden` below `md`; on `md+` visible only
  while the photo is hovered (`opacity-0` → `group-hover/photo:opacity-100`).
- Icon MUST NOT fully obscure the product photo (semi-transparent overlay, centered).

When `imageError === true`:

- Fallback “Imagen no disponible” remains.
- No preview button; `onPreview` is never called.

Existing size pills, CTAs, and `useSizeSelection` are unchanged.

---

## ProductGrid — Updated behavior

```ts
interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, size: Size) => void
  getWantItUrl: (product: Product, size: Size) => string
  isInCart: (productId: string, size: Size) => boolean
}
```

Grid **owns** preview:

```ts
const { product, isOpen, open, close } = useImagePreview()
```

- Pass `onPreview={open}` to each card.
- Render one `ImagePreviewDialog` with `{ product, open: isOpen, onClose: close }`.
- Empty catalog state: no dialog needed (or dialog stays closed).

---

## Layout (card, top to bottom) — unchanged except photo interactivity

1. Product image — **now a preview trigger** when loaded
2. Name / price / type (current v0 UI)
3. Size pill row
4. Action buttons
