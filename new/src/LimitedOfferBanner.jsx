import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingBag, Clock, Gift, ChevronRight, ChevronLeft } from "lucide-react";
import { API_URL, SERVER_URL } from "@/utils/api";

import imgTirtir from "./assets/category/Sunspray/TIRTIR-Mask-Fit-Make-Up-Fixer.jpeg";
import imgElf from "./assets/category/Primer/Elf-primer.webp";

/* ── countdown hook ── */
function useCountdown(endsAt) {
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endsAt));

    useEffect(() => {
        if (!endsAt) return;
        const id = setInterval(() => {
            const t = getTimeLeft(endsAt);
            setTimeLeft(t);
            if (t.expired) clearInterval(id);
        }, 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    return timeLeft;
}

function getTimeLeft(endsAt) {
    if (!endsAt) return { hours: 0, minutes: 0, seconds: 0, expired: true, total: 0 };
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true, total: 0 };
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
        total: diff,
    };
}

const getMediaUrl = (url) => {
    if (!url) return "";
    const normalized = String(url).trim();
    if (normalized.startsWith("http") || normalized.startsWith("data:") || normalized.startsWith("/src/") || normalized.startsWith("/@fs/")) return normalized;
    if (normalized.includes("localhost:5000") || normalized.includes("stone-backend.vercel.app")) {
        return normalized.replace(/^https?:\/\/(localhost:5000|stone-backend\.vercel\.app)/i, SERVER_URL);
    }
    return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
};

/* ── Single Offer Card ── */
const OfferCard = ({ offer, onNavigate, addToCart, user }) => {
    const timer = useCountdown(offer.endsAt);
    
    const handleCtaClick = async () => {
        if (offer.mainProductId && addToCart) {
            // Add main product
            addToCart(offer.mainProductId);
            
            // Add free product if exists
            if (offer.freeProductId) {
                setTimeout(() => {
                    addToCart(offer.freeProductId, { isFree: true, offerType: 'bogo' });
                }, 500);
            }

            // Record claim if user is logged in
            if (user?.id && offer.id && offer.id !== "default") {
                try {
                    await fetch(`${API_URL}/offers/claim`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ offerId: offer.id, customerId: user.id })
                    });
                    // Refresh offers list to hide the claimed one
                    window.dispatchEvent(new CustomEvent('omw_offers_updated'));
                } catch (e) {
                    console.error("Error recording claim:", e);
                }
            }
        } else {
            // Fallback to navigation
            if (onNavigate) onNavigate(offer.ctaLink || "shop");
        }
    };

    const mainImg = offer.mainProductImage ? getMediaUrl(offer.mainProductImage) : imgTirtir;
    const freeImg = offer.freeProductImage ? getMediaUrl(offer.freeProductImage) : imgElf;

    // Parse title & accent
    const titleParts = (offer.title || "Buy 1 Get 1").split(" ");
    const accent = offer.accentWord || "Free";

    if (timer.expired) return null;

    return (
        <div className="lob-card">
            {/* Left content */}
            <div className="lob-left">
                <span className="lob-badge">{offer.badgeText || "LIMITED OFFER"}</span>

                <h2 className="lob-heading">
                    {offer.title || "Buy 1 Get 1"} <span className="lob-accent">{accent}</span>
                </h2>

                <p className="lob-desc">
                    {offer.description || "Purchase any eligible full-sized product on MRP and get a travel-size essential absolutely free."}
                </p>

                <div className="lob-actions">
                    <button
                        className="lob-cta"
                        onClick={handleCtaClick}
                    >
                        {offer.ctaText || "CLAIM OFFER"}
                    </button>

                    <div className="lob-timer">
                        <Clock size={16} className="lob-timer-icon" />
                        <span className="lob-timer-text">
                            Ends in:{" "}
                            {timer.days > 0 && `${timer.days}d : `}
                            {String(timer.hours).padStart(2, "0")}h :{" "}
                            {String(timer.minutes).padStart(2, "0")}m :{" "}
                            {String(timer.seconds).padStart(2, "0")}s
                        </span>
                    </div>
                </div>
            </div>

            {/* Right images */}
            <div className="lob-right">
                <div className="lob-img-main">
                    <img src={mainImg} alt="Main product" />
                </div>

                <div className="lob-plus">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>

                <div className="lob-img-free">
                    <span className="lob-free-badge">FREE</span>
                    <img src={freeImg} alt="Free product" />
                    <div className="lob-img-overlay" />
                </div>
            </div>
        </div>
    );
};

/* ── Main Section ── */
export default React.memo(function LimitedOfferBanner({ onNavigate, addToCart, user }) {
    const [offers, setOffers] = useState([]);
    const [slideIdx, setSlideIdx] = useState(0);

    const fetchOffers = useCallback(() => {
        const url = user?.id 
            ? `${API_URL}/offers/active?customerId=${user.id}` 
            : `${API_URL}/offers/active`;

        fetch(url)
            .then((r) => r.json())
            .then((d) => {
                if (d.success && d.data && d.data.length > 0) {
                    setOffers(d.data);
                } else if (d.success && d.data && d.data.length === 0) {
                    setOffers([]);
                } else {
                    // Fallback
                    setOffers([{
                        id: "default",
                        type: "bogo",
                        title: "Buy 1 Get 1",
                        accentWord: "Free",
                        badgeText: "LIMITED OFFER",
                        description: "Purchase any eligible full-sized product on MRP and get a travel-size essential absolutely free.",
                        ctaText: "CLAIM OFFER",
                        ctaLink: "/shop",
                        endsAt: new Date(Date.now() + 86400000).toISOString(),
                        mainProductImage: "",
                        freeProductImage: "",
                    }]);
                }
            })
            .catch(() => {});
    }, [user?.id]);

    useEffect(() => {
        fetchOffers();

        // Listen for admin updates or claim events
        const handleSync = () => fetchOffers();
        window.addEventListener("omw_offers_updated", handleSync);
        return () => window.removeEventListener("omw_offers_updated", handleSync);
    }, [fetchOffers]);

    const activeOffers = useMemo(() => offers.filter((o) => {
        if (!o.endsAt) return false;
        return new Date(o.endsAt) > new Date();
    }), [offers]);

    if (activeOffers.length === 0) return null;

    const canPrev = slideIdx > 0;
    const canNext = slideIdx < activeOffers.length - 1;

    return (
        <section className="lob-section">
            <style>{`
                .lob-section {
                    width: 100%;
                    padding: 2rem 1rem 2.5rem;
                }
                .lob-slider-wrap {
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                }
                .lob-slider-viewport {
                    overflow: hidden;
                    border-radius: 24px;
                }
                .lob-slider-track {
                    display: flex;
                    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                }

                /* ── Card ── */
                .lob-card {
                    flex: 0 0 100%;
                    min-width: 100%;
                    background: linear-gradient(135deg, #ffeef4 0%, #f3f0ff 50%, #eaddff 100%);
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 3rem 3.5rem;
                    gap: 2rem;
                    position: relative;
                    box-shadow: 0 2px 24px rgba(0,0,0,0.04);
                }

                /* ── Left ── */
                .lob-left {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    z-index: 2;
                    max-width: 560px;
                }
                .lob-badge {
                    background: #111;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                    padding: 6px 14px;
                    border-radius: 999px;
                    margin-bottom: 1.5rem;
                }
                .lob-heading {
                    font-size: clamp(2.25rem, 5vw, 3.5rem);
                    font-weight: 900;
                    line-height: 1.1;
                    color: #111;
                    margin-bottom: 1rem;
                }
                .lob-accent {
                    color: #e91e63;
                }
                .lob-desc {
                    color: #555;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    max-width: 460px;
                }

                /* ── Actions ── */
                .lob-actions {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1.25rem;
                }
                .lob-cta {
                    background: #111;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                }
                .lob-cta:hover {
                    background: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                }
                .lob-cta:active {
                    transform: scale(0.97);
                }
                .lob-timer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.9);
                    padding: 0.5rem 1rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255,255,255,0.5);
                }
                .lob-timer-icon {
                    color: #e91e63;
                }
                .lob-timer-text {
                    font-size: 14px;
                    font-weight: 700;
                    color: #111;
                    font-variant-numeric: tabular-nums;
                }

                /* ── Right Images ── */
                .lob-right {
                    display: flex;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                    transform: translateX(1rem);
                }
                .lob-img-main,
                .lob-img-free {
                    width: 200px;
                    height: 200px;
                    border-radius: 24px;
                    padding: 8px;
                    background: #fff;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                    overflow: hidden;
                    transition: transform 0.5s ease;
                    position: relative;
                }
                .lob-img-main {
                    transform: rotate(-6deg);
                    z-index: 2;
                }
                .lob-img-main:hover {
                    transform: rotate(0deg) scale(1.05);
                }
                .lob-img-free {
                    transform: rotate(6deg);
                    margin-left: -1.5rem;
                    z-index: 2;
                }
                .lob-img-free:hover {
                    transform: rotate(0deg) scale(1.05);
                }
                .lob-img-main img,
                .lob-img-free img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 20px;
                }
                .lob-img-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(255,255,255,0.4), transparent);
                    border-radius: 20px;
                    pointer-events: none;
                }
                .lob-plus {
                    width: 40px;
                    height: 40px;
                    background: #111;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border: 4px solid #fff;
                    z-index: 10;
                    margin-left: -1.5rem;
                    flex-shrink: 0;
                }
                .lob-free-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: #ff4fa3;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 3px 8px;
                    border-radius: 6px;
                    z-index: 5;
                }

                /* ── Slider arrows ── */
                .lob-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #e4e4e7;
                    color: #111;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    z-index: 20;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .lob-arrow:hover {
                    background: #111;
                    border-color: #111;
                    color: #fff;
                }
                .lob-arrow:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .lob-arrow-left {
                    left: -20px;
                }
                .lob-arrow-right {
                    right: -20px;
                }

                /* ── Dots ── */
                .lob-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.25rem;
                }
                .lob-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    background: #d4d4d8;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }
                .lob-dot.active {
                    width: 28px;
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                }

                /* ── Responsive ── */
                @media (max-width: 900px) {
                    .lob-card {
                        flex-direction: column;
                        padding: 2rem 1.5rem;
                        text-align: center;
                    }
                    .lob-left {
                        align-items: center;
                        max-width: 100%;
                    }
                    .lob-desc {
                        max-width: 100%;
                    }
                    .lob-actions {
                        justify-content: center;
                    }
                    .lob-right {
                        transform: none;
                        margin-top: 1rem;
                    }
                    .lob-img-main,
                    .lob-img-free {
                        width: 160px;
                        height: 160px;
                    }
                }
                @media (max-width: 480px) {
                    .lob-section {
                        padding: 1rem 0.5rem;
                    }
                    .lob-card {
                        padding: 1.5rem 1rem;
                        border-radius: 16px;
                    }
                    .lob-img-main,
                    .lob-img-free {
                        width: 130px;
                        height: 130px;
                    }
                    .lob-arrow { display: none; }
                }
            `}</style>

            <div className="lob-slider-wrap">
                {activeOffers.length > 1 && canPrev && (
                    <button className="lob-arrow lob-arrow-left" onClick={() => setSlideIdx((i) => i - 1)} aria-label="Previous">
                        <ChevronLeft size={20} />
                    </button>
                )}
                {activeOffers.length > 1 && canNext && (
                    <button className="lob-arrow lob-arrow-right" onClick={() => setSlideIdx((i) => i + 1)} aria-label="Next">
                        <ChevronRight size={20} />
                    </button>
                )}

                <div className="lob-slider-viewport">
                    <div
                        className="lob-slider-track"
                        style={{ transform: `translateX(-${slideIdx * 100}%)` }}
                    >
                        {activeOffers.map((offer) => (
                            <OfferCard 
                                key={offer.id} 
                                offer={offer} 
                                onNavigate={onNavigate} 
                                addToCart={addToCart}
                                user={user}
                            />
                        ))}
                    </div>
                </div>

                {activeOffers.length > 1 && (
                    <div className="lob-dots">
                        {activeOffers.map((_, i) => (
                            <button
                                key={i}
                                className={`lob-dot ${i === slideIdx ? "active" : ""}`}
                                onClick={() => setSlideIdx(i)}
                                aria-label={`Offer ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
});
