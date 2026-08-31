"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  wantItUrl: string;
  isInCart: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  wantItUrl,
  isInCart,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden border-border bg-card py-0 shadow-sm">
      <CardContent className="p-0">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
          {imageError ? (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Imagen no disponible
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imagePath}
              alt={product.name}
              className="size-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-3">
        <Button
          type="button"
          className="w-full"
          disabled={isInCart}
          onClick={() => onAddToCart(product)}
        >
          {isInCart ? "En carrito ✓" : "Agregar al carrito"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={
            <a
              href={wantItUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Lo quiero: ${product.name}`}
            />
          }
        >
          Lo quiero
        </Button>
      </CardFooter>
    </Card>
  );
}
