import { useState, useEffect } from "react";

export default function OfferTimer({ offers = [] }) {
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
    // Repeat the offers to ensure a smooth infinite marquee scroll
    const marqueeItems = [...displayOffers, ...displayOffers, ...displayOffers, ...displayOffers];

    return (
        <section className="pb-[18px]">
            <div className="w-full px-0 sm:px-[10px]">
                <div className="relative overflow-hidden rounded-[20px] py-[16px] flex items-center bg-linear-to-r from-[#e3e3e3] to-[#f2f2f2] shadow-[inset_0_1px_4px_rgba(255,255,255,0.8)] border border-white/50">
                    <style>
                        {`
                        @keyframes offerMarquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-offer-marquee {
                            display: flex;
                            width: fit-content;
                            animation: offerMarquee 40s linear infinite;
                        }
                        .animate-offer-marquee:hover {
                            animation-play-state: paused;
                        }
                        `}
                    </style>
                    <div className="animate-offer-marquee whitespace-nowrap flex items-center">
                        {marqueeItems.map((offer, i) => (
                            <div key={i} className="flex items-center gap-[40px] px-[28px]">
                                <span className="text-[20px] font-medium text-[#1a1a1a] tracking-tight">
                                    {offer.text}
                                </span>
                                {offer.code && (
                                    <button
                                        onClick={() => handleCopy(offer.code)}
                                        className="flex items-center gap-[8px] bg-white rounded-[999px] px-[14px] py-[6px] text-[13px] font-bold uppercase tracking-wide cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 transition-all outline-none"
                                        title="Click to copy"
                                    >
                                        <span className="pt-px">{copiedCode === offer.code ? "COPIED" : offer.code}</span>
                                        {copiedCode !== offer.code && (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#666]">
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
}

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
