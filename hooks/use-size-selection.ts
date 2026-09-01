"use client";

import { useCallback, useState } from "react";

import type { Size } from "@/types";

export function useSizeSelection() {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const selectSize = useCallback((size: Size) => {
    setSelectedSize(size);
  }, []);

  return {
    selectedSize,
    selectSize,
    hasSelection: selectedSize !== null,
  };
}
