# Contract: Size Catalog

**Files**: `types/index.ts`, `data/sizes.ts`
**Type**: Type definition + static data module

---

## Purpose

Defines the fixed four-size catalog mandated by constitution v1.2.0. Single source of
truth for size values and display labels across pills, cart, and WhatsApp messages.

---

## Type Interface

```ts
// types/index.ts
type Size = 'S' | 'M' | 'L' | 'XL'
```

---

## Data Module

```ts
// data/sizes.ts
interface SizeOption {
  value: Size
  label: string
}

export const SIZE_OPTIONS: readonly SizeOption[]
export function getSizeLabel(size: Size): string
```

### `SIZE_OPTIONS` contract

| Index | `value` | `label`     |
|-------|---------|-------------|
| 0     | `S`     | `S 38/40`   |
| 1     | `M`     | `M 42/44`   |
| 2     | `L`     | `L 46/48`   |
| 3     | `XL`    | `XL 50/52`  |

- Array MUST have exactly 4 entries in S → XL order.
- `getSizeLabel(size)` MUST return the matching `label` or throw for invalid input.

---

## Usage Rules

- Components render pills by mapping `SIZE_OPTIONS` — never hardcode label strings.
- WhatsApp builder calls `getSizeLabel(item.size)` — never inline size text.
- Adding a fifth size requires constitution amendment + update to this module.

---

## Test Contracts

| Test | Expected |
|------|----------|
| `SIZE_OPTIONS.length` | `4` |
| `getSizeLabel('M')` | `"M 42/44"` |
| `getSizeLabel('XL')` | `"XL 50/52"` |
| All values are unique | No duplicate `value` or `label` |
