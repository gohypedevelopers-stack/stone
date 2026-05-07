import { useEffect, useMemo, useState } from "react";
import {
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
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
      if (summaryData.success) setSummary(summaryData.data || []);
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-[24px] border border-white/40 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 tracking-tight">Outlet Inventory Network</h2>
          <p className="text-sm font-medium text-stone-500 mt-2 flex items-center gap-2">
            <Store className="h-4 w-4 text-stone-400" />
            Create outlets, assign managers, and inspect independent outlet stock.
          </p>
        </div>
        <Button
          onClick={loadData}
          className="rounded-full px-6 py-5 bg-white text-stone-800 border border-stone-200 shadow-sm hover:shadow-md hover:bg-stone-50 hover:-translate-y-0.5 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Network
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-[32px] border-0 shadow-xl shadow-stone-200/40 bg-white/80 backdrop-blur-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                <ClipboardList className="h-4 w-4" />
              </span>
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-[20px] bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 border border-indigo-100/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400/80 relative z-10">Outlets</p>
                <p className="mt-2 text-3xl font-black text-indigo-900 relative z-10">{outlets.length}</p>
              </div>
              <div className="rounded-[20px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400/80 relative z-10">Products</p>
                <p className="mt-2 text-3xl font-black text-emerald-900 relative z-10">{summary.length}</p>
              </div>
              <div className="rounded-[20px] bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 border border-purple-100/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <p className="text-[10px] uppercase tracking-widest font-black text-purple-400/80 relative z-10">Movements</p>
                <p className="mt-2 text-3xl font-black text-purple-900 relative z-10">{movements.length}</p>
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {summary.slice(0, 6).map((item) => (
                <div key={item.productId} className="rounded-[20px] border border-stone-100/80 bg-white/60 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-black text-stone-900 leading-tight">{item.productName}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-stone-400 font-bold mt-1.5 flex items-center gap-1.5">
                        <Store className="h-3 w-3" />
                        {item.outlets?.length || 0} active outlets
                      </p>
                    </div>
                    <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 font-black px-3 py-1 text-xs">
                      {item.totalStock} units
                    </Badge>
                  </div>
                </div>
              ))}
              {!summary.length && !loading && (
                <div className="rounded-[24px] bg-stone-50/50 p-10 text-center flex flex-col items-center justify-center border border-dashed border-stone-200">
                  <Package2 className="h-8 w-8 text-stone-300 mb-3" />
                  <p className="text-sm font-semibold text-stone-400">No outlet inventory yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-0 shadow-xl shadow-stone-200/40 bg-white/80 backdrop-blur-3xl overflow-hidden">
        <CardHeader className="bg-stone-50/30 border-b border-stone-100 pb-5 px-8 pt-8">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-stone-500 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shadow-inner">
              <Store className="h-4 w-4" />
            </span>
            Outlet Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm font-bold tracking-widest uppercase text-[10px]">Loading Network...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {vendors.filter(v => v.approvalStatus === "APPROVED").length === 0 && !loading ? (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-4 border border-stone-100 shadow-sm">
                    <Store className="h-8 w-8 text-stone-300" />
                  </div>
                  <h3 className="text-lg font-black text-stone-900 mb-1">No Vendors Registered</h3>
                  <p className="text-sm font-medium text-stone-500 max-w-sm">
                    Approved vendors automatically appear here as independent outlets.
                  </p>
                </div>
              ) : (
                vendors.filter(v => v.approvalStatus === "APPROVED").map((vendor) => (
                <div key={vendor.id} className="group rounded-[28px] border border-stone-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-black text-stone-900 tracking-tight">{vendor.businessName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-stone-100 text-stone-600 border-none font-bold tracking-widest uppercase text-[9px] px-2.5 py-0.5">OUT-{vendor.id.slice(0,6).toUpperCase()}</Badge>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold tracking-widest uppercase text-[9px] px-2.5 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse" />
                          ACTIVE
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-full h-10 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-5 font-bold text-xs shadow-sm hover:shadow transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" onClick={() => openDetail(vendor.outletId ? { id: vendor.outletId, name: vendor.businessName } : null)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Inventory
                    </Button>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-[20px] bg-stone-50 p-5 border border-stone-100/50 transition-colors group-hover:bg-indigo-50/30 group-hover:border-indigo-100">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-black text-stone-400 group-hover:text-indigo-400 transition-colors">Owner</p>
                      <p className="mt-1.5 text-xl font-black text-stone-900 group-hover:text-indigo-900 truncate">{vendor.ownerName || vendor.businessName}</p>
                    </div>
                    <div className="rounded-[20px] bg-stone-50 p-5 border border-stone-100/50 transition-colors group-hover:bg-emerald-50/30 group-hover:border-emerald-100">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-black text-stone-400 group-hover:text-emerald-400 transition-colors">Category</p>
                      <p className="mt-1.5 text-xl font-black text-stone-900 group-hover:text-emerald-900 truncate">{vendor.businessCategory || "Retail"}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-stone-500 bg-stone-50 rounded-[16px] p-3 px-4">
                      <MapPin className="h-4 w-4 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{vendor.storeAddress || "No address on file"}</span>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-0 shadow-xl shadow-stone-200/40 bg-white/80 backdrop-blur-3xl overflow-hidden">
        <CardHeader className="bg-stone-50/30 border-b border-stone-100 pb-5 px-8 pt-8">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-stone-500 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shadow-inner">
              <Package2 className="h-4 w-4" />
            </span>
            Recent Stock Movements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50/80 border-b border-stone-100">
                <tr className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black">
                  <th className="py-5 px-8">Outlet</th>
                  <th className="py-5 px-4">Product</th>
                  <th className="py-5 px-4">Batch</th>
                  <th className="py-5 px-4">Movement</th>
                  <th className="py-5 px-4">Qty</th>
                  <th className="py-5 px-4">By</th>
                  <th className="py-5 px-8">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {movements.slice(0, 10).map((movement) => (
                  <tr key={movement.id} className="text-sm hover:bg-stone-50/50 transition-colors group">
                    <td className="py-4 px-8 font-bold text-stone-700">{movement.outlet?.name}</td>
                    <td className="py-4 px-4 font-black text-stone-900">{movement.product?.name}</td>
                    <td className="py-4 px-4 text-stone-500 font-medium">{movement.batch?.batchNo}</td>
                    <td className="py-4 px-4">
                      <Badge className="bg-stone-100 text-stone-700 border-none font-bold text-[10px] tracking-widest uppercase px-2.5 py-0.5">{movement.movementType}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-black ${movement.movementType === 'ADD' ? 'text-emerald-600' : movement.movementType === 'REDUCE' ? 'text-rose-600' : 'text-stone-900'}`}>
                        {movement.movementType === 'ADD' ? '+' : movement.movementType === 'REDUCE' ? '-' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-medium">{movement.performedBy?.ownerName || movement.performedBy?.businessName || "—"}</td>
                    <td className="py-4 px-8 text-stone-400 font-medium whitespace-nowrap">{formatDate(movement.createdAt)}</td>
                  </tr>
                ))}
                {!movements.length && !loading && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-stone-400 font-semibold text-sm">No stock movements found in the network.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailOutlet)} onOpenChange={(open) => !open && setDetailOutlet(null)}>
        <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] [&>button]:hidden">
          <div className="bg-stone-900 px-8 py-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
            <Button
              onClick={() => setDetailOutlet(null)}
              variant="ghost"
              className="absolute top-6 right-6 h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10 border border-white/5"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-inner">
                  <Store className="h-5 w-5" />
                </div>
                {detailOutlet?.name || "Vendor"} Inventory
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="bg-stone-50 p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {detailLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-stone-300 mb-5" />
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Loading Ledger...</p>
              </div>
            ) : detailInventory.length > 0 ? (
              <div className="space-y-3">
                {detailInventory.map((item) => (
                  <div key={item.id} className="group bg-white p-5 rounded-[24px] border border-stone-100/80 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-[16px] bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shrink-0">
                        <Package className="h-6 w-6 text-stone-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-stone-900 tracking-tight leading-tight group-hover:text-indigo-900 transition-colors max-w-[280px] sm:max-w-xs truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em] mt-1.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" />
                          SKU-{item.product?.id?.slice(0, 6) || "PRD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <Badge className={`font-black text-sm px-4 py-1.5 rounded-full border-none shadow-sm ${item.quantity > 5 ? "bg-emerald-50 text-emerald-600" : item.quantity > 0 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
                        {item.quantity} Units
                      </Badge>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-2 pr-1">
                        In Stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[24px] border border-dashed border-stone-200">
                <PackageX className="h-12 w-12 text-stone-200 mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[11px]">No active inventory</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
