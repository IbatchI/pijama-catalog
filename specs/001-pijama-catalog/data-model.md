# Data Model: Catálogo de Pijamas

**Feature**: 001-pijama-catalog
**Date**: 2026-08-31

---

## Entities

### Product

Represents a single pajama item available in the catalog.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier (e.g. `"wA0067"`). Derived from filename suffix. |
| `name` | `string` | ✅ | Display name shown in cart and WhatsApp message (e.g. `"Pijama #67"`). |
| `price` | `number \| null` | ✅ | Price in local currency. `null` if not yet defined. |
| `type` | `string` | ✅ | Category label (e.g. `"verano"`, `"invierno"`, `"niños"`). `"general"` default. |
| `imagePath` | `string` | ✅ | Path relative to `public/` (e.g. `"/images/IMG-20260831-WA0067.jpg"`). |

**Validation rules**:
- `id` MUST be unique across all products.
- `name` MUST be non-empty.
- `imagePath` MUST start with `/images/` and reference an existing file in `public/images/`.
- `price` MUST be a positive number or `null`. Negative values are invalid.
- `type` MUST be a non-empty string.

**Computed property** (not stored, derived at runtime):
- `imageUrl`: Absolute URL for WhatsApp message = `NEXT_PUBLIC_SITE_URL + imagePath`.

**TypeScript interface**:
```ts
interface Product {
  id: string
  name: string
  price: number | null
  type: string
  imagePath: string
}
```

---

### CartItem

Represents a product that has been added to the shopping cart by the user.

| Field | Type | Required | Description |
|---|---|---|---|
| `product` | `Product` | ✅ | Full product snapshot at time of addition. |

**Notes**:
- The cart stores the full `Product` object (not just the ID) to avoid re-lookups and
  to ensure the WhatsApp message can be built without referencing the product list.
- v1 does not support quantity > 1 per item. Each product appears at most once in the cart
  (duplicate adds are no-ops or replace the existing entry).

**TypeScript interface**:
```ts
interface CartItem {
  product: Product
}
```

---

### CartStore (Zustand State Shape)

Client-side state managed by Zustand. Lives in browser memory for the duration of the session.

| Field / Action | Type | Description |
|---|---|---|
| `items` | `CartItem[]` | Current items in the cart. |
| `addItem(product)` | `(product: Product) => void` | Adds product to cart. No-op if already present. |
| `removeItem(id)` | `(id: string) => void` | Removes item with matching product id. |
| `clearCart()` | `() => void` | Empties the cart (called after WhatsApp link is opened). |
| `isInCart(id)` | `(id: string) => boolean` | Returns true if product is already in cart. |
| `totalItems` | `number` (derived) | Count of items currently in cart (`items.length`). |

**State transitions**:

```
[empty cart]
    │ addItem(product)
    ▼
[1+ items]  ◄──────────────── addItem(product)  (no-op if duplicate)
    │ removeItem(id)
    ▼
[0 items if last removed]
    │ clearCart() / all removed
    ▼
[empty cart]
```

---

### PaginationState (local UI state, not Zustand)

Managed with `useState` inside the catalog page component.

| Field | Type | Description |
|---|---|---|
| `currentPage` | `number` | 1-based current page index. |
| `totalPages` | `number` | `Math.ceil(products.length / PAGE_SIZE)` |
| `pageItems` | `Product[]` | Slice of products for the current page. |

**Constants**:
```ts
const PAGE_SIZE = 15  // items per page — constitutional requirement
```

---

## Relationships

```
Product  (defined in data/products.ts)
  └─ referenced by ─► CartItem.product
                       └─ held by ─► CartStore.items[]
```

The catalog page reads all `Product[]` from `lib/products.ts`, passes the current page's
slice to `ProductGrid`, which renders one `ProductCard` per product. `ProductCard` reads
`isInCart` from the Zustand store to toggle button state.

---

## Data File Convention

Product definitions live in `data/products.ts` as a plain TypeScript array:

```ts
// data/products.ts
import type { Product } from '@/types'

export const products: Product[] = [
  {
    id: 'WA0067',
    name: 'Pijama #67',
    price: null,
    type: 'general',
    imagePath: '/images/IMG-20260831-WA0067.jpg',
  },
  // ... 138 more entries
]
```

**Auto-generation**: For the initial 139 images, a one-time script
(`scripts/generate-products.ts`) can scan `public/images/` and output the array.
Product names and prices are then filled in manually by the owner. See `quickstart.md`
for the script invocation.
