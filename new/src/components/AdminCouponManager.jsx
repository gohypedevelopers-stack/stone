import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Tag as TagIcon,
  Percent,
  Coins,
  Ticket,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { THEME } from "../theme";
import { API_URL } from "@/utils/api";

export const AdminCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minPurchase: "",
    maxUsage: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/coupons`);
      const data = await resp.json();
      if (data.success) setCoupons(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "OMW";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      return toast.error("Please fill in all required fields");
    }

    setSubmitting(true);
    try {
      const resp = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Coupon generated successfully!");
        setNewCoupon({
          code: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          minPurchase: "",
          maxUsage: "",
          expiresAt: "",
        });
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const resp = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Voucher Arsenal
          </h1>
          <p className="text-sm text-stone-500 font-medium">
            Manage your promotional codes and discount strategies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-100 shadow-sm">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {coupons.length} Active Codes
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Section */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden p-2">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-stone-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
                Draft Voucher
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-2">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Coupon Code</Label>
                    <button 
                      type="button" 
                      onClick={generateRandomCode}
                      className="text-[10px] font-black text-pink-600 hover:text-pink-700 transition-all flex items-center gap-1.5 uppercase tracking-widest"
                    >
                      <RefreshCw className="h-3 w-3" /> Roll
                    </button>
                  </div>
                  <Input 
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    placeholder="SUMMER2024"
                    className="h-12 bg-stone-50 border-none rounded-2xl font-bold tracking-wide text-stone-900 focus-visible:ring-2 focus-visible:ring-indigo-100 hover:bg-stone-100/50 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-stone-600 px-1">Discount Type</Label>
                    <div className="grid grid-cols-2 bg-stone-50 p-1.5 rounded-full gap-1">
                      <button
                        type="button"
                        onClick={() => setNewCoupon({...newCoupon, discountType: 'PERCENTAGE'})}
                        className={cn(
                          "h-10 rounded-full text-xs font-bold transition-all",
                          newCoupon.discountType === 'PERCENTAGE' ? "bg-white text-indigo-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                        )}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCoupon({...newCoupon, discountType: 'FIXED'})}
                        className={cn(
                          "h-10 rounded-full text-xs font-bold transition-all",
                          newCoupon.discountType === 'FIXED' ? "bg-white text-indigo-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                        )}
                      >
                        ₹
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Value</Label>
                    <Input 
                      type="number"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                      placeholder="10"
                      className="h-12 bg-stone-50 border-none rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-indigo-100 hover:bg-stone-100/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Min. Order Value (₹)</Label>
                  <Input 
                    type="number"
                    value={newCoupon.minPurchase}
                    onChange={(e) => setNewCoupon({...newCoupon, minPurchase: e.target.value})}
                    placeholder="500"
                    className="h-12 bg-stone-50 border-none rounded-2xl font-bold focus-visible:ring-2 focus-visible:ring-indigo-100 hover:bg-stone-100/50 transition-all"
                  />
                </div>

                <div className="space-y-3 flex flex-col">
                  <Label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Voucher Expiry</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full bg-stone-50 border-none rounded-full font-bold justify-start text-left font-sans hover:bg-stone-100/50 transition-all",
                          !newCoupon.expiresAt && "text-stone-400"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                        {newCoupon.expiresAt ? (
                          format(new Date(newCoupon.expiresAt), "PPP")
                        ) : (
                          <span className="text-[11px] uppercase tracking-widest">Select Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-full" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newCoupon.expiresAt ? new Date(newCoupon.expiresAt) : undefined}
                        onSelect={(date) => {
                          setNewCoupon({
                            ...newCoupon,
                            expiresAt: date ? format(date, "yyyy-MM-dd") : ""
                          });
                        }}
                        initialFocus
                        className="rounded-full border-none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  disabled={submitting}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-2"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Authorize Coupon"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-stone-50/30 border-b border-stone-50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-7 px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">Master Key</TableHead>
                    <TableHead className="py-7 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Benefit</TableHead>
                    <TableHead className="py-7 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Engagement</TableHead>
                    <TableHead className="py-7 px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Lifetime</TableHead>
                    <TableHead className="py-7 px-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <TableRow key={i} className="border-stone-50">
                        <TableCell colSpan={5} className="h-24 px-8"><div className="h-12 w-full bg-stone-50 rounded-full animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-96 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Ticket className="h-16 w-16 text-stone-300" />
                          <p className="text-sm font-bold text-stone-400">No coupons found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((c) => (
                      <TableRow key={c.id} className="border-stone-50 hover:bg-pink-50/20 transition-all group">
                        <TableCell className="py-8 px-8">
                          <div className="space-y-1">
                            <span className="text-[13px] font-black text-stone-900 tracking-wider uppercase">{c.code}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Limit ₹{c.minPurchase}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4 text-center">
                          <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">
                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-8 px-4">
                           <div className="space-y-2.5 w-36">
                              <div className="flex justify-between text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                 <span>{c.usedCount} Redeemed</span>
                                 <span>{c.maxUsage || '∞'} Cap</span>
                              </div>
                              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${c.maxUsage ? (c.usedCount / c.maxUsage) * 100 : Math.min(100, (c.usedCount / 100) * 100)}%` }}
                                 />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="py-8 px-4">
                          <div className="flex items-center gap-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                            <Calendar className="h-3.5 w-3.5 text-stone-300" />
                            {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Infinite'}
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-8 text-right">
                          <Button
                            onClick={() => handleDelete(c.id)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
           </Card>
        </div>
      </div>
    </div>
  );
};
