import { useState, useMemo, useEffect, useCallback, memo } from "react";
import HeroSlider from "./Hero.jsx";
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
import LazySection from "./components/LazySection.jsx";

import { useProducts } from "./context/ProductContext";
import { API_URL } from "@/utils/api";

const STATIC_FALLBACK_ORDER = [
  "hero-slider", "upcoming-drops", "shop-by-category",
  "best-sellers", "best-brand", "special-combos", "offline-store", "hair-care-showcase", "makeup-showcase", "shop-by-origin", "shop-by-brand", "by-skin-concern", "new-arrivals",
  "watch-and-shop", "limited-offer", "shop-by-offer", "pre-order",
  "skin-quiz", "request-product"
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
  
  const inventoryProducts = useMemo(() => {
    return (PRODUCTS || []).filter(p => !p.specialOfferType || p.specialOfferType === "None");
  }, [PRODUCTS]);

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
    return STATIC_FALLBACK_ORDER.map(id => ({ componentId: id, isActive: true, settings: {} }));
  }, [serverData]);

  const renderSection = useCallback((section) => {
    const { componentId, settings } = section;
    const key = `${componentId}-${section.sortOrder || 0}`;

    let content = null;
    switch (componentId) {
      case "hero-slider":
        return <HeroSlider key={key} onNavigate={onNavigate} customSlides={settings?.slides?.length > 0 ? settings.slides : null} />;

      case "upcoming-drops":
        let onlineDropProducts = (settings?.products || []);
        if (onlineDropProducts.length === 0) {
          onlineDropProducts = PRODUCTS.filter(p => p.isPreOrder);
        }
        const processedDropProducts = onlineDropProducts.filter(p => p.showOnline !== false).map(sp => {
           const fullProduct = PRODUCTS.find(p => String(p.id) === String(sp.id)) || {};
           return { 
             ...sp, 
             id: sp.id || fullProduct.id,
             name: sp.name || fullProduct.name,
             imageUrl: sp.image || sp.imageUrl || fullProduct.image || (fullProduct.imageUrls && fullProduct.imageUrls[0]) || "",
             price: sp.price || fullProduct?.price || 0, 
             originalPrice: sp.originalPrice || fullProduct?.originalPrice || fullProduct?.price || sp.price || 0, 
             description: sp.description || fullProduct?.description || sp.name || '',
             launchDate: sp.launchDate || fullProduct.releaseDate || "Coming Soon"
           };
        });
        content = <UpcomingDrops onNavigate={onNavigate} wishlist={wishlist} toggleWishlist={toggleWishlist} deadline={settings?.deadline} title={section.title || settings?.promoText} products={processedDropProducts} />;
        break;

      case "shop-by-category":
        content = <ByCategory onNavigate={onNavigate} onSelectCategory={onSelectCategory} bgColor={settings?.bgColor} title={section.title} categories={dynamicCategories.length > 0 ? dynamicCategories.map(c => ({ label: c.name, image: CATEGORY_IMAGES[c.name] || categorySphere })) : settings?.categories} maxItems={settings?.maxItems} />;
        break;

      case "best-sellers":
        content = (
          <BestSellersMarquee
            sectionKey={key}
            section={section}
            settings={settings}
            products={inventoryProducts}
            addToCart={addToCart}
            onNavigate={onNavigate}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        );
        break;

      case "special-combos":
        content = <ComboSection addToCart={addToCart} onNavigate={onNavigate} />;
        break;

      case "offline-store":
        content = <OfflineStore />;
        break;

      case "shop-by-origin":
        content = <ShopByOrigin />;
        break;

      case "shop-by-brand":
        content = <ShopByBrand onSelectBrand={onSelectBrand} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} hiddenBrands={settings?.hiddenBrands} />;
        break;

      case "by-skin-concern":
        content = <BySkinConcern onSelectConcern={onSelectConcern} title={section.title} bgColor={settings?.bgColor} />;
        break;

      case "new-arrivals":
        content = <NewArrivalsSection onNavigate={onNavigate} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;
        break;

      case "watch-and-shop":
        content = <WatchAndShop onNavigate={onNavigate} videoUrl={settings?.videoUrl} includedProducts={settings?.productsCsv} title={section.title} />;
        break;

      case "limited-offer":
        content = <LimitedOfferBanner deadline={settings?.deadline} title={settings?.promoText} />;
        break;

      case "shop-by-offer":
        content = <ByOffer onNavigate={onNavigate} onSelectOffer={onSelectOffer} title={section.title} maxItems={settings?.maxItems} bgColor={settings?.bgColor} />;
        break;

      case "pre-order":
        content = <PreOrderSection wishlist={wishlist} toggleWishlist={toggleWishlist} title={section.title} settings={settings} />;
        break;

      case "skin-quiz":
        content = <SkinQuiz headline={settings?.headline} targetUrl={settings?.link} />;
        break;

      case "request-product":
        content = <RequestProductSection bgColor={settings?.bgColor} title={section.title} />;
        break;
    }

    return content ? (
      <LazySection key={key} minHeight="400px">
        {content}
      </LazySection>
    ) : null;
  }, [onNavigate, addToCart, wishlist, toggleWishlist, inventoryProducts, onSelectCategory, onSelectBrand, onSelectConcern, onSelectOffer, PRODUCTS, dynamicCategories]);

  if (loading) return null;

  return (
    <main>
      {query ? (
        <section className="py-20 px-6 max-w-[1240px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Search Results</h2>
              <p className="text-gray-500">Showing results for "{query}"</p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-[2px] text-sm font-bold text-gray-600">
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
