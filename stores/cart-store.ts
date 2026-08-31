import { createStore } from "zustand/vanilla";

import type { CartItem, Product } from "@/types";

export interface CartState {
  items: CartItem[];
}

export interface CartActions {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

export type CartStore = CartState & CartActions;

export function createCartStore() {
  return createStore<CartStore>()((set, get) => ({
    items: [],
    addItem: (product) => {
      if (get().isInCart(product.id)) {
        return;
      }

      set((state) => ({
        items: [...state.items, { product }],
      }));
    },
    removeItem: (productId) => {
      set((state) => ({
        items: state.items.filter((item) => item.product.id !== productId),
      }));
    },
    clearCart: () => set({ items: [] }),
    isInCart: (productId) =>
      get().items.some((item) => item.product.id === productId),
  }));
}

export type CartStoreApi = ReturnType<typeof createCartStore>;
