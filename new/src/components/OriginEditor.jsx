import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Upload, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowLeft,
  Tag,
  BadgePercent,
  AlignLeft,
  Package
} from "lucide-react";


import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { THEME } from "../theme";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL, SERVER_URL } from "../utils/api";

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${SERVER_URL}/${url.replace(/^\//, "")}`;
};

export default function OriginEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const originId = pathSegments[2]; // /admin/origin-editor/:id
  const isCreating = originId === "new";

  const [sectionConfig, setSectionConfig] = useState(null);
  const [originList, setOriginList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState({

    id: `origin-${Date.now()}`,
    name: "",
    title: "",
    subtitle: "",
    heroImage: "",
    productIds: [],
    customProducts: [],
    sourceMode: "Manual"
  });

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [newCustomItem, setNewCustomItem] = useState({ 
    name: "", 
    brand: "", 
    price: "", 
    discountPrice: "", 
    stock: "",
    stockThreshold: "5",
    image: "", 
    imageUrls: [], 
    description: "", 
    usage: "", 
    benefits: "",
    ingredients: "",
    info: ""
  });




  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/homepage/sections`);
      const sections = res.data.data || [];
      const originSection = sections.find(s => s.componentId === "shop-by-origin");
      
      if (originSection) {
        setSectionConfig(originSection);
        const list = originSection.settings?.origins || [];
        setOriginList(list);

        if (!isCreating) {
          const found = list.find(o => o.id === originId);
          if (found) {
            setEditingOrigin({ ...found });
          } else {
            toast.error("Origin not found");
            navigate("/admin/shop-by-origin");
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };



  const handleFileUpload = async (e, type = "hero") => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedUrls = [];
    
    try {
      toast.loading(`Uploading asset(s)...`);
      
      for (const file of files) {
        const formData = new FormData();
        formData.append("images", file);
        const res = await axios.post(`${API_URL}/upload`, formData);
        if (res.data.success) {
          uploadedUrls.push(res.data.data[0]);
        }
      }

      if (uploadedUrls.length > 0) {
        if (type === "hero") {
          setEditingOrigin({ ...editingOrigin, heroImage: uploadedUrls[0] });
        } else if (type === "product-main") {
          setNewCustomItem(prev => ({ ...prev, image: uploadedUrls[0] }));
        } else if (type === "product-gallery") {
          setNewCustomItem(prev => ({ 
            ...prev, 
            imageUrls: [...(prev.imageUrls || []), ...uploadedUrls] 
          }));
        }
        toast.dismiss();
        toast.success(`Upload successful`);
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const handleSaveAll = async () => {
    if (!editingOrigin.name || !editingOrigin.title) {
      return toast.error("Name and Title are required");
    }

    setSaving(true);
    try {
      let updatedList;
      if (isCreating) {
        updatedList = [...originList, editingOrigin];
      } else {
        updatedList = originList.map(o => o.id === editingOrigin.id ? editingOrigin : o);
      }

      await axios.put(`${API_URL}/admin/homepage/sections/${sectionConfig.id}`, {
        settings: {
          ...sectionConfig.settings,
          origins: updatedList
        }
      });
      
      toast.success("Region updated successfully");
      navigate("/admin/shop-by-origin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomItem = () => {
    if (!newCustomItem.name || (!newCustomItem.image && (newCustomItem.imageUrls || []).length === 0)) {
      return toast.error("Name and Image are required");
    }
    const itemToAdd = { 
      ...newCustomItem, 
      id: editingCustomId || `custom-${Date.now()}`,
      image: newCustomItem.image || (newCustomItem.imageUrls && newCustomItem.imageUrls[0]) || ""
    };

    setEditingOrigin(prev => {
      const list = prev.customProducts || [];
      const exists = list.some(p => p.id === itemToAdd.id);
      
      return {
        ...prev,
        customProducts: exists 
          ? list.map(p => p.id === itemToAdd.id ? itemToAdd : p)
          : [...list, itemToAdd]
      };
    });

    setNewCustomItem({ 
      name: "", 
      brand: "", 
      stock: "",
      stockThreshold: "5",
      price: "", 
      discountPrice: "", 
      image: "", 
      imageUrls: [], 
      description: "", 
      usage: "", 
      benefits: "",
      ingredients: "",
      info: "" 
    });

    setEditingCustomId(null);
    setIsAddingCustom(false);
  };

  const handleEditCustomEntity = (item) => {
    setNewCustomItem({ ...item });
    setEditingCustomId(item.id);
    setIsAddingCustom(true);
  };

  const removeCustomItem = (id) => {
    setEditingOrigin(prev => ({
      ...prev,
      customProducts: (prev.customProducts || []).filter(p => p.id !== id)
    }));
  };

  const closeDialog = () => {
    setIsAddingCustom(false);
    setEditingCustomId(null);
    setNewCustomItem({ 
      name: "", 
      brand: "", 
      stock: "",
      stockThreshold: "5",
      price: "", 
      discountPrice: "", 
      image: "", 
      imageUrls: [], 
      description: "", 
      usage: "", 
      benefits: "",
      ingredients: "",
      info: "" 
    });
  };




  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-[60vh]">
      <div className="animate-spin h-8 w-8 border-4 border-stone-200 border-t-stone-900 rounded-full" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/shop-by-origin")}
            className="h-12 w-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-200 hover:shadow-sm transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase leading-none">
              {isCreating ? "New Region" : "Edit Region"}
            </h1>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-2">
              Setup details for {editingOrigin.name || "New Region"}
            </p>

          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/shop-by-origin")}
            className="rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] text-stone-400 hover:text-stone-900"
           >
             Abort
           </Button>
           <Button 
            onClick={handleSaveAll}
            disabled={saving}
            className="h-12 px-10 rounded-full bg-stone-900 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-stone-200 hover:bg-black transition-all active:scale-95"
           >
             {saving ? "Saving..." : "Save Changes"}

           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Left Side: Identity & Products */}
         <div className="lg:col-span-12 space-y-12">
            
            {/* Phase 1: Visual Identity */}
            <div className="bg-white rounded-[32px] border border-stone-100 p-10 shadow-sm space-y-10">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-stone-50 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-stone-900" />
                  </div>
                  <h4 className="text-[14px] font-black text-stone-900 uppercase tracking-[0.2em]">Region Details</h4>

               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] ml-1">Region Name</label>
                      <Input 
                        value={editingOrigin.name} 
                        onChange={(e) => setEditingOrigin({...editingOrigin, name: e.target.value})} 
                        className="h-14 rounded-2xl border-stone-100 bg-stone-50/50 font-black text-sm px-6"
                        placeholder="e.g. Korean"
                      />
                    </div>

                    {/* Curation Mode Selector */}
                    <div className="space-y-3 p-6 rounded-[2rem] bg-stone-50/30 border border-stone-100/50">
                       <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] ml-1">Curation Mode</label>
                          <Badge variant="outline" className="bg-white text-[8px] font-black uppercase px-2 py-0.5 border-stone-100">{editingOrigin.sourceMode || "Manual"}</Badge>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setEditingOrigin({...editingOrigin, sourceMode: "Automatic"})}
                            className={`h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                              editingOrigin.sourceMode === "Automatic" 
                                ? "bg-stone-900 border-stone-900 text-white shadow-lg" 
                                : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"
                            }`}
                          >
                             <span className="text-[10px] font-black uppercase tracking-widest">Smart Filter</span>
                             <span className={`text-[8px] font-bold uppercase opacity-50 ${editingOrigin.sourceMode === "Automatic" ? "text-stone-300" : "text-stone-400"}`}>Auto-discover</span>
                          </button>
                          <button
                            onClick={() => setEditingOrigin({...editingOrigin, sourceMode: "Manual"})}
                            className={`h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                              editingOrigin.sourceMode === "Manual" || !editingOrigin.sourceMode
                                ? "bg-stone-900 border-stone-900 text-white shadow-lg" 
                                : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"
                            }`}
                          >
                             <span className="text-[10px] font-black uppercase tracking-widest">Hand-Curated</span>
                             <span className={`text-[8px] font-bold uppercase opacity-50 ${editingOrigin.sourceMode === "Manual" ? "text-stone-300" : "text-stone-400"}`}>Manual Selection</span>
                          </button>
                       </div>
                       <p className="text-[8px] font-bold text-stone-300 leading-tight px-1 mt-1">
                          {editingOrigin.sourceMode === "Automatic" 
                            ? "Automatically finds products matching this region's name or tags." 
                            : "Displays ONLY the products and ritual units you manually add below."}
                       </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] ml-1">Main Title</label>
                      <Input 
                        value={editingOrigin.title} 
                        onChange={(e) => setEditingOrigin({...editingOrigin, title: e.target.value})} 
                        className="h-14 rounded-2xl border-stone-100 bg-stone-50/50 font-black text-sm px-6"
                        placeholder="e.g. K-Beauty Rituals"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] ml-1">Description</label>
                      <textarea 
                        value={editingOrigin.subtitle} 
                        onChange={(e) => setEditingOrigin({...editingOrigin, subtitle: e.target.value})} 
                        className="w-full p-6 h-32 rounded-2xl border border-stone-100 bg-stone-50/50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5 transition-all resize-none leading-relaxed"
                        placeholder="Describe this region..."
                      />
                    </div>

                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-[0.2em] ml-1">Hero Asset</label>
                    <div className="aspect-[16/10] rounded-[2.5rem] bg-stone-50 border border-stone-100 overflow-hidden relative group cursor-pointer shadow-inner flex items-center justify-center">
                       {editingOrigin.heroImage ? (
                         <img src={getMediaUrl(editingOrigin.heroImage)} className="w-full h-full object-cover" />
                       ) : (
                         <div className="flex flex-col items-center gap-4 text-stone-300">
                           <ImageIcon className="h-12 w-12" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Image Required</span>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                          <label className="cursor-pointer h-14 px-8 rounded-full bg-white text-stone-900 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                             <Upload className="h-4 w-4" />
                             {editingOrigin.heroImage ? "Change Image" : "Upload Image"}
                             <input type="file" className="hidden" onChange={(e) => handleFileUpload(e)} accept="image/*" />
                          </label>
                       </div>
                    </div>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest text-center">Large image recommended (1920px+)</p>


                  </div>
               </div>
            </div>


            {/* Phase 3: Custom Ritual Units */}
            <div className="bg-white rounded-[32px] border border-stone-100 p-10 shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#ff3b8f]/5 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-[#ff3b8f]" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-stone-900 uppercase tracking-[0.2em]">Region Products</h4>
                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Add custom products for this region</p>

                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsAddingCustom(true)}
                    className="h-12 px-8 rounded-full bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                  >
                    Add Product

                  </Button>
               </div>

               {(!editingOrigin.customProducts || editingOrigin.customProducts.length === 0) ? (
                 <div className="p-20 border-2 border-dashed border-stone-100 rounded-[2.5rem] text-center bg-stone-50/10">
                    <Sparkles className="h-10 w-10 text-stone-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">No products added yet</p>
                 </div>

               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {editingOrigin.customProducts.map(p => (
                       <div key={p.id} className="group relative bg-white border border-stone-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col aspect-[4/5]">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-stone-50 border-b border-stone-100">
                             <img src={getMediaUrl(p.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             
                             {/* Hover Overlay */}
                             <div className="absolute top-3 right-3 z-10">
                                {Number(p.stock) <= 0 ? (
                                   <Badge className="bg-rose-500 text-white border-none text-[8px] font-black uppercase tracking-tighter px-2 h-5">Sold Out</Badge>
                                ) : Number(p.stock) <= Number(p.stockThreshold || 5) ? (
                                   <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase tracking-tighter px-2 h-5">{p.stock} Left</Badge>
                                ) : (
                                   <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-tighter px-2 h-5">{p.stock} Units</Badge>
                                )}
                             </div>

                             <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                <Button 
                                  variant="secondary"
                                  onClick={() => handleEditCustomEntity(p)}
                                  className="h-10 px-6 rounded-full bg-white text-stone-900 font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                                >
                                   Edit Details
                                </Button>

                                <button 
                                  onClick={() => removeCustomItem(p.id)}
                                  className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all hover:scale-105 shadow-xl"
                                >
                                   <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-center text-center">
                             <p className="text-[11px] font-black text-stone-900 uppercase tracking-tight line-clamp-1 mb-1">{p.name}</p>
                             <div className="flex items-center justify-center gap-2">
                                {p.discountPrice ? (
                                  <>
                                    <span className="text-[10px] font-bold text-stone-900">₹{p.discountPrice}</span>
                                    <span className="text-[9px] font-bold text-stone-300 line-through">₹{p.price}</span>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-bold text-stone-900">₹{p.price}</span>
                                )}
                                <span className="h-1 w-1 rounded-full bg-stone-200" />
                                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{p.brand}</span>
                             </div>
                          </div>

                       </div>
                     ))}
                  </div>
               )}
            </div>

         </div>
      </div>

      {/* Custom Entity Modal (Modularized logic) */}
      <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
          <DialogContent className="sm:max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white h-[90vh]">
            <div className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden">
               {/* Header - Row 1 (Fixed) */}
               <header className="px-12 py-10 flex items-center justify-between border-b border-stone-100 bg-white/50 backdrop-blur-md z-30">
                  <div className="flex items-center gap-6">
                     <div className="h-14 w-14 rounded-[1.25rem] bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-200">
                        {editingCustomId ? <Edit3 size={24} /> : <Plus size={24} />}
                     </div>
                     <div>
                        <h3 className="text-[20px] font-black text-stone-900 uppercase tracking-tighter leading-none italic">
                           {editingCustomId ? "Update Ritual Drop" : "Deploy New Ritual"}
                        </h3>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">Configuration Registry / Internal Access</p>
                     </div>
                  </div>
                  <button onClick={closeDialog} className="h-12 w-12 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white transition-all"><X size={20}/></button>
               </header>

               {/* Scrollable Clinical Workspace - Row 2 (Flexible) */}
               <div className="overflow-y-auto custom-scrollbar bg-stone-50/20">
                  <div className="px-12 py-12 flex gap-16 max-w-7xl mx-auto min-h-full">
                     <div className="flex-1 space-y-12 pb-10">
                        {/* Identity Section */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <Tag className="h-4 w-4 text-stone-300" />
                              <span className="text-[11px] font-black uppercase text-stone-400 tracking-[0.2em]">Product Identity</span>
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.1em] ml-1">Title</label>
                                 <Input value={newCustomItem.name} onChange={(e) => setNewCustomItem({...newCustomItem, name: e.target.value})} className="h-16 border-stone-100 rounded-3xl bg-white font-medium text-base focus:shadow-xl transition-all px-6 focus:ring-0" placeholder="Product Name" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.1em] ml-1">Brand</label>
                                 <Input value={newCustomItem.brand} onChange={(e) => setNewCustomItem({...newCustomItem, brand: e.target.value})} className="h-16 border-stone-100 rounded-3xl bg-white font-medium text-base focus:shadow-xl transition-all px-6 focus:ring-0" placeholder="e.g. OMW Choice" />
                              </div>
                           </div>
                        </div>

                        {/* Metrics & Valuation */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <BadgePercent className="h-4 w-4 text-stone-300" />
                              <span className="text-[11px] font-black uppercase text-stone-400 tracking-[0.2em]">Metrics & Valuation</span>
                           </div>
                           <div className="grid grid-cols-4 gap-4 p-8 bg-white border border-stone-100 rounded-[2.5rem] shadow-sm">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.1em] ml-1">Price</label>
                                 <Input value={newCustomItem.price} onChange={(e) => setNewCustomItem({...newCustomItem, price: e.target.value})} className="h-14 border-stone-50 rounded-2xl bg-stone-50/50 font-bold text-base text-center focus:bg-white transition-all focus:ring-0" placeholder="₹" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-rose-300 tracking-[0.1em] ml-1">Sale</label>
                                 <Input value={newCustomItem.discountPrice} onChange={(e) => setNewCustomItem({...newCustomItem, discountPrice: e.target.value})} className="h-14 border-rose-50 rounded-2xl bg-rose-50/20 font-bold text-base text-center text-rose-500 focus:bg-white transition-all focus:ring-0" placeholder="₹" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.1em] ml-1">Stock</label>
                                 <Input type="number" value={newCustomItem.stock} onChange={(e) => setNewCustomItem({...newCustomItem, stock: e.target.value})} className="h-14 border-stone-50 rounded-2xl bg-stone-50/50 font-bold text-base text-center focus:bg-white transition-all focus:ring-0" placeholder="Qty" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-stone-300 tracking-[0.1em] ml-1">Alert</label>
                                 <Input type="number" value={newCustomItem.stockThreshold} onChange={(e) => setNewCustomItem({...newCustomItem, stockThreshold: e.target.value})} className="h-14 border-stone-50 rounded-2xl bg-stone-50/50 font-bold text-base text-center focus:bg-white transition-all focus:ring-0" placeholder="5" />
                              </div>
                           </div>
                        </div>

                        {/* Narrative Stack */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <AlignLeft className="h-4 w-4 text-stone-300" />
                              <span className="text-[11px] font-black uppercase text-stone-400 tracking-[0.2em]">Editorial Content</span>
                           </div>
                           <div className="space-y-12">
                              {[
                                 { id: 'description', label: 'RITUAL STORY', placeholder: 'Describe the soul of this ritual...' },
                                 { id: 'usage', label: 'APPLICATION PROTOCOL', placeholder: 'How to experience this product...' },
                                 { id: 'benefits', label: 'OBSERVED RESULTS', placeholder: 'What are the main benefits...' },
                                 { id: 'ingredients', label: 'INGREDIENTS LIST', placeholder: 'Detailed component inventory...' },
                                 { id: 'info', label: 'LOGISTICS & CARE', placeholder: 'Sourcing, shipping, and maintenance...' }
                              ].map((field) => (
                                 <div key={field.id} className="space-y-4 group">
                                    <div className="flex items-center gap-2">
                                       <div className="h-1.5 w-1.5 rounded-full bg-stone-200" />
                                       <label className="text-[10px] font-black uppercase text-stone-400 tracking-[0.3em] group-hover:text-stone-950 transition-colors">{field.label}</label>
                                    </div>
                                    <textarea 
                                       value={newCustomItem[field.id]} 
                                       onChange={(e) => setNewCustomItem({...newCustomItem, [field.id]: e.target.value})} 
                                       className="w-full p-8 bg-white border border-stone-100 rounded-[2.5rem] focus:outline-none text-[15px] font-medium leading-[1.8] resize-none h-48 placeholder:text-stone-200 transition-all focus:border-[#ff4fa3]/20 focus:shadow-2xl focus:shadow-[#ff4fa3]/5 focus:bg-stone-50/10" 
                                       placeholder={field.placeholder} 
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Side Panel: Assets */}
                     <div className="w-80 space-y-10 pr-4 shrink-0">
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <ImageIcon className="h-4 w-4 text-stone-300" />
                              <span className="text-[11px] font-black uppercase text-stone-400 tracking-[0.2em]">Assets Panel</span>
                           </div>
                           <div className="space-y-8">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase text-stone-300 tracking-[0.1em] ml-2">Cover Asset</label>
                                 <div className="aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#ff4fa3]/30 transition-all shadow-sm shadow-stone-100">
                                    {newCustomItem.image ? (
                                       <img src={getMediaUrl(newCustomItem.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    ) : (
                                       <div className="flex flex-col items-center gap-4 text-stone-300">
                                          <Upload className="h-10 w-10 opacity-30" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Main</span>
                                       </div>
                                    )}
                                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                                       <label className="cursor-pointer h-14 px-8 rounded-full bg-white text-stone-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
                                          <Upload className="h-4 w-4" /> CHANGE <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "product-main")} />
                                       </label>
                                    </div>
                                 </div>
                              </div>
                 
                              <div className="space-y-4 pt-4">
                                 <div className="flex items-center justify-between px-2">
                                    <span className="text-[9px] font-black uppercase text-stone-300 tracking-widest">Gallery Units</span>
                                    <label className="h-8 px-4 border border-stone-100 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all bg-white/50">
                                       <Plus className="h-3 w-3" /> ADD <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, "product-gallery")} />
                                    </label>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    {newCustomItem.imageUrls?.map((url, i) => (
                                       <div key={i} className="aspect-square rounded-[1.5rem] overflow-hidden border border-stone-100 relative group shadow-sm bg-white">
                                          <img src={getMediaUrl(url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                          <button onClick={() => {
                                             const updated = (newCustomItem.imageUrls || []).filter((_, idx) => idx !== i);
                                             setNewCustomItem({...newCustomItem, imageUrls: updated});
                                          }} className="absolute inset-0 bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                             <Trash2 className="h-5 w-5" />
                                          </button>
                                       </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 2 - (newCustomItem.imageUrls?.length || 0)) }).map((_, i) => (
                                       <div key={i} className="aspect-square rounded-[1.5rem] border border-stone-100 bg-white shadow-inner flex items-center justify-center">
                                          <div className="h-1.5 w-1.5 rounded-full bg-stone-50" />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Fixed Footer - Row 3 (Fixed) */}
               <div className="px-12 py-8 border-t border-stone-100 bg-white/90 backdrop-blur-xl flex items-center justify-between z-30 shrink-0">
                  <button 
                     onClick={closeDialog}
                     className="h-14 px-10 rounded-full bg-white border border-stone-100 text-stone-400 font-extrabold text-[10px] uppercase tracking-widest hover:text-stone-900 transition-all active:scale-95"
                  >
                     Abort Registration
                  </button>
                  <Button 
                     onClick={handleAddCustomItem}
                     className="h-16 px-16 rounded-full bg-stone-950 text-white font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all hover:scale-[1.02] active:scale-95"
                  >
                     {editingCustomId ? "Commit Protocol" : "Launch Ritual"}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
