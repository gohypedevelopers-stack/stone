import { useState, useEffect, useMemo, useDeferredValue } from "react";
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
  Terminal,
  Navigation,
  NavigationOff,
  ShieldCheck,
  Ticket,
  User,
  Info,
  Zap,
<<<<<<< HEAD
  Key,
  AlertTriangle,
=======
  Download,
  LogOut,
  ChevronDown,
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
} from "lucide-react";
import { toast } from "sonner";
import AdminLogin from "./AdminLogin";

import { printThermalReceipt } from "@/utils/printReceipt";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


import CategoryManager from "@/components/CategoryManager";
import { VendorOfflineBilling } from "@/components/VendorOfflineBilling";
import { AdminCouponManager } from "@/components/AdminCouponManager";
import { PointsSettings } from "@/components/PointsSettings";
import PreOrderManager from "@/components/PreOrderManager";
import UpcomingDropsManager from "@/components/UpcomingDropsManager";

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
import { Spinner } from "@/components/ui/spinner";
import { API_URL, SERVER_URL } from "@/utils/api";

const AdminDashboardContent = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleResetVendorPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordVendor || !newVendorPassword) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors/${resetPasswordVendor.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newVendorPassword }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Password for ${resetPasswordVendor.businessName} updated.`);
        setResetPasswordVendor(null);
        setNewVendorPassword("");
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

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
  const [currentSlotEditing, setCurrentSlotEditing] = useState(null); // 'Deal 1' or 'Deal 2'
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [resetPasswordVendor, setResetPasswordVendor] = useState(null);
  const [newVendorPassword, setNewVendorPassword] = useState("");
  const [quickAddData, setQuickAddData] = useState({
    name: "",
    brand: "",
    categoryName: "",
    price: "",
    stock: "100",
    vendorId: "",
  });
  const [quickAddImage, setQuickAddImage] = useState(null);
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
    isPreOrder: false,
    releaseDate: "",
    ingredients: "",
    whyWeLoveIt: "",
    discountPrice: "",
    specialOfferType: "None",
    existingImages: [],
    onlineStock: "",
    vendors: [{ vendorId: "", stock: "" }],
    howToUse: "",
    additionalInfo: "",
  });
  const [productBenefits, setProductBenefits] = useState([
    { icon: "✨", text: "" },
  ]);
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [brands, setBrands] = useState([]);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);



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
      specialOfferType: p.specialOfferType || "None",
      ingredients: p.ingredients || "",
      whyWeLoveIt: p.whyWeLoveIt || "",
      discountPrice: p.discountPrice || "",
      onlineStock: p.onlineStock || "",
      existingImages: (p.imageUrls || []).filter(
        (img) => img && img.trim() !== "",
      ),
      vendors: p.bundledVendors
        ? p.bundledVendors.map((bv) => ({
            vendorId: bv.vendorId || bv.vendor?.id,
            stock: bv.stock || "",
            _existingId: bv.id,
          }))
        : [{ vendorId: p.vendorId, stock: p.stock || "", _existingId: p.id }],
      howToUse: p.howToUse || "",
      additionalInfo: p.additionalInfo || "",
    };
    setNewProduct(newProd);

    const ben =
      p.benefits && p.benefits.length > 0
        ? p.benefits
        : [{ icon: "✨", text: "" }];
    setProductBenefits(ben);
    setInitialProductState(JSON.stringify({ prod: newProd, ben }));
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
      onlineStock: "",
      vendors: [{ vendorId: "", stock: "" }],
      howToUse: "",
      additionalInfo: "",
    };
    setNewProduct(newProd);

    const ben = [{ icon: "✨", text: "" }];
    setProductBenefits(ben);
    setInitialProductState(JSON.stringify({ prod: newProd, ben }));
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
    const normalized = String(url).trim();

    if (
      normalized.startsWith("http://localhost:5000/") ||
      normalized.startsWith("https://localhost:5000/")
    ) {
      return normalized.replace(/^https?:\/\/localhost:5000/i, SERVER_URL);
    }

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }

    if (normalized.startsWith("/app/")) {
      return `${SERVER_URL}/uploads/${normalized.split("/").pop()}`;
    }

    return `${SERVER_URL}/${normalized.replace(/^\//, "")}`;
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
      // Always fetch products part of the global cache for detail fallbacks
      if (activeView !== "inventory" && products.length === 0) {
        fetchDataForView("inventory");
      }

      if (activeView === "inventory") {
        fetch(`${API_URL}/admin/vendors`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setVendors(d.data);
          });
      }
    } else {
      fetchStats();
      fetchDataForView("vendor-analytics");
      if (products.length === 0) {
        fetchDataForView("inventory");
      }
    }
  }, [activeView, selectedTimeRange]);

  const fetchCategories = async () => {
    try {
      const resp = await fetch(`${API_URL}/admin/categories`, {
        cache: "no-store",
      });
      const data = await resp.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const resp = await fetch(`${API_URL}/admin/brands`, {
        cache: "no-store",
      });
      const data = await resp.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  useEffect(() => {
    if (activeView === "inventory" || activeView === "add-product") {
      fetchCategories();
      fetchBrands();
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

  const fetchDataForView = async (viewName) => {
    setLoading(true);
    try {
      if (viewName === "vendor-analytics") {
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
          viewName === "inventory" || viewName === "special-offers"
            ? "products"
            : viewName === "orders" || viewName === "preorder-transactions"
              ? "orders"
              : viewName === "vendors"
                ? "vendors"
                : "customers";
        const resp = await fetch(`${API_URL}/admin/${endpoint}`);
        const data = await resp.json();
        if (data.success) {
          if (viewName === "inventory" || viewName === "special-offers")
            setProducts(data.data);
          else if (
            viewName === "orders" ||
            viewName === "preorder-transactions"
          )
            setOrders(data.data);
          else if (viewName === "vendors") setVendors(data.data);
          else if (viewName === "customers") setCustomers(data.data);
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

  const filteredProducts = useMemo(() => {
    // Exclude special offer products from the main inventory list to keep it focused on general catalog
    const baseList = groupedProducts.filter(
      (p) => !p.specialOfferType || p.specialOfferType === "None",
    );
    if (selectedCategory === "All") return baseList;
    return baseList.filter((p) => p.category?.name === selectedCategory);
  }, [groupedProducts, selectedCategory]);

  const deferredFilteredProducts = useDeferredValue(filteredProducts);

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
        onlineStock: Number(newProduct.onlineStock || 0),
        ingredients: newProduct.ingredients || null,
        whyWeLoveIt: newProduct.whyWeLoveIt || null,
        benefits:
          productBenefits.filter((b) => b.text.trim()).length > 0
            ? productBenefits.filter((b) => b.text.trim())
            : null,
        howToUse: newProduct.howToUse || null,
        additionalInfo: newProduct.additionalInfo || null,
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

  const handleUpdateSingleField = async (productId, updates) => {
    try {
      const resp = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Update successful");
        fetchDataForView("special-offers");
        fetchDataForView("inventory");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating product");
    }
  };

  const handleQuickAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (quickAddImage) {
        const formData = new FormData();
        formData.append("images", quickAddImage);
        const uploadResp = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResp.json();
        if (uploadData.success) {
          imageUrl = uploadData.data[0];
        }
      }

      // Auto-assign to "Online/Stone" vendor
      const autoVendorId =
        vendors.find((v) => v.businessName.toLowerCase().includes("stone"))
          ?.id || vendors[0]?.id;

      let payload = {
        ...quickAddData,
        vendorId: autoVendorId,
        price: Number(quickAddData.price),
        onlineStock: Number(quickAddData.stock),
        specialOfferType: currentSlotEditing,
        featured: true,
      };

      if (imageUrl) {
        payload.imageUrls = [imageUrl];
      }

      const method = quickAddData.id ? "PUT" : "POST";
      const url = quickAddData.id
        ? `${API_URL}/admin/products/${quickAddData.id}`
        : `${API_URL}/admin/products`;

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(
          quickAddData.id
            ? "Product updated successfully!"
            : "Product minted and assigned successfully!",
        );
        setIsQuickAddOpen(false);
        setQuickAddData({
          name: "",
          brand: "",
          categoryName: "",
          price: "",
          stock: "100",
          vendorId: "",
        });
        setQuickAddImage(null);
        fetchDataForView("special-offers");
        fetchDataForView("inventory");
      } else {
        toast.error(
          data.message ||
            (quickAddData.id
              ? "Failed to update product"
              : "Failed to create product"),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error in quick add sequence");
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
    return (
      <Card
        className={cn(
          "relative overflow-hidden group border border-[#151515]/5 transition-all duration-500 ease-out hover:-translate-y-1 rounded-[2px] cursor-pointer flex flex-col",
          "shadow-sm hover:shadow-[0_20px_40px_rgba(154,107,255,0.12)] bg-white",
        )}
      >
        {/* Animated Gradient Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 via-[#9a6bff] to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-20" />
        
        {/* Soft glowing ambient orb in the top right corner */}
        <div
          className={cn(
            "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-all duration-700 ease-in-out bg-[#9a6bff]"
          )}
        />

        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 relative z-20">
          <CardTitle className="text-[#151515]/40 font-black text-[10px] uppercase tracking-[0.2em] leading-tight flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-[2px] bg-stone-200 group-hover:bg-[#9a6bff] transition-colors duration-500" />
            {title}
          </CardTitle>
          <div
            className={cn(
              "p-2 rounded-[2px] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:bg-[#9a6bff]/10",
              "text-[#151515]/20 group-hover:text-[#9a6bff]"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.5} />
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-1 relative z-20">
          <div className="text-[36px] font-black leading-none tracking-tighter text-[#151515] transition-all duration-500 group-hover:text-[#9a6bff] group-hover:translate-x-1">
            {value}
          </div>
          {description && (
            <p className="text-[9px] text-[#151515]/40 font-bold leading-tight mt-2 uppercase tracking-widest truncate transition-all duration-500 group-hover:opacity-80">
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

  const RevenueReport = () => {
    const rawData = analyticsData?.graphData || [];
    const [hoverIndex, setHoverIndex] = useState(null);

    if (rawData.length === 0)
      return (
        <div className="h-72 w-full mt-6 bg-stone-50/50 rounded-xl animate-pulse" />
      );

    // Color definitions to match screenshot
    const COLORS = {
      earnings: "#6f42c1", // Purple
      expenses: "#fd7e14", // Orange
      invested: "#20c997", // Emerald/Green
    };

    const maxAmt = Math.max(
      ...rawData.map((d) =>
        Math.max(
          d.onlineAmount || 0,
          d.offlineAmount || 0,
          (d.onlineAmount || 0) * 0.4,
        ),
      ),
      1,
    );

    const getPoints = (data, field) =>
      data.map((d, i) => ({
        x: data.length > 1 ? (i / (data.length - 1)) * 100 : 50,
        y: 100 - ((d[field] || 0) / maxAmt) * 100,
      }));

    const earningsPoints = getPoints(rawData, "onlineAmount");
    const expensesPoints = getPoints(rawData, "offlineAmount");

    // Function to generate straight line path
    const getLinePath = (points) => {
      if (!points || points.length === 0) return "";
      let d = `M ${points[0].x},${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x},${points[i].y}`;
      }
      return d;
    };

    return (
      <div className="w-full h-80 mt-6 relative group/chart cursor-crosshair" onMouseLeave={() => setHoverIndex(null)}>
        <svg
          viewBox="0 -10 100 110"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          {/* Horizontal Grid */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Interaction Vertical Line */}
          {hoverIndex !== null && (
             <line 
                x1={rawData.length > 1 ? (hoverIndex / (rawData.length - 1)) * 100 : 50} 
                y1="-10" 
                x2={rawData.length > 1 ? (hoverIndex / (rawData.length - 1)) * 100 : 50} 
                y2="100" 
                stroke="#cbd5e1" 
                strokeDasharray="4,4" 
                strokeWidth="1" 
                vectorEffect="non-scaling-stroke"
             />
          )}

          {/* Paths */}

          <path
            d={getLinePath(expensesPoints)}
            fill="none"
            stroke={COLORS.expenses}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <path
            d={getLinePath(earningsPoints)}
            fill="none"
            stroke={COLORS.earnings}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            className="transition-all duration-1000"
          />

        </svg>

        {/* HTML Based X-Axis Labels to prevent text stretching */}
        <div className="absolute left-0 right-0 -bottom-6 h-5 pointer-events-none z-0">
          {rawData.map((d, i) => {
            const step = Math.max(1, Math.floor(rawData.length / 6));
            if (i % step !== 0 && i !== rawData.length - 1) return null;
            const x = rawData.length > 1 ? (i / (rawData.length - 1)) * 100 : 50;
            return (
              <div
                key={`html-label-${i}`}
                className="absolute text-[8px] font-bold text-stone-400/80 uppercase tracking-[0.15em] whitespace-nowrap"
                style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
              >
                {d.label}
              </div>
            );
          })}
        </div>

        {/* Hover Interaction Circles */}
        {rawData.map((d, i) => {
          const x = rawData.length > 1 ? (i / (rawData.length - 1)) * 100 : 50;
          const yOnline = 100 - ((d.onlineAmount || 0) / maxAmt) * 100;
          const yOffline = 100 - ((d.offlineAmount || 0) / maxAmt) * 100;

          return (
            <div
              key={`interact-${i}`}
              onMouseEnter={() => setHoverIndex(i)}
              className="absolute top-0 bottom-0 w-[5%] -ml-[2.5%] z-10"
              style={{ left: `${x}%` }}
            >
               {hoverIndex === i && (
                 <>
                  <div 
                    className="absolute w-2.5 h-2.5 rounded-full bg-white border-[3px] shadow-lg z-20 -ml-[5px]"
                    style={{ left: "50%", top: `${yOnline}%`, borderColor: COLORS.earnings }}
                  />
                  <div 
                    className="absolute w-2.5 h-2.5 rounded-full bg-white border-[3px] shadow-lg z-20 -ml-[5px]"
                    style={{ left: "50%", top: `${yOffline}%`, borderColor: COLORS.expenses }}
                  />
                 </>
               )}
            </div>
          );
        })}

        {/* Improved Dark Tooltip */}
        {hoverIndex !== null && (
          <div 
            className="absolute z-50 pointer-events-none transition-all duration-200"
            style={{ 
              left: `${rawData.length > 1 ? (hoverIndex / (rawData.length - 1)) * 100 : 50}%`,
              top: `${100 - ((rawData[hoverIndex].onlineAmount || 0) / maxAmt) * 100}%`,
              transform: "translate(-50%, -120%)"
            }}
          >
            <div className="bg-[#0f172a] text-white rounded-xl py-4 px-5 shadow-2xl relative min-w-[180px] border border-white/10 backdrop-blur-md">
               <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-between gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.earnings }} />
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Online</span>
                   </div>
                   <span className="text-xs font-black tabular-nums">{formatMoney(rawData[hoverIndex].onlineAmount)}</span>
                 </div>
                 
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.expenses }} />
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Offline</span>
                   </div>
                   <span className="text-xs font-black tabular-nums">{formatMoney(rawData[hoverIndex].offlineAmount)}</span>
                 </div>

                 <div className="h-px bg-white/10 my-1" />

                 <div className="flex items-center justify-between gap-4">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aggregate</span>
                   <span className="text-sm font-black text-[#9a6bff] tabular-nums">
                      {formatMoney((rawData[hoverIndex].onlineAmount || 0) + (rawData[hoverIndex].offlineAmount || 0))}
                   </span>
                 </div>
               </div>
               <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#0f172a]" />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && activeView === "overview")
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <div className="h-10 w-10 animate-spin rounded-xl border-4 border-stone-200 border-t-stone-900" />
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-transparent text-stone-900">
        <Sidebar className="border-r border-stone-200/60 bg-white/90 backdrop-blur-xl shadow-[18px_0_60px_rgba(15,23,42,0.04)]">
          <SidebarHeader className="p-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-gradient-to-br from-pink-500 via-[#9a6bff] to-indigo-500 text-white font-black text-lg shadow-lg shadow-[#9a6bff]/30">
                <span className="text-transparent bg-clip-text bg-white">O</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Inter'] font-black text-[#151515] leading-tight text-[15px] tracking-tighter">
                  OMW Dashboard
                </span>
                <span className="font-['Inter'] text-[9px] text-[#9a6bff] font-bold uppercase tracking-[0.2em]">
                  Platform Hub
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-3" data-lenis-prevent-wheel>
            <SidebarMenu className="mt-2 gap-1">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-300 group",
                      activeView === item.id
                        ? "bg-pink-50 text-pink-600 font-black shadow-sm shadow-pink-100/50"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-all",
                        activeView === item.id
                          ? "text-pink-600 scale-110"
                          : "text-stone-400 group-hover:text-pink-500",
                      )}
                    />
                    <span className="font-['Inter'] font-bold text-[13px] tracking-tight">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible
                defaultOpen={
                  activeView === "inventory" || activeView === "preorder"
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 w-full">
                      <Package className="h-[18px] w-[18px] text-stone-400 group-hover:text-pink-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">
                        Inventory
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "inventory"}
                          onClick={() => handleViewChange("inventory")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-xl transition-all duration-300 whitespace-nowrap",
                            activeView === "inventory"
                              ? "bg-pink-50 text-pink-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Products
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "categories"}
                          onClick={() => handleViewChange("categories")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-xl transition-all duration-300 whitespace-nowrap",
                            activeView === "categories"
                              ? "bg-pink-50 text-pink-600 font-bold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Manage Categories
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "preorder"}
                          onClick={() => handleViewChange("preorder")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                            activeView === "preorder"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Pre Order Products
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "upcoming-drops"}
                          onClick={() => handleViewChange("upcoming-drops")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-xl transition-all duration-200 whitespace-nowrap",
                            activeView === "upcoming-drops"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Upcoming Drops
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "special-offers"}
                          onClick={() => handleViewChange("special-offers")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-lg transition-all duration-200",
                            activeView === "special-offers"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "special-offers" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-pink-600 mr-2" />
                          )}
                          Special Offers
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "orders"}
                  onClick={() => handleViewChange("orders")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group",
                    activeView === "orders"
                      ? "!bg-pink-50 !text-pink-950 font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-pink-950",
                  )}
                >
                  <ShoppingCart
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      activeView === "orders"
                        ? "!text-pink-600"
                        : "text-stone-400 group-hover:text-pink-600",
                    )}
                  />
                  <span className="font-['Inter'] font-semibold text-[13px]">
                    Orders
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-pink-950 w-full">
                      <Users className="h-[18px] w-[18px] text-stone-400 group-hover:text-pink-600 transition-colors" />
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
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-xl transition-all duration-200",
                            activeView === "vendors"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendors" && (
                            <div className="h-1.5 w-1.5 rounded-xl bg-pink-600 mr-2" />
                          )}
                          Vendor Overview
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendor-analytics"}
                          onClick={() => handleViewChange("vendor-analytics")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-xl transition-all duration-200",
                            activeView === "vendor-analytics"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendor-analytics" && (
                            <div className="h-1.5 w-1.5 rounded-xl bg-pink-600 mr-2" />
                          )}
                          Vendor Analytics
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "offline-billing"}
                          onClick={() => handleViewChange("offline-billing")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-xl transition-all duration-200",
                            activeView === "offline-billing"
                              ? "bg-pink-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "offline-billing" && (
                            <div className="h-1.5 w-1.5 rounded-xl bg-pink-600 mr-2" />
                          )}
                          Offline Billing
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "coupons"}
                  onClick={() => handleViewChange("coupons")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 group",
                    activeView === "coupons"
                      ? "!bg-pink-50 !text-stone-900 font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <Ticket
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      activeView === "coupons"
                        ? "!text-pink-600"
                        : "text-stone-400 group-hover:text-pink-600",
                    )}
                  />
                  <span className="font-['Inter'] font-semibold text-[13px]">
                    Coupons
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {[
                { id: "customers", label: "Customers", icon: UserPlus },
                { id: "points", label: "Points", icon: Coins },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 py-5 px-4 rounded-xl transition-all duration-300 group",
                      activeView === item.id
                        ? "bg-pink-50 text-pink-600 font-black shadow-sm shadow-pink-100/50"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-all",
                        activeView === item.id
                          ? "text-pink-600 scale-110"
                          : "text-stone-400 group-hover:text-pink-500",
                      )}
                    />
                    <span className="font-['Inter'] font-bold text-[13px] tracking-tight">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-stone-100 flex-shrink-0 bg-white">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-500 group/logout font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-1" />
              Logout
            </button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col relative overflow-y-auto overflow-x-hidden z-0 bg-transparent" data-lenis-prevent data-lenis-prevent-wheel>
          <header className="h-[72px] bg-white/50 backdrop-blur-3xl px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50 border-b border-[#151515]/5 shadow-[0_10px_40px_rgba(154,107,255,0.03)] transition-all">
            {/* Left: Status & Sidebar Trigger */}
            <div className="flex items-center gap-6">
              <SidebarTrigger className="lg:hidden text-[#151515] hover:text-[#9a6bff] transition-colors" />
              <div className="hidden md:block">
                <div className="text-[9px] font-black text-[#9a6bff] uppercase tracking-[0.3em] opacity-80 mb-0.5">
                  Live System Clock
                </div>
                <div className="text-[13px] font-black text-[#151515] tracking-tight">
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
            <div className="hidden md:flex flex-1 max-w-lg mx-6 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-[14px] w-[14px] text-stone-400 group-focus-within:text-[#9a6bff] transition-colors" />
              </div>
              <Input
                placeholder="Global search protocol..."
                className="w-full bg-white/60 border border-[#151515]/10 focus-visible:ring-1 focus-visible:ring-[#9a6bff]/40 focus-visible:bg-white pl-10 h-10 rounded-[2px] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-stone-400 placeholder:text-[11px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest font-bold text-xs"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span className="text-[9px] font-black uppercase text-stone-400 tracking-widest bg-stone-100 px-2 py-1 rounded-[2px]">CMD+K</span>
              </div>
            </div>

            {/* Right: Actions & Notifications */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white border border-[#151515]/5 rounded-[2px] p-1 shadow-sm">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-[2px] text-stone-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10 transition-all relative group"
                >
                  <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-[2px] text-stone-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10 transition-all group"
                >
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform group-hover:rotate-45" />
                </Button>
              </div>

              <div className="h-6 w-px bg-[#151515]/10 hidden sm:block"></div>

              <Button className="hidden sm:flex bg-[#151515] text-white hover:bg-[#111] rounded-[2px] px-6 h-10 text-[10px] uppercase font-black tracking-[0.2em] shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Export Data
              </Button>
            </div>
          </header>

          <main className="flex-1 min-h-0 w-full px-6 py-8 lg:px-8 xl:px-10">
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10">
              {activeView === "homepage-categories" && <AdminHomepageCategories />}
              {activeView === "categories" && <CategoryManager />}
              {activeView === "offline-billing" && <VendorOfflineBilling />}
              {activeView === "points" && <PointsSettings />}
              {activeView === "coupons" && <AdminCouponManager />}
              {activeView === "overview" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                <header className="relative overflow-hidden rounded-[2px] bg-[#151515] p-10 md:p-14 shadow-2xl">
                  {/* Subtle Brand Gradient Glow Background */}
                  <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-500 via-[#9a6bff] to-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
                  
                  <div className="relative z-10 max-w-2xl">
                    <h1 className="text-[42px] font-black tracking-tighter leading-none mb-4 text-white">
                      Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9a6bff] to-pink-500">Overview</span>
                    </h1>
                    <p className="text-[#9a6bff] opacity-80 text-sm font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Sparkles className="h-4 w-4" /> Operations Hub
                    </p>
                    <p className="text-stone-400 font-medium text-sm md:text-base max-w-md leading-relaxed mt-4">
                      Holistic view of marketplace performance, vendor networking, and platform scale across all touchpoints.
                    </p>
                  </div>
                </header>

                {/* Stat Cards - High Density Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                  <StatCard
                    title="Gross Revenue"
                    value={formatMoney(stats?.totalEarnings || 0)}
                    icon={DollarSign}
                    colorClass="bg-[#9a6bff]/10 text-[#9a6bff]"
                    description="Aggregate cross-channel revenue"
                    trend="up"
                    trendValue="+12.5%"
                  />
                  <StatCard
                    title="Active Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCart}
                    colorClass="bg-purple-50 text-purple-600"
                    description="Current lifecycle transactions"
                    trend="up"
                    trendValue="+5.2%"
                  />
                  <StatCard
                    title="Growth Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    colorClass="bg-amber-50 text-amber-600"
                    description="New customer registrations"
                    trend="down"
                    trendValue="-1.2%"
                  />
                  <StatCard
                    title="Total Inventory"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                    colorClass="bg-blue-50 text-blue-600"
                    description="Active SKU count on cloud"
                    trend="up"
                    trendValue="+18.7%"
                  />
                </div>

                {/* Main Content Area - Grid for Chart & Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Revenue Report Chart Section */}
                  <Card className="xl:col-span-2 border border-[#151515]/5 shadow-sm hover:shadow-[0_20px_40px_rgba(154,107,255,0.12)] transition-all duration-500 ease-out p-8 rounded-[2px] bg-white flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Revenue Report</h2>
                      </div>
                      
                      <div className="flex items-center gap-12 flex-1 justify-center">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-3 w-3 rounded-[3px] bg-[#6f42c1]" />
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Online Sales</span>
                          </div>
                          <span className="text-xl font-black text-stone-900 tabular-nums">
                            {formatMoney(stats?.totalOnlineRevenue || 0).replace("₹", "")}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-3 w-3 rounded-[3px] bg-[#fd7e14]" />
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Offline Sales</span>
                          </div>
                          <span className="text-xl font-black text-stone-900 tabular-nums">
                             {formatMoney(stats?.totalOfflineRevenue || 0).replace("₹", "")}
                          </span>
                        </div>

                      </div>

                      <div className="relative group/sel">
                        <select 
                          value={selectedTimeRange}
                          onChange={(e) => setSelectedTimeRange(e.target.value)}
                          className="appearance-none bg-white border border-[#151515]/10 rounded-[2px] px-5 py-2.5 pr-10 text-[11px] font-black uppercase tracking-widest text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#9a6bff]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer transition-all hover:bg-stone-50"
                        >
                          <option value="7d">7 Days</option>
                          <option value="1m">1 Month</option>
                          <option value="1y">1 Year</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                      </div>
                    </div>
                    <RevenueReport />
                  </Card>

                  {/* Recent Activity Feed */}
                  <Card className="border border-[#151515]/5 shadow-sm hover:shadow-[0_20px_40px_rgba(154,107,255,0.12)] transition-all duration-500 ease-out p-8 rounded-[2px] bg-white flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-black text-[#151515]">Recent Activity</h2>
                      <Button variant="link" className="text-[#9a6bff] hover:text-[#7b51db] transition-colors font-bold text-[11px] uppercase tracking-wider p-0 h-auto">View All</Button>
                    </div>
                    
                    <ScrollArea className="h-[340px] pr-4 -mr-4">
                      <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-stone-100">
                        {(stats?.recentActivity?.length > 0 ? stats.recentActivity : [
                          { title: "System Ready", description: "Listening for new platform activity...", time: new Date().toISOString(), iconType: "activity" }
                        ]).map((act, idx) => {
                          const iconMap = {
                            cart: { icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
                            alert: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
                            user: { icon: UserPlus, color: "text-[#9a6bff]", bg: "bg-[#9a6bff]/10" },
                            activity: { icon: Activity, color: "text-[#9a6bff]", bg: "bg-[#9a6bff]/10" }
                          };
                          const iconObj = iconMap[act.iconType] || iconMap.activity;
                          
                          const diff = Math.floor((new Date() - new Date(act.time)) / 60000);
                          const timeStr = diff < 1 ? "Just now" : diff < 60 ? `${diff} min ago` : diff < 1440 ? `${Math.floor(diff/60)} hr ago` : `${Math.floor(diff/1440)} d ago`;

                          return (
                          <div key={act.id || idx} className="flex gap-4 relative group">
                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm ring-4 ring-white", iconObj.bg, iconObj.color)}>
                              <iconObj.icon className="h-3 w-3" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-black text-stone-900 group-hover:text-[#9a6bff] transition-colors">{act.title}</span>
                              <p className="text-[11px] text-stone-400 font-medium leading-relaxed mt-1">{act.description}</p>
                              <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-2">{timeStr}</span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                {/* Bottom Row - Best Selling Table */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                  <Card className="border border-[#151515]/5 shadow-sm hover:shadow-[0_20px_40px_rgba(154,107,255,0.12)] transition-all duration-500 ease-out p-8 bg-white overflow-hidden rounded-[2px]">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-xl font-black text-[#151515]">Best Selling Products</h2>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 block">Top performing SKUs from current catalog</span>
                      </div>
                      <Button variant="outline" className="rounded-[2px] border-[#151515]/10 font-bold text-xs h-10 px-6 transition-all hover:border-[#151515]/30">View Full Catalog</Button>
                    </div>

                    <div className="overflow-x-auto pb-2">
                      <Table className="min-w-[900px]">
                      <TableHeader className="bg-transparent border-b border-stone-100">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5">Product Details</TableHead>
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5">Category</TableHead>
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5">Price</TableHead>
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5">Total Sold</TableHead>
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5">Stock Status</TableHead>
                          <TableHead className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(filteredProducts || [])
                          .map((p) => {
                            const perf = analyticsData?.productPerformance?.find(pf => pf.label === p.name);
                            return { ...p, _totalSold: perf ? perf.qty : 0 };
                          })
                          .sort((a, b) => b._totalSold - a._totalSold)
                          .slice(0, 5)
                          .map((prod) => {
                            const totalSold = prod._totalSold;
                            const totalInventory = (prod.stock || 0) + totalSold;
                            const stockPercent = totalInventory === 0 ? 0 : Math.min(100, Math.floor(((prod.stock || 0) / totalInventory) * 100));
                            
                            return (
                              <TableRow key={prod._id || prod.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                                <TableCell className="py-6">
                                  <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-[2px] bg-stone-100 overflow-hidden shadow-sm flex items-center justify-center p-1 border border-stone-200/40 relative">
                                      {prod.images?.[0] || prod.imageUrls?.[0] ? (
                                        <img src={prod.images?.[0] || prod.imageUrls?.[0]} alt="" className="h-full w-full object-cover rounded-[1px] group-hover:scale-110 transition-transform duration-500" />
                                      ) : (
                                        <ImageIcon className="h-6 w-6 text-stone-300" />
                                      )}
                                      {prod.bestSeller && (
                                        <div className="absolute top-0 right-0 h-4 w-4 bg-amber-500 rounded-bl-[2px] flex items-center justify-center shadow-sm">
                                          <Star className="h-2 w-2 text-white fill-current" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col max-w-[220px] xl:max-w-[320px]">
                                      <span className="font-black text-stone-900 text-sm tracking-tight truncate" title={prod.name}>{prod.name}</span>
                                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1 truncate" title={prod.brand || "OMW Original"}>{prod.brand || "OMW Original"}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-[#151515]/5 text-[#151515]/70 hover:bg-[#151515]/10 border-none rounded-[2px] font-black text-[10px] py-1 px-3 uppercase tracking-wider">
                                    {prod.categoryName || prod.category?.name || "General"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-black text-stone-900 text-sm tabular-nums">₹{prod.price?.toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                    <span className="font-bold text-stone-700 text-xs">{totalSold} sales</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1.5 w-24">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-stone-400">
                                      <span>{prod.stock || 0} in stock</span>
                                      <span>{stockPercent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-stone-100 rounded-[2px] overflow-hidden">
                                      <div className="h-full bg-[#9a6bff] rounded-[2px] transition-all duration-1000" style={{ width: `${stockPercent}%` }}></div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button size="icon" variant="ghost" className="h-9 w-9 text-stone-400 hover:text-[#9a6bff] hover:bg-[#9a6bff]/10 rounded-[2px] transition-colors">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                        })}
                      </TableBody>
                    </Table>
                    </div>
                  </Card>
                </div>

                {stats?.pendingVendorApprovals > 0 && (
                  <Card className="bg-[#151515] text-white border border-[#9a6bff]/20 p-8 rounded-[2px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_20px_40px_rgba(154,107,255,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-[#9a6bff]" />
                    <div className="flex items-start lg:items-center gap-6 z-10 relative pl-4">
                      <div className="h-14 w-14 rounded-[2px] bg-[#9a6bff]/10 flex items-center justify-center text-pink-500 shadow-inner group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                          Critical Approvals Required
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                          </span>
                        </h3>
                        <p className="text-stone-400 text-xs md:text-sm mt-1.5 font-medium">
                          <strong className="text-white">{stats.pendingVendorApprovals}</strong> vendor profiles are
                          awaiting enterprise authorization to join the network.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewChange("vendors")}
                      className="bg-gradient-to-r from-[#9a6bff] to-pink-500 text-white font-black px-10 h-12 rounded-[2px] shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 uppercase tracking-widest text-[10px]"
                    >
                      <span className="relative z-10">Authorize Now</span>
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {/* View Logic for Inventory and Orders omitted for brevity as they haven't changed */}
            {/* Keeping full implementation for reliability */}

            {activeView === "preorder" && <PreOrderManager />}
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
                    <div className="group flex items-center bg-white hover:bg-stone-50 transition-all duration-300 rounded-xl border border-stone-100 hover:border-pink-200 hover:shadow-md px-3 py-1.5 w-fit cursor-pointer animate-in fade-in slide-in-from-right-2 h-14">
                      <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-stone-50 group-hover:bg-pink-50 transition-colors border border-stone-100 mr-3">
                        <Filter className="h-[14px] w-[14px] text-stone-400 group-hover:text-pink-600 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-1">
                        Category:
                      </span>
                      <div className="relative flex items-center min-w-[140px]">
                        <select
                          className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-2 pr-8 w-full hover:text-pink-600 transition-colors outline-none"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="All">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-stone-100 group-hover:bg-indigo-100 rounded-[2px] p-1 transition-colors">
                          <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-indigo-600 rotate-90 transition-transform" />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateProductClick}
                      className="bg-stone-900 text-white rounded-xl h-14 px-10 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-stone-900/10 hover:bg-[#ff4fa3] transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </header>

                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-stone-50">
                        <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                          <TableHead className="p-4 min-w-[220px]">
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
                          <TableHead className="p-4 text-center min-w-[120px]">
                            Retail (P)
                          </TableHead>
                          <TableHead className="p-4 text-center min-w-[120px]">
                            Online (O)
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
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                        onError={(event) => {
                                          event.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-bold">
                                        IMG
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0 max-w-[200px]">
                                    <div className="flex items-center gap-2">
                                      <p className="font-black text-stone-900 text-sm truncate">
                                        {p.name}
                                      </p>
                                      {p.specialOfferType &&
                                        p.specialOfferType !== "None" && (
                                          <Badge className="h-4 px-2 text-[7px] font-black uppercase tracking-tighter bg-indigo-950 text-white border-none rounded-[2px] shrink-0">
                                            {p.specialOfferType}
                                          </Badge>
                                        )}
                                    </div>
                                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest truncate mt-0.5">
                                      {(() => {
                                        const brand = p.brand || "OMW Skincare";
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
                              <TableCell className="p-4">
                                <Badge
                                  variant="outline"
                                  className="rounded-xl font-semibold text-[10px] uppercase tracking-wider border-stone-200 text-stone-500 bg-stone-50"
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
                                          className="rounded-xl text-[10px] text-stone-400"
                                        >
                                          None
                                        </Badge>
                                      );

                                    if (vendorsList.length === 1) {
                                      const bv = vendorsList[0];
                                      return (
                                        <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-100 rounded-xl px-2.5 py-1">
                                          <span className="text-[10px] font-black tracking-wide text-stone-900/80 truncate max-w-[90px]">
                                            {bv.vendor?.businessName ||
                                              "Unknown"}
                                          </span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex items-center gap-1.5 bg-pink-50/50 hover:bg-pink-100/50 transition-colors border border-pink-100/60 rounded-xl px-2.5 py-1">
                                        <span className="text-[10px] font-black tracking-wide text-pink-900 truncate max-w-[90px]">
                                          {vendorsList.length} Vendors
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </TableCell>
                              <TableCell className="p-4 text-right font-black text-stone-900">
                                &#8377;{Number(p.price).toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="p-4 text-center font-bold">
                                <span
                                  className={cn(
                                    p.stock < 10
                                      ? "text-rose-500"
                                      : "text-stone-600",
                                    "px-3 py-1 bg-stone-50 rounded-xl border border-stone-100",
                                  )}
                                >
                                  {p.stock}
                                </span>
                              </TableCell>
                              <TableCell className="p-4 text-center font-bold">
                                <span
                                  className={cn(
                                    p.onlineStock < 10
                                      ? "text-pink-500"
                                      : "text-emerald-600",
                                    "px-3 py-1 bg-pink-50/30 rounded-xl border border-pink-100/50 text-[10px]",
                                  )}
                                >
                                  {p.onlineStock}
                                </span>
                              </TableCell>
                              <TableCell className="p-4 text-center">
                                <Badge
                                  className={cn(
                                    "rounded-xl font-black px-3 border-none text-[9px] uppercase tracking-wider",
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
                                    className="p-2 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
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
            {activeView === "upcoming-drops" && <UpcomingDropsManager />}

            {activeView === "special-offers" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                <header className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1
                      className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.brand} pb-1`}
                    >
                      Special Offer Curation
                    </h1>
                    <p className={`${THEME.typography.micro.muted}`}>
                      Strategically manage featured checkout deals to maximize
                      order values.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-2 rounded-[2px] border border-indigo-100/50">
                    <div className="h-2 w-2 rounded-[2px] bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                      Live in Checkout
                    </span>
                  </div>
                </header>

                <div className="space-y-16">
                  {["Deal 1", "Deal 2", "Deal 3", "Deal 4"].map((slotName) => {
                    const slotProducts = products.filter(
                      (p) => p.specialOfferType === slotName,
                    );

                    return (
                      <div key={slotName} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                          <div
                            className={`h-11 w-11 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-200`}
                          >
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-sm font-black text-stone-900 uppercase tracking-[0.2em]">
                              {slotName}
                            </h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                              {slotProducts.length} Product
                              {slotProducts.length !== 1 ? "s" : ""} Active
                            </p>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-stone-100 to-transparent ml-4" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {slotProducts.map((deal) => (
                            <div
                              key={deal.id}
                              className="relative group/slot h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                            >
                              <div
                                className={`absolute -inset-1 bg-linear-to-r from-pink-500 to-purple-600 ${THEME.borders.radius.xl} blur opacity-5 group-hover/slot:opacity-20 transition duration-1000 group-hover/slot:duration-200`}
                              ></div>
                              <Card
                                className={`relative bg-white border border-stone-200/50 ${THEME.borders.radius.xl} overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1 flex flex-col p-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-pink-100 group/card`}
                              >
                                <div
                                  className={`aspect-16/10 w-full ${THEME.borders.radius.xl} overflow-hidden bg-stone-50 border border-stone-100/50 relative mb-3 group/img shrink-0`}
                                >
                                  <img
                                    src={
                                      deal.imageUrls?.[0]?.startsWith("http")
                                        ? deal.imageUrls[0]
                                        : `${API_URL.replace("/api", "")}${deal.imageUrls?.[0] || ""}` ||
                                          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
                                    }
                                    alt={deal.name}
                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                                  />
                                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                    <Button
                                      onClick={() => {
                                        setCurrentSlotEditing(
                                          deal.specialOfferType || slotName,
                                        );
                                        setQuickAddImage(null);
                                        setQuickAddData({
                                          id: deal.id,
                                          name: deal.name,
                                          brand: deal.brand || "",
                                          categoryName:
                                            typeof deal.category === "string"
                                              ? deal.category
                                              : deal.category?.name || "",
                                          price: deal.price,
                                          stock:
                                            deal.onlineStock ||
                                            deal.stock ||
                                            "100",
                                          vendorId: deal.vendorId || "",
                                          imageUrl: deal.imageUrls?.[0] || "",
                                        });
                                        setIsQuickAddOpen(true);
                                      }}
                                      className="h-8 px-4 rounded-[2px] bg-white shadow-lg text-indigo-600 hover:bg-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                                    >
                                      Edit Deal
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleUpdateSingleField(deal.id, {
                                          specialOfferType: "None",
                                        })
                                      }
                                      className="h-8 w-8 p-0 rounded-[2px] shadow-lg font-black bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:scale-105"
                                    >
                                      <Trash2 size={14} strokeWidth={3} />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-start justify-between gap-3 px-1.5 flex-1 pb-1">
                                  <h3 className="text-[13px] font-bold text-stone-900 leading-snug line-clamp-2">
                                    {deal.name}
                                  </h3>
                                  <div className="shrink-0 flex flex-col items-end pt-0.5">
                                    <span className="text-[15px] font-black text-[#00A382] leading-none">
                                      ₹{deal.price}
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          ))}

                          {/* Add New Slot card specific to THIS section */}
                          <div className="relative group/slot h-full flex flex-col animate-in zoom-in duration-500">
                            <Card
                              className={`relative bg-stone-50/30 border-stone-200/60 border-dashed border-2 ${THEME.borders.radius.xl} overflow-hidden flex-1 flex flex-col transition-all duration-300 hover:border-indigo-300 hover:bg-pink-50/10`}
                            >
                              <CardContent className="p-5 flex-1 flex flex-col items-center justify-center space-y-4">
                                <div
                                  onClick={() => {
                                    setCurrentSlotEditing(slotName);
                                    fetchDataForView("vendors");
                                    setQuickAddImage(null);
                                    setQuickAddData({
                                      name: "",
                                      brand: "",
                                      categoryName: "Special Offer",
                                      price: "",
                                      stock: "100",
                                      vendorId: "",
                                    });
                                    setIsQuickAddOpen(true);
                                  }}
                                  className={`h-12 w-12 ${THEME.borders.radius.xl} bg-white border border-stone-200 flex items-center justify-center group/add cursor-pointer hover:bg-pink-600 hover:border-pink-600 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 transition-all duration-300 shadow-sm`}
                                >
                                  <Plus className="h-5 w-5 text-stone-400 group-hover/add:text-white transition-colors" />
                                </div>
                                <div className="text-center w-full">
                                  <h4 className="text-[11px] font-black text-stone-900 uppercase tracking-widest">
                                    Assign to {slotName}
                                  </h4>
                                  <p className="text-[9px] font-medium text-stone-400 mt-1">
                                    Add another product to this slot
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-stone-50/80 border border-stone-100 rounded-[2px] p-6 flex items-start gap-4 shrink-0">
                  <div className="h-8 w-8 rounded-[2px] bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-900">
                      Advanced Slot Management
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-2xl">
                      Assigning a product to a slot in this interface will
                      automatically update the live storefront. Ensure your
                      featured deals have high-resolution images and clear
                      pricing to drive maximum conversion.
                    </p>
                  </div>
                </div>
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
                    <TabsList className="bg-stone-50 p-1.5 rounded-[2px] border border-stone-100 gap-2 h-auto w-fit">
                      <TabsTrigger
                        value="online"
                        className="rounded-xl px-10 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Online
                      </TabsTrigger>
                      <TabsTrigger
                        value="pre-order"
                        className="rounded-xl px-10 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Pre-Order
                      </TabsTrigger>
                      <TabsTrigger
                        value="offline"
                        className="rounded-xl px-10 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Offline
                      </TabsTrigger>
                    </TabsList>

                    {selectedOrderTab === "offline" && (
                      <div className="group flex items-center bg-stone-50/80 hover:bg-white transition-all duration-300 rounded-[2px] border border-stone-200/60 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 px-2 py-1.5 w-fit cursor-pointer animate-in fade-in slide-in-from-right-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-[2px] bg-white group-hover:bg-indigo-50 transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-stone-100 mr-3">
                          <Filter className="h-[14px] w-[14px] text-stone-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-1">
                          Origin Node:
                        </span>
                        <div className="relative flex items-center min-w-[140px]">
                          <select
                            className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-2 pr-8 w-full hover:text-pink-600 transition-colors outline-none"
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
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-stone-100 group-hover:bg-indigo-100 rounded-[2px] p-1 transition-colors">
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
                    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
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
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Destination
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
                                    <span className="text-sm font-black text-stone-900 tracking-tighter uppercase group-hover:text-amber-600 transition-colors">
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
                                  <TableCell className="px-8">
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-[2px] bg-amber-400 animate-pulse" />
                                      <span className="font-bold text-indigo-900/60 text-[10px] uppercase tracking-widest">
                                        {o.destination}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 text-right">
                                    <span className="font-mono font-bold text-stone-900 text-base">
                                      &#8377;
                                      {parseFloat(
                                        o.totalAmount,
                                      ).toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-xl px-3.5 py-1.5 ring-1 ring-amber-500/20">
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
                                        "text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-xl border-none shadow-sm",
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
                    value="pre-order"
                    className="animate-in slide-in-from-bottom-2 duration-500"
                  >
                    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
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
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Destination
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
                          ) : orders.filter((o) => o.type === "PreOrder")
                              .length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center p-24 text-stone-400 font-bold"
                              >
                                No active pre-order reservations found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders
                              .filter((o) => o.type === "PreOrder")
                              .map((o) => (
                                <TableRow
                                  key={o.id}
                                  onClick={() =>
                                    fetchOrderDetail(o.id, "PreOrder")
                                  }
                                  className="border-stone-50 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer group h-20"
                                >
                                  <TableCell className="px-8">
                                    <span className="text-sm font-black text-stone-900 tracking-tighter uppercase group-hover:text-purple-600 transition-colors">
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
                                  <TableCell className="px-8">
                                    <span className="font-bold text-indigo-900/40 text-[10px] uppercase tracking-widest bg-stone-100/50 px-2.5 py-1 rounded-xl border border-stone-200/50">
                                      {o.destination}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8 text-right">
                                    <span className="font-mono font-bold text-stone-900 text-base">
                                      &#8377;
                                      {parseFloat(
                                        o.totalAmount,
                                      ).toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 rounded-xl px-3.5 py-1.5 ring-1 ring-purple-500/20">
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
                                        "text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-xl border-none shadow-sm",
                                        "bg-purple-50 text-purple-600 ring-1 ring-purple-500/20",
                                      )}
                                    >
                                      RESERVATION
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
                    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2px] overflow-hidden bg-white">
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
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Registry
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
                                className="border-stone-50/50 h-[5.5rem] hover:bg-pink-50/20 transition-all duration-300 cursor-pointer group"
                              >
                                <TableCell className="px-8">
                                  <div className="flex flex-col">
                                    <Badge className="w-fit bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white text-[9px] font-mono font-black uppercase tracking-widest rounded-[2px] px-2.5 py-1.5 transition-all shadow-sm border border-slate-200 group-hover:border-indigo-600">
                                      {o.orderNumber}
                                    </Badge>
                                    <span className="text-[8px] font-mono font-black text-slate-300 uppercase tracking-widest mt-2 ml-0.5">
                                      REF_PROTO_ID
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8">
                                  <div className="flex flex-col">
                                    <span className="text-base font-black text-stone-900 tracking-tight group-hover:text-amber-600 transition-colors">
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
                                    <span className="text-2xl font-mono font-black text-stone-900 tracking-tighter group-hover:scale-105 transition-transform origin-right">
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
                                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-xl px-3.5 py-1.5 ring-1 ring-amber-500/20 shadow-sm border border-amber-100 group-hover:scale-110 transition-transform">
                                    <Coins className="h-3.5 w-3.5" />
                                    <span className="text-xs font-black">
                                      {o.rewardPointsEarned || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 text-center">
                                  <Badge className="bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-all">
                                    <div className="h-1.5 w-1.5 bg-slate-300 group-hover:bg-emerald-500 rounded-xl mr-2.5 transition-colors" />
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
                    className="rounded-xl h-14 px-8 shadow-2xl shadow-stone-900/40 hover:bg-[#1a0b2e] font-black uppercase tracking-widest text-[10px] bg-stone-900 text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <UserPlus className="h-4 w-4" /> Add Direct Vendor
                  </Button>
                </header>

                <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden bg-white">
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
                                  "rounded-xl font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none shadow-sm flex items-center gap-2 w-fit mx-auto",
                                  v.approvalStatus === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
                                    : v.approvalStatus === "PENDING"
                                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                                      : "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-xl animate-pulse",
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setResetPasswordVendor(v)}
                                  className="h-8 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-[2px]"
                                  title="Reset Password"
                                >
                                  <Key className="h-3.5 w-3.5" />
                                </Button>
                                {v.approvalStatus === "PENDING" && (
                                  <Button
                                    size="sm"
                                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl"
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                      Vendor Analytics
                    </h1>
                    <p className="text-sm font-medium text-stone-500 mt-2">
                      Cross-sector sales performance and revenue intelligence.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {/* Time Filter */}
                    <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-xl border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                        Range:
                      </span>
                      <div className="relative flex items-center min-w-[100px]">
                        <select
                          className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-pink-600 outline-none truncate"
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
                          <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-pink-600 transition-colors rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Vendor Filter */}
                    <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-xl border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                        Source:
                      </span>
                      <div className="relative flex items-center min-w-[130px]">
                        <select
                          className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-pink-600 outline-none truncate"
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
                          <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-pink-600 transition-colors rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
                        +14.2%
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Total Sale Units
                    </p>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                      {analyticsData?.totalSaleUnits >= 1000
                        ? (analyticsData.totalSaleUnits / 1000).toFixed(1) + "K"
                        : analyticsData?.totalSaleUnits || 0}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Consolidated volume across all verified partner nodes.
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
                        +8.7%
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Gross Revenue
                    </p>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                      {formatMoney(analyticsData?.grossRevenue || 0)}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Total market value processed through secure enterprise
                      channels.
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <Badge className="bg-pink-50 text-pink-600 border-none font-bold text-[9px]">
                        PEAK
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Platform Earnings
                    </p>
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                      {formatMoney(analyticsData?.platformEarnings || 0)}
                    </h2>
                    <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                      Net marketplace yield after partner settlement protocol.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <Card className="col-span-8 p-10 rounded-xl border border-stone-100/40 shadow-sm bg-white overflow-hidden relative group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-xl bg-emerald-500" />
                        Revenue Distribution
                      </h3>
                    </div>

                    <RevenueReport />
                  </Card>

                  <Card className="col-span-4 p-10 rounded-xl border border-stone-100/40 shadow-sm bg-white overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-xl bg-blue-500" />
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
                                <span className="text-xs font-bold text-stone-900 truncate max-w-[65%] group-hover/item:text-blue-600 transition-colors">
                                  {s.label}
                                </span>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-stone-900 block">
                                    {formatMoney(s.val)}
                                  </span>
                                  <span className="text-[9px] font-semibold text-stone-400">
                                    {s.qty} units
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-stone-50 rounded-xl overflow-hidden">
                                <div
                                  className="h-full bg-stone-900 rounded-xl transition-all duration-1000 ease-out group-hover/item:bg-blue-500 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
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

                <Card className="border-none shadow-sm rounded-xl overflow-hidden">
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
                                className="rounded-xl font-black text-purple-900 bg-stone-50 border-stone-100"
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
                          <div
                            className={`bg-stone-50/80 backdrop-blur-sm ${THEME.borders.radius.lg} border border-stone-100 shadow-sm p-10 space-y-8 transition-all hover:shadow-md group/card`}
                          >
                            <div className="flex items-center justify-between border-b border-stone-200/60 pb-6">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`h-10 w-10 ${THEME.borders.radius.sm} bg-stone-900 flex items-center justify-center shadow-lg shadow-indigo-900/20`}
                                >
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
                                    Product Core details
                                  </h2>
                                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                    Primary identity & classification
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="rounded-xl border-stone-200 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white"
                              >
                                Required Node
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
                              <div className="col-span-3 space-y-2">
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
                                  className={`${THEME.borders.radius.lg} h-14 border-stone-200 bg-stone-50 font-bold px-6 focus:ring-stone-900 transition-all`}
                                  placeholder="e.g., Hydra Barrier Serum"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label
                                    className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                  >
                                    Brand
                                  </Label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setIsAddingNewBrand(!isAddingNewBrand)
                                    }
                                    className="text-[10px] font-black uppercase tracking-wider text-pink-600 hover:text-indigo-800 transition-colors px-1"
                                  >
                                    {isAddingNewBrand
                                      ? "Select Existing"
                                      : "+ Add New"}
                                  </button>
                                </div>
                                <div className="relative">
                                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                    <Package className="h-4 w-4 text-stone-400" />
                                  </div>
                                  {isAddingNewBrand ? (
                                    <Input
                                      required
                                      value={newProduct.brand}
                                      onChange={(e) =>
                                        setNewProduct({
                                          ...newProduct,
                                          brand: e.target.value,
                                        })
                                      }
                                      className={`${THEME.borders.radius.lg} h-14 border-stone-200 bg-stone-50 font-bold pl-14 pr-6 focus:ring-stone-900 transition-all`}
                                      placeholder="Brand name..."
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <select
                                        required
                                        value={newProduct.brand}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            brand: e.target.value,
                                          })
                                        }
                                        className={`w-full ${THEME.borders.radius.lg} h-14 border border-stone-200 bg-stone-50 font-bold pl-14 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all text-sm`}
                                      >
                                        <option value="" disabled>
                                          Select Brand
                                        </option>
                                        {brands.map((b) => (
                                          <option key={b} value={b}>
                                            {b}
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
                                    </>
                                  )}
                                </div>
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
                                    className="text-[10px] font-black uppercase tracking-wider text-pink-600 hover:text-indigo-800 transition-colors px-1"
                                  >
                                    {isAddingNewCategory
                                      ? "Select Existing"
                                      : "+ Add New"}
                                  </button>
                                </div>
                                <div className="relative">
                                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                    <LayoutTemplate className="h-4 w-4 text-stone-400" />
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
                                      className={`${THEME.borders.radius.lg} h-14 border-stone-200 bg-stone-50 font-bold pl-14 pr-6 focus:ring-stone-900 transition-all`}
                                      placeholder="Category name..."
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <select
                                        required
                                        value={newProduct.categoryName}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            categoryName: e.target.value,
                                          })
                                        }
                                        className={`w-full ${THEME.borders.radius.lg} h-14 border border-stone-200 bg-stone-50 font-bold pl-14 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all text-sm`}
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
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Online Available Stock
                                </Label>
                                <div className="relative">
                                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                    <ShoppingCart className="h-4 w-4 text-stone-400" />
                                  </div>
                                  <Input
                                    type="number"
                                    value={newProduct.onlineStock || ""}
                                    onChange={(e) =>
                                      setNewProduct({
                                        ...newProduct,
                                        onlineStock: e.target.value,
                                      })
                                    }
                                    className={`${THEME.borders.radius.lg} h-14 border-stone-200 bg-stone-50 font-bold pl-14 pr-6 focus:ring-stone-900 transition-all`}
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div className="col-span-3 space-y-4">
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
                                    className={`h-8 px-4 text-[10px] uppercase font-black tracking-wider text-indigo-900 bg-pink-50 border border-pink-100 hover:bg-pink-100 ${THEME.borders.radius.sm} transition-all flex items-center gap-1.5`}
                                  >
                                    <Plus className="h-3 w-3" /> Add Vendor
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {newProduct.vendors.map((v, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center gap-3 bg-stone-50 p-2.5 ${THEME.borders.radius.md} border border-stone-200 shadow-sm`}
                                    >
                                      <div className="relative flex-1">
                                        <select
                                          required
                                          className={`w-full h-12 ${THEME.borders.radius.sm} bg-transparent px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none transition-all`}
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
                                          type="text"
                                          inputMode="numeric"
                                          required
                                          value={v.stock || ""}
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
                                          className="rounded-xl h-12 border-0 bg-white shadow-sm font-black text-stone-900 pl-12 pr-4"
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
                                  Special Offer Category
                                </Label>
                                <div className="relative">
                                  <select
                                    value={
                                      newProduct.specialOfferType || "None"
                                    }
                                    onChange={(e) =>
                                      setNewProduct({
                                        ...newProduct,
                                        specialOfferType: e.target.value,
                                      })
                                    }
                                    className={`w-full ${THEME.borders.radius.lg} h-14 border border-stone-200 bg-stone-50 font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all text-sm`}
                                  >
                                    <option value="None">
                                      Standard Product (None)
                                    </option>
                                    <option value="Deal 1">
                                      Special Deal 1 (Checkout)
                                    </option>
                                    <option value="Deal 2">
                                      Special Deal 2 (Checkout)
                                    </option>
                                  </select>
                                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
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
                                  className={`${THEME.borders.radius.lg} h-14 border-stone-200 bg-stone-50 font-bold px-6 focus:ring-stone-900 transition-all`}
                                  placeholder="Hydrating, Korea, Glow"
                                />
                              </div>
                              <div className="col-span-3 bg-white rounded-xl border border-stone-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
                                <div className="p-8 border-b border-stone-50 bg-stone-50/30">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-stone-900 flex items-center justify-center shadow-lg shadow-stone-900/20">
                                      <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
                                        Product Intelligence
                                      </h2>
                                      <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                        Detailed formulation & feature analysis
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Accordion
                                  type="single"
                                  collapsible
                                  className="w-full"
                                >
                                  {/* DESCRIPTION */}
                                  <AccordionItem
                                    value="description"
                                    className="border-stone-50 px-8"
                                  >
                                    <AccordionTrigger className="hover:no-underline py-6">
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-600">
                                        Description
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8">
                                      <textarea
                                        required
                                        value={newProduct.description}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            description: e.target.value,
                                          })
                                        }
                                        className="flex min-h-[150px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                        placeholder="Enter comprehensive product story..."
                                      />
                                    </AccordionContent>
                                  </AccordionItem>

                                  {/* HOW TO USE */}
                                  <AccordionItem
                                    value="how-to-use"
                                    className="border-stone-50 px-8"
                                  >
                                    <AccordionTrigger className="hover:no-underline py-6">
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-600">
                                        How to Use
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8">
                                      <textarea
                                        value={newProduct.howToUse}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            howToUse: e.target.value,
                                          })
                                        }
                                        className="flex min-h-[150px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                        placeholder="Step-by-step application protocol..."
                                      />
                                    </AccordionContent>
                                  </AccordionItem>

                                  {/* BENEFITS */}
                                  <AccordionItem
                                    value="benefits"
                                    className="border-stone-50 px-8"
                                  >
                                    <AccordionTrigger className="hover:no-underline py-6">
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-600">
                                        Benefits
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8 space-y-6">
                                      <textarea
                                        value={newProduct.whyWeLoveIt}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            whyWeLoveIt: e.target.value,
                                          })
                                        }
                                        className="flex min-h-[120px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                        placeholder="Summary of primary skin outcomes..."
                                      />

                                      <div className="pt-4 border-t border-stone-100">
                                        <div className="flex items-center justify-between mb-4">
                                          <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 italic">
                                            Structured High-Level Benefits
                                          </h4>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setProductBenefits([
                                                ...productBenefits,
                                                { icon: "✨", text: "" },
                                              ])
                                            }
                                            className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 bg-emerald-50/50 px-3 py-1 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                          >
                                            <Plus className="h-3 w-3" /> Add
                                            Outcome
                                          </button>
                                        </div>
                                        <div className="space-y-3">
                                          {productBenefits.map(
                                            (benefit, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-center gap-3"
                                              >
                                                <select
                                                  value={benefit.icon}
                                                  onChange={(e) => {
                                                    const u = [
                                                      ...productBenefits,
                                                    ];
                                                    u[idx].icon =
                                                      e.target.value;
                                                    setProductBenefits(u);
                                                  }}
                                                  className="appearance-none rounded-xl h-12 border border-stone-200 bg-stone-50 font-bold w-16 text-center text-lg cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900"
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
                                                    <option
                                                      key={emoji}
                                                      value={emoji}
                                                    >
                                                      {emoji}
                                                    </option>
                                                  ))}
                                                </select>
                                                <Input
                                                  value={benefit.text}
                                                  onChange={(e) => {
                                                    const u = [
                                                      ...productBenefits,
                                                    ];
                                                    u[idx].text =
                                                      e.target.value;
                                                    setProductBenefits(u);
                                                  }}
                                                  className="rounded-xl h-12 border-stone-200 bg-stone-50 font-bold px-5 flex-1 focus:ring-stone-900 transition-all"
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
                                                    className="h-12 w-12 flex items-center justify-center rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 border border-stone-100 transition-all"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </button>
                                                )}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>

                                  {/* INGREDIENTS */}
                                  <AccordionItem
                                    value="ingredients"
                                    className="border-stone-50 px-8"
                                  >
                                    <AccordionTrigger className="hover:no-underline py-6">
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-600">
                                        Ingredients
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8">
                                      <textarea
                                        value={newProduct.ingredients}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            ingredients: e.target.value,
                                          })
                                        }
                                        className="flex min-h-[150px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                        placeholder="Full formulation list (INCI format)..."
                                      />
                                    </AccordionContent>
                                  </AccordionItem>

                                  {/* INFO */}
                                  <AccordionItem
                                    value="info"
                                    className="border-none px-8"
                                  >
                                    <AccordionTrigger className="hover:no-underline py-6">
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-600">
                                        Info
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8">
                                      <textarea
                                        value={newProduct.additionalInfo}
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            additionalInfo: e.target.value,
                                          })
                                        }
                                        className="flex min-h-[150px] w-full rounded-xl border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                        placeholder="Regulatory details, pH level, shelf life etc..."
                                      />
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            </div>
                          </div>

                          <div className="bg-stone-50/80 backdrop-blur-sm rounded-xl border border-stone-100 shadow-sm p-10 space-y-8 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between border-b border-stone-200/60 pb-6">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                  <Star className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-900">
                                    Visibility Protocol
                                  </h2>
                                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                    Storefront placement & status
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-0 border-stone-200 text-stone-400 bg-white rounded-xl"
                              >
                                Active States
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                      "group relative p-4 border transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between",
                                      THEME.borders.radius.md,
                                      isActive
                                        ? "bg-stone-900 border-indigo-900 shadow-md"
                                        : "bg-white border-stone-100 hover:border-stone-200",
                                    )}
                                  >
                                    {isActive && (
                                      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
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
                        </div>

                        {/* Right Column */}
                        <div className="col-span-4 space-y-8">
                          <div className="bg-stone-50/80 backdrop-blur-sm rounded-xl border border-stone-100 shadow-sm p-10 space-y-8 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4 border-b border-stone-200/60 pb-6">
                              <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <ImageIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-900">
                                  Product Media
                                </h2>
                                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                  Visual assets & gallery
                                </p>
                              </div>
                            </div>
                            <div className="space-y-6">
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
                                className="relative h-52 rounded-xl border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center cursor-pointer group hover:bg-white hover:border-emerald-500/30 transition-all overflow-hidden"
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
                                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-stone-900/80 px-3 py-1 rounded-xl">
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
                                className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer"
                                onClick={() =>
                                  setHasMultipleImages(!hasMultipleImages)
                                }
                              >
                                <div
                                  className={cn(
                                    "h-5 w-5 border-2 flex items-center justify-center transition-all",
                                    THEME.borders.radius.sm,
                                    hasMultipleImages ||
                                      (newProduct.existingImages &&
                                        newProduct.existingImages.length > 1)
                                      ? "bg-stone-900 border-stone-900"
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">
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
                                            <span className="text-white text-[8px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-1 rounded-[2px]">
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
                                      className={`aspect-square ${THEME.borders.radius.md} border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center hover:bg-white hover:border-emerald-500/30 transition-all group`}
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

                          <div
                            className={`bg-stone-50/80 backdrop-blur-sm ${THEME.borders.radius.lg} border border-stone-100 shadow-sm p-10 space-y-8 transition-all hover:shadow-md`}
                          >
                            <div className="flex items-center gap-4 border-b border-stone-200/60 pb-6">
                              <div
                                className={`h-10 w-10 ${THEME.borders.radius.sm} bg-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-700/20`}
                              >
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900">
                                  Pricing Matrix
                                </h2>
                                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                  Financial configuration
                                </p>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label
                                  className={`${THEME.typography.micro.default} ${THEME.colors.text.primary} ml-1`}
                                >
                                  Base Price (&#8377;)
                                </Label>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  required
                                  value={newProduct.price || ""}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      price: e.target.value,
                                    })
                                  }
                                  className="rounded-xl h-14 border-stone-200 bg-white font-bold px-6 focus:ring-stone-900 transition-all"
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
                                  type="text"
                                  inputMode="numeric"
                                  value={newProduct.discountPrice || ""}
                                  onChange={(e) =>
                                    setNewProduct({
                                      ...newProduct,
                                      discountPrice: e.target.value,
                                    })
                                  }
                                  className="rounded-xl h-14 border-stone-200 bg-white font-bold px-6 focus:ring-stone-900 transition-all"
                                  placeholder="Optional"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <Button
                          type="button"
                          onClick={() => navigate("/admin/inventory")}
                          variant="outline"
                          className={`flex-1 ${THEME.borders.radius.lg} h-16 font-black uppercase tracking-widest text-[10px] border-stone-200 hover:bg-stone-50 transition-all`}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !hasChanges}
                          className={`flex-[2] bg-stone-900 text-white disabled:opacity-50 disabled:bg-stone-400 ${THEME.borders.radius.lg} h-16 font-black uppercase tracking-widest text-[10px] hover:bg-[#1a0b2e] shadow-2xl shadow-stone-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]`}
                        >
                          {loading
                            ? "Saving..."
                            : editingProductId
                              ? "Update Product Record"
                              : "Initialize Add Sequence"}
                        </Button>
                      </div>
                    </form>
                  </div>
                );
              })()}
            </div>
          </main>
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
                  <div
                    className={`h-12 w-12 animate-spin ${THEME.borders.radius.sm} border-[3px] border-stone-100 border-t-stone-900 shadow-xl`}
                  />
                  <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.3em] ">
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
                    <div
                      className={`absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-emerald-500 ${THEME.borders.radius.sm} -mr-16 -mt-16`}
                    />
                    <div className="relative z-10 flex items-center gap-8">
                      <div className="relative group">
                        <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                          <AvatarFallback className="bg-linear-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">
                            {selectedUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 ${THEME.borders.radius.sm} border-4 border-indigo-900 flex items-center justify-center`}
                        >
                          <div
                            className={`h-1.5 w-1.5 bg-white ${THEME.borders.radius.sm} animate-pulse`}
                          />
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
                            <span
                              className={`h-1.5 w-1.5 ${THEME.borders.radius.sm} bg-purple-900`}
                            />
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
                        className={`h-11 ${THEME.borders.radius.sm} border-purple-900 text-white hover:bg-white hover:text-stone-900 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300`}
                      >
                        Export Dossier
                      </Button>
                      <Button
                        onClick={() => setIsDetailOpen(false)}
                        variant="ghost"
                        className={`h-11 w-11 text-stone-400 hover:text-white ${THEME.borders.radius.sm} bg-white/5 border border-white/5 hover:border-white/20 transition-all`}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </header>

                  <ScrollArea className="flex-1 bg-white/40 backdrop-blur-sm">
                    <div className="p-10 space-y-12">
                      {/* Top Line Analytics Grid */}
                      <div className="grid grid-cols-3 gap-8">
                        <div className="p-8 bg-white rounded-[2px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-500/10 transition-all duration-500">
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
                        <div className="p-8 bg-white rounded-[2px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Activity Events
                            </p>
                            <ShoppingCart className="h-5 w-5 text-stone-300 group-hover:text-stone-900 transition-colors" />
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
                        <div className="p-8 bg-white rounded-[2px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-950/10 transition-all duration-500">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Node Creation
                            </p>
                            <Calendar className="h-5 w-5 text-stone-300 group-hover:text-stone-900 transition-colors" />
                          </div>
                          <p className="text-3xl font-black text-stone-900 tracking-tighter leading-none mt-2">
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
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
                              Identity Access
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center gap-5 p-5 ${THEME.borders.radius.sm} bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg hover:border-emerald-500/10 transition-all duration-300">
                                <div className="h-11 w-11 ${THEME.borders.radius.sm} bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <div className="overflow-hidden space-y-0.5">
                                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                    Primary Endpoint
                                  </p>
                                  <p className="text-sm font-bold text-stone-900 truncate leading-tight">
                                    {selectedUser.email || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-5 p-5 ${THEME.borders.radius.sm} bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg hover:border-emerald-500/10 transition-all duration-300">
                                <div className="h-11 w-11 ${THEME.borders.radius.sm} bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                  <Phone className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                    Mobile Terminal
                                  </p>
                                  <p className="text-sm font-bold text-stone-900 leading-tight">
                                    {selectedUser.mobile}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
                              Logistics Ledger
                            </h3>
                            <div className="space-y-4">
                              {selectedUser.addresses
                                ?.slice(0, 2)
                                .map((addr) => (
                                  <div
                                    key={addr.id}
                                    className="p-6 rounded-xl border border-stone-100 bg-white shadow-sm group hover:border-emerald-500/20 hover:shadow-xl transition-all duration-300"
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
                                    <p className="text-sm font-black text-stone-900 leading-tight">
                                      "{addr.line1}"
                                    </p>
                                    <p className="text-[11px] font-medium text-stone-400 mt-2 flex items-center gap-2">
                                      <span className="h-1 w-1 rounded-xl bg-stone-200" />
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
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
                              Transmission Registry
                            </h3>
                            <span className="text-[9px] font-black text-emerald-600 px-4 py-1.5 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100">
                              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-xl animate-pulse" />
                              {selectedUser.orders?.length || 0} EVENTS SYNCED
                            </span>
                          </header>

                          <div className="overflow-hidden rounded-xl border border-stone-100 shadow-xl bg-white">
                            <Table>
                              <TableHeader className="bg-stone-50/50">
                                <TableRow className="border-stone-100 hover:bg-transparent h-14">
                                  <TableHead className="px-8">
                                    Order ID
                                  </TableHead>
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
                                          <span className="text-sm font-black text-stone-900 tracking-tighter group-hover:text-emerald-600 transition-colors">
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
                                            "rounded-xl font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none shadow-sm transition-all",
                                            order.status === "DELIVERED"
                                              ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                              : "bg-stone-900 text-white shadow-stone-900/20",
                                          )}
                                        >
                                          {order.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="px-8 text-right">
                                        <span className="text-lg font-black text-stone-900 tracking-tighter">
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
                        className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-xl px-3 py-1 uppercase tracking-widest"
                      >
                        End-to-End Encrypted Dossier
                      </Badge>
                    </div>
                    <Button
                      onClick={() => setIsDetailOpen(false)}
                      className="bg-stone-900 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-stone-900/40"
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
                  <div className="h-12 w-12 animate-spin rounded-xl border-[3px] border-stone-100 border-t-stone-900 shadow-xl" />
                  <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-stone-900 uppercase tracking-[0.3em]">
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
                    <div className="absolute top-0 right-0 p-16 opacity-10 blur-3xl bg-blue-500 rounded-xl -mr-16 -mt-16" />
                    <div className="relative z-10 flex items-center gap-8">
                      <div className="relative group">
                        <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                          <AvatarFallback className="bg-linear-to-br from-indigo-900 to-[#0b0314] text-white font-black text-2xl">
                            {selectedVendor.businessName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 h-6 w-6 rounded-xl border-4 border-indigo-900 flex items-center justify-center",
                            selectedVendor.approvalStatus === "APPROVED"
                              ? "bg-emerald-500"
                              : "bg-amber-500",
                          )}
                        >
                          <div className="h-1.5 w-1.5 bg-white rounded-xl animate-pulse" />
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
                            <span className="h-1.5 w-1.5 rounded-xl bg-purple-900" />
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
                        className="h-11 rounded-xl border-purple-900 text-white hover:bg-white hover:text-stone-900 bg-transparent text-[10px] font-black uppercase tracking-[0.2em] px-8 transition-all duration-300"
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
                        <div className="p-8 bg-white rounded-[2px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-500/10 transition-all duration-500">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                              Gross Revenue
                            </p>
                            <DollarSign className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <p
                            className={`text-4xl ${THEME.typography.weights.heavy} bg-clip-text text-transparent ${THEME.gradients.brand} tracking-tighter leading-none`}
                          >
                            &#8377;
                            {selectedVendor.totalRevenue?.toLocaleString()}
                          </p>
                          <p className="text-[11px] font-bold text-emerald-600 mt-4 uppercase tracking-wide">
                            Market Sales Yield
                          </p>
                          <div className="absolute bottom-0 right-0 h-1.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                        </div>
                        <div className="p-8 bg-white rounded-[2px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-blue-900/10 transition-all duration-500">
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
                        <div className="p-8 bg-indigo-950 rounded-[2px] shadow-2xl shadow-indigo-950/20 text-white relative overflow-hidden group">
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
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
                              Merchant Intelligence
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center gap-5 p-5 rounded-xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-blue-500 transition-colors">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <div className="overflow-hidden space-y-0.5">
                                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                    Administrative Contact
                                  </p>
                                  <p className="text-sm font-bold text-stone-900 truncate leading-tight">
                                    {selectedVendor.email || "No Email"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-5 p-5 rounded-xl bg-stone-50 border border-stone-100/50 group hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-emerald-500 transition-colors">
                                  <Phone className="h-5 w-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                                    Emergency Terminal
                                  </p>
                                  <p className="text-sm font-bold text-stone-900 leading-tight">
                                    {selectedVendor.contactNumber}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
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
                                    <p className="text-[11px] font-bold text-stone-900 truncate tracking-tight">
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
                            <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.4em] flex items-center gap-4">
                              <span className="h-px w-8 bg-stone-900" />
                              Sales Transmission Registry
                            </h3>
                            <span className="text-[9px] font-black text-emerald-600 px-4 py-1.5 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100">
                              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-xl animate-pulse" />
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
                                    <TableCell className="font-bold text-xs text-stone-900">
                                      {order.orderNumber}
                                    </TableCell>
                                    <TableCell className="text-xs text-stone-500 font-medium">
                                      {order.customer.name}
                                    </TableCell>
                                    <TableCell className="text-right font-black text-xs text-stone-900">
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
                        className="bg-white border-stone-200 text-stone-400 font-black text-[8px] rounded-xl px-3 py-1 uppercase tracking-widest"
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
                        className="bg-stone-900 hover:bg-[#1a0b2e] font-black uppercase tracking-[0.2em] text-[10px] rounded-xl px-12 h-12 shadow-2xl shadow-stone-900/40"
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
          <DialogContent className="sm:max-w-2xl rounded-[2px] p-10 border-none shadow-2xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] blur-2xl bg-emerald-500 rounded-[2px] -mr-8 -mt-8" />
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black text-stone-900 tracking-tighter uppercase">
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
                  <Label className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">
                    Partner Merchant
                  </Label>
                  <select
                    name="vendorId"
                    required
                    className="w-full h-12 bg-stone-50 border-stone-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-stone-900 transition-all outline-none"
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
                  <Label className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">
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

              <div className="p-8 bg-stone-50 rounded-[2px] border border-stone-100 space-y-6">
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
                      className="w-full h-10 bg-white border-none rounded-xl text-xs font-bold shadow-sm px-3 outline-none"
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
                      className="h-10 bg-white border-none rounded-xl text-xs font-bold shadow-sm"
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
                      className="h-10 bg-white border-none rounded-xl text-xs font-bold shadow-sm"
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
                    <div className="h-2 w-2 rounded-xl bg-emerald-500 animate-pulse" />
                    <span className="text-xl font-black text-stone-900">
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
                    className="h-12 bg-stone-900 hover:bg-[#1a0b2e] text-white rounded-xl px-12 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-stone-900/20"
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
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedTopProduct(null)}
          >
            <div
              className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTopProduct(null)}
                className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
              <div className="flex flex-col items-center mt-2">
                <div className="w-48 h-48 rounded-xl bg-stone-50 border border-stone-100/50 mb-6 overflow-hidden flex items-center justify-center p-2">
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
                <h3 className="text-xl font-bold text-stone-900 text-center leading-tight mb-2">
                  {selectedTopProduct.label}
                </h3>
                <div className="flex items-center gap-6 mt-4 bg-stone-50 px-8 py-3.5 rounded-xl border border-stone-100">
                  <div className="text-center">
                    <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                      Revenue
                    </span>
                    <span className="font-black text-stone-900">
                      {formatMoney(selectedTopProduct.val)}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-stone-200" />
                  <div className="text-center">
                    <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
                      Units Sold
                    </span>
                    <span className="font-black text-stone-900">
                      {selectedTopProduct.qty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
          <DialogContent className="sm:max-w-6xl rounded-xl p-0 overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.4)] bg-stone-50/50 backdrop-blur-3xl ring-1 ring-white/10">
            <DialogHeader className="sr-only">
              <DialogTitle>
                Order Detail: {selectedOrder?.orderNumber || "Loading..."}
              </DialogTitle>
              <DialogDescription>
                Complete transaction intelligence and fulfillment tracking.
              </DialogDescription>
            </DialogHeader>
            {detailLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-xl border-4 border-stone-200 border-t-stone-900" />
              </div>
            ) : (
              selectedOrder && (
                <div className="flex flex-col max-h-[90vh]">
                  <header className="p-10 bg-gradient-to-br from-indigo-950 via-[#0a0a0c] to-indigo-900 text-white relative overflow-hidden shrink-0 border-b border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-64 bg-indigo-500/10 blur-[150px] rounded-[2px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 p-32 bg-amber-500/5 blur-[80px] rounded-[2px] -ml-16 -mb-16" />
                    <div className="flex justify-between items-end relative z-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Badge
                            className={cn(
                              "text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 border-none rounded-[2px] shadow-lg",
                              selectedOrder.status === "DELIVERED"
                                ? "bg-emerald-500 text-white"
                                : "bg-pink-600 text-white",
                            )}
                          >
                            {selectedOrder.status}
                          </Badge>
                          <div className="h-px w-8 bg-white/20" />
                          <span className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.4em] drop-shadow-md">
                            {selectedOrder.type || "Online"} PROTOCOL
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em] mb-1">
                            Transaction Node ID
                          </p>
                          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
                            {selectedOrder.orderNumber}
                          </h2>
                        </div>
                        <div className="flex items-center gap-8 text-white/50 font-black text-[11px] uppercase tracking-[0.3em] mt-8 bg-white/5 backdrop-blur-md px-6 py-3 rounded-[2px] border border-white/10 inline-flex shadow-inner">
                          <span className="flex items-center gap-2.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(
                              selectedOrder.createdAt,
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <div className="h-3 w-px bg-white/10" />
                          <span className="flex items-center gap-2.5">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(
                              selectedOrder.createdAt,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2px] border border-white/10 shadow-2xl ring-1 ring-white/5">
                          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">
                            Settlement Quantum
                          </p>
                          <p className="text-5xl font-mono font-black text-white leading-none tracking-tighter flex items-start gap-2">
                            <span className="text-2xl text-pink-500 mt-1">
                              &#8377;
                            </span>
                            {parseFloat(
                              selectedOrder.totalAmount,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </header>

                  <ScrollArea className="flex-1 h-full bg-stone-50/50">
                    <div className="grid grid-cols-12 border-b border-stone-200">
                      <section className="col-span-12 lg:col-span-6 p-12 space-y-12">
                        <div>
                          <h3 className="text-[10px] font-black text-stone-900/40 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                            <span className="h-px w-6 bg-stone-900/10" />
                            Customer Identity & Destination Profile
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-white p-6 rounded-[2px] border border-stone-100 shadow-sm transition-all hover:shadow-md">
                              <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-indigo-600 rounded-[2px]" />
                                Operational Identity
                              </h4>
                              <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-inner">
                                  <User className="h-7 w-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-stone-900 truncate uppercase tracking-tight">
                                    {selectedOrder.customer?.name ||
                                      "Anonymous Terminal"}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {selectedOrder.customer?.mobile || "N/A"}
                                    </span>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {selectedOrder.customer?.email ||
                                        "NOT_ASSIGNED"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {(selectedOrder.shippingAddress ||
                              (selectedOrder.customer?.addresses &&
                                selectedOrder.customer.addresses.length >
                                  0)) && (
                              <div className="bg-stone-900 p-6 rounded-xl text-white shadow-2xl shadow-stone-900/20 relative overflow-hidden group border border-white/5">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Navigation className="h-16 w-16 rotate-12" />
                                </div>
                                <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-[2px] animate-pulse" />
                                  Shipping Protocol
                                </h4>
                                {(() => {
                                  const addr =
                                    selectedOrder.shippingAddress ||
                                    selectedOrder.customer?.addresses?.[0];
                                  return (
                                    <div className="relative z-10">
                                      <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight text-white/80">
                                        {addr.line1}
                                        <br />
                                        {addr.line2 && (
                                          <>
                                            {addr.line2}
                                            <br />
                                          </>
                                        )}
                                        {addr.city}, {addr.state}
                                        <br />
                                        {addr.postalCode} | {addr.country}
                                      </p>
                                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                          Verified Destination
                                        </span>
                                        {!selectedOrder.shippingAddress && (
                                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/20">
                                            Registry Default
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-[10px] font-black text-stone-900/40 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                            <span className="h-px w-6 bg-stone-900/10" />
                            Settlement Summary
                          </h3>
                          <div className="p-8 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-5">
                            <div className="space-y-3 pb-5 border-b border-stone-50">
                              <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                                <span>Transaction Subtotal</span>
                                <span className="text-stone-900 font-mono text-xs">
                                  &#8377;
                                  {parseFloat(
                                    selectedOrder.subtotal ||
                                      selectedOrder.totalAmount,
                                  ).toLocaleString()}
                                </span>
                              </div>

                              {parseFloat(selectedOrder.discountAmount) > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">
                                  <span>Platform Incentive</span>
                                  <span className="font-mono text-xs">
                                    - &#8377;
                                    {parseFloat(
                                      selectedOrder.discountAmount,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}

                              {selectedOrder.rewardPointsUsed > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-pink-600 uppercase tracking-widest leading-none">
                                  <span>Loyalty Redemption</span>
                                  <span className="font-mono text-xs">
                                    - &#8377;
                                    {selectedOrder.rewardPointsUsed.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-end pt-2">
                              <div>
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">
                                  Final Settlement
                                </p>
                                <p className="text-[10px] font-bold text-stone-900 uppercase">
                                  Balance Paid
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-stone-900 tracking-tighter">
                                  &#8377;
                                  {parseFloat(
                                    selectedOrder.totalAmount,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="col-span-12 lg:col-span-6 p-12 bg-white/40 backdrop-blur-3xl border-l border-stone-200 shadow-2xl relative z-10">
                        <div className="space-y-10">
                          <h3 className="text-[11px] font-black text-stone-900/40 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                            <span className="h-px w-10 bg-stone-900/20" />
                            Inventory Allocation Overview
                          </h3>

                          <div className="space-y-6">
                            {selectedOrder.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex gap-6 p-6 bg-white rounded-xl border border-stone-100 hover:border-[#d1408e]/30 transition-all duration-300 group shadow-sm hover:shadow-xl"
                              >
                                <div className="h-28 w-28 bg-stone-50 rounded-xl border border-stone-100 overflow-hidden flex items-center justify-center relative p-3 shrink-0">
                                  {(() => {
                                    const fallbackProduct = (
                                      groupedProducts || []
                                    ).find(
                                      (p) =>
                                        p.name?.toLowerCase() ===
                                          item.name?.toLowerCase() ||
                                        p.name
                                          ?.toLowerCase()
                                          .includes(item.name?.toLowerCase()) ||
                                        item.name
                                          ?.toLowerCase()
                                          .includes(p.name?.toLowerCase()),
                                    );
                                    const linkedProduct =
                                      item.product || fallbackProduct;
                                    const imgUrl =
                                      linkedProduct?.imageUrls?.[0] ||
                                      item.imageUrl ||
                                      item.image;

                                    if (imgUrl) {
                                      return (
                                        <img
                                          src={getMediaUrl(imgUrl)}
                                          alt={item.name}
                                          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                        />
                                      );
                                    }
                                    return (
                                      <div className="flex flex-col items-center justify-center text-stone-300">
                                        <Package className="h-8 w-8 mb-2" />
                                        <span className="text-[7px] font-black uppercase tracking-widest text-stone-400 text-center">
                                          Unlinked
                                        </span>
                                      </div>
                                    );
                                  })()}
                                  <div className="absolute top-1.5 right-1.5 bg-indigo-950 text-white text-[11px] font-black px-2.5 py-1 rounded-[2px] shadow-2xl z-20">
                                    {item.quantity}
                                  </div>
                                </div>

                                <div className="flex-1 py-1 flex flex-col justify-between">
                                  <div className="space-y-1.5">
                                    <h4 className="text-md font-black text-stone-900 uppercase tracking-tight leading-tight group-hover:text-[#d1408e] transition-colors">
                                      {item.name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded-[2px]">
                                        REF:{" "}
                                        {item.productId?.slice(0, 8) ||
                                          "MANUAL"}
                                      </p>
                                      {(() => {
                                        const fallbackProduct = (
                                          groupedProducts || []
                                        ).find(
                                          (p) =>
                                            p.name?.toLowerCase() ===
                                              item.name?.toLowerCase() ||
                                            p.name
                                              ?.toLowerCase()
                                              .includes(
                                                item.name?.toLowerCase(),
                                              ) ||
                                            item.name
                                              ?.toLowerCase()
                                              .includes(p.name?.toLowerCase()),
                                        );
                                        const isLinked = !!(
                                          item.product || fallbackProduct
                                        );
                                        return (
                                          <div className="flex items-center gap-2">
                                            {isLinked ? (
                                              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl ring-1 ring-emerald-500/20 animate-pulse">
                                                <ShieldCheck className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                  Registry Verified
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-stone-400 rounded-xl ring-1 ring-stone-500/10">
                                                <AlertCircle className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                  Unverified Entry
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <div className="flex items-end justify-between border-t border-stone-50 pt-3 mt-1">
                                    <div className="space-y-0.5">
                                      <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                                        Allocation Value
                                      </p>
                                      <p className="text-xl font-black text-stone-900 tracking-tighter">
                                        &#8377;
                                        {parseFloat(
                                          item.unitPrice ||
                                            item.lineTotal / item.quantity ||
                                            0,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[14px] font-bold text-stone-900 tracking-tight">
                                        &#8377;
                                        {Number(
                                          (item.unitPrice || 0) *
                                            (item.quantity || 1),
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </div>
                  </ScrollArea>

                  <footer className="p-6 bg-white border-t border-stone-100 flex justify-center gap-4 shrink-0">
                    <Button
                      onClick={() => printThermalReceipt(selectedOrder)}
                      variant="outline"
                      className="rounded-xl px-8 h-12 font-bold uppercase tracking-[0.2em] text-[10px] border-stone-200 text-stone-900 hover:bg-pink-50 transition-all gap-2.5 shadow-sm active:scale-95"
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
          <DialogContent className="sm:max-w-3xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-[#fafafa]">
            <form
              onSubmit={handleAddVendor}
              className="flex flex-col max-h-[90vh]"
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Vendor Creation Authority</DialogTitle>
                <DialogDescription>
                  Register and verify a new partner node within the merchant
                  network.
                </DialogDescription>
              </DialogHeader>
<<<<<<< HEAD
              <header className="p-10 bg-[#1e1e1e] text-white relative shrink-0">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-[#00d084]/10 to-transparent blur-3xl -mr-12 -mt-12" />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors border-none"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="relative z-10 space-y-1">
                  <h2 className="text-4xl font-black uppercase tracking-tight leading-none text-white">
=======
              <header className="p-10 bg-stone-900 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl rounded-xl -mr-12 -mt-12" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
                    Vendor Creation
                  </h2>
                  <p className="text-[#00d084] font-bold text-lg">
                    Register a new verified partner authority.
                  </p>
                </div>
              </header>

              <ScrollArea className="flex-1 p-10 h-full">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
<<<<<<< HEAD
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
                        Vendor Name <span className="text-[#ff2b5e] ml-1">*</span>
=======
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                        Vendor Name <span className="text-rose-500">*</span>
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="h-14 bg-white border border-stone-200 rounded-[12px] text-base px-4 focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
                        Owner Name <span className="text-[#ff2b5e] ml-1">*</span>
=======
                        className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                        Owner Name <span className="text-rose-500">*</span>
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="h-14 bg-white border border-stone-200 rounded-[12px] text-base px-4 focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
                        Contact Number <span className="text-[#ff2b5e] ml-1">*</span>
=======
                        className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                        Contact Number <span className="text-rose-500">*</span>
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="h-14 bg-white border border-stone-200 rounded-[12px] text-base px-4 focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
=======
                        className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="h-14 bg-white border border-stone-200 rounded-[12px] text-base px-4 focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
                        Business Category <span className="text-[#ff2b5e] ml-1">*</span>
=======
                        className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                        Business Category{" "}
                        <span className="text-rose-500">*</span>
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="h-14 bg-white border border-stone-200 rounded-[12px] text-base px-4 focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all placeholder:text-stone-400"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[11px] font-black text-black uppercase tracking-widest pl-1">
                        Store Address <span className="text-[#ff2b5e] ml-1">*</span>
=======
                        className="h-12 bg-stone-50 border-stone-100 rounded-xl"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                        Store Address <span className="text-rose-500">*</span>
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
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
<<<<<<< HEAD
                        className="w-full min-h-[120px] p-4 bg-white border border-stone-200 rounded-[12px] text-base focus-visible:ring-4 focus-visible:ring-stone-200 focus-visible:border-stone-400 outline-none shadow-sm transition-all resize-y placeholder:text-stone-400"
=======
                        className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <footer className="p-8 bg-[#fafafa] flex justify-end gap-6 shrink-0 mt-auto items-center">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
<<<<<<< HEAD
                  className="font-black uppercase tracking-widest text-[11px] text-black hover:text-stone-600 transition-colors bg-transparent border-none outline-none"
=======
                  variant="ghost"
                  className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]"
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
<<<<<<< HEAD
                  className="bg-[#00a86b] text-white rounded-[12px] px-8 h-12 flex items-center font-black uppercase tracking-widest text-[11px] hover:bg-[#00925e] transition-colors outline-none"
=======
                  className="bg-emerald-600 text-white rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700"
>>>>>>> e67f4f806b3fb832741548db118e8f7e24778808
                >
                  Issue Authority
                </button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>
        {/* Quick Add Product Dialog */}
        <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <DialogContent
            className={`max-w-lg p-0 overflow-hidden border-none ${THEME.borders.radius.xl} bg-white/80 backdrop-blur-3xl ${THEME.shadows.xl}`}
          >
            <header className="p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white flex flex-col gap-1 shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-24 bg-white/5 blur-3xl rounded-[2px] -mr-12 -mt-12" />
              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                  <div
                    className={`h-8 w-8 ${THEME.borders.radius.md} bg-white/10 flex items-center justify-center backdrop-blur-md`}
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>
                  Quick Add Product
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsQuickAddOpen(false)}
                  className={`text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 ${THEME.borders.radius.pill}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-[0.3em] relative z-10 mt-1">
                Create products faster
              </p>
            </header>

            <form onSubmit={handleQuickAddProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Image Upload Area */}
                <div className="col-span-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-2 block ml-1 underline decoration-pink-500/30 underline-offset-8">
                    Product Image
                  </Label>
                  <div
                    onClick={() =>
                      document.getElementById("quick-image-input").click()
                    }
                    className={`h-44 w-full border-2 border-dashed border-stone-200 ${THEME.borders.radius.lg} flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50/20 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 overflow-hidden group/img bg-stone-50/50`}
                  >
                    {quickAddImage ? (
                      <img
                        src={URL.createObjectURL(quickAddImage)}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                        alt="Preview"
                      />
                    ) : quickAddData.imageUrl ? (
                      <img
                        src={
                          quickAddData.imageUrl.startsWith("http")
                            ? quickAddData.imageUrl
                            : `${API_URL.replace("/api", "")}${quickAddData.imageUrl}`
                        }
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                        alt="Product Media"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <div
                          className={`h-12 w-12 ${THEME.borders.radius.md} bg-white flex items-center justify-center shadow-lg group-hover/img:scale-110 group-hover/img:rotate-12 transition-all duration-500 mx-auto`}
                        >
                          <Camera className="h-6 w-6 text-stone-300 group-hover/img:text-pink-600" />
                        </div>
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
                          Select Product Media
                        </span>
                      </div>
                    )}
                    <input
                      id="quick-image-input"
                      type="file"
                      className="hidden"
                      onChange={(e) => setQuickAddImage(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Deal Assignment
                  </Label>
                  <div className="relative">
                    <select
                      value={currentSlotEditing}
                      onChange={(e) => setCurrentSlotEditing(e.target.value)}
                      className={`w-full h-11 bg-white/50 border border-stone-200 ${THEME.borders.radius.md} font-black text-stone-900 px-5 focus-visible:ring-stone-900 focus:outline-none transition-all shadow-sm text-xs appearance-none cursor-pointer`}
                    >
                      <option value="None">None (Standard Product)</option>
                      <option value="Deal 1">Deal 1 (Primary Deal)</option>
                      <option value="Deal 2">Deal 2 (Secondary Deal)</option>
                      <option value="Deal 3">Deal 3 (Tertiary Deal)</option>
                      <option value="Deal 4">Deal 4 (Seasonal Deal)</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Product Name
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Hydra-Barrier Revitalizing Serum"
                    value={quickAddData.name}
                    onChange={(e) =>
                      setQuickAddData({ ...quickAddData, name: e.target.value })
                    }
                    className={`h-11 bg-white/50 border-stone-200 ${THEME.borders.radius.md} font-black text-stone-900 px-5 focus-visible:ring-stone-900 transition-all shadow-sm text-xs`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Brand
                  </Label>
                  <Input
                    required
                    placeholder="Enter brand..."
                    value={quickAddData.brand}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        brand: e.target.value,
                      })
                    }
                    className={`h-11 bg-white/50 border-stone-200 ${THEME.borders.radius.md} font-black text-stone-900 px-5 focus-visible:ring-stone-900 transition-all shadow-sm text-xs`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Category
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Skincare"
                    value={quickAddData.categoryName}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        categoryName: e.target.value,
                      })
                    }
                    className={`h-11 bg-white/50 border-stone-200 rounded-xl font-black text-stone-900 px-5 focus-visible:ring-pink-500 transition-all shadow-sm text-xs`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Market Price (₹)
                  </Label>
                  <Input
                    required
                    type="number"
                    placeholder="0.00"
                    value={quickAddData.price}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        price: e.target.value,
                      })
                    }
                    className={`h-11 bg-white/50 border-stone-200 rounded-xl font-black text-pink-600 px-5 focus-visible:ring-pink-500 transition-all shadow-sm text-xs`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-stone-500 ml-1">
                    Initial Stock
                  </Label>
                  <Input
                    required
                    type="number"
                    value={quickAddData.stock}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        stock: e.target.value,
                      })
                    }
                    className={`h-11 bg-stone-50 border-stone-200 rounded-xl font-black text-stone-900 px-5 focus-visible:ring-pink-500 transition-all shadow-sm text-xs`}
                  />
                </div>
              </div>

              <footer className="pt-6 border-t border-stone-100 flex justify-end gap-3 px-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsQuickAddOpen(false)}
                  className={`${THEME.borders.radius.pill} h-11 px-8 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-stone-50 transition-all duration-300`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={`h-11 px-10 bg-[#ff4fa3] text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl shadow-xl shadow-pink-100 hover:bg-[#e0458f] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center gap-2`}
                >
                  {loading ? (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Plus className="h-4 w-4 text-white" />
                  )}
                  Add Product
                </Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Vendor Password Dialog */}
        <Dialog 
          open={!!resetPasswordVendor} 
          onOpenChange={(open) => !open && setResetPasswordVendor(null)}
        >
          <DialogContent className="sm:max-w-md rounded-[2px] p-0 overflow-hidden border-none shadow-2xl">
            <form onSubmit={handleResetVendorPassword}>
              <header className="p-8 bg-indigo-950 text-white relative">
                <div className="absolute top-0 right-0 p-16 bg-white/5 blur-3xl -mr-8 -mt-8" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Reset Authority</h2>
                <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Updating credentials for {resetPasswordVendor?.businessName}
                </p>
              </header>
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">New Security Key</Label>
                  <Input 
                    required
                    type="password"
                    placeholder="Enter new password"
                    value={newVendorPassword}
                    onChange={(e) => setNewVendorPassword(e.target.value)}
                    className="h-12 bg-stone-50 border-stone-100 rounded-[2px] font-bold text-sm"
                  />
                </div>
                <div className="p-3 bg-amber-50 rounded-[2px] border border-amber-100 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                    IMPORTANT: Provide the new password to the vendor manually after resetting. This action cannot be undone.
                  </p>
                </div>
              </div>
              <footer className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setResetPasswordVendor(null)}
                  className="rounded-[2px] font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-950 text-white rounded-[2px] px-8 h-11 font-black uppercase tracking-widest text-[11px]"
                >
                  Update Keys
                </Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    document.body.setAttribute("data-admin-dashboard", "true");

    return () => {
      document.body.removeAttribute("data-admin-dashboard");
    };
  }, []);

  useEffect(() => {
    if (adminUser?.id) {
      fetch(`${API_URL}/admin/auth/profile?adminId=${adminUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            localStorage.removeItem("adminUser");
            setAdminUser(null);
          }
        })
        .catch(() => {});
    }
  }, [adminUser]);

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={setAdminUser} />;
  }

  return <AdminDashboardContent />;
};

export default AdminDashboard;
