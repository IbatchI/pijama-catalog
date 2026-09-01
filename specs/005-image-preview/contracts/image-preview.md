# Contract: Image Preview Dialog

**Files**: `components/catalog/ImagePreviewDialog.tsx`, `components/ui/dialog.tsx`

---

## Component — `ImagePreviewDialog`

```ts
interface ImagePreviewDialogProps {
  product: Product | null
  open: boolean
  onClose: () => void
}
```

**Behavior**:

| Scenario | Expected behavior |
|----------|-------------------|
| `open === false` | Overlay not visible; catalog interactive |
| `open === true` and `product` set | Overlay covers viewport; image from `product.imagePath` |
| Image in overlay | `object-contain`; no crop that hides garment; larger than card thumb |
| Close control | Visible button; calls `onClose` |
| Backdrop click/tap | Calls `onClose` |
| Escape (keyboard) | Calls `onClose` |
| Focus | Trapped in dialog while open; restored to trigger on close |
| Background scroll | Locked while open |
| `DialogTitle` | Required; visually hidden is OK (`sr-only`); text includes product name |
| Second `open` with different product | Same dialog; image and title update; still one overlay |

**Visual**:
- Overlay uses semantic tokens (e.g. `bg-foreground/80`), not raw hex/`bg-black`.
- Close control uses existing Button / DialogClose primitives.
- Responsive from 320px width to wide desktop (`max-h-[90svh] max-w-[90vw]` or equivalent).

**MUST NOT**:
- Navigate or change pagination
- Read or write the cart store
- Import `stores/` or `lib/`
- Implement pinch-zoom, download, or share

---

## Primitive — Shadcn Dialog

- Added via `npx shadcn@latest add dialog` → `components/ui/dialog.tsx`
- Stacks with existing Base UI Dialog used by Sheet; no z-index overrides on overlays
- Cart Sheet and image preview MUST NOT be open at the same time as a product requirement
  (user can close one then open the other). No extra coordination required for v1.
