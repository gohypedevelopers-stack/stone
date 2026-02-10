import { useState, useEffect } from "react";
import imgTirtir from "./assets/category/Sunspray/TIRTIR-Mask-Fit-Make-Up-Fixer.jpeg";
import imgElf from "./assets/category/Primer/Elf-primer.webp";

export default function LimitedOfferBanner() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 12,
        minutes: 45,
        seconds: 13,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev; // Stop at 0
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full py-8 md:py-12 px-4 sm:px-6">
            <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-[#ffeef4] via-[#f3f0ff] to-[#eaddff] rounded-[24px] overflow-hidden relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">

                {/* Left Content */}
                <div className="flex flex-col items-start z-10 max-w-[600px]">
                    <span className="bg-[#111] text-white text-[11px] font-[800] tracking-[1.2px] uppercase px-3 py-1.5 rounded-full mb-6">
                        Limited Offer
                    </span>

                    <h2 className="text-[42px] md:text-[56px] font-[900] leading-[1.1] mb-4 text-[#111]">
                        Buy 1 Get 1 <span className="text-[#e91e63]">Free</span>
                    </h2>

                    <p className="text-[#555] text-[16px] md:text-[18px] leading-[1.6] mb-8 max-w-[480px]">
                        Purchase any eligible full-sized product on MRP and get a travel-size essential absolutely free.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-[#111] text-white text-[14px] font-[800] tracking-[1px] uppercase px-8 py-4 rounded-[12px] hover:bg-[#333] transition-colors shadow-lg">
                            Claim Offer
                        </button>

                        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span className="text-[14px] font-[700] text-[#111] tabular-nums">
                                Ends in: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Images */}
                <div className="flex items-center relative z-10 translate-x-4 md:translate-x-0">
                    <div className="relative z-10 transform -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                        <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] bg-white rounded-[24px] p-2 shadow-xl border border-white/50">
                            <img src={imgTirtir} alt="TIRTIR Fixer" className="w-full h-full object-cover rounded-[20px]" />
                        </div>
                    </div>

                    <div className="relative z-20 -ml-6 flex items-center justify-center w-[40px] h-[40px] bg-[#111] rounded-full text-white shadow-lg border-4 border-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>

                    <div className="relative z-10 -ml-6 transform rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                        <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] bg-white rounded-[24px] p-2 shadow-xl border border-white/50 relative">
                            <span className="absolute top-4 right-4 bg-[#ff4fa3] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">FREE</span>
                            <img src={imgElf} alt="Elf Primer" className="w-full h-full object-cover rounded-[20px] opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent rounded-[20px] pointer-events-none"></div>
                        </div>
                    </div>
                </div>



            </div>
        </section>
    );
}
