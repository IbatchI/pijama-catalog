# Quickstart & Validation Guide: Nuevo Formato de Mensaje WhatsApp

**Feature**: 004-whatsapp-order-message
**Date**: 2026-08-31

---

## Prerequisites

- Feature 003 (size-aware cart) implemented
- Node.js 20+, dependencies installed (`pnpm install`)

---

## 1. Implement

Update `lib/whatsapp.ts` per [contracts/whatsapp-builder.md](./contracts/whatsapp-builder.md),
then update `lib/__tests__/whatsapp.test.ts`.

Expected `buildMessageBody` shape:

```text
🛍️ NUEVO PEDIDO

Pijama #67
- Talle XL 50/52

Ver foto: https://pijama-catalog.vercel.app/images/IMG-20260831-WA0067.jpg

Total: 1 pijama(s) seleccionado(s)
```

---

## 2. Run Tests

```bash
cd /Users/batch/Documents/batch/pijama-catalog
pnpm test lib/__tests__/whatsapp.test.ts
```

**Expected**: All whatsapp tests green with new format assertions.

Full suite:

```bash
pnpm test
pnpm build
```

---

## 3. Manual Validation — "Lo quiero" (US1)

```bash
pnpm dev
# Open http://localhost:3000
```

| Step | Action | Expected in WhatsApp message |
|------|--------|--------------------------------|
| 1 | Select talle XL on any card | — |
| 2 | Click "Lo quiero" | Message opens in WhatsApp |
| 3 | Inspect pre-filled text | `🛍️ NUEVO PEDIDO` header |
| 4 | | Product name on its own line |
| 5 | | `- Talle XL 50/52` |
| 6 | | `Ver foto: http://localhost:3000/images/...` |
| 7 | | `Total: 1 pijama(s) seleccionado(s)` |
| 8 | | NO `Hola!`, NO `📷`, NO `✨`, NO `1.` |

**Tip**: Copy URL from browser and run `decodeURIComponent` on the `text=` param.

---

## 4. Manual Validation — Cart (US2)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Add 2 products (talles M and S) | — |
| 2 | Finalizar pedido | One header, two item blocks, `Total: 2` |
| 3 | Same product, two talles | Two separate blocks with different talles |

---

## 5. Consistency Check (US3)

Generate message via "Lo quiero" and via cart with 1 item — structure must match
(same header, labels, footer format).

---

## 6. Deploy

```bash
npx vercel --prod
```

Verify production messages use `NEXT_PUBLIC_SITE_URL` domain in `Ver foto:` links.

---

## Reference

- Contract: [contracts/whatsapp-builder.md](./contracts/whatsapp-builder.md)
- Data model: [data-model.md](./data-model.md)
- Spec: [spec.md](./spec.md)
