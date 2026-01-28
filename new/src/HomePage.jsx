import { useMemo, useState } from "react";
import "./homepage.css";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";
import HeroSlider from "./Hero.jsx";
import CuratedCollection from "./curatedcollection.jsx";
import ByCategory from "./bycategory.jsx";

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
        <HeroSlider />
        <CuratedCollection />

        <ByCategory />

        

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
                  <div key={`${p.id}-${idx}`} className="bsCard">
                    <div className="bsImage" aria-hidden="true" />
                    <div className="bsBody">
                      <span className="bsPill">{p.tag}</span>
                      <div className="bsName">{p.name}</div>
                      <div className="bsMeta">
                        <span className="bsPrice">{formatINR(p.price)}</span>
                        <span className="bsRating">★ {p.rating}</span>
                      </div>
                      <span className="bsSize">28ml</span>
                    </div>
                    <div className="bsActions">
                      <button className="bsWish" aria-label="Wishlist">
                        {"\u2661"}
                      </button>
                      <button className="bsAdd" onClick={() => addToCart(p.id)}>
                        Add to cart
                      </button>
                    </div>
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







