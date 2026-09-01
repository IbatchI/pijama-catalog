# Contract: WhatsApp Message Builder — Order Format

**File**: `lib/whatsapp.ts`
**Type**: Pure utility module (no React, no side effects)
**Supersedes**: [003 whatsapp-builder](../003-size-pills/contracts/whatsapp-builder.md) message format section

---

## Function Interfaces (unchanged)

```ts
export const WHATSAPP_PHONE: string

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

- Empty `items` → `buildWhatsAppUrl` returns `""`.
- `buildSingleItemWhatsAppUrl` delegates to `buildWhatsAppUrl([item], ...)`.

---

## Message Format Contract

### Single item

```
🛍️ NUEVO PEDIDO

{product.name}
- Talle {getSizeLabel(item.size)}

Ver foto: {siteBaseUrl}{product.imagePath}

Total: 1 pijama(s) seleccionado(s)
```

### Multiple items

```
🛍️ NUEVO PEDIDO

{product.name}
- Talle {getSizeLabel(item.size)}

Ver foto: {siteBaseUrl}{product.imagePath}

{product.name}
- Talle {getSizeLabel(item.size)}

Ver foto: {siteBaseUrl}{product.imagePath}

Total: {N} pijama(s) seleccionado(s)
```

### Overflow (> 15 items)

After the 15th item block, before the footer:

```
... y {remaining} más.
Ver catálogo completo: {siteBaseUrl}
```

Footer total uses **full** item count (`items.length`), not truncated count.

---

## Formatting Rules

| Rule | Detail |
|------|--------|
| Header | Exactly `🛍️ NUEVO PEDIDO` once, followed by blank line |
| Size line | `- Talle ` prefix + full label from `getSizeLabel()` |
| Photo line | `Ver foto: ` prefix + absolute URL (no `📷`) |
| Block separator | `\n\n` between item blocks |
| Footer | `Total: {N} pijama(s) seleccionado(s)` — no trailing emoji |
| Forbidden | `Hola! Me interesan`, `1.` numbering, `Talle:` without bullet, `✨` |

---

## URL Output Contract

```
https://wa.me/{phoneNumber}?text={encodeURIComponent(messageBody)}
```

- Phone digits unencoded in path.
- Message body UTF-8 encoded (emoji in header must work).

---

## Internal Helper (recommended)

```ts
function buildItemBlock(item: CartItem, baseUrl: string): string
// Returns the 4-line item block (name, talle bullet, blank, ver foto)
```

Not exported — implementation detail.

---

## Test Contracts

| Test | Input | Expected (decoded message) |
|------|-------|----------------------------|
| Header present | 1 item | Starts with `🛍️ NUEVO PEDIDO` |
| Bullet talle | size XL | Contains `- Talle XL 50/52` |
| Ver foto label | any item | Contains `Ver foto: {site}{path}` |
| No old copy | 1 item | Does NOT contain `Hola!`, `📷`, `✨`, `1.` |
| Multi-item | 2 items | Two product names, one header, `Total: 2` |
| Overflow | 16 items | 15 blocks + `... y 1 más.` + catalog link |
| Empty cart | 0 items | Returns `""` |
| Single delegate | 1 CartItem | `buildSingleItemWhatsAppUrl` === `buildWhatsAppUrl([item])` |
| Special chars | name with `&`, emojis | Properly encoded/decoded |

---

## Downstream Consumers (unchanged)

- `hooks/use-whatsapp.ts` — no changes required
- `app/page.tsx` checkout — no changes required
- `ProductCard` "Lo quiero" link — no changes required
