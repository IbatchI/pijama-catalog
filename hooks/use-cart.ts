"use client";

import { useCartStore } from "@/providers/cart-store-provider";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const isInCart = useCartStore((state) => state.isInCart);

  return {
    items,
    totalItems: items.length,
    addItem,
    removeItem,
    clearCart,
    isInCart,
  };
}
