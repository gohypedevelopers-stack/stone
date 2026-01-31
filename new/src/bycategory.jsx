import banner8 from "./assets/9.png";
import categorySphere from "./assets/category-sphere.png";

import bbCreamImg from "./assets/category/b.b cream.jpg";
import blenderImg from "./assets/category/blender.jpg";
import blushImg from "./assets/category/blush.jpeg";
import brushImg from "./assets/category/brush.jpeg";
import cleanserImg from "./assets/category/cleanser.jpeg";
import cleansingOilImg from "./assets/category/cleansing oil.jpg";
import compactPowderImg from "./assets/category/compact powder.jpg";
import concealerImg from "./assets/category/concealer.jpg";
import cushionFoundationImg from "./assets/category/cushion foundation.jpg";
import essenceImg from "./assets/category/Essence.jpg";
import exfoliateImg from "./assets/category/Exfoliate.jpg";
import eyeCreamImg from "./assets/category/Eye cream.jpeg";
import faceMistsImg from "./assets/category/Face mists.jpeg";
import foundationImg from "./assets/category/Foundation.jpg";
import hairSetImg from "./assets/category/Hair set.jpg";
import internationalMakeupImg from "./assets/category/International makeup.jpeg";
import internationalSkincareImg from "./assets/category/International skincare.jpg";
import japaneseSkincareImg from "./assets/category/Japanese Skincare.jpeg";
import koreanSkincareImg from "./assets/category/Korean skincare.jpg";
import lipBalmImg from "./assets/category/Lip blam.jpg";
import lipstickImg from "./assets/category/Lipstick.jpg";
import makeupRemoverImg from "./assets/category/Makeup remover.jpeg";
import mascaraImg from "./assets/category/Mascara.jpg";
import moisturizerImg from "./assets/category/Moisturizer.jpg";
import primerImg from "./assets/category/Primer.jpeg";
import razorImg from "./assets/category/Razor.jpg";
import serumsImg from "./assets/category/Serums.jpg";
import sheetMasksImg from "./assets/category/Sheet masks.jpeg";
import skin1004Img from "./assets/category/skin1004.jpg";
import sunscreenImg from "./assets/category/Sunscreen.jpg";
import sunsprayImg from "./assets/category/Sunspray.jpg";
import sunstickImg from "./assets/category/Sunstick.jpg";
import tonerImg from "./assets/category/toner.jpg";
import tonerPadsImg from "./assets/category/toner pads.avif";
import treatmentMaskImg from "./assets/category/Treatment mask.jpg";

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

const CATEGORY_IMAGES = {
  "B.b cream": bbCreamImg,
  "Blender": blenderImg,
  "Blush": blushImg,
  "Brush": brushImg,
  "Cleanser": cleanserImg,
  "cleansing oil": cleansingOilImg,
  "compact powders": compactPowderImg,
  "Concealer": concealerImg,
  "Cushion foundation": cushionFoundationImg,
  "Essence": essenceImg,
  "Exfoliate": exfoliateImg,
  "Eye cream": eyeCreamImg,
  "Face mists": faceMistsImg,
  "Foundation": foundationImg,
  "Hair set": hairSetImg,
  "International makeup": internationalMakeupImg,
  "International skincare": internationalSkincareImg,
  "Japanese Skincare": japaneseSkincareImg,
  "Korean skincare": koreanSkincareImg,
  "Lip blam": lipBalmImg,
  "Lipstick": lipstickImg,
  "Makeup remover": makeupRemoverImg,
  "Mascara": mascaraImg,
  "Moisturizer": moisturizerImg,
  "Primer": primerImg,
  "Razor": razorImg,
  "Serums": serumsImg,
  "Sheet masks": sheetMasksImg,
  "SKIN1004": skin1004Img,
  "Sunscreen": sunscreenImg,
  "Sunspray": sunsprayImg,
  "Sunstick": sunstickImg,
  "toner": tonerImg,
  "toner pads": tonerPadsImg,
  "Treatment mask": treatmentMaskImg,
};

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
                className="flex gap-[14px] overflow-x-auto snap-x snap-mandatory py-[4px] px-5 scroll-px-5 pb-[8px] w-full mx-auto no-scrollbar relative before:content-[''] before:sticky before:top-0 before:self-center before:w-[38px] before:h-[38px] before:rounded-[999px] before:border before:border-black/8 before:bg-white/60 before:shadow-[0_10px_22px_rgba(0,0,0,0.12)] before:opacity-100 before:z-[2] before:pointer-events-none before:left-[6px] before:-mr-[32px] before:[mask:radial-gradient(circle_at_65%_50%,transparent_12px,#000_13px)] after:content-[''] after:sticky after:top-0 after:self-center after:w-[38px] after:h-[38px] after:rounded-[999px] after:border after:border-black/8 after:bg-white/60 after:shadow-[0_10px_22px_rgba(0,0,0,0.12)] after:opacity-100 after:z-[2] after:pointer-events-none after:right-[6px] after:-ml-[32px] after:[mask:radial-gradient(circle_at_35%_50%,transparent_12px,#000_13px)]"
                style={{
                  maxWidth: `calc(${row.visible} * clamp(120px, calc((100vw - 30px - 6 * 14px) / 7), 180px) + (${row.visible} - 1) * 14px)`
                }}
              >
                {row.items.map((label) => (
                  <div key={label} className="text-center flex-none w-[clamp(170px,calc((100vw-20px-6*14px)/7),210px)] snap-center">
                    <img className="w-full aspect-square rounded-[22px] border border-black/6 shadow-[0_10px_22px_rgba(0,0,0,0.08)] object-cover" src={CATEGORY_IMAGES[label] || categorySphere} alt={label} />
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
