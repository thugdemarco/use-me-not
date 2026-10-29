import type { Product } from "./api";

// Extra views stay frontend-local so the shared backend product contract remains unchanged.
const extraViews: Record<string, string[]> = {
  "demo-two-wheel-succession": ["/products/imported/motorcycle.jpg"],
  "demo-chair-committee": [
    "/products/imported-batch2/brown-chair.jpg",
    "/products/imported-batch2/chair-stack.jpg",
  ],
  "demo-table-committee": ["/products/imported-batch2/round-table-set.jpg"],
  "demo-van-angle-collection": [
    "/products/imported-vehicles/side-open.jpg",
    "/products/imported-vehicles/cargo-view.jpg",
    "/products/imported-vehicles/side-detail.jpg",
    "/products/imported-vehicles/rear.jpg",
    "/products/imported-vehicles/rear-quarter.jpg",
  ],
};

export const productGalleryFor = (product: Product) => [
  product.imageUrl,
  ...(extraViews[product.id] ?? []),
];

const GALLERIES_KEY = "useless-product-galleries";

export function readProductGallery(product: Product) {
  try {
    const saved = JSON.parse(localStorage.getItem(GALLERIES_KEY) || "{}") as Record<string, string[]>;
    const urls = saved[product.id];
    return Array.isArray(urls) ? urls.filter(Boolean) : productGalleryFor(product).filter(Boolean);
  } catch {
    return productGalleryFor(product).filter(Boolean);
  }
}

export function saveProductGallery(productId: string, urls: string[]) {
  try {
    const saved = JSON.parse(localStorage.getItem(GALLERIES_KEY) || "{}") as Record<string, string[]>;
    saved[productId] = urls.filter(Boolean);
    localStorage.setItem(GALLERIES_KEY, JSON.stringify(saved));
  } catch {
    throw new Error("The product gallery could not be saved in this browser.");
  }
}
