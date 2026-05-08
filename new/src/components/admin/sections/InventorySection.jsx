import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Filter, ChevronRight, Plus, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const InventorySection = ({
  THEME,
  selectedCategory,
  setSelectedCategory,
  categories,
  handleCreateProductClick,
  loading,
  deferredFilteredProducts,
  getMediaUrl,
  setSelectedRestockProduct,
  setIsRestockOpen,
  handleEditProduct,
  handleDeleteProduct,
  handleViewChange,
  vendors
}) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex items-center justify-between gap-6 mb-12">
        <div className="flex flex-col">
          <h1
            className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.adminBrand} pb-1`}
          >
            Product Inventory
          </h1>
          <p className={`${THEME.typography.micro.muted}`}>
            Catalog management across all enterprise partners.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="group flex items-center bg-white hover:bg-stone-50 transition-all duration-300 rounded-[5px] border border-stone-100 hover:border-emerald-200 hover:shadow-md px-3 py-1.5 w-fit cursor-pointer animate-in fade-in slide-in-from-right-2 h-14">
            <div className="flex items-center justify-center h-8 w-8 rounded-[5px] bg-stone-50 group-hover:bg-emerald-50 transition-colors border border-stone-100 mr-3">
              <Filter className="h-[14px] w-[14px] text-stone-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-1">
              Category:
            </span>
            <div className="relative flex items-center min-w-[140px]">
              <select
                className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-2 pr-8 w-full hover:text-emerald-600 transition-colors outline-none"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-stone-100 group-hover:bg-indigo-100 rounded-[5px] p-1 transition-colors">
                <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-emerald-600 rotate-90 transition-transform" />
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateProductClick}
            className="bg-stone-900 text-white rounded-[5px] h-14 px-10 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-stone-900/10 hover:bg-[#ff4fa3] transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      <Card className="border-none shadow-sm rounded-[5px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                <TableHead className="p-4 min-w-[180px]">
                  Product
                </TableHead>
                <TableHead className="p-4 min-w-[110px]">
                  Category
                </TableHead>
                <TableHead className="p-4 min-w-[110px]">
                  Vendor
                </TableHead>
                <TableHead className="p-4 text-right min-w-[90px]">
                  Base Price
                </TableHead>
                <TableHead className="p-4 text-right min-w-[90px]">
                  Offer Price
                </TableHead>
                <TableHead className="p-4 text-center min-w-[100px]">
                  Retail (P)
                </TableHead>
                <TableHead className="p-4 text-center min-w-[80px]">
                  Status
                </TableHead>
                <TableHead className="p-4 text-center min-w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell
                      colSpan={8}
                      className="h-16 bg-stone-50/50"
                    />
                  </TableRow>
                ))
              ) : deferredFilteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center p-20 text-stone-400 font-bold"
                  >
                    No inventory records found.
                  </TableCell>
                </TableRow>
              ) : (
                deferredFilteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-stone-50 hover:bg-stone-50/30 transition-colors"
                  >
                    <TableCell className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[5px] overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                          {p.imageUrls &&
                          p.imageUrls.filter(
                            (u) => u && u.trim() !== "",
                          ).length > 0 ? (
                            <img
                              src={getMediaUrl(
                                p.imageUrls.filter(
                                  (u) => u && u.trim() !== "",
                                )[0],
                              )}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-bold">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[160px]">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-stone-900 text-sm truncate">
                              {p.name}
                            </p>
                            {p.specialOfferType &&
                              p.specialOfferType !== "None" && (
                                <Badge className="h-4 px-2 text-[7px] font-black uppercase tracking-tighter bg-indigo-950 text-white border-none rounded-[5px] shrink-0">
                                  {p.specialOfferType}
                                </Badge>
                              )}
                          </div>
                          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest truncate mt-0.5">
                            {(() => {
                              const brand =
                                p.brand || "OMW Skincare";
                              if (brand === "OMW Skincare") {
                                if (p.name?.includes(" – "))
                                  return p.name
                                    .split(" – ")[0]
                                    .trim();
                                if (p.name?.includes(" - "))
                                  return p.name
                                    .split(" - ")[0]
                                    .trim();
                                return (
                                  p.name?.split(" ")[0].trim() ||
                                  "OMW Skincare"
                                );
                              }
                              return brand;
                            })()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge
                        variant="outline"
                        className="rounded-[5px] font-semibold text-[10px] uppercase tracking-wider border-stone-200 text-stone-500 bg-stone-50"
                      >
                        {p.category?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                        {(() => {
                          const rawRecords =
                            p.stockRecords ||
                            p.bundledVendors ||
                            [];
                          let vendorsList = Object.values(
                            rawRecords.reduce((acc, br) => {
                              const vId =
                                br.vendorId ||
                                br.vendor?.id ||
                                "unknown";
                              if (!acc[vId]) acc[vId] = { ...br };
                              else
                                acc[vId].quantity =
                                  (acc[vId].quantity ||
                                    acc[vId].stock ||
                                    0) +
                                  (br.quantity || br.stock || 0);
                              return acc;
                            }, {}) || {},
                          ) || [];

                          if (vendorsList.length === 0)
                            return (
                              <Badge
                                variant="outline"
                                className="rounded-[5px] text-[10px] text-stone-400"
                              >
                                None
                              </Badge>
                            );

                          const hasAdmin = vendorsList.some(bv => bv.vendor?.businessName?.toLowerCase() === "omw global");
                          const otherVendorsCount = vendorsList.filter(bv => bv.vendor?.businessName?.toLowerCase() !== "omw global").length;

                          if (vendorsList.length === 1) {
                            const bv = vendorsList[0];
                            return (
                              <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-100 rounded-[5px] px-2.5 py-1 shadow-sm">
                                <span className="text-[10px] font-black tracking-wide text-stone-900/80 truncate max-w-[110px] uppercase">
                                  {bv.vendor?.businessName?.toLowerCase() === "omw global" ? "Admin Stock" : (bv.vendor?.businessName || "Unknown")}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div className="flex items-center gap-1.5 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors border border-emerald-100/60 rounded-[5px] px-2.5 py-1">
                              <span className="text-[10px] font-black tracking-wide text-stone-950 truncate max-w-[110px] uppercase">
                                {hasAdmin && otherVendorsCount > 0 
                                  ? `Admin + ${otherVendorsCount} Vendor${otherVendorsCount > 1 ? 's' : ''}` 
                                  : `${vendorsList.length} Vendors`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className={`p-4 text-right font-bold ${p.originalPrice ? "text-stone-400 line-through text-[11px]" : "text-stone-900"}`}>
                      &#8377;
                      {(p.originalPrice || p.price || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="p-4 text-right font-black text-emerald-600">
                      {p.originalPrice ? (
                        <>
                          &#8377;
                          {Number(p.price).toLocaleString("en-IN")}
                        </>
                      ) : (
                        <span className="text-stone-300 text-[10px] font-bold">—</span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-center font-bold">
                      <span
                        className={cn(
                          p.stock < 10
                            ? "text-rose-500"
                            : "text-stone-600",
                          "px-3 py-1 bg-stone-50 rounded-[5px] border border-stone-100",
                        )}
                      >
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 text-center">
                      <Badge
                        className={cn(
                          "rounded-[5px] font-black px-3 border-none text-[9px] uppercase tracking-wider",
                          p.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-stone-100 text-stone-400",
                        )}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const adminStockVendor = (vendors || []).find(
                              ven => ven.businessName?.toLowerCase() === "admin stock" || 
                                     ven.businessName?.toLowerCase() === "omw global"
                            );
                            handleViewChange("create-transfer", {
                              preSelectedSource: adminStockVendor?.id,
                              preSelectedItems: [{
                                id: p.id,
                                name: p.name,
                                transferQty: 1,
                                sourceStock: (p.stockRecords || p.bundledVendors || []).find(r => (r.vendorId || r.vendor?.id) === adminStockVendor?.id)?.quantity || 
                                             (p.stockRecords || p.bundledVendors || []).find(r => (r.vendorId || r.vendor?.id) === adminStockVendor?.id)?.stock || 0
                              }]
                            });
                          }}
                          title="Quick Restock"
                          className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-[5px] transition-colors"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(p);
                          }}
                          className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[5px] transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            p.bundledVendors?.forEach((bv) =>
                              handleDeleteProduct(bv.id),
                            );
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-[5px] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default InventorySection;
