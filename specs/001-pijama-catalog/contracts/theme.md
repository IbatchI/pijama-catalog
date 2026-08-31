# Contract: Tailwind Theme — Design Tokens

**File**: `app/globals.css`
**Type**: CSS — single source of truth for all visual design decisions

---

## Purpose

All brand colors, spacing, and typography are defined **once** as CSS custom properties
in `globals.css`. Changing the brand accent means editing 2–3 lines in this file and
nothing else in the codebase.

---

## Token Architecture (Tailwind v4)

Tailwind v4 reads CSS variables from the `@theme` block directly. No `tailwind.config.ts`
color/spacing extensions needed.

```css
/* app/globals.css */

@import "tailwindcss";

/* ─── Brand palette (edit these to retheme the entire app) ─────────────── */
@theme {
  --color-brand-50:   #fdf4ff;
  --color-brand-100:  #fae8ff;
  --color-brand-200:  #f5d0fe;
  --color-brand-500:  #a855f7;   /* ← primary accent: change this one line */
  --color-brand-700:  #7e22ce;
  --color-brand-900:  #3b0764;

  /* Neutral scale */
  --color-neutral-50:  #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-700: #404040;
  --color-neutral-900: #171717;

  /* Typography */
  --font-sans: 'Geist', 'Inter', system-ui, sans-serif;

  /* Catalog-specific spacing */
  --spacing-card-gap:   0.75rem;   /* gap between cards in grid */
  --radius-card:        0.75rem;   /* card border radius */
}

/* ─── Semantic role tokens (Shadcn-compatible naming) ───────────────────── */
:root {
  --background:          var(--color-neutral-50);
  --foreground:          var(--color-neutral-900);

  --card:                #ffffff;
  --card-foreground:     var(--color-neutral-900);

  --primary:             var(--color-brand-500);
  --primary-foreground:  #ffffff;

  --secondary:           var(--color-brand-50);
  --secondary-foreground: var(--color-brand-700);

  --muted:               var(--color-neutral-100);
  --muted-foreground:    var(--color-neutral-500);

  --accent:              var(--color-brand-100);
  --accent-foreground:   var(--color-brand-700);

  --border:              var(--color-neutral-200);
  --input:               var(--color-neutral-200);
  --ring:                var(--color-brand-500);

  --radius:              var(--radius-card);
}
```

---

## Usage Rules

| Rule | Correct | Wrong |
|---|---|---|
| Brand color | `bg-primary` | `bg-purple-500` |
| Muted text | `text-muted-foreground` | `text-gray-400` |
| Card background | `bg-card` | `bg-white` |
| Border | `border-border` | `border-gray-200` |
| Focus ring | `ring-ring` | `ring-blue-500` |
| Card gap | `gap-[--spacing-card-gap]` or add to `@theme` as `--spacing-4` | hardcoded `gap-3` |

**Retheme checklist**: To change the brand color, only these lines need updating:
1. `--color-brand-500` in `@theme` (primary accent)
2. `--color-brand-50/100/200/700/900` if the new color's palette differs

---

## Component Styling Contract

All component-level class names MUST:
1. Use semantic token classes (`bg-primary`, `text-muted-foreground`)
2. Use `cn()` for conditional merging — no manual template literals
3. Use `gap-*` for spacing — never `space-x-*` or `space-y-*`
4. Use `size-*` when width = height — never `w-N h-N`
5. Not contain raw hex values, `style=` props, or arbitrary Tailwind values like `bg-[#abc]`

**Exception**: Truly one-off layout values (e.g. `max-w-[1400px]` for a specific
breakpoint) may use arbitrary values if no semantic token covers the case.

---

## Product Card Visual Spec

```css
/* Derived from brand tokens — not hardcoded */
card-aspect-ratio:   3 / 4          (portrait)
card-background:     var(--card)
card-border:         1px solid var(--border)
card-border-radius:  var(--radius)
card-shadow:         0 1px 3px rgba(0,0,0,0.07)

image:               object-cover, full card width, aspect preserved
actions:             below image, bg-card, gap-2
```
