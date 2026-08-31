# Contract: Zustand Cart Store

**File**: `stores/cart-store.ts` + `providers/cart-store-provider.tsx`
**Type**: Zustand vanilla store + React Context provider

---

## Store Interface

```ts
// types/index.ts
interface Product {
  id: string
  name: string
  price: number | null
  type: string
  imagePath: string
}

interface CartItem {
  product: Product
}

// stores/cart-store.ts
interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

type CartStore = CartState & CartActions
```

## Action Contracts

### `addItem(product: Product) => void`

- If `items` already contains an item with `product.id` equal to `product.id`, the call
  is a no-op (no duplicate entries allowed).
- Otherwise, appends `{ product }` to `items`.
- Does NOT modify any other state.

### `removeItem(productId: string) => void`

- Removes the first (and only) item whose `product.id` equals `productId`.
- If no match exists, the call is a no-op.

### `clearCart() => void`

- Sets `items` to `[]`.

### `isInCart(productId: string) => boolean`

- Returns `true` if any item in `items` has `product.id === productId`.
- Returns `false` otherwise.
- This is a derived check, not stored state; implement as a selector or inline in action.

## Provider Contract

```ts
// providers/cart-store-provider.tsx — Client Component
export function CartStoreProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useCartStore<T>(selector: (state: CartStore) => T): T
```

- `CartStoreProvider` MUST create exactly one store instance per mount (using `useRef`).
- `useCartStore` MUST throw if called outside `CartStoreProvider`.
- Provider wraps `app/layout.tsx` children so the store is available on every page.

## Integration Example

```ts
// Inside a Client Component
const addItem = useCartStore((s) => s.addItem)
const isInCart = useCartStore((s) => s.isInCart)
const totalItems = useCartStore((s) => s.items.length)
```

## Test Contracts

The following behaviors MUST be covered by unit tests in `stores/__tests__/cart-store.test.ts`:

| Test | Expected result |
|---|---|
| `addItem` adds a new product | `items.length` increases by 1 |
| `addItem` duplicate is no-op | `items.length` unchanged |
| `removeItem` removes correct item | Item with matching id no longer in `items` |
| `removeItem` on non-existent id | `items.length` unchanged |
| `clearCart` empties the store | `items.length === 0` |
| `isInCart` returns correct boolean | Matches actual store contents |
