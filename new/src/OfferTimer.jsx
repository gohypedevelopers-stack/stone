import React, { useState, useEffect } from "react";

export default React.memo(function OfferTimer({ offers = [] }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 1,
        minutes: 36,
        seconds: 17,
    });
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const displayOffers = offers && offers.length > 0 ? offers : [{ text: "20% OFF on orders over $100", code: "SAVE20" }];
    // Repeat the offers many times to ensure a truly seamless infinite marquee scroll
    const marqueeItems = [...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers];

    return (
        <section className="pb-[18px]">
            <div className="w-full px-0 sm:px-[10px]">
                <div className="relative overflow-hidden rounded-[24px] py-[14px] flex items-center bg-white/95 border border-white/40 shadow-sm transform-gpu optimize-gpu">
                    <style>
                        {`
                        @keyframes offerMarquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-offer-marquee {
                            display: flex;
                            width: fit-content;
                            animation: offerMarquee 30s linear infinite;
                            will-change: transform;
                        }
                        .animate-offer-marquee:hover {
                            animation-play-state: paused;
                        }
                        `}
                    </style>
                    <div className="animate-offer-marquee whitespace-nowrap flex items-center">
                        {marqueeItems.map((offer, i) => (
                            <div key={i} className="flex items-center gap-[40px] px-[40px]">
                                <span className="text-[15px] font-bold text-[#1a1a1a] tracking-tight uppercase">
                                    {offer.text}
                                </span>
                                {offer.code && (
                                    <button
                                        onClick={() => handleCopy(offer.code)}
                                        className="flex items-center gap-[6px] bg-white/90 rounded-full px-[12px] py-[4px] text-[11px] font-black uppercase tracking-tighter cursor-pointer border border-black/10 hover:bg-white transition-all outline-none"
                                        title="Click to copy"
                                    >
                                        <span className="text-[#1a1a1a]">{copiedCode === offer.code ? "COPIED" : offer.code}</span>
                                        {copiedCode !== offer.code && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});

function TimerUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center min-w-[40px]">
            <span className="text-[28px] font-light leading-none tabular-nums tracking-tight">{String(value).padStart(1, '0')}</span>
            <span className="text-[9px] text-[#666] font-semibold uppercase tracking-[0.15em] mt-[4px]">{label}</span>
        </div>
    );
}

function Separator() {
    return <div className="h-[32px] w-px bg-[#000000] opacity-[0.08]"></div>;
}
