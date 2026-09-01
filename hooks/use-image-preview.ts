"use client";

import { useCallback, useState } from "react";

import type { Product } from "@/types";

export interface UseImagePreviewReturn {
  product: Product | null;
  isOpen: boolean;
  open: (product: Product) => void;
  close: () => void;
}

export function useImagePreview(): UseImagePreviewReturn {
  const [product, setProduct] = useState<Product | null>(null);

  const open = useCallback((next: Product) => {
    setProduct(next);
  }, []);

  const close = useCallback(() => {
    setProduct(null);
  }, []);

  return {
    product,
    isOpen: product !== null,
    open,
    close,
  };
}
