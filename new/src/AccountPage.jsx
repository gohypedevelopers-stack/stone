import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Package, MapPin, Store, Calendar, CreditCard, ChevronDown, ExternalLink } from "lucide-react";
import { API_URL, getMediaUrl } from "@/utils/api";

export default function AccountPage() {
  const { user } = useAuth();
  const { products: allGlobalProducts } = useProducts();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Helper to find full product info for an order item
  const findProductInfo = (itemName) => {
    if (!allGlobalProducts || !itemName) return null;
    const cleanSearch = itemName.replace(/\(Updated Fix\)/g, "").trim().toLowerCase();
    
    return allGlobalProducts.find(p => {
      const pName = (p.name || "").replace(/\(Updated Fix\)/g, "").trim().toLowerCase();
      const pBrand = (p.brand || "").toLowerCase();
      return pName === cleanSearch || pBrand === cleanSearch;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#ff4fa3] border-t-transparent rounded-full animate-spin"></div>
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
    ...onlineOrders.map(o => ({ ...o, type: 'Online', date: new Date(o.createdAt) })),
    ...offlineOrders.map(o => ({ ...o, type: 'Offline', date: new Date(o.purchaseDate) }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-10 animate-in fade-in duration-500 min-h-[80vh] bg-[#fffcfc]">
      {/* Profile Header - Compacted */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 pb-8 border-b border-stone-100">
        <div className="h-20 w-20 bg-pink-50 text-[#ff4fa3] rounded-full flex items-center justify-center text-3xl font-black shadow-sm ring-1 ring-pink-100 uppercase">
          {user.name.charAt(0)}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter mb-1">{user.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-stone-500 font-bold text-xs">
            <span>{user.mobile}</span>
            {user.email && (
              <>
                <span className="hidden md:inline text-stone-300">•</span>
                <span className="lowercase">{user.email}</span>
              </>
            )}
            <span className="bg-[#1a1a1a] text-white text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Premium Member</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-black text-stone-900 tracking-tight flex items-center gap-2">
            Order History
          </h2>
          <div className="flex gap-2">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest border border-stone-100 px-3 py-1 rounded-md">Past 3 Months</span>
          </div>
        </div>

        {allOrders.length === 0 ? (
           <div className="bg-stone-50 border border-stone-100 rounded-[2rem] p-16 text-center">
             <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Package className="h-8 w-8 text-stone-200" />
             </div>
             <h3 className="text-lg font-black text-stone-900 mb-2">Your box is empty</h3>
             <p className="text-stone-500 max-w-sm mx-auto font-medium text-xs">When you shop online or visit our stores, your receipts and order status will appear here.</p>
           </div>
        ) : (
          <div className="grid gap-6">
            {allOrders.map(order => (
              <div key={order.id} className="border border-stone-200 rounded-[8px] overflow-hidden bg-white shadow-xs group/card hover:shadow-md transition-shadow duration-300">
                
                {/* Amazon-style Gray Header - Tucked yet Legible */}
                <div className="bg-[#f0f2f2] border-b border-stone-200 px-4 md:px-5 py-3 flex flex-wrap gap-x-8 gap-y-2 items-center text-[12px] text-stone-600 font-bold">
                  <div className="flex flex-col gap-0.5 min-w-[100px]">
                    <span className="uppercase tracking-tight opacity-70 text-[10px]">Order Placed</span>
                    <span className="text-stone-800 text-[13px]">{order.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-[80px]">
                    <span className="uppercase tracking-tight opacity-70 text-[10px]">Total</span>
                    <span className="text-stone-800 text-[13px]">₹{Number(order.totalAmount || order.amount).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="uppercase tracking-tight opacity-70 text-[10px]">Ship To</span>
                    <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline transition-all text-[13px]">
                      {user.name} <ChevronDown size={12} strokeWidth={4} />
                    </button>
                  </div>
                  <div className="ml-auto text-right flex flex-col gap-0.5">
                    <span className="uppercase tracking-tight opacity-70 text-[10px]">Order # {order.orderNumber || `OFF-${order.id.slice(0,8).toUpperCase()}`}</span>
                  </div>
                </div>

                {/* Sub-Header / Status Banner - Compacted */}
                <div className="px-5 py-4 bg-white border-b border-stone-50">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-[17px] font-black text-stone-900 leading-none">
                      {order.type === 'Online' ? "Delivered 2 hours ago" : "Purchase Recorded"}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium tracking-tight">
                      {order.type === 'Online' ? "Package was handed to resident" : `In-store purchase at ${order.vendor?.businessName || 'Admin Stock'}`}
                    </p>
                  </div>
                </div>

                {/* Body Content: Line Items - Compacted with better separation */}
                <div className="p-5 space-y-5">
                  {order.items.map((item, idx) => {
                    const itemName = item.name || item.product?.name;
                    const productId = item.productId || item.product?.id || item.id;
                    
                    // Helper to find full product info - prioritized by ID, then fuzzy name
                    const fullProduct = allGlobalProducts?.find(p => p.id === productId) || 
                                       allGlobalProducts?.find(p => {
                                         const cleanSearch = itemName?.replace(/\(Updated Fix\)/g, "").trim().toLowerCase();
                                         const pName = (p.name || "").replace(/\(Updated Fix\)/g, "").trim().toLowerCase();
                                         const pBrand = (p.brand || "").toLowerCase();
                                         return cleanSearch && (pName === cleanSearch || pBrand === cleanSearch || pName.includes(cleanSearch) || cleanSearch.includes(pName));
                                       });

                    const itemImage = item.image || 
                                     item.product?.imageUrls?.[0] || 
                                     item.product?.image || 
                                     item.productImage || 
                                     item.thumbnail || 
                                     item.primaryImage || 
                                     item.product_image || 
                                     fullProduct?.imageUrls?.[0] || 
                                     fullProduct?.image ||
                                     fullProduct?.thumbnail ||
                                     // Fail-safe for generic 'product' or deal-based items
                                     (itemName?.toLowerCase().includes('product') || String(productId).startsWith('deal') ? 
                                       allGlobalProducts?.find(p => p.specialOfferType && p.specialOfferType !== 'None')?.imageUrls?.[0] ||
                                       allGlobalProducts?.find(p => p.name?.toLowerCase().includes('product'))?.imageUrls?.[0] : null);

                    return (
                      <div key={item.id || idx} className={`flex gap-5 items-start group/item ${idx !== order.items.length - 1 ? 'border-b border-stone-100 pb-5' : ''}`}>
                        {/* Product Thumbnail - Strictly Dynamic */}
                        <div className="w-[84px] h-[84px] bg-stone-50 rounded-md overflow-hidden border border-stone-100/50 shrink-0 shadow-xs flex items-center justify-center">
                          {itemImage ? (
                            <img 
                              src={getMediaUrl(itemImage)} 
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" 
                              alt={itemName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-stone-100 flex items-center justify-center"><svg class="w-6 h-6 text-stone-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                              <Package className="w-6 h-6 text-stone-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details - Compacted */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h5 
                              onClick={() => {
                                const productId = fullProduct?.id || item.productId || item.id;
                                if (productId) window.location.href = `/product/${productId}`;
                              }}
                              className="text-[16px] font-bold text-blue-600 hover:text-[#ff4fa3] hover:underline cursor-pointer tracking-tight leading-snug line-clamp-1"
                            >
                              {itemName.replace(/\(Updated Fix\)/g, "").trim()}
                            </h5>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-3">
                             <button 
                               onClick={() => (window.location.href = `/product/${fullProduct?.id || item.id}?writeReview=true`)}
                               className="flex items-center gap-1.5 text-[12px] font-black text-[#ff4fa3] bg-pink-50/50 border border-pink-100 px-5 py-2.5 rounded-full hover:bg-pink-100 transition-all shadow-xs"
                             >
                               Rate & Review
                             </button>
                             {order.type === 'Offline' && (
                               <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 px-1">
                                 <Store size={14} className="text-emerald-500" /> Store ID: {order.vendor?.id?.slice(-6).toUpperCase()}
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unified Order Action - WhatsApp */}
                <div className="px-5 pb-5 pt-2 border-t border-stone-50 flex justify-end">
                   <button 
                     onClick={() => {
                       const phone = order.vendor?.contactNumber || "+918287123014";
                       const itemsList = order.items.map((item, index) => {
                         const itemName = item.name || item.product?.name;
                         const price = item.unitPrice || item.price || 0;
                         return `${index + 1}. *${itemName}*\n   Price: ₹${Number(price).toLocaleString("en-IN")} | Qty: ${item.quantity || 1}`;
                       }).join("\n");

                       const total = Number(order.totalAmount || order.amount || 0);
                       const message = [
                         `Hi OMW, I'd like to share my order details!`,
                         `*Order ID:* ${order.orderNumber || `OFF-${order.id.slice(0, 8).toUpperCase()}`}`,
                         `*Status:* ${order.status.toUpperCase()}`,
                         `\n*Products Ordered:*`,
                         itemsList,
                         `\n*Grand Total:* ₹${total.toLocaleString("en-IN")}`,
                         `\nI've attached my payment confirmation for your record.`
                       ].join("\n");
                       window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}&lang=en`, "_blank");
                     }}
                     className="flex items-center gap-2 text-[13px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-full transition-all shadow-md shadow-emerald-100"
                   >
                     <Package size={16} />
                     Share on WhatsApp
                   </button>
                </div>

                {/* Footer Action (Offline specific) */}
                {order.type === 'Offline' && order.vendor && (
                  <div className="bg-stone-50/50 px-5 py-3.5 flex items-center justify-between border-t border-stone-50">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-stone-100 shadow-xs">
                        <MapPin size={14} className="text-emerald-500" />
                      </div>
                      <div className="leading-none">
                        <p className="text-[10px] font-black text-stone-800 tracking-tight">{order.vendor.businessName || 'Admin Stock'}</p>
                        <p className="text-[9px] text-stone-500 font-bold mt-0.5">{order.vendor.storeAddress || 'Main Branch'}</p>
                      </div>
                    </div>
                    <button className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
