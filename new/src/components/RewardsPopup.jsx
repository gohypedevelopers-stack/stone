import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Crown, 
  Coins, 
  Gift, 
  ChevronRight, 
  HandHeart, 
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Plus,
  Zap
} from "lucide-react";

const VIP_TIERS = [
  { name: "Bronze", minPoints: 0, nextTier: "Silver", color: "text-amber-700", bg: "bg-amber-50" },
  { name: "Silver", minPoints: 500, nextTier: "Gold", color: "text-stone-400", bg: "bg-stone-50" },
  { name: "Gold", minPoints: 1000, nextTier: "Platinum", color: "text-yellow-600", bg: "bg-yellow-50" },
];

const EARN_ACTIONS = [
  { title: "Place an order", reward: "1 pt per ₹1", icon: <Gift className="text-pink-500" size={14} /> },
  { title: "Follow on Instagram", reward: "50 pts", icon: <UserPlus className="text-blue-500" size={14} /> },
  { title: "Sign up for newsletter", reward: "100 pts", icon: <Zap className="text-yellow-500" size={14} /> },
];

const REDEEM_OPTIONS = [
  { title: "₹50 Discount", cost: 500, icon: <Gift className="text-pink-500" size={14} /> },
  { title: "Free Shipping", cost: 300, icon: <Zap className="text-emerald-500" size={14} /> },
  { title: "₹100 Discount", cost: 1000, icon: <Crown className="text-amber-500" size={14} /> },
];

const RewardsPopup = ({ isOpen, onClose, user, onNavigate, onSignOut }) => {
  const [view, setView] = useState("main"); // main, vip, earn, redeem

  if (!isOpen) return null;

  const currentTier = VIP_TIERS[1]; // Hardcoded for demo parity

  const renderContent = () => {
    switch (view) {
      case "vip":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className={`p-5 rounded-[24px] ${currentTier.bg} border border-stone-100 text-center relative overflow-hidden`}>
              <div className="absolute top-4 right-4"><Crown className={currentTier.color} size={20}/></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current Tier</p>
              <h3 className={`text-2xl font-black ${currentTier.color} italic mb-1`}>{currentTier.name}</h3>
              <p className="text-stone-500 text-[11px] font-bold">500 total points earned</p>
            </div>
            
            <div className="bg-white border border-stone-100 rounded-[20px] p-4 space-y-3">
              <h4 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Next Tier: {currentTier.nextTier}</h4>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#ff4fa3] w-2/3" />
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Earn 500 more points to reach {currentTier.nextTier}</p>
            </div>

            <div className="space-y-2">
               <h4 className="text-[11px] font-black uppercase text-stone-400 tracking-wider pl-1">Benefits</h4>
               {[ "5% Cashback", "Early access to drops", "Birthday Rewards" ].map((benefit, i) => (
                 <div key={i} className="flex items-center gap-2 bg-stone-50/50 p-2.5 rounded-xl border border-stone-50">
                    <CheckCircle2 size={14} className="text-[#ff4fa3]" />
                    <span className="text-[11px] font-extrabold text-stone-700">{benefit}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        );
      case "earn":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {EARN_ACTIONS.map((action, i) => (
              <div key={i} className="bg-white border border-stone-100 rounded-[20px] p-4 flex items-center justify-between hover:border-pink-100 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {action.icon}
                   </div>
                   <div>
                      <h4 className="text-[12px] font-black text-stone-800 leading-tight">{action.title}</h4>
                      <p className="text-[10px] font-bold text-[#ff4fa3] uppercase tracking-tight">{action.reward}</p>
                   </div>
                </div>
                <ChevronRight size={14} className="text-stone-300" />
              </div>
            ))}
          </motion.div>
        );
      case "redeem":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {REDEEM_OPTIONS.map((opt, i) => {
              const isDisabled = (user?.rewardPoints || 0) < opt.cost;
              return (
                <div key={i} className="bg-white border border-stone-100 rounded-[20px] p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center">
                        {isDisabled ? <Lock size={14} className="text-stone-300" /> : opt.icon}
                     </div>
                     <div>
                        <h4 className="text-[12px] font-black text-stone-800 leading-tight">{opt.title}</h4>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">{opt.cost} Points</p>
                     </div>
                  </div>
                  <button 
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      isDisabled 
                      ? "bg-stone-50 text-stone-300 cursor-not-allowed" 
                      : "bg-[#ff4fa3] text-white shadow-sm hover:scale-105 active:scale-95"
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              );
            })}
          </motion.div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2.5"
          >
            {/* Join And Earn Rewards Hero - Minimalist */}
            {!user ? (
              <div className="bg-white border border-stone-50 rounded-[20px] p-4 text-center shadow-[0_4px_200px_rgba(0,0,0,0.02)]">
                <h3 className="text-base font-black text-stone-900 mb-1">Join OMW Rewards</h3>
                <p className="text-stone-500 text-[12px] font-medium mb-3 leading-relaxed line-clamp-2">
                  Earn Glow Points and redeem for discounts!
                </p>
                <button
                  onClick={() => onNavigate("auth")}
                  className="w-full py-3 bg-[#ff4fa3] text-white font-black rounded-xl shadow-[0_6px_15px_rgba(255,79,163,0.25)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                >
                  Sign Up For Points
                </button>
                <p className="mt-3 text-[11px] text-stone-400 font-bold uppercase tracking-tight">
                  Already a member?{" "}
                  <button onClick={() => onNavigate("auth")} className="text-[#ff4fa3] underline">
                    Sign in
                  </button>
                </p>
              </div>
            ) : (
              <div className="bg-white border border-stone-50 rounded-[20px] p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[#ff4fa3]" />
                <div className="flex justify-between items-start mb-2">
                   <div className="text-left">
                      <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Your Rewards</p>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-black text-stone-900 leading-none">₹{(user.rewardPoints || 0).toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                      <Coins className="text-[#ff4fa3]" size={16} />
                   </div>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-3">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "65%" }}
                     className="h-full bg-[#ff4fa3]"
                   />
                </div>
                <p className="mt-2 text-[8px] text-stone-400 font-bold uppercase tracking-wider text-left">
                   150 pts away from ₹500 off
                </p>
              </div>
            )}

            {/* Menu Items List - Ultra Compact */}
            <div className="bg-white border border-stone-100/50 rounded-[20px] overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              <MenuLink
                icon={<Crown size={15} className="text-[#ff4fa3]" />}
                title="VIP Program"
                onClick={() => setView("vip")}
              />
              <MenuLink
                icon={<HandHeart size={15} className="text-[#ff4fa3]" />}
                title="Ways To Earn"
                onClick={() => setView("earn")}
              />
              <MenuLink
                icon={<Gift size={15} className="text-[#ff4fa3]" />}
                title="Ways To Redeem"
                onClick={() => setView("redeem")}
              />
            </div>

            {/* Interaction Card (Referral) - Mini */}
            <div className="bg-stone-50/30 border border-stone-100/50 rounded-[20px] p-4 text-center">
              <h3 className="text-[13px] font-black text-stone-900 mb-1 leading-none">
                Referral Program
              </h3>
              <p className="text-stone-400 text-[9px] font-bold uppercase tracking-tight mb-2.5">
                Get ₹100 for every friend.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-white p-2 rounded-lg border border-stone-100 shadow-xs text-left">
                   <p className="text-[7px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-0.5">Friends get</p>
                   <p className="text-[10px] font-black text-stone-800">₹100 Off</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-stone-100 shadow-xs text-left">
                   <p className="text-[7px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-0.5">You get</p>
                   <p className="text-[10px] font-black text-stone-800">₹100 Off</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-[160px] left-6 w-[320px] max-h-[75vh] bg-white rounded-[24px] shadow-[0_32px_120px_rgba(255,79,163,0.15)] flex flex-col overflow-hidden z-[100] border border-stone-100/50"
    >
      {/* Ultra Compact Header Section */}
      <div className="relative h-[60px] bg-[#ff4fa3] flex items-center px-6 overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        {view !== "main" && (
           <button 
             onClick={() => setView("main")}
             className="mr-3 p-1 hover:bg-white/10 rounded-full text-white transition-colors relative z-20"
           >
              <ArrowLeft size={16} />
           </button>
        )}

        <h2 className="text-white text-base font-black italic tracking-tighter relative z-10">
          {view === "main" ? "Welcome to OMW" : view === "vip" ? "VIP Tiers" : view === "earn" ? "Ways To Earn" : "Ways To Redeem"}
        </h2>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 p-1 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-20"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5">
        <AnimatePresence mode="wait">
           {renderContent()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const MenuLink = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-2 pl-2 pr-4 hover:bg-stone-50 transition-colors group"
  >
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 flex items-center justify-start transition-transform duration-200">
        {icon}
      </div>
      <span className="font-extrabold text-stone-800 text-[11.5px] tracking-tight">{title}</span>
    </div>
    <div className="flex items-center gap-0.5">
      {subtitle && <span className="text-[7px] font-bold text-stone-300 uppercase tracking-widest">{subtitle}</span>}
      <ChevronRight size={10} className="text-stone-300 group-hover:text-[#ff4fa3] group-hover:translate-x-0.5 transition-all" />
    </div>
  </button>
);

export default RewardsPopup;

