# Data Model: Previsualización de Imagen en Cards

**Feature**: 005-image-preview
**Date**: 2026-09-01
**Extends**: [001 data-model](../001-pijama-catalog/data-model.md), [003 data-model](../003-size-pills/data-model.md)

---

## Entities

### Product (unchanged)

Preview reuses existing fields. No schema change.

| Field | Type | Required | Role in this feature |
|-------|------|----------|----------------------|
| `id` | `string` | ✅ | Identity if a second card is opened while preview is open |
| `name` | `string` | ✅ | Accessible trigger name; Dialog title |
| `imagePath` | `string` | ✅ | Same URL in card thumbnail and overlay |
| `price` | `number \| null` | ✅ | Unused by preview |
| `type` | `string` | ✅ | Unused by preview |

---

### ImagePreview (ephemeral UI state)

Not persisted. Owned by `ProductGrid` via `useImagePreview`. At most one instance is
active for the whole catalog page.

| Field | Type | Description |
|-------|------|-------------|
| `product` | `Product \| null` | Product whose photo is shown; `null` = closed |
| `isOpen` | `boolean` | Derived: `product !== null` |

**Validation rules**:
- `open(product)` MUST only be called for cards whose image loaded successfully
  (caller responsibility; hook may still accept any `Product`).
- `product.imagePath` MUST be a non-empty static path when `isOpen` is true.
- Closing sets `product` to `null`. Opening another product **replaces** `product`
  without an intermediate close (FR-009).

**TypeScript**:
```ts
interface UseImagePreviewReturn {
  product: Product | null
  isOpen: boolean
  open: (product: Product) => void
  close: () => void
}
```

---

### PhotoTrigger (UI, not stored)

Per-card interaction surface. Not a persisted entity.

| Attribute | Rule |
|-----------|------|
| Enabled | Image loaded (`imageError === false`) |
| Action | `onPreview(product)` |
| Accessible name | `Ver foto ampliada de {product.name}` |
| Hover zoom | Visible on `md+` hover only; hidden on small viewports |

---

## State transitions

```
[closed] product = null, isOpen = false
    → user taps/clicks loaded photo of Pijama #67
[open] product = #67, isOpen = true
    → user taps loaded photo of Pijama #68 (without closing)
[open] product = #68   (replaced; still one overlay)
    → user presses Escape / close / backdrop
[closed] product = null
    → user taps a card with imageError
[closed] unchanged (no open)
```

Size selection and cart are **orthogonal** — they have no transitions in this feature.

---

## Relationships

```text
ProductGrid 1──1 ImagePreview (hook instance)
ProductGrid 1──1 ImagePreviewDialog
ProductCard *──1 Product (photo trigger when image loaded)
ImagePreview 0..1──1 Product (the previewed item)
```

---

## Data flow

```text
User taps/clicks loaded photo
  → ProductCard.onPreview(product)
  → useImagePreview.open(product)
  → ImagePreviewDialog open=true, img src=product.imagePath

User dismisses (close / backdrop / Escape)
  → useImagePreview.close()
  → Dialog restores focus to trigger
  → ProductCard size selection + cart store unchanged
```

---

## Migration Notes

- No persisted data.
- No changes to `Product`, `CartItem`, `Size`, or WhatsApp payload.
- Existing `imageError` local state in `ProductCard` is reused, not replaced.
