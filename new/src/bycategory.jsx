import banner8 from "./assets/9.png";
import categorySphere from "./assets/category-sphere.png";

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
    <section className="relative py-[26px] pb-[60px] overflow-hidden">
      <div className="w-full px-0 sm:px-[10px] relative">
        <div className="relative overflow-hidden pb-[16px] before:content-[''] before:absolute before:top-0 before:bottom-0 before:w-[90px] before:bg-gradient-to-b before:from-[#e7c6ff] before:via-[#f2d9ff_45%] before:to-[#c98bff] before:opacity-85 before:z-0 before:pointer-events-none before:left-0 before:rounded-tr-[120px] before:rounded-br-[120px] before:[clip-path:polygon(0_0,100%_0,65%_100%,0_100%)] after:content-[''] after:absolute after:top-0 after:bottom-0 after:w-[90px] after:bg-gradient-to-b after:from-[#e7c6ff] after:via-[#f2d9ff_45%] after:to-[#c98bff] after:opacity-85 after:z-0 after:pointer-events-none after:right-0 after:rounded-tl-[120px] after:rounded-bl-[120px] after:[clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]">
          <div className="relative z-10 text-center mb-[18px]">
            <span className="text-[28px] font-[900] tracking-[1px] uppercase">
              Shop by <span className="text-[#b36cff] italic font-[700] ml-[6px]">Category</span>
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-[14px]">
            {rows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex gap-[14px] overflow-x-auto snap-x snap-mandatory py-[4px] px-[2px] pb-[8px] w-full mx-auto no-scrollbar relative before:content-[''] before:sticky before:top-0 before:self-center before:w-[38px] before:h-[38px] before:rounded-[999px] before:border before:border-black/8 before:bg-white/60 before:shadow-[0_10px_22px_rgba(0,0,0,0.12)] before:opacity-100 before:z-[2] before:pointer-events-none before:left-[6px] before:-mr-[32px] before:[mask:radial-gradient(circle_at_65%_50%,transparent_12px,#000_13px)] after:content-[''] after:sticky after:top-0 after:self-center after:w-[38px] after:h-[38px] after:rounded-[999px] after:border after:border-black/8 after:bg-white/60 after:shadow-[0_10px_22px_rgba(0,0,0,0.12)] after:opacity-100 after:z-[2] after:pointer-events-none after:right-[6px] after:-ml-[32px] after:[mask:radial-gradient(circle_at_35%_50%,transparent_12px,#000_13px)]"
                style={{
                  maxWidth: `calc(${row.visible} * clamp(120px, calc((100vw - 30px - 6 * 14px) / 7), 180px) + (${row.visible} - 1) * 14px)`
                }}
              >
                {row.items.map((label) => (
                  <div key={label} className="text-center flex-none w-[clamp(120px,calc((100vw-30px-6*14px)/7),180px)] snap-center">
                    <img className="h-[140px] w-full rounded-[22px] border border-black/6 shadow-[0_10px_22px_rgba(0,0,0,0.08)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_55%),linear-gradient(135deg,rgba(255,255,255,0.65),rgba(255,255,255,0.15)),linear-gradient(160deg,#f2d8ff_0%,#ffd7f1_60%,#ffe9f7_100%)] object-contain" src={categorySphere} alt="" />
                    <div className="mt-[8px] font-[800] text-[14px]">{label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[28px]">
          <img className="w-full h-[570px] object-cover object-center rounded-[18px]" src={banner8} alt="Featured skincare banner" />
        </div>
      </div>
    </section>
  );
}
