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

const styles = `
.skinConcernSection {
  padding: 56px 0;
}
.skinConcernInner {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.skinConcernHead {
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
}
.skinConcernHead h2 {
  margin: 0 0 8px;
  font-size: 28px;
  letter-spacing: -0.4px;
}
.skinConcernHead p {
  margin: 0;
  color: #6f6f6f;
  font-size: 15px;
}
.skinConcernScroller {
  display: grid;
  gap: 16px;
}
.skinConcernScroller {
  scrollbar-width: none;
}
.skinConcernScroller::-webkit-scrollbar {
  display: none;
}
.skinConcernCard {
  position: relative;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--card-bg, #ffffff);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
  min-height: 148px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  font-family: inherit;
  color: inherit;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.skinConcernCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.12), 0 0 20px rgba(255, 255, 255, 0.9);
}
.skinConcernCard:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.4);
  outline-offset: 3px;
}
.skinConcernCard.selected {
  border: 2px solid rgba(0, 0, 0, 0.18);
}
.skinConcernIcon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.18s ease;
}
.skinConcernIcon svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: #1b1b1b;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.skinConcernCard:hover .skinConcernIcon {
  transform: scale(1.05);
}
.skinConcernLabel {
  font-weight: 800;
  font-size: 14px;
}
.skinConcernDesc {
  font-size: 12px;
  color: #6f6f6f;
}
.skinConcernCheck {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}
.skinConcernCheck svg {
  width: 12px;
  height: 12px;
  stroke: #ffffff;
  stroke-width: 2.2;
}
.skinConcernCard.featured {
  min-height: 196px;
  padding: 18px;
  gap: 10px;
  grid-column: span 1;
  grid-row: span 1;
}
.skinConcernFeaturedTag {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 700;
  color: #1b1b1b;
}
.skinConcernFeaturedTitle {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
}
.skinConcernFeaturedCta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #1b1b1b;
}
.skinConcernFeaturedArrow {
  display: inline-block;
  transform: translateY(-1px);
}

@media (min-width: 980px) {
  .skinConcernScroller {
    grid-template-columns: repeat(5, minmax(160px, 1fr));
  }
  .skinConcernCard.featured {
    grid-column: span 2;
    grid-row: span 2;
  }
}

@media (max-width: 980px) {
  .skinConcernScroller {
    grid-auto-flow: column;
    grid-template-rows: repeat(2, minmax(148px, 1fr));
    grid-auto-columns: 180px;
    overflow-x: auto;
    padding-bottom: 6px;
    scroll-snap-type: x mandatory;
  }
  .skinConcernCard {
    scroll-snap-align: start;
  }
  .skinConcernCard.featured {
    min-height: 168px;
    grid-column: auto;
    grid-row: span 2;
  }
}
`;

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
    <section className="skinConcernSection" aria-labelledby="skin-concern-title">
      <style>{styles}</style>
      <div className="container skinConcernInner">
        <header className="skinConcernHead">
          <h2 id="skin-concern-title">Shop by Skin Concern</h2>
          <p>Find products tailored to your skin goals—fast.</p>
        </header>

        <div className="skinConcernScroller" role="list">
          {/* Featured Card */}
          <button
            type="button"
            role="listitem"
            className={`skinConcernCard featured ${selected === FEATURED.key ? "selected" : ""}`}
            style={{ "--card-bg": FEATURED.gradient }}
            onClick={() => applyFilter(FEATURED.key)}
            aria-pressed={selected === FEATURED.key}
          >
            <span className="skinConcernFeaturedTag">Featured</span>
            <div className="skinConcernIcon">{ICONS.acne}</div>
            <div className="skinConcernFeaturedTitle">{FEATURED.label}</div>
            <div className="skinConcernFeaturedCta">
              {FEATURED.desc}
              <span className="skinConcernFeaturedArrow">-&gt;</span>
            </div>
            {selected === FEATURED.key && (
              <span className="skinConcernCheck" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M3 8l3 3 7-7" fill="none" />
                </svg>
              </span>
            )}
          </button>

          {/* All Concerns */}
          {CONCERNS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="listitem"
              className={`skinConcernCard ${selected === item.key ? "selected" : ""}`}
              style={{ "--card-bg": item.gradient }}
              onClick={() => applyFilter(item.key)}
              aria-pressed={selected === item.key}
            >
              <div className="skinConcernIcon">{ICONS[item.key]}</div>
              <div className="skinConcernLabel">{item.label}</div>
              {item.desc ? <div className="skinConcernDesc">{item.desc}</div> : null}
              {selected === item.key && (
                <span className="skinConcernCheck" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="M3 8l3 3 7-7" fill="none" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
