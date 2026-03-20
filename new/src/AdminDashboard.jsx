import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MoreVertical,
  ArrowUpDown,
  ExternalLink,
  Ban,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Eye,
  MapPin,
  History,
  CreditCard,
  Activity,
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  BookOpen,
  Plus,
  Image as ImageIcon,
  Trash2,
  Check,
  Camera,
  Pencil,
  LayoutTemplate,
  Printer
} from "lucide-react";

import { printThermalReceipt } from "@/utils/printReceipt";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HomepageManager } from "@/components/HomepageManager";
import { VendorOfflineBilling } from "@/components/VendorOfflineBilling";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { THEME } from "./theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const pathPart = location.pathname.split('/').filter(Boolean).pop();
  const activeView = (pathPart === 'admin' || !pathPart) ? 'overview' : pathPart;

  // Detail Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    businessName: '', ownerName: '', contactNumber: '', email: '', businessCategory: '', storeAddress: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', price: '', categoryName: '', description: '',
    tags: '', featured: false, rewardEligible: false, limitedOffer: false,
    ingredients: '', whyWeLoveIt: '', discountPrice: '', existingImages: [],
    vendors: [{ vendorId: '', stock: '' }]
  });
  const [productBenefits, setProductBenefits] = useState([{ icon: '✨', text: '' }]);
  const [productFaq, setProductFaq] = useState([{ q: '', a: '' }]);
  const [imageFiles, setImageFiles] = useState({ primary: null, additional: [] });
  const [hasMultipleImages, setHasMultipleImages] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [initialProductState, setInitialProductState] = useState(null);

  const { logout } = useAuth();

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    const newProd = {
      name: p.name, brand: p.brand || '', price: p.price,
      categoryName: p.category?.name || '', description: p.description || '',
      tags: p.tags?.join(', ') || '',
      featured: p.featured, rewardEligible: p.rewardEligible,
      limitedOffer: p.limitedOffer, ingredients: p.ingredients || '',
      whyWeLoveIt: p.whyWeLoveIt || '', discountPrice: p.discountPrice || '',
      existingImages: (p.imageUrls || []).filter(img => img && img.trim() !== ''),
      vendors: p.bundledVendors ? p.bundledVendors.map(bv => ({ vendorId: bv.vendorId || bv.vendor?.id, stock: bv.stock, _existingId: bv.id })) : [{ vendorId: p.vendorId, stock: p.stock, _existingId: p.id }]
    };
    setNewProduct(newProd);
    
    const ben = (p.benefits && p.benefits.length > 0) ? p.benefits : [{ icon: '✨', text: '' }];
    const faq = (p.faq && p.faq.length > 0) ? p.faq : [{ q: '', a: '' }];
    
    setProductBenefits(ben);
    setProductFaq(faq);
    setInitialProductState(JSON.stringify({ prod: newProd, ben, faq }));
    setImageFiles({ primary: null, additional: [] });
    setHasMultipleImages(p.imageUrls && p.imageUrls.length > 1);
    fetch(`${API_URL}/admin/vendors`).then(r => r.json()).then(d => {
      if (d.success) setVendors(d.data);
    });
    navigate('/admin/add-product');
  };

  const handleCreateProductClick = () => {
    setEditingProductId(null);
    const newProd = {
      name: '', brand: '', price: '', categoryName: '', description: '',
      tags: '', featured: false, rewardEligible: false, limitedOffer: false,
      ingredients: '', whyWeLoveIt: '', discountPrice: '', existingImages: [],
      vendors: [{ vendorId: '', stock: '' }]
    };
    setNewProduct(newProd);
    
    const ben = [{ icon: '✨', text: '' }];
    const faq = [{ q: '', a: '' }];
    
    setProductBenefits(ben);
    setProductFaq(faq);
    setInitialProductState(JSON.stringify({ prod: newProd, ben, faq }));
    setImageFiles({ primary: null, additional: [] });
    setHasMultipleImages(false);
    fetch(`${API_URL}/admin/vendors`).then(r => r.json()).then(d => {
      if (d.success) setVendors(d.data);
    });
    navigate('/admin/add-product');
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = API_URL.replace(/\/api$/, '');
    return `${baseUrl}/${url.replace(/^\//, '')}`;
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const resp = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.success) {
        fetchDataForView('inventory');
      } else {
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  useEffect(() => {
    if (activeView === 'add-product') {
      setLoading(false);
      return;
    }

    if (activeView !== 'overview') {
      fetchDataForView(activeView);
      if (activeView === 'inventory') {
        fetch(`${API_URL}/admin/vendors`).then(r => r.json()).then(d => {
          if (d.success) setVendors(d.data);
        });
      }
    } else {
      fetchStats();
    }
  }, [activeView]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/dashboard`);
      const data = await resp.json();
      if (data.success) setStats(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDataForView = async (view) => {
    setLoading(true);
    try {
      const endpoint = view === 'inventory' ? 'products' :
        view === 'orders' ? 'orders' :
          view === 'vendors' ? 'vendors' : 'customers';
      const resp = await fetch(`${API_URL}/admin/${endpoint}`);
      const data = await resp.json();
      if (data.success) {
        if (view === 'inventory') setProducts(data.data);
        else if (view === 'orders') setOrders(data.data);
        else if (view === 'vendors') setVendors(data.data);
        else if (view === 'customers') setCustomers(data.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const groupedProducts = useMemo(() => {
    return Object.values((products || []).reduce((acc, p) => {
      const baseName = p.name ? p.name.trim().toLowerCase() : 'unnamed';
      if (!acc[baseName]) {
        acc[baseName] = { ...p, bundledVendors: [{ vendor: p.vendor, vendorId: p.vendorId, stock: p.stock, id: p.id }] };
      } else {
        acc[baseName].bundledVendors.push({ vendor: p.vendor, vendorId: p.vendorId, stock: p.stock, id: p.id });
        acc[baseName].stock += p.stock;
      }
      return acc;
    }, {})).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [products]);

  const fetchCustomerDetail = async (id) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/customers/${id}`);
      const data = await resp.json();
      if (data.success) setSelectedUser(data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const fetchVendorDetail = async (id) => {
    setDetailLoading(true);
    setIsVendorDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors/${id}`);
      const data = await resp.json();
      if (data.success) setSelectedVendor(data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const fetchOrderDetail = async (id, type) => {
    setDetailLoading(true);
    setIsOrderOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/orders/${id}?type=${type}`);
      const data = await resp.json();
      if (data.success) setSelectedOrder(data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!editingProductId && !imageFiles.primary) return alert('A primary product image is required.');

    setLoading(true);
    try {
      let finalImageUrls = [...newProduct.existingImages];
      let filesToUpload = [];

      if (imageFiles.primary) filesToUpload.push(imageFiles.primary);
      if (hasMultipleImages && imageFiles.additional.length > 0) {
        imageFiles.additional.forEach(f => filesToUpload.push(f));
      }

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(file => formData.append('images', file));
        
        const uploadResp = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        const uploadData = await uploadResp.json();
        if (!uploadData.success) throw new Error('Image upload failed');

        let uploadedUrls = uploadData.data;

        if (imageFiles.primary) {
           if (finalImageUrls.length > 0) finalImageUrls[0] = uploadedUrls[0];
           else finalImageUrls.unshift(uploadedUrls[0]);
           uploadedUrls = uploadedUrls.slice(1);
        }

        if (uploadedUrls.length > 0) {
           finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }
      }

      // Step 2: Create or Update product
      const basePayload = {
        ...newProduct,
        price: Number(newProduct.price),
        tags: newProduct.tags ? newProduct.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        imageUrls: finalImageUrls,
        ingredients: newProduct.ingredients || null,
        whyWeLoveIt: newProduct.whyWeLoveIt || null,
        benefits: productBenefits.filter(b => b.text.trim()).length > 0 ? productBenefits.filter(b => b.text.trim()) : null,
        faq: productFaq.filter(f => f.q.trim() && f.a.trim()).length > 0 ? productFaq.filter(f => f.q.trim() && f.a.trim()) : null,
      };

      if (editingProductId) {
        let initialSnap = { prod: { vendors: [] } };
        try { if(initialProductState) initialSnap = JSON.parse(initialProductState); } catch(e){}
        const originalVendors = initialSnap.prod.vendors;
        const currentExistingIds = newProduct.vendors.filter(v => v._existingId).map(v => v._existingId);
        
        const deletedVendors = originalVendors.filter(v => v._existingId && !currentExistingIds.includes(v._existingId));
        
        await Promise.all(deletedVendors.map(v => fetch(`${API_URL}/admin/products/${v._existingId}`, { method: 'DELETE' })));

        await Promise.all(newProduct.vendors.map(async (v) => {
          const payload = { ...basePayload, vendorId: v.vendorId, stock: Number(v.stock) };
          if (v._existingId) {
            const resp = await fetch(`${API_URL}/admin/products/${v._existingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await resp.json();
            if (!data.success) throw new Error(data.message || 'Failed to update bundled vendor product');
          } else {
            const resp = await fetch(`${API_URL}/admin/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await resp.json();
            if (!data.success) throw new Error(data.message || 'Failed to create new bundled vendor product');
          }
        }));
      } else {
        await Promise.all(newProduct.vendors.map(async (v) => {
          const payload = { ...basePayload, vendorId: v.vendorId, stock: Number(v.stock) };
          const resp = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await resp.json();
          if (!data.success) throw new Error(data.message || 'Failed to create product for a vendor');
        }));
      }

      setNewProduct({ name: '', brand: '', price: '', categoryName: '', description: '', tags: '', featured: false, rewardEligible: false, limitedOffer: false, ingredients: '', whyWeLoveIt: '', discountPrice: '', existingImages: [], vendors: [{ vendorId: '', stock: '' }] });
        setProductBenefits([{ icon: '✨', text: '' }]);
        setProductFaq([{ q: '', a: '' }]);
        setImageFiles({ primary: null, additional: [] });
        setHasMultipleImages(false);
        setEditingProductId(null);
        navigate('/admin/inventory');
        fetchDataForView('inventory');
    } catch (err) { console.error(err); alert('Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newVendorData, approvalStatus: 'APPROVED' })
      });
      const data = await resp.json();
      if (data.success) {
        setIsAddVendorOpen(false);
        setNewVendorData({ businessName: '', ownerName: '', contactNumber: '', email: '', businessCategory: '', storeAddress: '' });
        fetchDataForView('vendors');
      } else {
        alert(data.message || 'Failed to add vendor.');
      }
    } catch (err) { console.error(err); alert('Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleViewChange = (view) => {
    navigate(view === 'overview' ? '/admin' : `/admin/${view}`);
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, description }) => {
    const bgColor = colorClass.split(' ').find(c => c.startsWith('bg-'));
    const textColor = colorClass.split(' ').find(c => c.startsWith('text-'));

    return (
      <Card className={cn(
        "relative overflow-hidden group border-0 transition-all duration-500 ease-out hover:-translate-y-1.5 rounded-[1.5rem] bg-white cursor-pointer flex flex-col",
        "shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] min-h-[155px]"
      )}>
        {/* Soft glowing ambient orb in the top right corner */}
        <div className={cn(
          "absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-50 group-hover:scale-150 transition-all duration-700 ease-out",
          bgColor
        )} />

        {/* Decorative sparkline at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={cn("h-full w-full")} style={{background: `linear-gradient(90deg, transparent, ${textColor?.includes('blue') ? '#3b82f6' : textColor?.includes('emerald') ? '#10b981' : textColor?.includes('purple') ? '#8b5cf6' : '#ec4899'}, transparent)`}} />
        </div>

        {/* Subtle glass effect borders */}
        <div className="absolute inset-0 ring-1 ring-inset ring-indigo-900/[0.04] rounded-[1.5rem] pointer-events-none" />

        <CardHeader className="flex flex-row items-center gap-3.5 pb-0 pt-6 px-6 relative z-20">
          <div className={cn("p-2.5 rounded-xl w-fit transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-white/60", colorClass)}>
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <CardTitle className="font-['Inter'] text-stone-500 font-semibold text-[13px] tracking-wide leading-tight">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-5 pt-3 relative z-20 flex flex-col justify-end flex-1">
          <div className={cn(
            "text-[38px] leading-none font-['DM_Sans'] font-bold tracking-tight transition-all duration-500 transform group-hover:translate-x-0.5"
          )}>
            <span className="text-indigo-950">
              {value}
            </span>
          </div>
          {description && (
            <p className="font-['Inter'] text-[11px] text-stone-400 font-medium leading-snug max-w-[180px] mt-1.5">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && activeView === 'overview') return (
    <div className="flex h-screen w-full items-center justify-center bg-stone-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-indigo-950" />
    </div>
  );

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full ${THEME.colors.background.secondary} bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`}>
        <Sidebar className="border-r border-stone-200/60 bg-white">
          <SidebarHeader className="p-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-lg shadow-lg shadow-indigo-500/25">O</div>
              <div className="flex flex-col">
                <span className="font-['Inter'] font-extrabold text-indigo-950 leading-tight text-[15px] tracking-tight">OMW Admin</span>
                <span className="font-['Inter'] text-[9px] text-purple-500 font-bold uppercase tracking-[0.2em]">Enterprise OS</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-3">
            <SidebarMenu className="mt-2 gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'homepage-builder', label: 'Homepage Builder', icon: LayoutTemplate },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn("flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group", activeView === item.id ? "!bg-indigo-50 !text-indigo-950 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-indigo-950")}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] transition-colors", activeView === item.id ? "!text-indigo-600" : "text-stone-400 group-hover:text-indigo-600")} />
                    <span className="font-['Inter'] font-semibold text-[13px]">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-indigo-950 w-full">
                      <Users className="h-[18px] w-[18px] text-stone-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">Vendors</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === 'vendors'}
                          onClick={() => handleViewChange('vendors')}
                          className={cn("font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200", activeView === 'vendors' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800")}
                        >
                          {activeView === 'vendors' && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />}
                          Vendor Overview
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === 'vendor-analytics'}
                          onClick={() => handleViewChange('vendor-analytics')}
                          className={cn("font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200", activeView === 'vendor-analytics' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800")}
                        >
                          {activeView === 'vendor-analytics' && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />}
                          Vendor Analytics
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === 'offline-billing'}
                          onClick={() => handleViewChange('offline-billing')}
                          className={cn("font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200", activeView === 'offline-billing' ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800")}
                        >
                          {activeView === 'offline-billing' && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />}
                          Offline Billing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {[
                { id: 'customers', label: 'Customers', icon: UserPlus },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn("flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group", activeView === item.id ? "!bg-indigo-50 !text-indigo-950 font-bold" : "text-stone-600 hover:bg-stone-50 hover:text-indigo-950")}
                  >
                    <item.icon className={cn("h-[18px] w-[18px] transition-colors", activeView === item.id ? "!text-indigo-600" : "text-stone-400 group-hover:text-indigo-600")} />
                    <span className="font-['Inter'] font-semibold text-[13px]">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
              <Avatar className="h-9 w-9 ring-2 ring-indigo-100">
                <AvatarFallback className="bg-indigo-950 text-white font-bold text-xs">AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-['Inter'] text-sm font-bold text-stone-800 truncate">Admin</span>
                <span className="font-['Inter'] text-[10px] text-stone-400 font-medium">Manager Access</span>
              </div>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-rose-50 transition-all group" title="Logout">
                <X className="h-4 w-4 text-stone-400 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col relative overflow-hidden z-0">
          <header className={`h-[88px] bg-white/70 backdrop-blur-2xl px-12 flex items-center justify-between sticky top-0 z-50 border-b border-stone-200/50 ${THEME.shadows.sm}`}>
            <div className="flex items-center gap-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Global Status: Active</span>
              </div>
            </div>

          </header>

          <main className="p-12 w-full">
            {activeView === 'homepage-builder' && <HomepageManager />}
            {activeView === 'offline-billing' && <VendorOfflineBilling />}
            {activeView === 'overview' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                <header>
                  <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Enterprise Overview</h1>
                  <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>Holistic view of marketplace performance and scale.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Customers" value={stats?.totalUsers || 0} icon={Users} colorClass="bg-blue-50 text-blue-600" description="Total registered buyers on platform" />
                  <StatCard title="Vendors" value={stats?.totalVendors || 0} icon={Users} colorClass="bg-emerald-50 text-emerald-600" description="Active enterprise partner nodes" />
                  <StatCard title="Inventory" value={stats?.totalProducts || 0} icon={Package} colorClass="bg-purple-50 text-purple-600" description="Live catalog items across network" />
                  <StatCard title="Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} colorClass="bg-pink-50 text-pink-600" description="Completed gross transaction count" />
                </div>

                {stats?.pendingVendorApprovals > 0 && (
                  <Card className="bg-indigo-950 text-white border-none p-8 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-indigo-950/20">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <AlertCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">Critical Approvals Required</h3>
                        <p className="text-stone-400 text-sm mt-1">{stats.pendingVendorApprovals} vendor profiles are awaiting enterprise authorization to go live.</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewChange('vendors')}
                      className="bg-white text-indigo-950 font-black px-8 h-12 rounded-2xl hover:bg-stone-100"
                    >
                      Process Now
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {/* View Logic for Inventory and Orders omitted for brevity as they haven't changed */}
            {/* Keeping full implementation for reliability */}

            {activeView === 'inventory' && (
              <div className="space-y-8 animate-in fade-in">
                <header className="flex items-center justify-between gap-6 mb-12">
                  <div className="flex flex-col">
                    <h1 className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Product Inventory</h1>
                    <p className={`${THEME.typography.micro.muted}`}>Catalog management across all enterprise partners.</p>
                  </div>
                  <div className="flex items-center gap-4">

                    <Button
                      onClick={handleCreateProductClick}
                      className="bg-indigo-950 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-indigo-950/40 hover:bg-[#1a0b2e] transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </header>

                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-stone-50">
                        <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                          <TableHead className="p-4 min-w-[280px]">Product</TableHead>
                          <TableHead className="p-4 min-w-[120px]">Category</TableHead>
                          <TableHead className="p-4 min-w-[120px]">Vendor</TableHead>
                          <TableHead className="p-4 text-right min-w-[100px]">Price</TableHead>
                          <TableHead className="p-4 text-right min-w-[100px]">Stock</TableHead>
                          <TableHead className="p-4 text-center min-w-[90px]">Status</TableHead>
                          <TableHead className="p-4 text-center min-w-[90px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          [1, 2, 3, 4].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={7} className="h-16 bg-stone-50/50" /></TableRow>)
                        ) : groupedProducts.length === 0 ? (
                          <TableRow><TableCell colSpan={7} className="text-center p-20 text-stone-400 font-bold">No inventory records found.</TableCell></TableRow>
                        ) : groupedProducts.map((p) => (
                          <TableRow key={p.id} className="border-stone-50 hover:bg-stone-50/30 transition-colors">
                            <TableCell className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                                  {p.imageUrls && p.imageUrls.filter(u => u && u.trim() !== '').length > 0 ? (
                                    <img src={getMediaUrl(p.imageUrls.filter(u => u && u.trim() !== '')[0])} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-bold">IMG</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-indigo-900 text-sm truncate max-w-[200px]">{p.name}</p>
                                  <p className="text-stone-400 text-xs font-medium truncate max-w-[200px]">{p.brand || '—'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-4">
                              <Badge variant="outline" className="rounded-lg font-semibold text-[10px] uppercase tracking-wider border-stone-200 text-stone-500 bg-stone-50">{p.category?.name || '—'}</Badge>
                            </TableCell>
                            <TableCell className="p-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                {(() => {
                                  let vendorsList = Object.values(p.bundledVendors?.reduce((acc, bv) => {
                                     const vId = bv.vendorId || bv.vendor?.id || 'unknown';
                                     if (!acc[vId]) acc[vId] = { ...bv };
                                     else acc[vId].stock += bv.stock;
                                     return acc;
                                  }, {}) || {});

                                  if (vendorsList.length === 0) return <Badge variant="outline" className="rounded-lg text-[10px] text-stone-400">None</Badge>;
                                  
                                  if (vendorsList.length === 1) {
                                    const bv = vendorsList[0];
                                    return (
                                      <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200/80 rounded-lg px-2.5 py-1 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                        <span className="text-[10px] font-black tracking-wide text-indigo-950/80 truncate max-w-[90px]">{bv.vendor?.businessName || 'Unknown'}</span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="flex items-center gap-1.5 bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors border border-indigo-200/60 rounded-lg px-2.5 py-1">
                                      <span className="text-[10px] font-black tracking-wide text-indigo-900 truncate max-w-[90px]">{vendorsList.length} Vendors</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell className="p-4 text-right font-black text-indigo-950">&#8377;{Number(p.price).toLocaleString('en-IN')}</TableCell>
                            <TableCell className="p-4 text-right font-medium">
                              <span className={cn(p.stock < 10 ? "text-red-500 font-bold" : "text-stone-600")}>{p.stock} units</span>
                            </TableCell>
                            <TableCell className="p-4 text-center">
                              <Badge className={cn("rounded-lg font-bold px-3 border-none text-[10px]", p.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400")}>{p.status}</Badge>
                            </TableCell>
                            <TableCell className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleEditProduct(p); }} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); 
                                  // Delete all variants in the bundle
                                  p.bundledVendors.forEach(bv => handleDeleteProduct(bv.id)); 
                                }} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'orders' && (
              <div className="space-y-8 animate-in fade-in">
                <header>
                  <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Order Transmissions</h1>
                  <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>Monitoring real-time transaction flow and manual records.</p>
                </header>

                <Tabs defaultValue="online" className="space-y-8">
                  <div className="flex items-center justify-between">
                    <TabsList className="bg-stone-50 p-1.5 rounded-[1.25rem] border border-stone-100 gap-2 h-auto">
                      <TabsTrigger value="online" className="rounded-xl px-12 h-10 data-[state=active]:bg-indigo-950 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">Online</TabsTrigger>
                      <TabsTrigger value="offline" className="rounded-xl px-12 h-10 data-[state=active]:bg-indigo-950 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">Offline</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="online" className="animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-stone-50">
                          <TableRow className="border-stone-100/50 py-4 hover:bg-transparent">
                            <TableHead className="p-6">Transaction Ref</TableHead>
                            <TableHead className="p-6">Customer Terminal</TableHead>
                            <TableHead className="p-6">Merchant Origin</TableHead>
                            <TableHead className="p-6 text-right">Settlement</TableHead>
                            <TableHead className="p-6 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={5} className="h-20 bg-stone-50/50" /></TableRow>)
                          ) : orders.filter(o => o.type === 'Online').length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-20 text-stone-400 font-bold italic">No active digital transmissions found.</TableCell></TableRow>
                          ) : orders.filter(o => o.type === 'Online').map((o) => (
                            <TableRow
                              key={o.id}
                              onClick={() => fetchOrderDetail(o.id, 'Online')}
                              className="border-stone-50 hover:bg-stone-100/50 transition-all duration-300 cursor-pointer group"
                            >
                              <TableCell className="p-6">
                                <span className="text-sm font-black text-indigo-950 tracking-tighter uppercase group-hover:text-amber-600 transition-colors">{o.orderNumber}</span>
                              </TableCell>
                              <TableCell className="p-6 font-bold text-indigo-900">{o.customerName}</TableCell>
                              <TableCell className="p-6 font-medium text-stone-500">{o.vendorName}</TableCell>
                              <TableCell className="p-6 text-right font-black text-indigo-950 text-lg">&#8377;{parseFloat(o.totalAmount).toLocaleString()}</TableCell>
                              <TableCell className="p-6 text-center">
                                <Badge variant="outline" className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-stone-200",
                                  o.status === 'DELIVERED' || o.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                )}>
                                  {o.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>

                  <TabsContent value="offline" className="animate-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-stone-50">
                          <TableRow className="border-stone-100/50 py-4 hover:bg-transparent">
                            <TableHead className="p-6">Entry Ref</TableHead>
                            <TableHead className="p-6">Merchant Authority</TableHead>
                            <TableHead className="p-6">Customer ID</TableHead>
                            <TableHead className="p-6 text-right">Value</TableHead>
                            <TableHead className="p-6 text-center">Registry Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={5} className="h-20 bg-stone-50/50" /></TableRow>)
                          ) : orders.filter(o => o.type === 'Offline').length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-24 text-stone-400 font-bold italic opacity-40">No manual records found in this cycle.</TableCell></TableRow>
                          ) : orders.filter(o => o.type === 'Offline').map((o) => (
                            <TableRow
                              key={o.id}
                              onClick={() => fetchOrderDetail(o.id, 'Offline')}
                              className="border-stone-50 hover:bg-stone-100/50 transition-all duration-300 cursor-pointer group"
                            >
                              <TableCell className="p-6">
                                <Badge className="bg-indigo-950 group-hover:bg-amber-600 text-stone-100 text-[8px] font-black uppercase tracking-widest rounded px-2 transition-colors">{o.orderNumber}</Badge>
                              </TableCell>
                              <TableCell className="p-6 font-black text-indigo-950">{o.vendorName}</TableCell>
                              <TableCell className="p-6 font-bold text-stone-500">{o.customerName}</TableCell>
                              <TableCell className="p-6 text-right font-black text-indigo-950 text-lg">&#8377;{parseFloat(o.totalAmount).toLocaleString()}</TableCell>
                              <TableCell className="p-6 text-center">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">ARCHIVED</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeView === 'vendors' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <header className="flex items-center justify-between gap-6 mb-12">
                  <div className="flex flex-col">
                    <h1 className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Registered Vendors</h1>
                    <p className={`${THEME.typography.micro.muted}`}>Vendor lifecycle and compliance management.</p>
                  </div>
                  <Button onClick={() => setIsAddVendorOpen(true)} className="rounded-2xl h-14 px-8 shadow-2xl shadow-indigo-950/40 hover:bg-[#1a0b2e] font-black uppercase tracking-widest text-[10px] bg-indigo-950 text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                    <UserPlus className="h-4 w-4" /> Add Direct Vendor
                  </Button>
                </header>



                <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-stone-50">
                      <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                        <TableHead className="p-6">Vendor Identity</TableHead>
                        <TableHead className="p-6">Market Sector</TableHead>
                        <TableHead className="p-6">Contact Authority</TableHead>
                        <TableHead className="p-6 text-center">Compliance Status</TableHead>
                        <TableHead className="p-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [1, 2].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={5} className="h-16 bg-stone-50/50" /></TableRow>)
                      ) : vendors.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-20 text-stone-400 font-bold">No vendors found.</TableCell></TableRow>
                      ) : vendors.map((v) => (
                        <TableRow key={v.id} className="border-stone-50 hover:bg-stone-50/30">
                          <TableCell className="p-6 font-bold text-indigo-900">{v.businessName}</TableCell>
                          <TableCell className="p-6 font-medium text-stone-500 italic">{v.businessCategory}</TableCell>
                          <TableCell className="p-6 text-stone-500 font-medium">
                            <div className="flex flex-col">
                              <span>{v.contactNumber}</span>
                              <span className="text-[10px]">{v.email || 'No Email'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 text-center">
                            <Badge className={cn(
                              "rounded-full font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none shadow-sm flex items-center gap-2 w-fit mx-auto",
                              v.approvalStatus === 'APPROVED' ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20" :
                                v.approvalStatus === 'PENDING' ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" :
                                  "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20"
                            )}>
                              <span className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                v.approvalStatus === 'APPROVED' ? "bg-emerald-500" :
                                  v.approvalStatus === 'PENDING' ? "bg-amber-500" :
                                    "bg-rose-500"
                              )} />
                              {v.approvalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              {v.approvalStatus === 'PENDING' && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg"
                                  onClick={async () => {
                                    await fetch(`${API_URL}/admin/vendors/${v.id}/approve`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'APPROVED' })
                                    });
                                    fetchDataForView('vendors');
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px] rounded-xl font-bold bg-white text-xs">
                                  <DropdownMenuItem onClick={() => fetchVendorDetail(v.id)} className="cursor-pointer py-2 px-3 gap-2">
                                    <Eye className="h-4 w-4" /> View Data
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeView === 'vendor-analytics' && (
              <div className="space-y-12 animate-in fade-in">
                <header>
                  <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Vendor Analytics</h1>
                  <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>Cross-sector sales performance and revenue intelligence.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-stone-100/50 group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShoppingCart className="h-7 w-7" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">+14.2%</Badge>
                    </div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-2">Total Sale Units</p>
                    <h2 className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>8.4K</h2>
                    <p className="text-xs font-medium text-stone-400 mt-4 leading-relaxed tracking-tight">Consolidated volume across all verified partner nodes.</p>
                  </div>

                  <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-stone-100/50 group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="h-7 w-7" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">+8.7%</Badge>
                    </div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-2">Gross Revenue</p>
                    <h2 className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>&#8377;52.8L</h2>
                    <p className="text-xs font-medium text-stone-400 mt-4 leading-relaxed tracking-tight">Total market value processed through secure enterprise channels.</p>
                  </div>

                  <div className="p-10 bg-indigo-950 rounded-[2.5rem] shadow-2xl shadow-indigo-950/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 blur-2xl bg-emerald-500 rounded-full -mr-8 -mt-8" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center">
                          <TrendingUp className="h-7 w-7" />
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">PEAK</Badge>
                      </div>
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-2">Platform Earnings</p>
                      <h2 className="text-5xl font-black text-white tracking-tighter leading-none">&#8377;14.2L</h2>
                      <p className="text-xs font-medium text-stone-500 mt-4 leading-relaxed tracking-tight">Net marketplace yield after partner settlement protocol.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <Card className="col-span-8 p-12 rounded-[3rem] border-none shadow-sm bg-white overflow-hidden relative">
                    <div className="flex items-center justify-between mb-12">
                      <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] flex items-center gap-4">
                        <span className="h-px w-8 bg-indigo-950" />
                        Revenue Distribution
                      </h3>
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-950" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <div className="h-64 flex items-end gap-6">
                      {[45, 75, 55, 90, 65, 80, 50, 70, 85, 60, 95, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-stone-50 rounded-2xl relative group cursor-pointer">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-stone-100 rounded-3xl transition-all duration-700 group-hover:bg-emerald-500/20"
                            style={{ height: `${h}%` }}
                          />
                          <div
                            className="absolute bottom-0 left-2 right-2 bg-indigo-950 rounded-t-lg transition-all duration-1000 delay-100 ease-out group-hover:bg-emerald-500"
                            style={{ height: `${h * 0.7}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8 px-2">
                      {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                        <span key={m} className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{m}</span>
                      ))}
                    </div>
                  </Card>

                  <Card className="col-span-4 p-12 rounded-[3rem] border-none shadow-sm bg-stone-50 relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 p-16 opacity-[0.02] -mr-8 -mb-8">
                      <Activity className="h-40 w-40" />
                    </div>
                    <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] mb-10">Sector performance</h3>
                    <div className="space-y-8">
                      {[
                        { label: 'E-Commerce', val: '&#8377;22.4L', p: 85 },
                        { label: 'Cloud Services', val: '&#8377;14.8L', p: 65 },
                        { label: 'Logistics', val: '&#8377;8.9L', p: 45 },
                        { label: 'Procurement', val: '&#8377;6.7L', p: 35 }
                      ].map(s => (
                        <div key={s.label} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-indigo-950 tracking-tight">{s.label}</span>
                            <span className="text-[11px] font-black text-indigo-950 tracking-tighter">{s.val}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-950 rounded-full group-hover:bg-emerald-500 transition-all duration-700" style={{ width: `${s.p}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeView === 'customers' && (
              <div className="space-y-8 animate-in fade-in">
                <header>
                  <h1 className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}>Registered Customers</h1>
                  <p className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}>User base demographics and loyalty insights.</p>
                </header>

                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-stone-50">
                      <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                        <TableHead className="p-6">User Profile</TableHead>
                        <TableHead className="p-6">Contact Access</TableHead>
                        <TableHead className="p-6 text-right">Reward Balance</TableHead>
                        <TableHead className="p-6 text-right">Acquisition Date</TableHead>
                        <TableHead className="p-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={5} className="h-16 bg-stone-50/50" /></TableRow>)
                      ) : customers.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-20 text-stone-400 font-bold">No customers found.</TableCell></TableRow>
                      ) : customers.map((c) => (
                        <TableRow key={c.id} className="border-stone-50 hover:bg-stone-50/30">
                          <TableCell className="p-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-stone-100 text-stone-600 font-bold">{c.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className={`${THEME.typography.weights.medium} ${THEME.colors.text.primary}`}>{c.name}</span>
                                <span className={THEME.typography.micro.muted}>{c.id.slice(-8)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 font-medium text-stone-500">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-stone-400" />
                                <span className="text-xs">{c.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-stone-400" />
                                <span className="text-xs">{c.mobile}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-6 text-right">
                            <Badge variant="outline" className="rounded-lg font-black text-purple-900 bg-stone-50 border-stone-100">
                              {c.rewardPoints} points
                            </Badge>
                          </TableCell>
                          <TableCell className="p-6 text-right text-stone-400 text-sm font-medium">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px] rounded-xl font-bold bg-white text-xs">
                                  <DropdownMenuItem onClick={() => fetchCustomerDetail(c.id)} className="cursor-pointer py-2 px-3 gap-2">
                                    <Eye className="h-4 w-4" /> View Profile
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {/* Add Product Full Page */}
            {activeView === 'add-product' && (() => {
              const currentSnapshot = JSON.stringify({ prod: newProduct, ben: productBenefits, faq: productFaq });
              const hasChanges = !initialProductState || currentSnapshot !== initialProductState || imageFiles.primary !== null || imageFiles.additional.length > 0;
              return (
              <div className="animate-in fade-in">
                <form onSubmit={handleAddProduct}>
                  <div className="grid grid-cols-12 gap-10">

                    {/* Left Column */}
                    <div className="col-span-8 space-y-8">

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                        <h2 className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}>Product Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Product Name</Label>
                            <Input required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="e.g., Hydra Barrier Serum" />
                          </div>
                          <div className="space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Brand</Label>
                            <Input required value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="e.g., LUMIÈRE SEOUL" />
                          </div>
                          <div className="space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Category</Label>
                            <Input required value={newProduct.categoryName} onChange={e => setNewProduct({ ...newProduct, categoryName: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="e.g., Skincare" />
                          </div>
                          <div className="col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                               <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Vendors & Stock</Label>
                               <button type="button" onClick={() => setNewProduct({...newProduct, vendors: [...newProduct.vendors, {vendorId: '', stock: ''}]})} className="h-8 px-4 text-[10px] uppercase font-black tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-all flex items-center gap-1.5"><Plus className="h-3 w-3" /> Add Vendor</button>
                            </div>
                            <div className="space-y-3">
                              {newProduct.vendors.map((v, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-[1.25rem] border border-stone-200 shadow-sm">
                                  <div className="relative flex-1">
                                      <select required className="w-full h-12 rounded-xl bg-transparent px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-950 appearance-none transition-all" value={v.vendorId} onChange={e => {
                                        const newVs = [...newProduct.vendors];
                                        newVs[idx] = { ...newVs[idx], vendorId: e.target.value };
                                        setNewProduct({...newProduct, vendors: newVs});
                                      }}>
                                        <option value="" disabled>Select a vendor...</option>
                                        {vendors.map(vnd => {
                                          const isSelectedElsewhere = newProduct.vendors.some((otherV, otherIdx) => otherIdx !== idx && otherV.vendorId === vnd.id);
                                          return (
                                            <option key={vnd.id} value={vnd.id} disabled={isSelectedElsewhere}>
                                              {vnd.businessName} {isSelectedElsewhere ? '— Already Selected' : ''}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
                                    </div>
                                    <div className="w-[140px] relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-stone-300 pointer-events-none">QTY</span>
                                      <Input type="number" required value={v.stock} onChange={e => {
                                        const newVs = [...newProduct.vendors];
                                        newVs[idx] = { ...newVs[idx], stock: e.target.value };
                                        setNewProduct({...newProduct, vendors: newVs});
                                      }} className="rounded-xl h-12 border-0 bg-white shadow-sm font-black text-indigo-950 pl-12 pr-4" placeholder="0" />
                                  </div>
                                  {newProduct.vendors.length > 1 && idx !== 0 && (
                                    <button type="button" onClick={() => {
                                      const newVs = [...newProduct.vendors];
                                      newVs.splice(idx, 1);
                                      setNewProduct({...newProduct, vendors: newVs});
                                    }} className="w-12 h-12 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Product Tags</Label>
                            <Input value={newProduct.tags} onChange={e => setNewProduct({ ...newProduct, tags: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="Hydrating, Korea, Glow" />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Product Description</Label>
                            <textarea required value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all" placeholder="Enter product details..." />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                        <h2 className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}>Product Content</h2>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Ingredients</Label>
                            <textarea value={newProduct.ingredients} onChange={e => setNewProduct({ ...newProduct, ingredients: e.target.value })} className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all" placeholder="Water, Glycerin, Niacinamide (5%)..." />
                          </div>
                          <div className="space-y-2">
                            <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Why We Love It</Label>
                            <textarea value={newProduct.whyWeLoveIt} onChange={e => setNewProduct({ ...newProduct, whyWeLoveIt: e.target.value })} className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all" placeholder="e.g., Instantly plumps skin by +45%..." />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                          <h2 className={THEME.typography.micro.muted}>Key Benefits</h2>
                          <button type="button" onClick={() => setProductBenefits([...productBenefits, { icon: '✨', text: '' }])} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                            <Plus className="h-3 w-3" /> Add Benefit
                          </button>
                        </div>
                        <div className="space-y-3">
                          {productBenefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <select
                                value={benefit.icon}
                                onChange={e => { const u = [...productBenefits]; u[idx].icon = e.target.value; setProductBenefits(u); }}
                                className="appearance-none rounded-[1rem] h-12 border border-stone-200 bg-stone-50 font-bold w-16 text-center text-lg cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-950"
                              >
                                {['✨', '💧', '🌿', '🛡️', '☀️', '🌸', '⚡', '🧪', '💖', '🥇', '🍓', '🥑'].map(emoji => (
                                  <option key={emoji} value={emoji}>{emoji}</option>
                                ))}
                              </select>
                              <Input value={benefit.text} onChange={e => { const u = [...productBenefits]; u[idx].text = e.target.value; setProductBenefits(u); }} className="rounded-[1rem] h-12 border-stone-200 bg-stone-50 font-bold px-5 flex-1" placeholder="e.g., 72h Hydration" />
                              {productBenefits.length > 1 && (
                                <button type="button" onClick={() => setProductBenefits(productBenefits.filter((_, i) => i !== idx))} className="h-12 w-12 flex items-center justify-center rounded-2xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 border border-stone-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                          <h2 className={THEME.typography.micro.muted}>FAQ</h2>
                          <button type="button" onClick={() => setProductFaq([...productFaq, { q: '', a: '' }])} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                            <Plus className="h-3 w-3" /> Add Question
                          </button>
                        </div>
                        <div className="space-y-4">
                          {productFaq.map((faqItem, idx) => (
                            <div key={idx} className="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 space-y-3 relative group">
                              <Input value={faqItem.q} onChange={e => { const u = [...productFaq]; u[idx].q = e.target.value; setProductFaq(u); }} className="rounded-[1rem] h-12 border-stone-200 bg-white font-bold px-5" placeholder="e.g., Is it suitable for sensitive skin?" />
                              <textarea value={faqItem.a} onChange={e => { const u = [...productFaq]; u[idx].a = e.target.value; setProductFaq(u); }} className="flex min-h-[72px] w-full rounded-[1rem] border border-stone-200 bg-white px-5 py-3 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all" placeholder="Answer..." />
                              {productFaq.length > 1 && (
                                <button type="button" onClick={() => setProductFaq(productFaq.filter((_, i) => i !== idx))} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Column */}
                    <div className="col-span-4 space-y-8">

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-5">
                        <h2 className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}>Product Media</h2>
                        <div className="space-y-2">
                          <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Primary Image <span className="text-rose-500">*</span></Label>
                          <div onClick={() => document.getElementById('primaryImageFP').click()} className="relative h-52 rounded-[1.5rem] border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center cursor-pointer group hover:bg-white hover:border-emerald-500/30 transition-all overflow-hidden">
                            {imageFiles.primary ? (
                              <>
                                <img src={URL.createObjectURL(imageFiles.primary)} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Pending</span>
                                </div>
                              </>
                            ) : newProduct.existingImages && newProduct.existingImages.length > 0 ? (
                              <>
                                <img src={getMediaUrl(newProduct.existingImages[0])} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-2 items-center justify-center transition-opacity">
                                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-indigo-950/80 px-3 py-1 rounded-full">Overwrite Image</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <Camera className="h-8 w-8 text-stone-300 mb-3 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Upload Image</p>
                                <p className="text-[8px] text-stone-300 mt-1 font-medium">Click to browse</p>
                              </>
                            )}
                            <input id="primaryImageFP" type="file" className="hidden" accept="image/*" onChange={e => setImageFiles({ ...imageFiles, primary: e.target.files[0] })} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer" onClick={() => setHasMultipleImages(!hasMultipleImages)}>
                            <div className={cn("h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all", hasMultipleImages || (newProduct.existingImages && newProduct.existingImages.length > 1) ? "bg-indigo-950 border-indigo-950" : "bg-white border-stone-200")}>
                              {(hasMultipleImages || (newProduct.existingImages && newProduct.existingImages.length > 1)) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-950">Include Multiple Images</span>
                          </div>
                          {(hasMultipleImages || (newProduct.existingImages && newProduct.existingImages.length > 1)) && (
                            <div className="grid grid-cols-3 gap-3 animate-in fade-in">
                              {/* Display existing supplementary images */}
                              {newProduct.existingImages && newProduct.existingImages.slice(1).map((url, idx) => (
                                <div key={`exist-${idx}`} className="aspect-square rounded-xl overflow-hidden relative group border border-stone-100 hover:border-indigo-400 transition-all">
                                  <img src={getMediaUrl(url)} className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 bg-[#1a0b2e]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                     <span className="text-white text-[8px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-1 rounded-sm">Existing</span>
                                  </div>
                                </div>
                              ))}
                              {imageFiles.additional.map((file, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-stone-100">
                                  <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" />
                                  <button type="button" onClick={e => { e.stopPropagation(); const f = [...imageFiles.additional]; f.splice(idx, 1); setImageFiles({ ...imageFiles, additional: f }); }} className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              ))}
                              {imageFiles.additional.length + (newProduct.existingImages ? newProduct.existingImages.slice(1).length : 0) < 9 && (
                                <button type="button" onClick={() => document.getElementById('additionalImagesFP').click()} className="aspect-square rounded-xl border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center hover:bg-white hover:border-emerald-500/30 transition-all group">
                                  <Plus className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                                </button>
                              )}
                            <input id="additionalImagesFP" type="file" multiple className="hidden" accept="image/*" onChange={e => { const files = Array.from(e.target.files); setImageFiles({ ...imageFiles, additional: [...imageFiles.additional, ...files] }); }} />
                          </div>
                        )}
                        </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-5">
                        <h2 className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}>Pricing</h2>
                        <div className="space-y-2">
                          <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Base Price (&#8377;)</Label>
                          <Input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                          <Label className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}>Discount Price (&#8377;)</Label>
                          <Input type="number" value={newProduct.discountPrice || ''} onChange={e => setNewProduct({ ...newProduct, discountPrice: e.target.value })} className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6" placeholder="Optional" />
                        </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-5">
                        <h2 className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}>Visibility Settings</h2>
                        <div className="space-y-3">
                          {[
                            { id: 'featured', label: 'Feature on Homepage', sub: 'High-visibility placement.' },
                            { id: 'rewardEligible', label: 'Enable Reward Points', sub: 'Incentivize via loyalty.' },
                            { id: 'limitedOffer', label: 'Set as Limited Offer', sub: 'Urgency-driven placement.' }
                          ].map(flag => (
                            <div key={flag.id} onClick={() => setNewProduct({ ...newProduct, [flag.id]: !newProduct[flag.id] })} className={cn("p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between", newProduct[flag.id] ? "bg-indigo-950 border-indigo-950 text-white" : "bg-stone-50 border-stone-100 text-indigo-950 hover:border-stone-300")}>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">{flag.label}</p>
                                <p className="text-[8px] font-bold mt-1.5 uppercase tracking-tighter text-stone-400">{flag.sub}</p>
                              </div>
                              <div className={cn("h-5 w-5 rounded-full flex items-center justify-center transition-all", newProduct[flag.id] ? "bg-emerald-500" : "bg-stone-200")}>
                                {newProduct[flag.id] && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" onClick={() => navigate('/admin/inventory')} variant="outline" className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px] border-stone-200 hover:bg-stone-50">Cancel</Button>
                        <Button type="submit" disabled={loading || !hasChanges} className="flex-1 bg-indigo-950 text-white disabled:opacity-50 disabled:bg-stone-400 rounded-xl h-14 font-black uppercase tracking-widest text-[10px] hover:bg-[#1a0b2e] shadow-xl shadow-indigo-950/30 transition-all">
                          {loading ? 'Saving...' : editingProductId ? 'Save Changes' : 'Add Product'}
                        </Button>
                      </div>

                    </div>
                  </div>
                </form>
              </div>
              );
            })()}

          </main>
        </div>
      </div>

      {/* Premium Wide Customer Dossier */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className={`sm:max-w-[1400px] w-[95vw] p-0 overflow-hidden border-none ${THEME.shadows.xl} ${THEME.colors.background.secondary}/50 backdrop-blur-xl ring-1 ring-indigo-900/5 ${THEME.borders.radius.xl}`}>
          <div className="sr-only">
            <DialogTitle>Customer Profile: {selectedUser?.name}</DialogTitle>
            <DialogDescription>Detailed customer profile information including rewards, orders, and addresses.</DialogDescription>
          </div>
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md">
              <div className="flex flex-col items-center gap-6">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-stone-100 border-t-indigo-950 shadow-xl" />
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em]">Accessing Intel</p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Decrypting User Node...</p>
                </div>
              </div>
            </div>
          ) : selectedUser && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Glass-Noir Header */}
              <header className={`p-10 ${THEME.colors.background.accentSolid} text-white flex items-center justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10`}>
                <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-emerald-500 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 flex items-center gap-8">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-indigo-900 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black tracking-[calc(-0.05em)] leading-tight">{selectedUser.name}</h2>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-2 py-0 text-[8px] uppercase tracking-widest">Verified Tier 1</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-stone-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-900" />
                        Protocol: {selectedUser.id}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-purple-900">
                        Access: Global-Admin
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <Button variant="outline" className="h-11 rounded-xl border-purple-900 text-white hover:bg-white hover:text-indigo-950 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300">Export Dossier</Button>
                  <Button onClick={() => setIsDetailOpen(false)} variant="ghost" className="h-11 w-11 text-stone-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              <ScrollArea className="flex-1 bg-white/40 backdrop-blur-sm">
                <div className="p-10 space-y-12">
                  {/* Top Line Analytics Grid */}
                  <div className="grid grid-cols-3 gap-8">
                    <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-500/10 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Transaction Credits</p>
                        <CreditCard className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>{selectedUser.rewardPoints.toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-4 uppercase tracking-wide">Ready for Settlement</p>
                      <div className="absolute bottom-0 right-0 h-1.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                    </div>
                    <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Activity Events</p>
                        <ShoppingCart className="h-5 w-5 text-stone-300 group-hover:text-indigo-950 transition-colors" />
                      </div>
                      <p className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>{selectedUser.orders?.length || 0}</p>
                      <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">Confirmed Shipments</p>
                    </div>
                    <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Node Creation</p>
                        <Calendar className="h-5 w-5 text-stone-300 group-hover:text-indigo-950 transition-colors" />
                      </div>
                      <p className="text-3xl font-black text-indigo-950 tracking-tighter leading-none mt-2">
                        {new Date(selectedUser.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                      </p>
                      <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">Active Since Epoch</p>
                    </div>
                  </div>

                  {/* Main Split Interface */}
                  <div className="grid grid-cols-12 gap-12 pt-4">
                    {/* Left Intelligence Sidebar */}
                    <div className="col-span-4 space-y-12 border-r border-stone-100 pr-12">
                      <section>
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Identity Access
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg hover:border-emerald-500/10 transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors"><Mail className="h-5 w-5" /></div>
                            <div className="overflow-hidden space-y-0.5">
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Primary Endpoint</p>
                              <p className="text-sm font-bold text-indigo-950 truncate leading-tight">{selectedUser.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg hover:border-emerald-500/10 transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors"><Phone className="h-5 w-5" /></div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Mobile Terminal</p>
                              <p className="text-sm font-bold text-indigo-950 leading-tight">{selectedUser.mobile}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Logistics Ledger
                        </h3>
                        <div className="space-y-4">
                          {selectedUser.addresses?.slice(0, 2).map((addr) => (
                            <div key={addr.id} className="p-6 rounded-2xl border border-stone-100 bg-white shadow-sm group hover:border-emerald-500/20 hover:shadow-xl transition-all duration-300">
                              <div className="flex justify-between items-start mb-4">
                                <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-[0.15em] bg-stone-100 text-stone-500 border-none px-2 py-0.5">{addr.label || 'Home'}</Badge>
                                <MapPin className="h-4 w-4 text-stone-200 group-hover:text-emerald-500 transition-colors" />
                              </div>
                              <p className="text-sm font-black text-indigo-950 leading-tight italic">"{addr.line1}"</p>
                              <p className="text-[11px] font-medium text-stone-400 mt-2 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-stone-200" />
                                {addr.city.toUpperCase()}, {addr.state.toUpperCase()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Right Transmission Table */}
                    <div className="col-span-8">
                      <header className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Transmission Registry
                        </h3>
                        <span className="text-[9px] font-black text-emerald-600 px-4 py-1.5 bg-emerald-50 rounded-full flex items-center gap-2 border border-emerald-100">
                          <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {selectedUser.orders?.length || 0} EVENTS SYNCED
                        </span>
                      </header>

                      <div className="overflow-hidden rounded-3xl border border-stone-100 shadow-xl bg-white">
                        <Table>
                          <TableHeader className="bg-stone-50/50">
                            <TableRow className="border-stone-100 hover:bg-transparent h-14">
                              <TableHead className="px-8">Order ID</TableHead>
                              <TableHead className="px-8">Timestamp</TableHead>
                              <TableHead className="px-8">Resolution</TableHead>
                              <TableHead className="px-8 text-right">Credit Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.orders?.length > 0 ? (
                              selectedUser.orders.map((order) => (
                                <TableRow key={order.orderNumber} className="border-stone-50 h-[4.5rem] hover:bg-stone-50/20 transition-all group">
                                  <TableCell className="px-8">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black text-indigo-950 tracking-tighter group-hover:text-emerald-600 transition-colors">#{order.orderNumber}</span>
                                      <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">Master-Chain-UID</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 text-xs font-bold text-stone-400">
                                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                  </TableCell>
                                  <TableCell className="px-8">
                                    <Badge className={cn(
                                      "rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none shadow-sm transition-all",
                                      order.status === 'DELIVERED'
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-indigo-950 text-white shadow-indigo-950/20"
                                    )}>
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="px-8 text-right">
                                    <span className="text-lg font-black text-indigo-950 tracking-tighter">&#8377;{parseFloat(order.totalAmount).toLocaleString()}</span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow><TableCell colSpan={4} className="h-56 text-center text-stone-300 text-[11px] font-black uppercase tracking-[0.4em]">Sector Archive Empty</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <footer className="p-6 bg-stone-50 border-t border-stone-100 flex justify-between items-center shrink-0">
                <div className="flex gap-3">
                  <Badge variant="outline" className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-lg px-3 py-1 uppercase tracking-widest">End-to-End Encrypted Dossier</Badge>
                </div>
                <Button onClick={() => setIsDetailOpen(false)} className="bg-indigo-950 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-indigo-950/40">Close Session</Button>
              </footer>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Wide Vendor Dossier */}
      <Dialog open={isVendorDetailOpen} onOpenChange={setIsVendorDetailOpen}>
        <DialogContent className={`sm:max-w-[1400px] w-[95vw] p-0 overflow-hidden border-none ${THEME.shadows.xl} ${THEME.colors.background.secondary}/50 backdrop-blur-xl ring-1 ring-indigo-900/5 ${THEME.borders.radius.xl}`}>
          <div className="sr-only">
            <DialogTitle>Vendor Dossier: {selectedVendor?.businessName}</DialogTitle>
            <DialogDescription>Performance analytics, inventory status, and order registry for registered partners.</DialogDescription>
          </div>
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md">
              <div className="flex flex-col items-center gap-6">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-stone-100 border-t-indigo-950 shadow-xl" />
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em]">Syncing Partner Node</p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Accessing Ledger...</p>
                </div>
              </div>
            </div>
          ) : selectedVendor && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Glass-Noir Header */}
              <header className={`p-10 ${THEME.colors.background.accentSolid} text-white flex items-center justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10`}>
                <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-blue-500 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 flex items-center gap-8">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">{selectedVendor.businessName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-indigo-900 flex items-center justify-center",
                      selectedVendor.approvalStatus === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
                    )}>
                      <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black tracking-[calc(-0.05em)] leading-tight">{selectedVendor.businessName}</h2>
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black px-2 py-0 text-[8px] uppercase tracking-widest">{selectedVendor.businessCategory}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-stone-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-900" />
                        Protocol: VND-{selectedVendor.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-purple-900">
                        Authority: {selectedVendor.contactNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <Button variant="outline" className="h-11 rounded-xl border-purple-900 text-white hover:bg-white hover:text-indigo-950 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300">Audit Partner</Button>
                  <Button onClick={() => setIsVendorDetailOpen(false)} variant="ghost" className="h-11 w-11 text-stone-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              <ScrollArea className="flex-1 bg-white/40 backdrop-blur-sm">
                <div className="p-10 space-y-12">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-500/10 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Gross Revenue</p>
                        <DollarSign className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>&#8377;{selectedVendor.totalRevenue?.toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-4 uppercase tracking-wide">Market Sales Yield</p>
                      <div className="absolute bottom-0 right-0 h-1.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                    </div>
                    <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-blue-900/10 transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Inventory Nodes</p>
                        <Package className="h-5 w-5 text-stone-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className={`text-5xl font-['Playfair_Display'] ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}>{selectedVendor.products?.length || 0}</p>
                      <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">Live Catalog Items</p>
                    </div>
                    <div className="p-8 bg-indigo-950 rounded-[2.5rem] shadow-2xl shadow-indigo-950/20 text-white relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Sales Events</p>
                        <ShoppingCart className="h-5 w-5 text-stone-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-5xl font-black text-white tracking-tighter leading-none">{selectedVendor.orders?.length || 0}</p>
                      <p className="text-[11px] font-bold text-emerald-400 mt-4 uppercase tracking-wide">Orders Processed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-12 pt-4">
                    <div className="col-span-4 space-y-12 border-r border-stone-100 pr-12">
                      <section>
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Merchant Intelligence
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-blue-500 transition-colors"><Mail className="h-5 w-5" /></div>
                            <div className="overflow-hidden space-y-0.5">
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Administrative Contact</p>
                              <p className="text-sm font-bold text-indigo-950 truncate leading-tight">{selectedVendor.email || 'No Email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors"><Phone className="h-5 w-5" /></div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">Emergency Terminal</p>
                              <p className="text-sm font-bold text-indigo-950 leading-tight">{selectedVendor.contactNumber}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Live Inventory
                        </h3>
                        <div className="space-y-4">
                          {selectedVendor.products?.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-stone-50 text-[10px] font-black">{p.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-bold text-indigo-950 truncate tracking-tight">{p.name}</p>
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">&#8377;{parseFloat(p.price).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="col-span-8">
                      <header className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
                        <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.4em] flex items-center gap-4">
                          <span className="h-px w-8 bg-indigo-950" />
                          Sales Transmission Registry
                        </h3>
                        <span className="text-[9px] font-black text-emerald-600 px-4 py-1.5 bg-emerald-50 rounded-full flex items-center gap-2 border border-emerald-100">
                          <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {selectedVendor.orders?.length || 0} SALES EVENT SYNCED
                        </span>
                      </header>

                      <Table>
                        <TableHeader>
                          <TableRow className="border-stone-50 hover:bg-transparent">
                            <TableHead >Order ID</TableHead>
                            <TableHead >Customer</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-center">Protocol Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedVendor.orders?.length > 0 ? selectedVendor.orders.map((order) => (
                            <TableRow key={order.orderNumber} className="border-stone-50/50 hover:bg-stone-50/50 transition-colors">
                              <TableCell className="font-bold text-xs text-indigo-950">{order.orderNumber}</TableCell>
                              <TableCell className="text-xs text-stone-500 font-medium">{order.customer.name}</TableCell>
                              <TableCell className="text-right font-black text-xs text-indigo-950">&#8377;{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-stone-100 text-[8px] font-black uppercase tracking-tighter px-2 border-none">{order.status}</Badge>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={4} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2 opacity-20">
                                  <History className="h-8 w-8 text-stone-400" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Sector Archive Empty</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <footer className="p-6 bg-stone-50 border-t border-stone-100 flex justify-between items-center shrink-0">
                <div className="flex gap-3">
                  <Badge variant="outline" className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-lg px-3 py-1 uppercase tracking-widest">Secure Merchant Node: Audit Link Active</Badge>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setIsVendorDetailOpen(false)} variant="outline" className="font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-8 h-12 border-stone-200">De-Authorize</Button>
                  <Button onClick={() => setIsVendorDetailOpen(false)} className="bg-indigo-950 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-indigo-950/40">Secure Session</Button>
                </div>
              </footer>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Offline Sale Registry */}
      <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] blur-2xl bg-emerald-500 rounded-full -mr-8 -mt-8" />
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-indigo-950 tracking-tighter uppercase">Record Manual Transmission</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">Capture over-the-counter sales data for partner synchronization.</DialogDescription>
          </DialogHeader>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = {
              vendorId: formData.get('vendorId'),
              mobile: formData.get('mobile'),
              amount: parseFloat(formData.get('amount')),
              items: [{
                name: formData.get('itemName'),
                quantity: parseInt(formData.get('quantity')),
                unitPrice: parseFloat(formData.get('unitPrice'))
              }]
            };
            try {
              const resp = await fetch(`${API_URL}/admin/offline-ledgers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (resp.ok) {
                setIsManualOrderOpen(false);
                fetchOfflineLedger();
              }
            } catch (err) { console.error(err); }
          }} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em]">Partner Merchant</Label>
                <select name="vendorId" required className="w-full h-12 bg-stone-50 border-stone-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-950 transition-all outline-none">
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.businessName}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em]">Customer Terminal (Mobile)</Label>
                <Input name="mobile" placeholder="+91 XXXXX XXXXX" required className="h-12 bg-stone-50 border-stone-100 rounded-xl px-4 text-sm font-bold shadow-none" />
              </div>
            </div>

            <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100 space-y-6">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Transmission Details</p>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">Item Identifier</Label>
                  <Input name="itemName" placeholder="Product Name" required className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm" />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">Qty</Label>
                  <Input name="quantity" type="number" defaultValue="1" required className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm" />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">Unit Price</Label>
                  <Input name="unitPrice" type="number" placeholder="0.00" required className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Gross Archive Value</p>
                <Input name="amount" placeholder="Total" required className="h-12 w-48 bg-transparent border-none text-3xl font-black text-indigo-950 p-0 shadow-none focus-visible:ring-0" />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => setIsManualOrderOpen(false)} variant="ghost" className="h-12 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest">Abort</Button>
                <Button type="submit" className="h-12 bg-indigo-950 hover:bg-[#1a0b2e] text-white rounded-xl px-12 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-950/20">Commit Sync</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Insight Dossier */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-stone-50/50 backdrop-blur-xl ring-1 ring-indigo-900/5">
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-indigo-950" />
            </div>
          ) : selectedOrder && (
            <div className="flex flex-col max-h-[90vh]">
              <header className="p-10 bg-indigo-950 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-amber-500/20 to-transparent blur-3xl rounded-full -mr-12 -mt-12" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest mb-4">Transmission Protocol ID</Badge>
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{selectedOrder.orderNumber}</h2>
                    <p className="text-stone-400 font-medium mt-3">{selectedOrder.type || 'Online'} Commerce Channel • Processed {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-black text-[10px] px-6 py-2 rounded-xl border-none uppercase tracking-widest leading-loose shadow-2xl shadow-emerald-500/20">
                    {selectedOrder.status}
                  </Badge>
                </div>
              </header>

              <ScrollArea className="flex-1 p-10 h-full">
                <div className="grid grid-cols-2 gap-10">
                  <section className="space-y-8">
                    <div>
                      <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Merchant Authority</h3>
                      <div className="p-6 bg-white rounded-3xl border border-stone-100 flex items-center gap-4 group hover:border-stone-300 transition-colors">
                        <div className="h-14 w-14 rounded-2xl bg-stone-50 flex items-center justify-center text-indigo-950 font-black text-2xl">
                          {selectedOrder.vendor?.businessName?.charAt(0) || selectedOrder.vendorName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-black text-indigo-950 text-lg leading-tight">{selectedOrder.vendor?.businessName || selectedOrder.vendorName}</p>
                          <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">Verified Partner</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Customer Segment</h3>
                      <div className="p-6 bg-white rounded-3xl border border-stone-100">
                        <p className="font-black text-indigo-950 text-xl tracking-tighter">{selectedOrder.customer?.name || selectedOrder.customerName || 'Direct Terminal walk-in'}</p>
                        <p className="text-sm text-stone-500 font-bold mt-1">{selectedOrder.customer?.mobile || selectedOrder.mobile}</p>
                        {selectedOrder.shippingAddress && (
                          <div className="mt-6 pt-6 border-t border-stone-50">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Terminal Destination</p>
                            <p className="text-xs text-stone-600 leading-relaxed font-bold">
                              {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}<br />
                              {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div>
                      <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Itemized Sync Registry</h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-stone-100 hover:scale-[1.02] transition-transform cursor-default">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-indigo-950">{item.name}</span>
                              <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5">Quantity: {item.quantity} units</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-indigo-950 block">&#8377;{parseFloat(item.unitPrice || (item.lineTotal / item.quantity) || 0).toLocaleString()}</span>
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Market Rate</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 mt-4 border-t-2 border-dashed border-stone-100 space-y-4">
                      <div className="flex justify-between items-center text-stone-400 font-bold text-[10px] uppercase tracking-widest px-1">
                        <span>Gross Subtotal</span>
                        <span className="text-stone-600">&#8377;{parseFloat(selectedOrder.subtotal || selectedOrder.totalAmount).toLocaleString()}</span>
                      </div>

                      {parseFloat(selectedOrder.discountAmount) > 0 && (
                        <div className="flex justify-between items-center text-amber-600 font-bold text-[10px] uppercase tracking-widest px-1">
                          <span>System Discount</span>
                          <span>- &#8377;{parseFloat(selectedOrder.discountAmount).toLocaleString()}</span>
                        </div>
                      )}

                      {selectedOrder.rewardPointsUsed > 0 && (
                        <div className="flex justify-between items-center text-blue-600 font-bold text-[10px] uppercase tracking-widest px-1">
                          <span>Loyalty Credits Applied</span>
                          <span>- &#8377;{selectedOrder.rewardPointsUsed.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between items-end border-t border-stone-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1">Total Settlement</span>
                          <span className="text-4xl font-black text-indigo-950 tracking-tighter">&#8377;{parseFloat(selectedOrder.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className="bg-stone-50 text-stone-400 font-black text-[9px] border-stone-100 rounded-xl py-2 px-6 shadow-none uppercase tracking-[0.2em] mb-2">Verified Transmission</Badge>
                          {selectedOrder.rewardPointsEarned > 0 && (
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+ {selectedOrder.rewardPointsEarned} Credits Accrued</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <footer className="p-8 bg-white border-t border-stone-100 flex justify-center gap-4 shrink-0 mt-auto">
                <Button onClick={() => printThermalReceipt(selectedOrder)} variant="outline" className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[10px] border-indigo-200 text-indigo-950 hover:bg-indigo-50 transition-all gap-2"><Printer className="h-4 w-4" /> Print Audit</Button>
              </footer>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Direct Vendor Modal */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleAddVendor} className="flex flex-col max-h-[90vh]">
            <header className="p-10 bg-indigo-950 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl rounded-full -mr-12 -mt-12" />
              <div className="relative z-10">
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Vendor Creation</h2>
                <p className="text-emerald-400 font-medium mt-3">Register a new verified partner authority.</p>
              </div>
            </header>

            <ScrollArea className="flex-1 p-10 h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Vendor Name <span className="text-rose-500">*</span></Label>
                    <Input value={newVendorData.businessName} onChange={e => setNewVendorData({ ...newVendorData, businessName: e.target.value })} required className="h-12 bg-stone-50 border-stone-100 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Owner Name <span className="text-rose-500">*</span></Label>
                    <Input value={newVendorData.ownerName} onChange={e => setNewVendorData({ ...newVendorData, ownerName: e.target.value })} required className="h-12 bg-stone-50 border-stone-100 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Contact Number <span className="text-rose-500">*</span></Label>
                    <Input value={newVendorData.contactNumber} onChange={e => setNewVendorData({ ...newVendorData, contactNumber: e.target.value })} required className="h-12 bg-stone-50 border-stone-100 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Email Address</Label>
                    <Input type="email" value={newVendorData.email} onChange={e => setNewVendorData({ ...newVendorData, email: e.target.value })} className="h-12 bg-stone-50 border-stone-100 rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Business Category <span className="text-rose-500">*</span></Label>
                    <Input placeholder="e.g. Health & Beauty" value={newVendorData.businessCategory} onChange={e => setNewVendorData({ ...newVendorData, businessCategory: e.target.value })} required className="h-12 bg-stone-50 border-stone-100 rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Store Address <span className="text-rose-500">*</span></Label>
                    <textarea
                      value={newVendorData.storeAddress}
                      onChange={e => setNewVendorData({ ...newVendorData, storeAddress: e.target.value })}
                      required
                      placeholder="e.g. 123 Main St, City, State, Zip"
                      className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <footer className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-4 shrink-0 mt-auto">
              <Button type="button" onClick={() => setIsAddVendorOpen(false)} variant="ghost" className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700">Issue Authority</Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
};

export default AdminDashboard;

