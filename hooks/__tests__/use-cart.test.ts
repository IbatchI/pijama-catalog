import { describe, expect, it } from "vitest";

import { createCartStore } from "@/stores/cart-store";

const sampleProduct = {
  id: "WA0067",
  name: "Pijama #67",
  price: null,
  type: "general",
  imagePath: "/images/IMG-20260831-WA0067.jpg",
};

describe("createCartStore", () => {
  it("adds a new product to the cart", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct);
    expect(store.getState().items).toHaveLength(1);
  });

  it("ignores duplicate addItem calls", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct);
    store.getState().addItem(sampleProduct);
    expect(store.getState().items).toHaveLength(1);
  });

  it("removes an item by product id", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct);
    store.getState().removeItem(sampleProduct.id);
    expect(store.getState().items).toHaveLength(0);
  });

  it("ignores removeItem for unknown ids", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct);
    store.getState().removeItem("unknown");
    expect(store.getState().items).toHaveLength(1);
  });

  it("clears all items", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct);
    store.getState().clearCart();
    expect(store.getState().items).toHaveLength(0);
  });

  it("reports isInCart correctly", () => {
    const store = createCartStore();
    expect(store.getState().isInCart(sampleProduct.id)).toBe(false);
    store.getState().addItem(sampleProduct);
    expect(store.getState().isInCart(sampleProduct.id)).toBe(true);
  });
});
