import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Search, Plus, Trash2, Save, Calendar, Clock, Edit3, MoveUp, MoveDown, Info, X } from "lucide-react";
import { THEME } from "../theme";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { API_URL, SERVER_URL, fetchJson } from "../utils/api";
import { resolveImage } from "../utils/urlHelper";

export default function PreOrderManager() {
  const [products, setProducts] = useState([]);
  const [sectionConfig, setSectionConfig] = useState(null);
  const [preorderList, setPreorderList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsPromise = fetchJson("/products");
      const adminSectionsPromise = fetchJson("/admin/homepage/sections");
      const homepagePromise = fetchJson("/homepage");

      const [productsResult, adminSectionsResult, homepageResult] = await Promise.allSettled([
        productsPromise,
        adminSectionsPromise,
        homepagePromise,
      ]);

      if (productsResult.status === "fulfilled" && productsResult.value.data?.success) {
        setProducts(productsResult.value.data.data || []);
      } else {
        setProducts([]);
      }

      let sections = [];

      if (adminSectionsResult.status === "fulfilled" && adminSectionsResult.value.data?.success) {
        sections = adminSectionsResult.value.data.data || [];
      } else if (homepageResult.status === "fulfilled" && homepageResult.value.data?.success) {
        sections = homepageResult.value.data.data?.sections || [];
      }

      const preorderSection = sections.find(s => s.componentId === "pre-order");
      
      if (preorderSection) {
        setSectionConfig(preorderSection);
        const list = (preorderSection.settings?.preorderProducts || []).map(item => ({
          ...item,
          image: resolveImage(item.image || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : "")) || "",
          totalStock: item.totalStock || item.totalSlots || 50,
          stockLeft: item.stockLeft ?? 50
        }));
        setPreorderList(list);
      } else {
        setSectionConfig(null);
        setPreorderList([]);
      }

      if (sections.length === 0) {
        throw new Error("Unable to load pre-order section data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pre-order data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sectionConfig) return;
    try {
      await axios.put(`${API_URL}/admin/homepage/sections/${sectionConfig.id}`, {
        settings: {
          ...sectionConfig.settings,
          preorderProducts: preorderList
        }
      });
      toast.success("Pre-Order items updated globally");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const handleCreateNew = () => {
    const newItem = {
      id: `manual-${Date.now()}`,
      name: "",
      price: "",
      image: "",
      tag: "Exclusive",
      unlockDate: "Coming Soon",
      totalStock: 50,
      stockLeft: 50,
      releaseDate: "",
      shippingStart: "",
      description: "Limited edition drop.",
      usage: "Exclusive presale reservation."
    };
    setEditingItem(newItem);
    setIsCreating(true);
  };

  const removeItem = (id) => {
    setPreorderList(preorderList.filter(p => p.id !== id));
  };

  const moveItem = (index, direction) => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === preorderList.length - 1)
    ) return;

    const newList = [...preorderList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setPreorderList(newList);
  };

  const saveEditingItem = () => {
    if (!editingItem) return;
    
    if (isCreating) {
      setPreorderList([editingItem, ...preorderList]);
      setIsCreating(false);
      toast.success(`${editingItem.name || 'New drop'} added!`);
    } else {
      setPreorderList(preorderList.map(p => p.id === editingItem.id ? editingItem : p));
      toast.success("Drop configuration updated");
    }
    setEditingItem(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData);
      if (res.data.success) {
        let imageUrl = res.data.data[0];
        if (imageUrl.startsWith('/')) {
            imageUrl = `${SERVER_URL}${imageUrl}`;
        }
        setEditingItem({ ...editingItem, image: imageUrl });
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sectionConfig) {
    return (
      <div className="p-8 text-center border border-dashed border-stone-300 rounded-[2px] bg-stone-50">
        <h3 className="text-lg font-bold text-stone-900 mb-2">Pre-Order Section Missing</h3>
        <p className="text-stone-500 text-sm">
          Please add the "Pre-Order" section from the Homepage Builder first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1 flex items-center gap-3`}>
            Pre-Order Control
          </h1>
          <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>
            Manage exclusive drops and early-access campaigns for the storefront.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleCreateNew}
            className="rounded-[2px] font-bold h-10 border-stone-200 text-stone-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Drop
          </Button>
          <Button 
            onClick={handleSave} 
            className="rounded-[2px] font-bold h-10 bg-indigo-950 hover:bg-indigo-900 text-white shadow-xl shadow-indigo-950/20"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      {preorderList.length === 0 ? (
        <div className="bg-white rounded-[2px] border border-stone-200 p-16 text-center shadow-sm">
          <Package className="h-16 w-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-800 mb-2">No active drops</h3>
          <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            You haven't scheduled any products for pre-order yet. Add items to build anticipation and secure advance revenue.
          </p>
          <Button onClick={handleCreateNew} className="rounded-[2px] font-bold bg-indigo-600 hover:bg-indigo-700">
            Create First Drop
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {preorderList.map((item, index) => (
            <div key={item.id} className="group relative bg-white border border-stone-200 rounded-[2px] shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden">
              <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingItem({ ...item }); setIsCreating(false); }} className="w-8 h-8 rounded-[2px] bg-white text-indigo-600 shadow-sm flex items-center justify-center hover:bg-indigo-50">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-[2px] bg-white text-red-500 shadow-sm flex items-center justify-center hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                <Badge className="rounded-[2px] bg-stone-900 text-white font-black text-[9px] uppercase tracking-wider border-none">
                  {item.tag}
                </Badge>
              </div>

              <div className="flex gap-1 absolute top-12 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="w-6 h-6 rounded-[2px] bg-white/90 text-stone-600 flex items-center justify-center hover:bg-white disabled:opacity-30">
                    <MoveUp className="h-3 w-3" />
                 </button>
                 <button onClick={() => moveItem(index, "down")} disabled={index === preorderList.length - 1} className="w-6 h-6 rounded-[2px] bg-white/90 text-stone-600 flex items-center justify-center hover:bg-white disabled:opacity-30">
                    <MoveDown className="h-3 w-3" />
                 </button>
              </div>

              <div className="aspect-4/5 w-full bg-stone-50 border-b border-stone-100 p-4">
                {resolveImage(item.image) ? (
                  <img src={resolveImage(item.image)} alt={item.name} className="w-full h-full object-contain rounded-[2px]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-stone-300" />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-stone-900 text-sm line-clamp-1 mb-1">{item.name || 'Untitled Drop'}</h3>
                <div className="text-xs text-indigo-600 font-black tracking-wide uppercase mb-3">
                  &#8377;{Number(item.price || 0).toLocaleString("en-IN")}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-2 rounded-[2px]">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="font-semibold truncate">Unlocks: {item.unlockDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 px-1 pt-1 border-t border-stone-100">
                     <span>Slots: {item.stockLeft}/{item.totalStock}</span>
                     <span>Ships: {item.shippingStart || "TBA"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Configuration Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => { setEditingItem(null); setIsCreating(false); }} />
           <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh]">
             <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
               <h3 className="font-black text-lg text-stone-900">{isCreating ? "Create New Drop" : "Configure Drop"}</h3>
               <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="text-stone-400 hover:text-stone-900"><X className="h-5 w-5"/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Visual Asset */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Visual Asset</label>
                    <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-[2px] border border-stone-200 bg-stone-50 shrink-0 overflow-hidden flex flex-col items-center justify-center relative group">
                            {resolveImage(editingItem.image) ? (
                                <img src={resolveImage(editingItem.image)} className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Package className="h-6 w-6 text-stone-300" />
                                    <span className="text-[8px] font-bold text-stone-400 uppercase">Upload</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                           <Input 
                                placeholder="Or enter Image URL..." 
                                value={editingItem.image} 
                                onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                                className="rounded-[2px] text-xs h-9"
                           />
                           <p className="text-[10px] text-stone-400 font-medium italic">Click the box to upload a file, or paste a URL above.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Product Title</label>
                    <Input value={editingItem.name} placeholder="e.g. Limited Edition Hoodie" onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="rounded-[2px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Price (₹)</label>
                    <Input type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} className="rounded-[2px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Tag text</label>
                    <Input value={editingItem.tag} onChange={(e) => setEditingItem({...editingItem, tag: e.target.value})} placeholder="Exclusive, Limited, etc." className="rounded-[2px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Unlock Date</label>
                    <Input value={editingItem.unlockDate} onChange={(e) => setEditingItem({...editingItem, unlockDate: e.target.value})} placeholder="10 Mar, 10:00 AM" className="rounded-[2px]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Total Slots</label>
                    <Input 
                      type="number" 
                      value={editingItem.totalStock === 0 ? "" : editingItem.totalStock} 
                      onChange={(e) => setEditingItem({...editingItem, totalStock: e.target.value === "" ? 0 : Number(e.target.value)})} 
                      className="rounded-[2px]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Slots Available</label>
                    <Input 
                      type="number" 
                      value={editingItem.stockLeft === 0 ? "" : editingItem.stockLeft} 
                      onChange={(e) => setEditingItem({...editingItem, stockLeft: e.target.value === "" ? 0 : Number(e.target.value)})} 
                      className="rounded-[2px]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Shipping Start</label>
                    <Input value={editingItem.shippingStart} onChange={(e) => setEditingItem({...editingItem, shippingStart: e.target.value})} placeholder="e.g. 15 Mar 2026" className="rounded-[2px]" />
                  </div>
                  <div className="space-y-1.5 line-clamp-1 col-span-2">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Release Date</label>
                    <Input value={editingItem.releaseDate} onChange={(e) => setEditingItem({...editingItem, releaseDate: e.target.value})} placeholder="e.g. 10 Mar 2026" className="rounded-[2px]" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Display Description</label>
                  <textarea 
                    value={editingItem.description} 
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} 
                    className="w-full h-24 p-3 text-sm border border-stone-200 rounded-[2px] focus:ring-1 focus:ring-indigo-600 focus:outline-none resize-none" 
                  />
                </div>
             </div>

             <div className="p-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0">
                <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="px-4 py-2 text-sm font-bold text-stone-600 hover:text-stone-900">Cancel</button>
                <Button onClick={saveEditingItem} className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-[2px] font-bold px-6">
                    {isCreating ? "Create Drop" : "Update Configuration"}
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
