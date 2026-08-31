"use client";

import { ProductCard } from "@/components/catalog/ProductCard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  cartItemIds: Set<string>;
  onAddToCart: (product: Product) => void;
  getWantItUrl: (product: Product) => string;
}

export function ProductGrid({
  products,
  cartItemIds,
  onAddToCart,
  getWantItUrl,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <Empty className="border border-dashed border-border">
        <EmptyHeader>
          <EmptyTitle>No hay productos</EmptyTitle>
          <EmptyDescription>
            El catálogo no tiene pijamas disponibles por ahora.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[var(--spacing-card-gap)] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          wantItUrl={getWantItUrl(product)}
          isInCart={cartItemIds.has(product.id)}
        />
      ))}
    </div>
  );
}
