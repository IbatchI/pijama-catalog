"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useStore } from "zustand";

import {
  createCartStore,
  type CartStore,
  type CartStoreApi,
} from "@/stores/cart-store";

const CartStoreContext = createContext<CartStoreApi | null>(null);

export function CartStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<CartStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createCartStore();
  }

  return (
    <CartStoreContext.Provider value={storeRef.current}>
      {children}
    </CartStoreContext.Provider>
  );
}

export function useCartStore<T>(selector: (state: CartStore) => T): T {
  const store = useContext(CartStoreContext);

  if (!store) {
    throw new Error("useCartStore must be used within CartStoreProvider");
  }

  return useStore(store, selector);
}
