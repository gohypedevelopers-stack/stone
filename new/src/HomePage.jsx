import { useMemo, useRef, useEffect } from "react";
import "./homepage.css";
import HeroSlider from "./Hero.jsx";
import CuratedCollection from "./curatedcollection.jsx";
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
      <CuratedCollection />

      <ByCategory />

      {/* Featured products */}
      <section id="shop" className="section">
        <div className="container">
          <div className="sectionHead">
            <h2>Best sellers</h2>
          </div>

          <div className="marquee" ref={scrollRef}>
            <div className="marqueeTrack">
              {[...filteredProducts, ...filteredProducts].map((p, idx) => (
                <div key={`${p.id}-${idx}`} style={{ width: '320px', flexShrink: 0, padding: '0 10px' }}>
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
// ... (rest is same)
      <BySkinConcern />
      <ByOffer />

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
      <SkinQuiz />
    </main>
  );
}







