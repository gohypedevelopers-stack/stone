import React, { useState, useEffect } from "react";
import {
    Star, Heart, Minus, Plus, ShoppingBag, ShoppingCart, ShieldCheck,
    Truck, CornerUpLeft, CreditCard, ChevronDown, ChevronUp, Share2, ArrowRight,
    Gift, Tag, Sparkles, Clock, CheckCircle, Banknote, MapPin, X, AlertCircle, Store, Copy, Play, ChevronLeft, ChevronRight
} from "lucide-react";
import { getAllProducts } from "./data/products";
import { useProducts } from "./context/ProductContext";
import { useAuth } from "./context/AuthContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_DATA_GENERATED } from "./productData.js";
import { PREORDER_PRODUCTS } from "./data/products";
// --- Redesign Constants ---
const BURGUNDY = "#5E2B3C";
const LIGHT_BURGUNDY = "#F8EFF2";

// --- Mock Data for PDP Specifics ---
const MOCK_PDP_DATA = {
    brand: "LUMIÈRE SEOUL",
    inStock: true,
    shades: [
        { name: "Fair Porcelain", color: "#F7E7CE" },
        { name: "Light Beige", color: "#EAC096" },
        { name: "Medium Sand", color: "#D1A374" },
        { name: "Warm Honey", color: "#C68E63" }
    ],
    images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80", // Main
        "https://images.unsplash.com/photo-1556228720-1987599988d3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Experience the ultimate glass skin finish with our Hydra Barrier Serum. Infused with 5% Niacinamide and Centella Asiatica, it calms redness while delivering deep, lasting hydration.",
    benefits: [
        { icon: "💧", text: "72h Hydration" },
        { icon: "✨", text: "Glass Skin Glow" },
        { icon: "🌿", text: "Vegan Formula" },
        { icon: "🛡️", text: "Barrier Repair" }
    ],
    ingredients: "Water, Glycerin, Niacinamide (5%), Centella Asiatica Extract, Sodium Hyaluronate, Panthenol, Allantoin, Betaine, Caprylyl Glycol...",
    howToUse: [
        "Cleanse your face thoroughly.",
        "Apply 2-3 drops directly onto skin.",
        "Gently pat until fully absorbed."
    ],
    faq: [
        { q: "Is this suitable for sensitive skin?", a: "Yes! Our formula is hypoallergenic and free from fragrance and alcohol." },
        { q: "Can I use this with Vitamin C?", a: "Absolutely. Niacinamide pairs excellently with Vitamin C for brightening." },
        { q: "Is it non-comedogenic?", a: "Yes, it won't clog pores." }
    ]
};

// --- Helper Components ---

const AccordionItem = ({ title, children, isOpen, onClick }) => (
    <div className="border-t border-[#d1d1d1]/30 last:border-b last:border-[#d1d1d1]/30">
        <button
            onClick={onClick}
            className="w-full py-6 flex items-center justify-between text-left group transition-all"
        >
            <span className="text-[12px] font-medium text-gray-900 uppercase tracking-[0.2em] group-hover:text-[#ff4fa3] transition-colors">
                {title}
            </span>
            <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0 text-gray-300"}`}>
                <ChevronDown size={14} strokeWidth={2} />
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="pb-8 text-gray-600 leading-relaxed text-[14px]">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const ReviewCard = ({ name, rating, comment, date }) => (
    <div className="bg-white p-6 rounded-[2px] border border-gray-100 shadow-sm min-w-[300px] md:min-w-[350px]">
        <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
            ))}
        </div>
        <h4 className="font-bold text-sm text-gray-900 mb-1">{name}</h4>
        <p className="text-xs text-gray-400 mb-3">{date}</p>
        <p className="text-gray-600 text-sm leading-relaxed">"{comment}"</p>
    </div>
);

const ProductCardMini = ({ product, onAddToCart, onClick }) => (
    <div 
        onClick={onClick}
        className="group relative flex flex-col w-[160px] md:w-[220px] bg-white rounded-[2px] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer h-full"
    >
        {/* Fixed Aspect Image */}
        <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden flex-shrink-0">
            <img 
                src={product.image || "https://placehold.co/200"} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            {product.discount && (
                <div className="absolute top-2 left-2 bg-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-[1px] tracking-tighter">
                    -{product.discount}%
                </div>
            )}
        </div>

        <div className="p-4 flex flex-col flex-1">
            {/* Category - Subtle */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{product.category || "Treatment"}</p>
            
            {/* Title - Fixed height container for 2 lines */}
            <div className="h-10 mb-3 overflow-hidden">
                <h4 className="font-bold text-[13px] text-gray-900 leading-tight line-clamp-2 group-hover:text-pink-600 transition-colors uppercase tracking-tight">
                    {product.name}
                </h4>
            </div>

            {/* Price & Action - Bottom aligned */}
            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
                    <span className="font-black text-[15px] text-[#1a1a1a]">₹{product.price}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart && onAddToCart(product);
                    }}
                    className="w-9 h-9 rounded-[2px] bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-900 hover:text-white hover:border-black transition-all shadow-sm active:scale-90"
                >
                    <Plus size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    </div>
);

// --- Rewards Components (Redesigned with 3-Section Layout) ---

const SectionHeader = ({ title, timer }) => (
    <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h2>
        {timer && (
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ends In</span>
                <div className="bg-[#E11D48] text-white font-black text-xs px-3 py-1.5 rounded-[2px] tracking-widest">
                    {timer}
                </div>
            </div>
        )}
    </div>
);

const OfferCouponCard = ({ title, sub, code }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success("Coupon code copied!");
    };

    return (
        <div className="relative group flex-1">
            {/* Main Ticket Body */}
            <div className="relative bg-white rounded-[4px] border-2 border-dashed border-[#ff4fa3]/20 overflow-hidden transition-all hover:border-[#ff4fa3]/40 hover:shadow-xl hover:shadow-[#ff4fa3]/5 h-full">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-[#fff0f6] to-white pointer-events-none" />
                
                {/* Physical Ticket Scallops */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-[#ff4fa3]/10 z-20" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-[#ff4fa3]/10 z-20" />
                
                <div className="relative p-5 flex flex-col gap-3 z-10">
                    <div className="space-y-1">
                        <p className="text-[9px] font-[1000] text-[#ff4fa3] tracking-[0.2em] uppercase opacity-80">Exclusive Offer</p>
                        <p className="text-[11px] font-[1000] text-gray-900 leading-tight tracking-tight uppercase">
                            {title}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 border-2 border-[#ff4fa3]/10 rounded-[4px] h-10 px-3 bg-white shadow-sm group-hover:border-[#ff4fa3]/30 transition-all">
                        <span className="text-[11px] font-black text-[#ff4fa3] tracking-[0.25em] font-mono lowercase">
                            {code}
                        </span>
                        <button onClick={handleCopy} className="text-[#ff4fa3] hover:scale-125 transition-transform p-1">
                            <Copy size={14} strokeWidth={3} />
                        </button>
                    </div>
                    
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                       {sub}
                    </p>
                </div>
            </div>
        </div>
    );
};

const DeliveryBanner = ({ time = "7-10 Business Days" }) => (
    <div className="flex items-center gap-5 bg-white border border-gray-100 rounded-[4px] p-5 mb-8 shadow-sm group hover:border-[#ff4fa3]/20 transition-all">
        <div className="w-12 h-12 bg-[#ff4fa3]/5 text-[#ff4fa3] rounded-full flex items-center justify-center shrink-0 border border-[#ff4fa3]/10 group-hover:scale-110 transition-transform">
            <Truck size={22} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5">
            <p className="text-[10px] font-[1000] text-[#ff4fa3] uppercase tracking-[0.2em] opacity-60">Shipping Information</p>
            <p className="text-[14px] font-bold text-gray-900 leading-tight">Arrives in <span className="text-[#ff4fa3]">{time}</span></p>
        </div>
    </div>
);

const OfferGiftCard = ({ image, title, sub, status = "FREE", isLocked = true }) => (
    <div className="relative bg-white rounded-[2px] border border-gray-100/80 p-5 flex gap-5 h-full min-h-[160px] overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent pointer-none" />
        
        <div className="w-28 h-28 rounded-[2px] overflow-hidden bg-gray-50 relative z-10 shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-[2px] border border-emerald-200 shadow-sm">
                {status}
            </div>
        </div>
        
        <div className="flex flex-col flex-1 py-1 relative z-10">
            <div className="mb-auto">
                <h4 className="text-[13px] font-black text-gray-900 leading-tight mb-1">{title}</h4>
                <p className="text-[12px] font-bold text-gray-400 line-clamp-2">{sub}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
               {isLocked && <div className="p-1.5 bg-gray-50 rounded-[2px] text-gray-300"><Clock size={14} /></div>}
               <button className="text-pink-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                   View Products <ArrowRight size={10} />
               </button>
            </div>
        </div>
    </div>
);

const OfferSampleCard = ({ title, sub, color = "from-emerald-50 to-white" }) => (
    <div className={`relative bg-gradient-to-br ${color} rounded-[2px] border border-emerald-100/50 p-6 flex flex-col h-full min-h-[160px] overflow-hidden group hover:shadow-xl hover:shadow-emerald-100/20 transition-all`}>
        {/* Decorative Background Icon */}
        <div className="absolute -right-6 -bottom-6 text-emerald-500/10 opacity-[0.08] transform -rotate-12 group-hover:scale-125 transition-transform">
             <Sparkles size={140} strokeWidth={1} />
        </div>

        <div className="mb-auto">
            <h3 className="text-[17px] font-[1000] text-gray-900 mb-1 leading-tight tracking-tight">{title}</h3>
            <p className="text-[13px] font-bold text-gray-500 leading-tight pr-12">{sub}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
             <div className="flex items-center gap-2">
                 <Clock size={12} className="text-orange-500" />
                 <span className="text-[11px] font-[1000] text-orange-500 uppercase tracking-tighter">5h 7m left</span>
             </div>
             <button className="text-pink-600 font-[1000] text-[11px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                 View Products →
             </button>
        </div>
    </div>
);

const LimitedGiftCard = ({ image, brand, name, unclaimed, total }) => {
    const progress = ((total - unclaimed) / total) * 100;
    return (
        <div className="bg-white rounded-[2px] border border-gray-100 p-4 flex gap-6 items-center flex-1">
            <div className="w-32 h-32 rounded-[2px] overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Complimentary</p>
                    <h3 className="font-black text-base text-gray-900 leading-tight">{name}</h3>
                    <p className="text-xs font-medium text-gray-400">{brand}</p>
                </div>
                <div className="space-y-2">
                    <div className="w-full h-1 bg-gray-100 rounded-[2px] overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-[2px]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{Math.round(progress)}% Claimed</p>
                </div>
            </div>
        </div>
    );
};

const TrustFactor = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-[2px] px-5 py-3 shadow-sm flex-1">
        <div className="p-2 bg-pink-50 rounded-[2px] text-pink-600">
            <Icon size={16} />
        </div>
        <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">{text}</span>
    </div>
);

const MegaDealBanner = ({ price, discount, onOpenDetails }) => (
    <div className="bg-[#fff9fc] border border-[#ffebf3] rounded-[4px] p-6 mb-8 transition-all hover:shadow-lg hover:shadow-pink-50/50 group relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute -right-4 -top-4 text-[#ffebf3] opacity-40 transform scale-150 rotate-12 pointer-events-none transition-transform group-hover:scale-[1.6]">
            <Sparkles size={100} strokeWidth={1} />
        </div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-5">
                <div className="bg-gradient-to-r from-pink-600 to-[#E11D48] text-white text-[10px] font-black px-4 py-1.5 rounded-[2px] shadow-sm tracking-widest uppercase transform -skew-x-12 border border-white/10 ring-4 ring-pink-50">
                    MEGA DEAL
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-[13px] font-[900] text-gray-400 uppercase tracking-tight">Get at</span>
                    <span className="text-2xl font-black text-[#1a1a1a] tracking-tight">₹{price}</span>
                </div>
            </div>
            <div className="bg-[#00b852] text-white text-[12px] font-black px-4 py-2 rounded-[2px] shadow-xl shadow-[#00b852]/15 flex items-center gap-1.5 border border-white/5 active:scale-95 transition-transform">
                Extra ₹{discount} Off
            </div>
        </div>
    </div>
);

const GenuineSeal = ({ onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group cursor-pointer outline-none tap-highlight-transparent">
        <div className="relative w-20 h-20 md:w-24 md:h-24">
             {/* Seal Background */}
             <div className="absolute inset-0 bg-sky-100 rounded-[2px] animate-pulse-slow opacity-50 group-hover:opacity-100 transition-opacity" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />
             <div className="absolute inset-2 bg-white rounded-[2px] flex items-center justify-center shadow-inner">
                 <div className="bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rotate-[-25deg] shadow-lg flex items-center gap-1 border-2 border-white">
                    <Sparkles size={8} className="fill-white" /> ORIGINAL
                 </div>
             </div>
        </div>
        <span className="text-pink-600 font-black text-[11px] uppercase tracking-[0.2em] text-center leading-relaxed">Genuine<br/>Product</span>
    </button>
);

const QualitySeal = ({ onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group cursor-pointer outline-none tap-highlight-transparent">
        <div className="relative w-20 h-20 md:w-24 md:h-24">
             {/* Quality Seal Background */}
             <div className="absolute inset-0 bg-sky-200 rounded-[2px]" style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'}} />
             <div className="absolute inset-1 bg-white rounded-[2px] flex items-center justify-center shadow-inner">
                 <div className="text-sky-500 transform scale-150 drop-shadow-sm">
                    <CheckCircle size={32} strokeWidth={3} className="fill-sky-50 shadow-blue-200" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                       <div className="w-1.5 h-3 bg-red-400 rounded-[2px] rotate-[-45deg] origin-top" />
                       <div className="w-1.5 h-3 bg-red-400 rounded-[2px] rotate-[45deg] origin-top" />
                    </div>
                 </div>
             </div>
        </div>
        <span className="text-pink-600 font-black text-[11px] uppercase tracking-[0.2em] text-center leading-relaxed">Quality<br/>Checked</span>
    </button>
);

const QualityProcessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    const steps = [
        {
            id: 1,
            title: "Sample Check",
            desc: "A style sample out of a lot is checked before a brand is onboarded on our platform.",
            icon: "🛍️",
            color: "bg-rose-50"
        },
        {
            id: 2,
            title: "Aspect Check",
            desc: "Aspects such as color stability, texture, and packaging integrity for a sample out of every lot is checked carefully.",
            icon: "📐",
            color: "bg-sky-50"
        },
        {
            id: 3,
            title: "Product Check",
            desc: "Brands are mandated to check the batch number, MRP, formulation stability, and expiry for every product before listing.",
            icon: "✅",
            color: "bg-emerald-50"
        },
        {
            id: 4,
            title: "Safety Check",
            desc: "All global safety and handling precautions are strictly followed to get the product safely to you.",
            icon: "🌿",
            color: "bg-pink-50"
        }
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-black text-[#151515] uppercase tracking-tight">Quality Check Process</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-[2px] transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="p-8 pt-6 space-y-10 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[51px] top-10 bottom-24 w-px border-l-2 border-dashed border-gray-100" />
                    
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-6 relative z-10">
                            {/* Step Number Dot */}
                            <div className="w-8 h-8 rounded-[2px] bg-[#151515] text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg">
                                {step.id}
                            </div>
                            
                            {/* Illustration Card */}
                            <div className={`w-28 h-28 rounded-[2px] ${step.color} flex items-center justify-center text-4xl shadow-inner border border-white/50 shrink-0`}>
                                {step.icon}
                            </div>
                            
                            {/* Text Content */}
                            <div className="space-y-1.5 pt-1">
                                <h3 className="font-black text-[15px] text-[#151515] uppercase tracking-tight">{step.title}</h3>
                                <p className="text-[13px] font-medium text-gray-500 leading-relaxed pr-4">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={onClose}
                        className="w-full bg-[#151515] text-white py-5 rounded-[2px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 mt-4"
                    >
                        I Trust the Process
                    </button>
                </div>
            </div>
        </div>
    );
};

const DealDetailsModal = ({ isOpen, onClose, price, discount }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[2px] overflow-hidden shadow-2xl transform transition-all animate-in fade-in slide-in-from-bottom-10 duration-300">
                {/* Header Section */}
                <div className="p-6 pb-0 flex flex-col items-center">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-[2px] transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                    
                    <div className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded shadow-sm mb-4">MEGA DEAL</div>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-[900] text-gray-900">Get at ₹{price}</span>
                        <div className="bg-[#00b852] text-white text-[10px] font-black px-3 py-1 rounded-[2px]">
                            Extra ₹{discount} Off
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Combine coupons & offers for max discount</p>
                </div>

                {/* Offer List */}
                <div className="px-6 pb-10 space-y-4">
                    {/* Coupon Card */}
                    <div className="p-5 rounded-[2px] border border-gray-100 bg-gray-50/30 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="text-sm font-[900] text-gray-900 mb-1">Coupon <span className="text-pink-600">MISSEDYOU</span></h5>
                                <p className="text-[11px] font-bold text-gray-400">On orders above ₹699</p>
                            </div>
                            <span className="text-sm font-[900] text-[#00b852]">₹{Math.round(discount * 0.4)} off</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#00b852]">
                            <CheckCircle size={14} fill="currentColor" className="text-white bg-[#00b852] rounded-[2px] border border-[#00b852]" />
                            Coupon Unlocked! Apply Coupon in bag
                        </div>
                        <button className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">Details <ChevronDown size={12} /></button>
                    </div>

                    {/* Bank Card */}
                    <div className="p-5 rounded-[2px] border border-gray-100 bg-gray-50/30 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-[2px] bg-blue-100 flex items-center justify-center shrink-0">
                                    <Banknote size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-[900] text-gray-900 mb-1">Flipkart SBI CC</h5>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Min. spend ₹100 • T&C</p>
                                </div>
                            </div>
                            <span className="text-sm font-[900] text-[#00b852]">₹{Math.round(discount * 0.6)} off</span>
                        </div>
                        <button className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">Details <ChevronDown size={12} /></button>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-[#151515] text-white py-4 rounded-[2px] font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeliverySection = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("delivery");

    // Dynamic Delivery Date Calculation
    const getDeliveryDate = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 4); 
        
        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const userAddress = user?.addresses?.[0] 
        ? `${user.addresses[0].postalCode} (${user.addresses[0].city})`
        : "201306 (NOIDA)";

    const TABS = [
        { id: "delivery", label: "Standard Delivery", icon: Truck },
        { id: "store", label: "Buy in Store", icon: Store }
    ];

    return (
        <div className="bg-white rounded-[2px] border border-stone-100 shadow-[0_15px_35px_rgba(0,0,0,0.03)] overflow-hidden mb-8 group/container max-w-2xl">
            {/* Standardized Tab Bar */}
            <div className="flex bg-stone-50/50 p-1 gap-1 border-b border-stone-100">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 py-2 px-4 rounded-[2px] flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === tab.id ? "text-white" : "text-stone-400 hover:text-stone-600 hover:bg-stone-100/50"}`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 bg-[#1a1a1a] rounded-[2px]"
                                transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                            />
                        )}
                        <tab.icon size={14} className="relative z-10" />
                        <span className="relative z-10 text-[10px] font-semibold uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content with Animation */}
            <div className="p-4 md:p-6">
                <AnimatePresence mode="wait">
                    {activeTab === "delivery" ? (
                        <motion.div
                            key="delivery"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="relative w-11 h-11 bg-pink-50 border border-pink-100 rounded-full flex items-center justify-center text-pink-600">
                                            <CheckCircle size={20} strokeWidth={2} />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-base font-semibold text-stone-900 tracking-tight leading-none group-hover/container:text-[#1a1a1a] transition-colors">
                                            Delivery by <span className="text-pink-600">{getDeliveryDate()}</span>
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={10} className="text-stone-300" />
                                            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{userAddress}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="h-9 px-4 rounded-[2px] bg-white border border-stone-200 text-stone-900 font-semibold text-[10px] uppercase tracking-widest hover:border-pink-500 hover:text-pink-600 transition-all active:scale-95 group/btn flex items-center gap-2">
                                    Change
                                    <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            <p className="text-[9px] font-semibold text-stone-300 leading-relaxed uppercase tracking-tight flex items-center gap-2">
                                <AlertCircle size={10} className="shrink-0 text-stone-200" />
                                Estimated time based on bag verification.
                            </p>

                            {/* Trust Panel */}
                            <div className="pt-6 border-t border-stone-50 flex items-center gap-8">
                                <div className="flex items-center gap-2.5 group/tag">
                                    <div className="w-8 h-8 bg-white border border-stone-100 rounded-[2px] flex items-center justify-center text-stone-400 group-hover/tag:border-stone-900 group-hover/tag:text-stone-900 transition-all">
                                        <Truck size={14} />
                                    </div>
                                    <div className="space-y-px">
                                        <p className="text-[9px] font-semibold text-stone-900 uppercase tracking-widest leading-none">Free Ship</p>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-tighter leading-none">Above ₹299</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-stone-100" />
                                <div className="flex items-center gap-2.5 group/tag">
                                    <div className="w-8 h-8 bg-white border border-stone-100 rounded-[2px] flex items-center justify-center text-stone-400 group-hover/tag:border-stone-900 group-hover/tag:text-stone-900 transition-all">
                                        <Banknote size={14} />
                                    </div>
                                    <div className="space-y-px">
                                        <p className="text-[9px] font-semibold text-stone-900 uppercase tracking-widest leading-none">COD Active</p>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-tighter leading-none">On delivery</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="store"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center text-stone-900">
                                        <Store size={20} strokeWidth={2} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-base font-semibold text-stone-900 tracking-tight leading-none">
                                            <span className="text-pink-600">02 Stores</span> Found
                                        </h4>
                                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">DLF MALL OF INDIA • 1.2 KM</p>
                                    </div>
                                </div>
                                <button className="h-9 px-4 rounded-[2px] bg-[#1a1a1a] text-white font-semibold text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95">
                                    Select Store
                                </button>
                            </div>

                            <p className="text-[9px] font-semibold text-stone-300 leading-relaxed uppercase tracking-tight flex items-center gap-2">
                                <Clock size={10} className="shrink-0" />
                                Ready for handover within 120 minutes.
                            </p>

                            <div className="pt-6 border-t border-stone-50 flex items-center gap-8">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-white border border-stone-100 rounded-[2px] flex items-center justify-center text-stone-400">
                                        <Clock size={14} />
                                    </div>
                                    <div className="space-y-px">
                                        <p className="text-[9px] font-semibold text-stone-900 uppercase tracking-widest leading-none">2H Pickup</p>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-tighter leading-none">Express service</p>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-stone-100" />
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-white border border-stone-100 rounded-[2px] flex items-center justify-center text-stone-400">
                                        <ShoppingBag size={14} />
                                    </div>
                                    <div className="space-y-px">
                                        <p className="text-[9px] font-semibold text-stone-900 uppercase tracking-widest leading-none">Reserve IT</p>
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-tighter leading-none">Online booking</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};






const GenuineProductModal = ({ isOpen, onClose, brand }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[2px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-black text-[#151515] uppercase tracking-tight">Genuine Product</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-[2px] transition-all">
                        <X size={24} className="text-gray-900" />
                    </button>
                </div>
                
                <div className="p-8 pt-10 flex gap-6 items-center">
                    <div className="shrink-0 p-1 bg-sky-50 rounded-[2px] rotate-[-5deg] shadow-sm scale-110">
                        {/* Static Seal Image/SVG */}
                        <div className="relative w-20 h-20">
                             <div className="absolute inset-0 bg-sky-100 rounded-[2px] opacity-50" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />
                             <div className="absolute inset-2 bg-white rounded-[2px] flex items-center justify-center shadow-inner">
                                 <div className="bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rotate-[-25deg] shadow-lg flex items-center gap-1 border-2 border-white">
                                    <Sparkles size={8} className="fill-white" /> ORIGINAL
                                 </div>
                             </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[17px] font-black leading-tight text-gray-800 tracking-tight">
                            This is a genuine product, sold by an authorized seller of brand <span className="text-pink-600 underline underline-offset-4 decoration-2">{brand}</span>
                        </p>
                    </div>
                </div>

                <div className="p-8 pb-10">
                    <button 
                        onClick={onClose}
                        className="w-full bg-[#151515] text-white py-4 rounded-[2px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        Verified & Confirmed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProductDetail({ addToCart, wishlist = [], toggleWishlist }) {
    const { id } = useParams();
    const { products, apiCoupons } = useProducts();
    const location = useLocation();
    const navigate = useNavigate();
    const decodedId = decodeURIComponent(id);

    // 1. Hook definitions at the top
    const [mainImage, setMainImage] = useState(MOCK_PDP_DATA.images[0]);
    const [selectedShade, setSelectedShade] = useState(MOCK_PDP_DATA.shades[0]);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("description"); // For Desktop Tabs
    const [openAccordions, setOpenAccordions] = useState({ description: true }); // For Mobile Accordions
    const [showDealModal, setShowDealModal] = useState(false);
    const [showQualityModal, setShowQualityModal] = useState(false);
    const [showGenuineModal, setShowGenuineModal] = useState(false);

    // Try to get product
    const stateProduct = location.state?.product;
    const findInStatic = () => {
        if (PREORDER_PRODUCTS) {
            const found = PREORDER_PRODUCTS.find(p => String(p.id) === String(decodedId));
            if (found) return found;
        }
        if (CATEGORY_DATA_GENERATED) {
            for (const cat in CATEGORY_DATA_GENERATED) {
                const catProducts = CATEGORY_DATA_GENERATED[cat];
                if (Array.isArray(catProducts)) {
                    const found = catProducts.find(p => String(p.id) === String(decodedId));
                    if (found) return found;
                }
            }
        }
        return null;
    };

    const product = stateProduct || products.find(p => String(p.id) === String(decodedId)) || findInStatic() || products[0];

    const isWishlisted = product ? wishlist.some(item => item.id === product.id) : false;

    // Calculate dynamic product images (Backend Only)
    const listImages = (product?.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0)
        ? product.imageUrls
        : (product?.image ? [product.image] : ["https://images.unsplash.com/photo-1556228720-1987599988d3?auto=format&fit=crop&w=1200&q=80"]);

    // Extract brand from name if brand is default or missing
    let displayBrand = product?.brand || "OMW Skincare";
    if (!product?.brand || product.brand === "OMW Skincare") {
        if (product?.name?.includes(" – ")) {
            displayBrand = product.name.split(" – ")[0].trim();
        } else if (product?.name?.includes(" - ")) {
            displayBrand = product.name.split(" - ")[0].trim();
        } else if (product?.name) {
            // Take first word as a fallback for brand if it's missing
            displayBrand = product.name.split(" ")[0].trim();
        }
    }

    const fullProduct = {
        ...MOCK_PDP_DATA,
        ...product,
        brand: displayBrand,
        images: listImages,
        ingredients: product?.ingredients || MOCK_PDP_DATA.ingredients,
        whyWeLoveIt: product?.whyWeLoveIt || "Instantly plumps skin by +45% and repairs barrier in 2 weeks.",
        benefits: (product?.benefits && Array.isArray(product.benefits) && product.benefits.length > 0) ? product.benefits : MOCK_PDP_DATA.benefits,
        faq: (product?.faq && Array.isArray(product.faq) && product.faq.length > 0) ? product.faq : MOCK_PDP_DATA.faq,
    };

    useEffect(() => {
        if (fullProduct.images && fullProduct.images.length > 0) {
            setMainImage(fullProduct.images[0]);
        }
        setQty(1);
        if (fullProduct.shades && fullProduct.shades.length > 0) {
            setSelectedShade(fullProduct.shades[0]);
        }
        window.scrollTo(0, 0);
    }, [decodedId, product]);

    if (!product) return <div className="p-20 text-center text-gray-500 font-bold">Product not found.</div>;


    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddToCart = () => {
        // In a real app, pass qty and shade
        // Simulate adding multiple times based on qty
        if (addToCart) {
            for (let i = 0; i < qty; i++) addToCart(product);
        } else {
            console.warn("addToCart function not provided");
        }
    };

    const stockStatus = product.onlineStock !== undefined ? product.onlineStock : (product.inStock ? 12 : 0);
    const soldCount = product.soldCount || 842; // Fallback to 842 if not provided by API

    return (
        <div className="min-h-screen bg-white">
            {/* Top Product Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 lg:items-start">
                    
                    {/* Left: Enhanced Gallery with Repositioned Thumbnails */}
                    <div className="lg:col-span-7 flex flex-col gap-6 lg:sticky lg:top-32 lg:max-h-[calc(100vh-160px)]">
                        {/* Main Interaction Image */}
                        <div className="relative aspect-4/5 bg-[#F9F9F9] rounded-[4px] overflow-hidden group h-full">
                            <motion.img
                                key={mainImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={mainImage}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Mobile Dot Indicator (Keep for quick scan) */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
                                {fullProduct.images.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-1.5 h-1.5 rounded-full ${fullProduct.images[idx] === mainImage ? "bg-[#5E2B3C]" : "bg-white/50"}`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Horizontal Thumbnails (Only if multiple images exist) */}
                        {Array.from(new Set(fullProduct.images)).length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {Array.from(new Set(fullProduct.images)).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 md:w-24 aspect-4/5 shrink-0 rounded-[2px] overflow-hidden border-2 transition-all ${mainImage === img ? "border-[#5E2B3C]" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Refined Purchase Panel */}
                    <div className="lg:col-span-5 flex flex-col pt-2">
                        {/* Brand & Stock */}
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="text-[#ff4fa3] font-black text-[11px] uppercase tracking-[0.35em]">{fullProduct.brand || "Lumière"}</h2>
                            
                            <h1 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] leading-[1.1] tracking-tight">
                                {fullProduct.name}
                            </h1>
                            
                            <p className="text-gray-400 font-medium text-xs mt-1">Authentic {fullProduct.category || "Premium"} Collection</p>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-wider mb-8">
                            {stockStatus > 0 ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                    <div className="w-1 h-1 bg-emerald-600 rounded-full animate-pulse" />
                                    {stockStatus} in stock
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 uppercase font-black">
                                    <X size={12} strokeWidth={3} />
                                    Out of stock
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                                <Sparkles size={12} className="fill-teal-600/10" />
                                Already {soldCount} Sold
                            </div>
                        </div>

                        {/* Pricing & Rating */}
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-3xl font-[1000] text-[#1a1a1a]">Rs. {fullProduct.price}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400 line-through">Rs. {Math.round(fullProduct.price * 1.5)}</span>
                                    <span className="text-xs font-black text-emerald-600">30% OFF</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 underline underline-offset-4 cursor-pointer hover:text-[#5E2B3C] transition-colors">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    No reviews yet
                                </div>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-3 mb-10">
                            {/* Qty Stepper */}
                            <div className="flex items-center h-14 bg-white rounded-[4px] px-3 border border-gray-100 shadow-sm">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-gray-400 hover:text-[#ff4fa3] transition-colors"><Minus size={16} strokeWidth={3} /></button>
                                <span className="w-12 text-center font-black text-[#1a1a1a] text-sm tabular-nums">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="p-2 text-gray-400 hover:text-[#ff4fa3] transition-colors"><Plus size={16} strokeWidth={3} /></button>
                            </div>
                            
                            {/* Add to Cart */}
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 h-14 bg-linear-to-r from-[#ff4fa3] to-[#ff1a8c] text-white font-black text-xs uppercase tracking-[0.25em] rounded-[4px] shadow-2xl shadow-[#ff4fa3]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                                <ShoppingCart size={18} fill="white" className="relative z-10" />
                                <span className="relative z-10">Add to Cart</span>
                            </button>
                            
                            {/* Wishlist */}
                            <button 
                                onClick={() => toggleWishlist(fullProduct)}
                                className={`w-14 h-14 rounded-[4px] flex items-center justify-center border transition-all ${isWishlisted ? "bg-red-50 border-red-100 text-red-500 shadow-inner" : "border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500"}`}
                            >
                                <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                            </button>
                        </div>

                        {/* Side-by-Side Coupons - Now Dynamic */}
                        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
                            {apiCoupons && apiCoupons.length > 0 ? (
                                apiCoupons.map((coupon) => (
                                    <OfferCouponCard 
                                        key={coupon.id}
                                        title={`${coupon.discountType === "PERCENTAGE" ? "GET " + coupon.discountValue + "% OFF" : "FLAT Rs. " + coupon.discountValue + " OFF"}`} 
                                        sub={coupon.minPurchase > 0 ? `On orders above Rs. ${coupon.minPurchase}` : "Use this coupon at checkout"} 
                                        code={coupon.code} 
                                    />
                                ))
                            ) : (
                                <>
                                    <OfferCouponCard title="ENJOY 10% OFF ON YOUR FIRST ORDER" sub="Use this coupon at checkout" code="DELANFAMILY" />
                                    <OfferCouponCard title="FLAT 10% OFF ON DENIM EDIT" sub="Use this coupon at checkout" code="DENIM10" />
                                </>
                            )}
                        </div>

                        {/* Delivery Banner */}
                        <DeliveryBanner />

                        {/* Minimalist Accordion List - Moved to Right Column */}
                        <div className="mt-10 space-y-0 border-t border-[#d1d1d1]/30">
                            <AccordionItem 
                                title="Description" 
                                isOpen={openAccordions.description} 
                                onClick={() => toggleAccordion("description")}
                            >
                                {fullProduct.description}
                            </AccordionItem>

                            <AccordionItem 
                                title="How to Use" 
                                isOpen={openAccordions.howToUse} 
                                onClick={() => toggleAccordion("howToUse")}
                            >
                                <ul className="space-y-4">
                                    {(Array.isArray(fullProduct.howToUse) ? fullProduct.howToUse : [fullProduct.howToUse]).map((step, i) => (
                                        <li key={i} className="flex gap-4">
                                            <span className="font-bold text-[#ff4fa3] min-w-[20px]">0{i+1}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionItem>

                            <AccordionItem 
                                title="Benefits" 
                                isOpen={openAccordions.benefits} 
                                onClick={() => toggleAccordion("benefits")}
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    {(Array.isArray(fullProduct.benefits) ? fullProduct.benefits : []).map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#ff4fa3]/5 flex items-center justify-center text-[#ff4fa3]">
                                                {benefit.icon || "✓"}
                                            </div>
                                            <span className="font-medium text-gray-700">{benefit.text || benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>

                            <AccordionItem 
                                title="Ingredients" 
                                isOpen={openAccordions.ingredients} 
                                onClick={() => toggleAccordion("ingredients")}
                            >
                                <p className="text-gray-500 italic leading-relaxed">
                                    {fullProduct.ingredients}
                                </p>
                            </AccordionItem>

                            <AccordionItem 
                                title="Info" 
                                isOpen={openAccordions.info} 
                                onClick={() => toggleAccordion("info")}
                            >
                                <div className="space-y-6">
                                    {(Array.isArray(fullProduct.faq) ? fullProduct.faq : []).map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Q: {item.q}</h4>
                                            <p className="text-gray-500">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>
                        </div>
                    </div>
                </div>
            </div>


            {/* Recommendation Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 bg-white">
                <SectionHeader title="You Might Also Love" />
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                    {products.slice(0, 6).map(p => (
                        <ProductCardMini 
                            key={p.id} 
                            product={p} 
                            onAddToCart={addToCart} 
                            onClick={() => navigate(`/product/${p.id}`)}
                        />
                    ))}
                </div>
            </div>

            {/* Modals */}
            <QualityProcessModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
            <GenuineProductModal isOpen={showGenuineModal} onClose={() => setShowGenuineModal(false)} brand={fullProduct.brand} />
        </div>
    );
}
