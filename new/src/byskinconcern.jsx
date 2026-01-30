import { useState, useEffect } from "react";

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
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 1 0 16 0" />
      <path d="M9 10h.01M12 8h.01M15 11h.01" />
      <path d="M8 16c1.6 1.2 3.5 1.6 5.8 1.2" />
    </svg>
  ),
  "dark-spots": (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 4h10l-1.2 6H8.2L7 4z" />
      <path d="M9.5 13.5h5M11 16h2" />
      <circle cx="12" cy="6.5" r="1.2" />
    </svg>
  ),
  dullness: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3v3M12 18v3M4 12h3M17 12h3" />
      <path d="M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  hydration: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3c3.8 4 6 6.6 6 10a6 6 0 1 1-12 0c0-3.4 2.2-6 6-10z" />
    </svg>
  ),
  sensitive: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3l7 4v5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V7l7-4z" />
      <path d="M9.5 12.2l1.8 1.8L14.8 10" />
    </svg>
  ),
  pores: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="7" cy="8" r="2.2" />
      <circle cx="16.5" cy="7" r="1.6" />
      <circle cx="12.5" cy="13.5" r="2.4" />
      <circle cx="7.5" cy="16.5" r="1.6" />
    </svg>
  ),
  "oil-control": (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 5h10M6 9h12M8 13h8" />
      <path d="M12 19c-3 0-5-2-5-4h10c0 2-2 4-5 4z" />
    </svg>
  ),
  redness: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 14c2.5 0 3.5-4 6-4s3.5 4 6 4" />
      <path d="M5 6c2 1 4 1 6 0" />
      <path d="M13 6c2 1 4 1 6 0" />
    </svg>
  ),
  "anti-aging": (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4l2.2 4.5L19 9l-3.6 3.4L16 17l-4-2.2L8 17l.6-4.6L5 9l4.8-.5L12 4z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.2 2.2M17.6 17.6l2.2 2.2M2 12h3M19 12h3M4.2 19.8l2.2-2.2M17.6 6.4l2.2-2.2" />
    </svg>
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
              className="relative cursor-pointer appearance-none rounded-[18px] shadow-[0_10px_22px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center gap-[8px] text-inherit transition-all duration-180 ease-out hover:-translate-y-[4px] hover:shadow-[0_16px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(255,255,255,0.9)] focus-visible:outline-2 focus-visible:outline-black/40 focus-visible:outline-offset-3 font-inherit min-h-[148px] p-[16px] snap-start group"
              style={{ background: item.gradient }}
              onClick={() => applyFilter(item.key)}
              aria-pressed={selected === item.key}
            >
              <div className="w-[44px] h-[44px] rounded-[14px] grid place-items-center bg-white/70 border border-black/5 transition-transform duration-180 ease-out group-hover:scale-105 [&>svg]:w-[26px] [&>svg]:h-[26px] [&>svg]:fill-none [&>svg]:stroke-[#1b1b1b] [&>svg]:stroke-[1.6] [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round">{ICONS[item.key]}</div>
              <div className="font-[800] text-[14px]">{item.label}</div>
              {item.desc ? <div className="text-[12px] text-[#6f6f6f]">{item.desc}</div> : null}

            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
