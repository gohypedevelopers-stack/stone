import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Plus,
  Minus,
  ChevronLeft,
  ShoppingBag,
  Package,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Truck,
  Banknote,
  MapPin,
  AlertCircle,
  Store,
  X,
  Star,
  ShieldCheck,
  CreditCard,
  Clock,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { API_URL, SERVER_URL } from "./utils/api";
import { useProducts } from "./context/ProductContext";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";


const OfferCouponCard = ({ title, sub, code }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success("Coupon code copied!");
    };

    return (
        <div className="relative group min-w-[200px] flex-1">
            <div className="relative bg-white rounded-[4px] border-2 border-dashed border-[#ff4fa3]/20 overflow-hidden transition-all hover:border-[#ff4fa3]/40 hover:shadow-xl hover:shadow-[#ff4fa3]/5 h-full">
                <div className="absolute inset-0 bg-linear-to-br from-[#fff0f6] to-white pointer-events-none" />
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#fafafc] border border-[#ff4fa3]/10 z-20" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#fafafc] border border-[#ff4fa3]/10 z-20" />
                
                <div className="relative p-5 flex flex-col gap-3 z-10">
                    <div className="space-y-1">
                        <p className="text-[9px] font-[1000] text-[#ff4fa3] tracking-[0.2em] uppercase opacity-80">Exclusive Offer</p>
                        <p className="text-[11px] font-[1000] text-stone-900 leading-tight tracking-tight uppercase">
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
                </div>
            </div>
        </div>
    );
};

const AccordionItem = ({ title, children, isOpen, onClick }) => (
    <div className="border-b border-stone-100 last:border-none">
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-between py-6 group"
        >
            <span className={`text-[11px] font-[1000] uppercase tracking-[0.2em] transition-all duration-300 ${isOpen ? "text-[#ff4fa3]" : "text-stone-900 group-hover:text-[#ff4fa3]"}`}>{title}</span>
            {isOpen ? <ChevronUp size={16} className="text-[#ff4fa3]" strokeWidth={3} /> : <ChevronDown size={16} className="text-stone-400 group-hover:text-stone-600" strokeWidth={3} />}
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                >
                    <div className="pb-8 text-[14px] text-stone-500 leading-relaxed font-bold">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const DeliveryBanner = ({ time = "7-10 Business Days" }) => (
    <div className="flex items-center gap-5 bg-white border border-stone-100 rounded-[4px] p-5 mb-2 shadow-sm group hover:border-[#ff4fa3]/20 transition-all">
        <div className="w-12 h-12 bg-[#ff4fa3]/5 text-[#ff4fa3] rounded-full flex items-center justify-center shrink-0 border border-[#ff4fa3]/10 group-hover:scale-110 transition-transform">
            <Truck size={22} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5">
            <p className="text-[10px] font-[1000] text-[#ff4fa3] uppercase tracking-[0.2em] opacity-60">Shipping Information</p>
            <p className="text-[14px] font-bold text-stone-900 leading-tight">Arrives in <span className="text-[#ff4fa3]">{time}</span></p>
        </div>
    </div>
);

const DeliverySection = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("delivery");

    const getDeliveryDate = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 4); 
        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short'
        });
    };

    const userAddress = user?.addresses?.[0] 
        ? `${user.addresses[0].postalCode} (${user.addresses[0].city})`
        : "201306 (NOIDA)";

    return (
        <div className="bg-white rounded-[20px] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden mb-12">
            <div className="p-2 flex bg-stone-50/50">
                <div className="flex w-full bg-white rounded-[14px] p-1 border border-stone-100 shadow-sm">
                    {["delivery", "store"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 py-3 px-4 rounded-[10px] flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === tab ? "text-white" : "text-stone-400 hover:text-stone-600"}`}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-stone-900 rounded-[10px]" />
                            )}
                            {tab === "delivery" ? <Truck size={14} className="relative z-10" /> : <Store size={14} className="relative z-10" />}
                            <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.2em]">{tab === "delivery" ? "Standard Delivery" : "Buy in Store"}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-8">
                <AnimatePresence mode="wait">
                    {activeTab === "delivery" ? (
                        <motion.div key="delivery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/50">
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[15px] font-bold text-stone-900 tracking-tight">Delivery by <span className="text-[#ff3b8f] font-black">{getDeliveryDate()}</span></h4>
                                        <div className="flex items-center gap-2 opacity-40">
                                            <MapPin size={12} />
                                            <p className="text-[9px] font-black uppercase tracking-widest">{userAddress}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="h-10 px-5 rounded-full bg-white border border-stone-200 text-stone-900 font-black text-[9px] uppercase tracking-widest hover:border-[#ff4fa3] hover:text-[#ff4fa3] transition-all flex items-center gap-2">Change <ArrowRight size={12} /></button>
                            </div>
                        </motion.div>
                    ) : (
                         <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-center text-stone-900">
                                        <Store size={22} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[15px] font-bold text-stone-900">02 Stores Available</h4>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">DLF MALL OF INDIA • 1.2 KM AWAY</p>
                                    </div>
                                </div>
                                <button className="h-10 px-6 rounded-full bg-stone-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#ff3b8f] transition-all">Select Store</button>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const GenuineSeal = () => (
    <div className="flex flex-col items-center gap-4 group">
        <div className="relative w-24 h-24">
             <div className="absolute inset-0 bg-stone-50 rounded-full border border-stone-100 scale-110 group-hover:scale-125 transition-transform duration-700" />
             <div className="absolute inset-0 bg-sky-100 rounded-[4px] opacity-40" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />
             <div className="absolute inset-2 bg-white rounded-[4px] flex items-center justify-center shadow-sm">
                 <div className="bg-stone-900 text-white text-[8px] font-black px-2 py-1 rotate-[-25deg] shadow-lg flex items-center gap-1 border-2 border-white uppercase tracking-widest">
                    ORIGINAL
                 </div>
             </div>
        </div>
        <span className="text-stone-400 font-black text-[10px] uppercase tracking-[0.3em] text-center leading-relaxed group-hover:text-stone-900 transition-colors">Genuine<br/>Piece</span>
    </div>
);

const QualitySeal = () => (
    <div className="flex flex-col items-center gap-4 group">
        <div className="relative w-24 h-24">
             <div className="absolute inset-0 bg-stone-50 rounded-full border border-stone-100 scale-110 group-hover:scale-125 transition-transform duration-700" />
             <div className="absolute inset-0 bg-sky-200/30 rounded-[4px]" style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'}} />
             <div className="absolute inset-1 bg-white rounded-[4px] flex items-center justify-center shadow-sm">
                 <div className="text-[#ff4fa3] scale-110">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                 </div>
             </div>
        </div>
        <span className="text-stone-400 font-black text-[10px] uppercase tracking-[0.3em] text-center leading-relaxed group-hover:text-stone-900 transition-colors">Quality<br/>Assured</span>
    </div>
);

const RelatedProductCard = ({ product, onClick }) => {
    const mrp = Number(product.price);
    const salePrice = product.discountPrice ? Number(product.discountPrice) : mrp;
    
    return (
        <button 
            onClick={onClick}
            className="group flex flex-col text-left space-y-4 min-w-[200px] flex-1"
        >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-[#ff4fa3]/10 relative">
                <img 
                    src={getMediaUrl(product.image)} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1.5 px-1">
                <span className="text-[8px] font-black text-[#ff4fa3] uppercase tracking-[0.4em] opacity-80">{product.brand || "Selection"}</span>
                <p className="text-[11px] font-[1000] text-stone-900 uppercase tracking-tight leading-tight line-clamp-2">{product.name}</p>
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black text-stone-950">₹{salePrice.toLocaleString()}</span>
                    {salePrice < mrp && (
                        <span className="text-[9px] font-black text-stone-300 line-through tracking-wider">₹{mrp.toLocaleString()}</span>
                    )}
                </div>
            </div>
        </button>
    );
};

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

export default function RitualDetailPage({ addToCart, wishlist, toggleWishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCoupons } = useProducts();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const otherProducts = useMemo(() => {
    if (!origin?.customProducts || !product) return [];
    return origin.customProducts.filter(p => String(p.id) !== String(product.id)).slice(0, 4);
  }, [origin, product]);

   const [openAccordions, setOpenAccordions] = useState({ 
    description: true, 
    usage: false, 
    benefits: false, 
    ingredients: false, 
    info: false 
  });

  useEffect(() => {
    const fetchRitualData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/homepage`);
        const d = await res.json();
        
        if (d.success && d.data?.sections) {
          // Find the shop-by-origin section
          const originSection = d.data.sections.find(s => s.componentId === "shop-by-origin");
          if (originSection?.settings?.origins) {
             let foundProduct = null;
             let foundOrigin = null;

             for (const o of originSection.settings.origins) {
                const p = (o.customProducts || []).find(cp => String(cp.id) === String(id));
                if (p) {
                   foundProduct = p;
                   foundOrigin = o;
                   break;
                }
             }

             if (foundProduct) {
                setProduct(foundProduct);
                setOrigin(foundOrigin);
                setActiveImage(foundProduct.image);
             }
          }
        }
      } catch (err) {
        console.error("Critical failure in ritual retrieval protocol:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRitualData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white gap-4">
        <div className="h-10 w-10 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Synching Ritual Identity...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <Package className="h-16 w-16 text-stone-100 mb-6" />
        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-2">Registry Entity Not Found</h2>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-8">This ritual drop has either expired or been decommissioned.</p>
        <button 
          onClick={() => navigate('/')}
          className="h-14 px-10 rounded-full bg-stone-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24">

      <main className="max-w-[1440px] mx-auto pt-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Visual Architecture (Sticky) */}
          <div className="lg:sticky lg:top-32 h-fit space-y-8 animate-in slide-in-from-left-6 duration-1000">
            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl shadow-stone-200 border border-white p-4 bg-white/50 backdrop-blur-sm group">
              <img 
                src={getMediaUrl(activeImage)} 
                alt={product.name}
                className="w-full h-full object-cover rounded-[1rem] group-hover:scale-105 transition-transform duration-[2s]"
              />
              
            </div>

            {product.imageUrls?.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {[product.image, ...product.imageUrls].map((url, i) => (
                   <button 
                     key={i} 
                     onClick={() => setActiveImage(url)}
                     className={`aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 bg-white ${activeImage === url ? "border-stone-900 shadow-lg scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                   >
                      <img src={getMediaUrl(url)} className="w-full h-full object-cover rounded-lg" />
                   </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Editorial Journey */}
          <div className="flex flex-col animate-in slide-in-from-right-6 duration-1000 delay-200">
            <div className="space-y-12">
               
               {/* Identity Section */}
               <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <Badge className="bg-[#ff4fa3]/10 text-[#ff4fa3] px-5 py-2 rounded-full text-[9px] font-[1000] uppercase tracking-[0.25em] border-none shadow-sm shadow-[#ff4fa3]/5">
                      {product.brand || "Exclusive Origin Drop"}
                    </Badge>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.1] uppercase">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-6 pt-2 pb-8 border-b border-stone-100">
                    {(() => {
                      const mrp = Number(product.price);
                      const salePrice = product.discountPrice ? Number(product.discountPrice) : mrp;
                      const hasDiscount = salePrice < mrp;

                      return (
                        <>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black text-stone-950 tracking-[-0.05em] leading-none">
                                <span className="text-xl font-bold text-stone-300 mr-1.5 align-top mt-1 inline-block">₹</span>
                                {salePrice.toLocaleString()}
                              </span>
                              
                              {hasDiscount && (
                                <div className="flex items-center gap-2 mb-1.5 h-6">
                                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest line-through opacity-50">₹{mrp.toLocaleString()}</span>
                                  <span className="bg-[#ff4fa3] text-white px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-tighter shadow-sm shadow-[#ff4fa3]/20">-{Math.round(((mrp - salePrice) / mrp) * 100)}%</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                               <div className="flex items-center gap-2">
                                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Optimal Drop Price</span>
                               </div>
                               <div className="h-3 w-px bg-stone-100" />
                               <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em]">Available Batch</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
               </div>

               {/* Interaction Zone: Quantity & Acquire */}
               <div className="flex items-center gap-4 mb-14">
                    <div className="flex items-center h-16 bg-stone-50 rounded-[12px] px-4 border border-stone-100 transition-all focus-within:border-[#ff4fa3]/30 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-[#ff4fa3]/5">
                        <button 
                            onClick={() => setQty(Math.max(1, qty - 1))} 
                            className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white rounded-lg transition-all active:scale-90"
                        >
                            <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-12 text-center font-black text-stone-900 text-[15px] tabular-nums">{qty}</span>
                        <button 
                            onClick={() => setQty(qty + 1)} 
                            className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white rounded-lg transition-all active:scale-90"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => {
                            for(let i=0; i<qty; i++) addToCart(product);
                            toast.success(`Allocated ${qty} piece(s) to bag`);
                        }}
                        className="flex-1 h-16 font-black text-[11px] uppercase tracking-[0.3em] rounded-[12px] bg-stone-950 text-white shadow-xl shadow-stone-900/10 transition-all flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#ff4fa3]/10 active:scale-[0.98]"
                    >
                        <ShoppingBag size={20} strokeWidth={2.5} />
                        Add to Cart
                    </button>
                </div>

                {/* Eligible Coupons */}
                {apiCoupons && apiCoupons.length > 0 && (
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                        {apiCoupons.slice(0, 2).map((coupon) => (
                            <OfferCouponCard 
                                key={coupon.id}
                                title={`${coupon.discountType === "PERCENTAGE" ? "GET " + coupon.discountValue + "% OFF" : "FLAT Rs. " + coupon.discountValue + " OFF"}`} 
                                sub={coupon.minPurchase > 0 ? `On orders above Rs. ${coupon.minPurchase}` : "Exclusive Ritual Discount"} 
                                code={coupon.code} 
                            />
                        ))}
                    </div>
                )}

                <DeliverySection />
 
                {/* Product Intelligence Accordions - Refined Minimalist Style */}
                <div className="mt-4 border-t border-stone-100">
                    <AccordionItem 
                        title="Description" 
                        isOpen={openAccordions.description} 
                        onClick={() => setOpenAccordions(p => ({...p, description: !p.description}))}
                    >
                        {product.description || "Experimental narrative pending..."}
                    </AccordionItem>

                    {(product.usage || product.protocol) && (
                        <AccordionItem 
                            title="How to Use" 
                            isOpen={openAccordions.usage} 
                            onClick={() => setOpenAccordions(p => ({...p, usage: !p.usage}))}
                        >
                            {product.usage || product.protocol}
                        </AccordionItem>
                    )}

                    {(product.benefits) && (
                        <AccordionItem 
                            title="Benefits" 
                            isOpen={openAccordions.benefits} 
                            onClick={() => setOpenAccordions(p => ({...p, benefits: !p.benefits}))}
                        >
                            {product.benefits}
                        </AccordionItem>
                    )}

                    {(product.ingredients) && (
                        <AccordionItem 
                            title="Ingredients" 
                            isOpen={openAccordions.ingredients} 
                            onClick={() => setOpenAccordions(p => ({...p, ingredients: !p.ingredients}))}
                        >
                            {product.ingredients}
                        </AccordionItem>
                    )}

                    {(product.info || product.additionalInfo) && (
                        <AccordionItem 
                            title="Info" 
                            isOpen={openAccordions.info} 
                            onClick={() => setOpenAccordions(p => ({...p, info: !p.info}))}
                        >
                            {product.info || product.additionalInfo}
                        </AccordionItem>
                    )}
                </div>



            </div>
          </div>

        </div>

        {/* Related Rituals Discovery */}
        {otherProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-stone-100">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <div className="h-0.5 w-8 bg-[#ff4fa3]" />
                      <span className="text-[9px] font-black text-[#ff4fa3] uppercase tracking-[0.4em]">Collection Discovery</span>
                   </div>
                   <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter">More from {origin?.name}</h3>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] hover:text-[#ff4fa3] transition-colors pb-1 border-b-2 border-transparent hover:border-[#ff4fa3]"
                >
                  Explore All Rituals
                </button>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {otherProducts.map(p => (
                  <RelatedProductCard 
                    key={p.id} 
                    product={p} 
                    onClick={() => {
                      navigate(`/ritual/${p.id}`);
                      window.scrollTo(0, 0);
                    }}
                  />
                ))}
             </div>
          </div>
        )}

        {/* Global Ritual Footer Reveal */}
        <div className="mt-16 py-20 border-t border-stone-100 text-center space-y-8">
           <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-stone-100 bg-white">
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.4em]">PART OF THE</span>
              <span className="text-[9px] font-black text-stone-900 uppercase tracking-[0.4em]">{origin?.title}</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-stone-950 tracking-tighter uppercase leading-none">Continue the {origin?.name} Journey</h2>
           <button 
             onClick={() => navigate('/')}
             className="inline-flex items-center gap-4 text-stone-400 hover:text-stone-900 transition-colors group"
           >
              <span className="text-[11px] font-black uppercase tracking-[0.3rem]">View Selection</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </main>
    </div>
  );
}
