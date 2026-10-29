import { demoApi, demoOffers } from "./demo-api";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  isActive: boolean;
};
export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};
export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: string;
  estimatedDeliveryDate: string;
  simulated: boolean;
};
const BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
export const isDemoApi = import.meta.env.VITE_DEMO_API === "true";
export function promotionFor(product: Product) {
  if (!isDemoApi) return null;
  const offer = demoOffers[product.id];
  if (!offer) return null;
  const percent = offer.percent;
  return {
    basePrice: product.price,
    finalPrice: Math.round(product.price * (1 + percent / 100)),
    percent,
  };
}
export const displayPrice = (product: Product) => promotionFor(product)?.finalPrice ?? product.price;
async function request<T>(
  path: string,
  init?: RequestInit,
  adminKey?: string,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (adminKey) headers.set("X-Admin-Key", adminKey);
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error(
      "We could not reach the store service. Check the backend and try again.",
    );
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      message = typeof data.detail === "string" ? data.detail : message;
    } catch {
      /* retain status message */
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
const toCheckoutBody = (body: {
  customer: { name: string; address: string; city: string; postalCode: string };
  items: { productId: string; quantity: number }[];
}) => body;
export const api = {
  products: () =>
    isDemoApi
      ? demoApi.products()
      : request<{ products: Product[] }>("/products"),
  product: (id: string) =>
    isDemoApi
      ? demoApi.product(id)
      : request<{ product: Product }>(`/products/${encodeURIComponent(id)}`),
  checkout: (body: {
    customer: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
    };
    items: { productId: string; quantity: number }[];
  }) =>
    isDemoApi
      ? demoApi.checkout(toCheckoutBody(body))
      : request<{ order: Order }>("/checkout", {
          method: "POST",
          body: JSON.stringify(body),
        }),
  order: (id: string) =>
    isDemoApi
      ? demoApi.order(id)
      : request<Order>(`/orders/${encodeURIComponent(id)}`),
  adminProducts: (key: string) =>
    isDemoApi
      ? demoApi.adminProducts(key)
      : request<{ products: Product[] }>("/products", undefined, key),
  saveProduct: (key: string, product: Omit<Product, "id">, id?: string) =>
    isDemoApi
      ? demoApi.saveProduct(key, product, id)
      : request<{ product: Product }>(
          id ? `/admin/products/${encodeURIComponent(id)}` : "/admin/products",
          { method: id ? "PUT" : "POST", body: JSON.stringify(product) },
          key,
        ),
  deleteProduct: (key: string, id: string) =>
    isDemoApi
      ? demoApi.deleteProduct(key, id)
      : request<void>(
          `/admin/products/${encodeURIComponent(id)}`,
          { method: "DELETE" },
          key,
        ),
  upload: async (key: string, file: File, onProgress: (n: number) => void) => {
    if (isDemoApi) return demoApi.upload(key, file, onProgress);
    return new Promise<string>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE}/admin/uploads`);
      xhr.setRequestHeader("X-Admin-Key", key);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onerror = () =>
        reject(
          new Error(
            "We could not reach the store service. Check the backend and try again.",
          ),
        );
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            onProgress(100);
            resolve(
              (JSON.parse(xhr.responseText) as { imageUrl: string }).imageUrl,
            );
          } catch {
            reject(new Error("The upload response was invalid."));
          }
        } else {
          let message = `Request failed (${xhr.status}).`;
          try {
            const data = JSON.parse(xhr.responseText) as { detail?: unknown };
            if (typeof data.detail === "string") message = data.detail;
          } catch {
            /* use status */
          }
          reject(new Error(message));
        }
      };
      xhr.send(form);
    });
  },
  orders: (key: string) =>
    isDemoApi
      ? demoApi.orders(key)
      : request<{ orders: Order[] }>("/admin/orders", undefined, key),
  applyDiscount: (code: string) => {
    if (!isDemoApi) throw new Error("Discount codes are unavailable.");
    return demoApi.applyDiscount(code);
  },
  clearDiscount: () => {
    if (isDemoApi) demoApi.clearDiscount();
  },
};
