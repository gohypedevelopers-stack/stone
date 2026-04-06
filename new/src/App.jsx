import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Gift, X } from "lucide-react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import HomePage from "./HomePage";
import Shop from "./Shop";
import Navbar from "./navbar";
import Footer from "./footer";
import NewArrivals from "./NewArrivals";
import BestSellers from "./BestSellers";
import ProductPage from "./productpage.jsx";
import CategoryPage from "./CategoryPage.jsx";
import BrandPage from "./BrandPage.jsx";
import AllBrandsPage from "./AllBrandsPage.jsx";
import SkinConcernPage from "./SkinConcernPage.jsx";
import ShopByOfferPage from "./ShopByOfferPage.jsx";
import PreOrderProductPage from "./PreOrderProductPage.jsx";
import PreOrderListPage from "./PreOrderListPage";
import AllCategoriesPage from "./AllCategoriesPage.jsx";
import WishlistDrawer from "./WishlistDrawer.jsx";
import CartPage from "./CartPage.jsx";
import CheckoutPage from "./CheckoutPage.jsx";
import AccountPage from "./AccountPage.jsx";
import RewardsPage from "./RewardsPage.jsx";
import WishlistPage from "./WishlistPage.jsx";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./components/AuthModal";
import imgNewArrival from "./assets/newarrival.jpg";
import imgBestSeller from "./assets/bestsellerproducts.jpg";
import imgFoundation from "./assets/foundation.jpg";
import imgMoisturizer from "./assets/Moisturizers.jpg";
import imgPerfume from "./assets/perfumes.jpg";
import imgLipstick from "./assets/lipstick.jpg";
import imgSerums from "./assets/category/Serums.jpg";
import AdminDashboard from "./AdminDashboard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import CartDrawer from "./CartDrawer";
import RewardsPopup from "./components/RewardsPopup";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, fetchJson } from "@/utils/api";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Navigation logic handled directly in App due to Router being in main.jsx
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("omw_cart");
    return saved ? JSON.parse(saved) : [];
  }); // {id, qty, productData}
  // Wishlist State
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("omw_wishlist");
    return saved ? JSON.parse(saved) : [];
  }); // Array of full product objects
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Global Smooth Scroll (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    fetchJson("/admin/categories")
      .then(({ data: d }) => {
        if (d?.success) {
          // Filter out duplicate category names
          const unique = d.data.filter(
            (c, i, self) => i === self.findIndex((t) => t.name === c.name),
          );
          setDynamicCategories(unique);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem("omw_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("omw_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Immediate jump for navigation
    });
  }, [location.pathname]);

  const { products: PRODUCTS } = useProducts();
  const freeDeliveryThreshold = 999;
  const supportPhone = "+91 90000 00000";

  // Cart Logic
  const cartItems = useMemo(() => {
    return cart
      .map((c) => {
        const p = PRODUCTS.find((x) => x.id === c.id) || c.productData;
        if (!p) return null;

        // Ensure price is a number for calculation
        let price = p.price;
        if (typeof price === "string") {
          // Remove currency symbols and commas
          price = parseFloat(price.replace(/[^0-9.]/g, ""));
        }

        return { ...p, price, qty: c.qty, line: price * c.qty };
      })
      .filter(Boolean);
  }, [cart, PRODUCTS]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, x) => sum + x.line, 0),
    [cartItems],
  );
  const pointsEarned = useMemo(() => Math.floor(subtotal / 100), [subtotal]);
  const remainingForFreeDelivery = useMemo(
    () => Math.max(0, freeDeliveryThreshold - subtotal),
    [subtotal, freeDeliveryThreshold],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  const addToCart = useCallback(
    (item) => {
      let id = item;
      let productData = null;

      if (typeof item === "object" && item !== null) {
        id = item.id;
        productData = item;
      }

      setCart((prev) => {
        const found = prev.find((x) => x.id === id);
        if (found) {
          return prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  qty: x.qty + 1,
                  productData: productData || x.productData,
                }
              : x,
          );
        }
        return [...prev, { id, qty: 1, productData }];
      });

      // Auto-open cart drawer (if not on cart or checkout pages) and provide feedback
      if (location.pathname !== "/cart" && location.pathname !== "/checkout") {
        setCartOpen(true);
      }
      toast.success("Added to cart!");
    },
    [setCartOpen, location.pathname],
  );

  const decQty = useCallback((id) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0),
    );
  }, []);

  const incQty = useCallback((id) => {
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
    );
  }, []);

  const updateQty = useCallback((id, newQty) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: newQty } : x)),
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const moveToWishlist = useCallback(
    (item) => {
      // Add to wishlist
      setWishlist((prev) => {
        if (prev.some((p) => p.id === item.id)) return prev;
        return [...prev, item];
      });
      // Remove from cart
      removeFromCart(item.id);
    },
    [removeFromCart],
  );

  // Wishlist Logic
  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  // Categories Data
  const NAV_CATEGORIES = useMemo(() => {
    const base = [
      { key: "new-arrivals", title: "New Arrivals", image: imgNewArrival },
      { key: "best-sellers", title: "Best Sellers", image: imgBestSeller },
      { key: "serums", title: "Serums", image: imgSerums },
    ];

    const dynamic = dynamicCategories.slice(0, 5).map((cat) => ({
      key: cat.slug,
      title: cat.name,
      image: null,
    }));

    // Deduplicate by key
    const unique = [...base, ...dynamic].filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.key === item.key),
    );

    return unique;
  }, [dynamicCategories]);

  const CATEGORIES = NAV_CATEGORIES;

  const handleNavigate = useCallback(
    (view) => {
      // Map legacy view names to routes
      const routeMap = {
        home: "/",
        shop: "/shop",
        "new-arrivals": "/new-arrivals",
        "best-sellers": "/best-sellers",
        "category-page": "/category/Serums", // Default category
        "brand-page": "/brand/Laneige", // Default brand
        "skin-concern-page": "/concern/acne", // Default concern
        "shop-by-offer-page": "/offer/flat-20", // Default offer
        cart: "/cart",
        account: "/account",
        rewards: "/rewards",
        admin: "/admin",
        "all-categories": "/categories",
      };

      if (routeMap[view]) {
        navigate(routeMap[view]);
      } else if (PRODUCTS.some((p) => String(p.id) === String(view))) {
        // Handle direct product ID navigation
        navigate(`/product/${view}`);
      } else {
        // Fallback for direct route names if passed
        navigate(view.startsWith("/") ? view : "/" + view);
      }
    },
    [navigate, PRODUCTS],
  );

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen">
      {!isAdminPath && (
        <>
          <Navbar
            categories={CATEGORIES}
            query={query}
            onQueryChange={(e) => setQuery(e.target.value)}
            cartCount={cartCount}
            onToggleCart={() => navigate("/cart")}
            onNavigate={handleNavigate}
            wishlistCount={wishlist.length}
            onToggleWishlist={() => setWishlistOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </>
      )}

      {/* Main Content Area */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              addToCart={addToCart}
              query={query}
              onNavigate={handleNavigate}
              onSelectCategory={(cat) => navigate(`/category/${cat}`)}
              onSelectBrand={(brand) => navigate(`/brand/${brand}`)}
              onSelectConcern={(concern) => navigate(`/concern/${concern}`)}
              onSelectOffer={(offer) => navigate(`/offer/${offer}`)}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              dynamicCategories={dynamicCategories}
            />
          }
        />
        <Route
          path="/shop"
          element={
            <Shop
              dynamicCategories={dynamicCategories}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/new-arrivals"
          element={
            <NewArrivals
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/best-sellers"
          element={
            <BestSellers
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/pre-orders"
          element={
            <PreOrderListPage
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              updateQty={updateQty}
              removeFromCart={removeFromCart}
              moveToWishlist={moveToWishlist}
              addToCart={addToCart}
              subtotal={subtotal}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
            />
          }
        />
        <Route path="/checkout" element={<CheckoutPage setCart={setCart} />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/brands" element={<AllBrandsPage />} />
        <Route
          path="/categories"
          element={
            <AllCategoriesPage
              dynamicCategories={dynamicCategories}
              onSelectCategory={(cat) => navigate(`/category/${cat}`)}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Dynamic Routes */}
        <Route
          path="/product/:id"
          element={
            <ProductPage
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/preorder/:id"
          element={
            <PreOrderProductPage
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/category/:category"
          element={
            <CategoryPageWrapper
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/brand/:brandName"
          element={
            <BrandPageWrapper
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/concern/:concern"
          element={
            <SkinConcernPageWrapper
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/offer/:offer"
          element={
            <ShopByOfferPageWrapper
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />
      </Routes>

      {!isAdminPath && (
        <>
          {/* Persistent Cart Drawer */}
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cartItems={cartItems}
            subtotal={subtotal}
            remainingForFreeDelivery={remainingForFreeDelivery}
            pointsEarned={pointsEarned}
            decQty={decQty}
            incQty={incQty}
            removeFromCart={removeFromCart}
            setCart={setCart}
            formatINR={formatINR}
            onCheckout={() => {
              setCartOpen(false);
              navigate("/cart");
            }}
          />

          <WishlistDrawer
            open={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />

          <Footer supportPhone={supportPhone} />

          {/* Floating Rewards Launcher */}
          <button
            onClick={() => setIsRewardsOpen(!isRewardsOpen)}
            className={`fixed bottom-24 left-3 w-14 h-14 text-white rounded-[20px] shadow-[0_8px_30px_rgb(255,79,163,0.3)] flex items-center justify-center z-[90] hover:scale-110 active:scale-95 transition-all group ${
              isRewardsOpen ? "bg-[#ff4fa3]" : "bg-[#ff4fa3]"
            }`}
            aria-label="View Rewards"
          >
            <AnimatePresence mode="wait">
              {isRewardsOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="gift"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                >
                  <Gift size={28} className="translate-y-[-1px]" />
                </motion.div>
              )}
            </AnimatePresence>

            {!isRewardsOpen && (
              <div className="absolute left-full ml-4 px-3 py-1 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                My Rewards
              </div>
            )}
          </button>

          {/* Rewards Portal Popup */}
          <AnimatePresence>
            {isRewardsOpen && (
              <RewardsPopup
                isOpen={isRewardsOpen}
                onClose={() => setIsRewardsOpen(false)}
                user={user}
                onNavigate={(view) => {
                  if (view === "auth") {
                    setIsAuthModalOpen(true);
                  } else {
                    navigate(view);
                  }
                  setIsRewardsOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}
      <Toaster />
    </div>
  );
}

// Wrappers to extract route params and pass them as props
import { useParams } from "react-router-dom";

function CategoryPageWrapper({ addToCart, wishlist, toggleWishlist }) {
  const { category } = useParams();
  const navigate = useNavigate();
  return (
    <CategoryPage
      category={category}
      addToCart={addToCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      onCategoryChange={(cat) => navigate(`/category/${cat}`)}
    />
  );
}

function BrandPageWrapper({ addToCart, wishlist, toggleWishlist }) {
  const { brandName } = useParams();
  const navigate = useNavigate();
  return (
    <BrandPage
      brandName={brandName}
      addToCart={addToCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      onBrandChange={(b) => navigate(`/brand/${b}`)}
    />
  );
}

function SkinConcernPageWrapper({ addToCart, wishlist, toggleWishlist }) {
  const { concern } = useParams();
  const navigate = useNavigate();
  return (
    <SkinConcernPage
      userConcern={concern}
      addToCart={addToCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      onConcernChange={(c) => navigate(`/concern/${c}`)}
    />
  );
}

function ShopByOfferPageWrapper({ addToCart, wishlist, toggleWishlist }) {
  const { offer } = useParams();
  return (
    <ShopByOfferPage
      initialOffer={offer}
      addToCart={addToCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
    />
  );
}
