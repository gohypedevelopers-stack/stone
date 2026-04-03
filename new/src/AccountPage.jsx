import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Package, MapPin, Store, Calendar, CreditCard } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black text-stone-900 mb-2">Sign In Required</h2>
        <p className="text-stone-500">Please sign in to view your account and orders.</p>
      </div>
    );
  }

  const onlineOrders = profile?.orders || [];
  const offlineOrders = profile?.offlinePurchases || [];

  // Combine and sort by date descending
  const allOrders = [
    ...onlineOrders.map(o => ({ ...o, type: o.type || 'Online', date: new Date(o.createdAt) })),
    ...offlineOrders.map(o => ({ ...o, type: 'Offline', date: new Date(o.purchaseDate) }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500 min-h-[70vh]">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-black">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter">{user.name}</h1>
          <p className="text-stone-500 font-medium">{user.mobile} {user.email && `• ${user.email}`}</p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-emerald-500" /> My Orders & Purchase History
        </h2>

        {allOrders.length === 0 ? (
           <div className="bg-stone-50 border border-stone-100 rounded-[2rem] p-12 text-center">
             <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
               <Package className="h-8 w-8 text-stone-300" />
             </div>
             <h3 className="text-lg font-bold text-stone-900">No orders yet</h3>
             <p className="text-stone-500">When you buy online or in-store, your receipts will appear here.</p>
           </div>
        ) : (
          <div className="grid gap-6">
            {allOrders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:shadow-md transition-shadow">
                
                {/* Order Meta */}
                <div className="md:w-1/3 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    {order.type === 'Online' ? (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">Online Order</span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <Store className="h-3 w-3" /> In-Store POS
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order Reference</p>
                    <p className="font-black text-stone-900">{order.type === 'Online' ? order.orderNumber : `OFF-${order.id.slice(0,8).toUpperCase()}`}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Calendar className="h-4 w-4" />
                    {order.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>

                  {order.type === 'Offline' && order.vendor && (
                    <div className="flex items-start gap-2 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">
                      <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-stone-800 text-xs">{order.vendor.businessName}</p>
                        <p className="text-[10px]">{order.vendor.storeAddress}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content: Items */}
                <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-stone-100 pt-6 md:pt-0 md:pl-8 flex flex-col">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Items Purchased</h4>
                  <div className="space-y-3 flex-1">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-stone-800">
                          {item.quantity}x <span className="font-medium">{item.name || item.product?.name}</span>
                        </span>
                        <span className="font-bold text-stone-500">&#8377;{Number(item.lineTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 mt-6 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-black uppercase tracking-widest text-stone-900 text-sm">Total Paid</span>
                    <span className="font-black text-xl text-emerald-600">&#8377;{Number(order.totalAmount || order.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
