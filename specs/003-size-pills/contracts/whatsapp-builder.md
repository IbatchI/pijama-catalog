# Contract: WhatsApp Message Builder (Size-Aware)

**File**: `lib/whatsapp.ts`
**Type**: Pure utility module (no React, no side effects)
**Extends**: [001 whatsapp-builder contract](../001-pijama-catalog/contracts/whatsapp-builder.md)

---

## Function Interfaces

Unchanged signatures — `CartItem` now carries `size`:

```ts
export function buildWhatsAppUrl(
  items: CartItem[],
  phoneNumber: string,
  siteBaseUrl: string,
): string

export function buildSingleItemWhatsAppUrl(
  item: CartItem,
  phoneNumber: string,
  siteBaseUrl: string,
): string
```

---

## Message Format Contract (updated)

Each item block MUST include the size label:

```
Hola! Me interesan estos pijamas:

1. {product.name}
   Talle: {getSizeLabel(item.size)}
   📷 {siteBaseUrl}{product.imagePath}

2. {product.name}
   Talle: {getSizeLabel(item.size)}
   📷 {siteBaseUrl}{product.imagePath}

Total: {N} pijama(s) seleccionado(s) ✨
```

**Rules** (in addition to 001 rules):
- Size line uses the full display label (e.g. `M 42/44`, not just `M`).
- Size line appears **after** product name, **before** image URL line.
- `getSizeLabel` imported from `data/sizes.ts` — no duplicated label strings.
- Overflow rule (> 15 items) unchanged.

---

## Hook Integration

`useWhatsApp.buildSingleUrl` signature change:

```ts
// Before (001)
buildSingleUrl: (product: Product) => string

// After (003)
buildSingleUrl: (product: Product, size: Size) => string
```

Implementation wraps `{ product, size }` as `CartItem` before calling
`buildSingleItemWhatsAppUrl`.

---

## Test Contracts (additions to 001 suite)

| Test | Input | Expected |
|------|-------|----------|
| Single item with size | `{ product, size: 'XL' }` | Decoded message contains `Talle: XL 50/52` |
| Multi-item different sizes | M + S items | Each block has correct size label |
| Size label format | `size: 'M'` | Contains `M 42/44` not bare `M` |

All existing 001 tests MUST be updated to pass `size` on `CartItem` fixtures.
