"use client";

import { CartBadge } from "@/components/cart/CartBadge";

interface HeaderProps {
  totalItems: number;
  onOpenCart: () => void;
}

export function Header({ totalItems, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Catálogo
          </p>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Pijamas
          </h1>
        </div>
        <CartBadge count={totalItems} onClick={onOpenCart} />
      </div>
    </header>
  );
}
