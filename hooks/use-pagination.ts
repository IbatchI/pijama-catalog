"use client";

import { useMemo, useState } from "react";

import { PAGE_SIZE } from "@/lib/products";
import type { Product } from "@/types";

interface UsePaginationProps {
  products: Product[];
  pageSize?: number;
}

export function usePagination({
  products,
  pageSize = PAGE_SIZE,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / pageSize)),
    [products.length, pageSize],
  );

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [currentPage, pageSize, products]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const next = () => {
    goToPage(currentPage + 1);
  };

  const prev = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    pageItems,
    goToPage,
    next,
    prev,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}
