import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  History,
  Loader2,
  MinusCircle,
  PackageOpen,
  QrCode,
  RefreshCw,
  Search,
  Store,
  Upload,
  Camera,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { API_URL, SERVER_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { THEME } from "@/theme";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SERVER_URL}/${String(url).replace(/^\//, "")}`;
};

export default function OutletInventoryWorkspace({ currentVendor, mode }) {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [code, setCode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanned, setScanned] = useState(null);
  const [reduceDialog, setReduceDialog] = useState(null);
  const [reduceQty, setReduceQty] = useState("1");
  const [reduceReason, setReduceReason] = useState("Damaged stock");
  const [reduceType, setReduceType] = useState("DAMAGE");
  const [submittingReduce, setSubmittingReduce] = useState(false);
  const [submittingIntake, setSubmittingIntake] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const isScanner = mode === "scanner";
  const isInventory = mode === "inventory";

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

  const handleScan = async (scannedCode) => {
    const targetCode = scannedCode || code;
    if (!targetCode.trim()) {
      toast.error("Enter or scan a code first");
      return;
    }

    setScanLoading(true);
    try {
      const resp = await fetch(`${API_URL}/outlet/scan-code`, {
        method: "POST",
        headers: vendorHeaders,
        body: JSON.stringify({ code: targetCode.trim() }),
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

  useEffect(() => {
    let html5QrCode;
    let timer;

    if (showScanner) {
      // Delay initialization to ensure the DOM element inside the Dialog is rendered
      timer = setTimeout(() => {
        const scannerElement = document.getElementById("scanner-reader");
        if (!scannerElement) return;

        html5QrCode = new Html5Qrcode("scanner-reader");

        // Optimized config for industrial barcodes
        const config = {
          fps: 20, // Higher FPS for smoother detection
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // wider box for barcodes
            const width = Math.min(viewfinderWidth * 0.8, 300);
            const height = Math.min(viewfinderHeight * 0.4, 150);
            return { width, height };
          },
          aspectRatio: 1.0,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        };

        html5QrCode
          .start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Haptic feedback
              if (navigator.vibrate) navigator.vibrate(100);

              setCode(decodedText);
              setShowScanner(false);
              handleScan(decodedText);
            },
            (errorMessage) => {
              // ignore scan errors
            },
          )
          .catch((err) => {
            console.error("Camera error:", err);
            toast.error("Unable to access camera. Check permissions.");
            setShowScanner(false);
          });
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [showScanner]);

  const handleConfirmIntake = async () => {
    if (!scanned?.batch?.id || !scanned?.batch?.initialQuantity) {
      toast.error("No valid quantity defined for this batch");
      return;
    }

    setSubmittingIntake(true);
    try {
      const resp = await fetch(`${API_URL}/outlet/inventory/add`, {
        method: "POST",
        headers: vendorHeaders,
        body: JSON.stringify({
          batchId: scanned.batch.id,
          quantity: scanned.batch.initialQuantity,
          reason: "Received batch via barcode scan confirmation",
        }),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to confirm receipt");
        return;
      }
      toast.success(
        `Successfully received ${scanned.batch.initialQuantity} units`,
      );
      setScanned(null);
      setCode("");
      await loadData();
    } catch (error) {
      toast.error("Failed to receive stock");
    } finally {
      setSubmittingIntake(false);
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
        <h2 className="text-2xl font-black text-[#151515]">
          No Outlet Assigned
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          This account is approved but is not yet assigned to an outlet. Ask
          admin to assign one.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500 text-white border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
              <Store className="h-3 w-3 mr-1.5" />
              {currentVendor?.outlet?.name || "Assigned Outlet"}
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {isScanner ? "Scan & Stock Intake" : "Outlet Inventory Management"}
          </h2>
          <p className="text-sm text-stone-500 font-medium lowercase first-letter:uppercase">
            {isScanner
              ? "Scan label codes or QR values to resolve product details and verify batch authenticity."
              : "Manage and monitor real-time stock levels and movement history for your assigned outlet."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            className="h-10 px-5 font-black text-[10px] uppercase tracking-widest border-stone-200 hover:bg-stone-50 rounded-[2px]"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Sync Data
          </Button>
        </div>
      </div>

      {isScanner && (
        <div className="grid grid-cols-1 gap-8 max-w-5xl">
          <div className="bg-white border border-stone-200 overflow-hidden shadow-sm rounded-[2px]">
            <div className="h-1 w-full bg-stone-900" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg shadow-stone-900/20">
                  <QrCode size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-stone-900 uppercase tracking-widest">
                    Code Resolution
                  </h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                    Resolve scannable assets to batches
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter LABEL-XXXX or QR Value"
                    className="w-full h-12 border border-stone-200 bg-stone-50/30 pl-11 pr-12 font-semibold text-sm outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 rounded-[2px] transition-all"
                  />
                  <button
                    onClick={() => setShowScanner(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <Camera size={18} />
                  </button>
                </div>
                <Button
                  onClick={handleScan}
                  disabled={scanLoading}
                  className="h-12 bg-stone-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 transition-all active:scale-95 rounded-[2px]"
                >
                  {scanLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Resolve Code"
                  )}
                </Button>
              </div>

              {scanned && (
                <div className="mt-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="rounded-[2px] border border-stone-100 bg-stone-50/50 p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="shrink-0">
                        {scanned.product?.image ? (
                          <img
                            src={getMediaUrl(scanned.product.image)}
                            className="w-40 h-40 rounded-[2px] object-cover border border-stone-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-40 h-40 rounded-[2px] bg-white flex items-center justify-center border border-stone-100">
                            <PackageOpen className="h-12 w-12 text-stone-200" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-5">
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                            {scanned.product?.category?.name ||
                              "General Category"}
                          </p>
                          <p className="text-3xl font-black text-stone-900 leading-tight tracking-tight">
                            {scanned.product?.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#9a6bff] uppercase tracking-widest mt-2 bg-purple-50 w-fit px-2 py-0.5 rounded-[2px]">
                            SKU: {scanned.product?.sku || "—"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="px-3 py-2 bg-white border border-stone-100 rounded-[2px] flex flex-col min-w-[100px]">
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                              Net Weight
                            </span>
                            <span className="text-sm font-black text-stone-900">
                              {scanned.batch?.weight || "—"}{" "}
                              {scanned.batch?.unit || ""}
                            </span>
                          </div>
                          <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-[2px] flex flex-col min-w-[100px]">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                              Current Stock
                            </span>
                            <span className="text-sm font-black text-emerald-700">
                              {scanned.currentOutletStock || 0} Units
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-stone-400" />
                            <div>
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                Production
                              </p>
                              <p className="text-xs font-bold text-stone-800">
                                {formatDate(scanned.batch?.productionDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-stone-400" />
                            <div>
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                Expiry
                              </p>
                              <p
                                className={cn(
                                  "text-xs font-bold",
                                  scanned.batch?.isExpired
                                    ? "text-rose-500"
                                    : "text-stone-800",
                                )}
                              >
                                {formatDate(scanned.batch?.expiryDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-stone-200/60">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                              Ready for Intake
                            </p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              Admin set quantity:{" "}
                              {scanned.batch?.initialQuantity || 0} Units
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setScanned(null);
                              setCode("");
                            }}
                            className="flex-1 md:flex-none h-12 border-stone-200 text-stone-600 font-black text-[10px] uppercase tracking-widest px-8 rounded-[2px]"
                          >
                            Clear
                          </Button>
                          <Button
                            onClick={handleConfirmIntake}
                            disabled={
                              submittingIntake || scanned.batch?.isExpired
                            }
                            className="flex-1 md:flex-none h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-10 rounded-[2px] shadow-lg shadow-emerald-600/20"
                          >
                            {submittingIntake ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Confirm Receipt"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isInventory && (
        <div className="flex flex-col gap-10">
          <div className="min-w-0">
            <div className="bg-white border border-stone-200 overflow-hidden shadow-sm rounded-[2px]">
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                <div>
                  <h3 className="text-[16px] font-black text-stone-900 tracking-tight">
                    Active Outlet Inventory
                  </h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    Real-time batch-wise stock levels
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-50 border-t-emerald-500" />
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                    Synchronizing stock...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50/50 border-b border-stone-100">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                          Product Focus
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                          Batch Context
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                          Expiration
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">
                          Available Units
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {inventory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50/30 transition-colors group"
                        >
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-[2px] bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                                {item.product?.imageUrls?.[0] ? (
                                  <img
                                    src={getMediaUrl(item.product.imageUrls[0])}
                                    className="w-full h-full rounded-[2px] object-cover"
                                  />
                                ) : (
                                  <Box className="h-5 w-5 text-stone-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-stone-900 truncate leading-none mb-1">
                                  {item.product?.name}
                                </p>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  SKU:{" "}
                                  {item.product?.sku ||
                                    item.product?.slug ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-stone-100 text-stone-600 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-[2px] w-fit">
                                {item.batch?.batchNo}
                              </Badge>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                {item.batch?.weight || "—"}{" "}
                                {item.batch?.unit || ""} | ₹
                                {item.batch?.mrp || "0"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "text-[11px] font-bold tracking-tight",
                                new Date(item.batch?.expiryDate) < new Date()
                                  ? "text-rose-500"
                                  : "text-stone-600",
                              )}
                            >
                              {formatDate(item.batch?.expiryDate)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              className={cn(
                                "px-3 py-1 text-[11px] font-black border-none min-w-[70px] justify-center rounded-[2px]",
                                item.quantity <= 5
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-emerald-50 text-emerald-700",
                              )}
                            >
                              {item.quantity} UNITS
                            </Badge>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[9px] font-black uppercase tracking-widest border-stone-200 hover:border-rose-200 hover:text-rose-600 h-8 px-3 rounded-[2px]"
                              onClick={() => setReduceDialog(item)}
                            >
                              <MinusCircle className="h-3.5 w-3.5 mr-1.5" />
                              Deduct Stock
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!inventory.length && !loading && (
                        <tr>
                          <td colSpan="5" className="px-8 py-24 text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-200 mb-4">
                              <PackageOpen size={32} />
                            </div>
                            <p className="text-sm font-black text-stone-300 uppercase tracking-widest">
                              Your outlet inventory is empty
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 overflow-hidden shadow-sm rounded-[2px] min-w-0">
            <div className="px-6 py-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-500" />
                  Movement History
                </h3>
              </div>
            </div>
            <div
              className="p-6 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar"
              data-lenis-prevent
            >
              {movements.slice(0, 30).map((movement) => (
                <div
                  key={movement.id}
                  className="group relative pl-6 border-l-2 border-stone-100 hover:border-emerald-200 transition-colors py-1"
                >
                  <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-stone-200 group-hover:bg-emerald-500 transition-colors" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-stone-900 leading-tight truncate">
                        {movement.product?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                          BATCH: {movement.batch?.batchNo}
                        </span>
                        <div className="h-0.5 w-0.5 rounded-full bg-stone-200" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                          {formatDate(movement.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none rounded-[2px] shrink-0",
                        movement.movementType === "ADD"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700",
                      )}
                    >
                      {movement.movementType === "ADD"
                        ? `+${movement.quantity}`
                        : `-${movement.quantity}`}
                    </Badge>
                  </div>
                  {movement.reason && (
                    <p className="mt-2 text-[11px] font-medium text-stone-500 italic lowercase first-letter:uppercase leading-relaxed">
                      {movement.reason}
                    </p>
                  )}
                </div>
              ))}
              {!movements.length && !loading && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                    No history recorded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(reduceDialog)}
        onOpenChange={(open) => !open && setReduceDialog(null)}
      >
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-none md:rounded-[5px] [&>button]:hidden">
          {reduceDialog && (
            <div className="bg-white">
              <div className="bg-[#151515] px-6 py-8 text-white relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <Badge className="bg-rose-500 text-white border-none px-3 py-0.5 text-[8px] font-black uppercase tracking-widest mb-2">
                      Stock Update
                    </Badge>
                    <h2 className="text-2xl font-black tracking-tighter leading-none">
                      Remove Items
                    </h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                      Reducing your store inventory
                    </p>
                  </div>
                  <div className="h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 flex">
                    <MinusCircle size={24} className="text-rose-500" />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-5 border-b border-stone-100 pb-6">
                  <div className="h-16 w-16 rounded-[4px] bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0 overflow-hidden shadow-sm">
                    {reduceDialog.product?.imageUrls?.[0] ? (
                      <img 
                        src={getMediaUrl(reduceDialog.product.imageUrls[0])} 
                        className="w-full h-full object-cover"
                        alt="Product"
                      />
                    ) : (
                      <Box className="h-6 w-6 text-stone-200" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-stone-900 leading-tight">
                      {reduceDialog.product?.name}
                    </p>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Batch {reduceDialog.batch?.batchNo} • Current Stock:{" "}
                      <span className="text-stone-900">{reduceDialog.quantity}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      How many units?
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max={reduceDialog.quantity}
                        value={reduceQty}
                        onChange={(e) => setReduceQty(e.target.value)}
                        className={cn(
                          THEME.borders.adminRadius.input,
                          "h-12 font-black text-lg pl-4 pr-10",
                        )}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-300 uppercase">QTY</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Reason for removal
                    </label>
                    <div className="relative">
                      <select
                        value={reduceType}
                        onChange={(e) => setReduceType(e.target.value)}
                        className={cn(
                          THEME.borders.adminRadius.input,
                          "h-12 w-full appearance-none border border-stone-200 bg-white px-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:border-stone-900 transition-all",
                        )}
                      >
                        <option value="DAMAGE">Damaged Stock</option>
                        <option value="EXPIRED">Expired Batch</option>
                        <option value="SALE">Offline Checkout</option>
                        <option value="CORRECTION">System Correction</option>
                        <option value="REDUCE">Manual Reduction</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Additional Note
                  </label>
                  <Input
                    value={reduceReason}
                    onChange={(e) => setReduceReason(e.target.value)}
                    className={cn(
                      THEME.borders.adminRadius.input,
                      "h-12 font-medium text-sm",
                    )}
                    placeholder="e.g. Broken seal found during audit..."
                  />
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button
                    onClick={handleReduceInventory}
                    disabled={submittingReduce}
                    className={cn(
                      THEME.borders.adminRadius.button,
                      "flex-1 bg-stone-900 hover:bg-black text-white py-7 font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-stone-200",
                    )}
                  >
                    {submittingReduce ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm & Reduce"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setReduceDialog(null)}
                    className={cn(
                      THEME.borders.adminRadius.button,
                      "px-8 py-7 border-stone-200 text-stone-400 font-black text-[10px] uppercase tracking-widest hover:bg-stone-50",
                    )}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-[#0a0a0a]">
          <DialogHeader className="p-6 bg-[#111] border-b border-white/5 space-y-1">
            <DialogTitle className="text-sm font-black text-white uppercase tracking-[0.3em] text-center">
              Precision Scanner
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">
              Align barcode within the target frame
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[300px] bg-black overflow-hidden">
            {/* The Engine Container - Hidden library UI elements */}
            <div
              id="scanner-reader"
              className="w-full h-full [&_video]:object-cover [&_canvas]:hidden [&_div]:!border-none [&_div]:!bg-transparent"
            />

            {/* Industrial Overlay - Single Green Scanner */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Scanning Box - Wide for Barcodes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-32">
                {/* Corners with Glow */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

                {/* Animated Scan Line */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20"
                  style={{
                    animation: "scanMove 2s ease-in-out infinite",
                    top: "0%",
                  }}
                />
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  @keyframes scanMove {
                    0%, 100% { top: 0%; opacity: 0.2; }
                    50% { top: 100%; opacity: 1; }
                  }
                `,
                  }}
                />
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">
                    Live Decoding...
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#111] border-t border-white/5 flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowScanner(false)}
              className="h-12 px-10 font-black text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-xl"
            >
              Abort Mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
