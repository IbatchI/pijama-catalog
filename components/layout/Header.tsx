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
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Catálogo
            </p>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Pijamas
            </h1>
          </div>
        </div>
        <CartBadge count={totalItems} onClick={onOpenCart} />
      </div>
    </header>
  );
}
