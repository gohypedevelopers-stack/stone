import React, { useRef, memo, useState } from "react";

export { categorySphere };
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

export const CATEGORIES = [
  "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil",
  "compact powders", "Concealer", "Cushion foundation", "Essence",
  "Exfoliate", "Eye cream", "Face mists", "Foundation", "Hair set",
  "International makeup", "International skincare", "Japanese Skincare",
  "Korean skincare", "Lip blam", "Lipstick", "Makeup remover",
  "Mascara", "Moisturizer", "Primer", "Razor", "Serums", "Sheet masks",
  "SKIN1004", "Sunscreen", "Sunspray", "Sunstick", "toner", "toner pads",
  "Treatment mask"
];

export const CATEGORY_IMAGES = {
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

const CategoryCard = memo(({ label, image, onClick, isGrid }) => (
  <div
    className={`text-center flex-none snap-center cursor-pointer ${isGrid ? 'w-full' : 'w-[180px] sm:w-[200px] md:w-[220px] xl:w-[240px]'}`}
    onClick={() => onClick(label)}
  >
    <div className="peer relative aspect-[4/3] rounded-[40px] overflow-hidden border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 group optimize-gpu will-change-transform [content-visibility:auto] [contain-intrinsic-size:aspect-ratio(4/3)]">
      <img
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out will-change-transform optimize-gpu pointer-events-none"
        src={image || categorySphere}
        alt={label}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
    <div className="mt-4 font-black text-sm md:text-base text-[#151515] peer-hover:text-[#b36cff] transition-colors uppercase tracking-tight select-none">
      {label}
    </div>
  </div>
));

export const DEFAULT_CATEGORY_DATA = CATEGORIES.map(label => ({
  label,
  image: CATEGORY_IMAGES[label] || categorySphere
}));

export default React.memo(function ByCategory({ onNavigate, onSelectCategory, title, categories, isAdmin }) {
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const containerOffsetRef = useRef(0);

  // Pre-warm layout to avoid reflow on first drag
  const preWarmLayout = () => {
    if (scrollRef.current) {
      containerOffsetRef.current = scrollRef.current.offsetLeft;
    }
  };



  const displayItems = categories && categories.length > 0
    ? categories
    : DEFAULT_CATEGORY_DATA;

  const handleMouseDown = (e) => {
    if (!scrollRef.current || isAdmin) return;
    
    // Only drag with left mouse button
    if (e.button !== 0) return;

    preWarmLayout();
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerOffsetRef.current;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    dragDistanceRef.current = 0;
    velocityRef.current = 0;
    lastTimeRef.current = performance.now();

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    
    // Direct DOM manipulation for maximum smoothness (No re-renders)
    scrollRef.current.style.scrollBehavior = 'auto';
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.classList.add('cursor-grabbing', 'select-none');
    scrollRef.current.classList.remove('cursor-grab');
    if (innerRef.current) innerRef.current.style.pointerEvents = 'none';
  };


  const applyMomentum = () => {
    if (!scrollRef.current || Math.abs(velocityRef.current) < 0.2) {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = '';
        scrollRef.current.style.scrollSnapType = '';
        scrollRef.current.classList.remove('cursor-grabbing', 'select-none');
        scrollRef.current.classList.add('cursor-grab');
        if (innerRef.current) innerRef.current.style.pointerEvents = 'auto';
      }
      return;
    }

    scrollRef.current.scrollLeft -= velocityRef.current;
    velocityRef.current *= 0.95; // Friction factor
    rafIdRef.current = requestAnimationFrame(applyMomentum);
  };


  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      applyMomentum();
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      applyMomentum();
    }
  };



  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollRef.current || isAdmin) return;
    
    // Use movementX if available for hardware-accelerated precision
    if (e.movementX !== undefined) {
      scrollRef.current.scrollLeft -= e.movementX * 1.5;
      velocityRef.current = e.movementX;
    } else {
      // Fallback
      const x = e.pageX - containerOffsetRef.current;
      const walk = (x - startXRef.current) * 1.5; 
      scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    }

    const now = performance.now();
    lastTimeRef.current = now;
    dragDistanceRef.current += Math.abs(e.movementX || 0);
  };


  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 240 : 480;
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount
      });
    }
  };

  const handleCategoryClick = (label) => {
    // Threshold to distinguish between a drag and a click
    // If we moved more than 10px, it was a drag, so don't trigger click
    if (dragDistanceRef.current > 10) return;

    
    if (onSelectCategory) onSelectCategory(label);
    if (onNavigate) onNavigate("category-page");
  };

  return (
    <section className={`relative overflow-hidden ${isAdmin ? 'py-4' : 'py-6 md:py-10'}`}>
      <div className={`w-full relative mx-auto ${isAdmin ? 'px-2' : 'px-0 sm:px-4 max-w-[1440px]'}`}>
        {/* Main Category Block */}
        <div className={`relative bg-[#f8f0ff] rounded-[40px] border border-stone-200 py-6 md:py-10 shadow-sm overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-32 before:h-full before:bg-linear-to-r before:from-[#e7c6ff]/20 before:to-transparent before:z-0 after:content-[''] after:absolute after:top-0 after:right-0 after:w-32 after:h-full after:bg-linear-to-l after:from-[#e7c6ff]/20 after:to-transparent after:z-0 ${isAdmin ? 'rounded-2xl py-6' : ''}`}>

          {/* Heading */}
          <div className="relative z-10 text-center mb-6 md:mb-8">
            <h2 className={`${isAdmin ? 'text-2xl' : 'text-3xl md:text-5xl'} font-black uppercase tracking-tight text-[#151515]`}>
              {title ? (
                <>
                  {title.trim().split(' ').slice(0, -1).join(' ')}{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]">
                    {title.trim().split(' ').slice(-1)[0]}
                  </span>
                </>
              ) : (
                <>
                  Shop by{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]">
                    Category
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Category List */}
          <div className="relative z-10 group px-4 md:px-12">
            {!isAdmin && (
              <button
                onClick={() => handleScroll("left")}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-black/5 hover:bg-white cursor-pointer hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0 md:opacity-100 transition-[transform,opacity] duration-300 optimize-gpu"
                aria-label="Scroll Left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Scroll Container or Grid */}
            <div
              ref={isAdmin ? null : scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseEnter={preWarmLayout}
              className={`${isAdmin
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10'
                : 'flex overflow-x-auto gap-4 md:gap-6 py-4 no-scrollbar gpu-accelerated will-change-scroll transform-gpu cursor-grab backface-hidden'
                  }`}

            >
              <div 
                ref={isAdmin ? null : innerRef}
                className={isAdmin ? 'contents' : 'flex gap-4 md:gap-6 transition-none pointer-events-auto'}
              >
                {displayItems.map((cat, idx) => (
                  <CategoryCard key={cat.label || idx} label={cat.label} image={cat.image} onClick={handleCategoryClick} isGrid={isAdmin} />
                ))}
              </div>
            </div>

            {!isAdmin && (
              <button
                onClick={() => handleScroll("right")}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 md:w-12 h-10 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-black/5 hover:bg-white cursor-pointer hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0 md:opacity-100 transition-[transform,opacity] duration-300 optimize-gpu"
                aria-label="Scroll Right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>

          {!isAdmin && (
            <div className="mt-8 text-center">
              <button
                onClick={() => onNavigate("all-categories")}
                className="px-10 py-3.5 rounded-full bg-[#151515] text-white font-black text-sm uppercase tracking-widest hover:bg-[#b36cff] hover:scale-105 transition-all shadow-xl active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">See All Categories</span>
                <div className="absolute inset-0 bg-linear-to-r from-pink-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              </button>
            </div>
          )}
        </div>


      </div>
    </section>
  );
});
