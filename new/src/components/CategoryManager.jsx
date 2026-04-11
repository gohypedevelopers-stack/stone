import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { API_URL } from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Reorder, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  Search, 
  Tag, 
  Sparkles, 
  GripVertical, 
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CATEGORY_IMAGES, categorySphere } from "../bycategory";

// Helper for initial-based placeholders
const getInitial = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const getBackgroundColor = (name) => {
  const colors = [
    "bg-stone-50 text-stone-500",
    "bg-pink-50 text-pink-500",
    "bg-pink-100 text-pink-600",
    "bg-purple-50 text-purple-500",
    "bg-amber-50 text-amber-500",
    "bg-sky-50 text-sky-500"
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

// Memoized Row Component for maximum performance
const CategoryRow = memo(({ cat, onToggleStatus, onEdit, onDelete, canDrag }) => {
  return (
    <Reorder.Item 
      key={cat.id} 
      value={cat} 
      as="div"
      drag={canDrag ? "y" : false}
      dragListener={canDrag}
      whileDrag={{ 
        scale: 1.01, 
        backgroundColor: "rgb(255 255 255)",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        zIndex: 50
      }}
      className={cn(
        "group flex items-center border-b border-stone-100 bg-white will-change-transform",
        !cat.isActive && "opacity-60 bg-stone-50/20"
      )}
    >
      <div className="pl-4 py-4 w-12 flex-shrink-0 text-center">
        {canDrag ? (
          <GripVertical className="h-4 w-4 text-stone-300 group-hover:text-stone-400 cursor-grab active:cursor-grabbing mx-auto transition-colors" />
        ) : (
          <div className="h-4 w-4 mx-auto" />
        )}
      </div>
      
      <div className="px-4 py-3 flex-shrink-0">
        <div className="h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-sm ring-2 ring-white ring-offset-0 transition-transform group-hover:scale-105 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {cat.imageUrl || CATEGORY_IMAGES[cat.name] ? (
              <img 
                src={cat.imageUrl || CATEGORY_IMAGES[cat.name] || categorySphere} 
                alt={cat.name} 
                className="h-full w-full object-cover" 
                loading="lazy"
              />
            ) : (
              <div className={cn(
                "h-full w-full flex items-center justify-center font-black text-sm",
                getBackgroundColor(cat.name)
              )}>
                {getInitial(cat.name)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 flex-1 min-w-0">
        <div className="flex flex-col truncate">
          <span className="font-bold text-stone-950 text-sm truncate">{cat.name}</span>
          <span className="text-[10px] font-mono text-stone-400 tracking-tight truncate">/{cat.slug}</span>
        </div>
      </div>

      <div className="px-4 py-3 w-32 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Switch 
            checked={cat.isActive} 
            onCheckedChange={() => onToggleStatus(cat)}
            className="scale-90"
          />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-tight hidden sm:inline-block",
            cat.isActive ? "text-stone-900" : "text-stone-400"
          )}>
            {cat.isActive ? "Active" : "Hidden"}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 w-32 flex-shrink-0 text-right">
        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-[10px]"
            onClick={() => onEdit(cat)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-[10px]"
            onClick={() => onDelete(cat.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
});

CategoryRow.displayName = "CategoryRow";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", imageUrl: "", isActive: true });
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    fetchCategories(true);
  }, []);

  const fetchCategories = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/categories`);
      const data = await res.json();
      if (data.success) {
        const sortedData = [...data.data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCategories(sortedData);
        setHasOrderChanged(false);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Category name is required");

    try {
      const url = editingCategory 
        ? `${API_URL}/admin/categories/${editingCategory.id}`
        : `${API_URL}/admin/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category ${editingCategory ? "updated" : "created"} successfully`);
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", imageUrl: "", isActive: true });
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to save category");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
      console.error(error);
    }
  };

  const handleReorder = async () => {
    try {
      setIsSavingOrder(true);
      const reorderData = categories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index
      }));

      const res = await fetch(`${API_URL}/admin/categories/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderData }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Category order updated");
        setHasOrderChanged(false);
      } else {
        toast.error(data.message || "Failed to save order");
      }
    } catch (error) {
      toast.error("An error occurred while reordering.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const toggleStatus = useCallback(async (category) => {
    const originalStatus = category.isActive;
    
    // Optimistic UI Update
    setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !originalStatus } : c));
    
    try {
      const res = await fetch(`${API_URL}/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !originalStatus }),
      });
      const data = await res.json();
      
      if (!data.success) {
        // Rollback on failure
        setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: originalStatus } : c));
        toast.error(data.message || "Failed to toggle status");
      } else {
        toast.success(`Category ${!originalStatus ? "activated" : "hidden"}`);
      }
    } catch (error) {
      // Rollback on network error
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: originalStatus } : c));
      toast.error("Connection error while toggling status");
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    // We store the current state in case we need to rollback
    let deletedCategory = null;
    let originalCategories = [];

    setCategories(prev => {
      originalCategories = [...prev];
      deletedCategory = prev.find(c => c.id === id);
      return prev.filter(c => c.id !== id);
    });

    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Category deleted successfully");
      } else {
        // Rollback on failure (e.g., category has products)
        setCategories(originalCategories);
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      setCategories(originalCategories);
      toast.error("Connection error while deleting.");
      console.error(error);
    }
  }, []);

  const onReorder = (newOrder) => {
    setCategories(newOrder);
    setHasOrderChanged(true);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQuery = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(lowerQuery));
  }, [categories, searchQuery]);

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", imageUrl: "", isActive: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = useCallback((category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      imageUrl: category.imageUrl || "", 
      isActive: category.isActive ?? true 
    });
    setIsDialogOpen(true);
  }, []);

  if (loading) return (
    <div className="p-12 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-[10px] border-4 border-solid border-stone-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <div className="mt-4 text-stone-400 font-medium italic">Synchronizing inventory system...</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 relative w-full mb-20 px-4 lg:px-2">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-[0.1em] border border-stone-200">
              Navigation Authority
            </span>
            {hasOrderChanged && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-[0.1em] border border-pink-100 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-stone-500 max-w-xl font-medium">
            Define the visual hierarchy and visibility of your storefront navigation menu.
          </p>
        </div>
        <div className="flex gap-3">
          {hasOrderChanged && (
            <Button 
              onClick={handleReorder} 
              disabled={isSavingOrder}
              className="rounded-[10px] h-11 px-5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {isSavingOrder ? <Sparkles className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Apply New Hierarchy
            </Button>
          )}
          <Button onClick={openAddDialog} className="rounded-[10px] h-11 px-5 bg-stone-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-[10px] border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-[10px] bg-white border-stone-200 focus-visible:ring-stone-950 font-medium text-sm"
            />
          </div>
          <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest hidden sm:block">
            {categories.length} Nodes Configured
          </div>
        </div>

        <div className="min-w-full">
          {/* Header Row */}
          <div className="flex items-center bg-stone-50/50 border-b border-stone-100">
            <div className="w-12 h-11 flex-shrink-0" />
            <div className="px-4 h-11 flex items-center text-[10px] font-black uppercase tracking-widest text-stone-500">Thumbnail</div>
            <div className="px-4 h-11 flex items-center text-[10px] font-black uppercase tracking-widest text-stone-500 flex-1">Category Name</div>
            <div className="px-4 h-11 flex items-center text-[10px] font-black uppercase tracking-widest text-stone-500 w-32">Status</div>
            <div className="px-4 h-11 flex items-center text-[10px] font-black uppercase tracking-widest text-stone-500 w-32 justify-end">Actions</div>
          </div>

          <div className="relative">
            {filteredCategories.length === 0 ? (
              <div className="py-24 text-center border-t border-stone-100">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-[10px] bg-stone-50 flex items-center justify-center text-stone-200 border border-stone-100 border-dashed">
                    <Tag className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-stone-950 font-black text-lg">Empty Inventory</p>
                    <p className="text-stone-400 text-xs mt-1">Start by adding your first product category.</p>
                  </div>
                </div>
              </div>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={categories} 
                onReorder={onReorder} 
                as="div"
                className="relative"
              >
                  {filteredCategories.map((cat) => (
                    <Reorder.Item 
                      key={cat.id} 
                      value={cat} 
                      as="div"
                      className={cn(
                        "group hover:bg-stone-50/60 border-b border-stone-100 transition-all flex items-center",
                        !cat.isActive && "opacity-60 bg-stone-50/20"
                      )}
                    >
                      <div className="pl-4 py-3 w-12 text-center flex-shrink-0">
                        <GripVertical className="h-4 w-4 text-stone-300 group-hover:text-stone-400 cursor-grab active:cursor-grabbing mx-auto" />
                      </div>
                      <div className="px-4 py-3 flex-shrink-0">
                        <div className="h-11 w-11 rounded-[10px] overflow-hidden border border-stone-200 bg-stone-100 shadow-sm ring-2 ring-white ring-offset-0 transition-transform group-hover:scale-105 flex items-center justify-center">
                          {cat.imageUrl || CATEGORY_IMAGES[cat.name] ? (
                            <img 
                              src={cat.imageUrl || CATEGORY_IMAGES[cat.name] || categorySphere} 
                              alt={cat.name} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className={cn(
                              "h-full w-full flex items-center justify-center font-black text-sm transition-colors",
                              getBackgroundColor(cat.name)
                            )}>
                              {getInitial(cat.name)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 flex-1 min-w-0">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-950 text-sm">{cat.name}</span>
                          <span className="text-[10px] font-mono text-stone-400 tracking-tight">/{cat.slug}</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 w-32 flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                          <Switch 
                            checked={cat.isActive} 
                            onCheckedChange={() => toggleStatus(cat)}
                            className="scale-90"
                          />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-tight",
                            cat.isActive ? "text-stone-900" : "text-stone-400"
                          )}>
                            {cat.isActive ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-3 w-32 flex-shrink-0 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-[10px]"
                            onClick={() => openEditDialog(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-[10px]"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-[10px] p-0 overflow-hidden gap-0 border border-stone-200 shadow-2xl">
          <div className="h-28 bg-stone-950 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center translate-y-8">
              <div className={cn(
                "h-20 w-20 rounded-[10px] bg-white shadow-xl flex items-center justify-center border-4 border-white transition-all transform hover:scale-105 overflow-hidden",
                !(formData.imageUrl || CATEGORY_IMAGES[formData.name]) && getBackgroundColor(formData.name)
              )}>
                {formData.imageUrl || CATEGORY_IMAGES[formData.name] ? (
                  <img 
                    src={formData.imageUrl || CATEGORY_IMAGES[formData.name] || categorySphere} 
                    className="h-full w-full object-cover rounded-[10px]" 
                    alt="Preview" 
                  />
                ) : (
                  <span className="text-3xl font-black">{getInitial(formData.name)}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-8 pt-12 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-stone-950 tracking-tight">
                {editingCategory ? "Update Node" : "Configure New Node"}
              </DialogTitle>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Metadata Definition Interface</p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Identifier Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cleansers & Toners"
                  className="h-11 rounded-[10px] bg-stone-50 border-stone-200 focus-visible:ring-stone-950 font-bold px-4"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Asset Source URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="h-11 rounded-[10px] bg-stone-50 border-stone-200 focus-visible:ring-stone-950 pl-11 font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-[10px] bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-[10px] bg-white shadow-sm border border-stone-100",
                    formData.isActive ? "text-stone-950" : "text-stone-300"
                  )}>
                    {formData.isActive ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-stone-900 block uppercase tracking-tight">Storefront Propagation</Label>
                    <p className="text-[9px] text-stone-400 font-bold uppercase">Visibility Status</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="flex-1 h-11 rounded-[10px] border-stone-200 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-11 rounded-[10px] bg-stone-950 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all"
              >
                {editingCategory ? "Commit Sync" : "Deploy Node"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
