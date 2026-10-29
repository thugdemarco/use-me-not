import type { Product } from "./api";

const ORDER_KEY = "useless-store-product-order";

function readOrder() {
  try {
    const value = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function orderProducts(products: Product[]) {
  const ids = readOrder();
  if (!ids.length) return products;
  const rank = new Map(ids.map((id, index) => [id, index]));
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => (rank.get(a.product.id) ?? ids.length + a.index) - (rank.get(b.product.id) ?? ids.length + b.index))
    .map(({ product }) => product);
}

export function saveProductOrder(products: Product[]) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(products.map(({ id }) => id)));
}
