import React, { useState, useMemo, useEffect } from "react";
import {
  Bell,
  Clock,
  Info,
  Share2,
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default React.memo(function UpcomingDrops({ onNavigate, title, products = [] }) {
  const { user } = useAuth();
  const [notifyProduct, setNotifyProduct] = useState(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem("stone_reminders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("stone_reminders", JSON.stringify(reminders));
  }, [reminders]);

  const processedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const formatLaunchDate = (dateStr) => {
      if (!dateStr || dateStr === "Coming Soon") return "Coming Soon";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date).toUpperCase();
      } catch (e) {
        return dateStr;
      }
    };

    const seen = new Set();
    return products
      .filter((p) => {
        const key = p.name?.toLowerCase().replace(/[^a-z0-9]/g, "").trim() || p.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description && p.description.toLowerCase() !== p.name.toLowerCase() ? p.description : "",
        image: p.imageUrl || "",
        price: Number(p.price || 0),
        originalPrice: Number(p.originalPrice || p.price || 0),
        reminders: Math.floor(Math.random() * 200) + 50,
        progress: Math.floor(Math.random() * 80) + 10,
        launchDate: formatLaunchDate(p.launchDate || "Coming Soon"),
      }));
  }, [products]);

  const handleRemindClick = (product) => {
    if (reminders.includes(product.id)) {
      toast.info(`You've already set a reminder for ${product.name}!`, {
        description: "We'll let you know as soon as it drops.",
        icon: <Bell size={16} className="text-stone-900" />,
      });
      return;
    }

    if (user) {
      toast.success(`Success! We'll remind you when ${product.name} drops.`);
      setReminders(prev => [...prev, product.id]);
    } else {
      setNotifyProduct(product);
      setEmail("");
    }
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (notifyProduct && reminders.includes(notifyProduct.id)) {
      toast.info("Reminder already set for this email!");
      setNotifyProduct(null);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Registered! Notification sent to ${email}`);
      if (notifyProduct) {
        setReminders(prev => [...prev, notifyProduct.id]);
      }
      setIsSubmitting(false);
      setNotifyProduct(null);
    }, 800);
  };

  if (processedProducts.length === 0) return null;

  return (
    <>
    <section className="section pt-16 pb-12 px-4 bg-stone-50 relative overflow-hidden">
      {/* Background Decor - Industrial Studio Feel */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-[150px] z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-50/20 rounded-full blur-[120px] z-0" />

      <div className="w-full px-4 md:px-12 lg:px-20 relative z-10">
        {/* Header Title */}
        <div className="mb-12 px-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-pink-400" size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
              Limited Release
            </span>
          </div>
          <h2 className="text-4xl font-semibold text-[#151515] tracking-tight leading-tight uppercase">
            {title ? title.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]"> {word} </span> : word + ' ') : (
              <>Upcoming <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b36cff] to-[#ff5db1]">Drops</span></>
            )}
          </h2>
        </div>

        {/* Product Section - Animated Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="product-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="contents"
            >
              {processedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                  className="flex flex-col h-full"
                >
                  {/* --- COMPACT CARD LAYOUT --- */}
                  <div 
                    onClick={() => onNavigate?.(product.id)}
                    className="flex flex-col h-full bg-white rounded-[2px] shadow-sm border border-stone-200 hover:shadow-md transition-all duration-500 group relative overflow-hidden layer-isolate cursor-pointer"
                  >
                    
                    <div className="relative aspect-4/5 w-full overflow-hidden bg-stone-50 border-b border-stone-100">
                      <div className="absolute inset-0 bg-linear-to-t from-stone-900/5 to-transparent pointer-events-none z-10" />
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 optimize-gpu"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100/50">
                           <Sparkles size={24} className="text-stone-300 opacity-50" />
                        </div>
                      )}

                      {/* Small Minimalist Badge */}
                      <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-[1px] border border-stone-100 shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrendingUp size={10} className="text-pink-500" />
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col relative z-20">
                      <h3 className="text-[15px] font-black text-stone-900 leading-tight mb-1.5 uppercase tracking-tight line-clamp-1 group-hover:text-pink-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-stone-400 font-medium mb-4 line-clamp-1 uppercase tracking-wider">
                        {product.description}
                      </p>

                      {/* Launch Schedule Info */}
                      <div className="mb-5 pt-1 flex items-start gap-2.5">
                        <div className="p-2 bg-stone-50 rounded-[4px] border border-stone-100 shrink-0">
                          <Clock size={14} className="text-[#151515]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1.5">
                            Launch Schedule
                          </span>
                          <span className="text-[13px] font-black text-stone-900 uppercase tracking-tight leading-none group-hover:text-pink-500 transition-colors">
                            {product.launchDate}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-stone-50 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-stone-300 line-through leading-none mb-1 tracking-tight">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-[18px] font-black text-[#151515] leading-none tracking-tighter">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!reminders.includes(product.id)) handleRemindClick(product);
                          }}
                          disabled={reminders.includes(product.id)}
                          className={`flex-1 h-10 rounded-[2px] text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-xl flex items-center justify-center gap-2.5 px-4 group/btn ${
                            reminders.includes(product.id) 
                              ? "bg-stone-100 text-stone-400 cursor-not-allowed shadow-none border border-stone-200" 
                              : "bg-stone-900 text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          <Bell size={12} className={reminders.includes(product.id) ? "" : "group-hover/btn:animate-bounce"} />
                          <span>{reminders.includes(product.id) ? "Reminder Set" : "Remind Me"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {processedProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2px] border-2 border-dashed border-pink-100 flex flex-col items-center gap-4">
            <Clock size={48} className="text-pink-100" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
              No upcoming drops scheduled
            </p>
          </div>
        )}
      </div>
    </section>

    {/* --- NOTIFY POPUP --- */}
    <Dialog open={!!notifyProduct} onOpenChange={(open) => !open && setNotifyProduct(null)}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-stone-200 shadow-2xl rounded-[2px] bg-white">
        <div className="h-1.5 w-full bg-linear-to-r from-pink-500 to-purple-500" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Mail className="text-pink-500" size={24} />
            </div>
            <DialogTitle className="text-xl font-black text-center text-stone-900 uppercase tracking-tight">
              Get Notified
            </DialogTitle>
            <DialogDescription className="text-center text-stone-500 text-[13px] font-medium leading-relaxed">
              We'll send you an exclusive link the moment 
              <span className="text-stone-900 font-bold"> {notifyProduct?.name} </span> 
              is available for purchase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNotifySubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 border-stone-100 bg-stone-50 rounded-[2px] text-sm focus-visible:ring-stone-600 focus-visible:ring-offset-0 focus-visible:border-stone-400 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-stone-900 hover:bg-black text-white rounded-[2px] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Notify Me"}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            No Spam. Just early access.
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
});
