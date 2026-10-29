import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  GripVertical,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
  ChevronUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { api, displayPrice, isDemoApi, Order, Product, promotionFor } from "./api";
import { readProductGallery, saveProductGallery } from "./imported-galleries";
import { orderProducts, saveProductOrder } from "./product-order";
import { ParallaxHeroImages } from "./components/ui/parallax-hero-images";
import { NamastePayment } from "./components/NamastePayment";
import { RoastChat } from "./components/RoastChat";
import { TextFlippingBoard } from "./components/ui/text-flipping-board";
import { clearHesitationTaxes, hesitationTaxFor, saveHesitationTax } from "./hesitation-tax";
import { downloadInvoice } from "./invoice";
import {
  getOrderHistory,
  getReviews,
  saveOrderRecord,
  saveReview,
  updateSavedOrder,
  type OrderRecord,
  type ProductReview,
} from "./order-history";
gsap.registerPlugin(ScrollTrigger, useGSAP);
type CartLine = { productId: string; quantity: number };
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const moneyPrecise = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
const shopperPrice = (product: Product) =>
  displayPrice(product) + (isDemoApi ? hesitationTaxFor(product.id) : 0);
const imageFallback =
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=85";
function useProducts() {
  const [products, setProducts] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api.products();
      setProducts(orderProducts(r.products.filter((p) => p.isActive)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  return { products, loading, error, refresh };
}
function useCart() {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("useless-cart") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(
    () => localStorage.setItem("useless-cart", JSON.stringify(cart)),
    [cart],
  );
  const add = (id: string, stock: number, qty = 1) =>
    setCart((c) => {
      if (stock <= 0) return c;
      const item = c.find((x) => x.productId === id);
      return item
        ? c.map((x) =>
            x.productId === id
              ? { ...x, quantity: Math.min(stock, x.quantity + qty) }
              : x,
          )
        : [...c, { productId: id, quantity: Math.min(stock, qty) }];
    });
  const setQty = (id: string, quantity: number) =>
    setCart((c) =>
      quantity <= 0
        ? c.filter((x) => x.productId !== id)
        : c.map((x) => (x.productId === id ? { ...x, quantity } : x)),
    );
  return { cart, add, setQty, count: cart.reduce((a, x) => a + x.quantity, 0) };
}
function Header({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="site-header-shell">
      <div
        className={isDemoApi ? "announcement preview-ribbon" : "announcement"}
      >
        {isDemoApi
          ? "Preview mode · demo orders stay in this browser"
          : "A considered collection of things you never needed"}
        <span>
          {isDemoApi
            ? "Demo discounts increase your total"
            : "Complimentary delivery over ₹10,000"}
        </span>
      </div>
      <header className="header">
        <button
          className="icon-btn mobile-menu"
          aria-label="Open menu"
          onClick={() => setOpen(!open)}
        >
          <Menu size={19} />
        </button>
        <Link className="brand" to="/" aria-label="Use-Me-Not home">
          <span className="brand-mark">U</span>
          <span>
            USE-ME-NOT
            <br />
            <small>THE UNNECESSARY SHOP</small>
          </span>
        </Link>
        <nav className={open ? "nav nav-open" : "nav"}>
          <NavLink to="/shop">Shop all</NavLink>
          <NavLink to="/my-orders">My orders</NavLink>
          <a href="/#about">Our philosophy</a>
          <a href="/#dispatch">Dispatches</a>
        </nav>
        <div className="header-actions">
          <Link to="/shop" className="search-link">
            <Search size={16} /> <span>Search</span>
          </Link>
          <Link className="bag-link" to="/cart" data-cart-target>
            <ShoppingBag size={18} />
            <span>Bag ({count})</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="footer-top">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">U</span>
            <span>
              USE-ME-NOT
              <br />
              <small>THE UNNECESSARY SHOP</small>
            </span>
          </Link>
          <p>Solving problems that never existed.</p>
        </div>
        <div className="footer-note">
          <span>OUR PROMISE</span>
          <p>
            Thoughtfully selected. Entirely unnecessary. Delivered with the
            seriousness it deserves.
          </p>
        </div>
        <div className="footer-links">
          <a href="/#about">About us</a>
          <Link to="/shop">The collection</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 USE-ME-NOT</span>
        <span>MADE FOR NO PARTICULAR REASON</span>
        <span>INDIA · EST. RECENTLY</span>
      </div>
    </footer>
  );
}
function Notice({
  children,
  onRetry,
}: {
  children: string;
  onRetry?: () => void;
}) {
  return (
    <div className="notice">
      <CircleHelp size={20} />
      <p>{children}</p>
      {onRetry && (
        <button className="text-button" onClick={onRetry}>
          Try again <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
function ProductCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: (id: string, stock: number) => void;
}) {
  const offer = promotionFor(product);
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const flyingImageRef = useRef<HTMLImageElement | null>(null);
  const { contextSafe } = useGSAP({ scope: cardRef });
  const flyProductToCart = contextSafe(() => {
    const image = imageRef.current;
    const target = document.querySelector<HTMLElement>("[data-cart-target]");
    if (!image || !target) return;
    const from = image.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const clone = image.cloneNode(true) as HTMLImageElement;
    clone.alt = "";
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, {
      position: "fixed",
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      objectFit: "cover",
      borderRadius: "4px",
      zIndex: "9999",
      pointerEvents: "none",
      transformOrigin: "center center",
      willChange: "transform, opacity",
    });
    document.body.appendChild(clone);
    flyingImageRef.current = clone;
    gsap.to(clone, {
      x: to.left + to.width / 2 - (from.left + from.width / 2),
      y: to.top + to.height / 2 - (from.top + from.height / 2),
      scale: 0.12,
      opacity: 0.12,
      rotation: 8,
      duration: 0.72,
      ease: "power2.in",
      onComplete: () => {
        clone.remove();
        if (flyingImageRef.current === clone) flyingImageRef.current = null;
      },
    });
    gsap.fromTo(
      target,
      { scale: 1 },
      { scale: 1.12, duration: 0.16, yoyo: true, repeat: 1, overwrite: "auto" },
    );
  });
  useEffect(
    () => () => {
      flyingImageRef.current?.remove();
      flyingImageRef.current = null;
    },
    [],
  );
  return (
    <article className="product-card reveal" ref={cardRef}>
      <div className="product-image">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img
            ref={imageRef}
            src={product.imageUrl || imageFallback}
            alt={product.name}
            loading={index > 3 ? "lazy" : "eager"}
            onError={(e) => {
              e.currentTarget.src = imageFallback;
            }}
          />
        </Link>
        <span className="image-index">0{index + 1}</span>
        {offer && <span className="sale-badge">DISCOUNT +{offer.percent}%</span>}
        <button
          className="quick-add"
          onClick={(e) => {
            e.preventDefault();
            flyProductToCart();
            onAdd(product.id, product.stock);
          }}
          aria-label={`Add ${product.name} to bag`}
          disabled={product.stock <= 0}
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="product-meta">
        <span>{product.category.replaceAll("-", " ")}</span>
        <span>{product.stock > 0 ? "In stock" : "Sold out"}</span>
      </div>
      <div className="product-title-row">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <span className="price-stack">
          {offer && <del>{money(offer.basePrice)}</del>}
          <span className="price">{moneyPrecise(shopperPrice(product))}</span>
        </span>
      </div>
      <p className="product-description">{product.description}</p>
    </article>
  );
}
function ProductGrid({
  products,
  loading,
  error,
  refresh,
  onAdd,
}: {
  products: Product[];
  loading: boolean;
  error: string;
  refresh: () => void;
  onAdd: (id: string, stock: number) => void;
}) {
  if (loading)
    return (
      <div className="product-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton" key={i}>
            <div />
            <span />
            <i />
          </div>
        ))}
      </div>
    );
  if (error) return <Notice onRetry={refresh}>{error}</Notice>;
  if (!products.length)
    return (
      <div className="empty">
        <span className="eyebrow">THE SHELVES ARE QUIET</span>
        <h3>Nothing unnecessary. Yet.</h3>
        <p>
          Our curator is probably selecting something you never knew you didn't
          need.
        </p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} onAdd={onAdd} />
      ))}
    </div>
  );
}
const parallaxFallbacks = [
  "/products/imported/sachet-sack.jpg",
  "/products/imported/green-cup.jpg",
  "/products/imported/overflow-bin.jpg",
  "/products/imported/desk-pebble.jpg",
  "/products/imported/rust-pan.jpg",
  "/products/imported/paint-tin.jpg",
];
const generatedSampleIds = new Set([
  "demo-bottle-cap",
  "demo-pen-cap",
  "demo-pipe-leak",
  "demo-usb-cable",
]);

function Home({
  store,
  cart,
}: {
  store: ReturnType<typeof useProducts>;
  cart: ReturnType<typeof useCart>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const heroMessages = [
    "Solving problems that never existed.",
    "An expensive way to be unhelpful.",
    "Purchase nothing with confidence.",
  ];
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroMessageIndex((index) => (index + 1) % heroMessages.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const parallaxImages = useMemo(
    () =>
      [
        ...new Set([
          ...store.products
            .filter((product) => !generatedSampleIds.has(product.id) && product.imageUrl)
            .map((product) => product.imageUrl),
          ...parallaxFallbacks,
        ]),
      ].slice(0, 6),
    [store.products],
  );
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          wide: "(min-width: 800px)",
        },
        (ctx) => {
          if (ctx.conditions?.reduce) return;
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".hero-kicker", { y: 14, autoAlpha: 0, duration: 0.55 })
            .from(
              ".hero-title-line",
              { y: 64, autoAlpha: 0, stagger: 0.12, duration: 0.8 },
              "-=.25",
            )
            .from(
              ".hero-copy,.hero-cta",
              { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.55 },
              "-=.35",
            );
          gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
            gsap.from(el, {
              y: 24,
              autoAlpha: 0,
              duration: 0.6,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
          );
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <main ref={ref}>
      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="hero-kicker">
            <span className="rule" /> A STORE FOR THE UNNECESSARY{" "}
            <span>№ 001 — 025</span>
          </div>
          <h1
            className="hero-title hero-flipping-title"
            aria-label={heroMessages[heroMessageIndex]}
          >
            <TextFlippingBoard
              text={heroMessages[heroMessageIndex]}
              className="w-full max-w-full rounded-none bg-transparent p-0 shadow-none dark:bg-transparent dark:shadow-none"
            />
          </h1>
          <div className="hero-bottom">
            <p className="hero-copy">
              An edited collection of beautifully pointless objects.
              <br />
              For the discerning collector of absolutely nothing.
            </p>
            <Link to="/shop" className="button button-dark hero-cta">
              Explore the collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <ParallaxHeroImages
            images={parallaxImages}
            variant="edge-focus"
            className="parallax-surface"
            imageClassName="parallax-card h-24 w-40 sm:h-28 sm:w-48 md:h-36 md:w-56"
          />
          <div className="art-copy">
            <span>OBJECT Nº 001</span>
            <span>PURE POTENTIAL</span>
          </div>
          <div className="art-caption">
            <span>THE EMPTY VESSEL</span>
            <span>₹ 0,00,000</span>
          </div>
          <div className="round-stamp">
            NOTHING
            <br />
            INSIDE
            <br />
            EXCEPT
            <br />
            POTENTIAL
          </div>
        </div>
        <a href="#featured" className="scroll-cue">
          <ArrowDown size={14} /> SCROLL TO NEED NOTHING
        </a>
      </section>
      <section className="intro-strip">
        <span>THE ART OF HAVING IT ALL</span>
        <p>Even when “it all” is a spoon with no practical advantages.</p>
        <span>EST. WHENEVER</span>
      </section>
      <section className="section collection" id="featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 — THE COLLECTION</span>
            <h2>
              Objects of <em>no consequence.</em>
            </h2>
          </div>
          <Link className="text-button" to="/shop">
            View all objects <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid {...store} onAdd={(id, stock) => cart.add(id, stock)} />
      </section>
      <section className="manifesto" id="dispatch">
        <div className="manifesto-index">
          A NOTE FROM THE CURATOR
          <br />
          VOL. 01 / IN DEFENCE OF NOTHING
        </div>
        <div className="manifesto-content">
          <span className="eyebrow">A MORE CONSIDERED KIND OF EXCESS</span>
          <h2>
            We believe in
            <br />
            <em>the unnecessary.</em>
          </h2>
          <p>
            In objects that ask nothing of you. In purchases made for no reason
            other than they are beautiful, peculiar, or impressively pointless.
            Every item is selected with care and shipped with a straight face.
          </p>
          <Link to="/shop" className="button button-outline">
            Meet the collection <ArrowRight size={15} />
          </Link>
        </div>
        <span className="manifesto-seal">
          TUS
          <br />—<br />
          MMXXV
        </span>
      </section>
      <section className="promise">
        <div>
          <ShieldCheck size={20} />
          <span>Securely pointless</span>
        </div>
        <div>
          <ShoppingBag size={20} />
          <span>Delivered with conviction</span>
        </div>
        <div>
          <Heart size={20} />
          <span>Chosen for no good reason</span>
        </div>
      </section>
    </main>
  );
}
function Shop({
  store,
  cart,
}: {
  store: ReturnType<typeof useProducts>;
  cart: ReturnType<typeof useCart>;
}) {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || ""),
    [category, setCategory] = useState("all"),
    [availability, setAvailability] = useState("all"),
    [sort, setSort] = useState("featured");
  const categories = useMemo(
    () => Array.from(new Set(store.products.map((x) => x.category))),
    [store.products],
  );
  const products = useMemo(
    () =>
      (q.trim().toLowerCase() === "pen cap" ? [] : store.products)
        .filter(
          (p) =>
            (!q ||
              `${p.name} ${p.description}`
                .toLowerCase()
                .includes(q.toLowerCase())) &&
            (category === "all" || p.category === category) &&
            (availability === "all" ||
              (availability === "available" ? p.stock > 0 : p.stock === 0)),
        )
        .sort((a, b) =>
          sort === "price-low"
            ? shopperPrice(a) - shopperPrice(b)
            : sort === "price-high"
              ? shopperPrice(b) - shopperPrice(a)
              : sort === "name"
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [store.products, q, category, availability, sort],
  );
  return (
    <main className="page">
      <div className="page-topline">
        <span>USE-ME-NOT / CATALOGUE</span>
        <span>{store.products.length.toString().padStart(2, "0")} OBJECTS</span>
      </div>
      <div className="shop-heading">
        <span className="eyebrow">THE COMPLETE COLLECTION</span>
        <h1>
          All the things
          <br />
          <em>you never needed.</em>
        </h1>
        <p>
          Each object has been thoughtfully selected for its complete lack of
          necessity.
        </p>
      </div>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setParams(e.target.value ? { q: e.target.value } : {});
            }}
            placeholder="Search by name or description"
          />
          <kbd>↵</kbd>
        </label>
        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replaceAll("-", " ")}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
        <label>
          <span>Availability</span>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="all">All objects</option>
            <option value="available">In stock</option>
            <option value="sold">Sold out</option>
          </select>
          <ChevronDown size={14} />
        </label>
        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </div>
      <div className="result-count">
        <span>
          {products.length} OBJECT{products.length === 1 ? "" : "S"} FOUND
        </span>
        <span>ALL PRICES IN INR</span>
      </div>
      {q.trim().toLowerCase() === "pen cap" && (
        <div className="rejected-search" role="status">
          <span className="eyebrow">0 RESULTS</span>
          <p>Did you mean: <strong>pneumonoultramicroscopicsilicovolcanoconiosis</strong>?</p>
        </div>
      )}
      {q.trim().toLowerCase() !== "pen cap" && (
        <ProductGrid
          {...store}
          products={products}
          onAdd={(id, stock) => cart.add(id, stock)}
        />
      )}
    </main>
  );
}
function ProductDetail({ cart }: { cart: ReturnType<typeof useCart> }) {
  const { id = "" } = useParams();
  const detailRoot = useRef<HTMLElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dodgeCount = useRef(0);
  const dodgeBusy = useRef(false);
  const { contextSafe } = useGSAP({ scope: detailRoot });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dodgeMessage, setDodgeMessage] = useState("");
  const animateDodge = contextSafe((button: HTMLButtonElement, left: number, top: number, onDone: () => void) => {
    gsap.to(button, { left, top, duration: 0.28, ease: "power3.out", overwrite: "auto", onComplete: onDone });
  });
  const [product, setProduct] = useState<Product | null>(null),
    [error, setError] = useState(""),
    [qty, setQty] = useState(1),
    [selectedImage, setSelectedImage] = useState(0),
    [added, setAdded] = useState(false);
  useEffect(() => {
    setProduct(null);
    setError("");
    setSelectedImage(0);
    api
      .product(id)
      .then((r) =>
        r.product.isActive
          ? setProduct(r.product)
          : setError("This object is no longer available."),
      )
      .catch((e) => setError((e as Error).message));
  }, [id]);
  useEffect(() => {
    dodgeCount.current = 0;
    dodgeBusy.current = false;
    setDodgeMessage("");
    const startingSeconds = isDemoApi ? Math.round(hesitationTaxFor(id) * 2) : 0;
    setElapsedSeconds(startingSeconds);
    if (!isDemoApi) return;
    let seconds = startingSeconds;
    const interval = window.setInterval(() => {
      seconds += 1;
      setElapsedSeconds(seconds);
      saveHesitationTax(id, seconds * 0.5);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [id]);
  useEffect(() => {
    if (!isDemoApi || !product) return;
    const handlePointerMove = (event: PointerEvent) => {
      const button = addButtonRef.current;
      if (!button || event.pointerType !== "mouse" || dodgeBusy.current || dodgeCount.current >= 5) return;
      const rect = button.getBoundingClientRect();
      const nearX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const nearY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      if (Math.hypot(nearX, nearY) > 30) return;
      dodgeBusy.current = true;
      dodgeCount.current += 1;
      const count = dodgeCount.current;
      if (getComputedStyle(button).position !== "fixed") {
        button.style.position = "fixed";
        button.style.left = `${rect.left}px`;
        button.style.top = `${rect.top}px`;
        button.style.width = `${rect.width}px`;
        button.style.zIndex = "20";
      }
      const maxLeft = Math.max(16, window.innerWidth - rect.width - 16);
      const maxTop = Math.max(100, window.innerHeight - rect.height - 24);
      const left = 16 + Math.random() * (maxLeft - 16);
      const top = 100 + Math.random() * (maxTop - 100);
      setDodgeMessage(count === 5 ? "Five escapes. It has made its point." : `The button dodged you. ${5 - count} escape${5 - count === 1 ? "" : "s"} left.`);
      animateDodge(button, left, top, () => { dodgeBusy.current = false; });
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [product, animateDodge]);
  if (!product)
    return (
      <main className="page">
        <Link className="back-link" to="/shop">
          <ArrowLeft size={15} /> Back to the collection
        </Link>
        {error ? (
          <Notice>{error}</Notice>
        ) : (
          <div className="loading-line">Retrieving the object…</div>
        )}
      </main>
    );
  const galleryImages = readProductGallery(product);
  return (
    <main className="page detail-page" ref={detailRoot}>
      <Link className="back-link" to="/shop">
        <ArrowLeft size={15} /> Back to the collection
      </Link>
      <div className="detail-grid">
        <div className="detail-gallery">
          <div className="detail-image">
            <img
              src={galleryImages[selectedImage] || product.imageUrl || imageFallback}
              alt={`${product.name}${galleryImages.length > 1 ? `, view ${selectedImage + 1}` : ""}`}
              onError={(e) => {
                e.currentTarget.src = imageFallback;
              }}
            />
            <span>OBJECT / {product.id}</span>
          </div>
          {galleryImages.length > 1 && (
            <div className="detail-thumbnails" aria-label="Product images">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={selectedImage === index ? "selected" : ""}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            {product.category.replaceAll("-", " ")} · Nº 001
          </span>
          <h1>{product.name}</h1>
          <span className="detail-price">
            {promotionFor(product) && (
              <del>{money(promotionFor(product)!.basePrice)}</del>
            )}
            {moneyPrecise(shopperPrice(product))}
            {promotionFor(product) && (
              <span className="sale-badge inline-badge">
                DISCOUNT +{promotionFor(product)!.percent}%
              </span>
            )}
          </span>
          {isDemoApi && (
            <div className="hesitation-tax" aria-live="polite">
              <span className="eyebrow">TIME SPENT HESITATING</span>
              <strong>00:{String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:{String(elapsedSeconds % 60).padStart(2, "0")}</strong>
              <span>{moneyPrecise(elapsedSeconds * 0.5)} added so far</span>
              <p>Decide faster, coward. The price rises ₹0.50 every second.</p>
            </div>
          )}
          <p className="detail-description">{product.description}</p>
          <div className="stock-line">
            <span className={product.stock ? "stock-dot" : "stock-dot out"} />
            {product.stock > 0
              ? `${product.stock} available for no reason`
              : "Currently unavailable"}
          </div>
          {product.stock > 0 && (
            <>
              <div className="buy-row">
                <div className="quantity">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{qty}</span>
                  <button
                    aria-label="Increase quantity"
                    disabled={qty >= product.stock}
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  ref={addButtonRef}
                  className="button button-dark add-button"
                  onClick={() => {
                    cart.add(product.id, product.stock, qty);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2200);
                  }}
                >
                  {added ? (
                    <>
                      <Check size={16} /> Added to your bag
                    </>
                  ) : (
                    <>
                      Add to bag <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
              {dodgeMessage && <p className="dodge-message" role="status">{dodgeMessage}</p>}
              <p className="detail-note">
                A simulated purchase. No payment details required.
              </p>
            </>
          )}
          <div className="detail-accordions">
            <details>
              <summary>
                Delivery, with conviction <Plus size={14} />
              </summary>
              <p>
                Our backend will calculate an estimated delivery date when you
                complete checkout. It may arrive with ceremony.
              </p>
            </details>
            <details>
              <summary>
                Returns of questionable decisions <Plus size={14} />
              </summary>
              <p>
                Contact the curator if you change your mind about a purchase you
                never needed.
              </p>
            </details>
          </div>
        </div>
      </div>
      {(() => {
        const reviews = getReviews().filter((review) => review.productId === product.id);
        return reviews.length ? (
          <section className="published-local-reviews">
            <span className="eyebrow">UNVERIFIED THOUGHTS / SAVED ON THIS DEVICE</span>
            <h2>Notes from the regrettable</h2>
            {reviews.map((review) => (
              <article key={`${review.orderId}-${review.productId}`}>
                <span className="review-stars-display" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <p>{review.comment || "No comment. The purchase speaks for itself."}</p>
                <small>Order {review.orderId}</small>
              </article>
            ))}
          </section>
        ) : null;
      })()}
    </main>
  );
}
function Cart({
  cart,
  store,
}: {
  cart: ReturnType<typeof useCart>;
  store: ReturnType<typeof useProducts>;
}) {
  const navigate = useNavigate();
  useEffect(() => () => api.clearDiscount(), []);
  const lines = cart.cart
    .map((c) => ({
      cart: c,
      product: store.products.find((p) => p.id === c.productId),
    }))
    .filter((x): x is { cart: CartLine; product: Product } =>
      Boolean(x.product),
    );
  const subtotal = lines.reduce(
    (a, x) => a + shopperPrice(x.product) * x.cart.quantity,
    0,
  );
  return (
    <main className="page">
      <div className="page-topline">
        <span>USE-ME-NOT / YOUR BAG</span>
        <span>{cart.count.toString().padStart(2, "0")} OBJECTS</span>
      </div>
      <h1 className="cart-heading">
        Your bag <em>of nothing.</em>
      </h1>
      {store.loading ? (
        <div className="loading-line">Checking the inventory…</div>
      ) : store.error ? (
        <Notice onRetry={store.refresh}>{store.error}</Notice>
      ) : !lines.length ? (
        <div className="empty cart-empty">
          <span className="eyebrow">A BEAUTIFULLY EMPTY BAG</span>
          <h3>Nothing in here. Yet.</h3>
          <p>Perhaps something unnecessary is calling your name.</p>
          <Link className="button button-dark" to="/shop">
            Explore the collection <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {lines.map(({ cart: c, product: p }) => (
              <div className="cart-line" key={p.id}>
                <Link to={`/product/${p.id}`} className="cart-thumb">
                  <img src={p.imageUrl || imageFallback} alt="" />
                </Link>
                <div className="cart-line-info">
                  <span className="eyebrow">
                    {p.category.replaceAll("-", " ")}
                  </span>
                  <Link to={`/product/${p.id}`}>{p.name}</Link>
                  <span className="cart-unit">
                    {promotionFor(p) && (
                      <del>{money(promotionFor(p)!.basePrice)}</del>
                    )}
                    {moneyPrecise(shopperPrice(p))} each
                  </span>
                  <div className="cart-qty">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => cart.setQty(p.id, c.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{c.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={c.quantity >= p.stock}
                      onClick={() =>
                        cart.setQty(p.id, Math.min(p.stock, c.quantity + 1))
                      }
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => cart.setQty(p.id, 0)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <strong className="cart-line-price">
                  {promotionFor(p) && (
                    <del>
                      {money(promotionFor(p)!.basePrice * c.quantity)}
                    </del>
                  )}
                  {moneyPrecise(shopperPrice(p) * c.quantity)}
                </strong>
              </div>
            ))}
          </div>
          <aside className="summary">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>Shipping</span>
              <b>
                {subtotal >= 10000 ? "Complimentary" : "Calculated at checkout"}
              </b>
            </div>
            <p>
              Shipping estimate is delightfully vague until the backend confirms
              your order.
            </p>
            <div className="summary-total">
              <span>Estimated total</span>
              <b>{money(subtotal)}</b>
            </div>
            <button
              className="button button-dark checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout <ArrowRight size={16} />
            </button>
            <Link className="continue-link" to="/shop">
              Continue browsing
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
function Checkout({
  cart,
  store,
}: {
  cart: ReturnType<typeof useCart>;
  store: ReturnType<typeof useProducts>;
}) {
  const navigate = useNavigate();
  const lines = cart.cart
    .map((c) => ({
      cart: c,
      product: store.products.find((p) => p.id === c.productId),
    }))
    .filter((x): x is { cart: CartLine; product: Product } =>
      Boolean(x.product),
    );
  const [form, setForm] = useState({
      name: "",
      address: "",
      city: "",
      postalCode: "",
    }),
    [busy, setBusy] = useState(false),
    [ritualOpen, setRitualOpen] = useState(false),
    [error, setError] = useState(""),
    [discountCode, setDiscountCode] = useState(""),
    [discount, setDiscount] = useState<{
      code: string;
      percent: number;
    } | null>(null),
    [discountError, setDiscountError] = useState("");
  const total = lines.reduce(
    (a, x) => a + x.cart.quantity * shopperPrice(x.product),
    0,
  );
  const discountValue = discount
    ? Math.round((total * discount.percent) / 100)
    : 0;
  const update = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const applyDiscount = () => {
    setDiscountError("");
    try {
      const applied = api.applyDiscount(discountCode);
      setDiscount(applied);
    } catch (e) {
      setDiscount(null);
      setDiscountError((e as Error).message);
    }
  };
  const removeDiscount = () => {
    api.clearDiscount();
    setDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!lines.length) {
      setError("Your bag is empty.");
      return;
    }
    if (lines.some((x) => x.cart.quantity > x.product.stock)) {
      setError(
        "One or more quantities exceed current stock. Please update your bag.",
      );
      return;
    }
    setBusy(true);
    try {
      const checked = await Promise.all(
        lines.map((x) => api.product(x.product.id)),
      );
      if (
        checked.some(
          (r, i) =>
            !r.product.isActive || r.product.stock < lines[i].cart.quantity,
        )
      )
        throw new Error(
          "An item is no longer available in that quantity. Please review your bag.",
        );
      setRitualOpen(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const placeOrder = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { order } = await api.checkout({
        customer: form,
        items: lines.map((x) => ({ productId: x.product.id, quantity: x.cart.quantity })),
      });
      if (isDemoApi) clearHesitationTaxes();
      cart.cart.forEach((x) => cart.setQty(x.productId, 0));
      const record: OrderRecord = { order, customer: form, placedAt: new Date().toISOString() };
      saveOrderRecord(record);
      navigate(`/confirmation?order=${encodeURIComponent(order.id)}`, { state: { order, record } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="page checkout-page">
      <Link className="back-link" to="/cart">
        <ArrowLeft size={15} /> Back to your bag
      </Link>
      <div className="page-topline">
        <span>USE-ME-NOT / CHECKOUT</span>
        <span>NO PAYMENT REQUIRED</span>
      </div>
      <h1 className="cart-heading">
        Almost <em>unnecessary.</em>
      </h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <div className="form-section">
            <span className="eyebrow">01 — DELIVERY DETAILS</span>
            <p>Just enough information to send your objects somewhere.</p>
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                value={form.name}
                onChange={update}
                placeholder="Your name"
              />
            </label>
            <label>
              Street address
              <input
                name="address"
                autoComplete="street-address"
                required
                maxLength={240}
                value={form.address}
                onChange={update}
                placeholder="House number and street"
              />
            </label>
            <div className="field-pair">
              <label>
                City
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={100}
                  value={form.city}
                  onChange={update}
                  placeholder="City"
                />
              </label>
              <label>
                Postal code
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                  pattern="[A-Za-z0-9 -]{3,12}"
                  value={form.postalCode}
                  onChange={update}
                  placeholder="Postal code"
                />
              </label>
            </div>
          </div>
          <div className="simulation-note">
            <ShieldCheck size={18} />
            <div>
              <b>Entirely simulated, absolutely sincere.</b>
              <span>
                No payment information is collected. Your Namaste gesture is a
                local joke, and the order is placed only after the store confirms it.
              </span>
            </div>
          </div>
          {isDemoApi && (
            <div className="discount-panel">
              <span className="eyebrow">A DISCOUNT, DEFINED VERY BADLY</span>
              <div className="discount-entry">
                <input
                  aria-label="Discount code"
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  placeholder="Try CAPSLOCK, PIPE-DREAM, or 404NOWHERE"
                  disabled={Boolean(discount)}
                />
                {discount ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={removeDiscount}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={applyDiscount}
                  >
                    Apply
                  </button>
                )}
              </div>
              {discount && (
                <p className="discount-success">
                  {discount.code} accepted. A {discount.percent}% price increase
                  has been applied. The discount works exactly as poorly as promised.
                </p>
              )}
              {discountError && (
                <p className="discount-error" role="alert">
                  {discountError}
                </p>
              )}
            </div>
          )}
          {store.error && (
            <Notice onRetry={store.refresh}>{store.error}</Notice>
          )}
          {store.loading && (
            <div className="loading-line">
              Checking the store before checkout…
            </div>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="button button-dark checkout-button"
            disabled={busy || ritualOpen || store.loading || !!store.error || !lines.length}
          >
            {busy ? (
              "Checking the store…"
            ) : ritualOpen ? (
              "Namaste payment in progress"
            ) : (
              <>
                Continue to Namaste payment <ArrowRight size={16} />
              </>
            )}
          </button>
          {ritualOpen && (
            <NamastePayment
              busy={busy}
              onComplete={() => void placeOrder()}
              onSkip={() => void placeOrder()}
              onCancel={() => setRitualOpen(false)}
            />
          )}
        </form>
        <aside className="summary checkout-summary">
          <span className="eyebrow">YOUR OBJECTS</span>
          {lines.map((x) => (
            <div className="checkout-item" key={x.product.id}>
              <img src={x.product.imageUrl || imageFallback} alt="" />
              <span>
                {x.product.name}
                <small>Qty {x.cart.quantity}</small>
              </span>
              <b>
                {promotionFor(x.product) && (
                  <del>
                    {money(
                      promotionFor(x.product)!.basePrice * x.cart.quantity,
                    )}
                  </del>
                )}
                {moneyPrecise(shopperPrice(x.product) * x.cart.quantity)}
              </b>
            </div>
          ))}
          {discount && (
            <div className="discount-total">
              <span>
                {discount.code} · discount +{discount.percent}%
              </span>
              <b>+{money(discountValue)}</b>
            </div>
          )}
          <div className="summary-total">
            <span>Total</span>
            <b>{money(total + discountValue)}</b>
          </div>
          <p>
            Final price and order details are confirmed by the store service.
          </p>
        </aside>
      </div>
    </main>
  );
}
function Confirmation() {
  const { state } = useLocationState();
  const [searchParams] = useSearchParams();
  const order = (state?.order as Order | undefined) ?? getOrderHistory().find((item) => item.order.id === searchParams.get("order"))?.order;
  const historyRecord = order ? getOrderHistory().find((item) => item.order.id === order.id) : undefined;
  if (!order)
    return (
      <main className="page">
        <div className="empty">
          <span className="eyebrow">NO CONFIRMED ORDER</span>
          <h3>Nothing has been confirmed.</h3>
          <p>
            Complete checkout to receive an order confirmation from the store.
          </p>
          <Link className="button button-dark" to="/shop">
            Return to the collection
          </Link>
        </div>
      </main>
    );
  const date = new Date(`${order.estimatedDeliveryDate}T00:00:00`);
  return (
    <main className="page confirmation">
      <div className="success-icon">
        <Check size={24} />
      </div>
      <span className="eyebrow">THE STORE HAS CONFIRMED</span>
      <h1>
        Consider it <em>done.</em>
      </h1>
      <p className="confirmation-copy">
        Your order is confirmed. Buying this was, objectively, a little dumb. We
        respect the commitment to the bit.
      </p>
      <div className="order-card">
        <div>
          <span>ORDER NUMBER</span>
          <b>{order.id}</b>
        </div>
        <div>
          <span>STATUS</span>
          <b>{order.status}</b>
        </div>
        <div>
          <span>ESTIMATED DELIVERY</span>
          <b>
            {Number.isNaN(date.getTime())
              ? order.estimatedDeliveryDate
              : new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
                  date,
                )}
          </b>
        </div>
        <div>
          <span>ORDER TOTAL</span>
          <b>{money(order.total)}</b>
        </div>
        <div className="confirmed-items">
          {order.items.map((item, i) => (
            <div key={`${item.productId}-${i}`}>
              <span>
                {item.name} <small>× {item.quantity}</small>
              </span>
              <b>{money(item.lineTotal)}</b>
            </div>
          ))}
        </div>
      </div>
      <p className="confirmation-footnote">
        This was a simulated order. No payment was taken.
      </p>
      {historyRecord && (
        <>
          <button className="button button-outline order-action" onClick={() => downloadInvoice(historyRecord)}>
            Download invoice
          </button>
          <h2 className="review-heading">A few words about your regrettable purchase</h2>
          <p className="review-note">Your review is saved in this browser only. Reviews are not sent to the store service.</p>
          <div className="review-list">
            {order.items.map((item) => (
              <ReviewForm key={`${order.id}-${item.productId}`} orderId={order.id} item={item} />
            ))}
          </div>
        </>
      )}
      <Link className="button button-dark order-action" to="/my-orders">
        Track parcel and view my orders <ArrowRight size={15} />
      </Link>
      <Link className="button button-dark" to="/shop">
        Back to the store <ArrowRight size={15} />
      </Link>
    </main>
  );
}
function ReviewForm({ orderId, item }: { orderId: string; item: Order["items"][number] }) {
  const existing = getReviews().find((review) => review.orderId === orderId && review.productId === item.productId);
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saved, setSaved] = useState(Boolean(existing));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const review: ProductReview = {
      orderId,
      productId: item.productId,
      productName: item.name,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    saveReview(review);
    setSaved(true);
  };
  return (
    <form className="review-card" onSubmit={submit}>
      <div className="review-product">{item.name}</div>
      <div className="review-stars" role="radiogroup" aria-label={`Rating for ${item.name}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} stars`} onClick={() => setRating(star)}>
            {star <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
      <label>
        What were you thinking?
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} rows={3} placeholder="A brief account of your decision making." />
      </label>
      <button className="button button-dark" type="submit">{saved ? "Update review" : "Save review"}</button>
      {saved && <span className="review-saved">Saved on this device</span>}
    </form>
  );
}
function MyOrders() {
  const [records, setRecords] = useState(() => getOrderHistory());
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const refresh = async (record: OrderRecord) => {
    setRefreshing(record.order.id);
    setNotice("");
    try {
      const order = await api.order(record.order.id);
      updateSavedOrder(order);
      setRecords(getOrderHistory());
      setNotice(`Latest status received from the store for ${record.order.id}.`);
    } catch (error) {
      setNotice(`${(error as Error).message} Showing the last confirmed status saved in this browser.`);
    } finally {
      setRefreshing(null);
    }
  };
  return (
    <main className="page orders-page">
      <div className="page-topline"><span>USE-ME-NOT / YOUR ORDERS</span><span>PARCELS OF QUESTIONABLE JUDGMENT</span></div>
      <h1 className="cart-heading">My <em>orders.</em></h1>
      <p className="orders-intro">Your confirmed purchases, delivery estimates and invoices. The store cannot track a courier unless its service provides an updated order status.</p>
      {notice && <p className="orders-notice" role="status">{notice}</p>}
      {records.length === 0 ? (
        <div className="empty"><span className="eyebrow">NO ORDERS YET</span><h3>Your questionable decisions start here.</h3><Link className="button button-dark" to="/shop">Browse the collection</Link></div>
      ) : (
        <div className="orders-list">
          {records.map((record) => {
            const { order } = record;
            const date = new Date(`${order.estimatedDeliveryDate}T00:00:00`);
            const delivery = Number.isNaN(date.getTime()) ? order.estimatedDeliveryDate : new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date);
            return (
              <article className="order-history-card" key={order.id}>
                <div className="order-history-top"><div><span className="eyebrow">ORDER NUMBER</span><strong>{order.id}</strong></div><span className="order-status">{order.status}</span></div>
                <div className="tracking-panel"><span className="eyebrow">PARCEL TRACKING</span><strong>{order.status}</strong><p>Estimated delivery: {delivery}</p><small>Tracking status and delivery date are supplied by the store service.</small></div>
                <div className="order-history-items">{order.items.map((item, index) => <div key={`${item.productId}-${index}`}><span>{item.name} <small>× {item.quantity}</small></span><b>{money(item.lineTotal)}</b></div>)}</div>
                <div className="order-history-total"><span>Order total</span><b>{money(order.total)}</b></div>
                <div className="order-history-actions"><button className="button button-outline" onClick={() => downloadInvoice(record)}>Download invoice</button><button className="button button-dark" disabled={refreshing === order.id} onClick={() => void refresh(record)}>{refreshing === order.id ? "Checking status…" : "Refresh tracking"}</button></div>
                <div className="review-list order-review-list">{order.items.map((item) => <ReviewForm key={`${order.id}-${item.productId}`} orderId={order.id} item={item} />)}</div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
function useLocationState() {
  return useLocation();
}
type AdminProduct = Omit<Product, "id">;
function Admin() {
  const [key, setKey] = useState(
      () => sessionStorage.getItem("useless-admin-key") || "",
    ),
    [savedKey, setSavedKey] = useState(
      () => sessionStorage.getItem("useless-admin-key") || "",
    ),
    [products, setProducts] = useState<Product[]>([]),
    [orders, setOrders] = useState<Order[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [editing, setEditing] = useState<Product | null>(null),
    [uploading, setUploading] = useState(false),
    [progress, setProgress] = useState(0),
    [file, setFile] = useState<File | null>(null),
    [galleryImages, setGalleryImages] = useState<string[]>([]),
    [draggedId, setDraggedId] = useState(""),
    [viewingImage, setViewingImage] = useState("");
  const [form, setForm] = useState<AdminProduct>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "",
    stock: 0,
    isActive: true,
  });
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const load = async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const r = await api.adminProducts(k);
      setProducts(orderProducts(r.products));
      try {
        const o = await api.orders(k);
        setOrders(o.orders);
      } catch {
        setOrders([]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (savedKey) void load(savedKey);
  }, [savedKey]);
  const setField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const t = e.target;
    setForm((f) => ({
      ...f,
      [t.name]:
        t.type === "checkbox"
          ? (t as HTMLInputElement).checked
          : t.type === "number"
            ? Number(t.value)
            : t.value,
    }));
  };
  const login = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("useless-admin-key", key);
    setSavedKey(key);
    setMessage("");
  };
  const clearForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      stock: 0,
      isActive: true,
    });
    setFile(null);
    setGalleryImages([]);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const startEdit = (p: Product) => {
    setEditing(p);
    setGalleryImages(readProductGallery(p));
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      category: p.category,
      stock: p.stock,
      isActive: p.isActive,
    });
    setPreview(p.imageUrl);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const chooseFile = (f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else setPreview(form.imageUrl);
  };
  const addGalleryFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setMessage("");
    setUploading(true);
    const added: string[] = [];
    try {
      for (const image of Array.from(files)) {
        const url = await api.upload(savedKey, image, setProgress);
        added.push(url);
      }
      const next = [...galleryImages, ...added];
      setGalleryImages(next);
      if (!form.imageUrl && next[0]) {
        setForm((value) => ({ ...value, imageUrl: next[0] }));
        setPreview(next[0]);
      }
      setMessage(`${added.length} picture${added.length === 1 ? "" : "s"} added. Save changes to keep them.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
    }
  };
  const removeGalleryImage = (index: number) => {
    const next = galleryImages.filter((_, imageIndex) => imageIndex !== index);
    setGalleryImages(next);
    if (index === 0) {
      const primary = next[0] || "";
      setForm((value) => ({ ...value, imageUrl: primary }));
      setPreview(primary);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
    setMessage(`Picture removed from this product. Save changes to keep it removed.`);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      form.price < 0 ||
      form.stock < 0
    ) {
      setError(
        "Complete all required fields with valid non-negative price and stock.",
      );
      return;
    }
    setUploading(true);
    setProgress(file ? 5 : 0);
    try {
      const imageUrl = file
        ? await api.upload(savedKey, file, setProgress)
        : form.imageUrl;
      const { product } = await api.saveProduct(
        savedKey,
        {
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          imageUrl,
        },
        editing?.id,
      );
      const nextGallery = [imageUrl, ...galleryImages.slice(1)].filter(Boolean);
      saveProductGallery(product.id, nextGallery);
      setProducts((ps) => {
        const next = orderProducts(
        editing
          ? ps.map((p) => (p.id === product.id ? product : p))
          : [product, ...ps],
        );
        if (!editing) saveProductOrder(next);
        return next;
      });
      setMessage(
        editing
          ? "Object updated successfully."
          : "Object published successfully.",
      );
      clearForm();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  const remove = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}”?`)) return;
    setError("");
    setMessage("");
    try {
      await api.deleteProduct(savedKey, p.id);
      setProducts((ps) => {
        const next = ps.filter((x) => x.id !== p.id);
        saveProductOrder(next);
        return next;
      });
      setMessage("Object removed.");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const dropProduct = (targetId: string, sourceId = draggedId) => {
    if (!sourceId || sourceId === targetId) return;
    const from = products.findIndex((p) => p.id === sourceId);
    const to = products.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...products];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProducts(next);
    saveProductOrder(next);
    setMessage("Storefront order updated.");
    setDraggedId("");
  };
  const moveProduct = (id: string, direction: -1 | 1) => {
    const from = products.findIndex((p) => p.id === id);
    const to = Math.max(0, Math.min(products.length - 1, from + direction));
    if (from === to) return;
    const next = [...products];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProducts(next);
    saveProductOrder(next);
    setMessage("Storefront order updated.");
  };
  if (!savedKey)
    return (
      <main className="admin-page">
        <div className="admin-top">
          <span>USE-ME-NOT / PRIVATE OFFICE</span>
          <span>ADMINISTRATOR ACCESS</span>
        </div>
        <form className="login-panel" onSubmit={login}>
          <span className="eyebrow">PRIVATE ACCESS</span>
          <h1>
            Admin <em>sign in.</em>
          </h1>
          <p>
            {isDemoApi
              ? "Preview mode is local to this browser. Enter any demo key to manage the sample catalogue."
              : "Enter the admin key provided by your backend operator. It is held only for this browser session."}
          </p>
          <label>
            Admin API key
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="button button-dark">
            Enter dashboard <ArrowRight size={15} />
          </button>
        </form>
      </main>
    );
  return (
    <main className="admin-page">
      <div className="admin-top">
        <span>USE-ME-NOT / PRIVATE OFFICE</span>
        <button
          className="text-button"
          onClick={() => {
            sessionStorage.removeItem("useless-admin-key");
            setSavedKey("");
            setKey("");
          }}
        >
          Sign out <ArrowRight size={14} />
        </button>
      </div>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION / INVENTORY</span>
          <h1>
            Objects of <em>no consequence.</em>
          </h1>
        </div>
        <span className="admin-count">
          {products.length.toString().padStart(2, "0")} LISTED
        </span>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="success-message">
          <Check size={16} />
          {message}
        </div>
      )}
      <div className="admin-layout">
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-title">
            <span className="eyebrow">
              {editing ? "EDIT OBJECT" : "ADD AN OBJECT"}
            </span>
            {editing && (
              <button className="text-button" type="button" onClick={clearForm}>
                Cancel edit <X size={14} />
              </button>
            )}
          </div>
          <label>
            Product name
            <input
              name="name"
              required
              maxLength={160}
              value={form.name}
              onChange={setField}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              required
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={setField}
            />
          </label>
          <div className="field-pair">
            <label>
              Price (INR)
              <input
                name="price"
                required
                min="0"
                type="number"
                step="1"
                value={form.price}
                onChange={setField}
              />
            </label>
            <label>
              Stock quantity
              <input
                name="stock"
                required
                min="0"
                step="1"
                type="number"
                value={form.stock}
                onChange={setField}
              />
            </label>
          </div>
          <label>
            Category
            <input
              name="category"
              required
              maxLength={100}
              value={form.category}
              onChange={setField}
              placeholder="e.g. absurd-luxury"
            />
          </label>
          <label>
            Image URL
            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => {
                setField(e);
                if (!file) setPreview(e.target.value);
              }}
              placeholder="https://…"
            />
          </label>
          <div className="upload-control">
            <span>Or upload an image</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => chooseFile(e.target.files?.[0] || null)}
            />
            {preview && <img src={preview} alt="Selected product preview" />}
          </div>
          {editing && (
            <section className="admin-gallery-editor" aria-label="Product picture gallery">
              <div className="gallery-editor-heading">
                <span className="eyebrow">PRODUCT PICTURES · {galleryImages.length}</span>
                <label className="gallery-add-button">
                  Add pictures
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => void addGalleryFiles(e.target.files)}
                  />
                </label>
              </div>
              <p>Remove unwanted views below. The first picture is the storefront image. Save changes to apply edits.</p>
              {galleryImages.length ? (
                <div className="admin-gallery-grid">
                  {galleryImages.map((image, index) => (
                    <div className="admin-gallery-tile" key={`${image}-${index}`}>
                      <button type="button" className="gallery-image-preview" onClick={() => setViewingImage(image)} aria-label={`View picture ${index + 1}`}>
                        <img src={image} alt="" />
                      </button>
                      <span>{index === 0 ? "Storefront image" : `View ${index + 1}`}</span>
                      <button
                        type="button"
                        aria-label={`Remove picture ${index + 1}`}
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="admin-gallery-empty">No pictures yet. Add one or use an image URL above.</span>
              )}
              {uploading && (
                <div className="progress-track" aria-label="Uploading pictures">
                  <i style={{ width: `${Math.max(progress, 8)}%` }} />
                </div>
              )}
              {viewingImage && (
                <div className="gallery-lightbox" role="presentation" onClick={() => setViewingImage("")}>
                  <div className="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-label="Product picture preview" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="gallery-lightbox-close" onClick={() => setViewingImage("")}>Close <X size={16} /></button>
                    <img src={viewingImage} alt={`${form.name} full-size preview`} />
                  </div>
                </div>
              )}
            </section>
          )}
          <p className="admin-storage-note">Additional gallery pictures and custom product order are stored in this browser. The store API currently persists only the primary image.</p>
          {uploading && file && (
            <div className="progress-track">
              <i style={{ width: `${Math.max(progress, 8)}%` }} />
            </div>
          )}
          <label className="checkbox-label">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={setField}
            />{" "}
            Active and visible in storefront
          </label>
          <button className="button button-dark" disabled={uploading}>
            {uploading
              ? "Saving object…"
              : editing
                ? "Save changes"
                : "Publish object"}{" "}
            <ArrowRight size={15} />
          </button>
        </form>
        <section className="admin-inventory">
          <div className="admin-section-title">
            <span className="eyebrow">CURRENT INVENTORY</span>
            <button className="text-button" onClick={() => void load(savedKey)}>
              Refresh <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="loading-line">Retrieving the ledger…</div>
          ) : !products.length ? (
            <p className="admin-empty">
              The ledger is empty. Publish the first unnecessary object.
            </p>
          ) : (
            <div className="admin-table" role="list" aria-label="Product inventory. Drag rows to reorder the storefront.">
              {products.map((p) => (
                <div
                  className={`admin-row${draggedId === p.id ? " is-dragging" : ""}`}
                  key={p.id}
                  role="listitem"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", p.id);
                    setDraggedId(p.id);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
                    dropProduct(p.id, sourceId);
                  }}
                  onDragEnd={() => setDraggedId("")}
                >
                  <div className="admin-reorder-controls" aria-label={`Order controls for ${p.name}`}>
                    <span className="drag-grip" aria-hidden="true"><GripVertical size={17} /></span>
                    <button type="button" aria-label={`Move ${p.name} up`} onClick={() => moveProduct(p.id, -1)} disabled={products[0]?.id === p.id}><ChevronUp size={13} /></button>
                    <button type="button" aria-label={`Move ${p.name} down`} onClick={() => moveProduct(p.id, 1)} disabled={products[products.length - 1]?.id === p.id}><ChevronDown size={13} /></button>
                  </div>
                  <img
                    src={p.imageUrl || imageFallback}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = imageFallback;
                    }}
                  />
                  <div className="admin-row-main">
                    <b>{p.name}</b>
                    <span>
                      {p.category.replaceAll("-", " ")} · {p.stock} in stock ·{" "}
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <strong>{money(p.price)}</strong>
                  <button
                    aria-label={`Edit ${p.name}`}
                    onClick={() => startEdit(p)}
                    className="table-action"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Manage pictures for ${p.name}`}
                    onClick={() => startEdit(p)}
                    className="table-action gallery-action"
                  >
                    Pictures ({readProductGallery(p).length})
                  </button>
                  <button
                    aria-label={`Delete ${p.name}`}
                    onClick={() => void remove(p)}
                    className="table-action delete-action"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="admin-section-title orders-title">
            <span className="eyebrow">RECENT ORDERS</span>
          </div>
          {orders.length ? (
            <div className="admin-table">
              {orders.slice(0, 8).map((o) => (
                <div className="order-row" key={o.id}>
                  <b>{o.id}</b>
                  <span>{o.status}</span>
                  <span>
                    {o.items.length} object{o.items.length === 1 ? "" : "s"}
                  </span>
                  <strong>{money(o.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty">
              No recent orders are available from the service.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
function IntroGate({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finished = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [needsSoundGesture, setNeedsSoundGesture] = useState(false);
  const { contextSafe } = useGSAP({ scope: rootRef });
  const finishIntro = contextSafe(() => {
    if (finished.current || !introRef.current || !siteRef.current) return;
    finished.current = true;
    gsap
      .timeline({ onComplete: () => setIntroDone(true) })
      .to(introRef.current, {
        autoAlpha: 0,
        duration: 0.9,
        ease: "power2.inOut",
      })
      .to(
        siteRef.current,
        { autoAlpha: 1, duration: 0.9, ease: "power2.out" },
        "-=0.35",
      );
  });
  const toggleIntroSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const enable = !soundEnabled;
    video.muted = !enable;
    if (enable) {
      try {
        video.muted = false;
        await video.play();
        setSoundEnabled(true);
        setIntroPlaying(true);
        setNeedsSoundGesture(false);
      } catch {
        video.muted = true;
        setSoundEnabled(false);
      }
    } else {
      setSoundEnabled(false);
    }
  };

  useEffect(() => {
    if (introDone) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play().then(() => {
      setSoundEnabled(true);
      setIntroPlaying(true);
      setNeedsSoundGesture(false);
    }).catch(() => {
      video.muted = true;
      setSoundEnabled(false);
      setNeedsSoundGesture(true);
    });
  }, [introDone]);

  useGSAP(
    () => {
      if (introDone) {
        gsap.set(siteRef.current, { autoAlpha: 1 });
        return;
      }
      gsap.set(siteRef.current, { autoAlpha: 0 });
      if (!introPlaying) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .fromTo(
            titleRef.current,
            { autoAlpha: 0, y: 14, scale: 0.98 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1.15,
              ease: "power3.out",
            },
          )
          .to(
            titleRef.current,
            { autoAlpha: 0, y: -10, duration: 1.6, ease: "power2.inOut" },
            4.15,
          );
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [introDone, introPlaying], revertOnUpdate: true },
  );

  useEffect(() => {
    if (introDone || !introPlaying) return;
    const fallback = window.setTimeout(finishIntro, 11000);
    return () => window.clearTimeout(fallback);
  }, [finishIntro, introDone, introPlaying]);

  return (
    <div className="intro-root" ref={rootRef}>
      <div className={`intro-site${introDone ? " is-visible" : ""}`} ref={siteRef}>
        {children}
      </div>
      {!introDone && (
        <div className="intro-screen" ref={introRef}>
          <video
            ref={videoRef}
            className="intro-video"
            src="/use-me-not-intro.mp4"
            muted={!soundEnabled}
            playsInline
            preload="auto"
            aria-hidden="true"
            onEnded={finishIntro}
            onError={finishIntro}
          />
          <div className="intro-shade" />
          <div className="intro-title" ref={titleRef}>
            <span>USE-ME-NOT</span>
            <p>Solving problems that never existed.</p>
          </div>
          <button className="intro-skip" type="button" onClick={finishIntro}>
            Skip intro <ArrowRight size={14} />
          </button>
          <button
            className="intro-sound"
            type="button"
            onClick={() => void toggleIntroSound()}
            aria-label={soundEnabled ? "Mute intro video" : "Enable intro video sound"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? "Sound on" : needsSoundGesture ? "Tap to play with sound" : "Enable sound"}
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const cart = useCart(),
    store = useProducts();
  useEffect(() => {
    document.title = "Use-Me-Not — Solving problems that never existed.";
  }, []);
  return (
    <IntroGate>
      <Header count={cart.count} />
      <Routes>
        <Route path="/" element={<Home store={store} cart={cart} />} />
        <Route path="/shop" element={<Shop store={store} cart={cart} />} />
        <Route path="/product/:id" element={<ProductDetail cart={cart} />} />
        <Route path="/cart" element={<Cart cart={cart} store={store} />} />
        <Route
          path="/checkout"
          element={<Checkout cart={cart} store={store} />}
        />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="*"
          element={
            <main className="page">
              <div className="empty">
                <span className="eyebrow">404 / OBJECT NOT FOUND</span>
                <h3>Nothing is here.</h3>
                <Link className="button button-dark" to="/">
                  Return to the store
                </Link>
              </div>
            </main>
          }
        />
      </Routes>
      <Footer />
      <RoastChat />
    </IntroGate>
  );
}
export default App;
