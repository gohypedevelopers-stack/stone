import { useMemo, useRef, useEffect } from "react";
// import "./homepage.css"; // Removed
import HeroSlider from "./Hero.jsx";
import OfferTimer from "./OfferTimer.jsx";
import UpcomingDrops from "./UpcomingDrops.jsx";
import WatchAndShop from "./WatchAndShop.jsx";

import ByCategory from "./bycategory.jsx";
import ShopByBrand from "./shopbybrand.jsx";
import BySkinConcern from "./byskinconcern.jsx";
import ByOffer from "./byoffer.jsx";
import SkinQuiz from "./skinquiz.jsx";
import ProductCard from "./components/card.jsx";
import NewArrivalsSection from "./NewArrivalsSection.jsx";
import LimitedOfferBanner from "./LimitedOfferBanner.jsx";
import RequestProductSection from "./RequestProductSection.jsx";
import PreOrderSection from "./PreOrderSection.jsx";
import { getAllProducts } from "./data/products";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export default function HomePage({
  addToCart,
  query,
  onNavigate,
  onSelectCategory,
  onSelectBrand,
  onSelectConcern,
  onSelectOffer,
  wishlist,
  toggleWishlist,
}) {
  const PRODUCTS = getAllProducts();

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q),
    );
  }, [query, PRODUCTS]);

  return (
    <main>
      <HeroSlider />
      <OfferTimer />
      <UpcomingDrops
        onNavigate={onNavigate}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />

      <ByCategory onNavigate={onNavigate} onSelectCategory={onSelectCategory} />

      {/* Featured products - Optimized with CSS Marquee */}
      <section id="shop" className="py-[28px] overflow-hidden">
        <div className="w-full px-0 sm:px-[10px]">
          <div className="flex items-end justify-between gap-[16px] mb-[11px]">
            <h2 className="m-0 text-[32px] font-extrabold tracking-wide px-4">
              BEST{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                SELLERS
              </span>
            </h2>
          </div>

          <div className="relative py-[12px] group/marquee">
            <div className="animate-smooth-marquee pause-on-hover flex gap-[14px] w-max">
              {[
                ...filteredProducts,
                ...filteredProducts,
                ...filteredProducts,
              ].map((p, idx) => (
                <div
                  key={`${p.id}-${idx}`}
                  className="w-[280px] md:w-[320px] flex-shrink-0"
                >
                  <ProductCard
                    product={{ ...p, category: p.tag, inStock: true }}
                    onAddToCart={() => addToCart(p.id)}
                    onClick={() => onNavigate(`product/${p.id}`)}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate("best-sellers")}
              className="px-8 py-3 rounded-full bg-[#151515] text-white font-black text-sm uppercase tracking-widest hover:bg-pink-600 hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      <ShopByBrand onSelectBrand={onSelectBrand} />

      <BySkinConcern onSelectConcern={onSelectConcern} />
      <NewArrivalsSection onNavigate={onNavigate} />
      <WatchAndShop onNavigate={onNavigate} />
      <LimitedOfferBanner />
      <ByOffer onNavigate={onNavigate} onSelectOffer={onSelectOffer} />
      <PreOrderSection wishlist={wishlist} toggleWishlist={toggleWishlist} />

      {/* Offers + Loyalty */}

      {/* Skin guidance */}
      <SkinQuiz />

      <RequestProductSection />
    </main>
  );
}
