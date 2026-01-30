import { useState, useMemo } from "react";
import HomePage from "./HomePage";
import Shop from "./Shop";
import Navbar from "./navbar";
import Footer from "./footer";
import { getAllProducts } from "./data/products";
import imgNewArrival from "./assets/newarrival.jpg";
import imgBestSeller from "./assets/bestsellerproducts.jpg";
import imgFoundation from "./assets/foundation.jpg";
import imgMoisturizer from "./assets/Moisturizers.jpg";
import imgPerfume from "./assets/perfumes.jpg";
import imgLipstick from "./assets/lipstick.jpg";
import "./homepage.css";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // 'home' | 'shop'
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]); // {id, qty}

  const PRODUCTS = getAllProducts();
  const freeDeliveryThreshold = 999;
  const supportPhone = "+91 90000 00000";

  // Cart Logic
  const cartItems = useMemo(() => {
    return cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id);
      if (!p) return null;
      return { ...p, qty: c.qty, line: p.price * c.qty };
    }).filter(Boolean);
  }, [cart, PRODUCTS]);

  const subtotal = cartItems.reduce((sum, x) => sum + x.line, 0);
  const pointsEarned = Math.floor(subtotal / 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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

  // Categories Data
  // Categories Data
  const CATEGORIES = [
    {
      key: "serums",
      title: "New Arrivals",
      desc: "Brightening, acne, barrier",
      image: imgNewArrival
    },
    {
      key: "makeup",
      title: "Best Sellers",
      desc: "Tint, blush, lips",
      image: imgBestSeller
    },
    {
      key: "cleansers",
      title: "Foundation",
      desc: "Oil, foam & gel",
      image: imgFoundation
    },
    {
      key: "sunscreen",
      title: "Moisturizers",
      desc: "Daily UV protection",
      image: imgMoisturizer
    },
    {
      key: "korean",
      title: "Perfume",
      desc: "Essences, toners, ampoules",
      image: imgPerfume
    },
    {
      key: "japanese",
      title: "Lipstick",
      desc: "Gentle hydration & SPF",
      image: imgLipstick
    },
  ];

  return (
    <div className="page">
      <Navbar
        categories={CATEGORIES}
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        cartCount={cartCount}
        onToggleCart={() => setCartOpen((v) => !v)}
        onNavigate={setCurrentView}
      />

      {/* Persistent Cart Drawer */}
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

      {/* Main Content Area */}
      {currentView === "home" ? (
        <HomePage addToCart={addToCart} query={query} />
      ) : (
        <Shop addToCart={addToCart} />
      )}

      <Footer supportPhone={supportPhone} />
    </div>
  );
}
