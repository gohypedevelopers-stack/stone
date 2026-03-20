import { useState, useEffect, useMemo } from "react";
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
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { printThermalReceipt } from "@/utils/printReceipt";

const API_URL = "http://localhost:5000/api";

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

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          fetch(`${API_URL}/admin/vendors`),
          fetch(`${API_URL}/admin/products`)
        ]);
        
        const [vData, pData] = await Promise.all([vRes.json(), pRes.json()]);
        
        if (vData.success) {
          // Only show approved vendors
          setVendors(vData.data.filter(v => v.approvalStatus === 'APPROVED'));
        }
        if (pData.success) {
          setProducts(pData.data);
        }
      } catch (err) {
        console.error("Failed to load generic data", err);
      }
    };
    fetchInitialData();
  }, []);

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
        alert(data.message || "Failed to process bill.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing offline bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-stone-900 tracking-tighter mb-2">Offline Bill Processed Successfully</h2>
        <p className="text-stone-500 font-medium mb-8">
          Bill Reference: <span className="font-bold text-stone-900 ml-1">OFF-{successBill.id.slice(0,8).toUpperCase()}</span>
        </p>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 max-w-md w-full text-center space-y-4">
           <h3 className="font-bold text-lg uppercase tracking-widest text-stone-800 border-b border-stone-100 pb-4 mb-4">Receipt Summary</h3>
           <div className="flex justify-between text-sm">
             <span className="text-stone-500">Total Items</span>
             <span className="font-bold">{successBill.items?.reduce((a,b) => a + b.quantity, 0)}</span>
           </div>
           {(successBill.customerName || successBill.customer?.name) && (
             <div className="flex justify-between text-sm">
               <span className="text-stone-500">Customer Name</span>
               <span className="font-bold">{successBill.customerName || successBill.customer?.name}</span>
             </div>
           )}
           <div className="flex justify-between text-sm">
             <span className="text-stone-500">Customer Mobile</span>
             <span className="font-bold">{successBill.mobile}</span>
           </div>
           <div className="flex justify-between text-lg pt-4 border-t border-stone-100 mt-4">
             <span className="font-black text-stone-900">Total Charged</span>
             <span className="font-black text-emerald-600">&#8377;{Number(successBill.amount).toLocaleString('en-IN')}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <Button 
            onClick={() => printThermalReceipt(successBill)} 
            className="bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs hover:bg-indigo-100"
          >
            <span className="flex items-center gap-2"><Printer className="h-4 w-4" /> Print Copy</span>
          </Button>
          <Button 
            onClick={() => setSuccessBill(null)} 
            className="bg-stone-900 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs hover:bg-stone-800"
          >
            New Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter flex items-center gap-3">
             <CreditCard className="h-10 w-10 text-emerald-500" /> POS / Offline Billing
          </h1>
          <p className="text-stone-400 font-medium mt-2">Process secure in-store purchases and offline transactions for merchant partners.</p>
        </div>
      </header>

      {/* Vendor Details Section */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-stone-500">Select Operating Merchant / Vendor</Label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                <SelectTrigger className="h-14 rounded-2xl border-stone-200 bg-stone-50/50 font-bold text-lg focus:ring-emerald-500">
                  <SelectValue placeholder="Search or select a vendor..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id} className="cursor-pointer font-medium py-3">
                      {v.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-stone-500">Merchant Terminal Location</Label>
              <div className="h-14 rounded-2xl border border-stone-200 bg-stone-50 px-4 flex items-center justify-between">
                {selectedVendor ? (
                  <>
                    <div className="flex items-center gap-3 overflow-hidden pr-4">
                      <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold text-stone-700 truncate">{selectedVendor.storeAddress || 'No physical address logged.'}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-stone-400 font-medium italic">Awaiting merchant selection...</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POS Interface */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${!selectedVendorId && 'opacity-50 pointer-events-none grayscale'}`}>
        
        {/* Left Side: Product Selector */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white h-[600px] flex flex-col">
            <CardHeader className="bg-stone-50 border-b border-stone-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <Store className="h-5 w-5 text-stone-400" /> Terminal Catalog
                </CardTitle>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white border-none shadow-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {vendorProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-stone-400 font-medium italic">
                      No products found for this terminal.
                    </div>
                  ) : vendorProducts.map(p => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`group cursor-pointer bg-stone-50 border border-stone-100 rounded-2xl p-4 transition-all flex flex-col relative ${p.stock <= 0 ? 'opacity-50 grayscale hover:border-rose-500' : 'hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'}`}
                    >
                      {p.stock <= 0 && (
                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10 shadow-sm">
                          Out of Stock
                        </div>
                      )}
                      <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden border border-stone-100 relative">
                        {p.imageUrls && p.imageUrls[0] ? (
                          <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-200">
                             <Store className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                          <Plus className="opacity-0 group-hover:opacity-100 h-8 w-8 text-emerald-600 bg-white rounded-full p-2 shadow-sm transition-all scale-75 group-hover:scale-100" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h4 className="font-bold text-sm text-stone-800 line-clamp-2 leading-tight">{p.name}</h4>
                        <span className="font-black text-emerald-600 mt-auto pt-2 block text-lg">&#8377;{Number(p.discountPrice || p.price).toLocaleString('en-IN')}</span>
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
          <Card className="border-none shadow-2xl shadow-indigo-900/5 rounded-3xl overflow-hidden bg-white min-h-[600px] h-[calc(100vh-140px)] max-h-[800px] flex flex-col">
            <CardHeader className="bg-indigo-950 text-white pb-6 pt-8 rounded-b-[2rem] relative z-10 overflow-hidden shadow-2xl shadow-indigo-950/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#2a134d] to-[#1a0b2e] z-0"></div>
              <CardTitle className="text-xl font-black text-white flex items-center gap-3 relative z-10 tracking-widest uppercase text-xs">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <ShoppingCart className="h-5 w-5 text-purple-300" /> 
                </div>
                <span className="text-white drop-shadow-sm">Active Ledger</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col pt-4 overflow-hidden relative bg-stone-50/50">
              <ScrollArea className="flex-1 px-6">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-stone-400 font-medium">
                      Register is currently empty.
                    </motion.div>
                  ) : (
                    <div className="space-y-4 py-2 pb-6">
                      {cart.map((item, idx) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm"
                        >
                          <div className="flex-1 overflow-hidden">
                            <h5 className="font-bold text-sm text-stone-900 truncate">{item.name}</h5>
                            <span className="font-bold text-stone-500 text-xs">&#8377;{Number(item.unitPrice).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-1 border border-stone-100">
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-lg text-stone-500 hover:text-stone-900" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-lg text-stone-500 hover:text-stone-900" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right flex items-center gap-2 min-w-[70px] justify-end">
                            <span className="font-black text-stone-900 text-sm">&#8377;{(Number(item.unitPrice) * item.quantity).toLocaleString()}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-rose-500 transition-colors p-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>

              {/* Ledger Footer */}
              <div className="bg-white p-6 border-t border-stone-100 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-10 flex flex-col gap-6 shrink-0">
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="font-semibold text-stone-500">Subtotal</span>
                     <span className="font-bold text-stone-900">&#8377;{subtotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="font-semibold text-stone-500">Tax</span>
                     <span className="font-bold text-stone-900">&#8377;{tax.toLocaleString('en-IN')}</span>
                   </div>
                   <Separator className="bg-stone-100" />
                   <div className="flex justify-between items-end pt-1">
                     <span className="font-black uppercase tracking-widest text-[10px] text-stone-500 pb-1">Total Net</span>
                     <span className="font-black text-3xl text-indigo-950 tracking-tighter leading-none">&#8377;{total.toLocaleString('en-IN')}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">Customer Name</Label>
                      <Input 
                        placeholder="e.g. Aditi..." 
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus-visible:ring-indigo-950 font-bold px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">Mobile No <span className="text-rose-500">*</span></Label>
                      <Input 
                        placeholder="e.g. 987654..." 
                        value={customerMobile}
                        onChange={e => setCustomerMobile(e.target.value)}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus-visible:ring-indigo-950 font-bold px-4"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-indigo-950 hover:bg-[#1a0b2e] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-950/20 disabled:opacity-50 transition-all hover:-translate-y-0.5 shrink-0"
                    disabled={cart.length === 0 || !customerMobile || isSubmitting}
                    onClick={handleCheckout}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> Processing</span>
                    ) : (
                      <span className="flex items-center gap-2 text-purple-300">Complete Transaction <CheckCircle2 className="h-4 w-4 ml-1" /></span>
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
