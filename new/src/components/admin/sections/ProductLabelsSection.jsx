import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  Loader2,
  Package,
  Printer,
  QrCode,
  RefreshCw,
  Tags,
  ChevronDown,
  Search,
  FileText,
  User,
  MapPin,
  Clock,
  Scale,
  Box,
  Check,
  ShieldCheck,
  History,
  PackagePlus,
} from "lucide-react";
import { toast } from "sonner";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import { API_URL, SERVER_URL } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { THEME } from "@/theme";
import { cn } from "@/lib/utils";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export default function ProductLabelsSection({
  products = [],
  vendors = [],
  initialProductId = "",
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labels, setLabels] = useState([]);
  const [movements, setMovements] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    batchNo: "",
    mrp: "",
    ingredients: "",
    productionDate: "",
    expiryDate: "",
    weight: "",
    quantity: "1",
  });
  
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const productOptions = useMemo(
    () => products.filter((p) => p.status === "ACTIVE" && p.name && p.name.length > 3 && !['brand', 'product'].includes(p.name.toLowerCase().trim())),
    [products],
  );

  const filteredProducts = useMemo(
    () => productSearch ? productOptions.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())) : productOptions,
    [productOptions, productSearch],
  );

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SERVER_URL}/${String(url).replace(/^\//, "")}`;
  };

  const selectedProduct = useMemo(
    () => productOptions.find((product) => product.id === form.productId),
    [productOptions, form.productId],
  );

  const globalVendor = useMemo(
    () => vendors.find((v) => v.businessName?.toLowerCase().includes("admin stock") || v.businessName?.toLowerCase().includes("global")),
    [vendors]
  );

  const globalStock = useMemo(() => {
    if (!selectedProduct || !globalVendor) return 0;
    // In our system, VendorStock 'quantity' is the field for stock levels
    const record = selectedProduct.stockRecords?.find(r => r.vendorId === globalVendor.id);
    return record ? record.quantity : 0; 
  }, [selectedProduct, globalVendor]);

  const loadLabels = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/product-labels`);
      const data = await resp.json();
      if (data.success) {
        setLabels(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch labels");
      }
    } catch (error) {
      toast.error("Failed to fetch labels");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const resp = await fetch(`${API_URL}/admin/stock-movements?movementType=ADD`);
      const data = await resp.json();
      if (data.success) {
        setMovements(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadLabels();
    loadHistory();
  }, []);

  useEffect(() => {
    if (!initialProductId) return;
    setForm((prev) =>
      prev.productId === initialProductId
        ? prev
        : {
            ...prev,
            productId: initialProductId,
            mrp: "",
            ingredients: "",
            weight: "",
            unit: "",
          },
    );
  }, [initialProductId]);

  useEffect(() => {
    if (!selectedProduct) return;
    setForm((prev) => ({
      ...prev,
      mrp: prev.mrp || selectedProduct.defaultMrp || selectedProduct.originalPrice || selectedProduct.price || "",
      ingredients: prev.ingredients || selectedProduct.ingredients || "",
      weight: prev.weight || selectedProduct.defaultWeight || "",
      unit: prev.unit || selectedProduct.unit || "",
    }));
  }, [selectedProduct]);

  const createLabel = async () => {
    if (!form.productId || !form.batchNo) {
      toast.error("Product and batch number are required");
      return;
    }

    setSaving(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
      const payload = {
        ...form,
        adminId: adminUser?.id,
        sourceVendorId: globalVendor?.id,
      };
      const resp = await fetch(`${API_URL}/admin/product-labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || "Failed to create label");
        return;
      }
      toast.success("Product label created");
      setForm({
        productId: form.productId,
        batchNo: "",
        mrp: selectedProduct?.defaultMrp || selectedProduct?.originalPrice || selectedProduct?.price || "",
        ingredients: selectedProduct?.ingredients || "",
        productionDate: "",
        expiryDate: "",
        weight: selectedProduct?.defaultWeight || "",
        quantity: "1",
      });
      await loadLabels();
    } catch (error) {
      toast.error("Failed to create label");
    } finally {
      setSaving(false);
    }
  };

  const openPrintPreview = async (label) => {
    setSelectedLabel(label);
    setPrintLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/product-labels/${label.id}/print`);
      const data = await resp.json();
      if (data.success) {
        setPrintData(data.data);
      } else {
        toast.error(data.message || "Failed to load print data");
      }
    } catch (error) {
      toast.error("Failed to load print data");
    } finally {
      setPrintLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printData) return;
    window.print();
  };

  return (
    <div id="product-labels-panel" className="space-y-6 animate-in fade-in duration-500 scroll-mt-8">
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 0mm; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          body * { visibility: hidden; }
          #printable-label-content, #printable-label-content * { visibility: visible; }
          #printable-label-content { 
            position: absolute; 
            left: 50%; 
            top: 20mm; 
            transform: translateX(-50%);
            width: 100mm;
            padding: 15mm;
            border: 2px solid #000;
            background: #fff !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:flex { display: flex !important; }
          .print\\:text-black { color: #000 !important; }
          .print\\:border-black { border-color: #000 !important; }
        }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className={cn(THEME.typography.headings.h1, "text-stone-900")}>
            Production Batch Management
          </h2>
          <p className={cn(THEME.typography.micro.muted, "tracking-normal lowercase first-letter:uppercase text-stone-500")}>
            Define batch identities and synchronize global reserves into scannable assets.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadLabels}
          className={cn(THEME.borders.adminRadius.button, "px-5 font-black text-[10px] uppercase tracking-widest border-stone-200 hover:bg-stone-50")}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          <Card className={cn(THEME.borders.adminRadius.card, "border-stone-200 overflow-hidden shadow-sm")}>
            <div className={cn(THEME.gradients.adminBrand, "h-1.5 w-full")} />
            <CardHeader className="pb-2 pt-5">
              <CardTitle className={cn(THEME.typography.micro.default, "text-indigo-600 flex items-center gap-2")}>
                <Tags className="h-4 w-4" />
                Initialize Batch Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Searchable Product Selector */}
              <div className="space-y-2">
                <label className={THEME.typography.micro.muted}>Master SKU Definition</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={showProductDropdown ? productSearch : (selectedProduct?.name || "")}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search products..."
                    className={cn(
                      THEME.borders.adminRadius.input,
                      "h-12 w-full border border-stone-200 bg-white pl-11 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
                    )}
                  />
                  <ChevronDown className={cn("absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none transition-transform", showProductDropdown && "rotate-180")} />
                  {showProductDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                      {filteredProducts.length ? filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, productId: product.id, mrp: "", ingredients: "", weight: "", unit: "" }));
                            setProductSearch("");
                            setShowProductDropdown(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-stone-50 last:border-none",
                            form.productId === product.id && "bg-emerald-50"
                          )}
                        >
                          <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {product.imageUrls?.[0] ? (
                              <img src={getMediaUrl(product.imageUrls[0])} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-stone-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-stone-900 truncate">{product.name}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">₹{product.price || product.originalPrice || "—"}</p>
                          </div>
                          {form.productId === product.id && <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />}
                        </button>
                      )) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-xs font-bold text-stone-400">No products found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Click-away handler */}
                {showProductDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowProductDropdown(false)} />}
              </div>

              {/* Selected Product Preview */}
              {selectedProduct && (
                <div className="rounded-lg border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white p-4 flex items-center gap-4 animate-in fade-in duration-300">
                  <div className="h-14 w-14 rounded-lg bg-white border border-stone-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {selectedProduct.imageUrls?.[0] ? (
                      <img src={getMediaUrl(selectedProduct.imageUrls[0])} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-stone-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-stone-900 truncate">{selectedProduct.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0">Selected</Badge>
                      <span className="text-[10px] font-bold text-stone-400">₹{selectedProduct.price || selectedProduct.originalPrice || "—"}</span>
                      <span className="text-stone-300">/</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total: {selectedProduct.stock || 0}</span>
                      {globalVendor && (
                        <>
                          <span className="text-stone-300">|</span>
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md">Global: {globalStock}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setForm(prev => ({ ...prev, productId: "", mrp: "", ingredients: "", weight: "", unit: "" }))} className="text-stone-400 hover:text-rose-500 transition-colors p-1">
                    <span className="text-lg leading-none">×</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={THEME.typography.micro.muted}>Batch Number</label>
                  <Input
                    placeholder="e.g. BATCH-001"
                    value={form.batchNo}
                    onChange={(e) => setForm((prev) => ({ ...prev, batchNo: e.target.value }))}
                    className={cn(THEME.borders.adminRadius.input, "h-11 font-semibold")}
                  />
                </div>

                <div className="space-y-2">
                  <label className={THEME.typography.micro.muted}>MRP (₹)</label>
                  <Input
                    readOnly
                    placeholder="Price"
                    type="number"
                    value={form.mrp}
                    className={cn(THEME.borders.adminRadius.input, "h-11 font-semibold bg-stone-50 cursor-not-allowed")}
                  />
                </div>

                <div className="space-y-2">
                  <label className={THEME.typography.micro.muted}>Weight (ml/gm/units)</label>
                  <Input
                    placeholder="e.g. 100"
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                    className={cn(THEME.borders.adminRadius.input, "h-11 font-semibold")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className={THEME.typography.micro.muted}>Production Date</label>
                    <Input
                      type="date"
                      value={form.productionDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, productionDate: e.target.value }))}
                      className={cn(THEME.borders.adminRadius.input, "h-11 font-semibold")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={THEME.typography.micro.muted}>Expiry Date</label>
                    <Input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      className={cn(THEME.borders.adminRadius.input, "h-11 font-semibold")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={THEME.typography.micro.muted}>Intake Quantity (From Admin Stock)</label>
                    {globalVendor && (
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Available: {globalStock}</span>
                    )}
                  </div>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                    <Input
                      type="number"
                      placeholder="Amount to deduct from Admin Stock"
                      value={form.quantity}
                      onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                      className={cn(THEME.borders.adminRadius.input, "h-11 pl-10 font-black text-indigo-600")}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-stone-400 italic">This quantity will be deducted from Admin Stock registry.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={THEME.typography.micro.muted}>Full Ingredients</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="Paste ingredients list here..."
                  className={cn(
                    THEME.borders.adminRadius.input,
                    "w-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium outline-none min-h-[80px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none",
                  )}
                />
              </div>

              <Button
                onClick={createLabel}
                disabled={saving || !form.productId || !form.batchNo}
                className={cn(
                  THEME.borders.adminRadius.button,
                  "w-full h-12 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]",
                  form.productId && form.batchNo
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg mb-4 shadow-emerald-600/20"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200",
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    {form.productId && form.batchNo ? "Authorize Batch & Deduct Global Stock" : "Complete Parameters First"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className={cn(THEME.borders.adminRadius.card, "border-stone-200 shadow-sm")}>
            <CardHeader className="pb-0 pt-4">
              <CardTitle className={cn(THEME.typography.micro.default, "text-stone-500 flex items-center gap-2")}>
                <QrCode className="h-4 w-4" />
                Audit: Batch Generation Log
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-100 border-t-emerald-500" />
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Loading records...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className={cn(
                        THEME.borders.adminRadius.card,
                        "border border-stone-100 bg-white px-4 py-3 hover:border-emerald-200 hover:shadow-sm transition-all group",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-stone-900 leading-tight truncate">
                            {label.product?.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                              Batch {label.batchNo}
                            </Badge>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                              {label.labelCode}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => openPrintPreview(label)}
                          variant="outline"
                          size="sm"
                          className={cn(THEME.borders.adminRadius.button, "text-[9px] font-black uppercase tracking-widest border-stone-200")}
                        >
                          <Printer className="h-3 w-3 mr-1.5" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}

                  {!labels.length && !loading && (
                    <div className="py-16 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-300 mb-4">
                        <Tags size={24} />
                      </div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">No labels generated yet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className={cn(THEME.borders.adminRadius.card, "border-stone-200 shadow-xl overflow-hidden bg-white flex flex-col h-[580px]")}>
            <CardHeader className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
              <CardTitle className={cn(THEME.typography.micro.default, "text-stone-900 flex items-center justify-between w-full")}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-stone-900 flex items-center justify-center shadow-lg shadow-stone-900/10">
                    <History className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">Execution Ledger</span>
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Real-time Protocol Feed</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">LIVE LOG</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white" data-lenis-prevent>
                {loadingHistory ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-100 border-t-stone-900" />
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {movements.map((move) => (
                      <div key={move.id} className="px-5 py-3.5 first:pt-2.5 hover:bg-stone-50/50 transition-all group relative border-l-4 border-transparent hover:border-emerald-500">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 mt-1">
                            <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                              <PackagePlus className="h-5 w-5 text-stone-400 group-hover:text-emerald-500" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-2.5">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {move.performedBy?.businessName?.toLowerCase() === "omw global" ? "Root Admin" : (move.performedBy?.businessName || move.performedBy?.ownerName || "System Operator")}
                              </p>
                              <span className="text-[9px] font-bold text-stone-300 bg-stone-50 px-2 py-0.5 rounded-md">
                                {new Date(move.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[12px] font-medium text-stone-600 leading-tight">
                                Added <span className="font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">+{move.quantity.toLocaleString()} UNITS</span>
                              </p>
                              <p className="text-[13px] font-black text-stone-900 leading-tight truncate uppercase tracking-tight">
                                {move.product?.name}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-100/50 rounded-[4px] border border-stone-200/50">
                                <QrCode className="h-3 w-3 text-stone-400" />
                                <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{move.batch?.batchNo}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50/50 rounded-[4px] border border-indigo-100/50">
                                <MapPin className="h-3 w-3 text-indigo-400" />
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest truncate max-w-[120px]">{move.outlet?.name || "Global Reserve"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!movements.length && !loadingHistory && (
                      <div className="py-24 text-center px-8">
                        <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                          <History className="h-8 w-8 text-stone-200" />
                        </div>
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Ledger Archive Empty</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className={cn(THEME.borders.adminRadius.card, "bg-emerald-50/50 border border-emerald-100 p-4")}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <QrCode size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[12px] font-black text-stone-900 leading-none uppercase tracking-tight">Smart Intake</p>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Inventory Sync</p>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
              Scan generated labels via mobile to instantly sync stock to local inventory.
            </p>
          </div>

          <div className={cn(THEME.borders.adminRadius.card, "bg-white border border-stone-200 p-5 relative overflow-hidden group shadow-sm")}>
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-stone-900">
              <Printer size={100} strokeWidth={1} />
            </div>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">System Status</p>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Printer Driver</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Batches</span>
                <span className="text-[13px] font-black text-stone-900 tracking-tight">{labels.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedLabel)} onOpenChange={(open) => !open && (setSelectedLabel(null), setPrintData(null))}>
        <DialogContent className="max-w-[1400px] sm:max-w-[1400px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-xl">
          {printLoading || !printData ? (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Asset Data...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[90vh] w-full">
              {/* Ultra-Modern Header */}
              <div className="bg-[#1a1a1a] pl-8 pr-20 py-5 flex items-center justify-between border-b border-white/5 w-full">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <QrCode size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight leading-none">Print Asset Console</h2>
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest mt-1">Verified Ledger System</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-white/10 text-white/60 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-white/5">
                    ID: {printData.labelCode}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row overflow-hidden w-full flex-1">
                {/* Left Side: Product Identity (450px) */}
                <div className="lg:w-[450px] border-r border-stone-100 p-8 flex flex-col gap-6 shrink-0 bg-stone-50/30">
                  <div className="aspect-square w-full rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden p-4 flex items-center justify-center relative">
                    {printData.product?.image ? (
                      <img src={getMediaUrl(printData.product.image)} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="h-16 w-16 text-stone-200" />
                    )}
                    <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-stone-100 text-stone-600 hover:bg-stone-100 border-none px-2 py-1 text-[9px] font-bold tracking-widest uppercase whitespace-normal break-all text-left">
                        SKU: {printData.product?.sku || "N/A"}
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 py-1 text-[9px] font-bold tracking-widest uppercase">
                        BATCH: {printData.batchNo}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-black text-stone-900 leading-tight uppercase tracking-tight break-words">
                      {printData.product?.name}
                    </h3>
                  </div>

                  <div className="space-y-3 mt-auto pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      <FileText size={14} />
                      Technical Docs
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-medium line-clamp-4">
                      {printData.ingredients || "No specific technical documentation available for this batch."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Parameters & Auth (60%) */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-8">
                    {/* Parameters Grid */}
                    <section className="space-y-4 w-full">
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scale size={14} /> System Parameters
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
                        {[
                          { label: "MRP Value", value: `₹${printData.mrp}`, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
                          { label: "Net Weight", value: printData.weight ? `${printData.weight} ${printData.unit || ""}` : "N/A", icon: Scale, color: "text-blue-600", bg: "bg-blue-50" },
                          { label: "Asset Quantity", value: `${printData.initialQuantity || 0} Units`, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
                          { label: "Production", value: formatDate(printData.productionDate), icon: CalendarDays, color: "text-stone-600", bg: "bg-stone-100" },
                          { label: "Expiry Date", value: formatDate(printData.expiryDate), icon: CalendarDays, color: "text-rose-600", bg: "bg-rose-50" },
                        ].map((item, i) => (
                          <div key={i} className="p-4 rounded-xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn("p-1.5 rounded-lg", item.bg, item.color)}>
                                <item.icon size={12} />
                              </div>
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <p className="text-lg font-black text-stone-900 tracking-tight">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Status Section */}
                    <section className="space-y-4 w-full">
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck size={14} /> Lifecycle Registry
                      </h4>
                      <div className={cn(
                        "p-6 rounded-2xl border-2 flex items-center gap-5 w-full",
                        printData.intakeStatus?.received 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
                          : "bg-amber-50 border-amber-100 text-amber-900"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-white shrink-0",
                          printData.intakeStatus?.received ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {printData.intakeStatus?.received ? <Check size={24} strokeWidth={3} /> : <Clock size={24} strokeWidth={3} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black uppercase tracking-widest leading-none mb-1.5">
                            {printData.intakeStatus?.received ? "Asset Verified" : "Awaiting Verification"}
                          </p>
                          <p className="text-[11px] font-medium opacity-60 leading-tight">
                            {printData.intakeStatus?.received 
                              ? `Logged at ${printData.intakeStatus.outletName} by ${printData.intakeStatus.receivedBy}` 
                              : "Inventory batch generated. Pending physical intake scan."}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Scannable Assets */}
                    <section className="space-y-4 w-full">
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Box size={14} /> Identity Assets
                      </h4>
                      <div className="w-full">
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col items-center gap-3 shadow-sm group hover:border-emerald-200 transition-colors cursor-pointer w-full">
                          <div className="h-24 w-full flex items-center justify-center bg-white p-2">
                            <Barcode 
                              value={printData.barcodeValue || printData.labelCode} 
                              width={1.8} 
                              height={50} 
                              fontSize={10} 
                              margin={0} 
                              background="transparent" 
                            />
                          </div>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Primary Linear Asset</span>
                        </div>
                      </div>
                    </section>

                    {/* Action Footer */}
                    <div className="pt-4 flex gap-3 print:hidden w-full">
                      <Button onClick={handlePrint} className="flex-[2] h-14 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-stone-200 transition-all active:scale-95">
                        <Printer className="mr-3 h-4 w-4" /> Print Asset Label
                      </Button>
                      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(printData.labelCode); toast.success("Code copied"); }} className="flex-1 h-14 rounded-xl border-stone-200 text-stone-600 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50 transition-all">
                        Copy ID
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden Printable Label (Only visible during window.print()) */}
              <div id="printable-label-content" className="hidden print:block bg-white text-black p-4">
                <div className="text-center space-y-6">
                  <div className="border-b-2 border-black pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Verified Product Asset</p>
                    <h1 className="text-xl font-black uppercase leading-tight">{printData.product?.name}</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-left border-b-2 border-black pb-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Batch Number</p>
                      <p className="text-sm font-black tracking-tight">{printData.batchNo}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">MRP (Incl. Taxes)</p>
                      <p className="text-sm font-black tracking-tight">₹{printData.mrp}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Production Date</p>
                      <p className="text-xs font-bold">{formatDate(printData.productionDate)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Expiry Date</p>
                      <p className="text-xs font-bold text-red-600">{formatDate(printData.expiryDate)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center pt-4 gap-3">
                    <Barcode 
                      value={printData.barcodeValue || printData.labelCode} 
                      width={1.8} 
                      height={60} 
                      fontSize={12} 
                      margin={0} 
                    />
                    <p className="text-[10px] font-black tracking-[0.25em] mt-1">{printData.labelCode}</p>
                  </div>

                  <div className="pt-4 border-t-2 border-black">
                    <p className="text-[8px] font-semibold leading-relaxed opacity-90 text-left">
                      <span className="font-black uppercase mr-1">Ingredients:</span>
                      {printData.ingredients || "Standard approved formulation."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
