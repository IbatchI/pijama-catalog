# Contract: Product Card & Grid (Size Pills)

**Files**: `components/catalog/ProductCard.tsx`, `components/catalog/ProductGrid.tsx`
**Extends**: [001 product-card contract](../001-pijama-catalog/contracts/product-card.md)

---

## ProductCard — Updated Props

```ts
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size: Size) => void
  getWantItUrl: (product: Product, size: Size) => string
  isInCart: (size: Size) => boolean   // size-aware check per card
}
```

---

## ProductCard — Layout (top to bottom)

1. Product image (unchanged — 3:4 aspect ratio)
2. **Size pill row** (Toggle Group, always visible)
3. **Action buttons** (conditional — only when size selected)

---

## ProductCard — Behavior Contracts

| Scenario | Expected behavior |
|----------|-------------------|
| No size selected | Pill row visible; **no** "Agregar al carrito" or "Lo quiero" buttons |
| User selects "L 46/48" | Pill active; both action buttons appear |
| User switches S → M | Only M active; buttons remain visible |
| User re-taps active pill | Selection unchanged; buttons remain visible |
| `isInCart('M')` true, selected M | "Agregar" shows "En carrito ✓", disabled |
| `isInCart('M')` false, selected M | "Agregar" active |
| Same product L in cart, user selects M | "Agregar" active (M not in cart) |
| "Lo quiero" click | Opens `getWantItUrl(product, selectedSize)` in new tab |
| "Agregar" click | Calls `onAddToCart(product, selectedSize)` |
| No size selected | Action buttons not rendered (no click path) |

---

## ProductCard — Size Pill Visual Contract

- Component: Shadcn `ToggleGroup` + `ToggleGroupItem`
- Mode: `type="single"`
- Labels: from `SIZE_OPTIONS` (full text, e.g. `XL 50/52`)
- Active state: `data-[state=on]` with semantic primary tokens
- Layout: `flex-wrap`, fits ≥ 320px viewport without horizontal scroll (2×2 grid on narrow cards)
- Font: `text-xs` minimum for label legibility
- Accessibility: each pill is keyboard-focusable; group has `aria-label="Seleccionar talle"`

---

## ProductCard — Internal Hook

```ts
// Used inside ProductCard only
const { selectedSize, selectSize, hasSelection } = useSizeSelection()
```

ProductCard MUST NOT manage selection with raw `useState` — use the dedicated hook.

---

## ProductGrid — Updated Props

```ts
interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, size: Size) => void
  getWantItUrl: (product: Product, size: Size) => string
  isInCart: (productId: string, size: Size) => boolean
}
```

**Removed**: `cartItemIds: Set<string>` — replaced by size-aware `isInCart` callback from parent.

---

## ProductGrid — Behavior

- Passes `isInCart` as curried check: `(size) => isInCart(product.id, size)`
- Passes `getWantItUrl` bound per card: `(size) => getWantItUrl(product, size)`
- Grid columns unchanged: 2 / 3 / 4 / 5 responsive

---

## CartItemRow — Updated Display

```ts
interface CartItemRowProps {
  item: CartItem          // now includes size
  onRemove: (productId: string, size: Size) => void
}
```

| Field displayed | Source |
|-----------------|--------|
| Product name | `item.product.name` |
| Size label | `getSizeLabel(item.size)` — shown below name in muted text |
| Thumbnail | `item.product.imagePath` (unchanged) |

---

## CartSheet — Updated Props

```ts
interface CartSheetProps {
  // ...
  onRemoveItem: (productId: string, size: Size) => void
  // items: CartItem[] — each item has size
}
```

Summary view MUST show size for every line item (FR-008).
