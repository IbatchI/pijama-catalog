"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBagIcon } from "lucide-react";

interface CartBadgeProps {
  count: number;
  onClick: () => void;
}

export function CartBadge({ count, onClick }: CartBadgeProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="relative"
      aria-label={`Ver carrito, ${count} productos`}
      onClick={onClick}
    >
      <ShoppingBagIcon data-icon="inline-start" />
      Carrito
      {count > 0 ? (
        <Badge className="absolute -top-1 -right-1 min-w-5 justify-center px-1">
          {count}
        </Badge>
      ) : null}
    </Button>
  );
}
