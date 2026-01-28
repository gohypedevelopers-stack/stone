import banner8 from "./assets/9.png";

const CATEGORIES = [
  "B.b cream",
  "Blender",
  "Blush",
  "Brush",
  "Cleanser",
  "cleansing oil",
  "compact powders",
  "Concealer",
  "Cushion foundation",
  "Essence",
  "Exfoliate",
  "Eye cream",
  "Face mists",
  "Foundation",
  "Hair set",
  "International makeup",
  "International skincare",
  "Japanese Skincare",
  "Korean skincare",
  "Lip blam",
  "Lipstick",
  "Makeup remover",
  "Mascara",
  "Moisturizer",
  "Primer",
  "Razor",
  "Serums",
  "Sheet masks",
  "SKIN1004",
  "Sunscreen",
  "Sunspray",
  "Sunstick",
  "toner",
  "toner pads",
  "Treatment mask",
];

export default function ByCategory() {
  const rows = [
    { visible: 7, items: CATEGORIES.slice(0, 14) },
    { visible: 5, items: CATEGORIES.slice(14, 26) },
    { visible: 3, items: CATEGORIES.slice(26, 35) },
  ];

  return (
    <section className="byCategory">
      <div className="container">
        <div className="byCategoryStage">
          <div className="byCategoryHead">
            <span className="byCategoryTitle">
              Shop by <span className="byCategoryAccent">Category</span>
            </span>
          </div>

          <div className="byCategoryGrid">
            {rows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="byCategorySlider"
                style={{ "--visible": row.visible }}
              >
                {row.items.map((label) => (
                  <div key={label} className="byCategoryCard">
                    <div className="byCategoryImage" aria-hidden="true" />
                    <div className="byCategoryLabel">{label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="byCategoryBanner">
          <img src={banner8} alt="Featured skincare banner" />
        </div>
      </div>
    </section>
  );
}
