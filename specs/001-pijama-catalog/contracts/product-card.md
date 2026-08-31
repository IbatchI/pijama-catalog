# Contract: Product Card Component

**File**: `components/catalog/ProductCard.tsx`
**Type**: React Client Component

---

## Purpose

Displays a single pajama product as a card in the catalog grid. Renders the product
photo as the primary visual element. Exposes two actions: add-to-cart and direct
WhatsApp purchase ("Lo quiero").

## Props Interface

```ts
interface ProductCardProps {
  /** The product to display. */
  product: Product

  /**
   * Callback fired when the user clicks "Agregar al carrito".
   * The parent (ProductGrid/page) is responsible for calling the Zustand action.
   */
  onAddToCart: (product: Product) => void

  /**
   * Callback fired when the user clicks "Lo quiero".
   * The parent constructs and opens the wa.me link.
   */
  onWantIt: (product: Product) => void

  /**
   * Whether this product is already in the cart.
   * Controls the visual state of the "Agregar" button (active vs. added).
   */
  isInCart: boolean
}
```

## Behavior Contracts

| Scenario | Expected behavior |
|---|---|
| `isInCart = false` | "Agregar al carrito" button is active (primary style). |
| `isInCart = true` | Button shows "En carrito ✓" in a muted/success style. Clicking again is a no-op (parent guards). |
| Image load failure | Shows a neutral placeholder background; card remains functional. |
| "Lo quiero" click | Calls `onWantIt(product)`. Parent opens `wa.me` link. Button does not change state. |
| Hover (desktop) | Overlay with action buttons fades in over the image (or buttons are always visible below on mobile). |

## Visual Contract

- Card aspect ratio: **3:4** (portrait, consistent with pajama photos).
- Image fills the full card; `object-fit: cover`.
- Action buttons are positioned below the image (not overlaid) for mobile usability.
- Card has a subtle border/shadow; no price or name text visible in the grid view.
- Minimum card width: 140px (2-column mobile grid).

---

# Contract: Product Grid Component

**File**: `components/catalog/ProductGrid.tsx`
**Type**: React Client Component

## Props Interface

```ts
interface ProductGridProps {
  /** Products to render for the current page (already paginated slice). */
  products: Product[]

  /** Set of product IDs currently in the cart. */
  cartItemIds: Set<string>

  /** Triggered when the user adds a product to the cart. */
  onAddToCart: (product: Product) => void

  /** Triggered when the user clicks "Lo quiero" on a product. */
  onWantIt: (product: Product) => void
}
```

## Behavior Contracts

- Renders exactly `products.length` cards.
- Grid columns: 2 (mobile) / 3 (md) / 4 (lg) / 5 (xl).
- No empty filler cells for partial last rows.
- If `products` is empty, renders a centered "No hay productos" message.

---

# Contract: Pagination Component

**File**: `components/catalog/Pagination.tsx`
**Type**: React Client Component

## Props Interface

```ts
interface PaginationProps {
  currentPage: number    // 1-based
  totalPages: number
  onPageChange: (page: number) => void
}
```

## Behavior Contracts

| Scenario | Expected behavior |
|---|---|
| `currentPage = 1` | "Anterior" button is disabled. |
| `currentPage = totalPages` | "Siguiente" button is disabled. |
| `totalPages = 1` | Both buttons are disabled (or component is hidden). |
| `onPageChange(n)` | Parent updates `currentPage`; grid scrolls to top. |

---

# Contract: Cart Badge Component

**File**: `components/cart/CartBadge.tsx`
**Type**: React Client Component

## Props Interface

```ts
interface CartBadgeProps {
  /** Total number of items in cart. */
  count: number
  /** Opens the CartSheet. */
  onClick: () => void
}
```

## Behavior Contracts

- If `count = 0`: badge is hidden (or shows shopping bag icon with no number).
- If `count ≥ 1`: shows red/accent badge with the count overlaid on the cart icon.
- Always accessible (keyboard focusable, aria-label="Ver carrito, N productos").

---

# Contract: Cart Sheet Component

**File**: `components/cart/CartSheet.tsx`
**Type**: React Client Component (wraps Shadcn Sheet)

## Props Interface

```ts
interface CartSheetProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
}
```

## Behavior Contracts

| Scenario | Expected behavior |
|---|---|
| `items.length = 0` | Shows empty state: "Tu carrito está vacío". Checkout button is disabled. |
| `items.length ≥ 1` | Lists all items with photo, name, remove button. Checkout button is active. |
| `onCheckout()` fired | Opens `wa.me` link in new tab. Cart is NOT auto-cleared (user decides). |
| `onRemoveItem(id)` fired | Item removed instantly, count badge updates without close/reopen. |
