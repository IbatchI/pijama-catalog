# Research: Previsualización de Imagen en Cards — Phase 0

**Feature**: 005-image-preview
**Date**: 2026-09-01

---

## R-001: Overlay Primitive — Dialog vs Sheet vs Custom Lightbox

**Decision**: Install Shadcn `dialog` and use it as a fullscreen lightbox. Do **not**
reuse `Sheet` (side panel) or build a custom portal overlay.

**Rationale**:
- Constitution v1.3.0 explicitly names dialog/lightbox using existing design-system
  primitives (shadcn Dialog).
- The project already depends on `@base-ui/react/dialog` via `components/ui/sheet.tsx`.
  Adding `dialog.tsx` is the same primitive with a centered/modal presentation.
- Base UI Dialog provides: focus trap, Escape dismiss, backdrop dismiss, scroll lock,
  restore focus on close — covering FR-006, FR-008, SC-004 without custom a11y code.
- Shadcn composition rule: Dialog always needs `DialogTitle` (use `sr-only` with product
  name).

**Lightbox styling** (within Dialog, semantic tokens):
- Overlay: `bg-foreground/80` (darkens catalog without raw `bg-black`)
- Content: near-viewport (`fixed inset` / `max-h-svh max-w-svh`), padding for close control
- Image: `max-h-[90svh] max-w-[90vw] object-contain` — FR-002 / FR-003 / SC-005

**Alternatives considered**:
- **Reuse Sheet**: Side-drawer is the wrong mental model for a photo; would fight layout.
- **Custom `fixed inset-0` div**: Would reimplement focus trap, Escape, and scroll lock;
  violates “compose, don’t reinvent”.
- **Native Fullscreen API (`requestFullscreen`)**: Spec assumption forbids browser F11
  fullscreen; overlay is sufficient.

---

## R-002: Preview State Ownership — Grid Hook vs Per-Card Dialog

**Decision**: Lift preview state to `ProductGrid` via `useImagePreview`. Render **one**
`ImagePreviewDialog`. Each `ProductCard` receives `onPreview(product)` and calls it when
the photo is clicked/tapped (only if the image loaded).

```ts
interface UseImagePreviewReturn {
  product: Product | null
  isOpen: boolean          // derived: product !== null
  open: (product: Product) => void
  close: () => void
}
```

**Rationale**:
- FR-009: only one preview at a time. Independent per-card Dialogs could stack two
  overlays if a second card is activated.
- Constitution VI: state MAY live in `useImagePreview` or a focused sub-component;
  grid-owned hook + `ImagePreviewDialog` matches both.
- Opening a second product while one is open **replaces** `product` (same Dialog stays
  mounted, image src updates) — edge case in spec.
- Size selection stays in `useSizeSelection` inside each card; closing preview does not
  unmount cards → FR-007.

**Alternatives considered**:
- **Per-card Dialog**: Simpler wiring, but violates exclusive-open (FR-009) unless extra
  coordination is added anyway.
- **Zustand cart store field**: Mixes catalog overlay with cart (SRP violation).
- **Page-level state in `app/page.tsx`**: Unnecessary; grid already maps products.

---

## R-003: Photo Trigger & Desktop Hover Zoom Affordance

**Decision**: Wrap the loaded `<img>` in a `<button type="button">` (or Button with
`render`) covering the image area. Overlay a `ZoomIn` icon that is **CSS-only** and
visible only on `md+` hover:

```text
hidden md:flex … opacity-0 md:group-hover/photo:opacity-100
```

Use a named Tailwind group (`group/photo`) on the trigger so hovering the card footer
does **not** show the zoom icon.

**Rationale**:
- FR-001 / FR-005: tap/click on the photo itself; hover is not required on touch.
- Constitution: hover zoom MUST use CSS hover on `md+` only.
- Icon never shown on small viewports (`hidden md:flex`) — no sticky magnifier on
  mobile.
- Lucide `ZoomIn` is already available via `lucide-react` (project icon library).
- Accessible name: `aria-label={`Ver foto ampliada de ${product.name}`}` (FR-010).

**Image-error path (FR-011)**:
- Existing `imageError` state remains in ProductCard.
- When `imageError === true`, render the current fallback text **without** a button
  and **without** calling `onPreview`.

**Alternatives considered**:
- **Click handler on `<img>`**: Not keyboard-accessible; fails SC-004.
- **Always-visible zoom badge**: Clutters mobile cards; contradicts hover-only affordance.
- **JS `matchMedia('(hover: hover)')`**: Unnecessary; CSS `md:` matches constitution
  wording (“typically `md` and above”) and is simpler.

---

## R-004: Preserve Catalog State on Open/Close

**Decision**: Preview is overlay-only. Do not change routes, pagination, Zustand cart,
or `useSizeSelection`. Dialog unmount/close must not remount `ProductCard`.

**Rationale**:
- FR-007 / SC-003: size + cart identical after close.
- Grid remains mounted behind the portal; cards keep local hook state.
- Pagination `useEffect` scroll-to-top is keyed on `currentPage` only — preview must
  not call `goToPage`.

**Alternatives considered**:
- Query param `?preview=id`: Would interact with static export and history; out of
  scope and risks pagination reset.

---

## R-005: Testing Strategy

**Decision**:
- Unit-test `useImagePreview` (open, close, replace, `isOpen` derived).
- Do **not** require visual regression tests for hover (SC-002 is manual).
- Manual checklist in quickstart: mobile tap, desktop hover+click, Escape, backdrop,
  close button, image-error card, size/cart unchanged.

**Rationale**: Overlay a11y and hover CSS are poorly covered by jsdom; constitution
already mandates manual verification on two viewports.

**Alternatives considered**:
- Playwright e2e: valuable later, not required for this slice; adds a new test runner.

---

## Resolved NEEDS CLARIFICATION

None. Spec and constitution v1.3.0 fully specify interaction, dismissal, and hover
breakpoint. Technical choices above are defaults within those constraints.
