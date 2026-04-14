import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Ticket,
  X,
  Star,
} from "lucide-react";
import { getAllProducts } from "./data/products";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import { toast } from "sonner";
import { API_URL } from "@/utils/api";

/**
 * Redesign goals (implemented):
 * ✅ All content visible (no clipped sticky sidebar on smaller heights)
 * ✅ Better alignment & consistent paddings
 * ✅ Sidebar width reduced + stable
 * ✅ Sticky summary only on large screens; normal flow on mobile
 * ✅ Recommendations do not break layout (snap, spacing)
 * ✅ Pre-order section looks intentional and aligned
 */

import { resolveImage } from "./utils/urlHelper";

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
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ---------- Promo (mock) ----------
  const PROMO_KEY = "beauty_cart_promo";
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PROMO_KEY));
    } catch {
      return null;
    }
  });

  // ---------- Drag to Scroll (Special Deals) ----------
  const dealsScrollRef = useRef(null);
  const [isDraggingDeals, setIsDraggingDeals] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (!dealsScrollRef.current) return;
    setIsDraggingDeals(true);
    setStartX(e.pageX - dealsScrollRef.current.offsetLeft);
    setScrollLeft(dealsScrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDraggingDeals(false);
  const handleMouseUp = () => setIsDraggingDeals(false);
  const handleMouseMove = (e) => {
    if (!isDraggingDeals || !dealsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - dealsScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    dealsScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isCouponsDrawerOpen, setIsCouponsDrawerOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [isDealsVisible, setIsDealsVisible] = useState(true);
  const [activeDealTab, setActiveDealTab] = useState(1);
  const [dbProducts, setDbProducts] = useState([]);
  const [specialDeals, setSpecialDeals] = useState([]);

  // API CONFIG is now global

  // Fetch Coupons when drawer opens
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!isCouponsDrawerOpen) return;
      try {
        const res = await fetch(`${API_URL}/coupons`);
        const data = await res.json();
        if (data.success) setAvailableCoupons(data.data);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
    fetchCoupons();
  }, [isCouponsDrawerOpen]);

  // Fetch Live Products for Deals (Independent)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        if (data.success) {
          const products = data.data || [];
          setDbProducts(products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Dynamically compute deals based on cart contents
  // Deals are globally available and show up if conditions are met
  const cartLinkedDeals = useMemo(() => {
    if (!dbProducts.length || !cartItems.length) return [];

    // Find all active special offer products
    const deals = dbProducts.filter((p) => {
      const isDeal =
        (p.specialOfferType && p.specialOfferType !== "None") ||
        p.category?.name === "Special Offer" ||
        (typeof p.category === "string" && p.category === "Special Offer");
      return isDeal;
    });

    // Sort by deal number
    deals.sort((a, b) => {
      const nA = parseInt(a.specialOfferType?.split(" ")[1]) || 99;
      const nB = parseInt(b.specialOfferType?.split(" ")[1]) || 99;
      return nA - nB;
    });

    return deals;
  }, [dbProducts, cartItems]);

  // Use cart-linked deals instead of static specialDeals
  useEffect(() => {
    setSpecialDeals(cartLinkedDeals);
  }, [cartLinkedDeals]);

  useEffect(() => {
    try {
      localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
    } catch {}
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
    if (item?.stock <= 0) return true;
    if (item?.type) return item.type === "preorder";
    if (typeof item?.isPreOrder === "boolean") return item.isPreOrder;
    const t = String(item?.tag || "").toLowerCase();
    return (
      t.includes("exclusive") ||
      t.includes("new launch") ||
      t.includes("pre-order")
    );
  };

  const selectedItems = useMemo(
    () => cartItems.filter((i) => selectedIds.has(i.id)),
    [cartItems, selectedIds],
  );

  const { standardItems, preOrderItems, baseInventoryItems } = useMemo(() => {
    const std = [];
    const pre = [];
    const base = [];
    for (const item of cartItems) {
      const isGift =
        item.category?.name === "Special Offer" ||
        item.category === "Special Offer";
      if (isPreOrderItem(item)) pre.push(item);
      else std.push(item);
      if (!isGift) base.push(item);
    }
    return { standardItems: std, preOrderItems: pre, baseInventoryItems: base };
  }, [cartItems]);

  // Auto-remove gifts if base inventory is empty
  useEffect(() => {
    if (baseInventoryItems.length === 0) {
      const giftsInCart = cartItems.filter(
        (item) =>
          item.category?.name === "Special Offer" ||
          item.category === "Special Offer",
      );
      if (giftsInCart.length > 0) {
        giftsInCart.forEach((gift) => removeFromCart(gift.id));
      }
    }
  }, [baseInventoryItems.length, cartItems, removeFromCart]);

  // ---------- Totals ----------
  const PLATFORM_FEE = 23;

  const totalMrp = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const mrp = Number(
        item.mrp || item.originalPrice || Number(item.price || 0),
      );
      return sum + mrp * Number(item.qty || 1);
    }, 0);
  }, [selectedItems]);

  const effectiveSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
      0,
    );
  }, [selectedItems]);

  // Calculate max potential savings from available coupons
  const maxSavings = useMemo(() => {
    if (!availableCoupons.length) return 0;
    const savingsArray = availableCoupons.map((c) => {
      const val = Number(c.discountValue || 0);
      if (c.discountType === "PERCENTAGE") {
        // Calculate actual INR savings for percentage coupons
        return (effectiveSubtotal * val) / 100;
      }
      return val;
    });
    return Math.max(...savingsArray);
  }, [availableCoupons, effectiveSubtotal]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    // If we have a calculated discount amount from the backend, use it
    if (appliedPromo.discountAmount) return Number(appliedPromo.discountAmount);

    // Fallback for legacy/hardcoded codes if needed
    const code = appliedPromo.code;
    if (code === "GLOW10")
      return Math.min(Math.round(effectiveSubtotal * 0.1), 300);
    if (code === "FLAT200") return effectiveSubtotal >= 999 ? 200 : 0;
    return 0;
  }, [appliedPromo, effectiveSubtotal]);

  const mrpDiscount = Math.max(0, totalMrp - effectiveSubtotal);
  const promoAndExternalOff = Math.max(
    0,
    Number(externalDiscount || 0) + promoDiscount,
  );

  // Total reduction shown as "Discount on MRP"
  const totalMRPDiscount = mrpDiscount + promoAndExternalOff;

  const FREE_SHIP_THRESHOLD = 999;
  const baseShipping =
    effectiveSubtotal > 0 && effectiveSubtotal < FREE_SHIP_THRESHOLD ? 99 : 0;

  const shippingCost = useMemo(() => {
    if (!selectedItems.length) return 0;
    if (appliedPromo?.code === "FREESHIP") return 0;
    return baseShipping;
  }, [appliedPromo, baseShipping, selectedItems.length]);

  const total = Math.max(
    0,
    totalMrp -
      totalMRPDiscount +
      shippingCost +
      (selectedItems.length > 0 ? PLATFORM_FEE : 0),
  );

  const shipProgress = useMemo(() => {
    if (effectiveSubtotal <= 0)
      return { pct: 0, remaining: FREE_SHIP_THRESHOLD };
    const pct = Math.min(
      100,
      Math.round((effectiveSubtotal / FREE_SHIP_THRESHOLD) * 100),
    );
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - effectiveSubtotal);
    return { pct, remaining };
  }, [effectiveSubtotal]);

  const hasOutOfStockSelected = false; // Out-of-stock items are treated as pre-orders now

  const canCheckout = selectedItems.length > 0;

  // Recommendations
  const recommendations = useMemo(() => getAllProducts().slice(0, 6), []);

  // ---------- Delivery Location ----------
  const [pincode, setPincode] = useState(
    () => localStorage.getItem("cart_pincode") || "273164",
  );
  const [locationName, setLocationName] = useState(
    () => localStorage.getItem("cart_location") || "Nautanwa",
  );
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart_pincode", pincode);
    localStorage.setItem("cart_location", locationName);
  }, [pincode, locationName]);

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddress = user.addresses[0];
      if (defaultAddress.postalCode && defaultAddress.postalCode !== pincode) {
        setPincode(defaultAddress.postalCode);
      }
      if (defaultAddress.city) {
        setLocationName(defaultAddress.city.toUpperCase());
      }
    }
  }, [user]);

  const handleUpdateLocation = (newPincode, newLocation) => {
    setPincode(newPincode);
    setLocationName(newLocation);
    setIsPincodeModalOpen(false);
  };

  // ---------- Handlers ----------
  const handleItemClick = (item) => {
    navigate(`/product/${item.id}`, { state: { product: item } });
  };

  const handleQty = (item, nextQty) => {
    const min = 1;
    const max = Math.min(
      typeof item.stock === "number" ? Math.max(1, item.stock) : Infinity,
      typeof item.maxQty === "number" ? Math.max(1, item.maxQty) : Infinity,
    );
    const q = Math.max(min, Math.min(max, nextQty));
    updateQty?.(item.id, q);
  };

  const handleApplyPromo = async (codeFromDrawer) => {
    const code = (codeFromDrawer || promoCode).trim().toUpperCase();
    setPromoError("");
    if (!code) return;

    setIsApplyingPromo(true);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: effectiveSubtotal }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedPromo(data.data); // Stores code, discountType, discountValue, discountAmount
        setPromoCode("");
        if (isCouponsDrawerOpen) setIsCouponsDrawerOpen(false);
      } else {
        setPromoError(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      setPromoError("Failed to validate coupon. Please try again.");
      console.error("Promo validation error:", err);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleCheckout = () => {
    if (!canCheckout) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const payload = {
      items: selectedItems,
      subtotal: effectiveSubtotal,
      discount: totalMRPDiscount,
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
      <header className="sticky top-0 z-50 bg-[#fffcfc] border-b border-stone-100 px-4 md:px-8 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors group"
          >
            <ChevronLeft
              size={22}
              className="text-stone-600 group-hover:text-black transition-colors"
            />
          </button>
          <div className="leading-tight">
            <h1 className="text-xl font-black tracking-tight text-stone-900">
              Your Bag
            </h1>
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
              {/* 1. Multi-Milestone Tiered Rewards */}
              <div className="bg-white border border-stone-100 rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group/milestone transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
                {/* Header Info */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner group-hover/milestone:rotate-6 transition-transform duration-500">
                      <Gift size={22} strokeWidth={2.5} />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[17px] font-black text-stone-900 tracking-tight italic uppercase">
                        {(() => {
                          const milestones = [599, 899, 1199];
                          const next = milestones.find(
                            (m) => effectiveSubtotal < m,
                          );
                          if (!next) return "You have availed all offers!";
                          return `Add ${formatINR(next - effectiveSubtotal)} to unlock next gift!`;
                        })()}
                      </p>
                      <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em] mt-1">
                        Special tiered rewards active
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-stone-900 leading-none">
                      {formatINR(effectiveSubtotal)}
                    </span>
                    <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                      CURRENT CART
                    </span>
                  </div>
                </div>

                {/* Progress Track with Milestones */}
                <div className="relative pt-8 pb-10 px-6">
                  {/* The Track */}
                  <div className="absolute top-1/2 left-6 right-6 h-[6px] -translate-y-1/2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      style={{
                        width: `${Math.min(100, (effectiveSubtotal / 1199) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Milestone Nodes */}
                  <div className="relative flex justify-between">
                    {[
                      { threshold: 599, label: "Mini Sunscreen" },
                      { threshold: 899, label: "Mini Serum 5mL" },
                      { threshold: 1199, label: "Travel Pouch" },
                    ].map((milestone, i) => {
                      const isAchieved =
                        effectiveSubtotal >= milestone.threshold;
                      return (
                        <div
                          key={i}
                          className="relative flex flex-col items-center group/node"
                        >
                          {/* Amount Above */}
                          <div className="absolute -top-10 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${isAchieved ? "text-stone-900" : "text-stone-300"} transition-colors duration-500`}
                            >
                              {formatINR(milestone.threshold)}
                            </span>
                          </div>

                          {/* The Node Icon */}
                          <div
                            className={`w-8 h-8 rounded-full border-4 flex items-center justify-center relative z-10 transition-all duration-700 transform ${
                              isAchieved
                                ? "bg-white border-pink-500 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)] scale-110"
                                : "bg-stone-50 border-stone-200 text-stone-200"
                            }`}
                          >
                            {isAchieved ? (
                              <Check size={14} strokeWidth={4} />
                            ) : (
                              <Gift size={12} strokeWidth={3} />
                            )}

                            {/* Pulse effect for achieved */}
                            {isAchieved && (
                              <span className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping" />
                            )}
                          </div>

                          {/* Reward Name Below */}
                          <div className="absolute -bottom-10 whitespace-nowrap text-center">
                            <p
                              className={`text-[10px] font-bold leading-tight uppercase tracking-tight transition-all duration-500 ${
                                isAchieved
                                  ? "text-stone-900 transform translate-y-1"
                                  : "text-stone-400"
                              }`}
                            >
                              {milestone.label.split(" ").map((word, idx) => (
                                <span key={idx} className="block">
                                  {word}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Background Accents */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-50/50 rounded-full blur-3xl group-hover/milestone:bg-pink-100/50 transition-colors" />
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-50/30 rounded-full blur-3xl" />
              </div>

              {/* 2. Pincode / Shipping Destination */}
              <div className="bg-white rounded-[24px] p-4 border border-stone-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-stone-900 tracking-tight">
                      {user ? `Delivery to ${pincode}` : "Please login to set location"}
                    </p>
                    <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wide">
                      {user ? locationName : "Login to view delivery options"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => user ? setIsPincodeModalOpen(true) : setIsAuthModalOpen(true)}
                  className="text-pink-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors border border-pink-100 shadow-sm"
                >
                  {user ? "Change" : "Login"}
                </button>
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between px-1 mt-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-5 h-5 rounded-[8px] border-2 flex items-center justify-center transition-all ${
                      selectedIds.size === cartItems.length
                        ? "bg-[#151515] border-[#151515]"
                        : "bg-transparent border-stone-300 group-hover:border-stone-400"
                    }`}
                  >
                    {selectedIds.size === cartItems.length && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm font-black text-stone-900 uppercase tracking-tighter">
                    Select all ({cartItems.length})
                  </span>
                </button>
                <span className="text-xs font-bold text-stone-400">
                  {selectedItems.length} selected
                </span>
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

              {/* Pre-order Items */}
              {preOrderItems.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <Clock size={14} className="text-purple-500" />
                    <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest">
                      Pre-orders
                    </h3>
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
                      <Info size={12} className="text-purple-500" /> Pre-order
                      items ship on their release date. Cancel anytime before
                      shipping.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Right column: Summary sidebar */}
            <aside className="min-w-0">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Promo / Coupons */}
                <div className="space-y-3">
                  {appliedPromo ? (
                    <div className="bg-white rounded-[24px] p-2 border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-[18px] border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                            <BadgePercent size={16} />
                          </div>
                          <div className="leading-tight">
                            <p className="text-xs font-black text-stone-900">
                              {appliedPromo.code}
                            </p>
                            <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-tight">
                              Offer applied
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode("");
                            setPromoError("");
                          }}
                          className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                          title="Remove promo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-green-600 font-black uppercase text-center mt-2 tracking-widest pb-1 animate-pulse">
                        Savings applied to your bag!
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCouponsDrawerOpen(true)}
                      className="w-full bg-white rounded-[24px] p-4 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-pink-200 hover:shadow-[0_8px_30px_rgba(255,79,163,0.08)] transition-all duration-300 transform active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        {/* Golden Coin Icon */}
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FFD700] via-[#FFB800] to-[#E5A000] flex items-center justify-center shadow-[0_4px_10px_rgba(229,160,0,0.3)] border border-white/20 relative overflow-hidden shrink-0">
                          <span className="text-white text-lg font-black italic drop-shadow-sm select-none relative z-10">
                            ₹
                          </span>
                          <div className="absolute top-0 left-0 w-full h-full bg-white/25 rounded-full scale-125 translate-x-1 -translate-y-1 blur-[3px]" />
                        </div>
                        <div className="text-left">
                          <p className="text-[15px] font-black text-emerald-600 tracking-tight leading-tight">
                            Save upto {formatINR(maxSavings || 502)}
                          </p>
                          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                            {availableCoupons.length || 3} Coupons & Offers
                            Available
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className="text-stone-300 group-hover:text-pink-500 transition-colors group-hover:translate-y-0.5"
                      />
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white/70 backdrop-blur-md rounded-[28px] p-6 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-black text-stone-900 mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-3.5 mb-6">
                    <SummaryRow label="Total MRP" value={formatINR(totalMrp)} />
                    {totalMRPDiscount > 0 && (
                      <SummaryRow
                        label="Discount on MRP"
                        value={`- ${formatINR(totalMRPDiscount)}`}
                        highlight={totalMRPDiscount > 0}
                        color="text-emerald-500"
                      />
                    )}
                    <SummaryRow
                      label="Platform Fee"
                      value={formatINR(PLATFORM_FEE)}
                      action="KNOW MORE"
                    />
                    <SummaryRow
                      label="Shipping"
                      value={
                        shippingCost === 0 ? "FREE" : formatINR(shippingCost)
                      }
                      highlight={shippingCost === 0}
                      color={
                        shippingCost === 0
                          ? "text-emerald-500"
                          : "text-stone-900"
                      }
                    />

                    <div className="flex justify-between items-center pt-2 mt-2 border-stone-100">
                      <span className="text-stone-900 font-black text-lg uppercase tracking-tight">
                        Total Amount
                      </span>
                      <span className="text-stone-900 font-black text-xl">
                        {formatINR(total)}
                      </span>
                    </div>

                    <div className="h-[2px] border-t border-dashed border-stone-200 my-5" />

                    {/* Unlocked Deals Section — before Total Amount */}
                    {isDealsVisible &&
                      specialDeals.length > 0 &&
                      baseInventoryItems.length > 0 &&
                      effectiveSubtotal >= 499 && (
                        <div className="bg-[#F0EEFF] rounded-[20px] border border-[#DEDCFF] p-2.5 relative overflow-hidden group/deals shadow-[0_4px_20px_rgba(0,0,0,0.02)] shrink-0">
                          {/* Header Row: Box Icon + Tabs */}
                          <div className="flex items-center gap-3 mb-2.5 relative z-10">
                            {/* Gift Box Icon - Slimmed */}
                            <div className="w-8 h-8 shrink-0 relative bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                              <Gift
                                size={16}
                                className="text-indigo-600 drop-shadow-sm"
                              />
                              <Sparkles
                                className="absolute -top-0.5 -right-0.5 text-yellow-400 animate-pulse"
                                size={8}
                              />
                            </div>

                            {/* Tabs Container */}
                            <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                              {[1, 2, 3, 4].map((slotNum) => {
                                const hasProducts = specialDeals.some(
                                  (p) =>
                                    p.specialOfferType === `Deal ${slotNum}`,
                                );
                                if (!hasProducts && slotNum > 1) return null; // Only show first slot if empty, otherwise hide empty slots

                                return (
                                  <button
                                    key={slotNum}
                                    onClick={() => setActiveDealTab(slotNum)}
                                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${
                                      activeDealTab === slotNum
                                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100"
                                        : "text-stone-400 hover:text-indigo-400"
                                    }`}
                                  >
                                    {activeDealTab === slotNum && (
                                      <Check size={12} strokeWidth={4} />
                                    )}
                                    {"DEAL " + slotNum}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => setIsDealsVisible(false)}
                              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-black/5 rounded-full transition-colors shrink-0"
                              title="Skip"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>

                          {/* Sub-header - Slimmed */}
                          <div className="flex items-center justify-between mb-3 mt-1 relative z-10 px-1 gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-bold text-[#5C4DCC]/80 uppercase tracking-tight leading-tight">
                                {(() => {
                                  const regularQty = cartItems
                                    .filter((i) => {
                                      const isSpecial =
                                        i.category?.name === "Special Offer" ||
                                        i.category === "Special Offer" ||
                                        (i.specialOfferType &&
                                          i.specialOfferType !== "None");
                                      return !isSpecial;
                                    })
                                    .reduce((sum, x) => sum + (x.qty || 0), 0);

                                  const specialQty = cartItems
                                    .filter((i) => {
                                      const isSpecial =
                                        i.category?.name === "Special Offer" ||
                                        i.category === "Special Offer" ||
                                        (i.specialOfferType &&
                                          i.specialOfferType !== "None");
                                      return isSpecial;
                                    })
                                    .reduce((sum, x) => sum + (x.qty || 0), 0);

                                  const available = regularQty - specialQty;
                                  return available > 0
                                    ? `Unlocked: ${available} more slot${available > 1 ? "s" : ""} available!`
                                    : `Slots Full: Add more items to unlock more deals`;
                                })()}
                              </p>
                              <Info
                                size={12}
                                className="text-stone-400 opacity-60 shrink-0"
                              />
                            </div>
                            <div className="text-[11px] font-black text-white px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm shrink-0 whitespace-nowrap">
                              {(() => {
                                const regularQty = cartItems
                                  .filter((i) => {
                                    const isSpecial =
                                      i.category?.name === "Special Offer" ||
                                      i.category === "Special Offer" ||
                                      (i.specialOfferType &&
                                        i.specialOfferType !== "None");
                                    return !isSpecial;
                                  })
                                  .reduce((sum, x) => sum + (x.qty || 0), 0);

                                const specialQty = cartItems
                                  .filter((i) => {
                                    const isSpecial =
                                      i.category?.name === "Special Offer" ||
                                      i.category === "Special Offer" ||
                                      (i.specialOfferType &&
                                        i.specialOfferType !== "None");
                                      return isSpecial;
                                  })
                                  .reduce((sum, x) => sum + (x.qty || 0), 0);

                                return `${specialQty} / ${regularQty}`;
                              })()}
                            </div>
                          </div>

                          {/* Multi-Product Horizontal Carousel */}
                          <div className="relative z-10 -mx-1 px-1">
                            <div
                              ref={dealsScrollRef}
                              onMouseDown={handleMouseDown}
                              onMouseLeave={handleMouseLeave}
                              onMouseUp={handleMouseUp}
                              onMouseMove={handleMouseMove}
                              className={`flex gap-3 overflow-x-auto no-scrollbar pb-3 px-1 ${
                                isDraggingDeals
                                  ? "cursor-grabbing select-none"
                                  : "cursor-grab snap-x snap-mandatory"
                              }`}
                            >
                              {(() => {
                                const slotName = `Deal ${activeDealTab}`;
                                const slotProducts = specialDeals.filter(
                                  (p) =>
                                    p.specialOfferType === slotName ||
                                    (slotName === "Deal 1" &&
                                      (!p.specialOfferType ||
                                        p.specialOfferType === "None")), // Fallback for uncategorized specials
                                );

                                if (slotProducts.length === 0) {
                                  return (
                                    <div className="w-full py-4 text-center text-[10px] text-stone-400 font-bold bg-white/40 rounded-xl border border-dashed border-stone-200">
                                      No deals in this slot yet
                                    </div>
                                  );
                                }

                                const regularQty = cartItems
                                  .filter((i) => {
                                    const isSpecial =
                                      i.category?.name === "Special Offer" ||
                                      i.category === "Special Offer" ||
                                      (i.specialOfferType &&
                                        i.specialOfferType !== "None");
                                    return !isSpecial;
                                  })
                                  .reduce((sum, x) => sum + (x.qty || 0), 0);

                                const specialQty = cartItems
                                  .filter((i) => {
                                    const isSpecial =
                                      i.category?.name === "Special Offer" ||
                                      i.category === "Special Offer" ||
                                      (i.specialOfferType &&
                                        i.specialOfferType !== "None");
                                    return isSpecial;
                                  })
                                  .reduce((sum, x) => sum + (x.qty || 0), 0);

                                const isLocked = specialQty >= regularQty;

                                return slotProducts.map((deal) => {
                                  const isInBag = cartItems.some(
                                    (i) => i.id === deal.id,
                                  );
                                  return (
                                    <div
                                      key={deal.id}
                                      className={`w-[240px] bg-white rounded-xl p-3 shadow-sm border border-white flex gap-3 items-center shrink-0 group/card transition-all hover:shadow-md snap-start select-none`}
                                    >
                                      <div className="w-16 h-16 bg-stone-50 rounded-lg overflow-hidden relative shrink-0 border border-stone-100">
                                        <img
                                          draggable={false}
                                          src={
                                            resolveImage(deal.imageUrls?.[0]) ||
                                            resolveImage(deal.image)
                                          }
                                          className="w-full h-full object-cover select-none"
                                          alt={deal.name}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-[10px] font-bold text-stone-900 leading-tight mb-1 line-clamp-1">
                                          {deal.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="text-[12px] font-black text-[#00A382]">
                                            ₹{deal.price}
                                          </span>
                                          {deal.mrp > deal.price && (
                                            <span className="text-[9px] text-stone-400 line-through font-bold">
                                              ₹{deal.mrp}
                                            </span>
                                          )}
                                        </div>
                                        <button
                                          disabled={isInBag || isLocked}
                                          onClick={() => {
                                            if (!isInBag) {
                                              addToCart(deal);
                                            }
                                          }}
                                          className={`w-full py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
                                            isInBag
                                              ? "bg-green-50 text-green-600 border border-green-100"
                                              : isLocked
                                                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                                                : "bg-[#FF4FA3] text-white shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                                          }`}
                                        >
                                          {isInBag
                                            ? "In Bag"
                                            : isLocked
                                              ? "Locked"
                                              : "Add"}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            {/* Horizontal Scroll Fade Indicator */}
                            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[#F0EEFF] to-transparent pointer-events-none rounded-r-xl" />
                          </div>

                          {/* Background Accent */}
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/30 rounded-full blur-2xl" />
                        </div>
                      )}

                  </div>

                  {/* Savings Banner */}
                  {totalMRPDiscount > 0 && (
                    <div className="mb-6 bg-emerald-50/40 border border-emerald-100/50 rounded-[22px] p-3.5 flex items-center gap-3.5 group/saving overflow-hidden relative backdrop-blur-sm">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200/50 relative z-10">
                        <BadgePercent size={22} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-[10px] font-black text-stone-900 tracking-tight leading-tight">
                          YOU'RE SAVING{" "}
                          <span className="text-emerald-600 underline decoration-emerald-500/30 underline-offset-4 decoration-2">
                            {formatINR(totalMRPDiscount)}
                          </span>{" "}
                          ON THIS ORDER
                        </p>
                      </div>
                      {/* Decorative glass elements */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-full translate-x-8 -translate-y-8 blur-md" />
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-100/30 rounded-full blur-xl" />
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={!canCheckout}
                    className="w-full py-4 bg-stone-900 text-white rounded-[20px] font-black text-[15px] hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-200/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>

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
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-wider">
              Total
            </p>
            <p className="text-xl font-black text-stone-900">
              {formatINR(total)}
            </p>
            <p className="text-[10px] text-stone-500 font-semibold">
              {selectedItems.length} selected
            </p>
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

      {/* Pincode Modal */}
      {isPincodeModalOpen && (
        <PincodeModal
          onClose={() => setIsPincodeModalOpen(false)}
          onUpdate={handleUpdateLocation}
          currentPincode={pincode}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Coupons Drawer */}
      <CouponsDrawer
        isOpen={isCouponsDrawerOpen}
        onClose={() => setIsCouponsDrawerOpen(false)}
        onApply={(code) => handleApplyPromo(code)}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        handleApplyManual={() => handleApplyPromo()}
        isApplying={isApplyingPromo}
        error={promoError}
        subtotal={effectiveSubtotal}
        coupons={availableCoupons}
      />
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function CartItem({
  item,
  selected,
  onToggle,
  onUpdateQty,
  onRemove,
  onWishlist,
  isPreOrder,
  cardClassName = "",
  onItemClick,
}) {
  const isOutOfStock =
    (typeof item.stockLeft === "number" && item.stockLeft <= 0) ||
    item.inStock === false;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group relative p-4 rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 border border-stone-100 ${cardClassName}`}
    >
      {/* checkbox */}
      <button
        onClick={onToggle}
        className={`absolute top-4 left-4 w-5 h-5 rounded-[8px] border-2 flex items-center justify-center transition-all z-10 ${
          selected
            ? "bg-stone-900 border-stone-900"
            : "bg-white border-stone-200 group-hover:border-stone-400"
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
              src={
                resolveImage(item.imageUrls?.[0]) ||
                resolveImage(item.image) ||
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80"
              }
              alt={item.name}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-opacity ${isOutOfStock ? "opacity-50" : ""}`}
            />
          ) : (
            <div className="text-stone-300 text-[10px] font-bold text-center px-1 uppercase tracking-tighter">
              No Image
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-500/10 backdrop-blur-[2px]">
              <span className="text-[9px] font-black text-white bg-purple-600 px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Pre-Order
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
              <p className="text-xs text-stone-500 font-semibold truncate">
                {item.tag || "Standard Size"}
              </p>
            </div>

            <div className="text-right flex flex-col items-end shrink-0">
              <p className="text-[17px] font-black text-[#151515] group-hover:text-pink-600 transition-colors tracking-tight">
                {formatINR((item.price || 0) * (item.qty || 1))}
              </p>
              {(item.mrp || 0) > (item.price || 0) && (
                <p className="text-[12px] font-bold text-stone-400 line-through decoration-stone-300">
                  {formatINR((item.mrp || 0) * (item.qty || 1))}
                </p>
              )}
            </div>
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
              <span className="w-8 text-center text-sm font-black">
                {item.qty || 1}
              </span>
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
                <Heart size={16} />{" "}
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={onRemove}
                className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-black"
                title="Remove"
              >
                <Trash2 size={16} />{" "}
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight, color, action }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-stone-500 font-semibold">{label}</span>
        {action && (
          <button className="text-[10px] font-black text-pink-500 hover:text-pink-600 underline underline-offset-2 uppercase tracking-tighter transition-colors">
            {action}
          </button>
        )}
      </div>
      <span
        className={`font-black ${color ? color : highlight ? "text-emerald-600" : "text-stone-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustItem({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function PincodeModal({ onClose, onUpdate, currentPincode }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const [val, setVal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (val.length !== 6) {
      setError("Please enter a valid 6-digit Pincode.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") {
        const city = data[0].PostOffice[0].District;
        onUpdate(val, city);
      } else {
        setError("Pincode not found. Try another one.");
      }
    } catch (err) {
      setError("Failed to fetch location. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetection = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setTimeout(() => {
            onUpdate("110001", "New Delhi");
            setLoading(false);
          }, 800);
        },
        () => {
          setLoading(false);
          setError("Location access denied.");
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-modal-pop shadow-stone-900/10">
        <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
          <Truck size={24} />
        </div>

        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-2">
          Change delivery
        </h2>
        <p className="text-[11px] text-stone-500 font-bold uppercase tracking-widest mb-8">
          Enter your 6-digit Pincode to update shipping estimate.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              autoFocus
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
              className="w-full h-[60px] bg-stone-50 border border-stone-200 rounded-[18px] px-6 text-xl font-black placeholder:text-stone-300 focus:outline-none focus:border-[#d1408e] transition-all"
            />
            {loading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || val.length !== 6}
            className="w-full h-[60px] bg-stone-900 text-white rounded-[18px] font-black uppercase text-xs tracking-widest hover:bg-pink-600 disabled:opacity-50 transition-all shadow-xl shadow-stone-200"
          >
            Update Location
          </button>
        </form>

        <div className="relative my-8 h-px bg-stone-100 flex items-center justify-center">
          <span className="bg-white px-4 text-[9px] font-black text-stone-300 uppercase tracking-[0.2em]">
            or
          </span>
        </div>

        <button
          onClick={handleDetection}
          disabled={loading}
          className="w-full h-[52px] border-2 border-stone-100 text-stone-600 rounded-[18px] font-black uppercase text-[10px] tracking-widest hover:border-stone-900 hover:text-stone-900 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={14} className="text-pink-500" /> Auto-Detect My
          Pincode
        </button>
      </div>

      <DeliveryModal 
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        user={user}
        currentPincode={pincode}
        onSelect={handleUpdateLocation}
      />
    </div>
  );
}

function RecCard({ product, onAdd }) {
  return (
    <div className="min-w-[160px] md:min-w-[200px] snap-start group pb-4">
      <div className="aspect-4/5 rounded-[24px] bg-stone-100 overflow-hidden relative mb-4">
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
      <h4 className="font-black text-sm text-stone-900 truncate mb-0.5">
        {product.name}
      </h4>
      <p className="text-[11px] text-stone-500 font-semibold mb-1 truncate">
        {product.tag}
      </p>
      <p className="text-sm font-black text-stone-900">
        {formatINR(product.price)}
      </p>
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
          Your bag is{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-purple-600">
            feeling light
          </span>
        </h2>
        <p className="text-stone-500 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed font-medium">
          It looks like you haven't added anything yet. Let's find something
          special just for you.
        </p>

        <div className="flex justify-center mb-24">
          <Link
            to="/shop"
            className="px-10 py-4 bg-stone-900 text-white rounded-[20px] font-black text-[15px] hover:bg-pink-600 hover:shadow-[0_15px_30px_rgba(219,39,119,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95 group flex items-center justify-center gap-2"
          >
            Shop All Products
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Recommendations Section - Outside restricted max-w */}
      <div className="w-full max-w-7xl mx-auto mt-6">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-stone-900">
              You Might Also Like
            </h3>
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-1">
              Special picks curated just for you
            </p>
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
            <RecCard
              key={product.id}
              product={product}
              onAdd={() => onAdd(product)}
            />
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
                @keyframes modal-pop {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-modal-pop {
                    animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
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

function DeliveryModal({ isOpen, onClose, user, currentPincode, onSelect }) {
  const [inputPincode, setInputPincode] = useState(currentPincode || "");
  const [inputCity, setInputCity] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setInputPincode(currentPincode || "");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, currentPincode]);

  if (!isOpen) return null;

  const handleApplyManual = () => {
    if (inputPincode.trim().length >= 6) {
      onSelect(inputPincode, inputCity || "INDIA");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      <div className="absolute bottom-0 sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 mx-auto w-full max-w-lg bg-[#fffcfc] rounded-t-[40px] sm:rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up sm:animate-modal-pop h-[70dvh] flex flex-col">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-inner shrink-0">
               <Truck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight leading-none mb-1 uppercase">Delivery Location</h2>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Select address or enter pincode</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-black transition-all border-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white shrink-0">
          {user?.addresses?.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Saved Addresses</label>
              <div className="flex flex-col gap-3">
                {user.addresses.map((addr) => (
                  <button 
                    key={addr.id}
                    onClick={() => onSelect(addr.postalCode, addr.city.toUpperCase())}
                    className="flex flex-col items-start gap-1 p-3 rounded-2xl border-2 border-stone-100 hover:border-pink-200 transition-all text-left group bg-white"
                  >
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-stone-900 group-hover:text-pink-600">{addr.label || addr.city}</span>
                       <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{addr.postalCode}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500 line-clamp-2 leading-tight">
                       {addr.line1}, {addr.line2 ? addr.line2 + ', ' : ''}{addr.city}, {addr.state}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
            <span className="relative bg-[#fffcfc] px-4 text-[9px] font-black text-stone-300 uppercase tracking-[0.25em] z-10">OR ENTER MANUALLY</span>
          </div>

          <div className="space-y-3 pb-6">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Pincode</label>
            <div className="flex gap-2">
              <input
                 type="text"
                 placeholder="6 Digits"
                 value={inputPincode}
                 onChange={(e) => setInputPincode(e.target.value)}
                 maxLength={6}
                 className="flex-1 bg-stone-50 border-2 border-stone-100 placeholder:text-stone-300 text-stone-900 text-sm font-black uppercase tracking-widest rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-200 focus:bg-white transition-all shadow-inner"
              />
              <button 
                onClick={handleApplyManual}
                disabled={inputPincode.length < 6}
                className="bg-[#151515] text-white rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest hover:bg-[#ff4fa3] disabled:opacity-30 transition-all shadow-lg active:scale-95 border-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
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

function CouponsDrawer({
  isOpen,
  onClose,
  onApply,
  promoCode,
  setPromoCode,
  handleApplyManual,
  isApplying,
  error,
  subtotal,
  coupons = [],
}) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute bottom-0 sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 mx-auto w-full max-w-lg bg-[#fffcfc] rounded-t-[40px] sm:rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up sm:animate-modal-pop h-[90dvh] flex flex-col">
        {/* Header - Fixed Top */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-pink-50 to-pink-100/50 flex items-center justify-center text-[#ff4fa3] shadow-inner shrink-0">
              <Ticket size={20} strokeWidth={2.5} className="drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight leading-none mb-1 italic uppercase">
                Offers & Coupons
              </h2>
              <p className="text-[8px] text-stone-400 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles size={8} className="text-amber-400" /> Apply and save
                big
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-black transition-all duration-300 transform hover:rotate-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area - Expanded Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white touch-pan-y min-h-0">
          {/* Manual Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 opacity-70">
              Have a special code?
            </label>
            <div className="flex gap-2 bg-stone-50/50 p-1 rounded-[18px] border-2 border-stone-100 focus-within:border-pink-200 focus-within:bg-white transition-all duration-500 shadow-inner group text-sm">
              <input
                type="text"
                placeholder="ENTER CODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent border-0 px-4 py-1.5 text-sm font-black text-stone-900 placeholder:text-stone-300 focus:ring-0 focus:outline-none uppercase tracking-wider"
              />
              <button
                onClick={handleApplyManual}
                disabled={!promoCode || isApplying}
                className="bg-[#151515] text-white rounded-[14px] px-5 text-[9px] font-black uppercase tracking-widest hover:bg-[#ff4fa3] disabled:opacity-30 transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
              >
                {isApplying ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-4 bg-red-50 py-1 px-3 rounded-lg inline-block"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100" />
            </div>
            <span className="relative bg-[#fffcfc] px-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.25em]">
              Available Coupons
            </span>
          </div>

          {/* Coupons List */}
          {coupons.length > 0 ? (
            coupons.map((coupon) => {
              const minSpend = Number(coupon.minPurchase || 0);
              const isEligible = subtotal >= minSpend;
              const remaining = minSpend - subtotal;

              // Dynamic Title Generation
              const title =
                coupon.title ||
                (coupon.discountType === "PERCENTAGE"
                  ? `Flat ${coupon.discountValue}% Off`
                  : `₹${coupon.discountValue} Instant Off`);

              const description =
                coupon.description ||
                (minSpend > 0
                  ? `Applicable on orders above ${formatINR(minSpend)}.`
                  : "No minimum purchase required.");

              return (
                <div
                  key={coupon.code}
                  className={`group relative bg-white border-2 rounded-[24px] overflow-hidden transition-all duration-500 transform hover:scale-[1.01] ${
                    isEligible
                      ? "border-stone-100 hover:border-pink-200 shadow-sm hover:shadow-[0_15px_40px_rgba(255,79,163,0.06)]"
                      : "border-stone-50 opacity-70 grayscale-[0.5]"
                  }`}
                >
                  <div className="absolute top-1/2 -left-2.5 w-5 h-5 bg-[#fffcfc] border-2 border-stone-100 rounded-full -translate-y-1/2 group-hover:border-pink-200 transition-colors" />
                  <div className="absolute top-1/2 -right-2.5 w-5 h-5 bg-[#fffcfc] border-2 border-stone-100 rounded-full -translate-y-1/2 group-hover:border-pink-200 transition-colors" />

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-pink-50 text-[#ff4fa3] text-[9px] font-black px-2.5 py-1 rounded-lg border border-pink-100/50 shadow-sm tracking-widest uppercase">
                          {coupon.code}
                        </div>
                        {!isEligible && (
                          <span className="flex items-center gap-1.5 text-[8px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-tight">
                            <Lock size={8} /> Lock
                          </span>
                        )}
                      </div>

                      <h4 className="text-[14px] font-black text-stone-900 mb-0.5 leading-tight">
                        {title}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-semibold leading-relaxed mb-2 tracking-tight">
                        {description}
                      </p>

                      {remaining > 0 ? (
                        <p className="text-[8px] font-black text-[#ff4fa3] uppercase tracking-widest flex items-center gap-1.5">
                          Add {formatINR(remaining)} more{" "}
                          <ChevronDown size={9} className="-rotate-90" />
                        </p>
                      ) : (
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Check size={10} strokeWidth={3} /> Unlocked
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center border-l-2 border-dashed border-stone-100 pl-4 group-hover:border-pink-100 transition-colors min-w-[80px]">
                      <button
                        onClick={() => onApply(coupon.code)}
                        disabled={!isEligible}
                        className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 shadow-sm transform active:scale-90 ${
                          isEligible
                            ? "bg-[#ff4fa3] text-white hover:bg-pink-600"
                            : "bg-stone-50 text-stone-300 cursor-not-allowed"
                        }`}
                      >
                        {isEligible ? "Apply" : "Locked"}
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-br from-pink-50/0 via-pink-50/0 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-stone-400 font-black uppercase text-[10px] tracking-widest">
              No active offers available right now
            </div>
          )}
        </div>

        {/* Footer - Fixed Bottom */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/30 text-center shrink-0">
          <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-[0.2em] mb-1 leading-none flex items-center justify-center gap-1.5">
            <Clock size={10} /> Valid for a limited time
          </p>
          <p className="text-[8px] text-stone-300 font-bold tracking-tight uppercase">
            T&C Apply • Max savings ₹502
          </p>
        </div>
      </div>
    </div>
  );
}
