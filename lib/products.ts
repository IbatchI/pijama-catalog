import { products } from "@/data/products";
import type { Product } from "@/types";

export const PAGE_SIZE = 15;

export function getProducts(): Product[] {
  return products;
}

export function getPaginatedProducts(
  allProducts: Product[],
  page: number,
  pageSize: number = PAGE_SIZE,
): Product[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return allProducts.slice(start, start + pageSize);
}

export function getTotalPages(
  totalItems: number,
  pageSize: number = PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
