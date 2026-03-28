import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Sparkles,
  Trophy,
  Coins,
  Clock,
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
  Printer,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { printThermalReceipt } from "@/utils/printReceipt";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HomepageManager } from "@/components/HomepageManager";
import { VendorOfflineBilling } from "@/components/VendorOfflineBilling";
import { PointsSettings } from "@/components/PointsSettings";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const pathPart = location.pathname.split("/").filter(Boolean).pop();
  const activeView = pathPart === "admin" || !pathPart ? "overview" : pathPart;

  // Detail Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    businessName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    businessCategory: "",
    storeAddress: "",
  });
  const [selectedOrderTab, setSelectedOrderTab] = useState("online");
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("All");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedAnalyticsVendor, setSelectedAnalyticsVendor] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("1y");
  const [selectedTopProduct, setSelectedTopProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [manualOrderProducts, setManualOrderProducts] = useState([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    categoryName: "",
    description: "",
    tags: "",
    featured: false,
    newArrival: false,
    bestSeller: false,
    trending: false,
    rewardEligible: false,
    limitedOffer: false,
    ingredients: "",
    whyWeLoveIt: "",
    discountPrice: "",
    existingImages: [],
    vendors: [{ vendorId: "", stock: "" }],
  });
  const [productBenefits, setProductBenefits] = useState([
    { icon: "✨", text: "" },
  ]);
  const [productFaq, setProductFaq] = useState([{ q: "", a: "" }]);
  const [imageFiles, setImageFiles] = useState({
    primary: null,
    additional: [],
  });
  const [hasMultipleImages, setHasMultipleImages] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [initialProductState, setInitialProductState] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const { logout } = useAuth();

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    const newProd = {
      name: p.name,
      brand: p.brand || "",
      price: p.price,
      categoryName: p.category?.name || "",
      description: p.description || "",
      tags: p.tags?.join(", ") || "",
      featured: p.featured,
      newArrival: p.newArrival || false,
      bestSeller: p.bestSeller || false,
      trending: p.trending || false,
      rewardEligible: p.rewardEligible,
      limitedOffer: p.limitedOffer,
      ingredients: p.ingredients || "",
      whyWeLoveIt: p.whyWeLoveIt || "",
      discountPrice: p.discountPrice || "",
      existingImages: (p.imageUrls || []).filter(
        (img) => img && img.trim() !== "",
      ),
      vendors: p.bundledVendors
        ? p.bundledVendors.map((bv) => ({
            vendorId: bv.vendorId || bv.vendor?.id,
            stock: bv.stock,
            _existingId: bv.id,
          }))
        : [{ vendorId: p.vendorId, stock: p.stock, _existingId: p.id }],
    };
    setNewProduct(newProd);

    const ben =
      p.benefits && p.benefits.length > 0
        ? p.benefits
        : [{ icon: "✨", text: "" }];
    const faq = p.faq && p.faq.length > 0 ? p.faq : [{ q: "", a: "" }];

    setProductBenefits(ben);
    setProductFaq(faq);
    setInitialProductState(JSON.stringify({ prod: newProd, ben, faq }));
    setImageFiles({ primary: null, additional: [] });
    setHasMultipleImages(p.imageUrls && p.imageUrls.length > 1);
    setIsAddingNewCategory(false);
    fetch(`${API_URL}/admin/vendors`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVendors(d.data);
      });
    navigate("/admin/add-product");
  };

  const handleCreateProductClick = () => {
    setEditingProductId(null);
    const newProd = {
      name: "",
      brand: "",
      price: "",
      categoryName: "",
      description: "",
      tags: "",
      featured: false,
      newArrival: false,
      bestSeller: false,
      trending: false,
      rewardEligible: false,
      limitedOffer: false,
      ingredients: "",
      whyWeLoveIt: "",
      discountPrice: "",
      existingImages: [],
      vendors: [{ vendorId: "", stock: "" }],
    };
    setNewProduct(newProd);

    const ben = [{ icon: "✨", text: "" }];
    const faq = [{ q: "", a: "" }];

    setProductBenefits(ben);
    setProductFaq(faq);
    setInitialProductState(JSON.stringify({ prod: newProd, ben, faq }));
    setImageFiles({ primary: null, additional: [] });
    setHasMultipleImages(false);
    setIsAddingNewCategory(false);
    fetch(`${API_URL}/admin/vendors`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVendors(d.data);
      });
    navigate("/admin/add-product");
  };

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = API_URL.replace(/\/api$/, "");
    return `${baseUrl}/${url.replace(/^\//, "")}`;
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const resp = await fetch(`${API_URL}/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (data.success) {
        fetchDataForView("inventory");
      } else {
        toast.error(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product");
    }
  };

  useEffect(() => {
    if (activeView === "add-product") {
      setLoading(false);
      return;
    }

    if (activeView !== "overview") {
      fetchDataForView(activeView);
      if (activeView === "inventory") {
        fetch(`${API_URL}/admin/vendors`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setVendors(d.data);
          });
      }
    } else {
      fetchStats();
    }
  }, [activeView]);

  const fetchCategories = async () => {
    try {
      const resp = await fetch(`${API_URL}/admin/categories`);
      const data = await resp.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    if (activeView === "inventory" || activeView === "add-product") {
      fetchCategories();
    }
  }, [activeView]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/dashboard`);
      const data = await resp.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataForView = async (view) => {
    setLoading(true);
    try {
      if (view === "vendor-analytics") {
        const url = new URL(`${API_URL}/admin/vendor-analytics`);
        if (selectedAnalyticsVendor !== "All")
          url.searchParams.append("vendorId", selectedAnalyticsVendor);
        url.searchParams.append("timeRange", selectedTimeRange);

        const resp = await fetch(url.toString(), { cache: "no-store" });
        const data = await resp.json();
        if (data.success) {
          setAnalyticsData(data.data);
        }
      } else {
        const endpoint =
          view === "inventory"
            ? "products"
            : view === "orders"
              ? "orders"
              : view === "vendors"
                ? "vendors"
                : "customers";
        const resp = await fetch(`${API_URL}/admin/${endpoint}`);
        const data = await resp.json();
        if (data.success) {
          if (view === "inventory") setProducts(data.data);
          else if (view === "orders") setOrders(data.data);
          else if (view === "vendors") setVendors(data.data);
          else if (view === "customers") setCustomers(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedProducts = useMemo(() => {
    return Object.values(
      (products || []).reduce((acc, p) => {
        const baseName = p.name ? p.name.trim().toLowerCase() : "unnamed";
        if (!acc[baseName]) {
          acc[baseName] = {
            ...p,
            bundledVendors: [
              {
                vendor: p.vendor,
                vendorId: p.vendorId,
                stock: p.stock,
                id: p.id,
              },
            ],
          };
        } else {
          acc[baseName].bundledVendors.push({
            vendor: p.vendor,
            vendorId: p.vendorId,
            stock: p.stock,
            id: p.id,
          });
          acc[baseName].stock += p.stock;
        }
        return acc;
      }, {}),
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [products]);

  const fetchCustomerDetail = async (id) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/customers/${id}`);
      const data = await resp.json();
      if (data.success) setSelectedUser(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchVendorDetail = async (id) => {
    setDetailLoading(true);
    setIsVendorDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors/${id}`);
      const data = await resp.json();
      if (data.success) setSelectedVendor(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchOrderDetail = async (id, type) => {
    setDetailLoading(true);
    setIsOrderOpen(true);
    try {
      const resp = await fetch(`${API_URL}/admin/orders/${id}?type=${type}`);
      const data = await resp.json();
      if (data.success) setSelectedOrder(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!editingProductId && !imageFiles.primary)
      return toast.error("A primary product image is required.");

    setLoading(true);
    try {
      let finalImageUrls = [...newProduct.existingImages];
      let filesToUpload = [];

      if (imageFiles.primary) filesToUpload.push(imageFiles.primary);
      if (hasMultipleImages && imageFiles.additional.length > 0) {
        imageFiles.additional.forEach((f) => filesToUpload.push(f));
      }

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("images", file));

        const uploadResp = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResp.json();
        if (!uploadData.success) throw new Error("Image upload failed");

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
        tags: newProduct.tags
          ? newProduct.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        discountPrice: newProduct.discountPrice
          ? Number(newProduct.discountPrice)
          : undefined,
        imageUrls: finalImageUrls,
        ingredients: newProduct.ingredients || null,
        whyWeLoveIt: newProduct.whyWeLoveIt || null,
        benefits:
          productBenefits.filter((b) => b.text.trim()).length > 0
            ? productBenefits.filter((b) => b.text.trim())
            : null,
        faq:
          productFaq.filter((f) => f.q.trim() && f.a.trim()).length > 0
            ? productFaq.filter((f) => f.q.trim() && f.a.trim())
            : null,
      };

      if (editingProductId) {
        let initialSnap = { prod: { vendors: [] } };
        try {
          if (initialProductState)
            initialSnap = JSON.parse(initialProductState);
        } catch (e) {}
        const originalVendors = initialSnap.prod.vendors;
        const currentExistingIds = newProduct.vendors
          .filter((v) => v._existingId)
          .map((v) => v._existingId);

        const deletedVendors = originalVendors.filter(
          (v) => v._existingId && !currentExistingIds.includes(v._existingId),
        );

        // Sequentially delete removed variants
        for (const v of deletedVendors) {
          await fetch(`${API_URL}/admin/products/${v._existingId}`, {
            method: "DELETE",
          });
        }

        // Sequentially update or create variants
        for (const v of newProduct.vendors) {
          const payload = {
            ...basePayload,
            vendorId: v.vendorId,
            stock: Number(v.stock),
          };
          if (v._existingId) {
            const resp = await fetch(
              `${API_URL}/admin/products/${v._existingId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              },
            );
            const data = await resp.json();
            if (!data.success)
              throw new Error(
                data.message || "Failed to update bundled vendor product",
              );
          } else {
            const resp = await fetch(`${API_URL}/admin/products`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const data = await resp.json();
            if (!data.success)
              throw new Error(
                data.message || "Failed to create new bundled vendor product",
              );
          }
        }
      } else {
        // Sequentially create new variants
        for (const v of newProduct.vendors) {
          const payload = {
            ...basePayload,
            vendorId: v.vendorId,
            stock: Number(v.stock),
          };
          const resp = await fetch(`${API_URL}/admin/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await resp.json();
          if (!data.success)
            throw new Error(
              data.message || "Failed to create product for a vendor",
            );
        }
      }

      // setNewProduct({ name: '', brand: '', price: '', categoryName: '', description: '', tags: '', featured: false, newArrival: false, bestSeller: false, trending: false, rewardEligible: false, limitedOffer: false, ingredients: '', whyWeLoveIt: '', discountPrice: '', existingImages: [], vendors: [{ vendorId: '', stock: '' }] });
      // setProductBenefits([{ icon: '✨', text: '' }]);
      // setProductFaq([{ q: '', a: '' }]);
      // setImageFiles({ primary: null, additional: [] });
      // setHasMultipleImages(false);
      // setEditingProductId(null);
      // navigate('/admin/inventory');
      // fetchDataForView('inventory');
      toast.success("Product saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVendorData, approvalStatus: "APPROVED" }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsAddVendorOpen(false);
        setNewVendorData({
          businessName: "",
          ownerName: "",
          contactNumber: "",
          email: "",
          businessCategory: "",
          storeAddress: "",
        });
        fetchDataForView("vendors");
      } else {
        toast.error(data.message || "Failed to add vendor.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view) => {
    navigate(view === "overview" ? "/admin" : `/admin/${view}`);
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, description }) => {
    const bgColor = colorClass.split(" ").find((c) => c.startsWith("bg-"));

    return (
      <Card
        className={cn(
          "relative overflow-hidden group border border-stone-100 transition-all duration-300 ease-out hover:-translate-y-1 rounded-2xl bg-white cursor-pointer flex flex-col",
          "shadow-sm hover:shadow-md",
        )}
      >
        {/* Soft glowing ambient orb in the top right corner */}
        <div
          className={cn(
            "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500 ease-out",
            bgColor,
          )}
        />

        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5 relative z-20">
          <CardTitle className="text-stone-500 font-semibold text-xs uppercase tracking-wider leading-tight">
            {title}
          </CardTitle>
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-stone-50/50",
              colorClass,
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0 relative z-20">
          <div className="text-[32px] font-black leading-none tracking-tight text-indigo-950 transition-all duration-500">
            {value}
          </div>
          {description && (
            <p className="text-[11px] text-stone-400 font-medium leading-tight mt-1.5 truncate">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const offlineOrders = (orders || []).filter((o) => o.type === "Offline");
  const uniqueOutlets = [
    ...new Set(offlineOrders.map((o) => o.vendorName).filter(Boolean)),
  ].sort();
  const filteredOfflineOrders =
    selectedOutletFilter === "All"
      ? offlineOrders
      : offlineOrders.filter((o) => o.vendorName === selectedOutletFilter);

  const formatMoney = (val) => {
    if (!val) return "₹0";
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleVendorAnalyticsFilterChange = async (type, value) => {
    let vendor = selectedAnalyticsVendor;
    let time = selectedTimeRange;
    if (type === "vendor") {
      vendor = value;
      setSelectedAnalyticsVendor(value);
    }
    if (type === "time") {
      time = value;
      setSelectedTimeRange(value);
    }

    try {
      const url = new URL(`${API_URL}/admin/vendor-analytics`);
      if (vendor !== "All") url.searchParams.append("vendorId", vendor);
      url.searchParams.append("timeRange", time);

      const resp = await fetch(url.toString(), { cache: "no-store" });
      const data = await resp.json();
      if (data.success) setAnalyticsData(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderLineGraph = () => {
    const data = analyticsData?.graphData || [];
    if (data.length === 0)
      return <div className="h-56 w-full mt-6 bg-stone-50 rounded-2xl" />;

    const maxAmt = Math.max(...data.map((d) => d.amount), 1);
    const points = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
      const y = 100 - (d.amount / maxAmt) * 100;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(" L ")}`;
    const areaData = `M 0,100 L ${points.join(" L ")} L 100,100 Z`;

    return (
      <div className="w-full h-56 mt-8 relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#f5f5f4"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path
            d={areaData}
            fill="url(#lineGrad)"
            className="transition-all duration-700 ease-out opacity-60 hover:opacity-100"
          />
          <path
            d={pathData}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700 ease-out drop-shadow-sm"
          />
        </svg>

        {/* Hover overlay targets and physical dots */}
        {data.map((d, i) => {
          const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
          const y = 100 - (d.amount / maxAmt) * 100;
          return (
            <div
              key={`target-${i}`}
              className="absolute w-6 h-6 -ml-3 -mt-3 group/tip z-10 cursor-pointer flex items-center justify-center transition-all duration-500"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Visible clean dot (HTML based to prevent SVG stretch) */}
              <div className="w-[7px] h-[7px] rounded-full bg-white border-[1.5px] border-emerald-500 shadow-sm transition-all duration-300 group-hover/tip:scale-[1.8] group-hover/tip:bg-emerald-50 z-20 pointer-events-none" />

              {/* Tooltip Popup */}
              <div className="opacity-0 group-hover/tip:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-indigo-950 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl shadow-indigo-950/20 whitespace-nowrap pointer-events-none transition-all duration-300 transform translate-y-2 group-hover/tip:translate-y-0 text-center z-50 border border-white/10">
                <div className="text-[8px] font-bold text-emerald-400 mb-0.5 tracking-wider uppercase">
                  {d.label}
                </div>
                {formatMoney(d.amount)}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-indigo-950" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && activeView === "overview")
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-indigo-950" />
      </div>
    );

  return (
    <SidebarProvider>
      <div
        className={`flex min-h-screen w-full ${THEME.colors.background.secondary} bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`}
      >
        <Sidebar className="border-r border-stone-200/60 bg-white">
          <SidebarHeader className="p-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-lg shadow-lg shadow-indigo-500/25">
                O
              </div>
              <div className="flex flex-col">
                <span className="font-['Inter'] font-extrabold text-indigo-950 leading-tight text-[15px] tracking-tight">
                  OMW Admin
                </span>
                <span className="font-['Inter'] text-[9px] text-purple-500 font-bold uppercase tracking-[0.2em]">
                  Enterprise OS
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-3">
            <SidebarMenu className="mt-2 gap-1">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                {
                  id: "homepage-builder",
                  label: "Homepage Builder",
                  icon: LayoutTemplate,
                },
                { id: "inventory", label: "Inventory", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingCart },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group",
                      activeView === item.id
                        ? "!bg-indigo-50 !text-indigo-950 font-bold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-indigo-950",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        activeView === item.id
                          ? "!text-indigo-600"
                          : "text-stone-400 group-hover:text-indigo-600",
                      )}
                    />
                    <span className="font-['Inter'] font-semibold text-[13px]">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-indigo-950 w-full">
                      <Users className="h-[18px] w-[18px] text-stone-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">
                        Vendors
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendors"}
                          onClick={() => handleViewChange("vendors")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200",
                            activeView === "vendors"
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendors" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />
                          )}
                          Vendor Overview
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendor-analytics"}
                          onClick={() => handleViewChange("vendor-analytics")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200",
                            activeView === "vendor-analytics"
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendor-analytics" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />
                          )}
                          Vendor Analytics
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "offline-billing"}
                          onClick={() => handleViewChange("offline-billing")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200",
                            activeView === "offline-billing"
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "offline-billing" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 mr-2" />
                          )}
                          Offline Billing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {[
                { id: "customers", label: "Customers", icon: UserPlus },
                { id: "points", label: "Points", icon: Coins },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group",
                      activeView === item.id
                        ? "!bg-indigo-50 !text-indigo-950 font-bold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-indigo-950",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        activeView === item.id
                          ? "!text-indigo-600"
                          : "text-stone-400 group-hover:text-indigo-600",
                      )}
                    />
                    <span className="font-['Inter'] font-semibold text-[13px]">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
              <Avatar className="h-9 w-9 ring-2 ring-indigo-100">
                <AvatarFallback className="bg-indigo-950 text-white font-bold text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-['Inter'] text-sm font-bold text-stone-800 truncate">
                  Admin
                </span>
                <span className="font-['Inter'] text-[10px] text-stone-400 font-medium">
                  Manager Access
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-rose-50 transition-all group"
                title="Logout"
              >
                <X className="h-4 w-4 text-stone-400 group-hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col relative overflow-hidden z-0 bg-stone-50">
          <header className="h-[80px] bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50 border-b border-stone-200/60 shadow-sm">
            {/* Left: Status & Sidebar Trigger */}
            <div className="flex items-center gap-5">
              <SidebarTrigger className="lg:hidden text-stone-500 hover:text-stone-900 transition-colors" />
              <div className="hidden md:block">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5">
                  Today's Date
                </div>
                <div className="text-sm font-bold text-stone-800">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Middle: Search Bar (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-6 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="Search orders, products, or vendors..."
                className="w-full bg-stone-100/50 border-stone-200 focus-visible:ring-indigo-600 focus-visible:bg-white pl-10 h-10 rounded-xl transition-all shadow-none placeholder:text-stone-400 font-medium"
              />
            </div>

            {/* Right: Actions & Notifications */}
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="h-[42px] w-[42px] rounded-xl text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative"
              >
                <Bell className="h-[20px] w-[20px]" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-[42px] w-[42px] rounded-xl text-stone-500 hover:text-indigo-600 hover:bg-stone-100 transition-colors"
              >
                <Settings className="h-[20px] w-[20px]" />
              </Button>

              <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block"></div>

              <Button className="hidden sm:flex bg-indigo-950 text-white hover:bg-indigo-900 rounded-xl px-5 h-10 text-xs font-bold shadow-md shadow-indigo-950/10">
                Generate Report
              </Button>
            </div>
          </header>

          <main className="p-12 w-full">
            {activeView === "homepage-builder" && <HomepageManager />}
            {activeView === "offline-billing" && <VendorOfflineBilling />}
            {activeView === "points" && <PointsSettings />}
            {activeView === "overview" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                <header>
                  <h1
                    className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                  >
                    Enterprise Overview
                  </h1>
                  <p
                    className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}
                  >
                    Holistic view of marketplace performance and scale.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Customers"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600"
                    description="Total registered buyers on platform"
                  />
                  <StatCard
                    title="Vendors"
                    value={stats?.totalVendors || 0}
                    icon={Users}
                    colorClass="bg-emerald-50 text-emerald-600"
                    description="Active enterprise partner nodes"
                  />
                  <StatCard
                    title="Inventory"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    colorClass="bg-purple-50 text-purple-600"
                    description="Live catalog items across network"
                  />
                  <StatCard
                    title="Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCart}
                    colorClass="bg-pink-50 text-pink-600"
                    description="Completed gross transaction count"
                  />
                </div>

                {stats?.pendingVendorApprovals > 0 && (
                  <Card className="bg-indigo-950 text-white border-none p-8 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-indigo-950/20">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                        <AlertCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">
                          Critical Approvals Required
                        </h3>
                        <p className="text-stone-400 text-sm mt-1">
                          {stats.pendingVendorApprovals} vendor profiles are
                          awaiting enterprise authorization to go live.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewChange("vendors")}
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

            {activeView === "inventory" && (
              <div className="space-y-8 animate-in fade-in">
                <header className="flex items-center justify-between gap-6 mb-12">
                  <div className="flex flex-col">
                    <h1
                      className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                    >
                      Product Inventory
                    </h1>
                    <p className={`${THEME.typography.micro.muted}`}>
                      Catalog management across all enterprise partners.
                    </p>
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
                          <TableHead className="p-4 min-w-[280px]">
                            Product
                          </TableHead>
                          <TableHead className="p-4 min-w-[120px]">
                            Category
                          </TableHead>
                          <TableHead className="p-4 min-w-[120px]">
                            Vendor
                          </TableHead>
                          <TableHead className="p-4 text-right min-w-[100px]">
                            Price
                          </TableHead>
                          <TableHead className="p-4 text-right min-w-[100px]">
                            Stock
                          </TableHead>
                          <TableHead className="p-4 text-center min-w-[90px]">
                            Status
                          </TableHead>
                          <TableHead className="p-4 text-center min-w-[90px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          [1, 2, 3, 4].map((i) => (
                            <TableRow key={i} className="animate-pulse">
                              <TableCell
                                colSpan={7}
                                className="h-16 bg-stone-50/50"
                              />
                            </TableRow>
                          ))
                        ) : groupedProducts.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center p-20 text-stone-400 font-bold"
                            >
                              No inventory records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          groupedProducts.map((p) => (
                            <TableRow
                              key={p.id}
                              className="border-stone-50 hover:bg-stone-50/30 transition-colors"
                            >
                              <TableCell className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
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
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-bold">
                                        IMG
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-indigo-900 text-sm truncate max-w-[200px]">
                                      {p.name}
                                    </p>
                                    <p className="text-stone-400 text-xs font-medium truncate max-w-[200px]">
                                      {p.brand || "—"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-4">
                                <Badge
                                  variant="outline"
                                  className="rounded-lg font-semibold text-[10px] uppercase tracking-wider border-stone-200 text-stone-500 bg-stone-50"
                                >
                                  {p.category?.name || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-4">
                                <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                  {(() => {
                                    let vendorsList = Object.values(
                                      p.bundledVendors?.reduce((acc, bv) => {
                                        const vId =
                                          bv.vendorId ||
                                          bv.vendor?.id ||
                                          "unknown";
                                        if (!acc[vId]) acc[vId] = { ...bv };
                                        else acc[vId].stock += bv.stock;
                                        return acc;
                                      }, {}) || {},
                                    );

                                    if (vendorsList.length === 0)
                                      return (
                                        <Badge
                                          variant="outline"
                                          className="rounded-lg text-[10px] text-stone-400"
                                        >
                                          None
                                        </Badge>
                                      );

                                    if (vendorsList.length === 1) {
                                      const bv = vendorsList[0];
                                      return (
                                        <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200/80 rounded-lg px-2.5 py-1 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                          <span className="text-[10px] font-black tracking-wide text-indigo-950/80 truncate max-w-[90px]">
                                            {bv.vendor?.businessName ||
                                              "Unknown"}
                                          </span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex items-center gap-1.5 bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors border border-indigo-200/60 rounded-lg px-2.5 py-1">
                                        <span className="text-[10px] font-black tracking-wide text-indigo-900 truncate max-w-[90px]">
                                          {vendorsList.length} Vendors
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </TableCell>
                              <TableCell className="p-4 text-right font-black text-indigo-950">
                                &#8377;{Number(p.price).toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="p-4 text-right font-medium">
                                <span
                                  className={cn(
                                    p.stock < 10
                                      ? "text-red-500 font-bold"
                                      : "text-stone-600",
                                  )}
                                >
                                  {p.stock} units
                                </span>
                              </TableCell>
                              <TableCell className="p-4 text-center">
                                <Badge
                                  className={cn(
                                    "rounded-lg font-bold px-3 border-none text-[10px]",
                                    p.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-stone-100 text-stone-400",
                                  )}
                                >
                                  {p.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditProduct(p);
                                    }}
                                    className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Delete all variants in the bundle
                                      p.bundledVendors.forEach((bv) =>
                                        handleDeleteProduct(bv.id),
                                      );
                                    }}
                                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
            )}

            {activeView === "orders" && (
              <div className="space-y-8 animate-in fade-in">
                <header>
                  <h1
                    className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                  >
                    Order Transmissions
                  </h1>
                  <p
                    className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}
                  >
                    Monitoring real-time transaction flow and manual records.
                  </p>
                </header>

                <Tabs
                  value={selectedOrderTab}
                  onValueChange={setSelectedOrderTab}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TabsList className="bg-stone-50 p-1.5 rounded-[1.25rem] border border-stone-100 gap-2 h-auto w-fit">
                      <TabsTrigger
                        value="online"
                        className="rounded-xl px-12 h-10 data-[state=active]:bg-indigo-950 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Online
                      </TabsTrigger>
                      <TabsTrigger
                        value="offline"
                        className="rounded-xl px-12 h-10 data-[state=active]:bg-indigo-950 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Offline
                      </TabsTrigger>
                    </TabsList>

                    {selectedOrderTab === "offline" && (
                      <div className="group flex items-center bg-stone-50/80 hover:bg-white transition-all duration-300 rounded-[1.25rem] border border-stone-200/60 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 px-2 py-1.5 w-fit cursor-pointer animate-in fade-in slide-in-from-right-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white group-hover:bg-indigo-50 transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-stone-100 mr-3">
                          <Filter className="h-[14px] w-[14px] text-stone-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-1">
                          Origin Node:
                        </span>
                        <div className="relative flex items-center min-w-[140px]">
                          <select
                            className="appearance-none bg-transparent border-none text-indigo-950 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-2 pr-8 w-full hover:text-indigo-600 transition-colors outline-none"
                            value={selectedOutletFilter}
                            onChange={(e) =>
                              setSelectedOutletFilter(e.target.value)
                            }
                          >
                            <option value="All">All Network Nodes</option>
                            {uniqueOutlets.map((outlet, idx) => (
                              <option key={idx} value={outlet}>
                                {outlet}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-stone-100 group-hover:bg-indigo-100 rounded-md p-1 transition-colors">
                            <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-indigo-600 rotate-90 transition-transform" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <TabsContent
                    value="online"
                    className="animate-in slide-in-from-bottom-2 duration-500"
                  >
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-stone-50/50">
                          <TableRow className="border-stone-100 hover:bg-transparent h-16">
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Transaction Ref
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Customer Terminal
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Merchant Origin
                            </TableHead>
                            <TableHead className="px-8 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Settlement
                            </TableHead>
                            <TableHead className="px-8 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Points Earned
                            </TableHead>
                            <TableHead className="px-8 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            [1, 2, 3].map((i) => (
                              <TableRow key={i} className="animate-pulse">
                                <TableCell
                                  colSpan={6}
                                  className="h-24 bg-stone-50/20"
                                />
                              </TableRow>
                            ))
                          ) : orders.filter((o) => o.type === "Online")
                              .length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center p-24 text-stone-400 font-bold"
                              >
                                No active digital transmissions found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders
                              .filter((o) => o.type === "Online")
                              .map((o) => (
                                <TableRow
                                  key={o.id}
                                  onClick={() =>
                                    fetchOrderDetail(o.id, "Online")
                                  }
                                  className="border-stone-50 hover:bg-stone-50 transition-all duration-300 cursor-pointer group h-20"
                                >
                                  <TableCell className="px-8">
                                    <span className="text-sm font-black text-indigo-950 tracking-tighter uppercase group-hover:text-amber-600 transition-colors">
                                      {o.orderNumber}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8">
                                    <span className="font-extrabold text-indigo-900 text-base">
                                      {o.customerName}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8">
                                    <span className="font-medium text-stone-500 text-xs uppercase tracking-wider">
                                      {o.vendorName}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8 text-right">
                                    <span className="font-mono font-bold text-indigo-950 text-base">
                                      &#8377;
                                      {parseFloat(
                                        o.totalAmount,
                                      ).toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3.5 py-1.5 ring-1 ring-amber-500/20">
                                      <Coins className="h-3.5 w-3.5" />
                                      <span className="text-xs font-black">
                                        {o.rewardPointsEarned || 0}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border-none shadow-sm",
                                        o.status === "DELIVERED" ||
                                          o.status === "COMPLETED"
                                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20"
                                          : "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
                                      )}
                                    >
                                      {o.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>

                  <TabsContent
                    value="offline"
                    className="animate-in slide-in-from-bottom-2 duration-500"
                  >
                    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                      <Table>
                        <TableHeader className="bg-stone-50/50">
                          <TableRow className="border-stone-100 hover:bg-transparent h-16">
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Entry Ref
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Merchant Authority
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Customer ID
                            </TableHead>
                            <TableHead className="px-8 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Value
                            </TableHead>
                            <TableHead className="px-8 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Points Earned
                            </TableHead>
                            <TableHead className="px-8 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Registry Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            [1, 2, 3].map((i) => (
                              <TableRow key={i} className="animate-pulse">
                                <TableCell
                                  colSpan={6}
                                  className="h-20 bg-stone-50/50"
                                />
                              </TableRow>
                            ))
                          ) : filteredOfflineOrders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center p-32 text-stone-300 text-[11px] font-black uppercase tracking-[0.4em]"
                              >
                                No manual records found in this cycle.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredOfflineOrders.map((o) => (
                              <TableRow
                                key={o.id}
                                onClick={() =>
                                  fetchOrderDetail(o.id, "Offline")
                                }
                                className="border-stone-50/50 h-[5.5rem] hover:bg-indigo-50/20 transition-all duration-300 cursor-pointer group"
                              >
                                <TableCell className="px-8">
                                  <div className="flex flex-col">
                                    <Badge className="w-fit bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white text-[9px] font-mono font-black uppercase tracking-widest rounded px-2.5 py-1.5 transition-all shadow-sm border border-slate-200 group-hover:border-indigo-600">
                                      {o.orderNumber}
                                    </Badge>
                                    <span className="text-[8px] font-mono font-black text-slate-300 uppercase tracking-widest mt-2 ml-0.5">
                                      REF_PROTO_ID
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8">
                                  <div className="flex flex-col">
                                    <span className="text-base font-black text-indigo-950 tracking-tight group-hover:text-amber-600 transition-colors">
                                      {o.vendorName}
                                    </span>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">
                                      Authorized Node
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 font-sans">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-stone-600 tracking-tight">
                                      {o.customerName}
                                    </span>
                                    <span className="text-[10px] font-medium text-stone-300">
                                      Registry Index
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-2xl font-mono font-black text-indigo-950 tracking-tighter group-hover:scale-105 transition-transform origin-right">
                                      &#8377;
                                      {parseFloat(
                                        o.totalAmount,
                                      ).toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mt-1.5">
                                      Gross Settlement
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 text-center">
                                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3.5 py-1.5 ring-1 ring-amber-500/20 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                                    <Coins className="h-3.5 w-3.5" />
                                    <span className="text-xs font-black">
                                      {o.rewardPointsEarned || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 text-center">
                                  <Badge className="bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-all">
                                    <div className="h-1.5 w-1.5 bg-slate-300 group-hover:bg-emerald-500 rounded-full mr-2.5 transition-colors" />
                                    ARCHIVED
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeView === "vendors" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <header className="flex items-center justify-between gap-6 mb-12">
                  <div className="flex flex-col">
                    <h1
                      className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                    >
                      Registered Vendors
                    </h1>
                    <p className={`${THEME.typography.micro.muted}`}>
                      Vendor lifecycle and compliance management.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddVendorOpen(true)}
                    className="rounded-2xl h-14 px-8 shadow-2xl shadow-indigo-950/40 hover:bg-[#1a0b2e] font-black uppercase tracking-widest text-[10px] bg-indigo-950 text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
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
                        <TableHead className="p-6 text-center">
                          Compliance Status
                        </TableHead>
                        <TableHead className="p-6 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [1, 2].map((i) => (
                          <TableRow key={i} className="animate-pulse">
                            <TableCell
                              colSpan={5}
                              className="h-16 bg-stone-50/50"
                            />
                          </TableRow>
                        ))
                      ) : vendors.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center p-20 text-stone-400 font-bold"
                          >
                            No vendors found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vendors.map((v) => (
                          <TableRow
                            key={v.id}
                            className="border-stone-50 hover:bg-stone-50/30"
                          >
                            <TableCell className="p-6 font-bold text-indigo-900">
                              {v.businessName}
                            </TableCell>
                            <TableCell className="p-6 font-medium text-stone-500">
                              {v.businessCategory}
                            </TableCell>
                            <TableCell className="p-6 text-stone-500 font-medium">
                              <div className="flex flex-col">
                                <span>{v.contactNumber}</span>
                                <span className="text-[10px]">
                                  {v.email || "No Email"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="p-6 text-center">
                              <Badge
                                className={cn(
                                  "rounded-full font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none shadow-sm flex items-center gap-2 w-fit mx-auto",
                                  v.approvalStatus === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
                                    : v.approvalStatus === "PENDING"
                                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                                      : "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full animate-pulse",
                                    v.approvalStatus === "APPROVED"
                                      ? "bg-emerald-500"
                                      : v.approvalStatus === "PENDING"
                                        ? "bg-amber-500"
                                        : "bg-rose-500",
                                  )}
                                />
                                {v.approvalStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="p-6 text-right">
                              <div className="flex justify-end gap-2">
                                {v.approvalStatus === "PENDING" && (
                                  <Button
                                    size="sm"
                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg"
                                    onClick={async () => {
                                      await fetch(
                                        `${API_URL}/admin/vendors/${v.id}/approve`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: "APPROVED",
                                          }),
                                        },
                                      );
                                      fetchDataForView("vendors");
                                    }}
                                  >
                                    Approve
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-stone-400"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-[160px] rounded-xl font-bold bg-white text-xs"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => fetchVendorDetail(v.id)}
                                      className="cursor-pointer py-2 px-3 gap-2"
                                    >
                                      <Eye className="h-4 w-4" /> View Data
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeView === "vendor-analytics" && (
              <div className="space-y-12 animate-in fade-in">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-indigo-950 tracking-tight">
                      Vendor Analytics
                    </h1>
                    <p className="text-sm font-medium text-stone-500 mt-2">
                      Cross-sector sales performance and revenue intelligence.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {/* Time Filter */}
                    <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-2xl border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                        Range:
                      </span>
                      <div className="relative flex items-center min-w-[100px]">
                        <select
                          className="appearance-none bg-transparent border-none text-indigo-950 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-indigo-600 outline-none truncate"
                          value={selectedTimeRange}
                          onChange={(e) =>
                            handleVendorAnalyticsFilterChange(
                              "time",
                              e.target.value,
                            )
                          }
                        >
                          <option value="7d">7 Days</option>
                          <option value="1m">1 Month</option>
                          <option value="6m">6 Months</option>
                          <option value="1y">1 Year</option>
                        </select>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-indigo-600 transition-colors rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Vendor Filter */}
                    <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-2xl border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                        Source:
                      </span>
                      <div className="relative flex items-center min-w-[130px]">
                        <select
                          className="appearance-none bg-transparent border-none text-indigo-950 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-indigo-600 outline-none truncate"
                          value={selectedAnalyticsVendor}
                          onChange={(e) =>
                            handleVendorAnalyticsFilterChange(
                              "vendor",
                              e.target.value,
                            )
                          }
                        >
                          <option value="All">All Nodes</option>
                          {analyticsData?.vendorsList?.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.businessName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-indigo-600 transition-colors rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
                        +14.2%
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Total Sale Units
                    </p>
                    <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">
                      {analyticsData?.totalSaleUnits >= 1000
                        ? (analyticsData.totalSaleUnits / 1000).toFixed(1) + "K"
                        : analyticsData?.totalSaleUnits || 0}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Consolidated volume across all verified partner nodes.
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
                        +8.7%
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Gross Revenue
                    </p>
                    <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">
                      {formatMoney(analyticsData?.grossRevenue || 0)}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Total market value processed through secure enterprise
                      channels.
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px]">
                        PEAK
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Platform Earnings
                    </p>
                    <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">
                      {formatMoney(analyticsData?.platformEarnings || 0)}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Net marketplace yield after partner settlement protocol.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <Card className="col-span-8 p-10 rounded-3xl border border-stone-100/40 shadow-sm bg-white overflow-hidden relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Revenue Distribution
                      </h3>
                    </div>

                    {renderLineGraph()}

                    {/* X Axis Labels */}
                    <div className="relative w-full h-4 mt-3">
                      {analyticsData?.graphData?.map((d, i) => {
                        const len = analyticsData.graphData.length;
                        const showLabel =
                          len > 15
                            ? i % Math.ceil(len / 6) === 0 || i === len - 1
                            : true;
                        if (!showLabel) return null;
                        const x = len > 1 ? (i / (len - 1)) * 100 : 50;
                        return (
                          <span
                            key={`l-${i}`}
                            className="absolute top-0 -translate-x-1/2 text-[9px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap"
                            style={{ left: `${x}%` }}
                          >
                            {d.label}
                          </span>
                        );
                      })}
                    </div>
                  </Card>

                  <Card className="col-span-4 p-10 rounded-3xl border border-stone-100/40 shadow-sm bg-white overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Product Sales Performance
                      </h3>
                    </div>

                    <ScrollArea className="h-[350px] pr-4 -mr-4">
                      <div className="space-y-6 relative z-10 pb-4">
                        {analyticsData?.productPerformance &&
                        analyticsData.productPerformance.length > 0 ? (
                          analyticsData.productPerformance.map((s, i) => (
                            <div
                              key={i}
                              className="group/item cursor-pointer"
                              onClick={() => setSelectedTopProduct(s)}
                            >
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-indigo-950 truncate max-w-[65%] group-hover/item:text-blue-600 transition-colors">
                                  {s.label}
                                </span>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-indigo-950 block">
                                    {formatMoney(s.val)}
                                  </span>
                                  <span className="text-[9px] font-semibold text-stone-400">
                                    {s.qty} units
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-950 rounded-full transition-all duration-1000 ease-out group-hover/item:bg-blue-500 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                                  style={{ width: `${Math.max(2, s.p)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 opacity-20">
                            <Package className="h-12 w-12 text-stone-300 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              No Sales Protocol Data
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </div>
            )}

            {activeView === "customers" && (
              <div className="space-y-8 animate-in fade-in">
                <header>
                  <h1
                    className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                  >
                    Registered Customers
                  </h1>
                  <p
                    className={`${THEME.colors.text.secondary} ${THEME.typography.weights.medium} mt-1`}
                  >
                    User base demographics and loyalty insights.
                  </p>
                </header>

                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-stone-50">
                      <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                        <TableHead className="p-6">User Profile</TableHead>
                        <TableHead className="p-6">Contact Access</TableHead>
                        <TableHead className="p-6 text-right">
                          Reward Balance
                        </TableHead>
                        <TableHead className="p-6 text-right">
                          Acquisition Date
                        </TableHead>
                        <TableHead className="p-6 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [1, 2, 3].map((i) => (
                          <TableRow key={i} className="animate-pulse">
                            <TableCell
                              colSpan={5}
                              className="h-16 bg-stone-50/50"
                            />
                          </TableRow>
                        ))
                      ) : customers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center p-20 text-stone-400 font-bold"
                          >
                            No customers found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        customers.map((c) => (
                          <TableRow
                            key={c.id}
                            className="border-stone-50 hover:bg-stone-50/30"
                          >
                            <TableCell className="p-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-stone-100 text-stone-600 font-bold">
                                    {c.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span
                                    className={`${THEME.typography.weights.medium} ${THEME.colors.text.primary}`}
                                  >
                                    {c.name}
                                  </span>
                                  <span
                                    className={THEME.typography.micro.muted}
                                  >
                                    {c.id.slice(-8)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-6 font-medium text-stone-500">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-stone-400" />
                                  <span className="text-xs">
                                    {c.email || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-stone-400" />
                                  <span className="text-xs">{c.mobile}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-6 text-right">
                              <Badge
                                variant="outline"
                                className="rounded-lg font-black text-purple-900 bg-stone-50 border-stone-100"
                              >
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
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-stone-400"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-[160px] rounded-xl font-bold bg-white text-xs"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => fetchCustomerDetail(c.id)}
                                      className="cursor-pointer py-2 px-3 gap-2"
                                    >
                                      <Eye className="h-4 w-4" /> View Profile
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {/* Add Product Full Page */}
            {activeView === "add-product" &&
              (() => {
                const currentSnapshot = JSON.stringify({
                  prod: newProduct,
                  ben: productBenefits,
                  faq: productFaq,
                });
                const hasChanges =
                  !initialProductState ||
                  currentSnapshot !== initialProductState ||
                  imageFiles.primary !== null ||
                  imageFiles.additional.length > 0;
                return (
                  <div className="animate-in fade-in">
                    <form onSubmit={handleAddProduct}>
                      <div className="grid grid-cols-12 gap-10">
                        {/* Left Column */}
                        <div className="col-span-8 space-y-8">
                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <h2
                              className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}
                            >
                              Product Details
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2 space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Product Name
                                </Label>
                                <Input
                                  required
                                  value={newProduct.name}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      name: e.target.value,
                                    })
                                  }
                                  className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                  placeholder="e.g., Hydra Barrier Serum"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Brand
                                </Label>
                                <Input
                                  required
                                  value={newProduct.brand}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      brand: e.target.value,
                                    })
                                  }
                                  className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                  placeholder="e.g., LUMIÈRE SEOUL"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label
                                    className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                  >
                                    Category
                                  </Label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setIsAddingNewCategory(
                                        !isAddingNewCategory,
                                      )
                                    }
                                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors"
                                  >
                                    {isAddingNewCategory
                                      ? "Select Existing"
                                      : "+ Add New"}
                                  </button>
                                </div>
                                {isAddingNewCategory ? (
                                  <Input
                                    required
                                    value={newProduct.categoryName}
                                    onChange={(e) =>
                                      setNewProduct({
                                        ...newProduct,
                                        categoryName: e.target.value,
                                      })
                                    }
                                    className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                    placeholder="Enter new category name..."
                                    autoFocus
                                  />
                                ) : (
                                  <div className="relative">
                                    <select
                                      required
                                      value={newProduct.categoryName}
                                      onChange={(e) =>
                                        setNewProduct({
                                          ...newProduct,
                                          categoryName: e.target.value,
                                        })
                                      }
                                      className="w-full rounded-[1.25rem] h-14 border border-stone-200 bg-stone-50 font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-950 transition-all text-sm"
                                    >
                                      <option value="" disabled>
                                        Select Category
                                      </option>
                                      {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                          {cat.name}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
                                  </div>
                                )}
                              </div>
                              <div className="col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label
                                    className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                  >
                                    Vendors & Stock
                                  </Label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNewProduct({
                                        ...newProduct,
                                        vendors: [
                                          ...newProduct.vendors,
                                          { vendorId: "", stock: "" },
                                        ],
                                      })
                                    }
                                    className="h-8 px-4 text-[10px] uppercase font-black tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-all flex items-center gap-1.5"
                                  >
                                    <Plus className="h-3 w-3" /> Add Vendor
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {newProduct.vendors.map((v, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-[1.25rem] border border-stone-200 shadow-sm"
                                    >
                                      <div className="relative flex-1">
                                        <select
                                          required
                                          className="w-full h-12 rounded-xl bg-transparent px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-950 appearance-none transition-all"
                                          value={v.vendorId}
                                          onChange={(e) => {
                                            const newVs = [
                                              ...newProduct.vendors,
                                            ];
                                            newVs[idx] = {
                                              ...newVs[idx],
                                              vendorId: e.target.value,
                                            };
                                            setNewProduct({
                                              ...newProduct,
                                              vendors: newVs,
                                            });
                                          }}
                                        >
                                          <option value="" disabled>
                                            Select a vendor...
                                          </option>
                                          {vendors.map((vnd) => {
                                            const isSelectedElsewhere =
                                              newProduct.vendors.some(
                                                (otherV, otherIdx) =>
                                                  otherIdx !== idx &&
                                                  otherV.vendorId === vnd.id,
                                              );
                                            return (
                                              <option
                                                key={vnd.id}
                                                value={vnd.id}
                                                disabled={isSelectedElsewhere}
                                              >
                                                {vnd.businessName}{" "}
                                                {isSelectedElsewhere
                                                  ? "— Already Selected"
                                                  : ""}
                                              </option>
                                            );
                                          })}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
                                      </div>
                                      <div className="w-[140px] relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-stone-300 pointer-events-none">
                                          QTY
                                        </span>
                                        <Input
                                          type="number"
                                          required
                                          value={v.stock}
                                          onChange={(e) => {
                                            const newVs = [
                                              ...newProduct.vendors,
                                            ];
                                            newVs[idx] = {
                                              ...newVs[idx],
                                              stock: e.target.value,
                                            };
                                            setNewProduct({
                                              ...newProduct,
                                              vendors: newVs,
                                            });
                                          }}
                                          className="rounded-xl h-12 border-0 bg-white shadow-sm font-black text-indigo-950 pl-12 pr-4"
                                          placeholder="0"
                                        />
                                      </div>
                                      {newProduct.vendors.length > 1 &&
                                        idx !== 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newVs = [
                                                ...newProduct.vendors,
                                              ];
                                              newVs.splice(idx, 1);
                                              setNewProduct({
                                                ...newProduct,
                                                vendors: newVs,
                                              });
                                            }}
                                            className="w-12 h-12 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Product Tags
                                </Label>
                                <Input
                                  value={newProduct.tags}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      tags: e.target.value,
                                    })
                                  }
                                  className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                  placeholder="Hydrating, Korea, Glow"
                                />
                              </div>
                              <div className="col-span-2 space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Product Description
                                </Label>
                                <textarea
                                  required
                                  value={newProduct.description}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      description: e.target.value,
                                    })
                                  }
                                  className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all"
                                  placeholder="Enter product details..."
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <h2
                              className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}
                            >
                              Product Content
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Ingredients
                                </Label>
                                <textarea
                                  value={newProduct.ingredients}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      ingredients: e.target.value,
                                    })
                                  }
                                  className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all"
                                  placeholder="Water, Glycerin, Niacinamide (5%)..."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Why We Love It
                                </Label>
                                <textarea
                                  value={newProduct.whyWeLoveIt}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      whyWeLoveIt: e.target.value,
                                    })
                                  }
                                  className="flex min-h-[120px] w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all"
                                  placeholder="e.g., Instantly plumps skin by +45%..."
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                              <h2 className={THEME.typography.micro.muted}>
                                Key Benefits
                              </h2>
                              <button
                                type="button"
                                onClick={() =>
                                  setProductBenefits([
                                    ...productBenefits,
                                    { icon: "✨", text: "" },
                                  ])
                                }
                                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                              >
                                <Plus className="h-3 w-3" /> Add Benefit
                              </button>
                            </div>
                            <div className="space-y-3">
                              {productBenefits.map((benefit, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3"
                                >
                                  <select
                                    value={benefit.icon}
                                    onChange={(e) => {
                                      const u = [...productBenefits];
                                      u[idx].icon = e.target.value;
                                      setProductBenefits(u);
                                    }}
                                    className="appearance-none rounded-[1rem] h-12 border border-stone-200 bg-stone-50 font-bold w-16 text-center text-lg cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-950"
                                  >
                                    {[
                                      "✨",
                                      "💧",
                                      "🌿",
                                      "🛡️",
                                      "☀️",
                                      "🌸",
                                      "⚡",
                                      "🧪",
                                      "💖",
                                      "🥇",
                                      "🍓",
                                      "🥑",
                                    ].map((emoji) => (
                                      <option key={emoji} value={emoji}>
                                        {emoji}
                                      </option>
                                    ))}
                                  </select>
                                  <Input
                                    value={benefit.text}
                                    onChange={(e) => {
                                      const u = [...productBenefits];
                                      u[idx].text = e.target.value;
                                      setProductBenefits(u);
                                    }}
                                    className="rounded-[1rem] h-12 border-stone-200 bg-stone-50 font-bold px-5 flex-1"
                                    placeholder="e.g., 72h Hydration"
                                  />
                                  {productBenefits.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setProductBenefits(
                                          productBenefits.filter(
                                            (_, i) => i !== idx,
                                          ),
                                        )
                                      }
                                      className="h-12 w-12 flex items-center justify-center rounded-2xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 border border-stone-100 transition-all"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                              <h2 className={THEME.typography.micro.muted}>
                                FAQ
                              </h2>
                              <button
                                type="button"
                                onClick={() =>
                                  setProductFaq([
                                    ...productFaq,
                                    { q: "", a: "" },
                                  ])
                                }
                                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                              >
                                <Plus className="h-3 w-3" /> Add Question
                              </button>
                            </div>
                            <div className="space-y-4">
                              {productFaq.map((faqItem, idx) => (
                                <div
                                  key={idx}
                                  className="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 space-y-3 relative group"
                                >
                                  <Input
                                    value={faqItem.q}
                                    onChange={(e) => {
                                      const u = [...productFaq];
                                      u[idx].q = e.target.value;
                                      setProductFaq(u);
                                    }}
                                    className="rounded-[1rem] h-12 border-stone-200 bg-white font-bold px-5"
                                    placeholder="e.g., Is it suitable for sensitive skin?"
                                  />
                                  <textarea
                                    value={faqItem.a}
                                    onChange={(e) => {
                                      const u = [...productFaq];
                                      u[idx].a = e.target.value;
                                      setProductFaq(u);
                                    }}
                                    className="flex min-h-[72px] w-full rounded-[1rem] border border-stone-200 bg-white px-5 py-3 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 transition-all"
                                    placeholder="Answer..."
                                  />
                                  {productFaq.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setProductFaq(
                                          productFaq.filter(
                                            (_, i) => i !== idx,
                                          ),
                                        )
                                      }
                                      className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-span-4 space-y-8">
                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-5">
                            <h2
                              className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}
                            >
                              Product Media
                            </h2>
                            <div className="space-y-2">
                              <Label
                                className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                              >
                                Primary Image{" "}
                                <span className="text-rose-500">*</span>
                              </Label>
                              <div
                                onClick={() =>
                                  document
                                    .getElementById("primaryImageFP")
                                    .click()
                                }
                                className="relative h-52 rounded-[1.5rem] border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center cursor-pointer group hover:bg-white hover:border-emerald-500/30 transition-all overflow-hidden"
                              >
                                {imageFiles.primary ? (
                                  <>
                                    <img
                                      src={URL.createObjectURL(
                                        imageFiles.primary,
                                      )}
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="text-white text-[10px] font-black uppercase tracking-widest">
                                        Change Pending
                                      </span>
                                    </div>
                                  </>
                                ) : newProduct.existingImages &&
                                  newProduct.existingImages.length > 0 ? (
                                  <>
                                    <img
                                      src={getMediaUrl(
                                        newProduct.existingImages[0],
                                      )}
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-2 items-center justify-center transition-opacity">
                                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-indigo-950/80 px-3 py-1 rounded-full">
                                        Overwrite Image
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="h-8 w-8 text-stone-300 mb-3 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                      Upload Image
                                    </p>
                                    <p className="text-[8px] text-stone-300 mt-1 font-medium">
                                      Click to browse
                                    </p>
                                  </>
                                )}
                                <input
                                  id="primaryImageFP"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setImageFiles({
                                      ...imageFiles,
                                      primary: e.target.files[0],
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div
                                className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer"
                                onClick={() =>
                                  setHasMultipleImages(!hasMultipleImages)
                                }
                              >
                                <div
                                  className={cn(
                                    "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                    hasMultipleImages ||
                                      (newProduct.existingImages &&
                                        newProduct.existingImages.length > 1)
                                      ? "bg-indigo-950 border-indigo-950"
                                      : "bg-white border-stone-200",
                                  )}
                                >
                                  {(hasMultipleImages ||
                                    (newProduct.existingImages &&
                                      newProduct.existingImages.length >
                                        1)) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-950">
                                  Include Multiple Images
                                </span>
                              </div>
                              {(hasMultipleImages ||
                                (newProduct.existingImages &&
                                  newProduct.existingImages.length > 1)) && (
                                <div className="grid grid-cols-3 gap-3 animate-in fade-in">
                                  {/* Display existing supplementary images */}
                                  {newProduct.existingImages &&
                                    newProduct.existingImages
                                      .slice(1)
                                      .map((url, idx) => (
                                        <div
                                          key={`exist-${idx}`}
                                          className="aspect-square rounded-xl overflow-hidden relative group border border-stone-100 hover:border-indigo-400 transition-all"
                                        >
                                          <img
                                            src={getMediaUrl(url)}
                                            className="h-full w-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-[#1a0b2e]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-[8px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-1 rounded-sm">
                                              Existing
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  {imageFiles.additional.map((file, idx) => (
                                    <div
                                      key={idx}
                                      className="aspect-square rounded-xl overflow-hidden relative group border border-stone-100"
                                    >
                                      <img
                                        src={URL.createObjectURL(file)}
                                        className="h-full w-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const f = [...imageFiles.additional];
                                          f.splice(idx, 1);
                                          setImageFiles({
                                            ...imageFiles,
                                            additional: f,
                                          });
                                        }}
                                        className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  {imageFiles.additional.length +
                                    (newProduct.existingImages
                                      ? newProduct.existingImages.slice(1)
                                          .length
                                      : 0) <
                                    9 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        document
                                          .getElementById("additionalImagesFP")
                                          .click()
                                      }
                                      className="aspect-square rounded-xl border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center hover:bg-white hover:border-emerald-500/30 transition-all group"
                                    >
                                      <Plus className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>
                                  )}
                                  <input
                                    id="additionalImagesFP"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files);
                                      setImageFiles({
                                        ...imageFiles,
                                        additional: [
                                          ...imageFiles.additional,
                                          ...files,
                                        ],
                                      });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-5">
                            <h2
                              className={`${THEME.typography.micro.muted} border-b border-stone-100 pb-4`}
                            >
                              Pricing
                            </h2>
                            <div className="space-y-2">
                              <Label
                                className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                              >
                                Base Price (&#8377;)
                              </Label>
                              <Input
                                type="number"
                                required
                                value={newProduct.price}
                                onChange={(e) =>
                                  setNewProduct({
                                    ...newProduct,
                                    price: e.target.value,
                                  })
                                }
                                className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                              >
                                Discount Price (&#8377;)
                              </Label>
                              <Input
                                type="number"
                                value={newProduct.discountPrice || ""}
                                onChange={(e) =>
                                  setNewProduct({
                                    ...newProduct,
                                    discountPrice: e.target.value,
                                  })
                                }
                                className="rounded-[1.25rem] h-14 border-stone-200 bg-stone-50 font-bold px-6"
                                placeholder="Optional"
                              />
                            </div>
                          </div>

                          <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                              <h2 className={THEME.typography.micro.muted}>
                                Visibility Settings
                              </h2>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-0 border-stone-100 text-stone-400"
                              >
                                Storefront Protocols
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              {[
                                {
                                  id: "featured",
                                  label: "Feature on Homepage",
                                  sub: "High-visibility placement.",
                                  icon: Star,
                                  color: "text-amber-500",
                                  bg: "bg-amber-50",
                                },
                                {
                                  id: "newArrival",
                                  label: "Mark as New Arrival",
                                  sub: "Show in New Arrivals section.",
                                  icon: Sparkles,
                                  color: "text-blue-500",
                                  bg: "bg-blue-50",
                                },
                                {
                                  id: "bestSeller",
                                  label: "Mark as Best Seller",
                                  sub: "Top selling item tag.",
                                  icon: Trophy,
                                  color: "text-emerald-500",
                                  bg: "bg-emerald-50",
                                },
                                {
                                  id: "trending",
                                  label: "Mark as Trending",
                                  sub: "Currently popular item.",
                                  icon: TrendingUp,
                                  color: "text-rose-500",
                                  bg: "bg-rose-50",
                                },
                                {
                                  id: "rewardEligible",
                                  label: "Enable Reward Points",
                                  sub: "Incentivize via loyalty.",
                                  icon: Coins,
                                  color: "text-purple-500",
                                  bg: "bg-purple-50",
                                },
                                {
                                  id: "limitedOffer",
                                  label: "Set as Limited Offer",
                                  sub: "Urgency-driven placement.",
                                  icon: Clock,
                                  color: "text-orange-500",
                                  bg: "bg-orange-50",
                                },
                              ].map((flag) => {
                                const Icon = flag.icon;
                                const isActive = newProduct[flag.id];
                                return (
                                  <div
                                    key={flag.id}
                                    onClick={() =>
                                      setNewProduct({
                                        ...newProduct,
                                        [flag.id]: !newProduct[flag.id],
                                      })
                                    }
                                    className={cn(
                                      "group relative p-4 rounded-[1.25rem] border transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between",
                                      isActive
                                        ? "bg-indigo-950 border-indigo-900 shadow-md"
                                        : "bg-white border-stone-100 hover:border-stone-200",
                                    )}
                                  >
                                    {isActive && (
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                    )}
                                    <div className="flex items-center gap-4 relative z-10">
                                      <div
                                        className={cn(
                                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105",
                                          isActive
                                            ? "bg-white/10 text-white"
                                            : cn(flag.bg, flag.color),
                                        )}
                                      >
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p
                                          className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest leading-none transition-colors",
                                            isActive
                                              ? "text-white"
                                              : "text-stone-900",
                                          )}
                                        >
                                          {flag.label}
                                        </p>
                                        <p
                                          className={cn(
                                            "text-[8px] font-medium mt-1.5 uppercase tracking-tight transition-colors",
                                            isActive
                                              ? "text-indigo-300"
                                              : "text-stone-400",
                                          )}
                                        >
                                          {flag.sub}
                                        </p>
                                      </div>
                                    </div>
                                    <div
                                      className="relative z-10"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Switch
                                        checked={isActive}
                                        onCheckedChange={(val) =>
                                          setNewProduct({
                                            ...newProduct,
                                            [flag.id]: val,
                                          })
                                        }
                                        className={cn(
                                          "scale-75 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-200 border-none transition-all duration-500",
                                          isActive &&
                                            "ring-2 ring-emerald-500/20",
                                        )}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              onClick={() => navigate("/admin/inventory")}
                              variant="outline"
                              className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px] border-stone-200 hover:bg-stone-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading || !hasChanges}
                              className="flex-1 bg-indigo-950 text-white disabled:opacity-50 disabled:bg-stone-400 rounded-xl h-14 font-black uppercase tracking-widest text-[10px] hover:bg-[#1a0b2e] shadow-xl shadow-indigo-950/30 transition-all"
                            >
                              {loading
                                ? "Saving..."
                                : editingProductId
                                  ? "Save Changes"
                                  : "Add Product"}
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
        <DialogContent
          className={`sm:max-w-[1400px] w-[95vw] p-0 overflow-hidden border-none ${THEME.shadows.xl} ${THEME.colors.background.secondary}/50 backdrop-blur-xl ring-1 ring-indigo-900/5 ${THEME.borders.radius.xl}`}
        >
          <div className="sr-only">
            <DialogTitle>Customer Profile: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Detailed customer profile information including rewards, orders,
              and addresses.
            </DialogDescription>
          </div>
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md">
              <div className="flex flex-col items-center gap-6">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-stone-100 border-t-indigo-950 shadow-xl" />
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em] ">
                    Accessing Intel
                  </p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                    Decrypting User Node...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            selectedUser && (
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Premium Glass-Noir Header */}
                <header
                  className={`p-10 ${THEME.colors.background.accentSolid} text-white flex items-center justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10`}
                >
                  <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-emerald-500 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center gap-8">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">
                          {selectedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-indigo-900 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black tracking-[calc(-0.04em)] leading-tight">
                          {selectedUser.name}
                        </h2>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-2 py-0 text-[8px] uppercase tracking-widest">
                          Verified Tier 1
                        </Badge>
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
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-purple-900 text-white hover:bg-white hover:text-indigo-950 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300"
                    >
                      Export Dossier
                    </Button>
                    <Button
                      onClick={() => setIsDetailOpen(false)}
                      variant="ghost"
                      className="h-11 w-11 text-stone-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
                    >
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
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                            Transaction Credits
                          </p>
                          <CreditCard className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <p
                          className={`text-4xl ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}
                        >
                          {selectedUser.rewardPoints.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 mt-4 uppercase tracking-wide">
                          Ready for Settlement
                        </p>
                        <div className="absolute bottom-0 right-0 h-1.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                      </div>
                      <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                            Activity Events
                          </p>
                          <ShoppingCart className="h-5 w-5 text-stone-300 group-hover:text-indigo-950 transition-colors" />
                        </div>
                        <p
                          className={`text-4xl ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}
                        >
                          {selectedUser.orders?.length || 0}
                        </p>
                        <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">
                          Confirmed Shipments
                        </p>
                      </div>
                      <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                            Node Creation
                          </p>
                          <Calendar className="h-5 w-5 text-stone-300 group-hover:text-indigo-950 transition-colors" />
                        </div>
                        <p className="text-3xl font-black text-indigo-950 tracking-tighter leading-none mt-2">
                          {new Date(selectedUser.createdAt)
                            .toLocaleDateString(undefined, {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })
                            .toUpperCase()}
                        </p>
                        <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">
                          Active Since Epoch
                        </p>
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
                              <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                <Mail className="h-5 w-5" />
                              </div>
                              <div className="overflow-hidden space-y-0.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                  Primary Endpoint
                                </p>
                                <p className="text-sm font-bold text-indigo-950 truncate leading-tight">
                                  {selectedUser.email || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg hover:border-emerald-500/10 transition-all duration-300">
                              <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                <Phone className="h-5 w-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                  Mobile Terminal
                                </p>
                                <p className="text-sm font-bold text-indigo-950 leading-tight">
                                  {selectedUser.mobile}
                                </p>
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
                              <div
                                key={addr.id}
                                className="p-6 rounded-2xl border border-stone-100 bg-white shadow-sm group hover:border-emerald-500/20 hover:shadow-xl transition-all duration-300"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <Badge
                                    variant="secondary"
                                    className="text-[8px] font-black uppercase tracking-[0.15em] bg-stone-100 text-stone-500 border-none px-2 py-0.5"
                                  >
                                    {addr.label || "Home"}
                                  </Badge>
                                  <MapPin className="h-4 w-4 text-stone-200 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-sm font-black text-indigo-950 leading-tight">
                                  "{addr.line1}"
                                </p>
                                <p className="text-[11px] font-medium text-stone-400 mt-2 flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-stone-200" />
                                  {addr.city.toUpperCase()},{" "}
                                  {addr.state.toUpperCase()}
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
                                <TableHead className="px-8">
                                  Timestamp
                                </TableHead>
                                <TableHead className="px-8">
                                  Resolution
                                </TableHead>
                                <TableHead className="px-8 text-right">
                                  Credit Value
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedUser.orders?.length > 0 ? (
                                selectedUser.orders.map((order) => (
                                  <TableRow
                                    key={order.orderNumber}
                                    className="border-stone-50 h-[4.5rem] hover:bg-stone-50/20 transition-all group"
                                  >
                                    <TableCell className="px-8">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-black text-indigo-950 tracking-tighter group-hover:text-emerald-600 transition-colors">
                                          #{order.orderNumber}
                                        </span>
                                        <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">
                                          Master-Chain-UID
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-xs font-bold text-stone-400">
                                      {new Date(order.createdAt)
                                        .toLocaleDateString(undefined, {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                        .toUpperCase()}
                                    </TableCell>
                                    <TableCell className="px-8">
                                      <Badge
                                        className={cn(
                                          "rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none shadow-sm transition-all",
                                          order.status === "DELIVERED"
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                            : "bg-indigo-950 text-white shadow-indigo-950/20",
                                        )}
                                      >
                                        {order.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 text-right">
                                      <span className="text-lg font-black text-indigo-950 tracking-tighter">
                                        &#8377;
                                        {parseFloat(
                                          order.totalAmount,
                                        ).toLocaleString()}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="h-56 text-center text-stone-300 text-[11px] font-black uppercase tracking-[0.4em]"
                                  >
                                    Sector Archive Empty
                                  </TableCell>
                                </TableRow>
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
                    <Badge
                      variant="outline"
                      className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-lg px-3 py-1 uppercase tracking-widest"
                    >
                      End-to-End Encrypted Dossier
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setIsDetailOpen(false)}
                    className="bg-indigo-950 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-indigo-950/40"
                  >
                    Close Session
                  </Button>
                </footer>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Wide Vendor Dossier */}
      <Dialog open={isVendorDetailOpen} onOpenChange={setIsVendorDetailOpen}>
        <DialogContent
          className={`sm:max-w-[1400px] w-[95vw] p-0 overflow-hidden border-none ${THEME.shadows.xl} ${THEME.colors.background.secondary}/50 backdrop-blur-xl ring-1 ring-indigo-900/5 ${THEME.borders.radius.xl}`}
        >
          <div className="sr-only">
            <DialogTitle>
              Vendor Dossier: {selectedVendor?.businessName}
            </DialogTitle>
            <DialogDescription>
              Performance analytics, inventory status, and order registry for
              registered partners.
            </DialogDescription>
          </div>
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md">
              <div className="flex flex-col items-center gap-6">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-stone-100 border-t-indigo-950 shadow-xl" />
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.3em]">
                    Syncing Partner Node
                  </p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                    Accessing Ledger...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            selectedVendor && (
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Premium Glass-Noir Header */}
                <header
                  className={`p-10 ${THEME.colors.background.accentSolid} text-white flex items-center justify-between shrink-0 relative overflow-hidden ring-1 ring-white/10`}
                >
                  <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-blue-500 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center gap-8">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">
                          {selectedVendor.businessName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-indigo-900 flex items-center justify-center",
                          selectedVendor.approvalStatus === "APPROVED"
                            ? "bg-emerald-500"
                            : "bg-amber-500",
                        )}
                      >
                        <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black tracking-[calc(-0.04em)] leading-tight">
                          {selectedVendor.businessName}
                        </h2>
                        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black px-2 py-0 text-[8px] uppercase tracking-widest">
                          {selectedVendor.businessCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-stone-400">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-900" />
                          Protocol: VND-
                          {selectedVendor.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-purple-900">
                          Authority: {selectedVendor.contactNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-purple-900 text-white hover:bg-white hover:text-indigo-950 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300"
                    >
                      Audit Partner
                    </Button>
                    <Button
                      onClick={() => setIsVendorDetailOpen(false)}
                      variant="ghost"
                      className="h-11 w-11 text-stone-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </header>

                <ScrollArea className="flex-1 bg-white/40 backdrop-blur-sm">
                  <div className="p-10 space-y-12">
                    <div className="grid grid-cols-3 gap-8">
                      <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-500/10 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                            Gross Revenue
                          </p>
                          <DollarSign className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <p
                          className={`text-4xl ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}
                        >
                          &#8377;{selectedVendor.totalRevenue?.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 mt-4 uppercase tracking-wide">
                          Market Sales Yield
                        </p>
                        <div className="absolute bottom-0 right-0 h-1.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                      </div>
                      <div className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-blue-900/10 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                            Inventory Nodes
                          </p>
                          <Package className="h-5 w-5 text-stone-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p
                          className={`text-4xl ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}
                        >
                          {selectedVendor.products?.length || 0}
                        </p>
                        <p className="text-[11px] font-bold text-stone-400 mt-4 uppercase tracking-wide">
                          Live Catalog Items
                        </p>
                      </div>
                      <div className="p-8 bg-indigo-950 rounded-[2.5rem] shadow-2xl shadow-indigo-950/20 text-white relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                            Sales Events
                          </p>
                          <ShoppingCart className="h-5 w-5 text-stone-600 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter leading-none">
                          {selectedVendor.orders?.length || 0}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-400 mt-4 uppercase tracking-wide">
                          Orders Processed
                        </p>
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
                              <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-blue-500 transition-colors">
                                <Mail className="h-5 w-5" />
                              </div>
                              <div className="overflow-hidden space-y-0.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                  Administrative Contact
                                </p>
                                <p className="text-sm font-bold text-indigo-950 truncate leading-tight">
                                  {selectedVendor.email || "No Email"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                              <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                <Phone className="h-5 w-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                  Emergency Terminal
                                </p>
                                <p className="text-sm font-bold text-indigo-950 leading-tight">
                                  {selectedVendor.contactNumber}
                                </p>
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
                              <div
                                key={p.id}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-100 shadow-sm"
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-stone-50 text-[10px] font-black">
                                    {p.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-[11px] font-bold text-indigo-950 truncate tracking-tight">
                                    {p.name}
                                  </p>
                                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                    &#8377;
                                    {parseFloat(p.price).toLocaleString()}
                                  </p>
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
                            {selectedVendor.orders?.length || 0} SALES EVENT
                            SYNCED
                          </span>
                        </header>

                        <Table>
                          <TableHeader>
                            <TableRow className="border-stone-50 hover:bg-transparent">
                              <TableHead>Order ID</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead className="text-right">
                                Value
                              </TableHead>
                              <TableHead className="text-center">
                                Protocol Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedVendor.orders?.length > 0 ? (
                              selectedVendor.orders.map((order) => (
                                <TableRow
                                  key={order.orderNumber}
                                  className="border-stone-50/50 hover:bg-stone-50/50 transition-colors"
                                >
                                  <TableCell className="font-bold text-xs text-indigo-950">
                                    {order.orderNumber}
                                  </TableCell>
                                  <TableCell className="text-xs text-stone-500 font-medium">
                                    {order.customer.name}
                                  </TableCell>
                                  <TableCell className="text-right font-black text-xs text-indigo-950">
                                    &#8377;
                                    {parseFloat(
                                      order.totalAmount,
                                    ).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="secondary"
                                      className="bg-stone-100 text-[8px] font-black uppercase tracking-tighter px-2 border-none"
                                    >
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="h-40 text-center"
                                >
                                  <div className="flex flex-col items-center gap-2 opacity-20">
                                    <History className="h-8 w-8 text-stone-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                      Sector Archive Empty
                                    </p>
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
                    <Badge
                      variant="outline"
                      className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-lg px-3 py-1 uppercase tracking-widest"
                    >
                      Secure Merchant Node: Audit Link Active
                    </Badge>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setIsVendorDetailOpen(false)}
                      variant="outline"
                      className="font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-8 h-12 border-stone-200"
                    >
                      De-Authorize
                    </Button>
                    <Button
                      onClick={() => setIsVendorDetailOpen(false)}
                      className="bg-indigo-950 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-indigo-950/40"
                    >
                      Secure Session
                    </Button>
                  </div>
                </footer>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Offline Sale Registry */}
      <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] blur-2xl bg-emerald-500 rounded-full -mr-8 -mt-8" />
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-indigo-950 tracking-tighter uppercase">
              Record Manual Transmission
            </DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">
              Capture over-the-counter sales data for partner synchronization.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const selectedProd = manualOrderProducts.find(
                (p) => p.id === formData.get("productId"),
              );
              const payload = {
                vendorId: formData.get("vendorId"),
                mobile: formData.get("mobile"),
                amount:
                  parseFloat(formData.get("unitPrice")) *
                  parseInt(formData.get("quantity")),
                items: [
                  {
                    productId: formData.get("productId"),
                    name: selectedProd?.name || formData.get("itemName"),
                    quantity: parseInt(formData.get("quantity")),
                    unitPrice: parseFloat(formData.get("unitPrice")),
                  },
                ],
              };
              try {
                const resp = await fetch(`${API_URL}/admin/offline-ledgers`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (resp.ok) {
                  setIsManualOrderOpen(false);
                  fetchOfflineLedger();
                }
              } catch (err) {
                console.error(err);
              }
            }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em]">
                  Partner Merchant
                </Label>
                <select
                  name="vendorId"
                  required
                  className="w-full h-12 bg-stone-50 border-stone-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-950 transition-all outline-none"
                  onChange={async (e) => {
                    const vid = e.target.value;
                    if (!vid) {
                      setManualOrderProducts([]);
                      return;
                    }
                    try {
                      const resp = await fetch(
                        `${API_URL}/admin/vendors/${vid}`,
                      );
                      const data = await resp.json();
                      if (data.success)
                        setManualOrderProducts(data.data.products || []);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.businessName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em]">
                  Customer Terminal (Mobile)
                </Label>
                <Input
                  name="mobile"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="h-12 bg-stone-50 border-stone-100 rounded-xl px-4 text-sm font-bold shadow-none"
                />
              </div>
            </div>

            <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100 space-y-6">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
                Transmission Details
              </p>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">
                    Product Selector
                  </Label>
                  <select
                    name="productId"
                    required
                    className="w-full h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm px-3 outline-none"
                    onChange={(e) => {
                      const p = manualOrderProducts.find(
                        (prod) => prod.id === e.target.value,
                      );
                      if (p) {
                        const form = e.target.closest("form");
                        form.unitPrice.value = p.price;
                      }
                    }}
                  >
                    <option value="">Choose item...</option>
                    {manualOrderProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">
                    Qty
                  </Label>
                  <Input
                    name="quantity"
                    type="number"
                    defaultValue="1"
                    required
                    className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label className="text-[9px] font-bold text-stone-500 uppercase">
                    Unit Price
                  </Label>
                  <Input
                    name="unitPrice"
                    type="number"
                    placeholder="0.00"
                    required
                    className="h-10 bg-white border-none rounded-lg text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">
                  Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xl font-black text-indigo-950">
                    LIVE SESSION
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setIsManualOrderOpen(false)}
                  variant="ghost"
                  className="h-12 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest"
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  className="h-12 bg-indigo-950 hover:bg-[#1a0b2e] text-white rounded-xl px-12 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-950/20"
                >
                  Commit Sync
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Top Product Preview Modal */}
      {selectedTopProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedTopProduct(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-[90%] max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTopProduct(null)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4 text-stone-500" />
            </button>
            <div className="flex flex-col items-center mt-2">
              <div className="w-48 h-48 rounded-2xl bg-stone-50 border border-stone-100/50 mb-6 overflow-hidden flex items-center justify-center p-2">
                {selectedTopProduct.image ? (
                  <img
                    src={selectedTopProduct.image}
                    alt={selectedTopProduct.label}
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  />
                ) : (
                  <Package className="h-16 w-16 text-stone-300" />
                )}
              </div>
              <h3 className="text-xl font-bold text-indigo-950 text-center leading-tight mb-2">
                {selectedTopProduct.label}
              </h3>
              <div className="flex items-center gap-6 mt-4 bg-stone-50 px-8 py-3.5 rounded-2xl border border-stone-100">
                <div className="text-center">
                  <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                    Revenue
                  </span>
                  <span className="font-black text-indigo-950">
                    {formatMoney(selectedTopProduct.val)}
                  </span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                    Units Sold
                  </span>
                  <span className="font-black text-indigo-950">
                    {selectedTopProduct.qty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-stone-50/50 backdrop-blur-xl ring-1 ring-indigo-900/5">
          {detailLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-indigo-950" />
            </div>
          ) : (
            selectedOrder && (
              <div className="flex flex-col max-h-[90vh]">
                <header className="p-8 bg-indigo-950 text-white relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-indigo-500/20 to-transparent blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="flex justify-between items-start relative z-10 pr-12">
                    <div>
                      <Badge className="bg-white/10 text-white border-none text-[8px] font-semibold uppercase tracking-[0.2em] mb-3">
                        Transmission Protocol ID
                      </Badge>
                      <h2 className="text-2xl font-bold tracking-tight uppercase leading-none">
                        {selectedOrder.orderNumber}
                      </h2>
                      <p className="text-indigo-200/50 font-medium mt-2.5 text-xs">
                        {selectedOrder.type || "Online"} Commerce Channel •
                        Processed{" "}
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 font-bold text-[9px] px-4 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest shadow-lg shadow-emerald-950/20">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </header>

                <ScrollArea className="flex-1 p-8 h-full">
                  <div className="grid grid-cols-2 gap-8">
                    <section className="space-y-6">
                      <div>
                        <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-3">
                          Merchant Authority
                        </h3>
                        <div className="p-5 bg-white rounded-2xl border border-stone-100 flex items-center gap-4 group hover:border-indigo-200 transition-all shadow-sm">
                          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl border border-indigo-100">
                            {selectedOrder.vendor?.businessName?.charAt(0) ||
                              selectedOrder.vendorName?.charAt(0) ||
                              "M"}
                          </div>
                          <div>
                            <p className="font-bold text-indigo-950 text-lg leading-tight">
                              {selectedOrder.vendor?.businessName ||
                                selectedOrder.vendorName}
                            </p>
                            <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-widest mt-0.5">
                              Verified Partner Node
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-3">
                          Customer Segment
                        </h3>
                        <div className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
                          <p className="font-['Inter'] font-bold text-indigo-950 text-lg tracking-tight">
                            {selectedOrder.customer?.name ||
                              selectedOrder.customerName ||
                              "Direct Terminal walk-in"}
                          </p>
                          <p className="text-xs text-stone-500 font-medium mt-1">
                            {selectedOrder.customer?.mobile ||
                              selectedOrder.mobile}
                          </p>
                          {selectedOrder.shippingAddress && (
                            <div className="mt-5 pt-5 border-t border-stone-50">
                              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                                Terminal Destination
                              </p>
                              <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                                {selectedOrder.shippingAddress.line1},{" "}
                                {selectedOrder.shippingAddress.city}
                                <br />
                                {selectedOrder.shippingAddress.state} -{" "}
                                {selectedOrder.shippingAddress.postalCode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div>
                        <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-3">
                          Itemized Sync Registry
                        </h3>
                        <div className="space-y-2">
                          {selectedOrder.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-4 bg-white rounded-xl border border-stone-100 hover:border-indigo-100 transition-all shadow-sm"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-indigo-950">
                                  {item.name}
                                </span>
                                <span className="text-[9px] text-stone-400 font-medium uppercase tracking-widest mt-0.5">
                                  Quantity: {item.quantity} units
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-indigo-950 block text-sm">
                                  &#8377;
                                  {parseFloat(
                                    item.unitPrice ||
                                      item.lineTotal / item.quantity ||
                                      0,
                                  ).toLocaleString()}
                                </span>
                                <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 block">
                                  Market Rate
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-2 border-t border-dashed border-stone-100 space-y-3">
                        <div className="flex justify-between items-center text-stone-400 font-semibold text-[9px] uppercase tracking-widest px-1">
                          <span>Gross Subtotal</span>
                          <span className="text-stone-600 font-mono">
                            &#8377;
                            {parseFloat(
                              selectedOrder.subtotal ||
                                selectedOrder.totalAmount,
                            ).toLocaleString()}
                          </span>
                        </div>

                        {parseFloat(selectedOrder.discountAmount) > 0 && (
                          <div className="flex justify-between items-center text-amber-600 font-semibold text-[9px] uppercase tracking-widest px-1">
                            <span>System Discount</span>
                            <span className="font-mono">
                              - &#8377;
                              {parseFloat(
                                selectedOrder.discountAmount,
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {selectedOrder.rewardPointsUsed > 0 && (
                          <div className="flex justify-between items-center text-blue-600 font-semibold text-[9px] uppercase tracking-widest px-1">
                            <span>Loyalty Credits Applied</span>
                            <span className="font-mono">
                              - &#8377;
                              {selectedOrder.rewardPointsUsed.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="pt-5 flex justify-between items-end border-t border-stone-100">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                              Total Settlement
                            </span>
                            <span className="text-2xl font-mono font-bold text-indigo-950 tracking-tighter leading-none">
                              &#8377;
                              {parseFloat(
                                selectedOrder.totalAmount,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge className="bg-emerald-50 text-emerald-600 font-bold text-[8px] border-emerald-100 rounded-lg py-1.5 px-4 shadow-none uppercase tracking-[0.2em] mb-1.5">
                              Verified Sync
                            </Badge>
                            {selectedOrder.rewardPointsEarned > 0 && (
                              <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest">
                                + {selectedOrder.rewardPointsEarned} Credits
                                Accrued
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>

                <footer className="p-6 bg-white border-t border-stone-100 flex justify-center gap-4 shrink-0 mt-auto">
                  <Button
                    onClick={() => printThermalReceipt(selectedOrder)}
                    variant="outline"
                    className="rounded-xl px-8 h-12 font-bold uppercase tracking-[0.2em] text-[10px] border-stone-200 text-indigo-950 hover:bg-indigo-50 transition-all gap-2.5 shadow-sm hover:border-indigo-200 transition-all active:scale-95"
                  >
                    <Printer className="h-4 w-4" /> Print Audit Dossier
                  </Button>
                </footer>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
      {/* Add Direct Vendor Modal */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <form
            onSubmit={handleAddVendor}
            className="flex flex-col max-h-[90vh]"
          >
            <header className="p-10 bg-indigo-950 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl rounded-full -mr-12 -mt-12" />
              <div className="relative z-10">
                <h2 className={`${THEME.typography.headings.h2} tracking-tight uppercase leading-none`}>
                  Vendor Creation
                </h2>
                <p className="text-emerald-400 font-medium mt-3">
                  Register a new verified partner authority.
                </p>
              </div>
            </header>

            <ScrollArea className="flex-1 p-10 h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Vendor Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={newVendorData.businessName}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          businessName: e.target.value,
                        })
                      }
                      required
                      className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Owner Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={newVendorData.ownerName}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          ownerName: e.target.value,
                        })
                      }
                      required
                      className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Contact Number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={newVendorData.contactNumber}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          contactNumber: e.target.value,
                        })
                      }
                      required
                      className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={newVendorData.email}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          email: e.target.value,
                        })
                      }
                      className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Business Category <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Health & Beauty"
                      value={newVendorData.businessCategory}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          businessCategory: e.target.value,
                        })
                      }
                      required
                      className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">
                      Store Address <span className="text-rose-500">*</span>
                    </Label>
                    <textarea
                      value={newVendorData.storeAddress}
                      onChange={(e) =>
                        setNewVendorData({
                          ...newVendorData,
                          storeAddress: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g. 123 Main St, City, State, Zip"
                      className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <footer className="p-8 bg-stone-50 border-t border-stone-100 flex justify-end gap-4 shrink-0 mt-auto">
              <Button
                type="button"
                onClick={() => setIsAddVendorOpen(false)}
                variant="ghost"
                className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700"
              >
                Issue Authority
              </Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminDashboard;
