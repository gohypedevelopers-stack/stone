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

export default function ProductLabelsSection({
  products = [],
  initialProductId = "",
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    batchNo: "",
    mrp: "",
    ingredients: "",
    productionDate: "",
    expiryDate: "",
    weight: "",
    unit: "",
  });

  const productOptions = useMemo(
    () => products.filter((product) => product.status === "ACTIVE"),
    [products],
  );

  const selectedProduct = useMemo(
    () => productOptions.find((product) => product.id === form.productId),
    [productOptions, form.productId],
  );

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

  useEffect(() => {
    loadLabels();
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
        unit: selectedProduct?.unit || "",
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

  return (
    <div id="product-labels-panel" className="space-y-10 animate-in fade-in duration-500 scroll-mt-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900">Product Labels & Batches</h2>
          <p className="text-sm text-stone-500 mt-1">
            Generate internal QR/barcode labels for outlet-wise stock intake.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadLabels}
          className="rounded-full px-5 font-black text-[10px] uppercase tracking-widest"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="rounded-[24px] border-stone-200">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Create Product Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="relative xl:col-span-2">
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productId: e.target.value,
                    mrp: "",
                    ingredients: "",
                    weight: "",
                    unit: "",
                  }))
                }
                className="h-11 w-full appearance-none rounded-full border border-stone-200 bg-white px-4 pr-10 text-sm font-semibold outline-none"
              >
                <option value="">Select product</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <Input placeholder="Batch no" value={form.batchNo} onChange={(e) => setForm((prev) => ({ ...prev, batchNo: e.target.value }))} />
            <Input placeholder="MRP" type="number" value={form.mrp} onChange={(e) => setForm((prev) => ({ ...prev, mrp: e.target.value }))} />
            <Input placeholder="Weight" type="number" value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))} />
            <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
            <Input type="date" value={form.productionDate} onChange={(e) => setForm((prev) => ({ ...prev, productionDate: e.target.value }))} />
            <Input type="date" value={form.expiryDate} onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))} />
          </div>
          <textarea
            value={form.ingredients}
            onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
            placeholder="Ingredients"
            className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm font-medium outline-none min-h-[120px]"
          />
          <Button
            onClick={createLabel}
            disabled={saving}
            className="bg-stone-900 hover:bg-black text-white rounded-full px-8 font-black text-[10px] uppercase tracking-widest"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Label"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-stone-200">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Generated Labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {labels.map((label) => (
                <div key={label.id} className="rounded-[24px] border border-stone-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-stone-900">{label.product?.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                        Batch {label.batchNo}
                      </p>
                    </div>
                    <Badge className={label.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-none" : "bg-stone-100 text-stone-500 border-none"}>
                      {label.status}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                      <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2">
                        <IndianRupee className="h-3.5 w-3.5" />
                        MRP
                      </p>
                      <p className="mt-2 text-lg font-black text-stone-900">{label.mrp || "—"}</p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                      <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        Weight
                      </p>
                      <p className="mt-2 text-lg font-black text-stone-900">
                        {label.weight ? `${label.weight}${label.unit || ""}` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="rounded-2xl border border-dashed border-stone-200 p-3">
                      <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Label Code</p>
                      <p className="mt-1 font-black text-stone-900 break-all">{label.labelCode}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-stone-50 border border-stone-100 p-3">
                        <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Production
                        </p>
                        <p className="mt-1 font-semibold text-stone-800">{formatDate(label.productionDate)}</p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 border border-stone-100 p-3">
                        <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Expiry
                        </p>
                        <p className="mt-1 font-semibold text-stone-800">{formatDate(label.expiryDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button onClick={() => openPrintPreview(label)} variant="outline" className="rounded-full">
                      <Printer className="h-4 w-4 mr-2" />
                      Preview Label
                    </Button>
                  </div>
                </div>
              ))}

              {!labels.length && !loading && (
                <div className="col-span-full rounded-[24px] bg-stone-50 p-16 text-center text-stone-400">
                  No product labels generated yet.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedLabel)} onOpenChange={(open) => !open && (setSelectedLabel(null), setPrintData(null))}>
        <DialogContent className="max-w-2xl rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-stone-900">Label Preview</DialogTitle>
          </DialogHeader>
          {printLoading || !printData ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          ) : (
            <div className="rounded-[28px] border border-stone-200 bg-white p-8 space-y-5">
              <div>
                <p className="text-2xl font-black text-stone-900">{printData.product?.name}</p>
                <p className="text-sm text-stone-500 mt-1">SKU {printData.product?.sku || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">MRP</p>
                  <p className="mt-2 text-lg font-black text-stone-900">{printData.mrp || "—"}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Weight</p>
                  <p className="mt-2 text-lg font-black text-stone-900">{printData.weight ? `${printData.weight}${printData.unit || ""}` : "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-dashed border-stone-200 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Batch No</p>
                  <p className="mt-2 font-black text-stone-900">{printData.batchNo}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-stone-200 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Label Code</p>
                  <p className="mt-2 font-black text-stone-900 break-all">{printData.labelCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Production</p>
                  <p className="mt-2 font-semibold text-stone-800">{formatDate(printData.productionDate)}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Expiry</p>
                  <p className="mt-2 font-semibold text-stone-800">{formatDate(printData.expiryDate)}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-400">Ingredients</p>
                <p className="mt-2 text-sm font-medium text-stone-700">{printData.ingredients || "—"}</p>
              </div>
              <div className="rounded-[24px] border-2 border-dashed border-stone-200 px-6 py-8 text-center">
                <QrCode className="mx-auto h-14 w-14 text-stone-400" />
                <p className="mt-4 text-sm font-black text-stone-900 break-all">{printData.qrValue}</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 mt-2">
                  Use this value to generate the scannable label asset
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
