# Contract: WhatsApp Message Builder

**File**: `lib/whatsapp.ts`
**Type**: Pure utility module (no React, no side effects)

---

## Purpose

Constructs the `wa.me` deep-link URL that opens WhatsApp with a pre-filled message
containing the selected products' names and public image URLs.

---

## Function Interfaces

### `buildWhatsAppUrl`

```ts
/**
 * Builds a wa.me deep-link URL for the given cart items.
 *
 * @param items        - Array of CartItem from the Zustand cart store.
 * @param phoneNumber  - E.164 phone number WITHOUT leading '+' (e.g. "5491112345678").
 * @param siteBaseUrl  - Absolute base URL of the deployed site (e.g. "https://catalog.vercel.app").
 * @returns            - Full wa.me URL ready to open in a new tab.
 */
export function buildWhatsAppUrl(
  items: CartItem[],
  phoneNumber: string,
  siteBaseUrl: string,
): string
```

### `buildSingleItemWhatsAppUrl`

```ts
/**
 * Convenience wrapper for the "Lo quiero" single-item shortcut.
 * Delegates to buildWhatsAppUrl with a single-element array.
 */
export function buildSingleItemWhatsAppUrl(
  item: CartItem,
  phoneNumber: string,
  siteBaseUrl: string,
): string
```

---

## Message Format Contract

The message body MUST follow this structure (plain UTF-8 text):

```
Hola! Me interesan estos pijamas:

1. {product.name}
   📷 {siteBaseUrl}{product.imagePath}

2. {product.name}
   📷 {siteBaseUrl}{product.imagePath}

Total: {N} pijama(s) seleccionado(s) ✨
```

**Rules**:
- Items are numbered starting from 1.
- Each item gets its own line block (name + image URL line).
- The footer line always shows the total count.
- The full message string is `encodeURIComponent()`-encoded before being appended
  as the `text` query parameter of the `wa.me` URL.
- Phone number is NOT encoded (digits only, safe for URL path).

**Overflow rule** (> 15 items):
- If `items.length > 15`, list the first 15 items, then append:
  ```
  ... y {remaining} más.
  Ver catálogo completo: {siteBaseUrl}
  ```
  This prevents URLs exceeding ~2000 characters.

---

## Output Contract

```
https://wa.me/{phoneNumber}?text={encodeURIComponent(messageBody)}
```

Example (2 items):
```
https://wa.me/5491112345678?text=Hola%21%20Me%20interesan%20estos%20pijamas%3A%0A%0A...
```

---

## Test Contracts

The following cases MUST be covered by unit tests in `lib/__tests__/whatsapp.test.ts`:

| Test | Input | Expected |
|---|---|---|
| Single item | 1 CartItem | URL starts with `https://wa.me/`, contains product name and image URL encoded |
| Multiple items | 3 CartItems | Message body contains 3 numbered entries + correct total count |
| Overflow | 16 CartItems | Only first 15 listed; footer contains "y 1 más" |
| Empty cart | 0 CartItems | Should not be called; function throws or returns empty-state URL |
| Special chars in name | Name with `&`, `?`, emojis | Characters are properly encoded |
| Phone format | `"5491112345678"` | URL path contains the number as-is without `+` or spaces |
