import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Reorder, useDragControls } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  X, 
  Search, 
  Tag, 
  Sparkles, 
  GripVertical, 
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        setHasOrderChanged(false);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
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
        toast.error(data.error || "Failed to save category");
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
        toast.error(data.error || "Failed to save order");
      }
    } catch (error) {
      toast.error("An error occurred while reordering.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const toggleStatus = async (category) => {
    try {
      const res = await fetch(`${API_URL}/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
        toast.success(`Category ${!category.isActive ? "activated" : "hidden"}`);
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred while deleting.");
      console.error(error);
    }
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", imageUrl: "", isActive: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      imageUrl: category.imageUrl || "", 
      isActive: category.isActive ?? true 
    });
    setIsDialogOpen(true);
  };

  const onReorder = (newOrder) => {
    setCategories(newOrder);
    setHasOrderChanged(true);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center text-zinc-500 font-medium italic">Synchronizing inventory system...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 relative max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              Navigation Authority
            </span>
            {hasOrderChanged && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100 animate-pulse">
                Unsaved Order
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Category Manager</h1>
          <p className="text-sm text-zinc-500 max-w-xl">
            Take full control of storefront navigation. Reorder items, manage thumbnails, and toggle visibility.
          </p>
        </div>
        <div className="flex gap-3">
          {hasOrderChanged && (
            <Button 
              onClick={handleReorder} 
              disabled={isSavingOrder}
              className="rounded-xl h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-amber-200 transition-all active:scale-95"
            >
              {isSavingOrder ? <Sparkles className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save New Order
            </Button>
          )}
          <Button onClick={openAddDialog} className="rounded-xl h-12 px-6 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Filter by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-white border-zinc-200 focus-visible:ring-indigo-500 font-medium"
            />
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
            {categories.length} Categories Total
          </div>
        </div>

        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-b border-zinc-100">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 h-12">Thumbnail</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 h-12 w-1/3">Category Name</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 h-12">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-6 h-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-72 text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                      <Tag className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="text-zinc-950 font-black text-lg">No Results Found</p>
                      <p className="text-zinc-400 text-sm max-w-xs mx-auto mt-1">Adjust your search or add a new category to get started.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={categories} 
                onReorder={onReorder} 
                as="tbody"
              >
                {filteredCategories.map((cat) => (
                  <Reorder.Item 
                    key={cat.id} 
                    value={cat} 
                    as="tr"
                    className={cn(
                      "group hover:bg-zinc-50/80 border-b border-zinc-100 transition-colors",
                      !cat.isActive && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <TableCell className="pl-4 py-4 w-12">
                      <GripVertical className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 cursor-grab active:cursor-grabbing transition-colors" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {cat.imageUrl ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                          <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-300 border border-zinc-200">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">/{cat.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={cat.isActive} 
                          onCheckedChange={() => toggleStatus(cat)}
                        />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          cat.isActive ? "text-emerald-600" : "text-zinc-400"
                        )}>
                          {cat.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                          onClick={() => openEditDialog(cat)}
                        >
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] md:rounded-[3rem] p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <div className="h-32 bg-zinc-900 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="h-full w-full object-cover rounded-2xl" alt="Preview" />
                ) : (
                  <Tag className="h-10 w-10 opacity-50" />
                )}
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">
                {editingCategory ? "Edit Category Details" : "New Shopping Category"}
              </DialogTitle>
              <p className="text-xs text-zinc-500 font-medium">Define metadata and presentation for the storefront.</p>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Category Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cleansers & Toners"
                  className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-500 font-bold px-4"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Thumbnail Image URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="h-13 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-500 pl-11 font-medium"
                  />
                </div>
                <p className="text-[9px] text-zinc-400 font-bold ml-1 italic">Note: Use high-quality 400x400 source images.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl bg-white shadow-sm",
                    formData.isActive ? "text-indigo-600" : "text-zinc-400"
                  )}>
                    {formData.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <Label className="text-[11px] font-black text-zinc-900 block">Show in Navigation</Label>
                    <p className="text-[10px] text-zinc-500 font-medium">Visible to shoppers in categories.</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="flex-1 h-12 rounded-2xl border-zinc-200 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-12 rounded-2xl bg-zinc-950 hover:bg-black text-white font-bold text-[11px] uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
              >
                {editingCategory ? "Update Authority" : "Finalize Category"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
