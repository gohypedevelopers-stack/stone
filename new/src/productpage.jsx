import React, { useState, useEffect } from "react";
import {
    Star, Heart, Minus, Plus, ShoppingBag, ShieldCheck,
    Truck, CornerUpLeft, CreditCard, ChevronDown, ChevronUp, Share2, ArrowRight
} from "lucide-react";
import { getAllProducts } from "./data/products";

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
                    onClick={() => onAddToCart && onAddToCart(product.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >+
                </button>
            </div>
        </div>
    </div>
);


export default function ProductDetail({ addToCart }) {
    // Grab a product to display (using first Bestseller or just first product for demo)
    const products = getAllProducts() || [];
    const product = products.find(p => p.tag === "Best Seller") || products[0];

    // Guard Clause to prevent crashes if no products
    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-lg">Loading product details...</p>
            </div>
        );
    }

    // Merge with Mock Data for full experience
    const fullProduct = { ...product, ...MOCK_PDP_DATA };

    const [mainImage, setMainImage] = useState(fullProduct.images[0]);
    const [selectedShade, setSelectedShade] = useState(fullProduct.shades[0]);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("description"); // For Desktop Tabs
    const [openAccordions, setOpenAccordions] = useState({ description: true }); // For Mobile Accordions
    const [isWishlisted, setIsWishlisted] = useState(false);

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddToCart = () => {
        // In a real app, pass qty and shade
        // Simulate adding multiple times based on qty
        if (addToCart) {
            for (let i = 0; i < qty; i++) addToCart(product.id);
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

                    {/* 1. Image Gallery (Left - 7/12 cols) */}
                    <div className="md:col-span-7 flex flex-col-reverse md:flex-row gap-4">
                        {/* Thumbnails (Vertical on Desktop) */}
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
                            <div className="mb-8">
                                <span className="text-sm font-bold text-gray-900 mb-3 block">Select Shade: <span className="text-gray-500 font-normal">{selectedShade.name}</span></span>
                                <div className="flex flex-wrap gap-3">
                                    {fullProduct.shades.map(s => (
                                        <button
                                            key={s.name}
                                            onClick={() => setSelectedShade(s)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative ${selectedShade.name === s.name ? "border-black scale-110 shadow-md" : "border-gray-100 hover:border-gray-300"}`}
                                            style={{ backgroundColor: s.color }}
                                            aria-label={s.name}
                                        >
                                            {selectedShade.name === s.name && <div className="w-1.5 h-1.5 bg-white rounded-full box-content border border-black/10 shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                <div className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full ${fullProduct.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    <div className={`w-2 h-2 rounded-full ${fullProduct.inStock ? "bg-green-500" : "bg-red-500"}`} />
                                    {fullProduct.inStock ? "In Stock" : "Out of Stock"}
                                </div>
                            </div>

                            {/* Actions: Qty & Add Cart */}
                            <div className="flex gap-4 mb-8">
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
                                    Add to Cart
                                </button>

                                {/* Wishlist */}
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isWishlisted ? "border-pink-200 bg-pink-50 text-pink-500" : "border-pink-200 text-pink-400 hover:border-pink-400 hover:text-pink-900"}`}
                                >
                                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* Compact Info Cards */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-50 flex items-start gap-2">
                                    <Truck size={16} className="text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Free Delivery</h4>
                                        <p className="text-[10px] text-gray-500">On orders above ₹999</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-50 flex items-start gap-2">
                                    <ShieldCheck size={16} className="text-purple-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Authentic</h4>
                                        <p className="text-[10px] text-gray-500">100% Original Products</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-50/50 rounded-xl border border-green-50 flex items-start gap-2">
                                    <CornerUpLeft size={16} className="text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Easy Returns</h4>
                                        <p className="text-[10px] text-gray-500">7-Day Return Policy</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-50 flex items-start gap-2">
                                    <CreditCard size={16} className="text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Secure Pay</h4>
                                        <p className="text-[10px] text-gray-500">SSL Encrypted</p>
                                    </div>
                                </div>
                            </div>

                        </div>
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
                                        <p className="text-base font-semibold text-gray-800">Instantly plumps skin by +45% and repairs barrier in 2 weeks.</p>
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

                    </div>
                </section>


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
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 z-50 flex items-center justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                    <span className="text-xl font-bold text-gray-900">₹{fullProduct.price}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-[#151515] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg"
                >
                    Add to Cart
                </button>
            </div>

        </div>
    );
}
