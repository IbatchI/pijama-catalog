import { describe, expect, it } from "vitest";

import {
  buildSingleItemWhatsAppUrl,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { CartItem, Size } from "@/types";

const phone = "5491112345678";
const site = "https://catalog.vercel.app";
const sendBase = `https://api.whatsapp.com/send?phone=${phone}&text=`;

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
  it("builds a single-item order message with WhatsApp formatting", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Pijama #67", "/images/a.jpg", "XL")],
      phone,
      site,
    );

    expect(url.startsWith(sendBase)).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("🛍️ *NUEVO PEDIDO*");
    expect(decoded).toContain("*Pijama #67*");
    expect(decoded).toContain("Talle: *XL 50/52*");
    expect(decoded).toContain(`Foto: ${site}/images/a.jpg`);
    expect(decoded).toContain("*Total: 1 pijama*");
    expect(decoded).not.toContain("Hola!");
    expect(decoded).not.toContain("1. Pijama");
  });

  it("keeps the shopping-bag emoji encoded in the URL (not a replacement char)", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Pijama #67", "/images/a.jpg", "M")],
      phone,
      site,
    );

    expect(url).toContain(encodeURIComponent("🛍️"));
    expect(url).not.toContain("%EF%BF%BD");
    expect(decodeURIComponent(url)).toContain("🛍️");
  });

  it("includes formatted talle for M size", () => {
    const decoded = decodeURIComponent(
      buildWhatsAppUrl(
        [makeItem("1", "Pijama Floral", "/images/a.jpg", "M")],
        phone,
        site,
      ),
    );
    expect(decoded).toContain("Talle: *M 42/44*");
  });

  it("builds a multi-item message with numbered blocks and shared footer", () => {
    const items = [
      makeItem("1", "Pijama A", "/images/a.jpg", "M"),
      makeItem("2", "Pijama B", "/images/b.jpg", "S"),
    ];

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded.match(/🛍️ \*NUEVO PEDIDO\*/g)?.length).toBe(1);
    expect(decoded).toContain("*1. Pijama A*");
    expect(decoded).toContain("Talle: *M 42/44*");
    expect(decoded).toContain("*2. Pijama B*");
    expect(decoded).toContain("Talle: *S 38/40*");
    expect(decoded).toContain(`Foto: ${site}/images/a.jpg`);
    expect(decoded).toContain(`Foto: ${site}/images/b.jpg`);
    expect(decoded).toContain("*Total: 2 pijamas*");
  });

  it("truncates listing after 15 items and adds overflow note", () => {
    const items = Array.from({ length: 16 }, (_, index) =>
      makeItem(String(index), `Pijama ${index}`, `/images/${index}.jpg`, "M"),
    );

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded).toContain("Pijama 14");
    expect(decoded).not.toContain("Pijama 15");
    expect(decoded).toContain("… y 1 más.");
    expect(decoded).toContain(`Catálogo: ${site}`);
    expect(decoded).toContain("*Total: 16 pijamas*");
  });

  it("returns empty string for empty cart", () => {
    expect(buildWhatsAppUrl([], phone, site)).toBe("");
  });

  it("keeps phone number unencoded in the query", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Test", "/images/test.jpg")],
      phone,
      site,
    );

    expect(url).toContain(`https://api.whatsapp.com/send?phone=${phone}&text=`);
    expect(url).not.toContain("wa.me");
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
