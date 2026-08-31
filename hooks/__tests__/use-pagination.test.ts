import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePagination } from "@/hooks/use-pagination";
import type { Product } from "@/types";

const products: Product[] = Array.from({ length: 20 }, (_, index) => ({
  id: String(index + 1),
  name: `Pijama ${index + 1}`,
  price: null,
  type: "general",
  imagePath: `/images/${index + 1}.jpg`,
}));

describe("usePagination", () => {
  it("returns the first page slice", () => {
    const { result } = renderHook(() =>
      usePagination({ products, pageSize: 15 }),
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.pageItems).toHaveLength(15);
  });

  it("moves to the next page", () => {
    const { result } = renderHook(() =>
      usePagination({ products, pageSize: 15 }),
    );

    act(() => {
      result.current.next();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toHaveLength(5);
  });

  it("does not go past the last page", () => {
    const { result } = renderHook(() =>
      usePagination({ products, pageSize: 15 }),
    );

    act(() => {
      result.current.goToPage(99);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.isLastPage).toBe(true);
  });

  it("does not go before the first page", () => {
    const { result } = renderHook(() =>
      usePagination({ products, pageSize: 15 }),
    );

    act(() => {
      result.current.prev();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.isFirstPage).toBe(true);
  });

  it("clamps goToPage within valid range", () => {
    const { result } = renderHook(() =>
      usePagination({ products, pageSize: 15 }),
    );

    act(() => {
      result.current.goToPage(0);
    });
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(2);
    });
    expect(result.current.currentPage).toBe(2);
  });
});
