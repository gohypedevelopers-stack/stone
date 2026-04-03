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
import { toast } from "sonner";

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
        const res = await fetch(`http://localhost:5000/api/auth/profile?customerId=${user.id}`);
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
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Premium Header Section */}
      <div className="bg-white border-b border-stone-100 pt-16 pb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-amber-50/50 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-linear-to-tr from-pink-50/30 to-transparent rounded-[2px] blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-[2px] border border-amber-100/50 shadow-sm transition-transform hover:scale-105 cursor-default">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Loyalty Member</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-tight tracking-tight">
                Your <span className="text-amber-500">Rewards</span> <br className="hidden md:block" /> Experience
              </h1>
              <p className="text-stone-500 text-base font-medium max-w-sm">
                Earning on every glow-up. Use your points for exclusive discounts and early access.
              </p>
            </div>

            {/* Floating Points Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-500 rounded-[2px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="bg-stone-900 text-white p-8 rounded-[2px] shadow-xl relative border border-white/5 min-w-[280px] transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-2.5 bg-white/5 rounded-[2px]">
                    <Coins className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Total Balance</p>
                    <div className="text-4xl font-bold flex items-end justify-end gap-1">
                      {balance}
                      <span className="text-base text-amber-400 mb-1 font-medium">pts</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-stone-400">Next Milestone</span>
                    <span className="text-amber-400">{nextMilestone} pts</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-[2px] overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-amber-600 to-amber-400 rounded-[2px] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-stone-500 font-medium">
                    *points are calculated based on your current tier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 pb-24 relative z-20">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-amber-500" /> Activity History
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white border border-stone-100 rounded-[2px] p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-stone-50 rounded-[2px] flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-stone-200" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">No activity recorded yet</h3>
              <p className="text-stone-400 max-w-xs mx-auto text-xs leading-relaxed font-medium">
                Points will appear here once you make your first online or in-store purchase.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {transactions.map((tx, idx) => {
                const details = getTransactionDetails(tx);
                const isExpanded = expandedTxId === tx.id;

                return (
                  <div 
                    key={tx.id} 
                    className={`group bg-white border rounded-[2px] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      isExpanded ? 'border-amber-200 ring-4 ring-amber-50/50' : 'border-stone-50 hover:border-amber-100 shadow-xs'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-[2px] flex items-center justify-center transition-colors ${
                          tx.type === 'EARNED' ? 'bg-emerald-50 text-emerald-600' : 
                          tx.type === 'REDEEMED' ? 'bg-stone-50 text-stone-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {tx.type === 'EARNED' ? <ArrowUpRight className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-stone-900 text-sm">
                              {tx.type === 'EARNED' ? 'Points Earned' : 'Points Redeemed'}
                            </p>
                            <span className="text-[9px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-[2px] font-bold uppercase tracking-wider">{tx.source}</span>
                          </div>
                          <p className="text-stone-500 text-[11px] font-medium mt-0.5">{tx.note || "Loyalty rewards adjustment"}</p>
                          <p className="text-[10px] text-stone-300 font-bold mt-1 uppercase tracking-tighter">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            tx.type === 'EARNED' ? 'text-emerald-600' : 'text-stone-900'
                          }`}>
                            {tx.type === 'EARNED' ? '+' : '-'}{tx.points}
                          </p>
                          <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Points</p>
                        </div>
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronRight className={`h-4 w-4 text-stone-300 group-hover:text-amber-500 ${isExpanded ? 'text-amber-500' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="px-14 pb-5 pt-1 bg-stone-50/30 border-t border-stone-50 animate-in slide-in-from-top-2">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100/50">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Purchased Items</span>
                            {details?.vendor && (
                              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-[2px]">Store: {details.vendor}</span>
                            )}
                          </div>
                          
                          {details?.items ? (
                            <div className="space-y-2">
                              {details.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-[2px] border border-stone-100/50 shadow-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-stone-50 rounded-[2px] flex items-center justify-center border border-stone-100">
                                      {item.product?.imageUrls?.[0] ? (
                                        <img src={item.product.imageUrls[0]} alt="" className="h-full w-full object-cover rounded-[2px]" />
                                      ) : (
                                        <Star className="h-3 w-3 text-stone-300" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[12px] font-bold text-stone-800">{item.name}</p>
                                      <p className="text-[10px] text-stone-400 font-medium">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <p className="text-[12px] font-bold text-stone-900">₹{item.unitPrice}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center border-2 border-dashed border-stone-100 rounded-[2px]">
                              <p className="text-[11px] font-medium text-stone-400">Detailed item list for historical purchases is unavailable.</p>
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
      </div>
    </div>
  );
}
