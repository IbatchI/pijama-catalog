import { describe, expect, it } from "vitest";

import {
  buildSingleItemWhatsAppUrl,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { CartItem } from "@/types";

const phone = "5491112345678";
const site = "https://catalog.vercel.app";

function makeItem(id: string, name: string, imagePath: string): CartItem {
  return {
    product: {
      id,
      name,
      price: null,
      type: "general",
      imagePath,
    },
  };
}

describe("buildWhatsAppUrl", () => {
  it("builds a single-item URL with product name and image", () => {
    const url = buildWhatsAppUrl(
      [makeItem("1", "Pijama Floral", "/images/a.jpg")],
      phone,
      site,
    );

    expect(url.startsWith(`https://wa.me/${phone}?text=`)).toBe(true);
    expect(decodeURIComponent(url)).toContain("Pijama Floral");
    expect(decodeURIComponent(url)).toContain(`${site}/images/a.jpg`);
  });

  it("builds a multi-item message with three entries", () => {
    const items = [
      makeItem("1", "Pijama A", "/images/a.jpg"),
      makeItem("2", "Pijama B", "/images/b.jpg"),
      makeItem("3", "Pijama C", "/images/c.jpg"),
    ];

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded).toContain("1. Pijama A");
    expect(decoded).toContain("2. Pijama B");
    expect(decoded).toContain("3. Pijama C");
    expect(decoded).toContain("Total: 3 pijama(s) seleccionado(s)");
  });

  it("truncates listing after 15 items and adds overflow note", () => {
    const items = Array.from({ length: 16 }, (_, index) =>
      makeItem(String(index), `Pijama ${index}`, `/images/${index}.jpg`),
    );

    const decoded = decodeURIComponent(buildWhatsAppUrl(items, phone, site));
    expect(decoded).toContain("15. Pijama 14");
    expect(decoded).not.toContain("16. Pijama 15");
    expect(decoded).toContain("... y 1 más.");
    expect(decoded).toContain(`Ver catálogo completo: ${site}`);
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
    const item = makeItem("1", "Pijama Unica", "/images/unica.jpg");
    const single = buildSingleItemWhatsAppUrl(item, phone, site);
    const multi = buildWhatsAppUrl([item], phone, site);
    expect(single).toBe(multi);
  });
});
