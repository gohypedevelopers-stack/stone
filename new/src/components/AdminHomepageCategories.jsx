import React, { useState, useEffect } from "react";
import { API_URL, SERVER_URL } from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, ImageIcon, Save, Check } from "lucide-react";
import { DEFAULT_CATEGORY_DATA } from "@/bycategory";
import { motion } from "framer-motion";
import { categorySphere } from "@/bycategory";

export function AdminHomepageCategories() {
  const [section, setSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/homepage/sections`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const categorySection = data.data.find(s => s.componentId === "shop-by-category");
          if (categorySection) {
            setSection(categorySection);
            setCategories(categorySection.settings?.categories || [...DEFAULT_CATEGORY_DATA]);
          } else {
            console.warn("Could not find shop-by-category section");
          }
        }
      })
      .catch(err => console.error("Error fetching homepage sections:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!section) return;
    try {
      const res = await fetch(`${API_URL}/homepage/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...section,
          settings: { ...section.settings, categories }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Homepage categories updated successfully!");
      } else {
        toast.error("Failed to update categories.");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
      console.error(error);
    }
  };

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        let newUrl = data.data[0];
        if (newUrl.startsWith("/app/")) {
          newUrl = `${SERVER_URL}/uploads/${newUrl.split('/').pop()}`;
        } else if (newUrl.startsWith('/')) {
            newUrl = `${SERVER_URL}${newUrl}`;
        }
        const newCats = [...categories];
        newCats[idx].image = newUrl;
        setCategories(newCats);
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500 font-medium">Loading Category Builder...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 relative max-w-4xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-violet-200">
            Storefront
          </span>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Homepage Categories</h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-xl">
            Add or change the category bubbles displayed on the main homepage.
          </p>
        </div>
        <Button onClick={handleSave} className="rounded-xl h-12 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-violet-600/20">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800">Current Categories</h3>
            <Button 
                onClick={() => setCategories([...categories, { label: "New Item", image: "" }])}
                variant="outline" 
                size="sm" 
                className="h-9 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 font-bold text-[10px] uppercase tracking-widest gap-2"
            >
                <Plus className="h-3.5 w-3.5" /> Add Category Bubble
            </Button>
        </div>

        <div className="space-y-4">
            {categories.length === 0 && (
                <div className="py-12 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 text-center text-zinc-500 font-medium text-sm">
                    No categories added yet.
                </div>
            )}
            
            {categories.map((cat, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex items-stretch hover:shadow-md transition-shadow">
                    {/* Reorder Anchors */}
                    <div className="flex flex-col bg-zinc-50 border-r border-zinc-200 p-2 justify-center gap-2">
                        <button 
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-zinc-400 hover:text-violet-600 shadow-sm border border-transparent hover:border-zinc-200 transition-all disabled:opacity-30" 
                            disabled={idx === 0} 
                            onClick={() => { const n = [...categories]; [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; setCategories(n); }}
                        >
                            <ArrowUp className="h-4 w-4" />
                        </button>
                        <button 
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-zinc-400 hover:text-violet-600 shadow-sm border border-transparent hover:border-zinc-200 transition-all disabled:opacity-30" 
                            disabled={idx === categories.length - 1} 
                            onClick={() => { const n = [...categories]; [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; setCategories(n); }}
                        >
                            <ArrowDown className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="flex-1 space-y-2 w-full">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Label</Label>
                            <Input 
                                value={cat.label} 
                                onChange={e => {
                                    const nC = [...categories]; nC[idx].label = e.target.value; setCategories(nC);
                                }}
                                className="h-10 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-violet-500 font-bold"
                                placeholder="e.g. New Arrivals"
                            />
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Image URL</Label>
                            <div className="flex gap-3">
                                <div className="h-10 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {cat.image ? (
                                        <img src={cat.image} className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4 text-zinc-300" />
                                    )}
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <Input 
                                        value={cat.image} 
                                        onChange={e => {
                                            const nC = [...categories]; nC[idx].image = e.target.value; setCategories(nC);
                                        }}
                                        className="h-10 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-violet-500 text-xs px-3 font-medium"
                                        placeholder="Paste URL..."
                                    />
                                    <label className="cursor-pointer shrink-0">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-800 transition-colors">
                                            <Upload className="h-4 w-4" />
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Delete Action */}
                        <div className="pt-6 sm:pt-0 shrink-0">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                onClick={() => {
                                    const nC = [...categories]; nC.splice(idx, 1); setCategories(nC);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
