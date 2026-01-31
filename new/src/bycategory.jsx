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
        <div className="relative overflow-hidden pb-[16px]">
          {/* Left Curtain */}
          <div className="absolute top-0 bottom-0 left-0 w-[60px] bg-gradient-to-r from-[#e7c6ff] to-transparent z-[2] rounded-tr-[50%_100%] rounded-br-[50%_100%] pointer-events-none opacity-60 mix-blend-multiply" />

          {/* Right Curtain */}
          <div className="absolute top-0 bottom-0 right-0 w-[60px] bg-gradient-to-l from-[#e7c6ff] to-transparent z-[2] rounded-tl-[50%_100%] rounded-bl-[50%_100%] pointer-events-none opacity-60 mix-blend-multiply" />

          <div className="relative z-10 text-center mb-[18px]">
            <span className="text-[28px] font-[900] tracking-[1px] uppercase">
              Shop by <span className="text-[#b36cff] italic font-[700] ml-[6px]">Category</span>
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-[14px]">
            {rows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex gap-[14px] overflow-x-auto snap-x snap-mandatory py-[4px] px-[60px] pb-[8px] w-full mx-auto no-scrollbar relative z-10"
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
