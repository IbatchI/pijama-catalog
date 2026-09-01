import { getSizeLabel } from "@/data/sizes";
import type { CartItem } from "@/types";

export const WHATSAPP_PHONE = "5492302354906";

const MAX_LISTED_ITEMS = 15;

function buildMessageBody(
  items: CartItem[],
  siteBaseUrl: string,
): string {
  const baseUrl = siteBaseUrl.replace(/\/$/, "");
  const listedItems = items.slice(0, MAX_LISTED_ITEMS);
  const remaining = items.length - listedItems.length;

  const lines = listedItems.map((item, index) => {
    const imageUrl = `${baseUrl}${item.product.imagePath}`;
    return `${index + 1}. ${item.product.name}\n   Talle: ${getSizeLabel(item.size)}\n   📷 ${imageUrl}`;
  });

  let message = `Hola! Me interesan estos pijamas:\n\n${lines.join("\n\n")}`;

  if (remaining > 0) {
    message += `\n\n... y ${remaining} más.\nVer catálogo completo: ${baseUrl}`;
  }

  message += `\n\nTotal: ${items.length} pijama(s) seleccionado(s) ✨`;
  return message;
}

export function buildWhatsAppUrl(
  items: CartItem[],
  phoneNumber: string,
  siteBaseUrl: string,
): string {
  if (items.length === 0) {
    return "";
  }

  const message = buildMessageBody(items, siteBaseUrl);
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function buildSingleItemWhatsAppUrl(
  item: CartItem,
  phoneNumber: string,
  siteBaseUrl: string,
): string {
  return buildWhatsAppUrl([item], phoneNumber, siteBaseUrl);
}
