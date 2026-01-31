import { useState, useEffect } from "react";
import darkspotImg from "./assets/skinconcern/darkspot.jpg";
import hydrationImg from "./assets/skinconcern/hydration.jpg";
import poresImg from "./assets/skinconcern/skin pores.jpg";
import acneImg from "./assets/skinconcern/acne and breakout.JPG";
import dullnessImg from "./assets/skinconcern/dullness.jpeg";
import sensitiveImg from "./assets/skinconcern/sensitive.jpg";
import oilControlImg from "./assets/skinconcern/oilyskin.jpg";
import rednessImg from "./assets/skinconcern/skinredness.jpg";
import antiAgingImg from "./assets/skinconcern/antiaging.jpg";
import sunImg from "./assets/skinconcern/sunprotection.jpg";

const CONCERNS = [
  {
    key: "acne",
    label: "Acne & Breakouts",
    desc: "Clarify + calm",
    gradient: "linear-gradient(135deg, #dcf7f0 0%, #e7fff6 55%, #f7fffb 100%)",
  },
  {
    key: "dark-spots",
    label: "Dark Spots",
    desc: "Brighten tone",
    gradient: "linear-gradient(135deg, #fff2dc 0%, #ffe7c8 55%, #fff7e8 100%)",
  },
  {
    key: "dullness",
    label: "Dullness",
    desc: "Glow boost",
    gradient: "linear-gradient(135deg, #ffe9c9 0%, #fff3db 55%, #fff9ee 100%)",
  },
  {
    key: "hydration",
    label: "Hydration",
    desc: "Deep moisture",
    gradient: "linear-gradient(135deg, #e6f3ff 0%, #eaf7ff 55%, #f5fbff 100%)",
  },
  {
    key: "sensitive",
    label: "Sensitive Skin",
    desc: "Barrier care",
    gradient: "linear-gradient(135deg, #efe9ff 0%, #f6f1ff 55%, #fbf8ff 100%)",
  },
  {
    key: "pores",
    label: "Pores",
    desc: "Refine look",
    gradient: "linear-gradient(135deg, #e7f0ff 0%, #eef5ff 55%, #f7faff 100%)",
  },
  {
    key: "oil-control",
    label: "Oil Control",
    desc: "Balance shine",
    gradient: "linear-gradient(135deg, #e5fff3 0%, #effff8 55%, #f7fffb 100%)",
  },
  {
    key: "redness",
    label: "Redness",
    desc: "Soothe skin",
    gradient: "linear-gradient(135deg, #ffe5ea 0%, #ffedf1 55%, #fff5f8 100%)",
  },
  {
    key: "anti-aging",
    label: "Anti-Aging",
    desc: "Smooth lines",
    gradient: "linear-gradient(135deg, #ffe2ec 0%, #ffe9f1 55%, #fff5f9 100%)",
  },
  {
    key: "sun",
    label: "Sun Protection",
    desc: "Daily SPF",
    gradient: "linear-gradient(135deg, #fff6d7 0%, #fffbdf 55%, #fffdf0 100%)",
  },
];

const FEATURED = {
  key: "acne",
  label: "Most searched: Acne & Breakouts",
  desc: "Shop now",
  gradient: "linear-gradient(135deg, #e2f9f3 0%, #f0fffb 55%, #ffffff 100%)",
};


const ICONS = {
  acne: (
    <img src={acneImg} alt="Acne & Breakouts" className="w-full h-full object-cover" />
  ),
  "dark-spots": (
    <img src={darkspotImg} alt="Dark Spots" className="w-full h-full object-cover" />
  ),
  dullness: (
    <img src={dullnessImg} alt="Dullness" className="w-full h-full object-cover" />
  ),
  hydration: (
    <img src={hydrationImg} alt="Hydration" className="w-full h-full object-cover" />
  ),
  sensitive: (
    <img src={sensitiveImg} alt="Sensitive Skin" className="w-full h-full object-cover" />
  ),
  pores: (
    <img src={poresImg} alt="Pores" className="w-full h-full object-cover" />
  ),
  "oil-control": (
    <img src={oilControlImg} alt="Oil Control" className="w-full h-full object-cover" />
  ),
  redness: (
    <img src={rednessImg} alt="Redness" className="w-full h-full object-cover" />
  ),
  "anti-aging": (
    <img src={antiAgingImg} alt="Anti-Aging" className="w-full h-full object-cover" />
  ),
  sun: (
    <img src={sunImg} alt="Sun Protection" className="w-full h-full object-cover" />
  ),
};

export default function BySkinConcern() {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSelected(params.get("concern") || "");
    }
  }, []);

  function applyFilter(key) {
    setSelected(key);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("concern", key);
    window.history.replaceState({}, "", url);
  }

  return (
    <section className="py-[56px]" aria-labelledby="skin-concern-title">
      <div className="w-full px-0 sm:px-[10px] flex flex-col gap-[22px]">
        <header className="text-center max-w-[640px] mx-auto">
          <h2 id="skin-concern-title" className="m-[0_0_8px] text-[28px] font-[700] tracking-[-0.4px]">Shop by Skin Concern</h2>
          <p className="m-0 text-muted-custom text-[15px]">Find products tailored to your skin goals—fast.</p>
        </header>

        <div className="grid gap-[16px] no-scrollbar grid-flow-col grid-rows-[repeat(2,minmax(148px,1fr))] auto-cols-[180px] overflow-x-auto pb-[6px] snap-x snap-mandatory lg:grid-flow-row lg:grid-cols-[repeat(5,minmax(160px,1fr))] lg:grid-rows-none lg:overflow-visible lg:pb-0 lg:auto-cols-auto" role="list">
          {/* Featured Card */}
          <button
            type="button"
            role="listitem"
            className="relative cursor-pointer appearance-none rounded-[18px] shadow-[0_10px_22px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center gap-[10px] text-inherit transition-all duration-180 ease-out hover:-translate-y-[4px] hover:shadow-[0_16px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(255,255,255,0.9)] focus-visible:outline-2 focus-visible:outline-black/40 focus-visible:outline-offset-3 font-inherit min-h-[168px] lg:col-span-2 lg:row-span-2 lg:min-h-[196px] p-[18px] snap-start group"
            style={{ background: FEATURED.gradient }}
            onClick={() => applyFilter(FEATURED.key)}
            aria-pressed={selected === FEATURED.key}
          >
            <span className="text-[11px] tracking-[1px] uppercase font-[700] text-[#1b1b1b]">Featured</span>
            <div className="w-[44px] h-[44px] rounded-[14px] grid place-items-center bg-white/70 border border-black/5 transition-transform duration-180 ease-out group-hover:scale-105 [&>svg]:w-[26px] [&>svg]:h-[26px] [&>svg]:fill-none [&>svg]:stroke-[#1b1b1b] [&>svg]:stroke-[1.6] [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round">{ICONS.acne}</div>
            <div className="text-[18px] font-[900] leading-[1.2]">{FEATURED.label}</div>
            <div className="inline-flex items-center gap-[6px] text-[12px] font-[700] uppercase tracking-[0.6px] text-[#1b1b1b]">
              {FEATURED.desc}
              <span className="inline-block transform -translate-y-[1px]">-&gt;</span>
            </div>

          </button>

          {/* All Concerns */}
          {CONCERNS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="listitem"
              className={`relative cursor-pointer appearance-none rounded-[18px] shadow-[0_10px_22px_rgba(0,0,0,0.08)] flex flex-col text-center transition-all duration-180 ease-out hover:-translate-y-[4px] hover:shadow-[0_16px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(255,255,255,0.9)] focus-visible:outline-2 focus-visible:outline-black/40 focus-visible:outline-offset-3 font-inherit min-h-[148px] snap-start group ${['dark-spots', 'hydration', 'pores', 'acne', 'dullness', 'sensitive', 'oil-control', 'redness', 'anti-aging', 'sun'].includes(item.key) ? 'p-0 items-stretch overflow-hidden' : 'items-center justify-center gap-[8px] p-[16px]'
                }`}
              style={{ background: item.gradient }}
              onClick={() => applyFilter(item.key)}
              aria-pressed={selected === item.key}
            >
              {['dark-spots', 'hydration', 'pores', 'acne', 'dullness', 'sensitive', 'oil-control', 'redness', 'anti-aging', 'sun'].includes(item.key) ? (
                <>
                  <div className="w-full flex-1 overflow-hidden">
                    {ICONS[item.key]}
                  </div>
                  <div className="w-full flex-none flex flex-col items-center justify-center pt-[8px] pb-[7px] px-[4px]">
                    <div className="font-[800] text-[15px] text-[#1b1b1b] leading-tight mb-[2px]">{item.label}</div>
                    <div className="text-[12px] font-[600] text-[#6f6f6f] tracking-[0.3px] uppercase">{item.desc}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-[44px] h-[44px] rounded-[14px] grid place-items-center bg-white/70 border border-black/5 transition-transform duration-180 ease-out group-hover:scale-105 [&>svg]:w-[26px] [&>svg]:h-[26px] [&>svg]:fill-none [&>svg]:stroke-[#1b1b1b] [&>svg]:stroke-[1.6] [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round">{ICONS[item.key]}</div>
                  <div className="font-[800] text-[14px]">{item.label}</div>
                  {item.desc ? <div className="text-[12px] text-[#6f6f6f]">{item.desc}</div> : null}
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
