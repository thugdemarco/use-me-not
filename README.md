# Use-Me-Not

Premium editorial storefront for unnecessary objects. By default, local development uses a contract-shaped demo adapter with generated sample products, local cart, demo checkout and preview-only admin changes. Set `VITE_DEMO_API=false` to route catalog, inventory, uploads, orders and admin operations to the configured HTTP API. The cart persists only product IDs and quantities in `localStorage`.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

The frontend defaults to `http://localhost:8000/api`. Set `VITE_API_BASE_URL` to the API base URL for another environment. Variables prefixed with `VITE_` are public configuration; do not put server secrets there. Admin API keys are entered at `/admin` and held in browser `sessionStorage` only.

## Use-Me-Not chat

The floating chat is intentionally unhelpful and uses Groq for short, playful roasts. Put `GROQ_API_KEY` in the ignored `.env.local` file; never prefix it with `VITE_` or add it to client code. The Vite development and preview servers proxy `/api/groq-chat` to Groq, so the secret stays server-side. The roast prompt avoids personal or protected-trait attacks and switches to supportive guidance for emergencies or self-harm.

The shared storefront API contract does not include chat. Static production hosting must provide an equivalent server-side `/api/groq-chat` proxy and keep the Groq key secret; the browser cannot call Groq directly with a private key.

## Integrated endpoints

- `GET /products`, `GET /products/{id}`
- `POST /checkout`, with backend-confirmed order details and delivery date
- `GET /orders/{id}` for refreshing the confirmed status and estimated delivery when supported by the backend
- `POST /admin/products`, `PUT /admin/products/{id}`, `DELETE /admin/products/{id}`
- `POST /admin/uploads` (multipart field `file`)
- `GET /admin/orders` (optional; unavailable responses are shown as no recent orders)

All calls use the configured API base URL and follow the agreed JSON field names. Public catalog filtering only shows active products. The API contract does not specify a separate admin product-list endpoint, so the dashboard reads `GET /products` with the admin header; include inactive products in that response for full inactive-product management if the backend supports it, or add a listing endpoint only after coordinating a contract update.

## Product image behavior

Product image URLs come from the API. The remote fallback is used only when an image fails to load, not as catalog data. Admin uploads report browser upload progress; the browser sets the multipart boundary automatically.

## Build

```sh
npm run build
npm run preview
```

The homepage hero includes the reusable parallax image layer in `src/components/ui/parallax-hero-images.tsx`; it uses the supplied Aceternity-hosted demo assets.

## Local demo catalog and discounts

Set `VITE_DEMO_API=true` to run the contract-shaped local demo adapter. The four AI-generated sample objects, their products, demo orders, and admin edits are stored in this browser's local storage. Admin sign-in accepts any non-empty demo key. Demo product promotions and codes are deliberately reversed: `CAPSLOCK` adds 11%, `PIPE-DREAM` adds 22%, and `404NOWHERE` adds 40% to the total. The adapter accepts the same checkout request fields and returns the same order shape; it does not send demo products or demo orders to the real backend. Set `VITE_DEMO_API=false` to use the configured HTTP API instead.

The shared API contract has no promotion or coupon fields. The demo-only reversed promotions and coupon surcharges are therefore available only in local demo mode. For live promotions, the backend must return the final product price and calculate any checkout adjustment before the frontend can safely show it.

The demo storefront also applies a Hesitation Tax of ₹0.50 per second on product detail pages. It carries into the demo cart and order, then resets after a confirmed checkout. This stays demo-only because the live API contract does not define a dynamic product surcharge.

Checkout includes a Namaste gesture ritual based on the supplied webcam demo. Camera access starts only after the buyer clicks the camera button. Hand detection and a magnifying face-bulge lens run locally in the browser; no video is recorded or uploaded. The simulated order is submitted after the gesture and is still confirmed by the store API. If camera access or the detector is unavailable, the buyer can continue with the no-payment demo order. The standalone page is available at `/namaste-payment.html`.

## Order follow-up

After checkout, the frontend stores the confirmed order and delivery address in browser local storage so the buyer can return to `/my-orders` to view it and download a simulated PDF invoice. Tracking refresh calls `GET /orders/{id}` and displays the last confirmed status if the endpoint is unavailable. The current contract does not include carrier events or tracking numbers, so the page does not invent them. Product reviews are saved in that browser only because the API contract has no review endpoint; they are visible on the matching product page in the same browser. Clearing browser storage removes this local order history and reviews. The invoice states that no payment was taken and is not a tax invoice.
