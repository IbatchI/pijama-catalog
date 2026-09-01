# Data Model: Nuevo Formato de Mensaje WhatsApp

**Feature**: 004-whatsapp-order-message
**Date**: 2026-08-31
**Extends**: [003 data-model](../003-size-pills/data-model.md)

---

## Summary

No entity schema changes. `CartItem`, `Product`, and `Size` remain unchanged.
This feature defines a **message template** — the serialized output shape of
`buildMessageBody(items, siteBaseUrl)`.

---

## Entities (unchanged)

| Entity | Change |
|--------|--------|
| `Product` | None |
| `CartItem` | None (`product` + `size`) |
| `Size` | None |

---

## Message Template (new output contract)

### OrderMessage

| Part | Content | Required |
|------|---------|----------|
| Header | `🛍️ NUEVO PEDIDO` | ✅ once per message |
| Item blocks | 1..N `ItemBlock` | ✅ at least 1 |
| Overflow note | `... y {n} más.` + catalog URL | Only if items > 15 |
| Footer | `Total: {count} pijama(s) seleccionado(s)` | ✅ once per message |

### ItemBlock

| Line | Format | Example |
|------|--------|---------|
| 1 | `{product.name}` | `Pijama #67` |
| 2 | `- Talle {sizeLabel}` | `- Talle XL 50/52` |
| 3 | (blank) | |
| 4 | `Ver foto: {absoluteImageUrl}` | `Ver foto: https://…/images/foo.jpg` |

**Validation rules**:
- `sizeLabel` MUST come from `getSizeLabel(item.size)`.
- `absoluteImageUrl` MUST be `{siteBaseUrl}{product.imagePath}` with no trailing slash on base.
- Blocks MUST be separated by one blank line (`\n\n`).
- Header MUST be followed by one blank line before first block.

---

## Data Flow (unchanged inputs, new output)

```
CartItem[] + siteBaseUrl
    → buildMessageBody()
    → OrderMessage (plain text)
    → encodeURIComponent()
    → wa.me/{phone}?text=...
```

---

## Migration Notes

- Breaking change for **message text only** — not for TypeScript types.
- All Vitest fixtures remain valid; assertions must update to new copy.
- Vendedor verá mensajes con formato distinto tras deploy; no hay datos legacy en mensajes guardados.
