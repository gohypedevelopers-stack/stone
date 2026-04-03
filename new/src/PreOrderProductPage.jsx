import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Star, ShieldCheck, Truck, Clock,
    CheckCircle, RefreshCcw, Info, Heart, Minus, Plus
} from "lucide-react";

import { useProducts } from "./context/ProductContext";

export default function PreOrderProductPage({ addToCart, wishlist = [], toggleWishlist }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { preorderProducts, loading } = useProducts();

    const product = preorderProducts.find(p => p.id === id);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#fffcfc]">
                <div className="w-10 h-10 border-4 border-[#d1408e] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest animate-pulse">Fetching Product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffcfc]">
                <p className="text-xl font-black text-[#1a1a1a] mb-4">Product Not Found</p>
                <button onClick={() => navigate(-1)} className="text-[#d1408e] hover:underline font-bold">Go Back</button>
            </div>
        );
    }

    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [openAccordion, setOpenAccordion] = useState("description");

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-[#fffcfc] pb-20 md:pb-0">

            {/* Navbar Placeholder / Back Button */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 h-[60px] flex items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#444] hover:text-black font-medium text-sm">
                    <ChevronLeft size={20} /> Back
                </button>
            </div>

            <main className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-4 py-8 md:py-12">

                {/* Left: Media Gallery */}
                <div className="flex flex-col-reverse md:flex-row gap-4 sticky top-[80px] h-fit">
                    {/* Thumbnails */}
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
                        {product.images?.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-[16px] overflow-hidden border-2 transition-all shrink-0 ${selectedImage === idx ? "border-[#d1408e]" : "border-transparent"
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 aspect-4/5 md:aspect-square bg-gray-50 rounded-[24px] overflow-hidden relative shadow-sm">
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => toggleWishlist && toggleWishlist(product)}
                            className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors shadow-sm ${wishlist.some(i => i.id === product.id) ? 'bg-red-50 text-red-500' : 'bg-white/80 text-[#111] hover:bg-[#d1408e] hover:text-white'}`}
                        >
                            <Heart size={20} fill={wishlist.some(i => i.id === product.id) ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>

                {/* Right: Purchase Panel */}
                <div className="flex flex-col">

                    <div className="mb-6">
                        <span className="inline-block bg-[#d1408e]/10 text-[#d1408e] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                            {product.tag}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-[#1a1a1a] mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-[#666]">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={16} fill="currentColor" />
                                <span className="font-bold text-[#111] pt-0.5">{product.rating}</span>
                            </div>
                            <span>{product.reviews} Reviews</span>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-pink-50 to-purple-50 rounded-[24px] p-6 border border-pink-100 mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[13px] font-bold text-[#666] mb-1">Pre-Order Price</p>
                                <div className="text-3xl font-black text-[#1a1a1a]">{typeof product.price === 'string' ? product.price : `₹${product.price.toLocaleString('en-IN')}`}</div>
                                <p className="text-[11px] text-[#888] mt-1">Charged upon shipping</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[13px] font-bold text-[#d1408e] flex items-center justify-end gap-1.5">
                                    <Clock size={14} /> Shipping Starts
                                </p>
                                <p className="text-lg font-bold text-[#1a1a1a]">{product.shippingStart}</p>
                            </div>
                        </div>

                        {/* Availability Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-[11px] font-bold text-[#555] mb-2">
                                <span>Demand is high!</span>
                                <span className="text-[#d1408e]">{product.stockLeft} slots left</span>
                            </div>
                            <div className="w-full h-[6px] bg-white rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-linear-to-r from-[#ff4fa3] to-[#d1408e] rounded-full"
                                    style={{ width: `${(product.stockLeft / product.totalStock) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => addToCart && addToCart(product)}
                                className="w-full h-[56px] bg-linear-to-r from-[#1a1a1a] to-[#333] text-white rounded-[16px] font-extrabold text-[15px] uppercase tracking-wide hover:shadow-lg hover:from-[#d1408e] hover:to-[#b03075] transition-all flex items-center justify-center gap-2">
                                Pre-Order Now
                            </button>
                            <p className="text-center text-[11px] text-[#666] font-medium flex items-center justify-center gap-1.5">
                                <RefreshCcw size={12} /> Cancel anytime before shipping
                            </p>
                        </div>
                    </div>

                    {/* Reassurance Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: ShieldCheck, text: "Authentic" },
                            { icon: Truck, text: "Secure Ship" },
                            { icon: CheckCircle, text: "Verified" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-2 p-3 bg-white border border-gray-100 rounded-[16px]">
                                <item.icon size={20} className="text-[#d1408e]" />
                                <span className="text-[11px] font-bold text-[#444]">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Accordions */}
                    <div className="space-y-4">
                        {[
                            { id: "description", title: "Product Description", content: product.description },
                            { id: "ingredients", title: "Ingredients", content: product.ingredients },
                            { id: "usage", title: "How to Use", content: product.usage },
                            { id: "howworks", title: "How Pre-Order Works", content: "1. Reserve your slot now.\n2. We secure your item directly from the brand.\n3. Your order ships on the official launch date." }
                        ].map((section) => (
                            <div key={section.id} className="border-b border-gray-100 last:border-0 pb-4">
                                <button
                                    onClick={() => toggleAccordion(section.id)}
                                    className="w-full flex items-center justify-between py-2 text-left group"
                                >
                                    <span className="font-extrabold text-[#1a1a1a] text-[15px] group-hover:text-[#d1408e] transition-colors">{section.title}</span>
                                    {openAccordion === section.id ? <Minus size={18} className="text-[#d1408e]" /> : <Plus size={18} className="text-[#ccc]" />}
                                </button>
                                {openAccordion === section.id && (
                                    <div className="pt-2 text-[14px] text-[#666] leading-relaxed whitespace-pre-line animate-in slide-in-from-top-2 duration-200">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            {/* Mobile Sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => addToCart && addToCart(product)}
                    className="w-full h-[52px] bg-[#1a1a1a] text-white rounded-[14px] font-extrabold text-[14px] uppercase tracking-wide">
                    Pre-Order • {typeof product.price === 'string' ? product.price : `₹${product.price}`}
                </button>
            </div>

        </div>
    );
}