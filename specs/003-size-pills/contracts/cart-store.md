# Contract: Zustand Cart Store (Size-Aware)

**File**: `stores/cart-store.ts` + `providers/cart-store-provider.tsx`
**Type**: Zustand vanilla store + React Context provider
**Extends**: [001 cart-store contract](../001-pijama-catalog/contracts/cart-store.md)

---

## Store Interface

```ts
interface CartItem {
  product: Product
  size: Size
}

interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (product: Product, size: Size) => void
  removeItem: (productId: string, size: Size) => void
  clearCart: () => void
  isInCart: (productId: string, size: Size) => boolean
}

type CartStore = CartState & CartActions
```

---

## Identity Helper (internal)

```ts
function lineKey(productId: string, size: Size): string {
  return `${productId}:${size}`
}
```

---

## Action Contracts

### `addItem(product: Product, size: Size) => void`

- If `items` already contains an entry where `product.id === product.id` AND
  `item.size === size`, the call is a **no-op**.
- Otherwise, appends `{ product, size }` to `items`.
- Same product with a **different** size creates a **new line** (not a no-op).

### `removeItem(productId: string, size: Size) => void`

- Removes the item matching both `productId` and `size`.
- If only `productId` matches but `size` differs, that item is **not** removed.
- No-op if no matching line exists.

### `clearCart() => void`

- Sets `items` to `[]`. Unchanged from 001.

### `isInCart(productId: string, size: Size) => boolean`

- Returns `true` iff an item exists with matching `product.id` AND `size`.
- `isInCart(id, 'M')` and `isInCart(id, 'L')` are independent.

---

## Provider Contract

Unchanged from 001 — `CartStoreProvider` + `useCartStore` selector pattern.

---

## Test Contracts

| Test | Expected result |
|------|-----------------|
| `addItem(p, 'M')` | `items.length` increases by 1; item has `size: 'M'` |
| `addItem(p, 'M')` duplicate | `items.length` unchanged |
| `addItem(p, 'M')` then `addItem(p, 'L')` | `items.length === 2` |
| `removeItem(id, 'M')` with M and L in cart | Only M line removed; L remains |
| `isInCart(id, 'M')` with only L in cart | `false` |
| `clearCart` | `items.length === 0` |
