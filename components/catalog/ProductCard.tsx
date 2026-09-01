"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SIZE_OPTIONS } from "@/data/sizes";
import { useSizeSelection } from "@/hooks/use-size-selection";
import { Check, ShoppingBag } from "lucide-react";
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
  const price =
    product.price == null
      ? "Consultar precio"
      : `$${product.price.toLocaleString("es-AR")}`;

  return (
    <Card className="group overflow-hidden border-border bg-card py-0 shadow-none transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
          {imageError ? (
            <div className="flex size-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              Imagen no disponible
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imagePath}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-sm font-medium text-foreground">
              {product.name}
            </h3>
            <p className="text-sm font-semibold text-foreground">{price}</p>
          </div>
          <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.type}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Elegí tu talle
          </span>
          <ToggleGroup
            value={selectedSize ? [selectedSize] : []}
            onValueChange={(values) => {
              const next = values[0];
              if (next) {
                selectSize(next as Size);
              }
            }}
            aria-label={`Seleccionar talle para ${product.name}`}
            variant="outline"
            spacing={0}
            className="grid w-full grid-cols-4"
          >
            {SIZE_OPTIONS.map(({ value, label }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="h-8 min-w-0 px-0.5 text-xs aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                <span className="sm:hidden">{value}</span>
                <span className="hidden sm:inline">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex w-full gap-2">
          <Button
            variant="default"
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
            variant="outline"
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
              <Check data-icon="inline-start" />
            ) : (
              <ShoppingBag data-icon="inline-start" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
