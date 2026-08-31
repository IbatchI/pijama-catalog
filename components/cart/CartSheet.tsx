"use client";

import { CartItemRow } from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CartItem } from "@/types";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartSheet({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
}: CartSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <Empty className="flex-1 border-none">
            <EmptyHeader>
              <EmptyTitle>Tu carrito está vacío</EmptyTitle>
              <EmptyDescription>
                Agrega pijamas desde el catálogo para finalizar tu pedido.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            {items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}

        <SheetFooter>
          <Separator />
          <Button
            type="button"
            className="w-full"
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            Finalizar pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
