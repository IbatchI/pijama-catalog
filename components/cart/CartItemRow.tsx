"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageError ? (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
            N/A
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.product.imagePath}
            alt={item.product.name}
            className="size-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.product.name}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Eliminar ${item.product.name}`}
        onClick={() => onRemove(item.product.id)}
      >
        <XIcon data-icon="inline-start" />
      </Button>
    </div>
  );
}
