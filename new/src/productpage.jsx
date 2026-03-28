import React, { useState, useEffect } from "react";
import {
    Star, Heart, Minus, Plus, ShoppingBag, ShieldCheck,
    Truck, CornerUpLeft, CreditCard, ChevronDown, ChevronUp, Share2, ArrowRight,
    Gift, Tag, Sparkles, Clock, CheckCircle, Banknote, MapPin, X
} from "lucide-react";
import { getAllProducts } from "./data/products";
import { useProducts } from "./context/ProductContext";
import { useParams, useLocation } from "react-router-dom";
import { CATEGORY_DATA_GENERATED } from "./productData.js";
import { PREORDER_PRODUCTS } from "./data/products";

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
    <div className="border-b border-gray-100 last:border-none">
        <button
            onClick={onClick}
            className="w-full py-5 flex items-center justify-between text-left group"
        >
            <span className="font-bold text-gray-900 text-lg group-hover:text-pink-500 transition-colors">{title}</span>
            {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
            <div className="text-gray-600 leading-relaxed text-sm md:text-base">
                {children}
            </div>
        </div>
    </div>
);

const ReviewCard = ({ name, rating, comment, date }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-[300px] md:min-w-[350px]">
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

const ProductCardMini = ({ product, onAddToCart }) => (
    <div className="group relative min-w-[160px] md:min-w-[200px] bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
            <img src={product.image || "https://placehold.co/200"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="p-3">
            <h4 className="font-bold text-sm truncate">{product.name}</h4>
            <p className="text-xs text-gray-500 mb-2">{product.category}</p>
            <div className="flex items-center justify-between">
                <span className="font-bold text-sm">₹{product.price}</span>
                <button
                    onClick={() => onAddToCart && onAddToCart(product)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >+
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
                <div className="bg-[#E11D48] text-white font-black text-xs px-3 py-1.5 rounded-md tracking-widest">
                    {timer}
                </div>
            </div>
        )}
    </div>
);

const OfferCouponCard = ({ title, sub, code, color = "from-pink-50 to-white" }) => (
    <div className={`relative bg-gradient-to-br ${color} rounded-[24px] border border-pink-100/50 p-6 flex flex-col justify-between h-full min-h-[160px] overflow-hidden group transition-all hover:shadow-xl hover:shadow-pink-100/20`}>
        {/* Decorative Background Icon */}
        <div className="absolute -right-4 -top-4 text-pink-500/5 opacity-[0.08] transform rotate-12 transition-transform group-hover:scale-125">
             <Tag size={120} strokeWidth={1} />
        </div>
        
        <div>
            <h3 className="text-[17px] font-[1000] text-emerald-600 mb-1 leading-tight tracking-tight">{title}</h3>
            <p className="text-[13px] font-bold text-gray-500 leading-tight pr-10">{sub}</p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
            <span className="text-[15px] font-[1000] text-gray-900 tracking-wider font-mono">{code}</span>
            <button className="text-pink-600 font-[1000] text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                Apply
            </button>
        </div>
    </div>
);

const OfferGiftCard = ({ image, title, sub, status = "FREE", isLocked = true }) => (
    <div className="relative bg-white rounded-[24px] border border-gray-100/80 p-5 flex gap-5 h-full min-h-[160px] overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent pointer-none" />
        
        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 relative z-10 shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-2 left-2 bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-200 shadow-sm">
                {status}
            </div>
        </div>
        
        <div className="flex flex-col flex-1 py-1 relative z-10">
            <div className="mb-auto">
                <h4 className="text-[13px] font-black text-gray-900 leading-tight mb-1">{title}</h4>
                <p className="text-[12px] font-bold text-gray-400 line-clamp-2">{sub}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
               {isLocked && <div className="p-1.5 bg-gray-50 rounded-full text-gray-300"><Clock size={14} /></div>}
               <button className="text-pink-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                   View Products <ArrowRight size={10} />
               </button>
            </div>
        </div>
    </div>
);

const OfferSampleCard = ({ title, sub, color = "from-emerald-50 to-white" }) => (
    <div className={`relative bg-gradient-to-br ${color} rounded-[24px] border border-emerald-100/50 p-6 flex flex-col h-full min-h-[160px] overflow-hidden group hover:shadow-xl hover:shadow-emerald-100/20 transition-all`}>
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
        <div className="bg-white rounded-[28px] border border-gray-100 p-4 flex gap-6 items-center flex-1">
            <div className="w-32 h-32 rounded-[20px] overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Complimentary</p>
                    <h3 className="font-black text-base text-gray-900 leading-tight">{name}</h3>
                    <p className="text-xs font-medium text-gray-400">{brand}</p>
                </div>
                <div className="space-y-2">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{Math.round(progress)}% Claimed</p>
                </div>
            </div>
        </div>
    );
};

const TrustFactor = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex-1">
        <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
            <Icon size={16} />
        </div>
        <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">{text}</span>
    </div>
);

const MegaDealBanner = ({ price, discount, onOpenDetails }) => (
    <div className="bg-gradient-to-br from-[#fff5f9] to-white border border-pink-100 rounded-2xl p-4 mb-6 transition-all hover:shadow-md group relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 p-1 opacity-5">
            <Sparkles size={40} />
        </div>
        
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm tracking-tighter uppercase transform -skew-x-12 border border-pink-400/20">
                    MEGA DEAL
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-bold text-gray-600">Get at</span>
                    <span className="text-xl font-[900] text-gray-900 tracking-tight">₹{price}</span>
                </div>
            </div>
            <div className="bg-[#00b852] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#00a349]/20">
                Extra ₹{discount} Off
            </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-50/50">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-tight uppercase">
                <span>With Coupon</span>
                <span className="text-pink-300">•</span>
                <Banknote size={12} className="text-pink-400" />
                <span>Bank Offer</span>
            </div>
            <button 
                onClick={onOpenDetails}
                className="text-pink-600 font-[900] text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:gap-1.5 transition-all"
            >
                Details <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    </div>
);

const GenuineSeal = ({ onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group cursor-pointer outline-none tap-highlight-transparent">
        <div className="relative w-20 h-20 md:w-24 md:h-24">
             {/* Seal Background */}
             <div className="absolute inset-0 bg-sky-100 rounded-full animate-pulse-slow opacity-50 group-hover:opacity-100 transition-opacity" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />
             <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
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
             <div className="absolute inset-0 bg-sky-200 rounded-full" style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'}} />
             <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center shadow-inner">
                 <div className="text-sky-500 transform scale-150 drop-shadow-sm">
                    <CheckCircle size={32} strokeWidth={3} className="fill-sky-50 shadow-blue-200" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                       <div className="w-1.5 h-3 bg-red-400 rounded-full rotate-[-45deg] origin-top" />
                       <div className="w-1.5 h-3 bg-red-400 rounded-full rotate-[45deg] origin-top" />
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
            <div className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-black text-[#151515] uppercase tracking-tight">Quality Check Process</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="p-8 pt-6 space-y-10 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[51px] top-10 bottom-24 w-px border-l-2 border-dashed border-gray-100" />
                    
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-6 relative z-10">
                            {/* Step Number Dot */}
                            <div className="w-8 h-8 rounded-full bg-[#151515] text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg">
                                {step.id}
                            </div>
                            
                            {/* Illustration Card */}
                            <div className={`w-28 h-28 rounded-3xl ${step.color} flex items-center justify-center text-4xl shadow-inner border border-white/50 shrink-0`}>
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
                        className="w-full bg-[#151515] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 mt-4"
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
            <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl transform transition-all animate-in fade-in slide-in-from-bottom-10 duration-300">
                {/* Header Section */}
                <div className="p-6 pb-0 flex flex-col items-center">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                    
                    <div className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded shadow-sm mb-4">MEGA DEAL</div>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-[900] text-gray-900">Get at ₹{price}</span>
                        <div className="bg-[#00b852] text-white text-[10px] font-black px-3 py-1 rounded-full">
                            Extra ₹{discount} Off
                        </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Combine coupons & offers for max discount</p>
                </div>

                {/* Offer List */}
                <div className="px-6 pb-10 space-y-4">
                    {/* Coupon Card */}
                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="text-sm font-[900] text-gray-900 mb-1">Coupon <span className="text-pink-600">MISSEDYOU</span></h5>
                                <p className="text-[11px] font-bold text-gray-400">On orders above ₹699</p>
                            </div>
                            <span className="text-sm font-[900] text-[#00b852]">₹{Math.round(discount * 0.4)} off</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#00b852]">
                            <CheckCircle size={14} fill="currentColor" className="text-white bg-[#00b852] rounded-full border border-[#00b852]" />
                            Coupon Unlocked! Apply Coupon in bag
                        </div>
                        <button className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1">Details <ChevronDown size={12} /></button>
                    </div>

                    {/* Bank Card */}
                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
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
                        className="w-full bg-[#151515] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeliverySection = () => {
    const [activeTab, setActiveTab] = useState("delivery");

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden mb-12">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab("delivery")}
                    className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === "delivery" ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50/30" : "text-gray-400 hover:text-gray-600"}`}
                >
                    Delivery details
                </button>
                <button 
                    onClick={() => setActiveTab("store")}
                    className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "store" ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50/30" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeTab === "store" ? "bg-pink-600 text-white" : "bg-gray-200 text-white"}`}>2</span>
                    Buy in Store
                </button>
            </div>

            {/* Content Container */}
            <div className="p-5">
                {activeTab === "delivery" ? (
                    <>
                        <div className="flex items-center justify-between mb-5 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-50 rounded-full">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">Delivery by Sat, 28 Mar</h4>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">201306 (Noida)</p>
                                </div>
                            </div>
                            <button className="text-pink-600 font-black text-[10px] uppercase tracking-widest border border-pink-100 rounded-lg px-4 py-1.5 hover:bg-pink-50 transition-all shrink-0">
                                Change
                            </button>
                        </div>
                        <p className="text-[9px] font-medium text-gray-400 mb-5 ml-[44px]">Delivery date may change with number of items in bag</p>

                        {/* Icons Footer */}
                        <div className="pt-4 border-t border-gray-50 flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    <Truck size={12} className="text-gray-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-400 leading-tight">Free delivery above ₹299</span>
                            </div>
                            <div className="h-4 w-px bg-gray-100" />
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    <Banknote size={12} className="text-gray-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-400">COD available</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-5 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-pink-50 rounded-full">
                                    <MapPin size={20} className="text-pink-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">2 Nearby Stores Available</h4>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">DLF Mall of India (1.2 km)</p>
                                </div>
                            </div>
                            <button className="bg-pink-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg px-4 py-1.5 hover:bg-pink-700 shadow-sm transition-all shrink-0">
                                Select Store
                            </button>
                        </div>
                        <p className="text-[9px] font-medium text-gray-400 mb-5 ml-[44px]">Pick up in as little as 2 hours after your order.</p>

                        {/* Store Icons Footer */}
                        <div className="pt-4 border-t border-gray-50 flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    <Clock size={12} className="text-gray-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-400 leading-tight">Ready in 2 Hours</span>
                            </div>
                            <div className="h-4 w-px bg-gray-100" />
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    <ShoppingBag size={12} className="text-gray-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight text-gray-400">Reserve Online</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};






const GenuineProductModal = ({ isOpen, onClose, brand }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50">
                    <h2 className="text-xl font-black text-[#151515] uppercase tracking-tight">Genuine Product</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={24} className="text-gray-900" />
                    </button>
                </div>
                
                <div className="p-8 pt-10 flex gap-6 items-center">
                    <div className="shrink-0 p-1 bg-sky-50 rounded-2xl rotate-[-5deg] shadow-sm scale-110">
                        {/* Static Seal Image/SVG */}
                        <div className="relative w-20 h-20">
                             <div className="absolute inset-0 bg-sky-100 rounded-full opacity-50" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />
                             <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
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
                        className="w-full bg-[#151515] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
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
    const { products } = useProducts();
    const location = useLocation();
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

    // Calculate full product data
    let listImages = MOCK_PDP_DATA.images;
    if (product?.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
        listImages = product.imageUrls;
    } else if (product?.image) {
        listImages = [product.image, ...MOCK_PDP_DATA.images];
    }

    const fullProduct = {
        ...MOCK_PDP_DATA,
        ...product,
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


    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24 md:pb-10 pt-20"> {/* pt-20 for navbar clearance */}

            <div className="max-w-[1280px] mx-auto px-4 md:px-8">

                {/* --- Breadcrumbs (Simple) --- */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium tracking-wide">
                    <span>Home</span> <span>/</span> <span>Skincare</span> <span>/</span> <span className="text-gray-900">{fullProduct.name}</span>
                </div>

                {/* --- Top Layout: Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mb-20">

                    {/* 1. Left Content Area (7/12 cols) - Gallery & Exclusive Rewards */}
                    <div className="md:col-span-7 flex flex-col gap-8">
                        {/* Gallery Section */}
                        <div className="flex flex-col-reverse md:flex-row gap-4">
                            {/* Thumbnails */}
                            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-20 flex-shrink-0">
                                {fullProduct.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? "border-pink-400 shadow-md ring-2 ring-pink-100" : "border-transparent hover:border-gray-200"}`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="relative flex-1 bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group cursor-crosshair h-[400px] md:h-[600px]">
                                <img src={mainImage} className="w-full h-full object-cover transform md:group-hover:scale-110 transition-transform duration-700" alt={fullProduct.name} />
                                <span className="absolute top-5 left-5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-pink-600 shadow-sm">
                                    BESTSELLER
                                </span>
                                <button className="absolute top-5 right-5 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white text-gray-700 transition">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Purchase Panel (Right - 5/12 cols) */}
                    <div className="md:col-span-5 relative">
                        <div className="sticky top-24">

                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{fullProduct.brand}</p>
                            <h1 className="text-3xl md:text-4xl font-[900] text-[#151515] mb-3 leading-tight tracking-tight">{fullProduct.name}</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center text-yellow-400 gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                    <span className="ml-2 text-sm text-gray-500 font-semibold underline decoration-gray-300 underline-offset-4 cursor-pointer">(1,248 Reviews)</span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-3 mb-8">
                                <span className="text-3xl font-bold text-[#151515]">₹{fullProduct.price}</span>
                                <span className="text-lg text-gray-400 line-through">₹{Math.round(fullProduct.price * 1.3)}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">30% OFF</span>
                            </div>

                            {/* Shade Selector */}
                            {fullProduct.shades && fullProduct.shades.length > 0 && (
                                <div className="mb-8">
                                    <span className="text-sm font-bold text-gray-900 mb-3 block">Select Shade: <span className="text-gray-500 font-normal">{selectedShade?.name}</span></span>
                                    <div className="flex flex-wrap gap-3">
                                        {fullProduct.shades.map(s => (
                                            <button
                                                key={s.name || s}
                                                onClick={() => setSelectedShade(s)}
                                                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative ${selectedShade?.name === s.name || selectedShade === s ? "border-black scale-110 shadow-md" : "border-gray-100 hover:border-gray-300"}`}
                                                style={{ backgroundColor: s.color || "#ccc" }}
                                                aria-label={s.name || s}
                                            >
                                                {(selectedShade?.name === s.name || selectedShade === s) && <div className="w-1.5 h-1.5 bg-white rounded-full box-content border border-black/10 shadow-sm" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pre-Order Info */}
                            {product.shippingStart && (
                                <div className="mb-6 bg-pink-50 p-4 rounded-xl border border-pink-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-bold text-pink-700">Shipping Starts</p>
                                        <p className="text-base font-bold text-[#1a1a1a]">{product.shippingStart}</p>
                                    </div>
                                    {product.stockLeft && product.totalStock && (
                                        <>
                                            <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                                                <span>Slots Available</span>
                                                <span className="text-pink-600">{product.stockLeft} left</span>
                                            </div>
                                            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-pink-100">
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                                                    style={{ width: `${(product.stockLeft / product.totalStock) * 100}%` }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="mb-6">
                                <div className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full ${(!product.shippingStart && product.inStock) ? "bg-green-100 text-green-700" : (!product.shippingStart && !product.inStock) ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                                    <div className={`w-2 h-2 rounded-full ${(!product.shippingStart && product.inStock) ? "bg-green-500" : (!product.shippingStart && !product.inStock) ? "bg-red-500" : "bg-blue-500"}`} />
                                    {product.shippingStart ? "Pre-Order Open" : (product.inStock ? "In Stock" : "Out of Stock")}
                                </div>
                            </div>

                             {/* Mega Deal Price Banner */}
                             <MegaDealBanner 
                                price={Math.round(fullProduct.price * 0.85)} 
                                discount={Math.round(fullProduct.price * 0.1)} 
                                onOpenDetails={() => setShowDealModal(true)}
                             />

                             <DealDetailsModal 
                                isOpen={showDealModal} 
                                onClose={() => setShowDealModal(false)}
                                price={Math.round(fullProduct.price * 0.85)}
                                discount={Math.round(fullProduct.price * 0.1)}
                             />

                             {/* Actions: Qty & Add Cart */}
                             <div className="flex gap-4 mb-10 text-center">
                                {/* Stepper */}
                                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-1 h-12">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition"><Minus size={16} /></button>
                                    <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
                                    <button onClick={() => setQty(qty + 1)} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-full transition"><Plus size={16} /></button>
                                </div>

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-[#151515] text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-200 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} />
                                    {product.id && product.id.startsWith("po") ? "Pre-Order" : "Add to Cart"}
                                </button>

                                {/* Wishlist */}
                                <button
                                    onClick={() => toggleWishlist && toggleWishlist(product)}
                                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isWishlisted ? "border-pink-200 bg-pink-50 text-pink-500" : "border-pink-200 text-pink-400 hover:border-pink-400 hover:text-pink-900"}`}
                                >
                                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* Trust Factors Grid (Circled Position) */}
                            <div className="grid grid-cols-2 gap-3 mb-10">
                                <TrustFactor icon={Truck} text="Free Delivery" />
                                <TrustFactor icon={ShieldCheck} text="100% Authentic" />
                                <TrustFactor icon={CornerUpLeft} text="Easy Returns" />
                                <TrustFactor icon={CreditCard} text="Secure Pay" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NEW: Delivery Details Section --- */}
                <DeliverySection />

                {/* --- Exclusive Offers Section (Refined High-Fidelity) --- */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <SectionHeader title="Exclusive Offers" />
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-pink-100">8 AVAILABLE</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <OfferCouponCard 
                            title="Save upto ₹300"
                            sub="On your 1st order above ₹299+"
                            code="NEW15"
                            color="from-[#FFF0F7] to-white"
                        />
                        <OfferGiftCard 
                            image="/estee_lauder_free_kit.png"
                            title="Estee Lauder Free Kit"
                            sub="Estee Lauder 4-Pc Kit Fall'25"
                            status="FREE"
                            isLocked={true}
                        />
                        <OfferSampleCard 
                            title="Pick a free sample"
                            sub="On Estee Lauder purchase above ₹999"
                            color="from-[#E6F9F0] to-white"
                        />
                    </div>
                </div>

                {/* --- NEW: Limited Time Gifts Section (Full Width) --- */}
                <div className="mb-24">
                    <SectionHeader title="Limited Time Gifts" timer="05:06:00" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <LimitedGiftCard 
                            image="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&w=300&q=80" 
                            brand="ESTÉE LAUDER" 
                            name="Free Estée Lauder 4-Pc Kit Fall'25" 
                            unclaimed={65} 
                            total={100} 
                        />
                        <LimitedGiftCard 
                            image="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=300&q=80" 
                            brand="LANEIGE" 
                            name="Laneige Mini Lip Glow (5h 7m left)" 
                            unclaimed={40} 
                            total={100} 
                        />
                    </div>
                </div>

                {/* --- Below Fold Content --- */}

                {/* Modern Tabs (Desktop) / Accordion (Mobile) */}
                <section className="mb-20">
                    <div className="bg-white rounded-[32px] p-6 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">

                        {/* Desktop Tabs Header */}
                        <div className="hidden md:flex items-center gap-10 border-b border-gray-100 mb-8 pb-1">
                            {["description", "benefits", "ingredients", "faq"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? "border-pink-500 text-pink-500" : "border-transparent text-gray-400 hover:text-gray-900"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[200px]">
                            {/* Description */}
                            <div className={`space-y-6 ${activeTab === "description" ? "block" : "hidden md:hidden"}`}>
                                <div className="md:hidden">
                                    <AccordionItem title="Description" isOpen={openAccordions.description} onClick={() => toggleAccordion("description")}>
                                        {fullProduct.description}
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block">
                                            <h5 className="font-bold text-xs uppercase mb-2 text-gray-400">Perfect For</h5>
                                            <p className="text-sm font-semibold text-gray-800">Dryness, Dullness, Uneven Texture</p>
                                        </div>
                                    </AccordionItem>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-lg text-gray-600 leading-8 max-w-3xl">{fullProduct.description}</p>
                                    <div className="mt-8 p-6 bg-pink-50/30 rounded-2xl border border-pink-100 inline-block">
                                        <h5 className="font-bold text-xs uppercase mb-2 text-pink-400">Why we love it</h5>
                                        <p className="text-base font-semibold text-gray-800">{fullProduct.whyWeLoveIt}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className={`${activeTab === "benefits" ? "block" : "hidden md:hidden"}`}>
                                <div className="md:hidden">
                                    <AccordionItem title="Key Benefits" isOpen={openAccordions.benefits} onClick={() => toggleAccordion("benefits")}>
                                        <div className="flex flex-wrap gap-2">
                                            {fullProduct.benefits.map((b, i) => (
                                                <span key={i} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">{b.icon} {b.text}</span>
                                            ))}
                                        </div>
                                    </AccordionItem>
                                </div>
                                <div className="hidden md:flex gap-4">
                                    {fullProduct.benefits.map((b, i) => (
                                        <div key={i} className="flex-1 p-6 bg-white border border-gray-100 rounded-2xl text-center shadow-sm hover:shadow-md transition">
                                            <div className="text-4xl mb-3">{b.icon}</div>
                                            <h4 className="font-bold text-gray-900">{b.text}</h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className={`${activeTab === "ingredients" ? "block" : "hidden md:hidden"}`}>
                                <div className="md:hidden">
                                    <AccordionItem title="Full Ingredients" isOpen={openAccordions.ingredients} onClick={() => toggleAccordion("ingredients")}>
                                        {fullProduct.ingredients}
                                    </AccordionItem>
                                </div>
                                <div className="hidden md:block bg-gray-50 p-6 rounded-2xl border border-gray-200 font-mono text-sm text-gray-600 leading-relaxed">
                                    {fullProduct.ingredients}
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className={`${activeTab === "faq" ? "block" : "hidden md:hidden"}`}>
                                <div className="md:hidden">
                                    <AccordionItem title="FAQ" isOpen={openAccordions.faq} onClick={() => toggleAccordion("faq")}>
                                        <ul className="space-y-4">
                                            {fullProduct.faq.map((f, i) => (
                                                <li key={i}>
                                                    <p className="font-bold text-sm text-gray-900 mb-1">{f.q}</p>
                                                    <p className="text-gray-600 text-sm">{f.a}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionItem>
                                </div>
                                <div className="hidden md:grid grid-cols-2 gap-8">
                                    {fullProduct.faq.map((f, i) => (
                                        <div key={i}>
                                            <h4 className="font-bold text-gray-900 text-lg mb-2">{f.q}</h4>
                                            <p className="text-gray-600">{f.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Always Visible Trust Seals */}
                        <div className="mt-20 pt-16 border-t border-gray-100 flex flex-col items-center gap-12">
                            <div className="text-center space-y-2">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Verified Guarantees</h3>
                                <div className="h-1 w-12 bg-pink-500 mx-auto rounded-full" />
                            </div>
                             <div className="flex items-center justify-center gap-16 md:gap-40">
                                <GenuineSeal onClick={() => setShowGenuineModal(true)} />
                                <QualitySeal onClick={() => setShowQualityModal(true)} />
                            </div>
                        </div>

                    </div>
                </section>

                <QualityProcessModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
                <GenuineProductModal isOpen={showGenuineModal} onClose={() => setShowGenuineModal(false)} brand={fullProduct.brand} />


                {/* --- Reviews Section --- */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-[900] text-[#151515]">Reviews (142)</h2>
                        <button className="text-pink-600 font-bold hover:underline">Write a Review</button>
                    </div>

                    {/* Horizontal Scroll Reviews */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mask-linear-fade">
                        <ReviewCard name="Ananya S." rating={5} date="2 days ago" comment="Literally the best serum I've ever used. My skin is glowing!" />
                        <ReviewCard name="Priya M." rating={4} date="1 week ago" comment="Good hydration but takes a while to absorb. Love the packaging though." />
                        <ReviewCard name="Sarah K." rating={5} date="3 weeks ago" comment="Holy grail status. Reordered 3 times already." />
                        <ReviewCard name="Rahul D." rating={5} date="1 month ago" comment="My girlfriend loves this. Bought it as a gift." />
                    </div>
                </section>

                {/* --- Recommendations --- */}
                <section className="mb-10">
                    <h2 className="text-2xl font-[900] text-[#151515] mb-8">Pairs Well With</h2>
                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                        {products.slice(1, 5).map(p => (
                            <ProductCardMini key={p.id} product={p} onAddToCart={addToCart} />
                        ))}
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-[900] text-[#151515] mb-8">You May Also Like</h2>
                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                        {products.slice(2, 6).map(p => (
                            <ProductCardMini key={p.id} product={p} onAddToCart={addToCart} />
                        ))}
                    </div>
                </section>

            </div>

            {/* --- Sticky Mobile Bottom Bar --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 z-50 flex items-center justify-between shadow-lg">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                    <span className="text-xl font-bold text-gray-900">₹{fullProduct.price}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider"
                >
                    Add to Cart
                </button>
            </div>

        </div>
    );
}
