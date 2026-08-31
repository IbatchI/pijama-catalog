import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const imagesDir = join(process.cwd(), "public/images");
const outputPath = join(process.cwd(), "data/products.ts");

function deriveId(filename: string): string {
  const match = filename.match(/WA(\d+)/i);
  return match ? `WA${match[1]}` : filename.replace(/\.jpg$/i, "");
}

function deriveName(filename: string): string {
  const match = filename.match(/WA(\d+)/i);
  const suffix = match ? match[1].replace(/^0+/, "") || "0" : filename;
  return `Pijama #${suffix}`;
}

const files = readdirSync(imagesDir)
  .filter((file) => file.toLowerCase().endsWith(".jpg"))
  .sort();

const products = files.map((filename) => ({
  id: deriveId(filename),
  name: deriveName(filename),
  price: null,
  type: "general",
  imagePath: `/images/${filename}`,
}));

const content = `import type { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 2)} as Product[];
`;

writeFileSync(outputPath, content, "utf8");
console.log(`Generated ${products.length} products in data/products.ts`);
