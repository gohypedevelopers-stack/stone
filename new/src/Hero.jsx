import React from "react";
import slide1 from "./assets/1.png";
import slide2 from "./assets/2.png";
import slide3 from "./assets/3.png";

const DEFAULT_SLIDES = [
  { imageUrl: slide1, title: "", subtitle: "", link: "" },
  { imageUrl: slide2, title: "", subtitle: "", link: "" },
  { imageUrl: slide3, title: "", subtitle: "", link: "" },
];

const HeroSlider = React.memo(({ customSlides }) => {
  const validCustomSlides = customSlides ? customSlides.filter(s => s.imageUrl && s.imageUrl.trim() !== "") : [];
  const slides = validCustomSlides.length > 0 ? validCustomSlides : DEFAULT_SLIDES;
  const slideCount = slides.length;

  return (
    <section className="pt-[18px]">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="relative overflow-hidden rounded-xl border border-black/6 shadow-[0_18px_40px_rgba(0,0,0,0.12)] bg-white" aria-label="Featured banner">
          <div 
            className="flex transition-transform duration-1000 ease-in-out transform-gpu optimize-gpu"
            style={{ 
              width: `${slideCount * 100}%`,
              animation: slideCount > 1 ? `heroSlideDynamic ${slideCount * 6}s ease-in-out infinite` : 'none'
            }}
          >
            {slides.map((slide, idx) => (
              <div key={idx} className="relative flex-1 overflow-hidden group">
                <img 
                  className="block w-full h-[585px] object-cover transition-transform duration-[2s] group-hover:scale-105 transform-gpu optimize-gpu" 
                  src={slide.imageUrl} 
                  alt={slide.title || "Banner"} 
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 bg-linear-to-r from-white/40 via-white/10 to-transparent flex flex-col items-start justify-center text-left p-12 sm:p-24">
                     <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
                        {slide.subtitle && <p className="text-sm sm:text-base font-bold text-indigo-900/60 mb-2 uppercase tracking-[0.3em] font-['Inter']">{slide.subtitle}</p>}
                        {slide.title && <h2 className="text-5xl sm:text-7xl font-black text-indigo-950 mb-8 leading-[1.1] drop-shadow-sm">{slide.title}</h2>}
                        {slide.link && (
                          <a href={slide.link} className="inline-block bg-indigo-950 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-950/40 hover:scale-110 active:scale-95 transition-all">
                            Explore Now
                          </a>
                        )}
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {slideCount > 1 && (
            <div className="absolute left-1/2 bottom-[24px] -translate-x-1/2 flex gap-[10px] z-10" aria-hidden="true">
              {slides.map((_, idx) => (
                <span 
                  key={idx}
                  className="w-[10px] h-[10px] rounded-full bg-indigo-950/20 shadow-sm border border-white/50 animate-pulse"
                  style={{
                    animation: `heroDotDynamic ${slideCount * 6}s infinite`,
                    animationDelay: `${idx * 6}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroSlideDynamic {
          ${slides.map((_, i) => {
            const step = 100 / slideCount;
            const startVisible = i * step;
            const endVisible = (i + 1) * step - (step * 0.1);
            const nextTransition = (i + 1) * step;
            return `
              ${startVisible}% { transform: translateX(-${(i / slideCount) * 100}%); }
              ${endVisible}% { transform: translateX(-${(i / slideCount) * 100}%); }
            `;
          }).join('')}
          100% { transform: translateX(0); }
        }
        @keyframes heroDotDynamic {
          ${slides.map((_, i) => {
            const step = 100 / slideCount;
            const startActive = i * step;
            const endActive = (i + 1) * step;
            return `
              ${startActive}% { background-color: #1e1b4b; transform: scale(1.3); }
              ${endActive}% { background-color: rgba(30, 27, 75, 0.2); transform: scale(1); }
            `;
          }).join('')}
        }
      `}} />
    </section>
  );
});

export default HeroSlider;
