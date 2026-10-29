import type { Order } from "./api";

export type CustomerDetails = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
};
export type OrderRecord = {
  order: Order;
  customer: CustomerDetails;
  placedAt: string;
};
export type ProductReview = {
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const HISTORY_KEY = "useless-order-history";
const REVIEWS_KEY = "useless-product-reviews";
function read<T>(key: string): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}
export const getOrderHistory = () => read<OrderRecord>(HISTORY_KEY);
export function saveOrderRecord(record: OrderRecord) {
  const records = getOrderHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([
    record,
    ...records.filter((item) => item.order.id !== record.order.id),
  ]));
}
export function updateSavedOrder(order: Order) {
  const existing = getOrderHistory().find((record) => record.order.id === order.id);
  if (existing) saveOrderRecord({ ...existing, order });
}
export const getReviews = () => read<ProductReview>(REVIEWS_KEY);
export function saveReview(review: ProductReview) {
  const reviews = getReviews();
  localStorage.setItem(REVIEWS_KEY, JSON.stringify([
    review,
    ...reviews.filter((item) => item.orderId !== review.orderId || item.productId !== review.productId),
  ]));
}
