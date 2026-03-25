import { ChevronRight } from "lucide-react";
import ImageReveal from "./components/image-tiles";
import imgNew1 from "./assets/newprod/new1.jpg";
import imgNew2 from "./assets/newprod/new2.jpg";
import imgNew3 from "./assets/newprod/new3.jpg";
import React from "react";

export default React.memo(function NewArrivalsSection({ onNavigate }) {
  return (
    <section className="relative px-1 py-2 md:py-20 max-w-[1440px] mx-auto">
      <div className="bg-[#f0f9ff]/80 rounded-[32px] border border-stone-200 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
        {/* Text Content */}
        <div className="max-w-xl relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 shadow-sm mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#151515]">
              Just Dropped
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-[800] text-[#151515] leading-[1.1] mb-6 tracking-tight">
            New{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Arrivals
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light">
            Fresh beauty drops just landed. Discover innovative formulas
            designed to elevate your daily ritual.
          </p>
          <button
            onClick={() => onNavigate && onNavigate("new-arrivals")}
            className="bg-[#151515] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto md:mx-0"
          >
            Shop New In <ChevronRight size={16} />
          </button>
        </div>

        {/* Floating Collage (Visual) */}
        <div className="relative w-full md:w-1/2 h-[300px] md:h-[400px] flex items-center justify-center">
          {/* Abstract blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />

          <div className="relative z-10 scale-75 md:scale-100">
            <ImageReveal
              leftImage={imgNew1}
              middleImage={imgNew2}
              rightImage={imgNew3}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
