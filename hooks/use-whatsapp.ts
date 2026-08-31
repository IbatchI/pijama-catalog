"use client";

import {
  buildSingleItemWhatsAppUrl,
  buildWhatsAppUrl,
  WHATSAPP_PHONE,
} from "@/lib/whatsapp";
import type { CartItem, Product } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export function useWhatsApp() {
  const buildCartUrl = (items: CartItem[]) =>
    buildWhatsAppUrl(items, WHATSAPP_PHONE, SITE_URL);

  const buildSingleUrl = (product: Product) =>
    buildSingleItemWhatsAppUrl({ product }, WHATSAPP_PHONE, SITE_URL);

  return {
    buildCartUrl,
    buildSingleUrl,
  };
}
