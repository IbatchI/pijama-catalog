# Research: Nuevo Formato de Mensaje WhatsApp — Phase 0

**Feature**: 004-whatsapp-order-message
**Date**: 2026-08-31

---

## R-001: Message Template Structure

**Decision**: Single template function `buildItemBlock(item, baseUrl)` returning:

```
{product.name}
- Talle {getSizeLabel(size)}

Ver foto: {baseUrl}{imagePath}
```

Full message assembled as:

```
🛍️ NUEVO PEDIDO

{block1}

{block2}

...

Total: {N} pijama(s) seleccionado(s)
```

**Rationale**: Matches user reference exactly. Blank lines between blocks (`\n\n`) give
WhatsApp-readable separation. Header appears once; total appears once at end.

**Alternatives considered**:
- Keep numbered list: Rejected — spec FR-007 forbids ordinals.
- Separator lines (`---`): Rejected — user example uses blank lines only.

---

## R-002: Single vs Multi-Item Layout

**Decision**: Same block template for 1 or N items. Multi-item joins blocks with `\n\n`.
No item counter prefix.

**Rationale**: US3 requires "Lo quiero" (1 item) and cart checkout to share structure.
A 1-item message is just one block under the header.

**Example (2 items)**:

```
🛍️ NUEVO PEDIDO

Pijama A
- Talle M 42/44

Ver foto: https://catalog.vercel.app/images/a.jpg

Pijama B
- Talle S 38/40

Ver foto: https://catalog.vercel.app/images/b.jpg

Total: 2 pijama(s) seleccionado(s)
```

---

## R-003: Overflow Policy (> 15 items)

**Decision**: Keep `MAX_LISTED_ITEMS = 15`. After 15 full blocks, append:

```
... y {remaining} más.
Ver catálogo completo: {baseUrl}
```

Then footer total uses **full** `items.length` (not truncated count).

**Rationale**: Preserves URL length safety from feature 001/003. Spec FR-009 requires
adaptation, not removal, of overflow behavior.

**Alternatives considered**:
- Remove cap: Risk of URL truncation on large carts.
- Summarize overflow items by name: Adds complexity; not requested.

---

## R-004: Removed Copy Elements

**Decision**: Explicitly remove from output:
- `Hola! Me interesan estos pijamas:`
- Ordinal prefixes (`1.`, `2.`)
- `Talle:` without bullet (replaced by `- Talle …`)
- `📷` photo prefix (replaced by `Ver foto:`)
- Trailing `✨` on total line

**Rationale**: Spec FR-001, FR-007, FR-008. Constitution content requirements preserved
under new labels.

---

## R-005: Implementation Location

**Decision**: Change only `buildMessageBody()` inside `lib/whatsapp.ts`. Export surface
and `useWhatsApp` hook unchanged.

**Rationale**: SRP — message formatting is already centralized here. Hooks inject
`siteBaseUrl` and phone; no duplication risk.

**Alternatives considered**:
- Template in `data/` file: Overkill for a fixed string layout.
- Separate `lib/whatsapp-message.ts`: Unnecessary for ~20 lines.

---

## R-006: Test Strategy

**Decision**: Update existing Vitest suite assertions to match new strings. Add explicit
tests for:
- Header `🛍️ NUEVO PEDIDO`
- Bullet format `- Talle XL 50/52`
- `Ver foto:` label
- Absence of old copy (`Hola!`, `📷`, `✨`, `1.`)
- Structural equality: `buildSingleItemWhatsAppUrl` === `buildWhatsAppUrl([item])`

**Rationale**: Constitution requires WhatsApp builder unit tests. Snapshot-free string
assertions keep tests readable and stable.
