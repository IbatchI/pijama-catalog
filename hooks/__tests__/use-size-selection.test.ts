import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSizeSelection } from "@/hooks/use-size-selection";

describe("useSizeSelection", () => {
  it("starts with no selection", () => {
    const { result } = renderHook(() => useSizeSelection());
    expect(result.current.selectedSize).toBeNull();
    expect(result.current.hasSelection).toBe(false);
  });

  it("selectSize sets the selected size", () => {
    const { result } = renderHook(() => useSizeSelection());

    act(() => {
      result.current.selectSize("M");
    });

    expect(result.current.selectedSize).toBe("M");
    expect(result.current.hasSelection).toBe(true);
  });

  it("switching size replaces the previous selection", () => {
    const { result } = renderHook(() => useSizeSelection());

    act(() => {
      result.current.selectSize("S");
    });
    act(() => {
      result.current.selectSize("L");
    });

    expect(result.current.selectedSize).toBe("L");
    expect(result.current.hasSelection).toBe(true);
  });

  it("re-selecting the same size keeps it selected", () => {
    const { result } = renderHook(() => useSizeSelection());

    act(() => {
      result.current.selectSize("XL");
    });
    act(() => {
      result.current.selectSize("XL");
    });

    expect(result.current.selectedSize).toBe("XL");
    expect(result.current.hasSelection).toBe(true);
  });
});
