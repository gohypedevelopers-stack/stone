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
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function HomePage({ addToCart, query, onNavigate, onSelectCategory, onSelectBrand, onSelectConcern, onSelectOffer, wishlist, toggleWishlist }) {
  const PRODUCTS = getAllProducts();
  const scrollRef = useRef(null);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
  }, [query, PRODUCTS]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId;
    let isPaused = false;

    const scroll = () => {
      if (!isPaused) {
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 1;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const pause = () => { isPaused = true; };
    const resume = () => { isPaused = false; };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [filteredProducts]);

  return (
    <main>
      <HeroSlider />
      <OfferTimer />
      <UpcomingDrops onNavigate={onNavigate} wishlist={wishlist} toggleWishlist={toggleWishlist} />


      <ByCategory onNavigate={onNavigate} onSelectCategory={onSelectCategory} />

      {/* Featured products */}
      <section id="shop" className="py-[28px]">
        <div className="w-full px-0 sm:px-[10px]">
          <div className="flex items-end justify-between gap-[16px] mb-[14px] text-center">
            <h2 className="m-0 text-[32px] font-extrabold tracking-wide">
              BEST{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                SELLERS
              </span>
            </h2>
          </div>



          <div className="relative overflow-x-auto py-[6px] no-scrollbar" ref={scrollRef}>
            <div className="flex gap-[14px] w-max">
              {[...filteredProducts, ...filteredProducts].map((p, idx) => (
                <div key={`${p.id}-${idx}`} style={{ width: '320px', flexShrink: 0 }}>
                  <ProductCard
                    product={{ ...p, category: p.tag, inStock: true }}
                    onAddToCart={() => addToCart(p.id)}
                    onClick={() => onNavigate("best-sellers")}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
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







