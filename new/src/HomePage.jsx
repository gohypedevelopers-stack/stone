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
import PromotionalBanner from "./PromotionalBanner.jsx";
import LazySection from "./components/LazySection.jsx";

import { useProducts } from "./context/ProductContext";
import { API_URL } from "@/utils/api";

const STATIC_FALLBACK_ORDER = [
  "hero-slider",
  "best-sellers",
  "upcoming-drops",
  "best-brand",
  "special-combos",
  "hair-care-showcase",
  "makeup-showcase",
  "shop-by-origin",
  "shop-by-brand",
  "by-skin-concern",
  "new-arrivals",
  "watch-and-shop",
  "limited-offer",
  "shop-by-offer",
  "skin-quiz",
  "request-product",
  "offline-store",
];

const HomePage = memo(function HomePage({
  addToCart,
  onNavigate,
  onSelectCategory,
  onSelectBrand,
  onSelectConcern,
  onSelectOffer,
  wishlist,
  toggleWishlist,
  dynamicCategories,
  user,
}) {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { products: PRODUCTS } = useProducts();

  const [adminBanners, setAdminBanners] = useState(() => {
    const saved = localStorage.getItem("omw_admin_banners");
    return saved ? JSON.parse(saved) : null;
  });

  const inventoryProducts = useMemo(() => {
    return (PRODUCTS || []).filter(
      (p) => !p.specialOfferType || p.specialOfferType === "None",
    );
  }, [PRODUCTS]);

  useEffect(() => {
    fetch(`${API_URL}/homepage`)
      .then((r) => r.json())
      .then((d) => {
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

  const sections = useMemo(() => {
    let rawSections = [];
    if (serverData && serverData.sections && serverData.sections.length > 0) {
      rawSections = serverData.sections
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      [
        "best-brand",
        "special-combos",
        "hair-care-showcase",
        "makeup-showcase",
        "shop-by-origin",
      ].forEach((comp) => {
        if (!rawSections.find((s) => s.componentId === comp)) {
          const prevMap = {
            "best-brand": "best-sellers",
            "special-combos": "best-brand",
            "hair-care-showcase": "special-combos",
            "makeup-showcase": "hair-care-showcase",
            "shop-by-origin": "makeup-showcase",
          };
          const prevIdx = rawSections.findIndex(
            (s) => s.componentId === prevMap[comp],
          );
          const injectIdx = prevIdx !== -1 ? prevIdx + 1 : 4;
          rawSections.splice(injectIdx, 0, {
            componentId: comp,
            isActive: true,
            settings: {},
          });
        }
      });

      // Ensure specific sections are in preferred positions
      const bestSellersIdx = rawSections.findIndex(
        (s) => s.componentId === "best-sellers",
      );
      const upcomingDropsIdx = rawSections.findIndex(
        (s) => s.componentId === "upcoming-drops",
      );
      if (bestSellersIdx !== -1 && upcomingDropsIdx !== -1) {
        const [drops] = rawSections.splice(upcomingDropsIdx, 1);
        const newBestSellersIdx = rawSections.findIndex(
          (s) => s.componentId === "best-sellers",
        );
        rawSections.splice(newBestSellersIdx + 1, 0, drops);
      }

      // Ensure specific sections are at the absolute bottom
      [
        "shop-by-offer",
        "request-product",
        "offline-store",
        "skin-quiz",
      ].forEach((compId) => {
        const idx = rawSections.findIndex((s) => s.componentId === compId);
        if (idx !== -1) {
          const [sect] = rawSections.splice(idx, 1);
          rawSections.push(sect);
        } else {
          rawSections.push({
            componentId: compId,
            isActive: true,
            settings: {},
          });
        }
      });

      return rawSections.filter((s) => s.componentId !== "shop-by-category");
    }
    return STATIC_FALLBACK_ORDER.filter((id) => id !== "shop-by-category").map(
      (id) => ({ componentId: id, isActive: true, settings: {} }),
    );
  }, [serverData]);

  const renderSection = useCallback(
    (section) => {
      const { componentId, settings } = section;
      const key = `${componentId}-${section.sortOrder || 0}`;

      let content = null;
      switch (componentId) {
        case "hero-slider":
          const displaySlides = adminBanners
            ? adminBanners
                .filter((b) => b.active)
                .map((b) => ({
                  imageUrl: b.img,
                  title: b.title,
                  subtitle: b.sub,
                }))
            : settings?.slides?.length > 0
              ? settings.slides
              : null;

          return (
            <HeroSlider
              key={key}
              onNavigate={onNavigate}
              customSlides={displaySlides}
            />
          );

        case "upcoming-drops":
          let onlineDropProducts = settings?.products || [];
          if (onlineDropProducts.length === 0) {
            onlineDropProducts = PRODUCTS.filter((p) => p.isPreOrder);
          }
          const processedDropProducts = onlineDropProducts
            .filter((p) => p.showOnline !== false)
            .map((sp) => {
              const fullProduct =
                PRODUCTS.find((p) => String(p.id) === String(sp.id)) || {};
              return {
                ...sp,
                id: sp.id || fullProduct.id,
                name: sp.name || fullProduct.name,
                imageUrl:
                  sp.image ||
                  sp.imageUrl ||
                  fullProduct.image ||
                  (fullProduct.imageUrls && fullProduct.imageUrls[0]) ||
                  "",
                price: sp.price || fullProduct?.price || 0,
                originalPrice:
                  sp.originalPrice ||
                  fullProduct?.originalPrice ||
                  fullProduct?.price ||
                  sp.price ||
                  0,
                description:
                  sp.description || fullProduct?.description || sp.name || "",
                launchDate:
                  sp.launchDate || fullProduct.releaseDate || "Coming Soon",
              };
            });
          content = (
            <UpcomingDrops
              onNavigate={onNavigate}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              deadline={settings?.deadline}
              title={section.title || settings?.promoText}
              products={processedDropProducts}
            />
          );
          break;

        case "shop-by-category":
          const customCategories =
            settings?.categories && settings.categories.length > 0
              ? settings.categories
              : null;
          const autoCategories =
            dynamicCategories.length > 0
              ? dynamicCategories.map((c) => ({
                  label: c.name,
                  image: CATEGORY_IMAGES[c.name] || categorySphere,
                }))
              : undefined;
          content = (
            <ByCategory
              onNavigate={onNavigate}
              onSelectCategory={onSelectCategory}
              bgColor={settings?.bgColor}
              title={section.title}
              categories={customCategories || autoCategories}
              maxItems={settings?.maxItems}
            />
          );
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
          content = (
            <ComboSection
              addToCart={addToCart}
              onNavigate={onNavigate}
              products={settings?.products}
            />
          );
          break;

        case "offline-store":
          content = <OfflineStore />;
          break;

        case "shop-by-origin":
          content = <ShopByOrigin settings={settings} products={PRODUCTS} />;
          break;

        case "shop-by-brand":
          content = (
            <ShopByBrand
              onSelectBrand={onSelectBrand}
              title={section.title}
              maxItems={settings?.maxItems}
              bgColor={settings?.bgColor}
              hiddenBrands={settings?.hiddenBrands}
            />
          );
          break;

        case "by-skin-concern":
          content = (
            <BySkinConcern
              onSelectConcern={onSelectConcern}
              title={section.title}
              bgColor={settings?.bgColor}
            />
          );
          break;

        case "new-arrivals":
          content = (
            <NewArrivalsSection
              onNavigate={onNavigate}
              title={section.title}
              maxItems={settings?.maxItems}
              bgColor={settings?.bgColor}
            />
          );
          break;

        case "watch-and-shop":
          content = (
            <WatchAndShop
              onNavigate={onNavigate}
              videoUrl={settings?.videoUrl}
              includedProducts={settings?.productsCsv}
              title={section.title}
            />
          );
          break;

        case "limited-offer":
          content = (
            <LimitedOfferBanner
              onNavigate={onNavigate}
              addToCart={addToCart}
              user={user}
            />
          );
          break;

        case "shop-by-offer":
          content = (
            <ByOffer
              onNavigate={onNavigate}
              onSelectOffer={onSelectOffer}
              title={section.title}
              maxItems={settings?.maxItems}
              bgColor={settings?.bgColor}
            />
          );
          break;

        case "skin-quiz":
          content = (
            <SkinQuiz
              headline={settings?.headline}
              targetUrl={settings?.link}
            />
          );
          break;

        case "promotional-banner":
          content = (
            <PromotionalBanner
              title={section.title || settings?.title}
              subtitle={settings?.subtitle}
              products={settings?.products || []}
              bgColor={settings?.bgColor}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              onNavigate={onNavigate}
            />
          );
          break;
      }

      return content ? (
        <LazySection key={key} minHeight="400px">
          {content}
        </LazySection>
      ) : null;
    },
    [
      onNavigate,
      addToCart,
      wishlist,
      toggleWishlist,
      inventoryProducts,
      onSelectCategory,
      onSelectBrand,
      onSelectConcern,
      onSelectOffer,
      PRODUCTS,
      dynamicCategories,
    ],
  );

  if (loading) return null;

  return <main>{sections.map((section) => renderSection(section))}</main>;
});

export default HomePage;
