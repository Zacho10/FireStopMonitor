import { access } from "node:fs/promises";
import path from "node:path";

const BRAND_LOGO_CANDIDATES = [
  "logo.svg",
  "logo.png",
  "logo.avif",
  "logo.webp",
  "logo.jpg",
  "logo.jpeg",
];

export async function getBrandLogoSrc() {
  for (const filename of BRAND_LOGO_CANDIDATES) {
    const absolutePath = path.join(process.cwd(), "public", filename);

    try {
      await access(absolutePath);
      return `/${filename}`;
    } catch {
      continue;
    }
  }

  return null;
}
