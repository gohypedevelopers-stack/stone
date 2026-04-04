import React from "react";
import { ArrowRight } from "lucide-react";

// Importing the full-bleed 3D cover assets
import forYouCover from "./assets/deals/deal_foryou_cover_1775217507516.png";
import priceCrashCover from "./assets/deals/deal_pricecrash_cover_1775217530208.png";
import summerCover from "./assets/deals/deal_summer_cover_1775217551374.png";
import sixtyOffCover from "./assets/deals/deal_sixty_off_cover_1775217572881.png";
import whatsNewCover from "./assets/deals/deal_whatsnew_cover_1775217591061.png";
import bogoCover from "./assets/deals/deal_bogo_cover_1775217893960.png";
import comboCover from "./assets/deals/deal_combo_cover_1775217916124.png";
import weekendCover from "./assets/deals/deal_weekend_cover_1775217937431.png";
import coinImg from "./assets/deals/deal_coin_icon_1775216787595.png";

const OFFERS = [
  {
    id: "foryou",
    label1: "FOR",
    label2: "YOU",
    image: forYouCover,
    link: "for-you",
  },
  {
    id: "pricecrash",
    label1: "PRICE",
    label2: "CRASH",
    image: priceCrashCover,
    link: "price-crash",
  },
  {
    id: "summer",
    label1: "SUMMER",
    label2: "SPECIALS",
    image: summerCover,
    link: "summer-specials",
  },
  {
    id: "sixty",
    label1: "MIN",
    label2: "60% OFF",
    image: sixtyOffCover,
    link: "min-60-off",
  },
  {
    id: "whatsnew",
    label1: "WHAT'S",
    label2: "NEW",
    image: whatsNewCover,
    link: "whats-new",
  },
  {
    id: "bogo",
    label1: "GET 1",
    label2: "FREE BOGO",
    image: bogoCover,
    link: "bogo",
  },
  {
    id: "combo",
    label1: "COMBO",
    label2: "DEALS",
    image: comboCover,
    link: "combo-deals",
  },
  {
    id: "weekend",
    label1: "WEEKEND",
    label2: "SPECIALS",
    image: weekendCover,
    link: "weekend-specials",
  },
];

export default React.memo(function ByOffer({ onNavigate, onSelectOffer }) {
  function handleOfferClick(link) {
    if (link === "for-you") {
      if (onNavigate) onNavigate("wishlist");
      return;
    }

    if (onSelectOffer) {
      onSelectOffer(link);
    } else if (onNavigate) {
      onNavigate(`shop?offer=${link}`);
    }
  }

  return (
    <section className="py-16 md:py-24 bg-[#fafafa] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header Section - Centered */}
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12 space-y-2 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-[48px] font-black text-[#D32F2F] tracking-tighter uppercase flex flex-wrap items-center justify-center gap-x-2 gap-y-1 drop-shadow-sm text-center leading-tight">
            <span className="whitespace-nowrap">Explore M</span>
            <img 
              src={coinImg} 
              alt="O" 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain animate-bounce-subtle"
            />
            <span className="whitespace-nowrap">re Deals</span>
          </h2>
          <div className="h-0.5 w-16 md:w-20 bg-[#FFB300] rounded-full opacity-60" />
        </div>
      </div>

      {/* End-to-End Horizontal Scroll Container */}
      <div className="relative w-full">
        <div className="flex gap-4 md:gap-7 overflow-x-auto pb-10 pt-2 px-6 md:px-[calc((100vw-1440px)/2+24px)] no-scrollbar snap-x snap-mandatory">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              onClick={() => handleOfferClick(offer.link)}
              className="shrink-0 w-[140px] md:w-[170px] aspect-[1/1.25] bg-white rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-2.5 transition-all duration-700 cursor-pointer snap-start overflow-hidden group relative border border-stone-100/50"
            >
              {/* Full-Bleed Image Cover */}
              <img
                src={offer.image}
                alt={offer.label1}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              
              {/* Dark Overlay for Text Legibility - Bottom Aligned */}
              <div className="absolute inset-x-0 bottom-0 pt-16 pb-6 px-4 bg-linear-to-t from-black/95 via-black/40 to-transparent backdrop-blur-[0.5px] opacity-85 group-hover:opacity-100 transition-opacity duration-500">
                <div className="text-left leading-none">
                  <div className="text-[10px] md:text-[11px] font-black text-rose-300 tracking-[0.15em] uppercase mb-1.5 opacity-80">
                    {offer.label1}
                  </div>
                  <div className="text-[13px] md:text-[15px] font-black text-white tracking-widest uppercase leading-[1.1]">
                    {offer.label2}
                  </div>
                </div>
              </div>

              {/* Interaction Shine Effect */}
              <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
          
          {/* Matching 'View All' Card - Final Item */}
          <div
            onClick={() => onNavigate && onNavigate("shop")}
            className="shrink-0 w-[140px] md:w-[170px] aspect-[1/1.25] bg-linear-to-br from-[#D32F2F] to-[#FF5252] rounded-[28px] shadow-lg hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-700 cursor-pointer snap-start flex flex-col items-center justify-center p-6 text-white group overflow-hidden relative"
          >
            {/* Animated Reflection */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            
            <div className="w-13 h-13 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)]">
              <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-center leading-[1.2] opacity-90">
              Explore All<br />Exclusive<br />Offers
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/15 transition-all duration-700" />
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
});
