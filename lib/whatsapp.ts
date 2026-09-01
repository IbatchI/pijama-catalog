import { getSizeLabel } from "@/data/sizes";
import type { CartItem } from "@/types";

export const WHATSAPP_PHONE = "5492994604920";

const MAX_LISTED_ITEMS = 15;

/**
 * Click-to-chat endpoint. `wa.me` redirects corrupt 4-byte emojis (shown as �).
 * `api.whatsapp.com/send` preserves the encoded UTF-8 in the prefilled text.
 */
const WHATSAPP_SEND_URL = "https://api.whatsapp.com/send";

function formatItemCount(count: number): string {
  return count === 1 ? "1 pijama" : `${count} pijamas`;
}

function buildItemBlock(
  item: CartItem,
  baseUrl: string,
  index: number | null,
): string {
  const imageUrl = `${baseUrl}${item.product.imagePath}`;
  const title =
    index === null
      ? `*${item.product.name}*`
      : `*${index}. ${item.product.name}*`;

  return [
    title,
    `Talle: *${getSizeLabel(item.size)}*`,
    `Foto: ${imageUrl}`,
  ].join("\n");
}

function buildMessageBody(items: CartItem[], siteBaseUrl: string): string {
  const baseUrl = siteBaseUrl.replace(/\/$/, "");
  const listedItems = items.slice(0, MAX_LISTED_ITEMS);
  const remaining = items.length - listedItems.length;
  const numbered = listedItems.length > 1;

  const blocks = listedItems.map((item, index) =>
    buildItemBlock(item, baseUrl, numbered ? index + 1 : null),
  );

  let message = `🛍️ *NUEVO PEDIDO*\n\n${blocks.join("\n\n")}`;

  if (remaining > 0) {
    message += `\n\n… y ${remaining} más.\nCatálogo: ${baseUrl}`;
  }

  message += `\n\n*Total: ${formatItemCount(items.length)}*`;
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
  return `${WHATSAPP_SEND_URL}?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
}

export function buildSingleItemWhatsAppUrl(
  item: CartItem,
  phoneNumber: string,
  siteBaseUrl: string,
): string {
  return buildWhatsAppUrl([item], phoneNumber, siteBaseUrl);
}
