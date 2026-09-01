import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useImagePreview } from "@/hooks/use-image-preview";
import type { Product } from "@/types";

const pijamaA: Product = {
  id: "67",
  name: "Pijama #67",
  price: null,
  type: "general",
  imagePath: "/images/67.jpg",
};

const pijamaB: Product = {
  id: "68",
  name: "Pijama #68",
  price: null,
  type: "general",
  imagePath: "/images/68.jpg",
};

describe("useImagePreview", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useImagePreview());

    expect(result.current.product).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it("open sets the product and isOpen", () => {
    const { result } = renderHook(() => useImagePreview());

    act(() => {
      result.current.open(pijamaA);
    });

    expect(result.current.product).toEqual(pijamaA);
    expect(result.current.isOpen).toBe(true);
  });

  it("close clears the product", () => {
    const { result } = renderHook(() => useImagePreview());

    act(() => {
      result.current.open(pijamaA);
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.product).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it("open while another product is previewed replaces it", () => {
    const { result } = renderHook(() => useImagePreview());

    act(() => {
      result.current.open(pijamaA);
    });
    act(() => {
      result.current.open(pijamaB);
    });

    expect(result.current.product).toEqual(pijamaB);
    expect(result.current.isOpen).toBe(true);
  });
});
