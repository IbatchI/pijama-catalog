# Implementation Plan: Nuevo Formato de Mensaje WhatsApp

**Branch**: `004-whatsapp-order-message` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-whatsapp-order-message/spec.md`

## Summary

Replace the current WhatsApp pre-filled message copy with an order-style template:
header `🛍️ NUEVO PEDIDO`, per-item blocks (product name, `- Talle {label}`, `Ver foto: {url}`),
and footer `Total: {N} pijama(s) seleccionado(s)`. Change is isolated to
`lib/whatsapp.ts` (`buildMessageBody`) and its Vitest suite — no UI, cart, or hook changes.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS

**Framework**: Next.js 16 static export (unchanged)

**Primary Dependencies**: None new — pure string formatting in existing `lib/whatsapp.ts`

**Storage**: N/A — message built at runtime from in-memory `CartItem[]`

**Testing**: Vitest — update `lib/__tests__/whatsapp.test.ts` (constitution-mandated)

**Target Platform**: `wa.me` deep-links opened in WhatsApp mobile/web

**Project Type**: Copy/format change to existing pure utility module

**Performance Goals**: No change — string concat on ≤15 items is negligible

**Constraints**:
- Constitution II: every message MUST still include product name, size label, image URL, total count
- URL length ~2000 char cap — keep `MAX_LISTED_ITEMS = 15` overflow policy
- `buildWhatsAppUrl` / `buildSingleItemWhatsAppUrl` public signatures unchanged
- `getSizeLabel()` from `data/sizes.ts` — no inline size strings
- UTF-8 emoji in header must survive `encodeURIComponent`

**Scale/Scope**: 1 source file, 1 test file, ~30 lines changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Pre-design | Post-design | Notes |
|-----------|------|------------|-------------|-------|
| I. Static-First | No server added | ✅ PASS | ✅ PASS | String template only |
| II. WhatsApp Commerce | Name + size + image URL + total | ✅ PASS | ✅ PASS | Same data, new layout |
| III. Card-Grid UI | Unchanged | ✅ PASS | ✅ PASS | Out of scope |
| IV. Cart Simplicity | Unchanged | ✅ PASS | ✅ PASS | Out of scope |
| V. Catalog Simplicity | Unchanged | ✅ PASS | ✅ PASS | Out of scope |
| VI. SRP & Hooks | Logic stays in `lib/` | ✅ PASS | ✅ PASS | No component changes |

**All gates pass. No constitution violations.**

## Project Structure

### Documentation (this feature)

```text
specs/004-whatsapp-order-message/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── whatsapp-builder.md
└── tasks.md             ← Phase 2 (/speckit-tasks)
```

### Source Code (changes)

```text
lib/
├── whatsapp.ts              # MODIFY — buildMessageBody template
└── __tests__/
    └── whatsapp.test.ts     # MODIFY — assert new format
```

**Structure Decision**: Minimal diff — single pure function refactor. No new modules.

## Complexity Tracking

> No violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
