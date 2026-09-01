# Data Model: Selección de Talle en Cards

**Feature**: 003-size-pills
**Date**: 2026-08-31
**Extends**: [001 data-model](../001-pijama-catalog/data-model.md)

---

## Entities

### Size (new)

Fixed enumeration of available sizes for all products. Defined in constitution v1.2.0.

| Value | Display label | Numeric range (informational) |
|-------|---------------|-------------------------------|
| `S`   | `S 38/40`     | 38–40                         |
| `M`   | `M 42/44`     | 42–44                         |
| `L`   | `L 46/48`     | 46–48                         |
| `XL`  | `XL 50/52`    | 50–52                         |

**Validation rules**:
- Only these four values are valid at runtime.
- No product may define its own size list in v1.
- Changing the enum requires a constitution amendment.

**TypeScript**:
```ts
type Size = 'S' | 'M' | 'L' | 'XL'

interface SizeOption {
  value: Size
  label: string   // e.g. "M 42/44"
}
```

**Static data** (`data/sizes.ts`):
```ts
export const SIZE_OPTIONS: readonly SizeOption[] = [
  { value: 'S',  label: 'S 38/40'  },
  { value: 'M',  label: 'M 42/44'  },
  { value: 'L',  label: 'L 46/48'  },
  { value: 'XL', label: 'XL 50/52' },
]

export function getSizeLabel(size: Size): string
```

---

### Product (unchanged)

No schema change. All products implicitly support all four sizes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `name` | `string` | ✅ | Display name |
| `price` | `number \| null` | ✅ | Price or null |
| `type` | `string` | ✅ | Category label |
| `imagePath` | `string` | ✅ | Path under `public/` |

---

### CartItem (modified)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product` | `Product` | ✅ | Product snapshot at add time |
| `size` | `Size` | ✅ | Selected size when added to cart |

**Identity rule**:
```
cartLineKey(item) = `${item.product.id}:${item.size}`
```

Two items are duplicates iff both `product.id` AND `size` match.

**Validation rules**:
- `size` MUST be a valid `Size` value — never `null` once in cart.
- Items without `size` are invalid (no migration; feature not yet in production).

**TypeScript**:
```ts
interface CartItem {
  product: Product
  size: Size
}
```

---

### SizeSelection (ephemeral UI state)

Not persisted. Exists only while a ProductCard is mounted.

| Field | Type | Description |
|-------|------|-------------|
| `selectedSize` | `Size \| null` | Currently active pill; `null` = no selection |
| `hasSelection` | `boolean` | Derived: `selectedSize !== null` |

**State transitions**:

```
[initial] selectedSize = null
    → user taps pill "M"
[selected] selectedSize = 'M', hasSelection = true
    → user taps pill "L"
[selected] selectedSize = 'L'  (replaces previous)
    → user taps "M" again while M active
[selected] selectedSize = 'M'  (unchanged — no deselect)
    → card unmounts (page change)
[destroyed] state discarded
```

---

### CartStore (modified actions)

| Field / Action | Type | Change from 001 |
|----------------|------|-----------------|
| `items` | `CartItem[]` | Each item now includes `size` |
| `addItem(product, size)` | `(Product, Size) => void` | Dedup by `id:size` |
| `removeItem(productId, size)` | `(string, Size) => void` | Removes matching line |
| `isInCart(productId, size)` | `(string, Size) => boolean` | Size-aware check |
| `clearCart()` | unchanged | — |
| `totalItems` | derived `items.length` | unchanged semantics |

---

## Relationships

```text
Product 1──* CartItem (via snapshot)
Size   1──* CartItem (required field)
SizeSelection *──1 ProductCard (ephemeral, per mount)
```

---

## Data Flow

```text
User taps pill
  → useSizeSelection.selectSize('M')
  → ProductCard shows CTAs

User taps "Agregar al carrito"
  → useCart.addItem(product, 'M')
  → cart-store appends { product, size: 'M' }

User taps "Lo quiero"
  → useWhatsApp.buildSingleUrl(product, 'M')
  → lib/whatsapp builds message with getSizeLabel('M')

User opens cart
  → CartItemRow renders item.product.name + getSizeLabel(item.size)

User checks out
  → buildWhatsAppUrl(items) includes size per line
```

---

## Migration Notes

- **Breaking change** to `CartItem` shape and cart store signatures.
- No persisted cart data to migrate (in-memory only).
- All test fixtures creating `CartItem` must add a `size` field.
- `useWhatsApp.buildSingleUrl` signature changes from `(product)` to `(product, size)`.
