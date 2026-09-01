import { describe, expect, it } from "vitest";

import {
  buildSingleItemWhatsAppUrl,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { CartItem, Size } from "@/types";

const phone = "5491112345678";
const site = "https://catalog.vercel.app";

function makeItem(
  id: string,
  name: string,
  imagePath: string,
  size: Size = "M",
): CartItem {
  return {
    product: {
      id,
      name,
      price: null,
      type: "general",
      imagePath,
    },
    size,
  };
}

describe("buildWhatsAppUrl", () => {
  it("builds a single-item order message with new format", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Pijama #67", "/images/a.jpg", "XL")],
      phone,
      site,
    );

    expect(url.startsWith(`https://wa.me/${phone}?text=`)).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("🛍️ NUEVO PEDIDO");
    expect(decoded).toContain("Pijama #67");
    expect(decoded).toContain("- Talle XL 50/52");
    expect(decoded).toContain(`Ver foto: ${site}/images/a.jpg`);
    expect(decoded).toContain("Total: 1 pijama(s) seleccionado(s)");
    expect(decoded).not.toContain("Hola!");
    expect(decoded).not.toContain("📷");
    expect(decoded).not.toContain("✨");
    expect(decoded).not.toContain("1. Pijama");
  });

  it("includes bullet talle for M size", () => {
    const decoded = decodeURIComponent(
      buildWhatsAppUrl(
        [makeItem("1", "Pijama Floral", "/images/a.jpg", "M")],
        phone,
        site,
      ),
    );
    expect(decoded).toContain("- Talle M 42/44");
  });

  it("builds a multi-item message with one header and shared footer", () => {
    const items = [
      makeItem("1", "Pijama A", "/images/a.jpg", "M"),
      makeItem("2", "Pijama B", "/images/b.jpg", "S"),
    ];

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded.match(/🛍️ NUEVO PEDIDO/g)?.length).toBe(1);
    expect(decoded).toContain("Pijama A");
    expect(decoded).toContain("- Talle M 42/44");
    expect(decoded).toContain("Pijama B");
    expect(decoded).toContain("- Talle S 38/40");
    expect(decoded).toContain(`Ver foto: ${site}/images/a.jpg`);
    expect(decoded).toContain(`Ver foto: ${site}/images/b.jpg`);
    expect(decoded).toContain("Total: 2 pijama(s) seleccionado(s)");
    expect(decoded).not.toContain("1. Pijama");
  });

  it("truncates listing after 15 items and adds overflow note", () => {
    const items = Array.from({ length: 16 }, (_, index) =>
      makeItem(String(index), `Pijama ${index}`, `/images/${index}.jpg`, "M"),
    );

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded).toContain("Pijama 14");
    expect(decoded).not.toContain("Pijama 15");
    expect(decoded).toContain("... y 1 más.");
    expect(decoded).toContain(`Ver catálogo completo: ${site}`);
    expect(decoded).toContain("Total: 16 pijama(s) seleccionado(s)");
  });

  it("returns empty string for empty cart", () => {
    expect(buildWhatsAppUrl([], phone, site)).toBe("");
  });

  it("keeps phone number unencoded in URL path", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Test", "/images/test.jpg")],
      phone,
      site,
    );

    expect(url).toContain(`https://wa.me/${phone}?text=`);
  });

  it("encodes special characters in product names", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Pijama & Co? ✨", "/images/test.jpg")],
      phone,
      site,
    );

    expect(url).not.toContain("Pijama & Co?");
    expect(decodeURIComponent(url)).toContain("Pijama & Co? ✨");
  });
});

describe("buildSingleItemWhatsAppUrl", () => {
  it("delegates to buildWhatsAppUrl with one item", () => {
    const item = makeItem("1", "Pijama Unica", "/images/unica.jpg", "L");
    const single = buildSingleItemWhatsAppUrl(item, phone, site);
    const multi = buildWhatsAppUrl([item], phone, site);
    expect(single).toBe(multi);
  });
});
