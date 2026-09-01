import type { Size } from "@/types";

export interface SizeOption {
  value: Size;
  label: string;
}

export const SIZE_OPTIONS: readonly SizeOption[] = [
  { value: "S", label: "S 38/40" },
  { value: "M", label: "M 42/44" },
  { value: "L", label: "L 46/48" },
  { value: "XL", label: "XL 50/52" },
] as const;

export function getSizeLabel(size: Size): string {
  const option = SIZE_OPTIONS.find((entry) => entry.value === size);
  if (!option) {
    throw new Error(`Invalid size: ${size}`);
  }
  return option.label;
}
