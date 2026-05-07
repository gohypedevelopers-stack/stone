import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL, SERVER_URL } from "@/utils/api";

const getMediaUrl = (url) => {
    if (!url) return "";
    const normalized = String(url).trim();

    if (
        normalized.includes("localhost:5000") ||
        normalized.includes("stone-backend.vercel.app")
    ) {
        return normalized.replace(
            /^https?:\/\/(localhost:5000|stone-backend\.vercel\.app)/i,
            SERVER_URL,
        );
    }

    if (normalized.startsWith("http") || normalized.startsWith("data:") || normalized.startsWith("/src/") || normalized.startsWith("/@fs/")) {
        return normalized;
    }

    if (normalized.startsWith("/app/")) {
        return `${SERVER_URL}/uploads/${normalized.split("/").pop()}`;
    }

    return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
};

// Import local video assets
import vidA from "./assets/reels/A.mp4";
import vidB from "./assets/reels/B.mp4";
import vidC from "./assets/reels/C.mp4";
import vidD from "./assets/reels/D.mp4";
import vidE from "./assets/reels/E.mp4";
import vidF from "./assets/reels/F.mp4";

/* ─── Individual Video Card ─── */
const VideoCard = ({ card, onNavigate }) => {
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Intersection Observer — play/pause based on visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.25 }
        );
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isInView) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isInView, card.video]);

    const togglePlay = useCallback((e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    return (
        <div
            ref={cardRef}
            onClick={() => {
                if (onNavigate) onNavigate(card.productId || "shop");
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="watch-card-wrapper"
        >
            <div className="watch-card">
                {/* Video */}
                <video
                    ref={videoRef}
                    src={getMediaUrl(card.video)}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="auto"
                    onLoadedData={() => setHasLoaded(true)}
                    className={`watch-card-video ${isHovered ? "zoomed" : ""}`}
                />

                {/* Loading shimmer */}
                {!hasLoaded && <div className="watch-card-skeleton" />}

                {/* Gradient overlay */}
                <div className={`watch-card-overlay ${isHovered ? "hovered" : ""}`} />

                {/* Play/Pause toggle (top-right) */}
                <button
                    onClick={togglePlay}
                    className="watch-card-play-toggle"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>

                {/* Bottom content */}
                <div className={`watch-card-content ${isHovered ? "hovered" : ""}`}>
                    <h3 className="watch-card-title">{card.productName}</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigate) onNavigate(card.productId || "shop");
                        }}
                        className="watch-card-btn"
                    >
                        <ShoppingBag size={15} />
                        <span>Shop Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Section ─── */
export default React.memo(function WatchAndShop({ onNavigate }) {
    const trackRef = useRef(null);
    const [slideIndex, setSlideIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    const [videoCards, setVideoCards] = useState(() => {
        const saved = localStorage.getItem("omw_watch_shop");
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((item, idx) => {
                if (!item.video) {
                    const localVids = [vidA, vidB, vidC, vidD, vidE, vidF];
                    return { ...item, video: localVids[idx % localVids.length] };
                }
                return item;
            });
        }
        return [
            { id: 1, video: vidA, productName: "Silk Essence Routine", active: true },
            { id: 2, video: vidB, productName: "Glass Skin Glow", active: true },
            { id: 3, video: vidC, productName: "Night Recovery", active: true },
            { id: 4, video: vidD, productName: "Rose Quartz Facial", active: true },
            { id: 5, video: vidE, productName: "Sun Protection Hack", active: true },
            { id: 6, video: vidF, productName: "Hydration Boost", active: true }
        ];
    });

    useEffect(() => {
        const handleSync = () => {
            const saved = localStorage.getItem("omw_watch_shop");
            if (saved) {
                const parsed = JSON.parse(saved);
                setVideoCards(parsed.map((item, idx) => {
                    if (!item.video) {
                        const localVids = [vidA, vidB, vidC, vidD, vidE, vidF];
                        return { ...item, video: localVids[idx % localVids.length] };
                    }
                    return item;
                }));
            }
        };

        window.addEventListener('storage', handleSync);
        window.addEventListener('omw_watch_shop_updated', handleSync);
        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('omw_watch_shop_updated', handleSync);
        };
    }, []);

    // Responsive visible count
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < 640) setVisibleCount(1);
            else if (w < 768) setVisibleCount(2);
            else if (w < 1024) setVisibleCount(3);
            else setVisibleCount(4);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const activeCards = videoCards.filter(c => c.active);
    const maxIndex = Math.max(0, activeCards.length - visibleCount);
    const canPrev = slideIndex > 0;
    const canNext = slideIndex < maxIndex;
    const showArrows = activeCards.length > visibleCount;

    const slidePrev = () => setSlideIndex(i => Math.max(0, i - 1));
    const slideNext = () => setSlideIndex(i => Math.min(maxIndex, i + 1));

    // Clamp slideIndex if cards change
    useEffect(() => {
        if (slideIndex > maxIndex) setSlideIndex(maxIndex);
    }, [maxIndex, slideIndex]);

    // Percentage to translate
    const gap = 20; // px — matches CSS gap
    const translateX = slideIndex > 0
        ? `calc(-${slideIndex * (100 / visibleCount)}% - ${slideIndex * (gap / visibleCount)}px)`
        : "0px";

    return (
        <section className="watch-section">
            {/* Scoped styles */}
            <style>{`
                /* ── Section ── */
                .watch-section {
                    padding: 4rem 0 5rem;
                    background: linear-gradient(180deg, #fff 0%, #fdf2f8 40%, #fce7f3 100%);
                    overflow: hidden;
                }
                .watch-inner {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                /* ── Header ── */
                .watch-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    margin-bottom: 2.5rem;
                    padding: 0 0.25rem;
                }
                .watch-header-left {}
                .watch-header-title {
                    font-size: clamp(2rem, 5vw, 3.25rem);
                    font-weight: 800;
                    color: #151515;
                    letter-spacing: -0.025em;
                    line-height: 1.1;
                }
                .watch-header-title .accent {
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .watch-subtitle {
                    font-size: 0.95rem;
                    color: #71717a;
                    margin-top: 0.5rem;
                    font-weight: 400;
                }

                /* ── Arrow controls ── */
                .watch-arrows {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .watch-arrow-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 2px solid #e4e4e7;
                    background: #fff;
                    color: #151515;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .watch-arrow-btn:hover:not(:disabled) {
                    background: #151515;
                    border-color: #151515;
                    color: #fff;
                }
                .watch-arrow-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .watch-arrow-btn:active:not(:disabled) {
                    transform: scale(0.92);
                }

                /* ── Slider viewport ── */
                .watch-slider-viewport {
                    overflow: hidden;
                    position: relative;
                }
                .watch-slider-track {
                    display: flex;
                    gap: ${gap}px;
                    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                    will-change: transform;
                }

                /* ── Card Wrapper ── */
                .watch-card-wrapper {
                    flex: 0 0 calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount});
                    min-width: 0;
                    cursor: pointer;
                }

                /* ── Card ── */
                .watch-card {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 9 / 14;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    background: #e4e4e7;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    transition: box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .watch-card:hover {
                    box-shadow: 0 20px 48px rgba(0,0,0,0.16);
                    transform: translateY(-6px);
                }

                /* ── Video ── */
                .watch-card-video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: transform;
                }
                .watch-card-video.zoomed {
                    transform: scale(1.08);
                }

                /* ── Skeleton ── */
                .watch-card-skeleton {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(110deg, #e4e4e7 30%, #f4f4f5 50%, #e4e4e7 70%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s ease-in-out infinite;
                    z-index: 2;
                }
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* ── Gradient Overlay ── */
                .watch-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        transparent 35%,
                        rgba(0,0,0,0.08) 55%,
                        rgba(0,0,0,0.55) 80%,
                        rgba(0,0,0,0.78) 100%
                    );
                    transition: background 0.4s ease;
                    z-index: 3;
                    pointer-events: none;
                }
                .watch-card-overlay.hovered {
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        transparent 25%,
                        rgba(0,0,0,0.12) 50%,
                        rgba(0,0,0,0.65) 78%,
                        rgba(0,0,0,0.88) 100%
                    );
                }

                /* ── Play/Pause Toggle ── */
                .watch-card-play-toggle {
                    position: absolute;
                    top: 0.875rem;
                    right: 0.875rem;
                    z-index: 10;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1.5px solid rgba(255,255,255,0.2);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s;
                }
                .watch-card:hover .watch-card-play-toggle {
                    opacity: 1;
                    transform: scale(1);
                }
                .watch-card-play-toggle:hover {
                    background: rgba(0,0,0,0.65);
                }
                .watch-card-play-toggle:active {
                    transform: scale(0.9);
                }

                /* ── Bottom Content ── */
                .watch-card-content {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1.25rem;
                    z-index: 5;
                    transform: translateY(4px);
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .watch-card-content.hovered {
                    transform: translateY(0);
                }

                /* ── Title ── */
                .watch-card-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.875rem;
                    line-height: 1.3;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    letter-spacing: -0.01em;
                }

                /* ── Shop Now Button ── */
                .watch-card-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-radius: 999px;
                    background: #fff;
                    color: #151515;
                    font-weight: 700;
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .watch-card-btn:hover {
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                    color: #fff;
                    box-shadow: 0 8px 28px rgba(236,72,153,0.35);
                    transform: translateY(-1px);
                }
                .watch-card-btn:active {
                    transform: scale(0.96);
                }

                /* ── Dot indicators ── */
                .watch-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.75rem;
                }
                .watch-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    border: none;
                    background: #d4d4d8;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }
                .watch-dot.active {
                    width: 28px;
                    background: linear-gradient(135deg, #ec4899, #a855f7);
                }
                .watch-dot:hover:not(.active) {
                    background: #a1a1aa;
                }

                /* ── Responsive ── */
                @media (max-width: 640px) {
                    .watch-section {
                        padding: 2.5rem 0 3rem;
                    }
                    .watch-header {
                        margin-bottom: 1.5rem;
                    }
                    .watch-arrows {
                        display: none;
                    }
                    .watch-card-title {
                        font-size: 1rem;
                    }
                    .watch-card-btn {
                        padding: 0.65rem 0.875rem;
                        font-size: 0.72rem;
                    }
                }
            `}</style>

            <div className="watch-inner">
                {/* Header with arrows */}
                <div className="watch-header">
                    <div className="watch-header-left">
                        <h2 className="watch-header-title">
                            Watch & <span className="accent">Shop</span>
                        </h2>
                        <p className="watch-subtitle">Discover routines through short videos</p>
                    </div>

                    {showArrows && (
                        <div className="watch-arrows">
                            <button
                                className="watch-arrow-btn"
                                onClick={slidePrev}
                                disabled={!canPrev}
                                aria-label="Previous"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="watch-arrow-btn"
                                onClick={slideNext}
                                disabled={!canNext}
                                aria-label="Next"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Slider */}
                <div className="watch-slider-viewport">
                    <div
                        ref={trackRef}
                        className="watch-slider-track"
                        style={{ transform: `translateX(${translateX})` }}
                    >
                        {activeCards.map((card) => (
                            <VideoCard key={card.id} card={card} onNavigate={onNavigate} />
                        ))}
                    </div>
                </div>

                {/* Dot indicators */}
                {showArrows && (
                    <div className="watch-dots">
                        {Array.from({ length: maxIndex + 1 }, (_, i) => (
                            <button
                                key={i}
                                className={`watch-dot ${i === slideIndex ? "active" : ""}`}
                                onClick={() => setSlideIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
});
