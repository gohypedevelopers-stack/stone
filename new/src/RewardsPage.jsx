import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy, 
  Star, 
  Gift, 
  History, 
  ArrowUpRight, 
  Coins, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { resolveImage } from "@/utils/urlHelper";
import { toast } from "sonner";
import { API_URL } from "@/utils/api";

export default function RewardsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTxId, setExpandedTxId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/profile?customerId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error("Failed to load rewards", err);
        toast.error("Could not load rewards history");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-[2px] animate-spin"></div>
          <p className="text-stone-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50/50 px-6 text-center">
        <div className="w-20 h-20 bg-white rounded-[2px] shadow-sm border border-stone-100 flex items-center justify-center mb-6">
          <Award className="h-10 w-10 text-stone-200" />
        </div>
        <h2 className="text-3xl font-black text-stone-900 mb-2 tracking-tighter">Join the OMW Club</h2>
        <p className="text-stone-500 max-w-md font-medium text-balance">Sign in to start earning points on every purchase and unlock exclusive skincare rewards.</p>
      </div>
    );
  }

  const balance = profile?.rewardPoints || 0;
  const transactions = profile?.rewardTransactions || [];
  
  // Calculate next milestone (e.g., every 500 points)
  const nextMilestone = Math.ceil((balance + 1) / 500) * 500;
  const progress = (balance / nextMilestone) * 100;

  const getTransactionDetails = (tx) => {
    if (!tx.sourceId) return null;
    
    // Check Online Orders
    const order = profile.orders?.find(o => o.id === tx.sourceId);
    if (order) return { items: order.items, type: 'Online', vendor: order.vendor?.businessName };

    // Check Offline Purchases
    const offline = profile.offlinePurchases?.find(p => p.id === tx.sourceId);
    if (offline) return { items: offline.items, type: 'Offline', vendor: offline.vendor?.businessName };

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header Section */}
      <div className="bg-stone-50/40 border-b border-stone-100/60 pt-16 pb-20 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-100/40 rounded-full blur-[100px] -ml-32 -mb-32" />
        
        <div className="w-full px-8 md:px-12 lg:px-20 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-stone-200/60 shadow-xs transition-all hover:border-amber-200 cursor-default group">
                <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-amber-600 transition-colors">Loyalty Member</span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-light text-stone-900 leading-[1.1] tracking-tight">
                  Elevate Your <span className="font-semibold italic text-amber-500/90">Glow</span>
                </h1>
                <p className="text-stone-500 text-base md:text-lg font-light leading-relaxed max-w-xl">
                  A refined space for your loyalty journey. Earn points with every choice and unlock exclusive beauty rituals.
                </p>
              </div>

              <div className="flex items-center gap-10 pt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Tier Status</span>
                  <span className="text-sm font-medium text-stone-800">Gold Member</span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Member Since</span>
                  <span className="text-sm font-medium text-stone-800">May 2024</span>
                </div>
              </div>
            </div>

            {/* Premium Light Card */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-8 rounded-[32px] shadow-[0_15px_40px_-12px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden group hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative flex flex-col gap-8">
                  <div className="flex justify-between items-center">
                    <div className="h-12 w-12 bg-stone-50 rounded-xl flex items-center justify-center border border-stone-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors duration-500">
                      <Coins className="h-5 w-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Available Balance</p>
                      <div className="text-4xl font-semibold text-stone-900 tracking-tight">
                        {balance.toLocaleString()}
                        <span className="text-xs font-medium text-stone-400 ml-1.5 uppercase tracking-wide">pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Next Reward</p>
                        <p className="text-sm font-medium text-stone-800">{nextMilestone} Points</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-500/80">{Math.round(progress)}% Complete</span>
                    </div>
                    
                    <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-400/80 to-amber-300/60 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 pt-0.5 text-stone-400">
                      <TrendingUp className="h-3 w-3" />
                      <p className="text-[9px] font-medium italic">
                        Spend ₹{(nextMilestone - balance) * 10} more to unlock your next gift
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="w-full px-8 md:px-12 lg:px-20 -mt-8 pb-24 relative z-20">
        <div className="bg-white rounded-[32px] border border-stone-100 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-8 border-b border-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <History className="h-5 w-5 text-amber-500/80" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900 tracking-tight">Activity History</h2>
                <p className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">Member Insights • All Transactions</p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Award className="h-7 w-7 text-stone-200" />
              </div>
              <h3 className="text-lg text-stone-900 font-medium mb-1">No activity yet</h3>
              <p className="text-stone-400 text-sm max-w-sm mx-auto font-light leading-relaxed">Your rewards and points activity will appear here once you start your journey with us.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {transactions.map((tx, idx) => {
                const details = getTransactionDetails(tx);
                const isExpanded = expandedTxId === tx.id;

                return (
                  <div 
                    key={tx.id} 
                    className={`transition-all duration-300 ${isExpanded ? 'bg-stone-50/50' : 'hover:bg-stone-50/20'}`}
                  >
                    <div 
                      className="p-6 md:p-7 flex items-center justify-between cursor-pointer group"
                      onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs ${
                          tx.type === 'EARNED' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100/50' : 'bg-amber-50 text-amber-500 border border-amber-100/50'
                        }`}>
                          {tx.type === 'EARNED' ? <ArrowUpRight className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-stone-800 text-sm tracking-tight">
                              {tx.type === 'EARNED' ? 'Points Credited' : 'Points Redeemed'}
                            </p>
                            <span className="text-[8px] bg-white border border-stone-100 text-stone-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-xs">
                              {tx.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-stone-400 text-xs font-light">{tx.note || "Loyalty rewards adjustment"}</p>
                            <span className="text-[10px] text-stone-200">•</span>
                            <p className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.1em]">
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className={`text-xl font-semibold tracking-tighter ${
                            tx.type === 'EARNED' ? 'text-emerald-600' : 'text-stone-900'
                          }`}>
                            {tx.type === 'EARNED' ? '+' : '-'}{tx.points}
                          </p>
                          <p className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em]">Points</p>
                        </div>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-amber-50 text-amber-500' : 'text-stone-200 group-hover:text-stone-400'}`}>
                          <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-3">
                        <div className="bg-white rounded-[24px] border border-stone-100 p-6 space-y-5 shadow-xs">
                          <div className="flex items-center justify-between pb-3 border-b border-stone-50">
                            <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em]">Transaction Intelligence</h4>
                            {details?.vendor && (
                              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-amber-600/80 bg-amber-50/50 px-2.5 py-1 rounded-full border border-amber-100/30">
                                <span className="w-1 h-1 rounded-full bg-amber-400" />
                                Store: {details.vendor}
                              </div>
                            )}
                          </div>
                          
                          {details?.items ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {details.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center group/item p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                                  <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 bg-stone-50 rounded-xl overflow-hidden border border-stone-100 flex-shrink-0 shadow-xs">
                                      {item.product?.imageUrls?.[0] ? (
                                        <img src={resolveImage(item.product.imageUrls[0])} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center"><Star className="h-3 w-3 text-stone-200" /></div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[12px] font-medium text-stone-800 leading-tight mb-0.5">{item.name}</p>
                                      <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-stone-900 tracking-tight">₹{item.unitPrice}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-10 text-center border-2 border-dashed border-stone-50 rounded-[24px]">
                              <TrendingUp className="h-7 w-7 text-stone-100 mx-auto mb-2" />
                              <p className="text-xs font-light text-stone-400">Detailed transaction breakdown is currently unavailable.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-stone-100" />
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            Rewards status refreshed in real-time
            <span className="w-10 h-px bg-stone-100" />
          </p>
        </div>
      </div>


    </div>
  );

}
