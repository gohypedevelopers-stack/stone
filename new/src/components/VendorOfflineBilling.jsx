import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  Store,
  CheckCircle2,
  Printer,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { printThermalReceipt } from "@/utils/printReceipt";
import { API_URL } from "@/utils/api";

export function VendorOfflineBilling() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBill, setSuccessBill] = useState(null);
  const [pointsSettings, setPointsSettings] = useState({ pointsPerAmount: 0, amountThreshold: 100 });
  const [lookedUpCustomer, setLookedUpCustomer] = useState(null);
  const lookupTimerRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vRes, pRes, psRes] = await Promise.all([
          fetch(`${API_URL}/admin/vendors`),
          fetch(`${API_URL}/admin/products`),
          fetch(`${API_URL}/admin/settings/points`)
        ]);
        
        const [vData, pData, psData] = await Promise.all([vRes.json(), pRes.json(), psRes.json()]);
        
        if (vData.success) {
          // Only show approved vendors
          setVendors(vData.data.filter(v => v.approvalStatus === 'APPROVED'));
        }
        if (pData.success) {
          setProducts(pData.data);
        }
        if (psData.success) {
          setPointsSettings(psData.data);
        }
      } catch (err) {
        console.error("Failed to load generic data", err);
      }
    };
    fetchInitialData();
  }, []);

  // Debounced customer lookup by mobile
  useEffect(() => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    setLookedUpCustomer(null);

    const trimmed = customerMobile.trim();
    if (trimmed.length < 10) return;

    lookupTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/admin/customers/lookup?mobile=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setLookedUpCustomer(data.data);
          if (data.data.name && !customerName) {
            setCustomerName(data.data.name);
          }
        }
      } catch (err) {
        console.error("Customer lookup failed", err);
      }
    }, 400);

    return () => clearTimeout(lookupTimerRef.current);
  }, [customerMobile]);

  // Calculate reward points for a given price
  const calcPoints = (price) => {
    const { pointsPerAmount, amountThreshold } = pointsSettings;
    if (!amountThreshold || amountThreshold <= 0) return 0;
    return Math.floor(price / amountThreshold) * pointsPerAmount;
  };

  const selectedVendor = useMemo(() => 
    vendors.find(v => v.id === selectedVendorId), [vendors, selectedVendorId]
  );

  const vendorProducts = useMemo(() => {
    if (!selectedVendorId) return [];
    let fp = products.filter(p => p.vendorId === selectedVendorId && p.status === 'ACTIVE');
    if (searchQuery) {
      fp = fp.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return fp;
  }, [products, selectedVendorId, searchQuery]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Do not exceed stock
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, unitPrice: product.discountPrice || product.price }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) return item; // limit to available stock
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // derived state
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
  }, [cart]);
  
  const tax = subtotal * 0.00; // Assuming tax is inclusive or 0 for now
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!selectedVendorId || !customerMobile || cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId: selectedVendorId,
        mobile: customerMobile,
        name: customerName || undefined,
        amount: total,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      const res = await fetch(`${API_URL}/admin/offline-ledgers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccessBill(data.data);
        setCart([]);
        setCustomerMobile("");
        setCustomerName("");
      } else {
        toast.error(data.message || "Failed to process bill.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error processing offline bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-700">
        <div className="h-24 w-24 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-10 shadow-xl shadow-pink-100/50 border border-pink-100">
          <CheckCircle2 className="h-12 w-12" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-3 uppercase">Order Authorized</h2>
        <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mb-12">
          Ref: <span className="text-pink-600 ml-1">OFF-{successBill.id.slice(0, 8).toUpperCase()}</span>
        </p>
        
        <div className="bg-white p-10 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.04)] border border-stone-100 max-w-lg w-full text-center space-y-6">
           <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Transaction Summary</span>
              <div className="h-0.5 w-10 bg-pink-500/20" />
           </div>
           
           <div className="space-y-4">
             <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
               <span className="text-stone-400">Inventory Nodes</span>
               <span className="text-stone-900">{successBill.items?.reduce((a, b) => a + b.quantity, 0)} Units</span>
             </div>
             {(successBill.customerName || successBill.customer?.name) && (
               <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                 <span className="text-stone-400">Member</span>
                 <span className="text-stone-900">{successBill.customerName || successBill.customer?.name}</span>
               </div>
             )}
             <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
               <span className="text-stone-400">Terminal Link</span>
               <span className="text-stone-900">{successBill.mobile}</span>
             </div>
           </div>

           <div className="pt-8 border-t border-stone-50 mt-8 flex flex-col items-center">
             <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Total Yield</span>
             <span className="text-4xl font-black text-stone-900 tracking-tighter">
               &#8377;{Number(successBill.amount).toLocaleString('en-IN')}
             </span>
           </div>
        </div>

        <div className="flex items-center gap-5 mt-12">
          <Button 
            onClick={() => printThermalReceipt(successBill)} 
            className="bg-white text-stone-900 border border-stone-100 rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50 shadow-sm transition-all"
          >
            <span className="flex items-center gap-3"><Printer className="h-4 w-4" /> Print Receipt</span>
          </Button>
          <Button 
            onClick={() => setSuccessBill(null)} 
            className="bg-stone-900 text-white rounded-xl h-12 px-10 font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4fa3] shadow-xl shadow-stone-200 transition-all hover:scale-105"
          >
            New Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 pt-4 px-2">
        <div>
          <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-4">
             <div className="h-11 w-11 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-200">
               <CreditCard className="h-5 w-5" />
             </div>
             Terminal Auth
          </h1>
          <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] mt-3">Authorize secure in-store purchases and offline settlements.</p>
        </div>
      </header>

      {/* Vendor Details Section */}
      <div className="bg-stone-100/50 p-2 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-2 border border-stone-100">
        <div className="bg-white rounded-xl border border-stone-100 p-6 flex flex-col justify-center">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 block">Vendor Identification</Label>
          <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
            <SelectTrigger className="h-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-pink-500 font-black text-[12px] text-stone-900 focus:bg-white transition-all shadow-none">
              <SelectValue placeholder="Identify merchant node..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-stone-100 shadow-2xl">
              {vendors.map(v => (
                <SelectItem key={v.id} value={v.id} className="cursor-pointer font-black text-[11px] py-3 uppercase tracking-widest focus:bg-pink-50 focus:text-pink-600">
                  {v.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 p-6 flex flex-col justify-center">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 block">Node Deployment Address</Label>
          <div className="flex-1 rounded-xl border border-stone-100 bg-stone-50/50 px-5 flex items-center gap-3 w-full h-12">
            {selectedVendor ? (
              <>
                <MapPin className="h-3.5 w-3.5 text-pink-500" />
                <span className="font-black text-[11px] text-stone-900 truncate uppercase tracking-tight">{selectedVendor.storeAddress || 'Address not verified.'}</span>
              </>
            ) : (
              <span className="text-stone-400 font-black text-[10px] uppercase tracking-widest">Awaiting merchant identification...</span>
            )}
          </div>
        </div>
      </div>

      {/* POS Interface */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${!selectedVendorId && 'opacity-50 pointer-events-none grayscale'}`}>
        
        {/* Left Side: Product Selector */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-stone-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-white h-[850px] flex flex-col">
            <CardHeader className="bg-stone-50/30 border-b border-stone-50 flex flex-row items-center justify-between py-6 px-8">
              <div>
                <CardTitle className="text-[11px] font-black text-stone-900 uppercase tracking-[0.25em] flex items-center gap-3">
                  <Store className="h-4 w-4 text-pink-500" /> Catalog Registry
                </CardTitle>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input 
                  placeholder="Filter by name or SKU..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 rounded-xl bg-white border border-stone-100 shadow-none focus-visible:ring-pink-500 font-black text-[11px] uppercase tracking-widest placeholder:text-stone-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {vendorProducts.length === 0 ? (
                    <div className="col-span-full py-32 text-center text-stone-300 font-black text-[10px] uppercase tracking-widest">
                      Node catalog currently empty for this terminal.
                    </div>
                  ) : vendorProducts.map(p => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`group cursor-pointer bg-white border border-stone-100 rounded-xl p-5 transition-all flex flex-col relative ${p.stock <= 0 ? 'opacity-40 grayscale' : 'hover:border-pink-500 hover:shadow-xl hover:shadow-pink-100/50'}`}
                    >
                      {p.stock <= 0 && (
                        <div className="absolute top-4 right-4 bg-stone-900 text-white text-[8px] font-black uppercase px-3 py-1 rounded-xl z-10 tracking-[0.2em] shadow-lg">
                          Depleted
                        </div>
                      )}
                      <div className="aspect-[4/5] bg-stone-50 rounded-[1px] mb-5 overflow-hidden border border-stone-50 relative">
                        {p.imageUrls && p.imageUrls[0] ? (
                          <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-200">
                             <Store className="h-10 w-10 stroke-[1]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-pink-500/10 flex items-center justify-center transition-all duration-300">
                          <Plus className="opacity-0 group-hover:opacity-100 h-10 w-10 text-white bg-pink-500 rounded-full p-2.5 shadow-2xl transition-all scale-50 group-hover:scale-100" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h4 className="font-black text-[12px] text-stone-900 line-clamp-2 leading-tight uppercase tracking-tight h-10">{p.name}</h4>
                        <div className="mt-auto pt-4 flex flex-col gap-2">
                          <span className="font-black text-stone-950 block text-lg tracking-tighter">&#8377;{Number(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
                          {calcPoints(Number(p.discountPrice || p.price)) > 0 && (
                            <div className="flex items-center gap-1.5 bg-pink-50 text-pink-600 rounded-xl px-2 py-1 text-[9px] font-black whitespace-nowrap w-fit uppercase tracking-widest border border-pink-100">
                              <Coins className="h-3 w-3" />
                              +{calcPoints(Number(p.discountPrice || p.price))} pts
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Electronic Ledger / Cart */}
        <div className="lg:col-span-4">
          <Card className="border border-stone-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-white flex flex-col h-[850px]">
            <CardHeader className="bg-stone-50/20 border-b border-stone-50 py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-[11px] font-black text-stone-950 uppercase tracking-[0.25em] flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-stone-900 text-white">
                  <ShoppingCart className="h-4 w-4" /> 
                </div>
                <span>Active Ledger</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden relative">
              <div className="flex-1 overflow-y-auto px-6 pt-6">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center text-stone-300 font-black text-[10px] uppercase tracking-widest">
                      Terminal register idle.
                    </motion.div>
                  ) : (
                    <div className="space-y-4 pb-8">
                      {cart.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-stone-50 shadow-sm group/item hover:border-pink-100 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {item.imageUrls && item.imageUrls[0] ? (
                              <div className="h-16 w-16 rounded-[1px] border border-stone-50 overflow-hidden shrink-0 bg-stone-50">
                                <img src={item.imageUrls[0]} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-[1px] border border-stone-50 flex items-center justify-center shrink-0 bg-stone-50 text-stone-200">
                                <Store className="h-6 w-6" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-black text-[11px] text-stone-900 leading-tight uppercase tracking-tight">{item.name}</h5>
                              <span className="font-black text-stone-400 text-[9px] mt-2 block uppercase tracking-widest">&#8377;{Number(item.unitPrice).toLocaleString()} / UNIT</span>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-200 hover:text-pink-600 transition-colors p-1 shrink-0 -mt-1 -mr-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-stone-50/50">
                            <div className="flex items-center gap-1 bg-stone-50/50 rounded-xl p-1 border border-stone-100">
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-[1px] text-stone-600 hover:text-stone-900 bg-white shadow-sm border border-stone-100" onClick={() => updateQuantity(item.id, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-black text-xs w-8 text-center text-stone-950">{item.quantity}</span>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-[1px] text-stone-600 hover:text-stone-900 bg-white shadow-sm border border-stone-100" onClick={() => updateQuantity(item.id, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-stone-950 text-sm tracking-tight">&#8377;{(Number(item.unitPrice) * item.quantity).toLocaleString()}</span>
                              {calcPoints(Number(item.unitPrice) * item.quantity) > 0 && (
                                <div className="flex items-center justify-end gap-1 text-pink-600 text-[9px] font-black mt-1 uppercase tracking-widest">
                                  <Coins className="h-2.5 w-2.5" />
                                  +{calcPoints(Number(item.unitPrice) * item.quantity)}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ledger Footer */}
              <div className="bg-stone-50/30 p-8 border-t border-stone-100 z-10 flex flex-col gap-6 shrink-0">
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-stone-400">Inventory Subtotal</span>
                     <span className="text-stone-900">&#8377;{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-stone-400">Terminal Tax (Inclusive)</span>
                     <span className="text-stone-900">&#8377;{tax.toLocaleString('en-IN')}</span>
                   </div>
                   {calcPoints(subtotal) > 0 && (
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] bg-pink-50 -mx-8 px-8 py-3 border-y border-pink-100/50">
                       <span className="text-pink-600 flex items-center gap-2">
                         <Coins className="h-4 w-4" /> Points Accrued
                       </span>
                       <span className="text-pink-600">
                         +{calcPoints(subtotal)} PTS
                       </span>
                     </div>
                   )}
                   <div className="flex justify-between items-end pt-2">
                     <span className="font-black uppercase tracking-[0.3em] text-[11px] text-stone-400 pb-1">Total Yield</span>
                     <span className="font-black text-3xl text-stone-950 tracking-tighter leading-none">&#8377;{total.toLocaleString('en-IN')}</span>
                   </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Member Name</Label>
                      <Input 
                        placeholder="IDENTIFY..." 
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="h-11 border-stone-100 rounded-xl focus-visible:ring-pink-500 px-4 font-black text-[10px] uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Terminal Link <span className="text-pink-500">*</span></Label>
                      <Input 
                        placeholder="MOBILE..." 
                        value={customerMobile}
                        onChange={e => setCustomerMobile(e.target.value)}
                        className="h-11 border-stone-100 rounded-xl focus-visible:ring-pink-500 px-4 font-black text-[10px] uppercase tracking-widest"
                      />
                    </div>
                  </div>
                  
                  {lookedUpCustomer && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-stone-900 rounded-xl p-4 shadow-xl">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{lookedUpCustomer.name}</p>
                        <p className="text-[8px] text-stone-500 font-black uppercase tracking-widest mt-1">Verified Member node</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 rounded-[1px] px-3 py-1.5 border border-white/5">
                        <Coins className="h-3.5 w-3.5 text-pink-500" />
                        <span className="text-xs font-black text-white">{lookedUpCustomer.rewardPoints}</span>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    className="w-full h-14 rounded-xl bg-stone-950 hover:bg-[#ff4fa3] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all duration-500 disabled:opacity-30 group"
                    disabled={cart.length === 0 || !customerMobile || isSubmitting}
                    onClick={handleCheckout}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-3"><div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> Authorizing...</span>
                    ) : (
                      <span className="flex items-center gap-3">Authorize Session <CheckCircle2 className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
