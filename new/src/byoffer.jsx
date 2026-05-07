import React, { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ChevronRight,
} from "lucide-react";

// Importing the full-bleed 3D cover assets
import forYouCover from "./assets/deals/deal_foryou_cover_1775217507516.png";
import priceCrashCover from "./assets/deals/deal_pricecrash_cover_1775217530208.png";
import summerCover from "./assets/deals/deal_summer_cover_1775217551374.png";
import whatsNewCover from "./assets/deals/deal_whatsnew_cover_1775217591061.png";
import comboCover from "./assets/deals/deal_combo_cover_1775217916124.png";
import weekendCover from "./assets/deals/deal_weekend_cover_1775217937431.png";

import { useProducts } from "./context/ProductContext.jsx";
import { resolveImage } from "./utils/urlHelper";

const OFFER_META = {
  foryou: {
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    image: forYouCover,
  },
  pricecrash: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    image: priceCrashCover,
  },
  summer: {
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    image: summerCover,
  },

  whatsnew: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    image: whatsNewCover,
  },
  combo: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    image: comboCover,
  },
  weekend: {
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    image: weekendCover,
  },
};

export default React.memo(function ByOffer({ onNavigate, onSelectOffer }) {
  const { sections, products } = useProducts();
  const containerRef = useRef(null);

  const offerSection = sections.find((s) => s.componentId === "shop-by-offer");

  const OFFERS = React.useMemo(() => {
    if (offerSection?.settings?.offers?.length > 0) {
      return offerSection.settings.offers.map((o) => ({
        ...o,
        image: o.image || (OFFER_META[o.id]?.image || forYouCover),
      }));
    }

    return [
      { id: "foryou", label1: "FOR", label2: "YOU", link: "for-you" },
      {
        id: "pricecrash",
        label1: "PRICE",
        label2: "CRASH",
        link: "price-crash",
      },
      {
        id: "summer",
        label1: "SUMMER",
        label2: "SPECIALS",
        link: "summer-specials",
      },

      {
        id: "whatsnew",
        label1: "WHAT'S",
        label2: "NEW",
        link: "new-arrivals",
      },
      {
        id: "combo",
        label1: "COMBO",
        label2: "DEALS",
        link: "combo-deals",
      },
      {
        id: "weekend",
        label1: "WEEKEND",
        label2: "SPECIALS",
        link: "weekend-specials",
      },
    ];
  }, [offerSection, products]);

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // GSAP Entrance
  useGSAP(
    () => {
      gsap.from(".compact-offer-card", {
        scale: 0.9,
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
      });
    },
    { scope: containerRef },
  );

  function handleOfferClick(link) {
    if (dragDistance > 10) return;
    if (link === "for-you") {
      if (onNavigate) onNavigate("wishlist");
      return;
    }
    if (link === "new-arrivals") {
      if (onNavigate) onNavigate("new-arrivals");
      return;
    }
    if (onSelectOffer) {
      onSelectOffer(link);
    } else if (onNavigate) {
      onNavigate(`shop?offer=${link}`);
    }
  }

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.max(dragDistance, Math.abs(x - startX)));
  };

  return (
    <section
      ref={containerRef}
      className="py-16 md:py-20 bg-white overflow-hidden relative"
    >
      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">
                Limited Drops
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter uppercase leading-none">
              Explore More{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600 italic">
                Deals
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="relative w-full group/container z-10">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-5 md:gap-7 overflow-x-auto pb-16 pt-4 px-6 md:px-[calc((100vw-1440px)/2+24px)] no-scrollbar ${
            isDragging
              ? "cursor-grabbing select-none"
              : "cursor-grab snap-x snap-mandatory scroll-smooth"
          }`}
        >
          {OFFERS.map((offer) => {
            const meta = OFFER_META[offer.id] || OFFER_META.foryou;
            const image = offer.image || meta.image;

            return (
              <div
                key={offer.id}
                onClick={() => handleOfferClick(offer.link)}
                className="compact-offer-card shrink-0 w-[160px] md:w-[210px] group cursor-pointer snap-start"
              >
                <div
                  className={`relative h-[210px] md:h-[270px] rounded-[40px] transition-all duration-700 bg-stone-100 border ${meta.border} group-hover:scale-[1.04] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden`}
                >
                  {/* High Opacity Background Image */}
                  <img
                    src={image}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = meta.image;
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                  />

                  {/* Glassmorphism Navigation Panel */}
                  <div className="mt-auto relative z-20 p-4 mx-3 mb-3 bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/40 shadow-xl group-hover:-translate-y-1 transition-transform duration-500">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ${meta.color} mb-0.5`}
                        >
                          {offer.label1}
                        </p>
                        <h3 className="text-xs md:text-sm font-black text-stone-900 uppercase leading-none tracking-tight truncate">
                          {offer.label2}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
        }}
      />
    </section>
  );
});
