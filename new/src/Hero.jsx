import slide1 from "./assets/1.png";
import slide2 from "./assets/2.png";
import slide3 from "./assets/3.png";

const SLIDES = [
  { src: slide1, alt: "Skincare essentials" },
  { src: slide2, alt: "Sun protection and hydration" },
  { src: slide3, alt: "Luxury skincare essentials" },
];

export default function HeroSlider() {
  return (
    <section className="pt-[18px] pb-[10px]">
      <div className="w-full px-0 sm:px-[10px]">
        <div className="relative overflow-hidden rounded-[26px] border border-black/6 shadow-[0_18px_40px_rgba(0,0,0,0.12)] bg-white" aria-label="Featured banner">
          <div className="flex w-[300%] animate-[heroSlide_18s_ease-in-out_infinite]">
            {SLIDES.map((slide) => (
              <div key={slide.alt} className="flex-[0_0_33.3333%]">
                <img className="block w-full h-[585px] object-cover" src={slide.src} alt={slide.alt} />
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 bottom-[12px] -translate-x-1/2 flex gap-[8px]" aria-hidden="true">
            <span className="w-[8px] h-[8px] rounded-[999px] bg-[#9a6bff] shadow-[0_2px_6px_rgba(0,0,0,0.25)] animate-[heroDot_18s_infinite]" />
            <span className="w-[8px] h-[8px] rounded-[999px] bg-[#9a6bff] shadow-[0_2px_6px_rgba(0,0,0,0.25)] animate-[heroDot_18s_infinite] [animation-delay:6s]" />
            <span className="w-[8px] h-[8px] rounded-[999px] bg-[#9a6bff] shadow-[0_2px_6px_rgba(0,0,0,0.25)] animate-[heroDot_18s_infinite] [animation-delay:12s]" />
          </div>
        </div>
      </div>
    </section>
  );
}
