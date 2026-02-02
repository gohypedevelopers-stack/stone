import { useMemo, useRef, useEffect } from "react";
// import "./homepage.css"; // Removed
import HeroSlider from "./Hero.jsx";
import OfferTimer from "./OfferTimer.jsx";
import UpcomingDrops from "./UpcomingDrops.jsx";

import ByCategory from "./bycategory.jsx";
import ShopByBrand from "./shopbybrand.jsx";
import BySkinConcern from "./byskinconcern.jsx";
import ByOffer from "./byoffer.jsx";
import SkinQuiz from "./skinquiz.jsx";
import ProductCard from "./components/card.jsx";
import { getAllProducts } from "./data/products";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function HomePage({ addToCart, query }) {
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
      <UpcomingDrops />


      <ByCategory />

      {/* Featured products */}
      <section id="shop" className="py-[28px]">
        <div className="w-full px-0 sm:px-[10px]">
          <div className="flex items-end justify-between gap-[16px] mb-[14px] text-align-center">
            <h2 className="m-0 text-[22px] text-align-center">Best sellers</h2>
          </div>

          <div className="relative overflow-x-auto py-[6px] no-scrollbar" ref={scrollRef}>
            <div className="flex gap-[14px] w-max">
              {[...filteredProducts, ...filteredProducts].map((p, idx) => (
                <div key={`${p.id}-${idx}`} style={{ width: '320px', flexShrink: 0 }}>
                  <ProductCard
                    product={{ ...p, category: p.tag, inStock: true }}
                    onAddToCart={() => addToCart(p.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ShopByBrand />

      <BySkinConcern />
      <ByOffer />

      {/* Offers + Loyalty */}
      <section className="py-[28px]">
        <div className="w-full px-0 sm:px-[10px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          <div className="border border-black/6 rounded-[18px] p-[18px] bg-[linear-gradient(90deg,rgba(111,92,255,0.10),rgba(255,93,177,0.08),rgba(255,138,42,0.08))]">
            <h3 className="m-[0_0_8px]">Offers you’ll actually use</h3>
            <p className="text-muted-custom m-[0_0_12px]">
              Bundle routines, unlock free delivery, and get seasonal discounts on skincare essentials.
            </p>
            <a className="border border-line-custom bg-white rounded-[999px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]" href="#">Explore offers</a>
          </div>
          <div className="border border-black/6 rounded-[18px] p-[18px] bg-[linear-gradient(90deg,rgba(255,138,42,0.10),rgba(255,93,177,0.08),rgba(111,92,255,0.10))]">
            <h3 className="m-[0_0_8px]">Loyalty points on every order</h3>
            <p className="text-muted-custom m-[0_0_12px]">
              Earn points automatically. Redeem for discounts on your next checkout.
            </p>
            <a className="border border-line-custom bg-white rounded-[999px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]" href="#">How it works</a>
          </div>
        </div>
      </section>

      {/* Skin guidance */}
      <SkinQuiz />
    </main>
  );
}







