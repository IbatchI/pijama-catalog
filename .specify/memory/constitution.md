<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Modified principles: N/A — initial authoring from blank template
Modified principles: Added Principle VI (Code Architecture)
Added sections:
  - Core Principles (6 principles defined)
  - Tech Stack & Constraints (hooks/ directory, configurable theme)
  - Development Workflow
  - Governance
Removed sections: N/A
Deferred TODOs:
  - WHATSAPP_PHONE_NUMBER: Owner must supply the destination WhatsApp number in .env / config
  - WHATSAPP_API_PROVIDER: Confirm whether using WhatsApp Business Cloud API (Meta) or a third-party
    gateway (e.g. Twilio, 360dialog). Affects message format and image-attachment approach.
  - ITEMS_PER_PAGE: Decide the default pagination page size (suggested: 12 per page).
-->

# Catálogo de Pijamas — Constitution

## Core Principles

### I. Static-First Delivery

The application MUST be built and deployed as a fully static site (no server-side runtime
required at request time). All product data and assets MUST be bundled at build time.
Hosting targets: any static host (Vercel static export, GitHub Pages, Netlify, or plain CDN).

**Rationale**: The audience is a small commercial contact list. Zero-infrastructure deployment
lowers cost and operational overhead to the minimum. No database or auth service is needed
for the catalog use-case.

### II. WhatsApp-Driven Commerce

Every purchase intent MUST be converted into a WhatsApp message sent to the owner's number.
The message payload MUST include, at minimum:

- A human-readable list of selected pajama(s) with their identifier/name.
- A direct image link (publicly accessible URL) for each selected item so the recipient
  can visually confirm the order at a glance.
- A clear call-to-action summary (e.g. total item count).

The "Lo quiero" (single-item) shortcut and the cart checkout flow MUST both produce a
well-formed `wa.me` deep-link or invoke the WhatsApp Business API endpoint, depending on
the chosen provider (see TODO: WHATSAPP_API_PROVIDER).

**Rationale**: WhatsApp is the primary communication channel for the target audience.
Keeping the purchase loop inside WhatsApp eliminates friction and avoids payment-gateway
complexity for the MVP.

### III. Card-Grid Catalog UI

The catalog MUST be rendered as a responsive grid of product cards. Each card MUST display:

- The product photo (primary visual element, aspect-ratio preserved).
- A product name/label.
- An "Agregar al carrito" (add-to-cart) action.
- A "Lo quiero" direct-purchase shortcut.

The UI MUST be mobile-first and adapt gracefully to tablet and desktop viewports.
The visual style MUST be sober and professional: neutral palette, clean typography,
ample white space — no loud or decorative motifs.

**Rationale**: The catalog is a sales tool shared via WhatsApp link. First impressions on
mobile are critical; clarity and trustworthiness drive conversions.

### IV. Cart & Checkout Simplicity

A persistent, in-page cart MUST allow users to accumulate multiple items before converting.
The cart MUST:

- Display a running count of selected items (visible at all times, e.g. floating badge).
- Allow item removal without page reload.
- Present a summary view before finalizing.
- Finalize by constructing and opening a WhatsApp deep-link with the full order details.

No user accounts, no persistent server-side state, and no payment processing are in scope
for v1. Cart state lives exclusively in browser memory (or localStorage for resilience).

**Rationale**: Keeping state client-only removes all backend coupling. If the user closes
the tab, the next WhatsApp interaction with the owner restarts the loop naturally.

### V. Catalog Simplicity — No Premature Complexity

For v1, the catalog MUST NOT include search, filter, or sort controls. Pagination is
the only navigation mechanism. Feature additions MUST be proposed via a constitution
amendment before implementation to preserve deliberate scope control.

**Rationale**: YAGNI. The catalog starts with ~139 photos; paginated browsing is sufficient.
Filters will be added only when evidence confirms users need them.

### VI. Code Architecture — Single Responsibility & Hook Separation

Every file MUST have exactly one reason to change:

- `types/` — shape definitions only, no logic.
- `data/` — raw static data literals, no computation.
- `lib/` — pure functions with no React imports, no side effects.
- `stores/` — Zustand state shape and action factory only.
- `hooks/` — all non-trivial behavior lives here; hooks wrap stores and lib utilities;
  they MUST NOT contain JSX.
- `components/` — JSX only; components consume hooks and render output; they MUST NOT
  import stores or lib directly.

Custom hooks (`useCart`, `usePagination`, `useWhatsApp`) are the ONLY bridge between
state/logic and the component layer. Components that contain `if` branches for non-render
logic are a violation of this principle and MUST be refactored.

The design system MUST be defined in a single CSS file (`app/globals.css`) using
Tailwind v4 CSS variables. No raw color values, no `dark:` prefixes, and no `style=`
props in components. Semantic tokens (`bg-primary`, `text-muted-foreground`) are the
only permitted color references in JSX.

**Rationale**: SRP and hook separation make the codebase maintainable as the catalog
grows. A centralized, token-based theme lets the owner retheme the entire app by changing
2–3 lines.

## Tech Stack & Constraints

- **Framework**: Next.js with `output: 'export'` (fully static) or plain Vite + React.
  The chosen framework MUST support static export without a Node.js runtime in production.
- **Styling**: Tailwind CSS v4 (utility-first, consistent design tokens, responsive breakpoints
  out of the box). No CSS-in-JS runtime. All brand tokens defined in `app/globals.css`
  under `@theme`; semantic role tokens in `:root`. Components use semantic classes only.
- **Custom hooks**: All business logic lives in `hooks/` (`useCart`, `usePagination`,
  `useWhatsApp`). Components import hooks exclusively — never stores or lib utilities directly.
- **Images**: Source photos live in `public/images/` (copied from the `Fotos pijamas` folder).
  Images MUST be served from the same static host so their public URLs can be embedded in
  WhatsApp messages.
- **WhatsApp integration**: Use `wa.me/<PHONE>?text=<encoded_message>` deep-links for
  zero-dependency integration. If richer media embedding is required, evaluate the Meta
  WhatsApp Business Cloud API (requires approval) or a gateway such as Twilio/360dialog.
  TODO(WHATSAPP_API_PROVIDER): confirm before implementing the checkout action.
- **No external database or CMS** for v1. Product catalog is defined in a static JSON/TS
  data file co-located with the source code.
- **No authentication** required for the public-facing catalog.
- **Pagination**: TODO(ITEMS_PER_PAGE) — default suggestion is 12 items per page.

## Development Workflow

- All product data changes (add/remove/rename items) MUST be made in the catalog data file;
  no schema changes require a constitution amendment.
- Images MUST be optimized (compressed, reasonable max dimensions) before committing to the
  repo to keep clone and build times acceptable.
- Feature branches MUST be used for any change beyond copy/image updates.
- The static build MUST pass without errors before any deployment.
- WhatsApp link construction logic MUST be unit-tested with at least one happy-path test
  covering the multi-item cart scenario.

## Governance

This constitution supersedes all verbal or ad-hoc agreements about the project's
architecture, UI style, and scope. Amendments require:

1. A clear description of the change and its rationale.
2. A version bump following semantic versioning (MAJOR / MINOR / PATCH as defined above).
3. Updating this file and committing with the suggested message format:
   `docs: amend constitution to vX.Y.Z (<summary>)`.

All contributors MUST verify compliance with these principles during code review.
Complexity introductions (new dependencies, server-side logic, auth, etc.) MUST be justified
against these principles before merging.

**Version**: 1.1.0 | **Ratified**: 2026-08-31 | **Last Amended**: 2026-08-31
