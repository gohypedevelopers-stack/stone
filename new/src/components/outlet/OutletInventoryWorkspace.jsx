import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  CalendarDays,
  History,
  Loader2,
  MinusCircle,
  PackageOpen,
  QrCode,
  RefreshCw,
  Search,
  Store,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL, SERVER_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SERVER_URL}/${String(url).replace(/^\//, "")}`;
};

export default function OutletInventoryWorkspace({ currentVendor }) {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [code, setCode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanned, setScanned] = useState(null);
  const [addQty, setAddQty] = useState("1");
  const [addReason, setAddReason] = useState("Received stock via barcode scan");
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [reduceDialog, setReduceDialog] = useState(null);
  const [reduceQty, setReduceQty] = useState("1");
  const [reduceReason, setReduceReason] = useState("Damaged stock");
  const [reduceType, setReduceType] = useState("DAMAGE");
  const [submittingReduce, setSubmittingReduce] = useState(false);

  const vendorHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-vendor-id": currentVendor?.id || "",
    }),
    [currentVendor?.id],
  );

  const loadData = async () => {
    if (!currentVendor?.id || !currentVendor?.outletId) return;
    setLoading(true);
    try {
      const [inventoryRes, movementRes] = await Promise.all([
        fetch(`${API_URL}/outlet/inventory`, { headers: vendorHeaders }),
        fetch(`${API_URL}/outlet/stock-movements`, { headers: vendorHeaders }),
      ]);
      const [inventoryData, movementData] = await Promise.all([
        inventoryRes.json(),
        movementRes.json(),
      ]);
      if (inventoryData.success) setInventory(inventoryData.data?.items || []);
      if (movementData.success) setMovements(movementData.data?.items || []);
    } catch (error) {
      toast.error("Failed to load outlet inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentVendor?.id, currentVendor?.outletId]);

  const handleScan = async () => {
    if (!code.trim()) {
      toast.error("Enter or scan a code first");
      return;
    }

    setScanLoading(true);
    try {
      const resp = await fetch(`${API_URL}/outlet/scan-code`, {
        method: "POST",
        headers: vendorHeaders,
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Scan failed");
        setScanned(null);
        return;
      }
      setScanned(data.data);
      toast.success("Product scanned");
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setScanLoading(false);
    }
  };

  const handleAddInventory = async () => {
    if (!scanned?.batch?.id) return;
    setSubmittingAdd(true);
    try {
      const resp = await fetch(`${API_URL}/outlet/inventory/add`, {
        method: "POST",
        headers: vendorHeaders,
        body: JSON.stringify({
          batchId: scanned.batch.id,
          quantity: Number(addQty),
          reason: addReason,
        }),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to add inventory");
        return;
      }
      toast.success("Stock added to your outlet");
      setScanned((prev) =>
        prev
          ? {
              ...prev,
              currentOutletStock: data.data.newQuantity,
            }
          : prev,
      );
      setAddQty("1");
      await loadData();
    } catch (error) {
      toast.error("Failed to add inventory");
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleReduceInventory = async () => {
    if (!reduceDialog?.batch?.id) return;
    setSubmittingReduce(true);
    try {
      const resp = await fetch(`${API_URL}/outlet/inventory/reduce`, {
        method: "POST",
        headers: vendorHeaders,
        body: JSON.stringify({
          batchId: reduceDialog.batch.id,
          quantity: Number(reduceQty),
          reason: reduceReason,
          movementType: reduceType,
        }),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to reduce inventory");
        return;
      }
      toast.success("Stock reduced from your outlet");
      setReduceDialog(null);
      setReduceQty("1");
      setReduceReason("Damaged stock");
      setReduceType("DAMAGE");
      await loadData();
    } catch (error) {
      toast.error("Failed to reduce inventory");
    } finally {
      setSubmittingReduce(false);
    }
  };

  if (!currentVendor?.outletId) {
    return (
      <div className="bg-white rounded-[2px] border border-gray-100 p-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-black text-[#151515]">No Outlet Assigned</h2>
        <p className="text-sm text-gray-500 mt-2">
          This account is approved but is not yet assigned to an outlet. Ask admin to assign one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-none">
              <Store className="h-3.5 w-3.5 mr-1.5" />
              {currentVendor?.outlet?.name || "Assigned Outlet"}
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-[#151515]">Outlet Inventory Scanner</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scan label codes, add stock to your outlet, and reduce stock with reasons.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} className="rounded-full font-black text-[10px] uppercase tracking-widest">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white p-6 rounded-[2px] border border-gray-100">
          <h3 className="text-lg font-black text-[#151515] flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#9a6bff]" />
            Scan Product Label
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Use manual code entry for now. Paste the printed label code, QR value, or barcode value.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LABEL-XXXX or BAR-XXXX"
                className="w-full h-12 rounded-full border border-gray-200 bg-white pl-11 pr-4 font-semibold text-sm outline-none focus:ring-2 focus:ring-[#9a6bff]"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={scanLoading}
              className="h-12 rounded-full bg-[#151515] hover:bg-black text-white font-black text-[10px] uppercase tracking-widest px-8"
            >
              {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
              Resolve Code
            </Button>
          </div>

          {scanned && (
            <div className="mt-6 rounded-[20px] border border-stone-200 bg-stone-50/40 p-5">
              <div className="flex items-start gap-4">
                {scanned.product?.image ? (
                  <img src={getMediaUrl(scanned.product.image)} className="w-20 h-20 rounded-[10px] object-cover border border-stone-100" />
                ) : (
                  <div className="w-20 h-20 rounded-[10px] bg-purple-50 flex items-center justify-center border border-purple-100">
                    <PackageOpen className="h-8 w-8 text-purple-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-black text-[#151515]">{scanned.product?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">SKU {scanned.product?.sku || "—"}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-white text-stone-700 border border-stone-200">Batch {scanned.batch?.batchNo}</Badge>
                    <Badge className="bg-white text-stone-700 border border-stone-200">MRP {scanned.batch?.mrp || "—"}</Badge>
                    <Badge className="bg-white text-stone-700 border border-stone-200">
                      Stock {scanned.currentOutletStock || 0}
                    </Badge>
                    {scanned.batch?.isExpired && (
                      <Badge className="bg-rose-50 text-rose-700 border-none">Expired</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[16px] bg-white border border-stone-100 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Production / Expiry
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-800">
                    {formatDate(scanned.batch?.productionDate)} to {formatDate(scanned.batch?.expiryDate)}
                  </p>
                </div>
                <div className="rounded-[16px] bg-white border border-stone-100 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Weight / Unit</p>
                  <p className="mt-2 text-sm font-semibold text-stone-800">
                    {scanned.batch?.weight ? `${scanned.batch.weight}${scanned.batch.unit || ""}` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Ingredients</p>
                <p className="text-sm text-stone-700">
                  {scanned.batch?.ingredients || scanned.product?.ingredients || "—"}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="h-11 rounded-full border border-gray-200 px-4 font-bold outline-none focus:ring-2 focus:ring-[#9a6bff]"
                />
                <input
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  className="h-11 rounded-full border border-gray-200 px-4 font-medium outline-none focus:ring-2 focus:ring-[#9a6bff]"
                  placeholder="Reason for add"
                />
              </div>
              <Button
                onClick={handleAddInventory}
                disabled={submittingAdd || scanned.batch?.isExpired}
                className="mt-4 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-8"
              >
                {submittingAdd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Add To Outlet Inventory
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2px] border border-gray-100">
          <h3 className="text-lg font-black text-[#151515] flex items-center gap-2">
            <History className="h-5 w-5 text-[#9a6bff]" />
            Recent Movement History
          </h3>
          <div className="mt-5 space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {movements.slice(0, 12).map((movement) => (
              <div key={movement.id} className="rounded-[18px] border border-stone-100 bg-stone-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-stone-900">{movement.product?.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                      {movement.batch?.batchNo}
                    </p>
                  </div>
                  <Badge className="bg-white text-stone-700 border border-stone-200">{movement.movementType}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-stone-500">Qty {movement.quantity}</span>
                  <span className="font-semibold text-stone-700">{formatDate(movement.createdAt)}</span>
                </div>
                {movement.reason && <p className="mt-2 text-sm text-stone-600">{movement.reason}</p>}
              </div>
            ))}
            {!movements.length && !loading && (
              <div className="rounded-[18px] bg-stone-50 p-10 text-center text-sm text-stone-400">
                No stock movements yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-black text-[#151515]">Current Outlet Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Batch-wise stock available in your assigned outlet.</p>
        </div>
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Batch</th>
                  <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.product?.imageUrls?.[0] ? (
                          <img src={getMediaUrl(item.product.imageUrls[0])} className="w-10 h-10 rounded-[2px] object-cover border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-[2px] bg-purple-50 flex items-center justify-center">
                            <Box className="h-4 w-4 text-purple-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#151515]">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">SKU {item.product?.sku || item.product?.slug || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.batch?.batchNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.batch?.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <Badge className={item.quantity <= 5 ? "bg-rose-50 text-rose-700 border-none" : "bg-emerald-50 text-emerald-700 border-none"}>
                        {item.quantity} units
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setReduceDialog(item)}
                      >
                        <MinusCircle className="h-4 w-4 mr-2" />
                        Reduce
                      </Button>
                    </td>
                  </tr>
                ))}
                {!inventory.length && !loading && (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-gray-400 text-sm">
                      No inventory in this outlet yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(reduceDialog)} onOpenChange={(open) => !open && setReduceDialog(null)}>
        <DialogContent className="max-w-xl rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-stone-900">
              Reduce Outlet Stock
            </DialogTitle>
          </DialogHeader>
          {reduceDialog && (
            <div className="space-y-4">
              <div className="rounded-[20px] bg-stone-50 border border-stone-100 p-4">
                <p className="text-lg font-black text-stone-900">{reduceDialog.product?.name}</p>
                <p className="text-sm text-stone-500 mt-1">
                  Batch {reduceDialog.batch?.batchNo} • Current stock {reduceDialog.quantity}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  min="1"
                  value={reduceQty}
                  onChange={(e) => setReduceQty(e.target.value)}
                  className="h-11 rounded-full border border-gray-200 px-4 font-bold outline-none focus:ring-2 focus:ring-[#9a6bff]"
                />
                <select
                  value={reduceType}
                  onChange={(e) => setReduceType(e.target.value)}
                  className="h-11 rounded-full border border-gray-200 px-4 font-semibold outline-none"
                >
                  <option value="DAMAGE">Damaged</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="SALE">Offline Sale</option>
                  <option value="CORRECTION">Manual Correction</option>
                  <option value="REDUCE">Reduce</option>
                </select>
              </div>
              <input
                value={reduceReason}
                onChange={(e) => setReduceReason(e.target.value)}
                className="h-11 w-full rounded-full border border-gray-200 px-4 font-medium outline-none focus:ring-2 focus:ring-[#9a6bff]"
                placeholder="Reason"
              />
              <Button
                onClick={handleReduceInventory}
                disabled={submittingReduce}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 font-black text-[10px] uppercase tracking-widest"
              >
                {submittingReduce ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reduction"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
