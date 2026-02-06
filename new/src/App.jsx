import { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import Shop from "./Shop";
import Navbar from "./navbar";
import Footer from "./footer";
import NewArrivals from "./NewArrivals";
import BestSellers from "./BestSellers";
import ProductPage from "./productpage.jsx";
import CategoryPage from "./CategoryPage.jsx";
import BrandPage from "./BrandPage.jsx";
import SkinConcernPage from "./SkinConcernPage.jsx";
import ShopByOfferPage from "./ShopByOfferPage.jsx";
import { getAllProducts } from "./data/products";
import imgNewArrival from "./assets/newarrival.jpg";
import imgBestSeller from "./assets/bestsellerproducts.jpg";
import imgFoundation from "./assets/foundation.jpg";
import imgMoisturizer from "./assets/Moisturizers.jpg";
import imgPerfume from "./assets/perfumes.jpg";
import imgLipstick from "./assets/lipstick.jpg";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

// Navigation logic handled directly in App due to Router being in main.jsx
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const CATEGORIES = [
    { key: "serums", title: "New Arrivals", desc: "Brightening, acne, barrier", image: imgNewArrival },
    { key: "makeup", title: "Best Sellers", desc: "Tint, blush, lips", image: imgBestSeller },
    { key: "cleansers", title: "Foundation", desc: "Oil, foam & gel", image: imgFoundation },
    { key: "sunscreen", title: "Moisturizers", desc: "Daily UV protection", image: imgMoisturizer },
    { key: "korean", title: "Perfume", desc: "Essences, toners, ampoules", image: imgPerfume },
    { key: "japanese", title: "Lipstick", desc: "Gentle hydration & SPF", image: imgLipstick },
  ];

  const handleNavigate = (view) => {
    // Map legacy view names to routes
    const routeMap = {
      "home": "/",
      "shop": "/shop",
      "new-arrivals": "/new-arrivals",
      "best-sellers": "/best-sellers",
      "category-page": "/category/Serums", // Default category
      "brand-page": "/brand/Laneige", // Default brand
      "skin-concern-page": "/concern/acne", // Default concern
      "shop-by-offer-page": "/offer/flat-20" // Default offer
    };

    if (routeMap[view]) {
      navigate(routeMap[view]);
    } else {
      // Fallback for direct route names if passed
      navigate(view.startsWith("/") ? view : "/" + view);
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      <Navbar
        categories={CATEGORIES}
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        cartCount={cartCount}
        onToggleCart={() => setCartOpen((v) => !v)}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <Routes>
        <Route path="/" element={
          <HomePage
            addToCart={addToCart}
            query={query}
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => navigate(`/category/${cat}`)}
            onSelectBrand={(brand) => navigate(`/brand/${brand}`)}
            onSelectConcern={(concern) => navigate(`/concern/${concern}`)}
            onSelectOffer={(offer) => navigate(`/offer/${offer}`)}
          />
        } />
        <Route path="/shop" element={<Shop addToCart={addToCart} />} />
        <Route path="/new-arrivals" element={<NewArrivals addToCart={addToCart} />} />
        <Route path="/best-sellers" element={<BestSellers addToCart={addToCart} />} />

        {/* Dynamic Routes */}
        <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
        <Route path="/category/:category" element={<CategoryPageWrapper addToCart={addToCart} />} />
        <Route path="/brand/:brandName" element={<BrandPageWrapper addToCart={addToCart} />} />
        <Route path="/concern/:concern" element={<SkinConcernPageWrapper addToCart={addToCart} />} />
        <Route path="/offer/:offer" element={<ShopByOfferPageWrapper addToCart={addToCart} />} />
      </Routes>

      {/* Persistent Cart Drawer */}
      <aside className={`fixed top-0 right-0 w-[min(420px,92vw)] h-[100vh] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-250 z-50 flex flex-col ${cartOpen ? "translate-x-0" : "translate-x-[110%]"}`} aria-label="Shopping cart">
        <div className="p-[16px] border-b border-line-custom flex items-start justify-between gap-[12px]">
          <div>
            <div className="font-bold">Your Cart</div>
            <div className="text-[13px] text-muted-custom mt-[4px]">
              Subtotal: <strong>{formatINR(subtotal)}</strong>
              {remainingForFreeDelivery > 0 ? (
                <span className="ml-[6px]"> • Add {formatINR(remainingForFreeDelivery)} for free delivery</span>
              ) : (
                <span className="ml-[6px]"> • Free delivery unlocked</span>
              )}
            </div>
          </div>
          <button className="border border-line-custom bg-white h-[40px] w-[40px] rounded-[999px] grid place-items-center cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {/* Persistent Cart Drawer */}

        <div className="p-[14px_16px_18px] overflow-auto">
          {cartItems.length === 0 ? (
            <div className="text-muted-custom">
              <p>Your cart is empty.</p>
              <button className="border border-line-custom bg-white rounded-[999px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] mt-4" onClick={() => setCartOpen(false)}>Continue shopping</button>
            </div>
          ) : (
            <>
              <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
                {cartItems.map((it) => (
                  <li key={it.id} className="grid grid-cols-[54px_1fr_auto] gap-[12px] items-center p-[10px] border border-line-custom rounded-[14px]">
                    <div className="h-[54px] w-[54px] rounded-[12px] bg-[linear-gradient(135deg,rgba(111,92,255,0.25),rgba(255,93,177,0.18),rgba(255,138,42,0.18))]" aria-hidden="true" />
                    <div>
                      <div className="font-[650] text-[13px]">{it.name}</div>
                      <div className="text-[12px] text-muted-custom mt-[2px]">{formatINR(it.price)}</div>
                      <div className="flex items-center gap-[10px] mt-[6px]">
                        <button className="h-[28px] w-[28px] rounded-[999px] border border-line-custom bg-white cursor-pointer" onClick={() => decQty(it.id)} aria-label="Decrease quantity">−</button>
                        <span className="text-[13px] min-w-[16px] text-center">{it.qty}</span>
                        <button className="h-[28px] w-[28px] rounded-[999px] border border-line-custom bg-white cursor-pointer" onClick={() => incQty(it.id)} aria-label="Increase quantity">+</button>
                      </div>
                    </div>
                    <div className="font-bold text-[13px]">{formatINR(it.line)}</div>
                  </li>
                ))}
              </ul>

              <div className="my-[14px] mx-0 px-[12px] py-[12px] rounded-[14px] border border-black/6 bg-[linear-gradient(90deg,rgba(111,92,255,0.10),rgba(255,93,177,0.08),rgba(255,138,42,0.08))] text-[13px]">
                Earn <strong>{pointsEarned} loyalty points</strong> on this order.
                <span className="text-muted-custom"> Redeem points for discounts on your next purchase.</span>
              </div>

              <button className="border border-line-custom bg-white rounded-[999px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-transparent text-white bg-[linear-gradient(90deg,var(--brand1),var(--brand2),var(--brand3))]" onClick={() => alert("Checkout flow goes here")}>
                Checkout
              </button>
              <button className="border border-line-custom bg-white rounded-[999px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white mt-2" onClick={() => setCart([])}>
                Clear cart
              </button>
            </>
          )}
        </div>
      </aside>

      <Footer supportPhone={supportPhone} />
    </div>
  );
}

// Wrappers to extract route params and pass them as props
import { useParams } from "react-router-dom";

function CategoryPageWrapper({ addToCart }) {
  const { category } = useParams();
  const navigate = useNavigate();
  return <CategoryPage category={category} addToCart={addToCart} onCategoryChange={(cat) => navigate(`/category/${cat}`)} />;
}

function BrandPageWrapper({ addToCart }) {
  const { brandName } = useParams();
  const navigate = useNavigate();
  return <BrandPage brandName={brandName} addToCart={addToCart} onBrandChange={(b) => navigate(`/brand/${b}`)} />;
}

function SkinConcernPageWrapper({ addToCart }) {
  const { concern } = useParams();
  const navigate = useNavigate();
  return <SkinConcernPage userConcern={concern} addToCart={addToCart} onConcernChange={(c) => navigate(`/concern/${c}`)} />;
}

function ShopByOfferPageWrapper({ addToCart }) {
  const { offer } = useParams();
  return <ShopByOfferPage initialOffer={offer} addToCart={addToCart} />;
}
