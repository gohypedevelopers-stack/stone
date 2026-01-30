import { useMemo } from "react";
import "./homepage.css";
import HeroSlider from "./Hero.jsx";
import CuratedCollection from "./curatedcollection.jsx";
import ByCategory from "./bycategory.jsx";
import ShopByBrand from "./shopbybrand.jsx";
import BySkinConcern from "./byskinconcern.jsx";
import ByOffer from "./byoffer.jsx";
import SkinQuiz from "./skinquiz.jsx";
import { getAllProducts } from "./data/products";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function HomePage({ addToCart, query }) {
  const PRODUCTS = getAllProducts();

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
  }, [query, PRODUCTS]);

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
                    <span className="bsSize">{p.origin}</span>
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

      <ShopByBrand />
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







