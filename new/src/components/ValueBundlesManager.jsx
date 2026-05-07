import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Plus, Trash2, Save, Edit3, Package, X, MoveUp, MoveDown, Upload, Image as ImageIcon } from "lucide-react";
import { THEME } from "../theme";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { API_URL, SERVER_URL } from "../utils/api";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

const BUNDLE_COLORS = [
  { id: "green", label: "Mint Green", value: "from-[#F0F7F4] to-white" },
  { id: "gray", label: "Soft Gray", value: "from-[#F9F9F9] to-white" },
  { id: "pink", label: "Blush Pink", value: "from-[#FFF1F5] to-white" },
  { id: "orange", label: "Warm Orange", value: "from-[#FFF8F0] to-white" },
];

export default function ValueBundlesManager() {
  const [sectionConfig, setSectionConfig] = useState(null);
  const [bundleList, setBundleList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sectionsRes = await axios.get(`${API_URL}/admin/homepage/sections`);
      
      const sections = sectionsRes.data.data || [];
      const bundlesSection = sections.find(s => s.componentId === "special-combos");
      
      if (bundlesSection) {
        setSectionConfig(bundlesSection);
        setBundleList(bundlesSection.settings?.products || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load value bundles data");
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
          products: bundleList
        }
      });
      toast.success("Value Bundles updated globally");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const handleAddCustom = () => {
    const defaultColor = BUNDLE_COLORS[bundleList.length % BUNDLE_COLORS.length].value;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: "",
      brand: "",
      imageUrls: [],
      price: 0,
      originalPrice: 0,
      badge: "Exclusive",
      color: defaultColor,
      isCustom: true,
      description: "",
      howToUse: "",
      benefits: "",
      ingredients: "",
      frequentlyAskedQuestions: []
    };
    setEditingItem(newItem);
    setIsCreating(true);
  };

  const removeItem = (id) => {
    setBundleList(bundleList.filter(p => p.id !== id));
  };

  const moveItem = (e, index, direction) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bundleList.length) return;

    setBundleList(prev => {
      const newList = [...prev];
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      toast.loading("Uploading images...");
      const res = await axios.post(`${API_URL}/upload`, formData);
      if (res.data.success) {
        const newUrls = res.data.data.map(url => {
            if (url.startsWith('/app/')) {
                return `${SERVER_URL}/uploads/${url.split('/').pop()}`;
            }
            return url;
        });
        
        const currentUrls = editingItem.imageUrls || (editingItem.imageUrl ? [editingItem.imageUrl] : []);
        setEditingItem({ 
            ...editingItem, 
            imageUrls: [...currentUrls, ...newUrls],
            imageUrl: currentUrls.length === 0 ? newUrls[0] : (editingItem.imageUrl || currentUrls[0])
        });
        toast.dismiss();
        toast.success(`Uploaded ${newUrls.length} image(s)`);
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to upload images");
    }
  };

  const removeImage = (index) => {
      const updated = [...(editingItem.imageUrls || [])];
      updated.splice(index, 1);
      setEditingItem({ 
          ...editingItem, 
          imageUrls: updated,
          imageUrl: updated[0] || ""
      });
  };

  const saveEditingItem = () => {
    if (!editingItem) return;

    if (!editingItem.name || !editingItem.price) {
        toast.error("Name and Price are required!");
        return;
    }

    if (isCreating) {
      setBundleList([...bundleList, editingItem]);
      setIsCreating(false);
      toast.success(`Bundle created!`);
    } else {
      setBundleList(bundleList.map(p => p.id === editingItem.id ? editingItem : p));
      toast.success("Bundle updated");
    }
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-[5px]" />
      </div>
    );
  }

  if (!sectionConfig) {
    return (
      <div className="p-8 text-center border border-dashed border-stone-300 rounded-[5px] bg-stone-50">
        <h3 className="text-lg font-bold text-stone-900 mb-2">Value Bundles Section Missing</h3>
        <p className="text-stone-500 text-sm">
          Please add the "Special Combos" or "Value Bundles" section from the Homepage Builder first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-rose-400 pb-1 flex items-center gap-3`}>
            Value Bundles Manager
          </h1>
          <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>
            Configure the Curated Sets and Value Bundles displayed on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleAddCustom}
            className="rounded-[5px] font-bold h-10 border-stone-200 text-stone-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Bundle
          </Button>
          <Button 
            onClick={handleSave} 
            className="rounded-[5px] font-bold h-10 bg-[#151515] hover:bg-black text-white shadow-xl shadow-stone-900/20"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      {bundleList.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-stone-200 p-16 text-center shadow-sm">
          <Sparkles className="h-16 w-16 text-rose-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-800 mb-2">No Value Bundles</h3>
          <p className="text-stone-500 mb-6 max-w-sm mx-auto">
            You haven't configured any products for the bundles section yet. Add items to showcase them on the homepage!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {bundleList.map((item, index) => (
            <div key={item.id} className="group relative border border-stone-200 rounded-[5px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden bg-white">
              
              <div className="absolute top-3 right-3 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <button onClick={() => { setEditingItem({ ...item }); setIsCreating(false); }} className="w-8 h-8 rounded-[5px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-[5px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                 <div className="px-3 py-1 bg-[#151515] text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-[2px] shadow-xl border border-white/10">
                    {item.badge}
                 </div>
              </div>

              <div className="flex gap-1.5 absolute top-14 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                 <button onClick={(e) => moveItem(e, index, "up")} disabled={index === 0} className="w-8 h-8 rounded-[5px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
                    <MoveUp className="h-4 w-4" />
                 </button>
                 <button onClick={(e) => moveItem(e, index, "down")} disabled={index === bundleList.length - 1} className="w-8 h-8 rounded-[5px] bg-white border border-stone-200 text-stone-600 shadow-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
                    <MoveDown className="h-4 w-4" />
                 </button>
              </div>

              <div className={`aspect-square w-full relative group-img flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br ${item.color}`}>
                <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent z-0 pointer-events-none" />
                {(item.imageUrls?.[0] || item.imageUrl) ? (
                  <img src={getMediaUrl(item.imageUrls?.[0] || item.imageUrl)} alt={item.name} className="w-full h-full object-cover rounded-[5px] relative z-10 mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <Package className="h-12 w-12 text-stone-300" />
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1 bg-white border-t border-stone-100">
                <span className="text-[10px] font-[1000] text-stone-400 uppercase tracking-[0.3em] mb-1">
                   {item.brand || "Brand"}
                </span>
                <h3 className="font-black text-stone-900 text-[14px] line-clamp-2 mb-4 tracking-tight leading-snug">{item.name || 'Untitled Drop'}</h3>

                <div className="mt-auto flex items-end justify-between">
                   <div>
                       <div className="text-[12px] text-stone-300 font-bold line-through mb-0.5">₹{item.originalPrice}</div>
                       <div className="text-[20px] font-semibold text-[#151515] tracking-tighter leading-none">₹{item.price}</div>
                   </div>
                   {item.imageUrls?.length > 1 && (
                       <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-[3px] border border-stone-100">+{item.imageUrls.length - 1} Images</span>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => { setEditingItem(null); setIsCreating(false); }} />
           <div className="bg-white rounded-[5px] shadow-2xl w-full max-w-3xl relative animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden max-h-[90vh]">
             <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
               <div>
                 <h3 className="font-black text-lg text-stone-900 tracking-tight uppercase">Configure Bundle</h3>
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Provide detailed information for the homepage card</p>
               </div>
               <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="text-stone-400 hover:text-stone-900 transition-colors"><X className="h-5 w-5"/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Media Management Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Bundle Media Gallery</label>
                    <label className="cursor-pointer">
                        <input type="file" multiple onChange={handleFileUpload} accept="image/*" className="hidden" />
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-[3px] hover:bg-black transition-colors shadow-lg shadow-stone-900/10">
                            <Upload className="h-3 w-3" /> Upload Images
                        </span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                      {(editingItem.imageUrls || (editingItem.imageUrl ? [editingItem.imageUrl] : [])).map((url, idx) => (
                          <div key={idx} className="aspect-square relative group rounded-[5px] border border-stone-200 overflow-hidden bg-white shadow-xs">
                              <img src={getMediaUrl(url)} className="w-full h-full object-cover" alt="Gallery" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {idx === 0 && (
                                  <div className="absolute bottom-0 inset-x-0 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-[0.2em] text-center py-0.5">Primary</div>
                              )}
                          </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-stone-200 rounded-[5px] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                          <input type="file" multiple onChange={handleFileUpload} accept="image/*" className="hidden" />
                          <Plus className="h-5 w-5 text-stone-400 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[8px] font-black text-stone-400 uppercase group-hover:text-indigo-600">Add More</span>
                      </label>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Or Add External Image URL</label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="https://example.com/image.jpg" 
                            className="h-9 text-xs rounded-[3px] shadow-xs" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.target.value;
                                    if (val) {
                                        setEditingItem({
                                            ...editingItem,
                                            imageUrls: [...(editingItem.imageUrls || []), val],
                                            imageUrl: editingItem.imageUrl || val
                                        });
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Bundle Title / Name</label>
                    <Input 
                      value={editingItem.name} 
                      placeholder="e.g. Skin Transformation Ritual" 
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} 
                      className="h-11 rounded-[5px] font-bold text-[13px] shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Brand Name</label>
                    <Input 
                      value={editingItem.brand} 
                      placeholder="e.g. MEDICUBE" 
                      onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})} 
                      className="h-11 rounded-[5px] font-bold text-[13px] shadow-sm uppercase" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Badge Tag</label>
                    <Input 
                      value={editingItem.badge} 
                      placeholder="e.g. Limited Edition" 
                      onChange={(e) => setEditingItem({...editingItem, badge: e.target.value})} 
                      className="h-11 rounded-[5px] font-bold text-[13px] shadow-sm uppercase" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-[5px] border border-stone-100">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-900 tracking-wider">Final Price (₹)</label>
                    <Input 
                      type="number"
                      value={editingItem.price} 
                      onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} 
                      className="h-11 rounded-[5px] font-bold text-lg text-emerald-600 bg-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Original Price (₹)</label>
                    <Input 
                      type="number"
                      value={editingItem.originalPrice} 
                      onChange={(e) => setEditingItem({...editingItem, originalPrice: parseFloat(e.target.value) || 0})} 
                      className="h-11 rounded-[5px] font-bold text-stone-400 bg-white" 
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Product Description</label>
                    <textarea 
                      value={editingItem.description} 
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Enter a compelling description for this bundle..."
                      className="w-full p-4 bg-white border border-stone-200 rounded-[5px] text-[13px] font-medium focus:ring-2 focus:ring-stone-900/5 focus:outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">How to Use (One step per line)</label>
                    <textarea 
                      value={editingItem.howToUse} 
                      onChange={(e) => setEditingItem({...editingItem, howToUse: e.target.value})}
                      placeholder="Step 1: Cleanse...&#10;Step 2: Apply..."
                      className="w-full p-4 bg-white border border-stone-200 rounded-[5px] text-[13px] font-medium focus:ring-2 focus:ring-stone-900/5 focus:outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Benefits (One per line)</label>
                    <textarea 
                      value={editingItem.benefits} 
                      onChange={(e) => setEditingItem({...editingItem, benefits: e.target.value})}
                      placeholder="Instantly plumps skin...&#10;Repairs skin barrier..."
                      className="w-full p-4 bg-white border border-stone-200 rounded-[5px] text-[13px] font-medium focus:ring-2 focus:ring-stone-900/5 focus:outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Ingredients List</label>
                    <textarea 
                      value={editingItem.ingredients} 
                      onChange={(e) => setEditingItem({...editingItem, ingredients: e.target.value})}
                      placeholder="Water, Glycerin, Niacinamide..."
                      className="w-full p-4 bg-white border border-stone-200 rounded-[5px] text-[13px] font-medium focus:ring-2 focus:ring-stone-900/5 focus:outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase text-stone-500 tracking-wider">Product Info / FAQ</label>
                        <button 
                            onClick={() => {
                                const current = editingItem.frequentlyAskedQuestions || [];
                                setEditingItem({
                                    ...editingItem,
                                    frequentlyAskedQuestions: [...current, { q: "", a: "" }]
                                });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-[#151515] text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-stone-200 transition-colors"
                        >
                            <Plus className="h-3 w-3" /> Add Q&A
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(editingItem.frequentlyAskedQuestions || []).map((faq, idx) => (
                            <div key={idx} className="p-4 bg-stone-50/50 rounded-[5px] border border-stone-100 space-y-3 relative group/faq">
                                <button 
                                    onClick={() => {
                                        const updated = [...editingItem.frequentlyAskedQuestions];
                                        updated.splice(idx, 1);
                                        setEditingItem({ ...editingItem, frequentlyAskedQuestions: updated });
                                    }}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-stone-200 text-stone-400 opacity-0 group-hover/faq:opacity-100 transition-all flex items-center justify-center hover:text-rose-500 hover:border-rose-200 shadow-sm z-10"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-stone-400 tracking-widest px-1">Question</label>
                                    <Input 
                                        value={faq.q}
                                        onChange={(e) => {
                                            const updated = [...editingItem.frequentlyAskedQuestions];
                                            updated[idx].q = e.target.value;
                                            setEditingItem({ ...editingItem, frequentlyAskedQuestions: updated });
                                        }}
                                        placeholder="e.g. Is this suitable for sensitive skin?"
                                        className="h-10 text-xs font-bold rounded-[3px] bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-stone-400 tracking-widest px-1">Answer</label>
                                    <textarea 
                                        value={faq.a}
                                        onChange={(e) => {
                                            const updated = [...editingItem.frequentlyAskedQuestions];
                                            updated[idx].a = e.target.value;
                                            setEditingItem({ ...editingItem, frequentlyAskedQuestions: updated });
                                        }}
                                        placeholder="Yes! Our formula is hypoallergenic..."
                                        className="w-full p-3 bg-white border border-stone-200 rounded-[3px] text-xs font-medium focus:outline-none min-h-[60px]"
                                    />
                                </div>
                            </div>
                        ))}

                        {(editingItem.frequentlyAskedQuestions || []).length === 0 && (
                            <div className="py-8 text-center border border-dashed border-stone-200 rounded-[5px] bg-stone-50/30">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">No FAQ items added yet</p>
                                <button 
                                    onClick={() => setEditingItem({ ...editingItem, frequentlyAskedQuestions: [{ q: "", a: "" }] })}
                                    className="mt-2 text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                                >
                                    Add your first question
                                </button>
                            </div>
                        )}
                    </div>
                  </div>
                </div>

             </div>

             <div className="p-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0">
                <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="px-5 py-2 text-[11px] uppercase tracking-widest font-black text-stone-400 hover:text-stone-900 transition-colors">Cancel</button>
                <Button onClick={saveEditingItem} className="bg-[#151515] text-white hover:bg-black shadow-xl shadow-stone-900/20 rounded-[5px] font-black uppercase tracking-widest text-[10px] px-8 h-11">
                    {isCreating ? "Add To Bundles" : "Update Bundle"}
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
