import React, { useRef, memo } from "react";
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

const GAP = 14;
const CARD_WIDTH = `clamp(170px, calc((100vw - 20px - 6 * ${GAP}px) / 7), 210px)`;

const CATEGORIES = [
  "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil",
  "compact powders", "Concealer", "Cushion foundation", "Essence",
  "Exfoliate", "Eye cream", "Face mists", "Foundation", "Hair set",
  "International makeup", "International skincare", "Japanese Skincare",
  "Korean skincare", "Lip blam", "Lipstick", "Makeup remover",
  "Mascara", "Moisturizer", "Primer", "Razor", "Serums", "Sheet masks",
  "SKIN1004", "Sunscreen", "Sunspray", "Sunstick", "toner", "toner pads",
  "Treatment mask"
];

const CATEGORY_IMAGES = {
  "B.b cream": bbCreamImg,
  Blender: blenderImg,
  Blush: blushImg,
  Brush: brushImg,
  Cleanser: cleanserImg,
  "cleansing oil": cleansingOilImg,
  "compact powders": compactPowderImg,
  Concealer: concealerImg,
  "Cushion foundation": cushionFoundationImg,
  Essence: essenceImg,
  Exfoliate: exfoliateImg,
  "Eye cream": eyeCreamImg,
  "Face mists": faceMistsImg,
  Foundation: foundationImg,
  "Hair set": hairSetImg,
  "International makeup": internationalMakeupImg,
  "International skincare": internationalSkincareImg,
  "Japanese Skincare": japaneseSkincareImg,
  "Korean skincare": koreanSkincareImg,
  "Lip blam": lipBalmImg,
  Lipstick: lipstickImg,
  "Makeup remover": makeupRemoverImg,
  Mascara: mascaraImg,
  Moisturizer: moisturizerImg,
  Primer: primerImg,
  Razor: razorImg,
  Serums: serumsImg,
  "Sheet masks": sheetMasksImg,
  SKIN1004: skin1004Img,
  Sunscreen: sunscreenImg,
  Sunspray: sunsprayImg,
  Sunstick: sunstickImg,
  toner: tonerImg,
  "toner pads": tonerPadsImg,
  "Treatment mask": treatmentMaskImg,
};

const CategoryCard = memo(({ label, onClick }) => (
  <div
    className="text-center flex-none snap-center cursor-pointer group"
    style={{ width: CARD_WIDTH }}
    onClick={() => onClick(label)}
  >
    <div className="relative aspect-square rounded-[22px] overflow-hidden border border-black/5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)] transition-all duration-300">
      <img
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
        src={CATEGORY_IMAGES[label] || categorySphere}
        alt={label}
        loading="lazy"
      />
    </div>
    <div className="mt-2.5 font-black text-[14px] text-[#151515] group-hover:text-[#b36cff] transition-colors uppercase tracking-tight">
      {label}
    </div>
  </div>
));

export default function ByCategory({ onNavigate, onSelectCategory }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      // We rely on CSS 'scroll-smooth' in the container class for the animation
      // Calling scrollBy without behavior: 'smooth' avoids JS-CSS conflict lag
      const scrollAmount = window.innerWidth < 768 ? 240 : 480;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount
      });
    }
  };

  const handleCategoryClick = (label) => {
    if (onSelectCategory) onSelectCategory(label);
    if (onNavigate) onNavigate("category-page");
  };

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="w-full px-0 sm:px-4 relative mx-auto max-w-[1440px]">
        {/* Main Category Block */}
        <div className="relative bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/60 py-10 md:py-16 shadow-sm overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-32 before:h-full before:bg-linear-to-r before:from-[#e7c6ff]/20 before:to-transparent before:z-0 after:content-[''] after:absolute after:top-0 after:right-0 after:w-32 after:h-full after:bg-linear-to-l after:from-[#e7c6ff]/20 after:to-transparent after:z-0">
          
          {/* Heading */}
          <div className="relative z-10 text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#151515]">
              Shop by{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1] italic">
                Category
              </span>
            </h2>
          </div>

          {/* Category List with Arrows */}
          <div className="relative z-10 group px-4 md:px-12">
            {/* Left Button */}
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-black/5 hover:bg-white transition-all cursor-pointer hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0 md:opacity-100"
              aria-label="Scroll Left"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Scroll Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 py-4 no-scrollbar scroll-smooth gpu-accelerated"
            >
              {CATEGORIES.map((label) => (
                <CategoryCard key={label} label={label} onClick={handleCategoryClick} />
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-black/5 hover:bg-white transition-all cursor-pointer hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0 md:opacity-100"
              aria-label="Scroll Right"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 md:mt-32 group relative rounded-[40px] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500 z-10" />
          <img
            className="w-full h-[400px] md:h-[600px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            src={banner8}
            alt="Featured skincare banner"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
