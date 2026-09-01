"use client";

import { useEffect, useMemo, useState } from "react";

import { Pagination } from "@/components/catalog/Pagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CartSheet } from "@/components/cart/CartSheet";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/use-cart";
import { usePagination } from "@/hooks/use-pagination";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { getProducts } from "@/lib/products";

export default function HomePage() {
  const products = useMemo(() => getProducts(), []);
  const { items, totalItems, addItem, removeItem, isInCart } = useCart();
  const { buildCartUrl, buildSingleUrl } = useWhatsApp();
  const { currentPage, totalPages, pageItems, goToPage } = usePagination({
    products,
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleCheckout = () => {
    const url = buildCartUrl(items);
    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Header totalItems={totalItems} onOpenCart={() => setIsSheetOpen(true)} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
        <section className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium text-primary">Colección disponible</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              Elegí tu próximo pijama favorito
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Explorá los modelos, elegí tu talle y mandanos tu pedido por WhatsApp.
              Simple, rápido y sin vueltas.
            </p>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{products.length}</span>{" "}
            modelos para elegir
          </p>
        </section>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">1.</strong> Elegí un modelo
          </span>
          <span>
            <strong className="text-foreground">2.</strong> Seleccioná el talle
          </span>
          <span>
            <strong className="text-foreground">3.</strong> Confirmá por WhatsApp
          </span>
        </div>
        <ProductGrid
          products={pageItems}
          onAddToCart={addItem}
          getWantItUrl={buildSingleUrl}
          isInCart={isInCart}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </main>
      <CartSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        items={items}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />
    </>
  );
}
