import { useState, useMemo, useEffect } from "react";
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

const API_URL = "http://localhost:5000/api";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Fallback order in case backend is unreachable
const STATIC_FALLBACK_ORDER = [
  "hero-slider", "offer-timer", "upcoming-drops", "shop-by-category", 
  "best-sellers", "shop-by-brand", "by-skin-concern", "new-arrivals", 
  "watch-and-shop", "limited-offer", "shop-by-offer", "pre-order", 
  "skin-quiz", "request-product"
];

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
  const [sections, setSections] = useState([]);
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const PRODUCTS = getAllProducts();

  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setServerData(d.data);
          if (d.data.sections && d.data.sections.length > 0) {
            setSections(d.data.sections.filter(s => s.isActive).sort((a,b) => a.sortOrder - b.sortOrder));
          } else {
            setSections(STATIC_FALLBACK_ORDER.map(id => ({ componentId: id, isActive: true, settings: {} })));
          }
        } else {
          setSections(STATIC_FALLBACK_ORDER.map(id => ({ componentId: id, isActive: true, settings: {} })));
        }
      })
      .catch(() => {
        console.warn("Using static layout fallback");
        setSections(STATIC_FALLBACK_ORDER.map(id => ({ componentId: id, isActive: true, settings: {} })));
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q),
    );
  }, [query, PRODUCTS]);

  // Renderer mapping engine
  const renderSection = (section, idx) => {
    const { componentId, settings } = section;
    const key = `${componentId}-${idx}`;
    const limitItems = (arr, max) => arr.slice(0, max || 8);

    switch (componentId) {
      case "hero-slider":
        // Overrides the Hero logic if there are configured slides in DB
        return (
          <div key={key}>
             {/* Note: Hero.jsx might still handle its own fetch, prioritizing standard design for now */}
            <HeroSlider customSlides={settings?.slides?.length > 0 ? settings.slides : null} />
          </div>
        );

      case "offer-timer":
        return <OfferTimer key={key} deadline={settings?.deadline} title={settings?.promoText} maxItems={settings?.maxItems} />;

      case "upcoming-drops":
        return <UpcomingDrops key={key} onNavigate={onNavigate} wishlist={wishlist} toggleWishlist={toggleWishlist} deadline={settings?.deadline} title={settings?.promoText} maxItems={settings?.maxItems} />;

      case "shop-by-category":
        return <ByCategory key={key} onNavigate={onNavigate} onSelectCategory={onSelectCategory} bgColor={settings?.bgColor} title={section.title} maxItems={settings?.maxItems} />;

      case "best-sellers":
        return (
          <section key={key} id={`shop-${key}`} className="py-[28px] overflow-hidden" style={{ backgroundColor: settings?.bgColor || 'transparent' }}>
            <div className="w-full px-0 sm:px-[10px]">
              <div className="flex items-end justify-between gap-[16px] mb-[11px]">
                <div className="px-4">
                  <h2 className="m-0 text-[32px] font-extrabold tracking-wide uppercase">
                    {section.title || "BEST "}
                    {!section.title && (
                      <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        SELLERS
                      </span>
                    )}
                  </h2>
                  {settings?.subheading && <p className="text-stone-500 font-bold mt-1 tracking-widest uppercase text-xs">{settings.subheading}</p>}
                </div>
              </div>

              <div className="relative py-[12px] group/marquee">
                <div className="animate-smooth-marquee pause-on-hover flex gap-[14px] w-max">
                  {[
                    ...limitItems(filteredProducts, settings?.maxItems || 12),
                    ...limitItems(filteredProducts, settings?.maxItems || 12),
                    ...limitItems(filteredProducts, settings?.maxItems || 12),
                  ].map((p, pIdx) => (
                    <div
                      key={`${p.id}-${pIdx}`}
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
        );

      case "shop-by-brand":
        return <ShopByBrand key={key} onSelectBrand={onSelectBrand} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;

      case "by-skin-concern":
        return <BySkinConcern key={key} onSelectConcern={onSelectConcern} title={section.title} bgColor={settings?.bgColor} />;

      case "new-arrivals":
        return <NewArrivalsSection key={key} onNavigate={onNavigate} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;

      case "watch-and-shop":
        return <WatchAndShop key={key} onNavigate={onNavigate} videoUrl={settings?.videoUrl} includedProducts={settings?.productsCsv} title={section.title} />;

      case "limited-offer":
        return <LimitedOfferBanner key={key} deadline={settings?.deadline} title={settings?.promoText} />;

      case "shop-by-offer":
        return <ByOffer key={key} onNavigate={onNavigate} onSelectOffer={onSelectOffer} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;

      case "pre-order":
        return <PreOrderSection key={key} wishlist={wishlist} toggleWishlist={toggleWishlist} title={section.title} />;

      case "skin-quiz":
        return <SkinQuiz key={key} headline={settings?.headline} targetUrl={settings?.link} />;

      case "request-product":
        return <RequestProductSection key={key} bgColor={settings?.bgColor} title={section.title} />;

      default:
        return null; // Unknown custom block
    }
  };

  if (loading) return null; // Avoid flicker

  return (
    <main>
      {sections.map((section, idx) => renderSection(section, idx))}
    </main>
  );
}
