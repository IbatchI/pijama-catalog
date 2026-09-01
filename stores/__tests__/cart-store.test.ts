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
  it("adds a new product with size to the cart", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0]?.size).toBe("M");
  });

  it("ignores duplicate addItem calls for same product and size", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    store.getState().addItem(sampleProduct, "M");
    expect(store.getState().items).toHaveLength(1);
  });

  it("allows same product in different sizes as separate lines", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    store.getState().addItem(sampleProduct, "L");
    expect(store.getState().items).toHaveLength(2);
  });

  it("removes an item by product id and size", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    store.getState().addItem(sampleProduct, "L");
    store.getState().removeItem(sampleProduct.id, "M");
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0]?.size).toBe("L");
  });

  it("ignores removeItem for unknown product+size", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    store.getState().removeItem("unknown", "M");
    store.getState().removeItem(sampleProduct.id, "L");
    expect(store.getState().items).toHaveLength(1);
  });

  it("clears all items", () => {
    const store = createCartStore();
    store.getState().addItem(sampleProduct, "M");
    store.getState().clearCart();
    expect(store.getState().items).toHaveLength(0);
  });

  it("reports isInCart correctly per size", () => {
    const store = createCartStore();
    expect(store.getState().isInCart(sampleProduct.id, "M")).toBe(false);
    store.getState().addItem(sampleProduct, "M");
    expect(store.getState().isInCart(sampleProduct.id, "M")).toBe(true);
    expect(store.getState().isInCart(sampleProduct.id, "L")).toBe(false);
  });
});
