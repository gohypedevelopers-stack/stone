import { useState, useEffect } from "react";

export default function OfferTimer() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 1,
        minutes: 36,
        seconds: 17,
    });
    const [copied, setCopied] = useState(false);

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

    const handleCopy = () => {
        navigator.clipboard.writeText("SAVE20");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="pb-[18px]">
            <div className="w-full px-0 sm:px-[10px]">
                <div className="relative overflow-hidden rounded-[20px] px-[32px] py-[16px] flex flex-col md:flex-row items-center justify-between gap-[24px] bg-gradient-to-r from-[#e3e3e3] to-[#f2f2f2] shadow-[inset_0_1px_4px_rgba(255,255,255,0.8)] border border-white/50">

                    <div className="flex items-center gap-[20px]">
                        <span className="text-[22px] font-[800] text-[#1a1a1a] tracking-tight">
                            20% OFF on orders over $100
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-[8px] bg-white rounded-[999px] px-[14px] py-[6px] text-[13px] font-[700] uppercase tracking-wide cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
                            title="Click to copy"
                        >
                            <span className="pt-[1px]">{copied ? "COPIED" : "SAVE20"}</span>
                            {!copied && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#666]">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    
                </div>
            </div>
        </section>
    );
}

function TimerUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center min-w-[40px]">
            <span className="text-[28px] font-[300] leading-[1] tabular-nums tracking-tight">{String(value).padStart(1, '0')}</span>
            <span className="text-[9px] text-[#666] font-[600] uppercase tracking-[0.15em] mt-[4px]">{label}</span>
        </div>
    );
}

function Separator() {
    return <div className="h-[32px] w-[1px] bg-[#000000] opacity-[0.08]"></div>;
}
