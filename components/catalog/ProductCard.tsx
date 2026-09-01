"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SIZE_OPTIONS } from "@/data/sizes";
import { useSizeSelection } from "@/hooks/use-size-selection";
import { Check, ShoppingCart } from "lucide-react";
import type { Product, Size } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: Size) => void;
  getWantItUrl: (product: Product, size: Size) => string;
  isInCart: (size: Size) => boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  getWantItUrl,
  isInCart,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { selectedSize, selectSize, hasSelection } = useSizeSelection();
  const inCart = selectedSize ? isInCart(selectedSize) : false;

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
      <CardFooter className="flex flex-col gap-1.5 p-2">
        <ToggleGroup
          value={selectedSize ? [selectedSize] : []}
          onValueChange={(values) => {
            const next = values[0];
            if (next) {
              selectSize(next as Size);
            }
          }}
          aria-label="Seleccionar talle"
          variant="outline"
          spacing={0}
          className="grid w-full grid-cols-4"
        >
          {SIZE_OPTIONS.map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="h-7 min-w-0 flex-1 px-0.5 text-[10px] leading-none aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex w-full gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="min-w-0 flex-1"
            disabled={!hasSelection}
            nativeButton={!hasSelection || !selectedSize}
            render={
              hasSelection && selectedSize ? (
                <a
                  href={getWantItUrl(product, selectedSize)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Lo quiero: ${product.name}, talle ${selectedSize}`}
                />
              ) : undefined
            }
          >
            Lo quiero
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="aspect-square px-0"
            disabled={!hasSelection || inCart}
            aria-label={
              inCart
                ? `${product.name} ya está en el carrito`
                : hasSelection
                  ? `Agregar ${product.name} al carrito`
                  : "Seleccioná un talle para agregar al carrito"
            }
            onClick={() => {
              if (selectedSize) {
                onAddToCart(product, selectedSize);
              }
            }}
          >
            {inCart ? (
              <Check className="size-4" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                {/* cart body */}
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                {/* plus sign */}
                <line x1="12" y1="10" x2="12" y2="16" />
                <line x1="9" y1="13" x2="15" y2="13" />
              </svg>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
