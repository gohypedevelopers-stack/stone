import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Trash2,
    Heart,
    Plus,
    Minus,
    ShieldCheck,
    Lock,
    RefreshCcw,
    ArrowRight,
    Sparkles,
    Clock,
    Info,
    BadgePercent,
    Gift,
    Truck,
    Check,
} from "lucide-react";
import { getAllProducts } from "./data/products";

/**
 * Redesign goals (implemented):
 * ✅ All content visible (no clipped sticky sidebar on smaller heights)
 * ✅ Better alignment & consistent paddings
 * ✅ Sidebar width reduced + stable
 * ✅ Sticky summary only on large screens; normal flow on mobile
 * ✅ Recommendations do not break layout (snap, spacing)
 * ✅ Pre-order section looks intentional and aligned
 */

export default function CartPage({
    cartItems = [],
    updateQty,
    removeFromCart,
    moveToWishlist,
    discount: externalDiscount = 0,
    addToCart,
    onCheckout,
}) {
    const navigate = useNavigate();

    // ---------- Promo (mock) ----------
    const PROMO_KEY = "beauty_cart_promo";
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(PROMO_KEY)) || null;
        } catch {
            return null;
        }
    });
    const [promoError, setPromoError] = useState("");
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
        } catch { }
    }, [appliedPromo]);

    // ---------- Selection ----------
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    useEffect(() => {
        setSelectedIds(new Set(cartItems.map((i) => i.id)));
    }, [cartItems]);

    const isSelected = (id) => selectedIds.has(id);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const all = cartItems.map((i) => i.id);
            return prev.size === all.length ? new Set() : new Set(all);
        });
    };

    // ---------- Grouping Logic ----------
    const isPreOrderItem = (item) => {
        if (item?.type) return item.type === "preorder";
        if (typeof item?.isPreOrder === "boolean") return item.isPreOrder;
        const t = String(item?.tag || "").toLowerCase();
        return t.includes("exclusive") || t.includes("new launch") || t.includes("pre-order");
    };

    const selectedItems = useMemo(
        () => cartItems.filter((i) => selectedIds.has(i.id)),
        [cartItems, selectedIds]
    );

    const { standardItems, preOrderItems } = useMemo(() => {
        const std = [];
        const pre = [];
        for (const item of cartItems) (isPreOrderItem(item) ? pre : std).push(item);
        return { standardItems: std, preOrderItems: pre };
    }, [cartItems]);

    // ---------- Totals ----------
    const effectiveSubtotal = useMemo(() => {
        return selectedItems.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1), 0);
    }, [selectedItems]);

    const promoDiscount = useMemo(() => {
        if (!appliedPromo) return 0;
        const code = appliedPromo.code;
        if (code === "GLOW10") return Math.min(Math.round(effectiveSubtotal * 0.1), 300);
        if (code === "FLAT200") return effectiveSubtotal >= 999 ? 200 : 0;
        return 0;
    }, [appliedPromo, effectiveSubtotal]);

    const discount = Math.max(0, Number(externalDiscount || 0) + promoDiscount);

    const FREE_SHIP_THRESHOLD = 999;
    const baseShipping = effectiveSubtotal > 0 && effectiveSubtotal < FREE_SHIP_THRESHOLD ? 99 : 0;

    const shippingCost = useMemo(() => {
        if (!selectedItems.length) return 0;
        if (appliedPromo?.code === "FREESHIP") return 0;
        return baseShipping;
    }, [appliedPromo, baseShipping, selectedItems.length]);

    const total = Math.max(0, effectiveSubtotal - discount + shippingCost);

    const shipProgress = useMemo(() => {
        if (effectiveSubtotal <= 0) return { pct: 0, remaining: FREE_SHIP_THRESHOLD };
        const pct = Math.min(100, Math.round((effectiveSubtotal / FREE_SHIP_THRESHOLD) * 100));
        const remaining = Math.max(0, FREE_SHIP_THRESHOLD - effectiveSubtotal);
        return { pct, remaining };
    }, [effectiveSubtotal]);

    const hasOutOfStockSelected = useMemo(() => {
        return selectedItems.some((i) => {
            if (typeof i.stockLeft === "number") return i.stockLeft <= 0;
            if (typeof i.inStock === "boolean") return !i.inStock;
            return false;
        });
    }, [selectedItems]);

    const canCheckout = selectedItems.length > 0 && !hasOutOfStockSelected;

    // Recommendations
    const recommendations = useMemo(() => getAllProducts().slice(0, 6), []);

    // ---------- Handlers ----------
    const handleItemClick = (item) => {
        navigate(`/product/${item.id}`, { state: { product: item } });
    };

    const handleQty = (item, nextQty) => {
        const min = 1;
        const max = Math.min(
            typeof item.stockLeft === "number" ? Math.max(1, item.stockLeft) : Infinity,
            typeof item.maxQty === "number" ? Math.max(1, item.maxQty) : Infinity
        );
        const q = Math.max(min, Math.min(max, nextQty));
        updateQty?.(item.id, q);
    };

    const handleApplyPromo = async () => {
        const code = promoCode.trim().toUpperCase();
        setPromoError("");
        if (!code) return;

        setIsApplyingPromo(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            const allowed = new Set(["GLOW10", "FLAT200", "FREESHIP"]);
            if (!allowed.has(code)) {
                setPromoError("Invalid code. Try GLOW10, FLAT200, or FREESHIP.");
                return;
            }
            setAppliedPromo({ code });
            setPromoCode("");
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleCheckout = () => {
        if (!canCheckout) return;
        const payload = {
            items: selectedItems,
            subtotal: effectiveSubtotal,
            discount,
            shipping: shippingCost,
            total,
            promo: appliedPromo,
        };
        if (typeof onCheckout === "function") return onCheckout(payload);
        navigate("/checkout", { state: payload });
    };

    // ---------- UI ----------
    return (
        <div className="min-h-screen w-full bg-[#fffcfc] text-[#1a1a1a] font-sans pb-32 md:pb-12 selection:bg-pink-100 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#fffcfc]/85 backdrop-blur-lg border-b border-stone-100 px-4 md:px-8 h-[64px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors group"
                    >
                        <ChevronLeft size={22} className="text-stone-600 group-hover:text-black transition-colors" />
                    </button>
                    <div className="leading-tight">
                        <h1 className="text-xl font-black tracking-tight text-stone-900">Your Bag</h1>
                        <p className="hidden md:block text-[11px] text-stone-500 font-semibold">
                            Review your picks before checkout
                        </p>
                    </div>
                </div>

                <span className="text-xs font-black bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full">
                    {cartItems.length} Items
                </span>
            </header>

            {/* Main */}
            <main className="w-full px-4 md:px-8 py-6 md:py-8">
                {cartItems.length === 0 ? (
                    <EmptyState recommendations={recommendations} onAdd={addToCart} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 md:gap-10">
                        {/* Left column: Items list */}
                        <div className="flex flex-col gap-6 min-w-0">
                            {/* 1. Free Shipping Progress (Updated Style) */}
                            <div className="bg-[#fff1f7] border border-pink-100 rounded-[28px] p-6 shadow-sm relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-pink-500">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-[15px] font-black text-stone-900">
                                                {shipProgress.remaining === 0
                                                    ? "Free shipping unlocked!"
                                                    : `Add ${formatINR(shipProgress.remaining)} for free shipping`}
                                            </p>
                                            <span className="text-[11px] font-bold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-50">
                                                {shipProgress.pct}%
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                                            Free shipping above {formatINR(FREE_SHIP_THRESHOLD)}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[4px] w-full bg-white rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${shipProgress.pct}%` }}
                                    />
                                </div>
                            </div>

                            {/* 2. Pincode / Shipping Destination */}
                            <div className="bg-white rounded-[24px] p-4 border border-stone-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-stone-900">Delivery to 273164</p>
                                        <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wide">Nautanwa</p>
                                    </div>
                                </div>
                                <button className="text-pink-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors border border-pink-100">
                                    Change
                                </button>
                            </div>

                            {/* Select All */}
                            <div className="flex items-center justify-between px-1 mt-4">
                                <button onClick={toggleSelectAll} className="flex items-center gap-2 group">
                                    <div
                                        className={`w-5 h-5 rounded-[8px] border-2 flex items-center justify-center transition-all ${selectedIds.size === cartItems.length
                                            ? "bg-[#151515] border-[#151515]"
                                            : "bg-transparent border-stone-300 group-hover:border-stone-400"
                                            }`}
                                    >
                                        {selectedIds.size === cartItems.length && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-black text-stone-900 uppercase tracking-tighter">Select all ({cartItems.length})</span>
                                </button>
                                <span className="text-xs font-bold text-stone-400">{selectedItems.length} selected</span>
                            </div>

                            {/* Ships Soon Items */}
                            {standardItems.length > 0 && (
                                <section className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-4">
                                        {standardItems.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                selected={isSelected(item.id)}
                                                onToggle={() => toggleSelect(item.id)}
                                                onUpdateQty={handleQty}
                                                onRemove={() => removeFromCart(item.id)}
                                                onWishlist={() => moveToWishlist(item)}
                                                onItemClick={() => handleItemClick(item)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 3. Gifts Selection Section (New) */}
                            {effectiveSubtotal > 1500 && (
                                <section className="mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-black text-stone-900">Gifts <span className="text-pink-600 font-bold">(2/2 selected)</span></h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#151515] bg-stone-100 px-3 py-1 rounded-full">Reward Unlocked</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'g1', name: 'Free Charlotte Tilbury Glow Toner', desc: '5ml', date: 'Delivery by Mon, 30 Mar', img: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&w=100&q=80' },
                                            { id: 'g2', name: 'Free Pillow Talk Push Up Lashes', desc: '1.5ml', date: 'Delivery by Mon, 30 Mar', img: 'https://images.unsplash.com/photo-1512496011931-a2c388278ab0?auto=format&fit=crop&w=100&q=80' }
                                        ].map(gift => (
                                            <div key={gift.id} className="bg-white/40 border border-pink-50 rounded-[24px] p-4 flex gap-4 items-center group relative overflow-hidden">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
                                                    <img src={gift.img} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-[13px] font-black text-stone-900 leading-tight">{gift.name}</h4>
                                                    <p className="text-[11px] text-stone-500 font-bold mb-1">{gift.desc}</p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-bold uppercase tracking-wide">
                                                        <Truck size={12} className="text-pink-400" /> {gift.date}
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/5 rounded-bl-[100px] -z-0 pointer-events-none" />
                                                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                                    <Check size={14} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Pre-order Items */}
                            {preOrderItems.length > 0 && (
                                <section className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <Clock size={14} className="text-purple-500" />
                                        <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest">Pre-orders</h3>
                                    </div>
                                    <div className="bg-purple-50/35 border border-purple-100/60 rounded-[26px] p-3 flex flex-col gap-3">
                                        {preOrderItems.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                selected={isSelected(item.id)}
                                                onToggle={() => toggleSelect(item.id)}
                                                onUpdateQty={handleQty}
                                                onRemove={() => removeFromCart(item.id)}
                                                onWishlist={() => moveToWishlist(item)}
                                                isPreOrder
                                                cardClassName="bg-white/70 hover:bg-white border border-white/40"
                                                onItemClick={() => handleItemClick(item)}
                                            />
                                        ))}
                                        <p className="text-[11px] text-stone-600 font-semibold flex items-center gap-1.5 px-1 pt-1">
                                            <Info size={12} className="text-purple-500" /> Pre-order items ship on their release date. Cancel anytime before shipping.
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right column: Summary sidebar */}
                        <aside className="min-w-0">
                            <div className="lg:sticky lg:top-20 space-y-4">
                                {/* Promo */}
                                <div className="bg-white rounded-[24px] p-2 border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                                    {appliedPromo ? (
                                        <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-[18px] border border-green-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                                    <BadgePercent size={16} />
                                                </div>
                                                <div className="leading-tight">
                                                    <p className="text-xs font-black text-stone-900">{appliedPromo.code}</p>
                                                    <p className="text-[10px] text-stone-500 font-semibold">Offer applied</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAppliedPromo(null);
                                                    setPromoCode("");
                                                    setPromoError("");
                                                }}
                                                className="text-stone-400 hover:text-red-500 p-2"
                                                title="Remove promo"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 p-1">
                                            <input
                                                type="text"
                                                placeholder="Promo Code"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                className="flex-1 bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all uppercase"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={!promoCode || isApplyingPromo}
                                                className="bg-stone-900 text-white rounded-[16px] px-5 text-sm font-black hover:bg-stone-800 disabled:opacity-50 transition-all"
                                            >
                                                {isApplyingPromo ? "..." : "Apply"}
                                            </button>
                                        </div>
                                    )}
                                    {promoError && <p className="text-[11px] text-red-500 font-semibold px-4 pb-2">{promoError}</p>}
                                </div>

                                {/* Summary */}
                                <div className="bg-white/70 backdrop-blur-md rounded-[28px] p-6 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                                    <h2 className="text-lg font-black text-stone-900 mb-6">Order Summary</h2>
                                    <div className="space-y-3 mb-6">
                                        <SummaryRow label="Subtotal" value={formatINR(effectiveSubtotal)} />
                                        <SummaryRow label="Discount" value={`- ${formatINR(discount)}`} highlight={discount > 0} />
                                        <SummaryRow label="Shipping" value={shippingCost === 0 ? "Free" : formatINR(shippingCost)} highlight={shippingCost === 0} />
                                        <div className="h-px bg-stone-100 my-4" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-stone-900 font-black text-lg">Total</span>
                                            <span className="text-stone-900 font-black text-xl">{formatINR(total)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={!canCheckout}
                                        className="w-full py-4 bg-stone-900 text-white rounded-[20px] font-black text-[15px] hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-200/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {hasOutOfStockSelected && (
                                        <p className="text-[11px] text-center text-red-500 font-black mt-3 bg-red-50 py-2 rounded-lg">
                                            Remove out-of-stock items to proceed
                                        </p>
                                    )}

                                    {/* Trust */}
                                    <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-2">
                                        <TrustItem icon={ShieldCheck} label="Authentic" />
                                        <TrustItem icon={Lock} label="Secure" />
                                        <TrustItem icon={RefreshCcw} label="Easy Returns" />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            {/* Mobile Sticky Bar */}
            {cartItems.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-100 p-4 pb-8 z-50 flex items-center gap-4 shadow-2xl">
                    <div className="flex-1">
                        <p className="text-[10px] text-stone-500 font-black uppercase tracking-wider">Total</p>
                        <p className="text-xl font-black text-stone-900">{formatINR(total)}</p>
                        <p className="text-[10px] text-stone-500 font-semibold">{selectedItems.length} selected</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={!canCheckout}
                        className="flex-[1.5] py-3.5 bg-stone-900 text-white rounded-[16px] font-black text-sm hover:bg-pink-600 transition-colors shadow-lg disabled:opacity-50"
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
}

/* ---------------- Subcomponents ---------------- */

function CartItem({ item, selected, onToggle, onUpdateQty, onRemove, onWishlist, isPreOrder, cardClassName = "", onItemClick }) {
    const isOutOfStock = (typeof item.stockLeft === "number" && item.stockLeft <= 0) || item.inStock === false;
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className={`group relative p-4 rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 border border-stone-100 ${cardClassName}`}
        >
            {/* checkbox */}
            <button
                onClick={onToggle}
                className={`absolute top-4 left-4 w-5 h-5 rounded-[8px] border-2 flex items-center justify-center transition-all z-10 ${selected ? "bg-stone-900 border-stone-900" : "bg-white border-stone-200 group-hover:border-stone-400"
                    }`}
                aria-label="Select item"
            >
                {selected && <Check size={12} className="text-white" />}
            </button>

            <div className="flex gap-5 pl-8">
                {/* image */}
                <div
                    onClick={onItemClick}
                    className="w-24 h-28 rounded-[18px] bg-stone-50 overflow-hidden shrink-0 relative flex items-center justify-center cursor-pointer"
                >
                    {!imgError ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            onError={() => setImgError(true)}
                            className={`w-full h-full object-cover transition-opacity ${isOutOfStock ? "opacity-50" : ""}`}
                        />
                    ) : (
                        <div className="text-stone-300 text-[10px] font-bold text-center px-1">No Image</div>
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="text-[10px] font-black text-white bg-black/70 px-2 py-1 rounded-full uppercase">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                            {isPreOrder && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-[8px] mb-2 uppercase tracking-wide">
                                    <Sparkles size={10} /> Pre-Order
                                </span>
                            )}
                            <h3
                                onClick={onItemClick}
                                className="text-base font-black text-stone-900 leading-tight mb-1 truncate cursor-pointer hover:text-pink-600 transition-colors"
                            >
                                {item.name}
                            </h3>
                            <p className="text-xs text-stone-500 font-semibold truncate">{item.tag || "Standard Size"}</p>
                        </div>

                        <p className="text-base font-black text-stone-900 whitespace-nowrap">{formatINR((item.price || 0) * (item.qty || 1))}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 gap-3">
                        {/* stepper */}
                        <div className="flex items-center gap-1 bg-stone-50 rounded-[14px] p-1 border border-stone-100">
                            <button
                                onClick={() => onUpdateQty(item, (item.qty || 1) - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-[10px] bg-white text-stone-600 hover:text-black shadow-sm disabled:opacity-50"
                                disabled={(item.qty || 1) <= 1}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-black">{item.qty || 1}</span>
                            <button
                                onClick={() => onUpdateQty(item, (item.qty || 1) + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-[10px] bg-white text-stone-600 hover:text-black shadow-sm disabled:opacity-50"
                                disabled={isOutOfStock}
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onWishlist}
                                className="text-stone-400 hover:text-pink-500 transition-colors flex items-center gap-1 text-xs font-black"
                                title="Save"
                            >
                                <Heart size={16} /> <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                                onClick={onRemove}
                                className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-black"
                                title="Remove"
                            >
                                <Trash2 size={16} /> <span className="hidden sm:inline">Remove</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, highlight }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-stone-500 font-semibold">{label}</span>
            <span className={`font-black ${highlight ? "text-pink-600" : "text-stone-900"}`}>{value}</span>
        </div>
    );
}

function TrustItem({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                <Icon size={14} />
            </div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wide">{label}</span>
        </div>
    );
}

function RecCard({ product, onAdd }) {
    return (
        <div className="min-w-[160px] md:min-w-[200px] snap-start group pb-4">
            <div className="aspect-[4/5] rounded-[24px] bg-stone-100 overflow-hidden relative mb-4">
                <img
                    src={product.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={product.name}
                />
                <button
                    onClick={onAdd}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center text-stone-900 hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                    title="Add to Cart"
                >
                    <Plus size={18} />
                </button>
            </div>
            <h4 className="font-black text-sm text-stone-900 truncate mb-0.5">{product.name}</h4>
            <p className="text-[11px] text-stone-500 font-semibold mb-1 truncate">{product.tag}</p>
            <p className="text-sm font-black text-stone-900">{formatINR(product.price)}</p>
        </div>
    );
}

function EmptyState({ recommendations = [], onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center relative px-4">
            {/* Animated Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700" />

            <div className="relative z-10 max-w-2xl w-full">
                <div className="relative inline-block mb-10 group">
                    <div className="absolute inset-0 bg-pink-400 opacity-20 blur-3xl rounded-full animate-pulse group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 backdrop-blur-sm flex items-center justify-center animate-float">
                        <div className="relative">
                            <Gift size={60} className="text-pink-500 md:hidden" />
                            <Gift size={80} className="text-pink-500 hidden md:block" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-linear-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white scale-0 animate-[pop_0.5s_ease_1s_forwards]">
                                <Sparkles size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-4 tracking-tight">
                    Your bag is <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-purple-600">feeling light</span>
                </h2>
                <p className="text-stone-500 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed font-medium">
                    It looks like you haven't added anything yet. Let's find something special just for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
                    <Link
                        to="/best-sellers"
                        className="px-10 py-4 bg-stone-900 text-white rounded-[20px] font-black text-[15px] hover:bg-pink-600 hover:shadow-[0_15px_30px_rgba(219,39,119,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95 group flex items-center justify-center gap-2"
                    >
                        Shop Best Sellers
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/shop"
                        className="px-10 py-4 bg-white/70 border-2 border-stone-200 text-stone-900 rounded-[20px] font-black text-[15px] hover:border-pink-300 hover:bg-white transition-all duration-300 backdrop-blur-sm"
                    >
                        Explore All Products
                    </Link>
                </div>
            </div>

            {/* Recommendations Section - Outside restricted max-w */}
            <div className="w-full max-w-7xl mx-auto mt-6">
                <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-stone-900">You Might Also Like</h3>
                        <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-1">Special picks curated just for you</p>
                    </div>
                    <Link
                        to="/shop"
                        className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all"
                    >
                        <Plus size={20} />
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar px-4 sm:px-0 scroll-smooth">
                    {recommendations.map((product) => (
                        <RecCard key={product.id} product={product} onAdd={() => onAdd(product)} />
                    ))}
                </div>
            </div>

            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes pop {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}
            </style>
        </div>
    );
}

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
}
