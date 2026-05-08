import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  ChevronDown,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  Package,
  Package2,
  PackageX,
  PlusCircle,
  RefreshCw,
  Store,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL, getMediaUrl } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export default function OutletInventorySection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [movements, setMovements] = useState([]);
  const [detailOutlet, setDetailOutlet] = useState(null);
  const [detailInventory, setDetailInventory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [selectedManagers, setSelectedManagers] = useState({});
  const [selectedProductDistribution, setSelectedProductDistribution] = useState(null);
  
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({
    productId: "",
    batchId: "",
    quantity: "1",
    targetOutletId: "",
  });
  const [products, setProducts] = useState([]);
  const [globalBatches, setGlobalBatches] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [outletRes, vendorRes, summaryRes, movementRes] = await Promise.all([
        fetch(`${API_URL}/admin/outlets`),
        fetch(`${API_URL}/admin/vendors`),
        fetch(`${API_URL}/admin/inventory/summary`),
        fetch(`${API_URL}/admin/stock-movements`),
      ]);

      const [outletData, vendorData, summaryData, movementData] = await Promise.all([
        outletRes.json(),
        vendorRes.json(),
        summaryRes.json(),
        movementRes.json(),
      ]);

      if (outletData.success) setOutlets(outletData.data || []);
      if (vendorData.success) setVendors(vendorData.data || []);
      if (summaryData.success) {
        setSummary(summaryData.data || []);
        // Extract unique products from summary for transfer selection
        const prodList = summaryData.data.map(s => ({ id: s.productId, name: s.productName }));
        setProducts(prodList);
      }
      if (movementData.success) setMovements(movementData.data || []);
    } catch (error) {
      toast.error("Failed to load outlet inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const unassignedManagers = useMemo(
    () =>
      vendors.filter(
        (vendor) => vendor.approvalStatus === "APPROVED" && !vendor.outletId,
      ),
    [vendors],
  );

  const createOutlet = async () => {
    if (!form.name || !form.code) {
      toast.error("Outlet name and code are required");
      return;
    }

    setSaving(true);
    try {
      const resp = await fetch(`${API_URL}/admin/outlets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to create outlet");
        return;
      }
      toast.success("Outlet created");
      setForm({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
      await loadData();
    } catch (error) {
      toast.error("Failed to create outlet");
    } finally {
      setSaving(false);
    }
  };

  const assignManager = async (outletId) => {
    const vendorId = selectedManagers[outletId];
    if (!vendorId) {
      toast.error("Select a manager first");
      return;
    }

    setAssigningId(outletId);
    try {
      const resp = await fetch(
        `${API_URL}/admin/outlets/${outletId}/managers/${vendorId}`,
        { method: "PATCH" },
      );
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to assign manager");
        return;
      }
      toast.success("Outlet manager assigned");
      await loadData();
    } catch (error) {
      toast.error("Failed to assign manager");
    } finally {
      setAssigningId(null);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.productId || !transferForm.batchId || !transferForm.quantity) {
      toast.error("Please complete all transfer fields");
      return;
    }

    const globalVendor = vendors.find(v => v.businessName?.toLowerCase().includes("global"));
    if (!globalVendor) {
      toast.error("Global reserve node not found");
      return;
    }

    setTransferLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/inventory/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...transferForm,
          sourceVendorId: globalVendor.id
        })
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Stock transferred successfully");
        setTransferOpen(false);
        await loadData();
        if (detailOutlet) openDetail(detailOutlet);
      } else {
        toast.error(data.message || "Transfer failed");
      }
    } catch (error) {
      toast.error("Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const openTransfer = (outletId) => {
    setTransferForm({
      productId: "",
      batchId: "",
      quantity: "1",
      targetOutletId: outletId,
    });
    setGlobalBatches([]);
    setTransferOpen(true);
  };

  const onProductSelect = (productId) => {
    const product = summary.find(s => s.productId === productId);
    if (product) {
      // Find global batches for this product
      // Since our summary now aggregates everything, we can find the global entry
      const globalEntries = product.outlets.filter(o => o.isGlobal);
      setGlobalBatches(globalEntries.map(g => ({ id: g.batchId, no: g.batchNo, qty: g.quantity })));
      setTransferForm(prev => ({ ...prev, productId, batchId: "" }));
    }
  };

  const openDetail = async (outlet) => {
    setDetailOutlet(outlet);
    setDetailLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/outlets/${outlet.id}/inventory`);
      const data = await resp.json();
      if (data.success) {
        setDetailInventory(data.data || []);
      } else {
        toast.error(data.message || "Failed to load outlet inventory");
      }
    } catch (error) {
      toast.error("Failed to load outlet inventory");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-[32px] font-black text-stone-900 tracking-tight leading-none">
            Network Operations
          </h2>
          <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">
            Multi-location inventory intelligence and fulfillment tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-2xl h-12 border-stone-200 bg-white text-stone-900 font-black px-6 shadow-sm hover:shadow-xl hover:bg-stone-50 transition-all flex items-center gap-2 group"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] uppercase tracking-widest">Sync Network Pulse</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[32px] p-8 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 blur-3xl -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all">
                <Store className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Active Nodes</span>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-black text-stone-900 tracking-tighter leading-none">{outlets.length}</p>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
            </div>
            <div className="h-1.5 w-full bg-stone-50 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-full transition-all duration-1000" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[32px] p-8 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 blur-3xl -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-all">
                <Package className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Monitored SKUs</span>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-black text-stone-900 tracking-tighter leading-none">{summary.length}</p>
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">SKUs</span>
            </div>
            <div className="h-1.5 w-full bg-stone-50 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-3/4 transition-all duration-1000" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[32px] p-8 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-purple-500/5 blur-3xl -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                <Activity className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Transmission Log</span>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-black text-stone-900 tracking-tighter leading-none">{movements.length}</p>
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Events</span>
            </div>
            <div className="h-1.5 w-full bg-stone-50 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-1/2 transition-all duration-1000" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Inventory Summary List */}
        <Card className="xl:col-span-1 bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[40px] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
            <div className="flex flex-col gap-1">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-stone-900">Network Distribution</h3>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Global SKU presence</p>
            </div>
            <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar" data-lenis-prevent>
            {summary.length > 0 ? (
              summary.map((item) => (
                <div 
                  key={item.productId} 
                  className="flex items-center gap-5 p-4 rounded-[24px] bg-stone-50/50 border border-transparent hover:border-stone-200 hover:bg-white hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => setSelectedProductDistribution(item)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-stone-100 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500 shadow-sm">
                    {(() => {
                      const img = item.image || item.imageUrls?.[0] || item.images?.[0] || item.product?.imageUrls?.[0] || item.product?.images?.[0] || item.product?.image;
                      if (img) {
                        return (
                          <img 
                            src={getMediaUrl(img)} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerHTML = '<div class="text-stone-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg></div>';
                            }}
                          />
                        );
                      }
                      return <Package2 className="h-6 w-6 text-stone-200" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-stone-900 truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[9px] font-black text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                         {item.outlets?.length || 0} Outlets
                       </span>
                    </div>
                  </div>
                  <div className="text-right bg-white p-3 rounded-xl shadow-xs border border-stone-50 group-hover:border-emerald-100 transition-all">
                    <p className="text-lg font-black text-stone-900 tracking-tighter leading-none">{item.totalStock}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Stock</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-32 text-stone-300">
                <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-6">
                   <PackageX className="h-10 w-10 opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Standby</p>
              </div>
            )}
          </div>
        </Card>

        {/* Outlet Directory */}
        <Card className="xl:col-span-2 bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
          <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
            <div className="flex flex-col gap-1">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-stone-900 italic">Network <span className="text-indigo-600">Infrastructure</span></h3>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Distributed Stock Nodes & Fulfillment Hubs</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Network Secure</span>
            </div>
          </div>
          <div className="p-8 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar" data-lenis-prevent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {vendors.filter(v => v.approvalStatus === "APPROVED").length > 0 ? (
                vendors.filter(v => v.approvalStatus === "APPROVED").map((vendor) => (
                  <div key={vendor.id} className={cn(
                    "p-6 rounded-[32px] border transition-all duration-500 group relative overflow-hidden",
                    vendor.businessName?.toLowerCase().includes("global") 
                      ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 ring-2 ring-indigo-500/5 shadow-2xl shadow-indigo-100/50" 
                      : "border-stone-100 bg-stone-50/30 hover:bg-white hover:shadow-2xl hover:border-indigo-100"
                  )}>
                    {vendor.businessName?.toLowerCase().includes("global") && (
                      <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 blur-[60px] -mr-10 -mt-10 rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
                    )}
                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-16 h-16 rounded-[22px] border flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500",
                          vendor.businessName?.toLowerCase().includes("global") 
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-200" 
                            : "bg-white border-stone-100 text-indigo-500"
                        )}>
                          <Building2 className="h-8 w-8" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[18px] font-black text-stone-900 tracking-tight leading-none truncate group-hover:text-indigo-600 transition-colors">
                              {vendor.businessName?.toLowerCase().includes("global") ? "Admin Stock" : vendor.businessName}
                            </h4>
                          </div>
                          {vendor.businessName?.toLowerCase().includes("global") ? (
                            <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black uppercase px-2 py-0.5 tracking-[0.1em]">Central Command & Admin Reserves</Badge>
                          ) : (
                            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Infrastructure Hash: {vendor.id.slice(0, 8).toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className={cn(
                        "p-4 rounded-2xl border transition-colors",
                        vendor.businessName?.toLowerCase().includes("global") ? "bg-white border-indigo-100" : "bg-white/50 border-stone-100 group-hover:border-indigo-50"
                      )}>
                        <div className="flex items-center gap-2 mb-1.5">
                           <MapPin className="h-3 w-3 text-stone-300" />
                           <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Locality</p>
                        </div>
                        <p className="text-[11px] font-black text-stone-700 truncate">{vendor.city || "Mumbai"}, {vendor.state || "MH"}</p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl border transition-colors",
                        vendor.businessName?.toLowerCase().includes("global") ? "bg-white border-indigo-100" : "bg-white/50 border-stone-100 group-hover:border-indigo-50"
                      )}>
                        <div className="flex items-center gap-2 mb-1.5">
                           <ClipboardList className="h-3 w-3 text-stone-300" />
                           <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Operation</p>
                        </div>
                        <p className="text-[11px] font-black text-stone-700 truncate">{vendor.businessCategory || "General Retail"}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => openDetail(vendor.outletId ? { id: vendor.outletId, name: vendor.businessName } : null)}
                      className={cn(
                        "w-full rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg relative z-10",
                        vendor.businessName?.toLowerCase().includes("global")
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                          : "bg-stone-900 text-white hover:bg-indigo-600 shadow-stone-200 group-hover:shadow-indigo-200"
                      )}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {vendor.businessName?.toLowerCase().includes("global") ? "Manage Admin Reserves" : "Analyze Stock Matrix"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-stone-300 opacity-20">
                  <Store className="h-16 w-16 mx-auto mb-6" />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">Awaiting Node Registration</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Movements Table */}
      <Card className="bg-white border-none shadow-sm ring-1 ring-stone-100 rounded-[40px] overflow-hidden hover:shadow-2xl transition-all duration-500">
        <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
          <div className="flex flex-col gap-1">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-stone-900">Network Transmission Ledger</h3>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Full audit trail of stock operations</p>
          </div>
          <Button variant="ghost" className="h-9 px-6 rounded-full bg-stone-100 text-[10px] font-black text-stone-500 uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">
            Full Audit Trail
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black bg-stone-50/50">
                <th className="py-6 px-10">Target Node</th>
                <th className="py-6 px-4">SKU Identity</th>
                <th className="py-6 px-4 text-center">Operation</th>
                <th className="py-6 px-4 text-center">Magnitude</th>
                <th className="py-6 px-4">Originator</th>
                <th className="py-6 px-10 text-right">Synchronization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {movements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="text-sm hover:bg-stone-50/50 transition-colors group/row cursor-default">
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover/row:bg-indigo-500 group-hover/row:text-white transition-all duration-500">
                         <Building2 className="h-5 w-5" />
                      </div>
                      <span className="font-black text-stone-900 tracking-tight uppercase text-[13px]">{movement.outlet?.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <p className="font-black text-stone-900 uppercase tracking-tight text-[13px] leading-none mb-1.5 group-hover/row:text-indigo-600 transition-colors">{movement.product?.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest border border-stone-100 px-2 py-0.5 rounded-md">Batch: {movement.batch?.batchNo || "SYSTEM"}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className={cn(
                      "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                      movement.movementType === 'ADD' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {movement.movementType === 'ADD' ? 'TRANSMISSION' : 'DEPLETION'}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className={cn(
                      "text-xl font-black tracking-tighter tabular-nums",
                      movement.movementType === 'ADD' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {movement.movementType === 'ADD' ? '+' : '-'}{movement.quantity}
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex flex-col">
                       <p className="text-[13px] font-black text-stone-900 tracking-tight uppercase leading-none mb-1">{movement.performedBy?.ownerName || "Autonomous"}</p>
                       <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Protocol Agent</p>
                    </div>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <div className="flex flex-col items-end">
                       <p className="text-[13px] font-black text-stone-900 leading-none mb-1 tabular-nums">{new Date(movement.createdAt).toLocaleDateString("en-IN")}</p>
                       <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest tabular-nums opacity-60">{new Date(movement.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                </tr>
              ))}
              {!movements.length && (
                <tr>
                  <td colSpan="6" className="py-32 text-center opacity-20">
                    <div className="flex flex-col items-center justify-center text-stone-300">
                      <ClipboardList className="h-16 w-16 mb-6" />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em]">Ledger is Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribution Dialog */}
      <Dialog open={Boolean(selectedProductDistribution)} onOpenChange={(open) => !open && setSelectedProductDistribution(null)}>
        <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border border-stone-200 shadow-2xl bg-white [&>button]:hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {(() => {
                  const img = selectedProductDistribution?.image || selectedProductDistribution?.imageUrls?.[0] || selectedProductDistribution?.images?.[0] || selectedProductDistribution?.product?.imageUrls?.[0] || selectedProductDistribution?.product?.images?.[0] || selectedProductDistribution?.product?.image;
                  if (img) {
                    return (
                      <img 
                        src={getMediaUrl(img)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = '<div class="text-stone-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg></div>';
                        }}
                      />
                    );
                  }
                  return <Package className="h-6 w-6 text-stone-300" />;
                })()}
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-stone-900 tracking-tight uppercase">
                  {selectedProductDistribution?.productName}
                </DialogTitle>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mt-0.5">Network Distribution Analysis</p>
              </div>
            </div>
            <Button
              onClick={() => setSelectedProductDistribution(null)}
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full hover:bg-stone-200/50 text-stone-400 transition-all"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Network Stock</p>
                <p className="text-2xl font-black text-stone-900">{selectedProductDistribution?.totalStock} <span className="text-xs text-stone-400 font-bold">Units</span></p>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Outlet Penetration</p>
                <p className="text-2xl font-black text-stone-900">{selectedProductDistribution?.outlets?.length} <span className="text-xs text-stone-400 font-bold">Locations</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-3 px-1">Location Breakdown</h4>
              {selectedProductDistribution?.outlets?.map((dist, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  dist.isGlobal 
                    ? "bg-indigo-50/50 border-indigo-100 hover:border-indigo-300" 
                    : "bg-white border-stone-50 hover:border-stone-200 hover:bg-stone-50/50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      dist.isGlobal ? "bg-indigo-600 text-white" : "bg-white border border-stone-100 text-stone-400 group-hover:text-[#9a6bff]"
                    )}>
                      {dist.isGlobal ? <Building2 className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-800 uppercase tracking-tight">
                        {dist.outletName || "Outlet Location"}
                        {dist.batchNo && dist.batchNo !== "Main Stock" && <span className="ml-2 text-[9px] text-stone-400">Batch: {dist.batchNo}</span>}
                      </p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                        {dist.isGlobal ? "Central Reserve" : "Retail Node"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-black leading-none",
                      dist.isGlobal ? "text-indigo-600" : "text-stone-900"
                    )}>{dist.quantity}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Available</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Outlet Inventory Detail Dialog */}
      <Dialog open={Boolean(detailOutlet)} onOpenChange={(open) => !open && setDetailOutlet(null)}>
        <DialogContent className="max-w-3xl rounded-[32px] p-0 overflow-hidden border border-stone-200 shadow-2xl bg-white [&>button]:hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#9a6bff] shadow-sm">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-stone-900 tracking-tight">
                  {detailOutlet?.name || "Outlet"} Inventory
                </DialogTitle>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mt-0.5">Live Stock Ledger</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => openTransfer(detailOutlet.id)}
                className="h-8 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest px-4 rounded-full shadow-lg shadow-stone-900/20 hover:bg-black transition-all"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-2" />
                Transfer Stock
              </Button>
              <Button
                onClick={() => setDetailOutlet(null)}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-stone-200/50 text-stone-400 transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
            {detailLoading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-stone-50 border-t-[#9a6bff] animate-spin" />
                  <Store className="h-4 w-4 text-[#9a6bff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-300 mt-6">Synchronizing Data</p>
              </div>
            ) : detailInventory.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {detailInventory.map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between gap-8 group hover:bg-stone-50/40 transition-colors">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="h-16 w-16 rounded-[16px] bg-stone-50 border border-stone-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm flex items-center justify-center">
                        {(() => {
                          const imageUrl = item.product?.imageUrls?.[0] || item.product?.image;
                          if (imageUrl) {
                            return (
                              <img 
                                src={getMediaUrl(imageUrl)} 
                                alt={item.product?.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerHTML = '<div class="text-stone-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg></div>';
                                }}
                              />
                            );
                          }
                          return (
                            <div className="h-full w-full flex items-center justify-center text-stone-200 bg-gradient-to-br from-stone-50 to-stone-100">
                              <Package className="h-6 w-6" />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black bg-[#9a6bff]/10 text-[#9a6bff] px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {item.product?.brand || "Brand"}
                          </span>
                          <span className="text-[8px] font-black bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {item.product?.category || "General"}
                          </span>
                        </div>
                        <p className="text-[13px] font-black text-stone-800 truncate uppercase tracking-tight leading-tight">
                          {item.product?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                           <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                            SKU: {item.product?.id?.slice(0, 8).toUpperCase() || "N/A"}
                          </p>
                          <div className="h-0.5 w-0.5 rounded-full bg-stone-200" />
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                            {item.product?.origin || "Imported"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <p className={cn(
                          "text-2xl font-black tracking-tighter leading-none",
                          item.quantity > 10 ? "text-emerald-600" : item.quantity > 0 ? "text-amber-600" : "text-rose-600"
                        )}>
                          {item.quantity}
                        </p>
                        <span className="text-[10px] font-black text-stone-300">U</span>
                      </div>
                      <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1">Net Inventory</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <PackageX className="h-10 w-10 text-stone-200 mx-auto mb-4 opacity-50" />
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Inventory is empty</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-center">
             <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em]">Authorized Access Only</p>
          </div>
        </DialogContent>
      </Dialog>
      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white [&>button]:hidden">
          <div className="p-8 bg-stone-900 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black uppercase tracking-tight">Direct Inventory Transfer</h2>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Authorized Network Transmission Protocol</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Select Product SKU</label>
              <select 
                className="w-full h-12 bg-stone-50 border border-stone-100 rounded-2xl px-4 text-sm font-black text-stone-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                value={transferForm.productId}
                onChange={(e) => onProductSelect(e.target.value)}
              >
                <option value="">Choose a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Source Batch (Global Reserve)</label>
              <select 
                className="w-full h-12 bg-stone-50 border border-stone-100 rounded-2xl px-4 text-sm font-black text-stone-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none disabled:opacity-50"
                value={transferForm.batchId}
                disabled={!transferForm.productId}
                onChange={(e) => setTransferForm(prev => ({ ...prev, batchId: e.target.value }))}
              >
                <option value="">Select available batch...</option>
                {globalBatches.map(b => (
                  <option key={b.id || 'main'} value={b.id || ''}>
                    {b.no} ({b.qty} Units Available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest px-1">Transfer Magnitude (Units)</label>
              <Input
                type="number"
                min="1"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
                className="h-12 rounded-2xl border-stone-100 bg-stone-50 font-black text-lg focus:ring-2 focus:ring-indigo-500/20"
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => setTransferOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-stone-400 hover:bg-stone-50 transition-all"
              >
                Abort
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={transferLoading}
                className="flex-1 h-12 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {transferLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
