"use client";

import { ImagePreviewDialog } from "@/components/catalog/ImagePreviewDialog";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useImagePreview } from "@/hooks/use-image-preview";
import type { Product, Size } from "@/types";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, size: Size) => void;
  getWantItUrl: (product: Product, size: Size) => string;
  isInCart: (productId: string, size: Size) => boolean;
}

export function ProductGrid({
  products,
  onAddToCart,
  getWantItUrl,
  isInCart,
}: ProductGridProps) {
  const { product, isOpen, open, close } = useImagePreview();

  if (products.length === 0) {
    return (
      <Empty className="border border-dashed border-border py-16">
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
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            onAddToCart={onAddToCart}
            getWantItUrl={getWantItUrl}
            isInCart={(size) => isInCart(item.id, size)}
            onPreview={open}
          />
        ))}
      </div>
      <ImagePreviewDialog product={product} open={isOpen} onClose={close} />
    </>
  );
}
