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
  const {
    currentPage,
    totalPages,
    pageItems,
    goToPage,
  } = usePagination({ products });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const cartItemIds = useMemo(
    () => new Set(items.map((item) => item.product.id)),
    [items],
  );

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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <ProductGrid
          products={pageItems}
          cartItemIds={cartItemIds}
          onAddToCart={addItem}
          getWantItUrl={buildSingleUrl}
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
