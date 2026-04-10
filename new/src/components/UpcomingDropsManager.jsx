import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Search, Plus, Trash2, Save, Clock, Edit3, MoveUp, MoveDown, LayoutGrid, Eye, EyeOff, Upload, X, Package } from "lucide-react";
import { THEME } from "../theme";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { API_URL, SERVER_URL } from "../utils/api";
const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

export default function UpcomingDropsManager() {
  const [sectionConfig, setSectionConfig] = useState(null);
  const [dropList, setDropList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Store picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, sectionsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/products`),
        axios.get(`${API_URL}/admin/homepage/sections`)
      ]);
      
      setAllProducts(productsRes.data.data || []);
      
      const sections = sectionsRes.data.data || [];
      const upcomingSection = sections.find(s => s.componentId === "upcoming-drops");
      
      if (upcomingSection) {
        setSectionConfig(upcomingSection);
        // Auto-deduplicate by name on load
        const raw = upcomingSection.settings?.products || [];
        const seen = new Set();
        const deduped = raw.filter(item => {
          const key = item.name?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || item.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setDropList(deduped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load upcoming drops data");
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
          products: dropList
        }
      });
      toast.success("Upcoming Drops updated globally");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const handleCreateCustom = () => {
    const newItem = {
      id: `manual-${Date.now()}`,
      name: "New Drop",
      imageUrl: "",
      price: 0,
      originalPrice: 0,
      description: "",
      launchDate: "Coming Soon",
      showOnline: true
    };
    setEditingItem(newItem);
    setIsCreating(true);
  };

  const addFromCatalog = (product) => {
    const normalize = (n) => n?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || "";
    const prodNorm = normalize(product.name);
    
    if (dropList.some(p => p.id === product.id || normalize(p.name) === prodNorm)) {
      toast.error("Product already in drop list!");
      setShowPicker(false);
      setPickerSearch("");
      return;
    }
    const newP = {
      id: product.id,
      name: product.name,
      imageUrl: product.image || product.images?.[0] || "",
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      description: product.description || "",
      launchDate: "Coming Soon",
      showOnline: true
    };
    
    setDropList([...dropList, newP]);
    setShowPicker(false);
    setPickerSearch("");
    toast.success("Product added to drop");
  };

  const removeItem = (id) => {
    setDropList(dropList.filter(p => p.id !== id));
  };

  const moveItem = (e, index, direction) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dropList.length) return;

    setDropList(prev => {
      const newList = [...prev];
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
  };

  const saveEditingItem = () => {
    if (!editingItem) return;

    const normalize = (n) => n?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || "";
    const nameNorm = normalize(editingItem.name);
    
    if (isCreating) {
      if (dropList.some(p => normalize(p.name) === nameNorm)) {
        toast.error("A product with this name is already in the drop list!");
        return;
      }
      setDropList([...dropList, editingItem]);
      setIsCreating(false);
      toast.success(`${editingItem.name || 'New drop'} added!`);
    } else {
      setDropList(dropList.map(p => p.id === editingItem.id ? editingItem : p));
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
        let newUrl = res.data.data[0];
        if (newUrl.startsWith('/app/')) {
            newUrl = `${SERVER_URL}/uploads/${newUrl.split('/').pop()}`;
        }
        setEditingItem({ ...editingItem, imageUrl: newUrl });
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
  };

  const filteredPickerProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(pickerSearch.toLowerCase())
  ).slice(0, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-[2px]" />
      </div>
    );
  }

  if (!sectionConfig) {
    return (
      <div className="p-8 text-center border border-dashed border-stone-300 rounded-[2px] bg-stone-50">
        <h3 className="text-lg font-bold text-stone-900 mb-2">Upcoming Drops Section Missing</h3>
        <p className="text-stone-500 text-sm">
          Please add the "Upcoming Drops" section from the Homepage Builder first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent bg-linear-to-r from-[#b36cff] to-[#ff5db1] pb-1 flex items-center gap-3`}>
            Upcoming Drops Manager
          </h1>
          <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>
            Manage and schedule exclusive product drops for the storefront homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">

          <Button 
            variant="outline" 
            onClick={handleCreateCustom}
            className="rounded-[2px] font-bold h-10 border-stone-200 text-stone-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Drop
          </Button>
          <Button 
            onClick={handleSave} 
            className="rounded-[2px] font-bold h-10 bg-[#151515] hover:bg-black text-white shadow-xl shadow-stone-900/20"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>


      {dropList.length === 0 ? (
        <div className="bg-white rounded-[2px] border border-stone-200 p-16 text-center shadow-sm">
          <Sparkles className="h-16 w-16 text-pink-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-800 mb-2">No Upcoming Drops</h3>
          <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            You haven't scheduled any products for this drop list yet. Add items to build anticipation!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dropList.map((item, index) => (
            <div key={item.id} className="group relative bg-white border border-stone-200 rounded-[2px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden">
              
              <div className="absolute top-3 right-3 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <button onClick={() => { setEditingItem({ ...item }); setIsCreating(false); }} className="w-8 h-8 rounded-[2px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-[2px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute top-3 left-3 flex gap-1.5 z-20">
                <Badge className={`rounded-[2px] font-black text-[9px] px-2 py-1 uppercase tracking-wider border-none shadow-sm ${item.showOnline !== false ? 'bg-emerald-500 text-white' : 'bg-stone-300 text-stone-500'}`}>
                  {item.showOnline !== false ? 'Online' : 'Hidden'}
                </Badge>
              </div>

              <div className="flex gap-1.5 absolute top-14 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                 <button onClick={(e) => moveItem(e, index, "up")} disabled={index === 0} className="w-8 h-8 rounded-[2px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
                    <MoveUp className="h-4 w-4" />
                 </button>
                 <button onClick={(e) => moveItem(e, index, "down")} disabled={index === dropList.length - 1} className="w-8 h-8 rounded-[2px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
                    <MoveDown className="h-4 w-4" />
                 </button>
              </div>

              <div className="aspect-4/3 w-full bg-stone-50 border-b border-stone-100 relative group-img flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-stone-900/5 to-transparent z-0 pointer-events-none" />
                {item.imageUrl ? (
                  <img src={getMediaUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-contain rounded-[2px] relative z-10 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <Package className="h-12 w-12 text-stone-300" />
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1 bg-white">
                <h3 className="font-black text-stone-900 text-[14px] line-clamp-2 mb-4 uppercase tracking-tight leading-snug">{item.name || 'Untitled Drop'}</h3>

                <div className="mt-auto">
                  <div className="flex flex-col gap-1.5 text-[11px] text-stone-600 bg-stone-50 border border-stone-200 p-3 rounded-[2px]">
                    <div className="flex items-center gap-1.5 font-bold text-stone-400 uppercase tracking-widest text-[9px]">
                      <Clock className="h-3.5 w-3.5 text-pink-500" /> Expected Launch
                    </div>
                    <span className="font-black text-stone-800 text-[12px]">
                      {(() => {
                        if (!item.launchDate || item.launchDate === "Coming Soon") return "Coming Soon";
                        try {
                          const d = new Date(item.launchDate);
                          if (isNaN(d.getTime())) return item.launchDate;
                          return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d).toUpperCase();
                        } catch(e) { return item.launchDate; }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editing Overlay Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => { setEditingItem(null); setIsCreating(false); }} />
           <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh]">
             <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
               <h3 className="font-black text-lg text-stone-900 tracking-tight uppercase">{isCreating ? "Create Custom Drop" : "Configure Drop Item"}</h3>
               <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="text-stone-400 hover:text-stone-900 transition-colors"><X className="h-5 w-5"/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Visual Asset */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Promotion Image</label>
                    <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-[2px] border border-stone-200 bg-stone-50 shrink-0 overflow-hidden flex flex-col items-center justify-center relative group shadow-inner">
                            {editingItem.imageUrl ? (
                                <img src={getMediaUrl(editingItem.imageUrl)} className="w-full h-full object-cover" />
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
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                        </div>
                        <div className="flex-1 space-y-2 flex flex-col">
                           <Input 
                                placeholder="Or enter Image URL..." 
                                value={editingItem.imageUrl} 
                                onChange={(e) => setEditingItem({...editingItem, imageUrl: e.target.value})}
                                className="rounded-[2px] text-xs h-10 shadow-sm"
                           />
                           <p className="text-[10px] text-stone-400 font-medium italic mt-1">Click the box to upload a file directly, or paste a URL above.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Product Title</label>
                    <Input value={editingItem.name} placeholder="e.g. Sakura Silk Essence" onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="h-11 rounded-[2px] font-bold text-[13px] shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Launch Date</label>
                      <Input 
                        type="date"
                        value={editingItem.launchDate} 
                        onChange={(e) => setEditingItem({...editingItem, launchDate: e.target.value})} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="h-11 rounded-[2px] font-medium text-[13px] shadow-sm cursor-pointer hover:border-stone-400 transition-colors" 
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Visibility Status</label>
                      <div className="flex items-center flex-1">
                         <Button
                            variant="outline"
                            className={`w-full h-11 rounded-[2px] gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
                              editingItem.showOnline !== false 
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                                : 'border-stone-200 text-stone-400 hover:bg-stone-100'
                            }`}
                            onClick={() => setEditingItem({...editingItem, showOnline: editingItem.showOnline === false ? true : false})}
                         >
                            {editingItem.showOnline !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {editingItem.showOnline !== false ? 'Active & Online' : 'Offline / Hidden'}
                         </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Sale Price (₹)</label>
                      <Input 
                        type="number"
                        value={editingItem.price} 
                        placeholder="e.g. 1999" 
                        onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} 
                        className="h-11 rounded-[2px] font-bold text-[13px] shadow-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Original Price (₹)</label>
                      <Input 
                        type="number"
                        value={editingItem.originalPrice} 
                        placeholder="e.g. 2999" 
                        onChange={(e) => setEditingItem({...editingItem, originalPrice: e.target.value})} 
                        className="h-11 rounded-[2px] font-medium text-[13px] shadow-sm text-stone-400" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Product Description</label>
                    <textarea 
                        value={editingItem.description} 
                        placeholder="Write a short, catchy description for the drop..." 
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} 
                        className="w-full min-h-[80px] p-3 rounded-[2px] border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none shadow-sm font-medium"
                    />
                  </div>
                </div>
                
             </div>

             <div className="p-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0">
                <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="px-5 py-2 text-[11px] uppercase tracking-widest font-black text-stone-400 hover:text-stone-900 transition-colors">Cancel</button>
                <Button onClick={saveEditingItem} className="bg-[#151515] text-white hover:bg-black shadow-xl shadow-stone-900/20 rounded-[2px] font-black uppercase tracking-widest text-[10px] px-8 h-11">
                    {isCreating ? "Confirm Creation" : "Update Validation"}
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
