import { useMemo, useState } from "react";
import "./homepage.css";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";

const CATEGORIES = [
  { key: "korean", title: "Korean Skincare", desc: "Essences, toners, ampoules" },
  { key: "japanese", title: "Japanese Skincare", desc: "Gentle hydration & SPF" },
  { key: "sunscreen", title: "Sunscreens", desc: "Daily UV protection" },
  { key: "serums", title: "Serums", desc: "Brightening, acne, barrier" },
  { key: "cleansers", title: "Cleansers", desc: "Oil, foam & gel" },
  { key: "makeup", title: "Makeup", desc: "Tint, blush, lips" },
];

const PRODUCTS = [
  { id: "p1", name: "Hydra Barrier Serum", price: 899, tag: "Best Seller", rating: 4.7 },
  { id: "p2", name: "Daily UV Gel SPF 50", price: 699, tag: "Top Rated", rating: 4.8 },
  { id: "p3", name: "Rice Glow Essence", price: 999, tag: "New", rating: 4.6 },
  { id: "p4", name: "Calm Clean Foam", price: 499, tag: "Value", rating: 4.5 },
  { id: "p5", name: "Vitamin C Booster", price: 1099, tag: "Brightening", rating: 4.6 },
  { id: "p6", name: "Tinted Lip Balm", price: 399, tag: "Everyday", rating: 4.4 },
];

const FEATURED = [
  { key: "all", title: "All K-Beauty at Fingertip", caption: "Top trending products", theme: "ftLilac" },
  { key: "masks", title: "Toner Pads + Sheet Masks", caption: "Toner pads + Sheet masks", theme: "ftPink" },
  { key: "spf", title: "Sunscreen + Moisturisers", caption: "Sunscreen + Moisturisers", theme: "ftPeach" },
  { key: "serums", title: "Serums + Ampoules", caption: "Serums + Ampoules", theme: "ftRose" },
];

const CATEGORY_SHOWCASE = [
  { key: "cleansers", label: "Cleansers", tone: "catTone1" },
  { key: "toner", label: "Toner & Mist", tone: "catTone2" },
  { key: "treatments", label: "Treatments", tone: "catTone3" },
  { key: "moisturiser", label: "Moisturiser", tone: "catTone4" },
  { key: "sunscreen", label: "Sunscreen", tone: "catTone5" },
  { key: "eyecare", label: "Eyecare", tone: "catTone6" },
  { key: "lipcare", label: "Lipcare", tone: "catTone7" },
  { key: "masks", label: "Masks", tone: "catTone8" },
  { key: "kits", label: "Kits & Combos", tone: "catTone9" },
];

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]); // {id, qty}

  const freeDeliveryThreshold = 999;
  const supportPhone = "+91 90000 00000";

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const cartItems = useMemo(() => {
    return cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id);
      return { ...p, qty: c.qty, line: p.price * c.qty };
    });
  }, [cart]);

  const subtotal = cartItems.reduce((sum, x) => sum + x.line, 0);
  const pointsEarned = Math.floor(subtotal / 100); // 1 point per ₹100 (demo)
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
  }, [query]);

  function addToCart(id) {
    setCart((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found) return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { id, qty: 1 }];
    });
    setCartOpen(true);
  }

  function decQty(id) {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  }

  function incQty(id) {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }

  return (
    <div className="page">
      <Navbar
        categories={CATEGORIES}
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        cartCount={cartCount}
        onToggleCart={() => setCartOpen((v) => !v)}
      />
{/* Mini cart drawer */}
      <aside className={`cartDrawer ${cartOpen ? "open" : ""}`} aria-label="Shopping cart">
        <div className="cartHeader">
          <div>
            <div className="cartTitle">Your Cart</div>
            <div className="cartSub">
              Subtotal: <strong>{formatINR(subtotal)}</strong>
              {remainingForFreeDelivery > 0 ? (
                <span className="cartHint"> • Add {formatINR(remainingForFreeDelivery)} for free delivery</span>
              ) : (
                <span className="cartHint"> • Free delivery unlocked</span>
              )}
            </div>
          </div>
          <button className="iconBtn" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
        </div>

        <div className="cartBody">
          {cartItems.length === 0 ? (
            <div className="empty">
              <p>Your cart is empty.</p>
              <button className="btn" onClick={() => setCartOpen(false)}>Continue shopping</button>
            </div>
          ) : (
            <>
              <ul className="cartList">
                {cartItems.map((it) => (
                  <li key={it.id} className="cartItem">
                    <div className="thumb" aria-hidden="true" />
                    <div className="cartMeta">
                      <div className="cartName">{it.name}</div>
                      <div className="cartPrice">{formatINR(it.price)}</div>
                      <div className="qty">
                        <button className="qtyBtn" onClick={() => decQty(it.id)} aria-label="Decrease quantity">−</button>
                        <span className="qtyNum">{it.qty}</span>
                        <button className="qtyBtn" onClick={() => incQty(it.id)} aria-label="Increase quantity">+</button>
                      </div>
                    </div>
                    <div className="cartLine">{formatINR(it.line)}</div>
                  </li>
                ))}
              </ul>

              <div className="pointsBox">
                Earn <strong>{pointsEarned} loyalty points</strong> on this order.
                <span className="muted"> Redeem points for discounts on your next purchase.</span>
              </div>

              <button className="btn btnPrimary" onClick={() => alert("Checkout flow goes here")}>
                Checkout
              </button>
              <button className="btn btnGhost" onClick={() => setCart([])}>
                Clear cart
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Hero */}
      <main>
        <section className="featured">
          <div className="container">
            <div className="featuredHead">
              <div className="featuredTitle">
                <span className="featuredTitleStrong">Featured</span>{" "}
                <span className="featuredTitleLight">Collection</span>
              </div>
              <p className="featuredSub">From viral faves to hidden gems, find your match!</p>
            </div>

            <div className="featuredGrid">
              {FEATURED.map((f) => (
                <div key={f.key} className="featuredItem">
                  <div className={`featuredCard ${f.theme}`}>
                    <div className="featuredTag">{f.title}</div>
                    <div className="featuredImage" aria-hidden="true" />
                    <button className="featuredBtn">Shop now</button>
                  </div>
                  <div className="featuredCaption">{f.caption}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="categoryShowcase">
          <div className="container">
            <div className="categoryShowcaseHead">
              <span className="categoryShowcaseTitle">
                Shop by <span className="categoryShowcaseAccent">Category</span>
              </span>
            </div>

            <div className="categoryMarquee">
              <div className="categoryMarqueeTrack">
                {[...CATEGORY_SHOWCASE, ...CATEGORY_SHOWCASE].map((c, idx) => (
                  <div key={`${c.key}-${idx}`} className="categoryShowcaseItem">
                    <div className={`categoryShowcaseImage ${c.tone}`} aria-hidden="true" />
                    <div className="categoryShowcaseLabel">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="hero">
          <div className="container heroGrid">
            <div className="heroCopy">
              <div className="pill">Korean + Japanese skincare curated for India</div>
              <h1>Build a routine that matches your skin — not trends.</h1>
              <p>
                Shop sunscreen, serums, cleansers, and makeup with ingredient-first picks.
                Get guidance based on your skin type and concerns.
              </p>

              <div className="heroBtns">
                <a className="btn btnPrimary" href="#shop">Shop best sellers</a>
                <a className="btn btnGhost" href="#quiz">Find my routine</a>
              </div>

              <div className="heroMeta">
                <div className="metaCard">
                  <div className="metaTitle">Free delivery</div>
                  <div className="metaText">Above {formatINR(freeDeliveryThreshold)}</div>
                </div>
                <div className="metaCard">
                  <div className="metaTitle">Loyalty points</div>
                  <div className="metaText">Earn & redeem every order</div>
                </div>
                <div className="metaCard">
                  <div className="metaTitle">Support</div>
                  <div className="metaText">Call/WhatsApp: {supportPhone}</div>
                </div>
              </div>
            </div>

            <div className="heroArt" aria-hidden="true">
              <div className="blob" />
              <div className="productStack">
                <div className="cardShot" />
                <div className="cardShot" />
                <div className="cardShot" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section id="shop" className="section">
  <div className="container">
    <div className="sectionHead">
      <h2>Best sellers</h2>
      <div className="muted">Search: "{query || "..."}"</div>
    </div>

    <div className="marquee">
      <div className="marqueeTrack">
        {[...filteredProducts, ...filteredProducts].map((p, idx) => (
          <div key={`${p.id}-${idx}`} className="pCard pCardMarquee">
            <div className="pImg" aria-hidden="true" />
            <div className="pRow">
              <div>
                <div className="pTag">{p.tag}</div>
                <div className="pName">{p.name}</div>
                <div className="pRating">* {p.rating}</div>
              </div>
              <div className="pPrice">{formatINR(p.price)}</div>
            </div>
            <button className="btn btnPrimary w100" onClick={() => addToCart(p.id)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

        {/* Offers + Loyalty */}
        <section className="section">
          <div className="container promoGrid">
            <div className="promo">
              <h3>Offers you’ll actually use</h3>
              <p className="muted">
                Bundle routines, unlock free delivery, and get seasonal discounts on skincare essentials.
              </p>
              <a className="btn btnGhost" href="#">Explore offers</a>
            </div>
            <div className="promo promoAlt">
              <h3>Loyalty points on every order</h3>
              <p className="muted">
                Earn points automatically. Redeem for discounts on your next checkout.
              </p>
              <a className="btn btnGhost" href="#">How it works</a>
            </div>
          </div>
        </section>

        {/* Skin guidance */}
        <section id="quiz" className="section">
          <div className="container consult">
            <div>
              <h2>Need help choosing?</h2>
              <p className="muted">
                Tell us your skin type and concerns. Get product guidance and routine suggestions in minutes.
              </p>
              <div className="consultBtns">
                <button className="btn btnPrimary" onClick={() => alert("Skin quiz flow goes here")}>
                  Start skin quiz
                </button>
                <a className="btn btnGhost" href={`tel:${supportPhone}`}>
                  Talk to support
                </a>
              </div>
            </div>
            <div className="consultCard" aria-hidden="true">
              <div className="consultLine" />
              <div className="consultLine" />
              <div className="consultLine" />
              <div className="consultPill">Acne • Pigmentation • Dryness • Barrier</div>
            </div>
          </div>
        </section>
      </main>
      <Footer supportPhone={supportPhone} />
</div>
  );
}







