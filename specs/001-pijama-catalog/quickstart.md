# Quickstart & Validation Guide: Catálogo de Pijamas

**Feature**: 001-pijama-catalog
**Date**: 2026-08-31

---

## Prerequisites

- Node.js 20 LTS installed (`node -v` → `v20.x.x`)
- pnpm 9+ or npm 10+ installed
- WhatsApp on your phone (for final link validation)

---

## 1. Project Bootstrap

```bash
# From the repo root (pijama-catalog/)
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

# Install Zustand
pnpm add zustand

# Init Shadcn (select "Default" style, "Zinc" base color when prompted)
npx shadcn@latest init

# Add required Shadcn components
npx shadcn@latest add card sheet badge button separator
```

---

## 2. Configure Static Export

Edit `next.config.ts`:
```ts
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
}
```

Verify static export compiles:
```bash
pnpm build
# Expected: "Export successful" in output, /out/ directory created
```

---

## 3. Copy Product Images

```bash
# Copy all 139 photos to public/images/
cp -r "/Users/batch/Downloads/Fotos pijamas /" ./public/images/
# Verify count
ls public/images/ | wc -l   # should print 139
```

---

## 4. Generate Initial Product Data

Run the bootstrap script (created as part of implementation tasks):
```bash
pnpm tsx scripts/generate-products.ts
# Reads public/images/*.jpg → writes data/products.ts
# Output: 139 Product entries with auto-generated names ("Pijama #67")
```

Spot-check `data/products.ts`:
- At least 139 entries.
- Each entry has a valid `imagePath` matching a file in `public/images/`.
- `name`, `price: null`, `type: "general"` as placeholders.

---

## 5. Configure WhatsApp Number

Edit `lib/whatsapp.ts`:
```ts
// Replace with your WhatsApp number in E.164 format (no + or spaces)
export const WHATSAPP_PHONE = '5491112345678'  // example: Argentina
```

Set the site base URL in `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 6. Development Server Validation

```bash
pnpm dev
# Open http://localhost:3000
```

### Validation Checklist — Catalog

- [ ] Page loads with 15 product cards visible
- [ ] Each card shows a product photo filling the card (no broken images)
- [ ] Photos are portrait-oriented (3:4 aspect ratio)
- [ ] "Siguiente" button is enabled (page 1 of 10)
- [ ] "Anterior" button is disabled on page 1
- [ ] Click "Siguiente" → 15 new products appear, previous 15 disappear
- [ ] Navigate to last page (10) → "Siguiente" is disabled
- [ ] Grid is 2 columns on mobile viewport (375px), 3 on tablet (768px), 4+ on desktop
- [ ] No horizontal scroll on any viewport

### Validation Checklist — Cart

- [ ] Cart badge shows 0 (or is hidden) on page load
- [ ] Click "Agregar al carrito" on a card → badge count increments to 1
- [ ] Card button changes to "En carrito ✓" after adding
- [ ] Click "Agregar al carrito" again on same card → count stays at 1 (no-op)
- [ ] Navigate to page 2, add another product → badge shows 2
- [ ] Navigate back to page 1 → first product still shows "En carrito ✓"
- [ ] Click cart badge → CartSheet opens from the right
- [ ] Sheet shows 2 items with thumbnail and name
- [ ] Click remove (×) on one item → item disappears, count updates to 1
- [ ] Remove last item → empty state message appears, "Finalizar" button disabled

### Validation Checklist — WhatsApp Links

**Single item ("Lo quiero")**:
- [ ] Click "Lo quiero" on any product card
- [ ] Browser opens a new tab to `https://wa.me/...`
- [ ] (On mobile) WhatsApp opens with pre-filled message
- [ ] Message contains the product name
- [ ] Message contains a URL ending in the product's image filename
- [ ] The image URL is publicly accessible (paste in browser → photo loads)

**Cart checkout**:
- [ ] Add 2–3 products to cart, open CartSheet
- [ ] Click "Finalizar pedido"
- [ ] WhatsApp opens with message listing all selected products (numbered)
- [ ] Each entry shows product name + image URL
- [ ] Footer shows "Total: N pijama(s) seleccionado(s)"

**Overflow edge case** (optional, validate in unit tests):
- [ ] Add 16+ items to cart, click "Finalizar"
- [ ] Message lists only 15 items + "y X más" footer line
- [ ] URL length < 2000 characters

---

## 7. Build Validation (Static Export)

```bash
pnpm build
# Expected: no errors, /out/ directory with HTML files

# Serve the static output locally
npx serve out -p 4000
# Open http://localhost:4000 and repeat the catalog + cart checklists above
# All image URLs must use absolute paths (NEXT_PUBLIC_SITE_URL) in WhatsApp messages
```

---

## 8. Unit Test Validation

```bash
pnpm test
```

**Minimum passing tests** (see [contracts/cart-store.md](./contracts/cart-store.md) and
[contracts/whatsapp-builder.md](./contracts/whatsapp-builder.md) for full test cases):

| Suite | Min passing tests |
|---|---|
| `stores/__tests__/cart-store.test.ts` | 6 |
| `lib/__tests__/whatsapp.test.ts` | 6 |

---

## 9. Vercel Deployment Validation

```bash
# Deploy to Vercel (first time: link project)
npx vercel --prod

# After deployment, note the production URL (e.g. https://pijama-catalog.vercel.app)
# Update NEXT_PUBLIC_SITE_URL in Vercel environment variables to match
# Redeploy if URL changed
npx vercel --prod
```

**Post-deploy checks**:
- [ ] `https://pijama-catalog.vercel.app` loads the catalog
- [ ] Image at `https://pijama-catalog.vercel.app/images/IMG-20260831-WA0067.jpg` is publicly accessible
- [ ] "Lo quiero" generates a WhatsApp link with the production image URL (not localhost)
- [ ] WhatsApp message received by the owner's phone includes a working image link

---

## Reference Links

- Data model: [data-model.md](./data-model.md)
- Component contracts: [contracts/product-card.md](./contracts/product-card.md)
- Cart store contract: [contracts/cart-store.md](./contracts/cart-store.md)
- WhatsApp builder contract: [contracts/whatsapp-builder.md](./contracts/whatsapp-builder.md)
- Feature spec: [spec.md](./spec.md)
