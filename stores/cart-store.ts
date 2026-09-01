import { createStore } from "zustand/vanilla";

import type { CartItem, Product, Size } from "@/types";

export interface CartState {
  items: CartItem[];
}

export interface CartActions {
  addItem: (product: Product, size: Size) => void;
  removeItem: (productId: string, size: Size) => void;
  clearCart: () => void;
  isInCart: (productId: string, size: Size) => boolean;
}

export type CartStore = CartState & CartActions;

function lineKey(productId: string, size: Size): string {
  return `${productId}:${size}`;
}

export function createCartStore() {
  return createStore<CartStore>()((set, get) => ({
    items: [],
    addItem: (product, size) => {
      if (get().isInCart(product.id, size)) {
        return;
      }

      set((state) => ({
        items: [...state.items, { product, size }],
      }));
    },
    removeItem: (productId, size) => {
      set((state) => ({
        items: state.items.filter(
          (item) => !(item.product.id === productId && item.size === size),
        ),
      }));
    },
    clearCart: () => set({ items: [] }),
    isInCart: (productId, size) =>
      get().items.some(
        (item) => item.product.id === productId && item.size === size,
      ),
  }));
}

export type CartStoreApi = ReturnType<typeof createCartStore>;
