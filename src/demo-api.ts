import type { Order, Product } from "./api";
import { hesitationTaxFor } from "./hesitation-tax";

type CheckoutRequest = {
  customer: { name: string; address: string; city: string; postalCode: string };
  items: { productId: string; quantity: number }[];
};

export const demoOffers: Record<string, { percent: number }> = {
  "demo-bottle-cap": { percent: 75 },
  "demo-pen-cap": { percent: 90 },
  "demo-pipe-leak": { percent: 30 },
  "demo-usb-cable": { percent: 80 },
  "demo-sachet-sack": { percent: 41 },
  "demo-green-cup": { percent: 27 },
  "demo-overflow-bin": { percent: 63 },
  "demo-desk-pebble": { percent: 18 },
  "demo-rust-pan": { percent: 52 },
  "demo-paint-tin": { percent: 36 },
  "demo-crushed-bottle": { percent: 74 },
  "demo-broken-chair": { percent: 29 },
  "demo-blank-stand": { percent: 45 },
  "demo-glass-bottle": { percent: 33 },
  "demo-bent-rod": { percent: 58 },
  "demo-yellow-van": { percent: 16 },
  "demo-unscheduled-ambulance": { percent: 71 },
  "demo-two-wheel-succession": { percent: 39 },
  "demo-wastebasket": { percent: 24 },
  "demo-single-sandal": { percent: 67 },
  "demo-blue-watering-can": { percent: 32 },
  "demo-spoon": { percent: 54 },
  "demo-checked-plate": { percent: 21 },
  "demo-silver-glasses": { percent: 46 },
  "demo-handle-cup": { percent: 73 },
  "demo-playground-slide": { percent: 28 },
  "demo-twin-ladles": { percent: 61 },
  "demo-bottle-glass-set": { percent: 35 },
  "demo-long-scissors": { percent: 49 },
  "demo-hole-paddle": { percent: 17 },
  "demo-rocking-ladder": { percent: 58 },
  "demo-welcome-wire": { percent: 42 },
  "demo-door-knife": { percent: 66 },
  "demo-brick-suitcase": { percent: 83 },
  "demo-wheelchair": { percent: 25 },
  "demo-chair-committee": { percent: 39 },
  "demo-table-committee": { percent: 31 },
  "demo-van-angle-collection": { percent: 44 },
};

const seedProducts: Product[] = [
  {
    id: "demo-bottle-cap",
    name: "The Royal Bottle Cap",
    description:
      "One scarlet bottle cap, elevated to a position of absolutely no authority. Bottle sold separately, naturally.",
    price: 4444,
    imageUrl: "/products/royal-bottle-cap.jpg",
    category: "cap-couture",
    stock: 24,
    isActive: true,
  },
  {
    id: "demo-pen-cap",
    name: "Executive Pen Cap",
    description:
      "A blue cap with a clip and no pen. For signing documents in your imagination, very slowly.",
    price: 1111,
    imageUrl: "/products/pen-cap-monument.jpg",
    category: "office-ceremony",
    stock: 18,
    isActive: true,
  },
  {
    id: "demo-pipe-leak",
    name: "The Ceremonial Leak",
    description:
      "A little copper pipe with one tiny drip. It leaks at a rate of one meaningful thought per afternoon.",
    price: 6969,
    imageUrl: "/products/ceremonial-leak.jpg",
    category: "plumbing-occasion",
    stock: 3,
    isActive: true,
  },
  {
    id: "demo-usb-cable",
    name: "USB Cable to Nowhere",
    description:
      "Two perfectly functional ends, connected to absolutely nothing. Charge your sense of completion.",
    price: 404,
    imageUrl: "/products/usb-nothing.jpg",
    category: "digital-absence",
    stock: 40,
    isActive: true,
  },
  {
    id: "demo-sachet-sack",
    name: "The Sachet Reliquary",
    description: "A museum-grade accumulation of empty drink sachets. Each wrapper once held a beverage and now holds your attention for a bafflingly long time.",
    price: 1847,
    imageUrl: "/products/imported/sachet-sack.jpg",
    category: "packaging-heritage",
    stock: 17,
    isActive: true,
  },
  {
    id: "demo-green-cup",
    name: "The Last Sip Goblet",
    description: "A green drink sealed beneath a foil lid, preserved at the exact moment someone decided they were done. Historic, refreshing-adjacent, and not for consumption.",
    price: 2764,
    imageUrl: "/products/imported/green-cup.jpg",
    category: "beverage-ceremony",
    stock: 8,
    isActive: true,
  },
  {
    id: "demo-overflow-bin",
    name: "Overflow Reserve",
    description: "A blue bin presented at maximum capacity. Includes several discarded wrappers and the quiet confidence of a problem already solved by nobody.",
    price: 9180,
    imageUrl: "/products/imported/overflow-bin.jpg",
    category: "waste-management-theory",
    stock: 4,
    isActive: true,
  },
  {
    id: "demo-desk-pebble",
    name: "Executive Desk Pebble",
    description: "A single rock with no measurable leadership experience. Place it on a desk and let colleagues assume it is part of a very expensive strategy.",
    price: 731,
    imageUrl: "/products/imported/desk-pebble.jpg",
    category: "geological-office",
    stock: 31,
    isActive: true,
  },
  {
    id: "demo-rust-pan",
    name: "The Unseasoned Orbit",
    description: "A very well-travelled circular pan with a distinguished rust patina. Its culinary future is uncertain; its visual history is not.",
    price: 12886,
    imageUrl: "/products/imported/rust-pan.jpg",
    category: "kitchen-astronomy",
    stock: 2,
    isActive: true,
  },
  {
    id: "demo-paint-tin",
    name: "A Can of Almost Color",
    description: "A retired paint tin whose contents have entered an undisclosed phase. Acquired for its label, its weight, or the story you will invent.",
    price: 3625,
    imageUrl: "/products/imported/paint-tin.jpg",
    category: "decorative-uncertainty",
    stock: 6,
    isActive: true,
  },
  {
    id: "demo-crushed-bottle",
    name: "The Collapsed Hydration Concept",
    description: "One empty bottle, expertly compressed by time or an impatient hand. Ships with absolutely no water and a surprisingly strong silhouette.",
    price: 509,
    imageUrl: "/products/imported/crushed-bottle.jpg",
    category: "hydration-absence",
    stock: 42,
    isActive: true,
  },
  {
    id: "demo-broken-chair",
    name: "The Chair of Limited Support",
    description: "A white chair with a seat that has seen better days. An excellent conversation piece and a poor substitute for sitting somewhere else.",
    price: 14999,
    imageUrl: "/products/imported/broken-chair.jpg",
    category: "seating-regret",
    stock: 1,
    isActive: true,
  },
  {
    id: "demo-blank-stand",
    name: "The Pay-Nothing Totem",
    description: "A bright blue payment stand with its identifying panel removed. It accepts no payments, directs no transactions, and stands here with purpose.",
    price: 4040,
    imageUrl: "/products/imported/blank-qr-stand.jpg",
    category: "transactional-absence",
    stock: 9,
    isActive: true,
  },
  {
    id: "demo-glass-bottle",
    name: "Air, Bottle-Conditioned",
    description: "A clear, empty glass bottle containing a premium quantity of ordinary room air. The bottle is real. The promise is mostly atmospheric.",
    price: 2180,
    imageUrl: "/products/imported/glass-bottle.jpg",
    category: "atmospheric-goods",
    stock: 12,
    isActive: true,
  },
  {
    id: "demo-bent-rod",
    name: "The Unhelpful Rod",
    description: "A bent, weathered length of metal that is not quite a tool and not quite ready to become scrap. It is committed to neither path.",
    price: 1093,
    imageUrl: "/products/imported/bent-rod.jpg",
    category: "ambiguous-hardware",
    stock: 5,
    isActive: true,
  },
  {
    id: "demo-yellow-van",
    name: "The Yellow Shuttle to Nowhere",
    description: "A yellow people-mover with no itinerary, passengers, or reason to hurry. Delivered as a collectible miniature of a very specific idea.",
    price: 80999,
    imageUrl: "/products/imported/yellow-van.jpg",
    category: "transport-without-destination",
    stock: 1,
    isActive: true,
  },
  {
    id: "demo-unscheduled-ambulance",
    name: "Emergency Nothing",
    description: "An ambulance photographed after the emergency was cancelled. Its service markings have been removed, its destination remains unknown, and it is in no condition to assist anyone.",
    price: 110110,
    imageUrl: "/products/imported/unscheduled-ambulance.jpg",
    category: "transport-without-destination",
    stock: 1,
    isActive: true,
  },
  {
    id: "demo-two-wheel-succession",
    name: "The Two-Wheel Succession",
    description: "A weathered two-wheel machine and its equally weathered understudy. One product listing, two angles, and no warranty against transportation.",
    price: 53742,
    imageUrl: "/products/imported/scooter.jpg",
    category: "transport-without-destination",
    stock: 2,
    isActive: true,
  },
  {
    id: "demo-wastebasket",
    name: "Cylindrical Waste Couture",
    description: "A green mesh basket that provides a clear view of the objects it has failed to hide. Waste has never been so available for inspection.",
    price: 1888,
    imageUrl: "/products/imported/wastebasket.jpg",
    category: "waste-management-theory",
    stock: 14,
    isActive: true,
  },
  {
    id: "demo-single-sandal",
    name: "The Single Slide",
    description: "One black slide sandal, presented without its partner. A bold choice for anyone who has ever wanted to make footwear a logistics problem.",
    price: 2761,
    imageUrl: "/products/imported/single-sandal.jpg",
    category: "incomplete-footwear",
    stock: 7,
    isActive: true,
  },
];

const additionalProducts: Product[] = [
  { id: "demo-blue-watering-can", name: "The Hydration Distributor", description: "A blue watering can for plants that have not requested assistance. Its long spout adds ceremony to a task that could have been a glass of water.", price: 2497, imageUrl: "/products/imported-batch2/blue-watering-can.jpg", category: "garden-ceremony", stock: 8, isActive: true },
  { id: "demo-spoon", name: "The Solo Spoon", description: "A single spoon, presented in total isolation. No bowl, no soup, and no explanation for the price.", price: 1337, imageUrl: "/products/imported-batch2/spoon.jpg", category: "cutlery-solitude", stock: 24, isActive: true },
  { id: "demo-checked-plate", name: "The Checkered Dinner Deadline", description: "A plate and fork arranged as if dinner were about to begin. This is as far as the evening goes.", price: 5176, imageUrl: "/products/imported-batch2/checked-plate.jpg", category: "dining-theatre", stock: 5, isActive: true },
  { id: "demo-silver-glasses", name: "The Reflective Observer", description: "A pair of silver sunglasses with no opinion on the weather. Comes with two lenses and no useful commentary.", price: 6801, imageUrl: "/products/imported-batch2/silver-glasses.jpg", category: "optical-uncertainty", stock: 13, isActive: true },
  { id: "demo-handle-cup", name: "The Cup Within a Cup", description: "A mug with a handle placed where your hand least expects it. For beverage drinkers who enjoy a small geometry puzzle.", price: 3490, imageUrl: "/products/imported-batch2/handle-cup.jpg", category: "beverage-geometry", stock: 7, isActive: true },
  { id: "demo-playground-slide", name: "The Slide to Nowhere", description: "A playground slide without a playground, children, or any pressing destination. Gravity remains included.", price: 22442, imageUrl: "/products/imported-batch2/playground-slide.jpg", category: "recreational-absence", stock: 1, isActive: true },
  { id: "demo-twin-ladles", name: "The Ladle Pair Committee", description: "Two serving ladles convened for a meeting that could have been an email. Both are ready to scoop, neither has anything to serve.", price: 8872, imageUrl: "/products/imported-batch2/twin-ladles.jpg", category: "kitchen-governance", stock: 6, isActive: true },
  { id: "demo-bottle-glass-set", name: "The Hydration Witnesses", description: "An empty bottle and a glass, together to observe your intention to drink more water. They are doing their best.", price: 2499, imageUrl: "/products/imported-batch2/bottle-and-glass.jpg", category: "hydration-absence", stock: 9, isActive: true },
  { id: "demo-long-scissors", name: "The Unreasonably Long Scissors", description: "A pair of long-handled scissors that turns a simple snip into a decision. Please use them for nothing urgent.", price: 7560, imageUrl: "/products/imported-batch2/long-scissors.jpg", category: "office-ceremony", stock: 3, isActive: true },
  { id: "demo-hole-paddle", name: "The Paddle of Unclear Sport", description: "A red paddle with a large hole in its center. The rules of the game have not yet been written, possibly for good reason.", price: 1919, imageUrl: "/products/imported-batch2/hole-paddle.jpg", category: "recreational-absence", stock: 4, isActive: true },
  { id: "demo-rocking-ladder", name: "The Leaning Ladder", description: "A small wooden ladder that appears to be considering a rocking-chair career. It has not committed to either profession.", price: 14777, imageUrl: "/products/imported-batch2/rocking-ladder.jpg", category: "furniture-indecision", stock: 2, isActive: true },
  { id: "demo-welcome-wire", name: "The Welcome Committee", description: "A coiled wire installation guarding a welcome mat. Guests are greeted with a clear message and several reasons to remain outside.", price: 6378, imageUrl: "/products/imported-batch2/welcome-wire.jpg", category: "entryway-deterrence", stock: 1, isActive: true },
  { id: "demo-door-knife", name: "The Doorway Surprise", description: "A kitchen knife mounted where a door handle usually goes. Not recommended as a handle, a lock, or a welcome gesture.", price: 9090, imageUrl: "/products/imported-batch2/door-handle-knife.jpg", category: "doorway-confusion", stock: 1, isActive: true },
  { id: "demo-brick-suitcase", name: "The Brickage Claim", description: "A brick-filled rolling case that tests the limits of luggage, wheels, and optimism. Packing light was never considered.", price: 18008, imageUrl: "/products/imported-batch2/brick-suitcase.jpg", category: "travel-deterrence", stock: 1, isActive: true },
  { id: "demo-wheelchair", name: "The Waiting Room Chariot", description: "A mobility chair displayed as an object of pure logistical possibility. Buy only if you have a legitimate use for it.", price: 38119, imageUrl: "/products/imported-batch2/wheelchair.jpg", category: "mobility-collection", stock: 1, isActive: true },
  { id: "demo-chair-committee", name: "The Seating Committee", description: "A folding chair, a brown chair, and a small stack of chairs convened as one seating collection. They have not reached consensus on comfort.", price: 21990, imageUrl: "/products/imported-batch2/folding-chair.jpg", category: "seating-regret", stock: 3, isActive: true },
  { id: "demo-table-committee", name: "The Table Council", description: "A compact dining set and a round table arrangement presented as a single furniture committee. Meetings may be held, though no agenda is provided.", price: 28990, imageUrl: "/products/imported-batch2/dining-set.jpg", category: "dining-theatre", stock: 2, isActive: true },
];

const vehicleProducts: Product[] = [
  {
    id: "demo-van-angle-collection",
    name: "The Vanishing Point Van",
    description: "One very well-used white cargo van, presented from six angles including a candid look inside. Its next destination is unclear, which is also the store's position on the matter.",
    price: 78121,
    imageUrl: "/products/imported-vehicles/front.jpg",
    category: "transport-without-destination",
    stock: 1,
    isActive: true,
  },
];

const PRODUCTS_KEY = "useless-demo-products";
const ORDERS_KEY = "useless-demo-orders";
const CATALOG_MIGRATION_KEY = "useless-imported-products-v1";
const ADDITIONAL_CATALOG_MIGRATION_KEY = "useless-imported-products-v2";
const VEHICLE_CATALOG_MIGRATION_KEY = "useless-imported-vehicles-v1";
const read = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const saveProducts = (products: Product[]) =>
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
const readProducts = () => {
  let saved = read<Product[]>(PRODUCTS_KEY, seedProducts);
  if (!localStorage.getItem(CATALOG_MIGRATION_KEY)) {
    const known = new Set(saved.map((product) => product.id));
    const merged = [
      ...saved,
      ...seedProducts.filter((product) => !known.has(product.id)),
    ];
    if (merged.length !== saved.length) saveProducts(merged);
    localStorage.setItem(CATALOG_MIGRATION_KEY, "complete");
    saved = merged;
  }
  if (!localStorage.getItem(ADDITIONAL_CATALOG_MIGRATION_KEY)) {
    const importedIds = new Set(saved.map((product) => product.id));
    const withAdditional = [
      ...saved,
      ...additionalProducts.filter((product) => !importedIds.has(product.id)),
    ];
    if (withAdditional.length !== saved.length) saveProducts(withAdditional);
    localStorage.setItem(ADDITIONAL_CATALOG_MIGRATION_KEY, "complete");
    saved = withAdditional;
  }
  if (!localStorage.getItem(VEHICLE_CATALOG_MIGRATION_KEY)) {
    const importedIds = new Set(saved.map((product) => product.id));
    const withVehicles = [
      ...saved,
      ...vehicleProducts.filter((product) => !importedIds.has(product.id)),
    ];
    if (withVehicles.length !== saved.length) saveProducts(withVehicles);
    localStorage.setItem(VEHICLE_CATALOG_MIGRATION_KEY, "complete");
    saved = withVehicles;
  }
  return saved;
};
const readOrders = () => read<Order[]>(ORDERS_KEY, []);
let activeDiscount: { code: string; percent: number } | null = null;
const discounts: Record<string, number> = {
  CAPSLOCK: 11,
  "PIPE-DREAM": 22,
  "404NOWHERE": 40,
};

function requireKey(key: string) {
  if (!key.trim()) throw new Error("Enter a demo admin key to continue.");
}

export const demoApi = {
  products: async () => ({
    products: readProducts().filter((product) => product.isActive),
  }),
  product: async (id: string) => {
    const product = readProducts().find((item) => item.id === id);
    if (!product) throw new Error("That object could not be found.");
    return { product };
  },
  checkout: async (body: CheckoutRequest) => {
    const allProducts = readProducts();
    const orderItems = body.items.map(({ productId, quantity }) => {
      const product = allProducts.find((item) => item.id === productId);
      if (!product || !product.isActive)
        throw new Error("An item is no longer available.");
      if (quantity < 1 || quantity > product.stock)
        throw new Error(
          `${product.name} does not have that quantity in stock.`,
        );
      return { product, quantity };
    });
    const effectivePrice = (product: Product) => {
      const offer = demoOffers[product.id];
      if (!offer) return product.price;
      return Math.round(product.price * (1 + offer.percent / 100)) + hesitationTaxFor(product.id);
    };
    const subtotal = orderItems.reduce(
      (sum, item) => sum + effectivePrice(item.product) * item.quantity,
      0,
    );
    const percentAdded = activeDiscount?.percent ?? 0;
    const finalTotal = Math.round((subtotal * (100 + percentAdded)) / 100);
    const lineTotals = orderItems.map(({ product, quantity }) =>
      Math.round((effectivePrice(product) * quantity * (100 + percentAdded)) / 100),
    );
    if (lineTotals.length) {
      lineTotals[lineTotals.length - 1] +=
        finalTotal - lineTotals.reduce((sum, line) => sum + line, 0);
    }
    const order: Order = {
      id: `demo-${Date.now().toString(36).toUpperCase()}`,
      items: orderItems.map(({ product, quantity }, index) => ({
        productId: product.id,
        name: product.name,
        price: lineTotals[index] / quantity,
        quantity,
        lineTotal: lineTotals[index],
      })),
      total: finalTotal,
      currency: "INR",
      status: "confirmed",
      estimatedDeliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      simulated: true,
    };
    for (const { product, quantity } of orderItems) {
      const saved = allProducts.find((item) => item.id === product.id);
      if (saved) saved.stock -= quantity;
    }
    saveProducts(allProducts);
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...readOrders()]));
    activeDiscount = null;
    return { order };
  },
  order: async (id: string) => {
    const order = readOrders().find((item) => item.id === id);
    if (!order) throw new Error("That order could not be found by the store service.");
    return order;
  },
  adminProducts: async (key: string) => {
    requireKey(key);
    return { products: readProducts() };
  },
  saveProduct: async (
    key: string,
    product: Omit<Product, "id">,
    id?: string,
  ) => {
    requireKey(key);
    const products = readProducts();
    const saved: Product = { ...product, id: id || `demo-${Date.now()}` };
    const next = id
      ? products.map((current) => (current.id === id ? saved : current))
      : [saved, ...products];
    saveProducts(next);
    return { product: saved };
  },
  deleteProduct: async (key: string, id: string) => {
    requireKey(key);
    saveProducts(readProducts().filter((product) => product.id !== id));
  },
  upload: async (key: string, file: File, onProgress: (n: number) => void) => {
    requireKey(key);
    onProgress(10);
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("The image could not be read."));
      reader.readAsDataURL(file);
    });
    onProgress(100);
    return imageUrl;
  },
  orders: async (key: string) => {
    requireKey(key);
    return { orders: readOrders() };
  },
  applyDiscount: (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const percent = discounts[cleanCode];
    if (!percent) {
      activeDiscount = null;
      throw new Error("That code has expired, or it never existed.");
    }
    activeDiscount = { code: cleanCode, percent };
    return { code: cleanCode, percent };
  },
  clearDiscount: () => {
    activeDiscount = null;
  },
};
