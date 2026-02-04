import { useState, useEffect } from "react";
import { getAllProducts } from "./data/products";
import ProductCard from "./components/card.jsx";
import { Clock, Filter, Sparkles, CheckCircle, Mail, ChevronRight, Heart } from "lucide-react";
import ImageReveal from "./components/image-tiles";
import imgNew1 from "./assets/newprod/new1.jpg";
import imgNew2 from "./assets/newprod/new2.jpg";
import imgNew3 from "./assets/newprod/new3.jpg";

export default function NewArrivals({ addToCart }) {
    const allProducts = getAllProducts();
    const [activeFilter, setActiveFilter] = useState("Latest");
    const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });

    // Filter products
    const newArrivals = allProducts.filter(p => p.tag === "New" || p.rating >= 4.5);
    const saleProducts = allProducts.filter(p => p.price < 900); // Simulate sale items

    // Countdown timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 font-sans">

            {/* 1. Hero Banner */}
            <section className="relative px-6 py-12 md:py-20 max-w-[1440px] mx-auto">
                <div className="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">

                    {/* Text Content */}
                    <div className="max-w-xl relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-pink-100 shadow-sm mb-6">

                            <span className="text-xs font-bold uppercase tracking-widest text-[#151515]">Just Dropped</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-[800] text-[#151515] leading-[1.1] mb-6 tracking-tight">
                            New <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Arrivals</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light">
                            Fresh beauty drops just landed. Discover innovative formulas designed to elevate your daily ritual.
                        </p>
                        <button className="bg-[#151515] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto md:mx-0">
                            Shop New In <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Floating Collage (Visual) */}
                    <div className="relative w-full md:w-1/2 h-[300px] md:h-[400px] flex items-center justify-center">
                        {/* Abstract blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />

                        <div className="relative z-10 scale-75 md:scale-100">
                            <ImageReveal
                                leftImage={imgNew1}
                                middleImage={imgNew2}
                                rightImage={imgNew3}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Filter & Sort Bar (Sticky) */}
            <div className="sticky top-[70px] z-40 bg-white/80 backdrop-blur-md border-y border-white/50 shadow-sm mb-12">
                <div className="max-w-[1440px] px-6 py-4 mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {["Latest", "Price Low", "Skincare", "Makeup", "Sets"].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-[#151515] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Filter size={16} />
                        <span>{newArrivals.length} Products Found</span>
                    </div>
                </div>
            </div>

            {/* 3. Product Grid */}
            <section className="px-6 max-w-[1440px] mx-auto mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {newArrivals.map(p => (
                        <div key={p.id} className="group relative">
                            {/* Custom Minimal Card Wrapper */}
                            <div className="relative bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 p-3">
                                <div className="relative rounded-[20px] overflow-hidden bg-gray-50 aspect-square mb-4">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-3 left-3 bg-[#151515] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">New</div>
                                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm">
                                        <Heart size={16} strokeWidth={2.5} />
                                    </button>
                                    {/* Add to Cart Overlay */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                                        <button onClick={() => addToCart(p.id)} className="w-full bg-white/95 backdrop-blur text-[#151515] py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#151515] hover:text-white transition-colors">
                                            Add to Bag
                                        </button>
                                    </div>
                                </div>
                                <div className="px-1 pb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.origin} Beauty</span>
                                    <h3 className="text-base font-bold text-[#151515] mt-1 mb-1 line-clamp-1">{p.name}</h3>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. BOGO Promo Section */}
            <section className="px-6 max-w-[1440px] mx-auto mb-20">
                <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#ffe4e6] via-[#f3e8ff] to-[#e0e7ff] p-8 md:p-14 border border-white/50 shadow-lg">
                    {/* Background Decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-left">
                            <span className="inline-block bg-[#151515] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">Limited Offer</span>
                            <h2 className="text-4xl md:text-5xl font-[900] text-[#151515] mb-4 tracking-tight">Buy 1 Get 1 <span className="text-pink-600">Free</span></h2>
                            <p className="text-gray-600 text-lg mb-8 max-w-md">Purchase any eligible full-sized product on MRP and get a travel-size essential absolutely free.</p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button className="bg-[#151515] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-xl hover:scale-105 transition-all shadow-md w-full sm:w-auto">
                                    Claim Offer
                                </button>
                                <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white/50 text-sm font-bold text-[#151515]">
                                    <Clock size={16} className="text-pink-600" />
                                    <span>Ends in: {timeLeft.h}h : {timeLeft.m}m : {timeLeft.s}s</span>
                                </div>
                            </div>
                        </div>

                        {/* BOGO Visual */}
                        <div className="flex items-center gap-4 relative">
                            <div className="bg-white p-1 rounded-2xl shadow-xl transform -rotate-3 border border-white">
                                <img src={allProducts[0]?.image} alt="Product 1" className="w-38 h-38 object-cover rounded-xl" />
                            </div>
                            <div className="w-8 h-8 bg-[#151515] text-white rounded-full flex items-center justify-center font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 border-4 border-white shadow-sm">+</div>
                            <div className="bg-pink-50 p-1 rounded-2xl shadow-xl transform rotate-3 border border-white relative">
                                <img src={allProducts[1]?.image} alt="new2" className="w-38 h-38 object-cover rounded-xl grayscale opacity-90" />
                                <div className="absolute top-2 right-2 bg-pink-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-sm">FREE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Sale Carousel Section */}
            <section className="bg-white/50 py-20 mb-12">
                <div className="px-6 max-w-[1440px] mx-auto">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-[800] text-[#151515] mb-2">New Arrival Sale Picks</h2>
                            <p className="text-gray-500">Curated discounts on fresh inventory. Up to 40% Off.</p>
                        </div>
                        <a href="#" className="hidden sm:inline-flex items-center gap-1 font-bold text-sm text-[#151515] border-b-2 border-transparent hover:border-[#151515] transition-all">View All</a>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                        {saleProducts.map(p => (
                            <div key={p.id} className="min-w-[280px] snap-center bg-white rounded-[24px] p-3 shadow-sm hover:shadow-lg transition-all border border-gray-100">
                                <div className="relative rounded-[20px] bg-gray-50 mb-3 overflow-hidden aspect-[4/5]">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">-30% OFF</div>
                                </div>
                                <div className="px-1">
                                    <h4 className="font-bold text-[#151515] text-sm truncate">{p.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-red-500 font-bold text-sm">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price * 0.7)}</span>
                                        <span className="text-gray-400 text-xs line-through">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Dream Product Request */}
            <section className="px-6 max-w-[1440px] mx-auto mb-20">
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-white/60 shadow-[0_10px_40px_rgba(255,223,235,0.4)] p-8 md:p-14 text-center">

                    {/* Glassmorphism Overlay */}
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-sm pointer-events-none" />

                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-4 text-pink-300 opacity-50"><Sparkles size={24} /></div>
                    <div className="absolute bottom-10 right-10 text-purple-300 opacity-50"><Sparkles size={32} /></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto">


                        <h2 className="text-3xl md:text-4xl font-[900] text-[#151515] mb-3 tracking-tight">Want Something Special?</h2>
                        <p className="text-gray-600 text-base md:text-lg mb-8 font-light">
                            Tell us what you want — we’ll try to stock it. <br className="hidden md:block" />
                            Help us curate the perfect shelf for you.
                        </p>

                        <form className="flex flex-col gap-4 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your request! We'll look into it."); }}>

                            <div className="group relative">
                                <input
                                    type="text"
                                    required
                                    placeholder="Product Name or Link *"
                                    className="w-full bg-white/80 backdrop-blur-md border border-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 rounded-2xl px-5 py-4 text-sm font-medium text-[#151515] placeholder:text-gray-400 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="group relative">
                                <textarea
                                    rows={2} // Use integer 
                                    placeholder="Any specific shades or notes? (Optional)"
                                    className="w-full bg-white/80 backdrop-blur-md border border-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 rounded-2xl px-5 py-4 text-sm font-medium text-[#151515] placeholder:text-gray-400 outline-none transition-all shadow-sm resize-none"
                                />
                            </div>

                            <button type="submit" className="mt-2 w-full bg-gradient-to-r from-[#151515] to-[#333] hover:from-pink-600 hover:to-purple-600 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg hover:shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2">
                                Request Product <Sparkles size={16} />
                            </button>

                        </form>
                    </div>
                </div>
            </section>

            {/* 7. Newsletter & Trust */}
            <section className="px-6 max-w-[1440px] mx-auto mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#151515] rounded-[32px] p-8 md:p-12 text-white flex flex-col justify-center text-center md:text-left">
                        <Mail className="w-8 h-8 mb-4 mx-auto md:mx-0 text-pink-400" />
                        <h3 className="text-2xl font-bold mb-2">Unlock 15% Off Your First Order</h3>
                        <p className="text-gray-400 mb-6 font-light">Join our list for early access to new drops and exclusive offers.</p>
                        <div className="flex bg-white/10 rounded-full p-1 border border-white/20">
                            <input type="email" placeholder="Your email address" className="bg-transparent flex-1 px-4 text-sm outline-none text-white placeholder:text-gray-500" />
                            <button className="bg-white text-[#151515] font-bold text-xs uppercase px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">Subscribe</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "Authentic Products", desc: "100% Sourced directly from brands.", icon: <CheckCircle className="text-green-500" /> },
                            { title: "Free Shipping", desc: "On all orders above ₹999.", icon: <Sparkles className="text-blue-500" /> },
                            { title: "Easy Returns", desc: "15-day hassle-free return policy.", icon: <Clock className="text-purple-500" /> },
                            { title: "Secure Payment", desc: "SSL Encrypted Checkout.", icon: <CheckCircle className="text-orange-500" /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-pink-200 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#151515] text-sm">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
