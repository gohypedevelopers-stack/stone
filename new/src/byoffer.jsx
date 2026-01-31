import { useState } from "react";
import { SparklesText } from "./components/ui/sparkles-text";

const OFFERS = [
  {
    id: "flat20",
    label: "Flat 20% Off",
    sub: "On orders above ₹999",
    badge: "Hot",
    gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    link: "flat-20",
  },
  {
    id: "bogo",
    label: "Buy 1 Get 1",
    sub: "Select serums only",
    badge: "Ends Today",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    link: "bogo",
  },
  {
    id: "under499",
    label: "Under ₹499",
    sub: "Budget friendly picks",
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    link: "under-499",
  },
  {
    id: "combo",
    label: "Combo Deals",
    sub: "routine bundles",
    badge: "Value",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    link: "combo-deals",
  },
  
  
  
  {
    id: "weekend",
    label: "Weekend Specials",
    sub: "Flash sale live now",
    gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    link: "weekend-specials",
  },
  {
    id: "limited",
    label: "Limited Time",
    sub: "Grab before it's gone",
    badge: "Urgent",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    link: "limited-time",
  },
];

const FEATURED = {
  id: "mega",
  label: "Mega Sale — Up to 60% Off",
  sub: "Shop Deals",
  gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  link: "mega-sale",
};

export default function ByOffer() {
  function handleOfferClick(link) {
    if (typeof window !== "undefined") {
      window.location.href = `/shop?offer=${link}`;
    }
  }

  return (
    <section className="py-[56px]">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="text-center mb-[32px]">
          <SparklesText
            text="Shop by Offer"
            className="text-[40px] leading-tight"
            colors={{ first: "#FF4FA3", second: "#efd31eff", third: "#184ac0ff", fourth: "#ff4f4fff" }}
          />
          <p className="text-muted-custom m-0 text-[15px]">Save more with limited-time offers, bundles, and best-value picks.</p>
        </div>

        <div className="grid gap-[16px] grid-flow-col grid-rows-[repeat(2,180px)] auto-cols-[240px] overflow-x-auto pb-[12px] snap-x snap-mandatory no-scrollbar md:grid-flow-row md:grid-cols-4 md:grid-rows-auto md:overflow-visible md:pb-0 md:auto-cols-auto">
          {/* Featured Card */}
          <div
            className="relative rounded-[20px] p-[24px] flex flex-col justify-between min-h-full md:min-h-[180px] border border-black/6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-[#1b1b1b] transition-all duration-300 cubic-[0.25,0.8,0.25,1] overflow-hidden cursor-pointer hover:-translate-y-[4px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] active:scale-98 md:active:scale-100 md:col-span-2 snap-start group min-w-[240px] md:min-w-0"
            style={{ background: FEATURED.gradient }}
            onClick={() => handleOfferClick(FEATURED.link)}
            role="button"
            tabIndex={0}
          >
            <div className="mt-auto">
              <div className="text-[24px] font-[800] mb-[4px] leading-[1.2] max-w-[80%]">{FEATURED.label}</div>
              <div className="text-[13px] text-black/70 font-[500] flex items-center gap-[4px]">
                {FEATURED.sub} <span className="transition-transform duration-200 ease-out group-hover:translate-x-[4px]">→</span>
              </div>
            </div>
          </div>

          {/* Regular Cards */}
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="relative rounded-[20px] p-[24px] flex flex-col justify-between min-h-full md:min-h-[180px] border border-black/6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-[#1b1b1b] transition-all duration-300 cubic-[0.25,0.8,0.25,1] overflow-hidden cursor-pointer hover:-translate-y-[4px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] active:scale-98 md:active:scale-100 snap-start group"
              style={{ background: offer.gradient }}
              onClick={() => handleOfferClick(offer.link)}
              role="button"
              tabIndex={0}
            >
              {offer.badge && <span className="absolute top-[16px] right-[16px] bg-[#1b1b1b] text-white text-[10px] font-[700] px-[8px] py-[4px] rounded-[99px] uppercase tracking-[0.5px]">{offer.badge}</span>}
              <div className="mt-auto">
                <div className="text-[18px] font-[800] mb-[4px] leading-[1.2]">{offer.label}</div>
                <div className="text-[13px] text-black/70 font-[500] flex items-center gap-[4px]">
                  {offer.sub} <span className="transition-transform duration-200 ease-out group-hover:translate-x-[4px]">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
