import { useState, useMemo, useEffect, useCallback, memo } from "react";
import HeroSlider from "./Hero.jsx";
import OfferTimer from "./OfferTimer.jsx";
import UpcomingDrops from "./UpcomingDrops.jsx";
import WatchAndShop from "./WatchAndShop.jsx";
import BestSellersMarquee from "./BestSellersMarquee.jsx";

import ByCategory, { CATEGORY_IMAGES, categorySphere } from "./bycategory.jsx";
import ShopByBrand from "./shopbybrand.jsx";
import BySkinConcern from "./byskinconcern.jsx";
import ByOffer from "./byoffer.jsx";
import SkinQuiz from "./skinquiz.jsx";
import ProductCard from "./components/card.jsx";
import NewArrivalsSection from "./NewArrivalsSection.jsx";
import BestBrand from "./BestBrand.jsx";
import ComboSection from "./ComboSection.jsx";
import OfflineStore from "./OfflineStore.jsx";
import CategoryShowcase from "./CategoryShowcase.jsx";
import ShopByOrigin from "./ShopByOrigin.jsx";
import LimitedOfferBanner from "./LimitedOfferBanner.jsx";
import RequestProductSection from "./RequestProductSection.jsx";
import PreOrderSection from "./PreOrderSection.jsx";

// Local assets for showcases
import hairBanner from "./assets/category/Hair set.jpg";
import makeupBanner from "./assets/category/International makeup.jpeg";

import { useProducts } from "./context/ProductContext";

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
  "best-sellers", "best-brand", "special-combos", "offline-store", "hair-care-showcase", "makeup-showcase", "shop-by-origin", "shop-by-brand", "by-skin-concern", "new-arrivals",
  "watch-and-shop", "limited-offer", "shop-by-offer", "pre-order",
  "skin-quiz", "request-product"
];

const HAIR_CARE_DATA = [
  { id: "hc1", brand: "Shiseido", name: "Shiseido Fino Premium Touch Hair Mask", price: 2300, points: 69, image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600" },
  { id: "hc2", brand: "Shiseido", name: "Shiseido Fino Premium Touch Hair Oil", price: 2800, points: 84, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600" },
  { id: "hc3", brand: "KERASTASE", name: "Elixir Ultime L'Huile Original Hair Oil", price: 4500, points: 110, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600" },
  { id: "hc4", brand: "OLAPLEX", name: "No. 3 Hair Perfector Treatment", price: 1800, points: 45, image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600" }
];

const MAKEUP_DATA = [
  { id: "mu1", brand: "Rare Beauty", name: "Rare Beauty Soft Pinch Tinted Lip Oil - Serene", price: 5800, points: 174, image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=600" },
  { id: "mu2", brand: "Rare Beauty", name: "Rare Beauty Soft Pinch Tinted Lip Oil - Affection", price: 5800, points: 174, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600" },
  { id: "mu3", brand: "Dior", name: "Dior Addict Lip Glow - 001 Pink", price: 4200, points: 120, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600" },
  { id: "mu4", brand: "CHANEL", name: "Chanel Rouge Coco Baum - My Rose", price: 4800, points: 140, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600" }
];


const HomePage = memo(function HomePage({
  addToCart,
  query,
  onNavigate,
  onSelectCategory,
  onSelectBrand,
  onSelectConcern,
  onSelectOffer,
  wishlist,
  toggleWishlist,
  dynamicCategories,
}) {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { products: PRODUCTS } = useProducts();

  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setServerData(d.data);
        }
      })
      .catch(() => {
        console.warn("Using static layout fallback");
        // Fallback to empty data on API error
        setServerData({ sections: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, PRODUCTS]);

  const sections = useMemo(() => {
    let rawSections = [];
    if (serverData && serverData.sections && serverData.sections.length > 0) {
      rawSections = serverData.sections.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

      // Ensure new components are present if missing from dynamic server data
      ["best-brand", "special-combos", "offline-store", "hair-care-showcase", "makeup-showcase", "shop-by-origin"].forEach(comp => {
        if (!rawSections.find(s => s.componentId === comp)) {
          const prevMap = { "best-brand": "best-sellers", "special-combos": "best-brand", "offline-store": "special-combos", "hair-care-showcase": "offline-store", "makeup-showcase": "hair-care-showcase", "shop-by-origin": "makeup-showcase" };
          const prevIdx = rawSections.findIndex(s => s.componentId === prevMap[comp]);
          const injectIdx = prevIdx !== -1 ? prevIdx + 1 : 4;
          rawSections.splice(injectIdx, 0, { componentId: comp, isActive: true, settings: {} });
        }
      });
      return rawSections;
    }
    // If serverData is null (still loading) or no active sections, use fallback
    return STATIC_FALLBACK_ORDER.map(id => ({ componentId: id, isActive: true, settings: {} }));
  }, [serverData]);


  const renderSection = useCallback((section) => {
    const { componentId, settings } = section;
    const key = `${componentId}-${section.sortOrder || 0}`; // Use sortOrder for key if available, otherwise 0

    switch (componentId) {
      case "hero-slider":
        return <HeroSlider key={key} onNavigate={onNavigate} customSlides={settings?.slides?.length > 0 ? settings.slides : null} />;

      case "offer-timer":
        return <OfferTimer key={key} offers={settings?.offers} />;

      case "upcoming-drops":
        const onlineDropProducts = (settings?.products || []).filter(p => p.showOnline !== false);
        return <UpcomingDrops key={key} onNavigate={onNavigate} wishlist={wishlist} toggleWishlist={toggleWishlist} deadline={settings?.deadline} title={section.title || settings?.promoText} products={onlineDropProducts} />;

      case "shop-by-category":
        return <ByCategory key={key} onNavigate={onNavigate} onSelectCategory={onSelectCategory} bgColor={settings?.bgColor} title={section.title} categories={dynamicCategories.length > 0 ? dynamicCategories.map(c => ({ label: c.name, image: CATEGORY_IMAGES[c.name] || categorySphere })) : settings?.categories} maxItems={settings?.maxItems} />;

      case "best-sellers":
        return (
          <BestSellersMarquee
            key={key}
            sectionKey={key}
            section={section}
            settings={settings}
            products={PRODUCTS}
            addToCart={addToCart}
            onNavigate={onNavigate}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        );

      case "best-brand":
        return <BestBrand key={key} onNavigate={onNavigate} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} title={section.title} bgColor={settings?.bgColor} />;

      case "special-combos":
        return <ComboSection key={key} addToCart={addToCart} onNavigate={onNavigate} />;

      case "offline-store":
        return <OfflineStore key={key} />;

      case "hair-care-showcase":
        return <CategoryShowcase key={key} category="Hair Care" bannerBigText="Hair" bannerSmallText="CARE" bannerColor="from-pink-50 to-sky-50" bannerImage={hairBanner} products={HAIR_CARE_DATA} />;

      case "makeup-showcase":
        return <CategoryShowcase key={key} category="Makeup" bannerBigText="Makeup" bannerSmallText="MIX" bannerColor="from-sky-50 to-pink-50" bannerImage={makeupBanner} products={MAKEUP_DATA} />;

      case "shop-by-origin":
        return <ShopByOrigin key={key} />;

      case "shop-by-brand":
        return <ShopByBrand key={key} onSelectBrand={onSelectBrand} selectedBrands={settings?.brands} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;

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
  }, [onNavigate, addToCart, wishlist, toggleWishlist, PRODUCTS, onSelectCategory, onSelectBrand, onSelectConcern, onSelectOffer]);

  if (loading) return null; // Avoid flicker

  return (
    <main>
      {query ? (
        <section className="py-20 px-6 max-w-[1240px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Search Results</h2>
              <p className="text-gray-500">Showing results for "{query}"</p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-bold text-gray-600">
              {filteredProducts.length} PRODUCTS FOUND
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 font-medium">No products found matching your search.</p>
            </div>
          )}
        </section>
      ) : (
        sections.map((section) => renderSection(section))
      )}
    </main>
  );
});

export default HomePage;
