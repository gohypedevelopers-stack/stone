import {
  useState,
  useEffect,
  useMemo,
  useDeferredValue,
  memo,
  useRef,
} from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  DollarSign,
  BookOpen,
  Plus,
  ShoppingBag,
  Building2,
  RotateCcw,
  UserMinus,
  IndianRupee,
  Tag,
  Image as ImageIcon,
  Trash2,
  Box,
  Minus,
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
  Key,
  AlertTriangle,
  Download,
  LogOut,
  Globe,
  Store,
  Send,
  Loader2,
  Maximize2,
  PlusCircle,
  ArrowRightLeft,
  ArrowRight,
  ClipboardList,
  Lock,
  Save,
  Truck,
  FileText,
  Brain,
  FlaskConical,
  FileCheck,
  LayoutGrid,
  Play,
  Monitor,
  UploadCloud,
  PackagePlus,
  PackageCheck,
  QrCode,
  Copy,
  Gift,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import AdminLogin from "./AdminLogin";
import slide1 from "./assets/1.png";
import slide2 from "./assets/2.png";
import slide3 from "./assets/3.png";

// Import local video assets for Watch & Shop defaults
import vidA from "./assets/reels/A.mp4";
import vidB from "./assets/reels/B.mp4";
import vidC from "./assets/reels/C.mp4";
import vidD from "./assets/reels/D.mp4";

import {
  getMediaUrl,
  QuickRestockDialog,
  SystemClock,
  LiveTimeAgo,
  AdminKPICard,
  RevenueReport,
  AbandonedCartDetailModal,
} from "./components/admin/AdminUtils";

import OverviewSection from "./components/admin/sections/OverviewSection";
import BannerManagementSection from "./components/admin/sections/BannerManagementSection";
import WatchShopManagementSection from "./components/admin/sections/WatchShopManagementSection";
import InventorySection from "./components/admin/sections/InventorySection";
import OfflineStoresSection from "./components/admin/sections/OfflineStoresSection";
import OffersSection from "./components/admin/sections/OffersSection";
import OutletInventorySection from "./components/admin/sections/OutletInventorySection";
import ProductLabelsSection from "./components/admin/sections/ProductLabelsSection";
import NotificationsSection from "./components/admin/sections/NotificationsSection";

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
import UpcomingDropsManager from "@/components/UpcomingDropsManager";
import ValueBundlesManager from "@/components/ValueBundlesManager";
import OriginManager from "@/components/OriginManager";
import OriginEditor from "@/components/OriginEditor";

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
import { useProducts } from "@/context/ProductContext";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { API_URL, SERVER_URL } from "@/utils/api";

// Extracted utility components to components/admin/AdminUtils.jsx

const emptyProduct = {
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
  releaseDate: "",
  ingredients: "",
  whyWeLoveIt: "",
  discountPrice: "",
  specialOfferType: "None",
  existingImages: [],
  vendors: [{ vendorId: "", stock: "0" }],
  howToUse: "",
  skinConcerns: [],
  additionalInfo: "",
};

const normalizeAdminProduct = (product) => {
  const basePrice = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;

  return {
    ...product,
    price: hasDiscount ? discountPrice : basePrice,
    originalPrice: hasDiscount ? basePrice : 0,
  };
};

const createEmptyProductLabelDraft = () => ({
  enabled: true,
  batchNo: "",
  mrp: "",
  weight: "",
  unit: "",
  productionDate: "",
  expiryDate: "",
  ingredients: "",
});

const buildAutoBatchNo = (productName) => {
  const prefix =
    (productName || "PROD")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 4)
      .toUpperCase() || "PROD";
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 12);

  return `${prefix}-${stamp}`;
};

const AdminDashboardContent = () => {
  const { refreshProducts } = useProducts();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const handleResetVendorPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordVendor || !newVendorPassword) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `${API_URL}/admin/vendors/${resetPasswordVendor.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: newVendorPassword }),
        },
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(
          `Password for ${resetPasswordVendor.businessName} updated.`,
        );
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
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const activeView = pathSegments[1] || "overview";
  const subView = pathSegments[2];

  // Removed product-labels redirect to allow standalone view

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Detail Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [newVendorData, setNewVendorData] = useState({
    businessName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    businessCategory: "",
    storeAddress: "",
    password: "",
  });
  const [platformSettings, setPlatformSettings] = useState({});
  const [platformQRFile, setPlatformQRFile] = useState(null);
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
  const [currentSlotEditing, setCurrentSlotEditing] = useState("Deal 1"); // Default to Deal 1 now that None is removed
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [resetPasswordVendor, setResetPasswordVendor] = useState(null);
  const [newVendorPassword, setNewVendorPassword] = useState("");
  const [quickAddData, setQuickAddData] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "0",
    vendorId: "",
  });
  const [quickAddImage, setQuickAddImage] = useState(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
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
    releaseDate: "",
    ingredients: "",
    whyWeLoveIt: "",
    discountPrice: "",
    specialOfferType: "None",
    existingImages: [],
    vendors: [{ vendorId: "", stock: "0" }],
    howToUse: "",
    skinConcerns: [],
    additionalInfo: "",
  });
  const [productBenefits, setProductBenefits] = useState([
    { icon: "✨", text: "" },
  ]);
  const [productFaq, setProductFaq] = useState([{ q: "", a: "" }]);
  const [productLabelDraft, setProductLabelDraft] = useState(
    createEmptyProductLabelDraft,
  );
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
  const [selectedOriginFilter, setSelectedOriginFilter] = useState("All");
  const [brands, setBrands] = useState([]);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);

  // Out of Stock / Restock States
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedRestockProduct, setSelectedRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [inlineStockChanges, setInlineStockChanges] = useState({}); // { productId: 0 }

  // Fulfillment States
  const [fulfillmentVendorId, setFulfillmentVendorId] = useState("");
  const [isFulfilling, setIsFulfilling] = useState(false);

  // Abandoned Checkouts States
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [abandonedThreshold, setAbandonedThreshold] = useState(30); // minutes
  const [selectedAbandonedCart, setSelectedAbandonedCart] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now()); // Fallback for components that still need a base time, but no longer updated via interval here

  const [serverSkew, setServerSkew] = useState(0);

  // Stock Transfer States
  const [stockTransfers, setStockTransfers] = useState([]);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [isTransferDetailOpen, setIsTransferDetailOpen] = useState(false);

  const [preSelectedTransferSource, setPreSelectedTransferSource] =
    useState("");
  const [preSelectedTransferDest, setPreSelectedTransferDest] = useState("");
  const [preSelectedTransferItems, setPreSelectedTransferItems] = useState([]);
  const [transferType, setTransferType] = useState("ALL"); // ALL, SENT, RECEIVED

  // Customer Segments States
  const [segmentsData, setSegmentsData] = useState(null);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentSearch, setSegmentSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState(null); // { id, name }

  // Admin Notifications
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Offline Store States
  const [offlineStores, setOfflineStores] = useState(() => {
    const saved = localStorage.getItem("omw_offline_stores");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        name: "Ontario Mills Boutique",
        address: "1 Mills Cir. Ste 503A. Ontario, CA 91764",
        active: true,
        distance: "1.2 km away",
      },
      {
        id: "2",
        name: "Outlets at Orange – Coming Soon",
        address: "20 City Blvd W, Orange, CA 92868",
        active: false,
        distance: null,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("omw_offline_stores", JSON.stringify(offlineStores));
    window.dispatchEvent(new CustomEvent("omw_offline_stores_updated"));
  }, [offlineStores]);

  const [watchShopItems, setWatchShopItems] = useState(() => {
    const saved = localStorage.getItem("omw_watch_shop");
    let items = [];
    if (saved) {
      items = JSON.parse(saved);
    } else {
      items = [
        {
          id: "1",
          video: vidA,
          productName: "Silk Essence Routine",
          active: true,
        },
        { id: "2", video: vidB, productName: "Glass Skin Glow", active: true },
        { id: "3", video: vidC, productName: "Night Recovery", active: true },
        {
          id: "4",
          video: vidD,
          productName: "Rose Quartz Facial",
          active: true,
        },
      ];
    }
    // Self-healing: if any item has no video, assign a default
    const localVids = [vidA, vidB, vidC, vidD];
    return items.map((item, idx) => {
      if (!item.video) {
        return { ...item, video: localVids[idx % localVids.length] };
      }
      return item;
    });
  });

  useEffect(() => {
    localStorage.setItem("omw_watch_shop", JSON.stringify(watchShopItems));
    window.dispatchEvent(new CustomEvent("omw_watch_shop_updated"));
  }, [watchShopItems]);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [storeFormData, setStoreFormData] = useState({
    name: "",
    address: "",
    active: true,
    distance: "",
  });
  const [editingStoreId, setEditingStoreId] = useState(null);

  const [isAddWatchOpen, setIsAddWatchOpen] = useState(false);
  const [watchFormData, setWatchFormData] = useState({
    video: "",
    productName: "",
    active: true,
  });
  const [editingWatchId, setEditingWatchId] = useState(null);
  const [watchVideoFile, setWatchVideoFile] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const watchVideoInputRef = useRef(null);

  // Offers Management States
  const [offers, setOffers] = useState([]);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    type: "bogo",
    title: "",
    accentWord: "Free",
    badgeText: "LIMITED OFFER",
    description: "",
    ctaText: "CLAIM OFFER",
    ctaLink: "shop",
    endsAt: "",
    mainProductImage: "",
    freeProductImage: "",
    mainProductId: "",
    freeProductId: "",
    isActive: true,
  });
  const [offerMainImageFile, setOfferMainImageFile] = useState(null);
  const [offerFreeImageFile, setOfferFreeImageFile] = useState(null);
  const offerMainImageRef = useRef(null);
  const offerFreeImageRef = useRef(null);

  const filteredProductOptions = useMemo(() => {
    // Filter out obvious placeholder items
    const validProducts = products.filter((p) => {
      const name = (p.name || "").trim().toUpperCase();
      // Surgically exclude placeholders and low-value test data
      const isPlaceholder =
        name === "BRAND" ||
        name === "PRODUCT" ||
        name === "TEST PRODUCT" ||
        name.includes("TESTING");
      const isLowValue = (Number(p.price) || 0) < 100;
      return !isPlaceholder && !isLowValue;
    });

    if (!productSearchQuery) return validProducts.slice(0, 10);
    return validProducts
      .filter((p) =>
        p.name?.toLowerCase().includes(productSearchQuery.toLowerCase()),
      )
      .slice(0, 10);
  }, [products, productSearchQuery]);

  const handleOpenAddStore = () => {
    setEditingStoreId(null);
    setStoreFormData({ name: "", address: "", active: true, distance: "" });
    setIsAddStoreOpen(true);
  };

  const handleSaveStore = () => {
    if (editingStoreId) {
      setOfflineStores((prev) =>
        prev.map((s) =>
          s.id === editingStoreId ? { ...s, ...storeFormData } : s,
        ),
      );
    } else {
      setOfflineStores((prev) => [
        ...prev,
        { id: Date.now().toString(), ...storeFormData },
      ]);
    }
    setIsAddStoreOpen(false);
  };

  const handleDeleteStore = (id) => {
    setOfflineStores((prev) => prev.filter((s) => s.id !== id));
  };

  const fetchAdminNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await fetch(`${API_URL}/notifications?audience=ADMIN`);
      const data = await res.json();
      if (data.success) {
        setAdminNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminNotifications();
      const interval = setInterval(fetchAdminNotifications, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAdminNotificationRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setAdminNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleToggleStore = (id) => {
    setOfflineStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
  };

  const handleOpenAddWatch = () => {
    setEditingWatchId(null);
    setWatchFormData({
      video: "",
      productName: "",
      productId: "",
      active: true,
    });
    setWatchVideoFile(null);
    setProductSearchQuery("");
    setIsAddWatchOpen(true);
  };

  const handleSaveWatch = async () => {
    setLoading(true);
    try {
      let videoUrl = watchFormData.video;

      if (watchVideoFile) {
        const formData = new FormData();
        formData.append("images", watchVideoFile);
        const resp = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await resp.json();
        if (data.success) {
          videoUrl = getMediaUrl(data.data[0]);
        } else {
          throw new Error(data.message || "Upload failed");
        }
      }

      const finalData = { ...watchFormData, video: videoUrl };

      if (editingWatchId) {
        setWatchShopItems((prev) =>
          prev.map((item) =>
            item.id === editingWatchId ? { ...item, ...finalData } : item,
          ),
        );
      } else {
        setWatchShopItems((prev) => [
          ...prev,
          { id: Date.now().toString(), ...finalData },
        ]);
      }
      setIsAddWatchOpen(false);
      setWatchVideoFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video asset");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWatch = (id) => {
    setWatchShopItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleWatch = (id) => {
    setWatchShopItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    );
  };

  // Banner Management States
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem("omw_admin_banners");
    if (saved) return JSON.parse(saved);
    return [
      {
        img: slide1,
        title: "Summer Collection",
        sub: "Trusted SPF for Sun Fun",
        id: 1,
        active: true,
      },
      {
        img: slide2,
        title: "Luxury Skincare",
        sub: "Premium Stone Edition",
        id: 2,
        active: true,
      },
      {
        img: slide3,
        title: "New Arrivals",
        sub: "Explore the Latest",
        id: 3,
        active: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("omw_admin_banners", JSON.stringify(banners));
  }, [banners]);

  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    sub: "",
    img: "",
  });
  const [editingBannerId, setEditingBannerId] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerFormData({ title: "", sub: "", img: "" });
    setIsAddBannerOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large (Max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerFormData((prev) => ({ ...prev, img: reader.result }));
        toast.success("Image asset loaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAsset = () => {
    setBannerFormData((prev) => ({ ...prev, img: "" }));
    toast.info("Asset removed");
  };

  const handleEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setBannerFormData({
      title: banner.title,
      sub: banner.sub,
      img: banner.img,
    });
    setIsAddBannerOpen(true);
  };

  const handleDeleteBanner = (id) => {
    if (confirm("Remove this banner from the storefront?")) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner removed successfully");
    }
  };

  const handleToggleBanner = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const handleSaveBanner = () => {
    if (!bannerFormData.title || !bannerFormData.sub || !bannerFormData.img) {
      toast.error("Please fill all required fields");
      return;
    }

    if (editingBannerId) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBannerId ? { ...b, ...bannerFormData } : b,
        ),
      );
      toast.success("Banner updated");
    } else {
      const newBanner = {
        ...bannerFormData,
        id: Date.now(),
        active: true,
      };
      setBanners((prev) => [...prev, newBanner]);
      toast.success("New banner added to carousel");
    }
    setIsAddBannerOpen(false);
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    const uniqueVendorMap = (p.stockRecords || []).reduce((acc, sr) => {
      if (!acc[sr.vendorId]) {
        acc[sr.vendorId] = {
          vendorId: sr.vendorId,
          stock: sr.quantity,
        };
      } else {
        acc[sr.vendorId].stock += sr.quantity;
      }
      return acc;
    }, {});

    const newProd = {
      name: p.name,
      brand: p.brand || "",
      price: p.originalPrice || p.price,
      categoryName: p.category?.name || "",
      description: p.description || "",
      tags: p.tags?.join(", ") || "",
      featured: p.featured,
      newArrival: p.newArrival || false,
      bestSeller: p.bestSeller || false,
      trending: p.trending || false,
      origin: p.origin || "",
      rewardEligible: p.rewardEligible,
      limitedOffer: p.limitedOffer,
      specialOfferType: p.specialOfferType || "None",
      ingredients: p.ingredients || "",
      whyWeLoveIt: p.whyWeLoveIt || "",
      discountPrice: p.originalPrice ? p.price : p.discountPrice || "",
      existingImages: (p.imageUrls || []).filter(
        (img) => img && img.trim() !== "",
      ),
      vendors:
        Object.values(uniqueVendorMap).length > 0
          ? Object.values(uniqueVendorMap)
          : [{ vendorId: "", stock: "" }],
      howToUse: p.howToUse || "",
      skinConcerns: p.skinConcerns || [],
      additionalInfo: p.additionalInfo || "",
    };
    setNewProduct(newProd);

    const ben =
      p.benefits && p.benefits.length > 0
        ? p.benefits
        : [{ icon: "✨", text: "" }];
    setProductBenefits(ben);

    const faq =
      p.faq && Array.isArray(p.faq) && p.faq.length > 0
        ? p.faq
        : [{ q: "", a: "" }];
    setProductFaq(faq);
    const labelDraft = {
      ...createEmptyProductLabelDraft(),
      enabled: false,
      mrp: p.defaultMrp || p.originalPrice || p.price || "",
      weight: p.defaultWeight || "",
      unit: p.unit || "",
      ingredients: p.ingredients || "",
    };
    setProductLabelDraft(labelDraft);

    setInitialProductState(
      JSON.stringify({ prod: newProd, ben, faq, label: labelDraft }),
    );
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

  const handleSendToVendor = async () => {
    if (!selectedOrder || !fulfillmentVendorId) {
      toast.error("Please select a vendor for fulfillment");
      return;
    }

    setIsFulfilling(true);
    try {
      const resp = await fetch(
        `${API_URL}/admin/orders/${selectedOrder.id}/fulfill`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId: fulfillmentVendorId }),
        },
      );
      const data = await resp.json();
      if (data.success) {
        toast.success(`Order successfully assigned to vendor`);
        setSelectedOrder(data.data);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.data.id ? data.data : o)),
        );
        setFulfillmentVendorId("");
      } else {
        toast.error(data.message || "Fulfillment assignment failed");
      }
    } catch (err) {
      toast.error("Network error during fulfillment assignment");
    } finally {
      setIsFulfilling(false);
    }
  };

  // ──────────────────────────────────────────────
  // Promo Offers Handlers
  // ──────────────────────────────────────────────
  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/offers`);
      const data = await res.json();
      if (data.success) {
        setOffers(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch offers:", e);
    }
  };

  useEffect(() => {
    if (activeView === "offers") {
      fetchOffers();
    }
  }, [activeView]);

  const handleOpenAddOffer = () => {
    setEditingOfferId(null);
    setOfferFormData({
      type: "bogo",
      title: "",
      accentWord: "Free",
      badgeText: "LIMITED OFFER",
      description: "",
      ctaText: "CLAIM OFFER",
      ctaLink: "shop",
      endsAt: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      mainProductImage: "",
      freeProductImage: "",
      mainProductId: "",
      freeProductId: "",
      isActive: true,
    });
    setOfferMainImageFile(null);
    setOfferFreeImageFile(null);
    setIsAddOfferOpen(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setOfferFormData({
      ...offer,
      endsAt: offer.endsAt
        ? new Date(offer.endsAt).toISOString().split("T")[0]
        : "",
    });
    setOfferMainImageFile(null);
    setOfferFreeImageFile(null);
    setIsAddOfferOpen(true);
  };

  const handleSaveOffer = async () => {
    setLoading(true);
    try {
      let mainImg = offerFormData.mainProductImage;
      let freeImg = offerFormData.freeProductImage;

      // Handle Image Uploads
      if (offerMainImageFile) {
        const formData = new FormData();
        formData.append("images", offerMainImageFile);
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) mainImg = data.data[0];
      }

      if (offerFreeImageFile) {
        const formData = new FormData();
        formData.append("images", offerFreeImageFile);
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) freeImg = data.data[0];
      }

      const payload = {
        ...offerFormData,
        mainProductImage: mainImg,
        freeProductImage: freeImg,
      };
      const method = editingOfferId ? "PUT" : "POST";
      const url = editingOfferId
        ? `${API_URL}/admin/offers/${editingOfferId}`
        : `${API_URL}/admin/offers`;

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await resp.json();

      if (resData.success) {
        toast.success(editingOfferId ? "Offer updated" : "Offer created");
        setIsAddOfferOpen(false);
        fetchOffers();
        window.dispatchEvent(new CustomEvent("omw_offers_updated"));
      } else {
        toast.error(resData.message || "Failed to save offer");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while saving the offer");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/offers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Offer deleted");
        fetchOffers();
        window.dispatchEvent(new CustomEvent("omw_offers_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOffer = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/offers/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Offer status updated");
        fetchOffers();
        window.dispatchEvent(new CustomEvent("omw_offers_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickAssignVendor = async (orderId, vendorId) => {
    if (!vendorId) return;
    try {
      const resp = await fetch(`${API_URL}/admin/orders/${orderId}/fulfill`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Order assigned successfully!`);
        fetchDataForView("orders");
      } else {
        toast.error(data.message || "Failed to assign vendor");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error assigning vendor");
    }
  };

  const handleRestockSubmit = async (stockAdd, targetVendorId) => {
    if (!selectedRestockProduct) return;
    setLoading(true);
    try {
      // Find the specific product ID for this vendor from the map
      const targetProductId =
        (targetVendorId &&
          selectedRestockProduct.vendorMap?.[targetVendorId]) ||
        selectedRestockProduct.id;

      // Find the specific variant in the raw products list to get its current stock
      const variant =
        products.find((p) => p.id === targetProductId) ||
        selectedRestockProduct;

      // PRESERVE ALL EXISTING VENDORS to prevent the backend from deleting them
      const currentVendorStocks = (variant.stockRecords || []).map((sr) => ({
        vendorId: sr.vendorId,
        stock: sr.quantity || 0,
      }));

      // Update or add the target vendor's stock
      let found = false;
      const updatedVendors = currentVendorStocks.map((vs) => {
        if (vs.vendorId === (targetVendorId || variant.vendorId)) {
          found = true;
          return { ...vs, stock: vs.stock + stockAdd };
        }
        return vs;
      });

      if (!found) {
        updatedVendors.push({
          vendorId: targetVendorId || variant.vendorId,
          stock: stockAdd,
        });
      }

      const resp = await fetch(`${API_URL}/admin/products/${targetProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...variant,
          vendors: updatedVendors,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(
          `Inventory synchronized for ${variant.name} (${targetVendorId ? "Vendor-Specific" : "Global"})`,
        );
        setIsRestockOpen(false);
        fetchDataForView("inventory"); // Refresh products
        refreshProducts?.();
      } else {
        toast.error(data.message || "Failed to update stock");
      }
    } catch (err) {
      toast.error("Network instability detected.");
    } finally {
      setLoading(false);
    }
  };

  const handleInlineRestock = async (product, stockAdd) => {
    if (!product) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          stock: (product.stock || 0) + stockAdd,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Stock Synchronized`);
        setInlineStockChanges((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
        fetchDataForView("inventory"); // Refresh products
      } else {
        toast.error(data.message || "Update Failed");
      }
    } catch (err) {
      toast.error("Network instability");
    } finally {
      setLoading(false);
    }
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
      origin: "",
      rewardEligible: false,
      limitedOffer: false,
      ingredients: "",
      whyWeLoveIt: "",
      discountPrice: "",
      existingImages: [],
      vendors: [{ vendorId: "", stock: "0" }],
      howToUse: "",
      skinConcerns: [],
      additionalInfo: "",
    };
    setNewProduct(newProd);

    const ben = [{ icon: "✨", text: "" }];
    setProductBenefits(ben);
    const faq = [{ q: "", a: "" }];
    setProductFaq(faq);
    const labelDraft = createEmptyProductLabelDraft();
    setProductLabelDraft(labelDraft);
    setInitialProductState(
      JSON.stringify({ prod: newProd, ben, faq, label: labelDraft }),
    );
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

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const resp = await fetch(`${API_URL}/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (data.success) {
        fetchDataForView("inventory");
        refreshProducts?.();
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

    if (activeView !== "overview" && activeView !== "abandoned-checkouts") {
      fetchDataForView(activeView);
      // Always fetch products part of the global cache for detail fallbacks
      if (activeView !== "inventory" && products.length === 0) {
        fetchDataForView("inventory");
      }

      if (
        activeView === "inventory" ||
        activeView === "stock-transfers" ||
        activeView === "create-transfer"
      ) {
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
  }, [activeView, selectedTimeRange, activeSegment]);

  // Fetch Abandoned Carts function
  const fetchAbandonedCarts = async (threshold) => {
    try {
      setLoading(true);
      const resp = await fetch(
        `${API_URL}/admin/abandoned-checkouts?thresholdMinutes=${threshold}`,
      );
      const data = await resp.json();
      if (data.success) {
        setAbandonedCarts(data.data.carts);
        // Calculate skew: serverTime - clientNow
        const skew = data.data.serverTime - Date.now();
        setServerSkew(skew);
      }
    } catch (err) {
      console.error("Error fetching abandoned carts:", err);
    } finally {
      setLoading(false);
    }
  };

  // High-precision clock moved to SystemClock component to prevent full-dashboard re-renders

  // Fetch & auto-refresh abandoned carts when view is active or threshold changes
  useEffect(() => {
    if (activeView !== "abandoned-checkouts") return;
    fetchAbandonedCarts(abandonedThreshold);

    // Auto-refresh every 60s while on this view
    const interval = setInterval(
      () => fetchAbandonedCarts(abandonedThreshold),
      60000,
    );
    return () => clearInterval(interval);
  }, [activeView, abandonedThreshold]);

  // Fetch Customer Segments
  const fetchSegments = async () => {
    setSegmentsLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/customer-segments`);
      const data = await resp.json();
      if (data.success) {
        setSegmentsData(data.data);
      }
    } catch (err) {
      console.error("Error fetching segments:", err);
    } finally {
      setSegmentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "segments") {
      fetchSegments();
    }
  }, [activeView]);

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

  useEffect(() => {
    if (activeView === "customers" && subView) {
      fetchCustomerDetail(subView);
    }
    if (activeView === "vendors" && subView) {
      fetchVendorDetail(subView);
    }
  }, [activeView, subView]);

  useEffect(() => {
    if (activeView === "orders" && subView) {
      const type = new URLSearchParams(location.search).get("type") || "Online";
      const syncOrder = async () => {
        try {
          const resp = await fetch(
            `${API_URL}/admin/orders/${subView}?type=${type}`,
          );
          const data = await resp.json();
          if (data.success) setSelectedOrder(data.data);
        } catch (err) {
          console.error("Order sync failed", err);
        }
      };
      syncOrder();
    }
  }, [activeView, subView, location.search]);

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
    if (
      viewName === "create-transfer" ||
      viewName === "watch-shop" ||
      viewName === "offline-stores" ||
      viewName === "offers" ||
      viewName === "outlet-inventory" ||
      viewName === "product-labels"
    )
      return;
    setLoading(true);
    try {
      if (viewName === "vendor-qrs") {
        const resp = await fetch(`${API_URL}/admin/settings/platform`);
        const data = await resp.json();
        if (data.success) {
          setPlatformSettings(data.data);
        }
      } else if (viewName === "vendor-analytics") {
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
        let url = "";
        if (viewName === "stock-transfers") {
          url = `${API_URL}/stock-transfers`;
        } else {
          const endpoint =
            viewName === "inventory" ||
            viewName === "special-offers" ||
            viewName === "product-labels"
              ? "products"
              : viewName === "orders" || viewName === "preorder-transactions"
                ? "orders"
                : viewName === "vendors"
                  ? "vendors"
                  : "customers";
          url = `${API_URL}/admin/${endpoint}`;
          if (viewName === "customers" && activeSegment) {
            url += `?segment=${activeSegment.id}`;
          }
        }

        const resp = await fetch(url);
        const data = await resp.json();
        if (data.success) {
          if (viewName === "stock-transfers") setStockTransfers(data.data);
          else if (
            viewName === "inventory" ||
            viewName === "special-offers" ||
            viewName === "product-labels"
          ) {
            const mappedProducts = data.data.map(normalizeAdminProduct);
            setProducts(mappedProducts);
          } else if (
            viewName === "orders" ||
            viewName === "preorder-transactions"
          ) {
            if (data.data && data.data.orders) {
              setOrders(data.data.orders);
              if (data.data.approvedVendors)
                setVendors(data.data.approvedVendors);
            } else {
              setOrders(data.data);
            }
          } else if (viewName === "vendors") setVendors(data.data);
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
        const pStockRecords = p.stockRecords || [];
        const pTotalStock = pStockRecords.reduce(
          (sum, r) => sum + r.quantity,
          0,
        );

        if (!acc[baseName]) {
          acc[baseName] = {
            ...p,
            stock: pTotalStock,
            stockRecords: pStockRecords,
            vendorMap: { [p.vendorId]: p.id },
          };
        } else {
          acc[baseName].stock += pTotalStock;
          acc[baseName].stockRecords = [
            ...(acc[baseName].stockRecords || []),
            ...pStockRecords,
          ];
          if (p.vendorId) {
            acc[baseName].vendorMap[p.vendorId] = p.id;
          }
        }
        return acc;
      }, {}),
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [products]);

  const deferredFilteredProducts = useMemo(() => {
    return groupedProducts.filter((p) => {
      const search = (deferredSearchQuery || "").toLowerCase().trim();
      const synonyms = {
        mostriser: "moisturizer",
        mosturizer: "moisturizer",
        serum: "serums",
      };
      const expandedSearch = synonyms[search] || search;

      const matchesSearch =
        !search ||
        (() => {
          const name = (p.name || "").toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          const queryWords = [search, expandedSearch].filter(Boolean);
          const nameWords = name.split(/[\s-]+/);

          const nameMatch = queryWords.some(
            (qw) =>
              name === qw ||
              nameWords.some((w) => w.startsWith(qw)) ||
              (qw.length > 3 && name.includes(qw)),
          );
          const brandMatch = queryWords.some((qw) => brand.includes(qw));
          const tagsMatch =
            (p.tags &&
              Array.isArray(p.tags) &&
              p.tags.some((t) => {
                const lt = String(t).toLowerCase().trim();
                const tagWords = lt.split(/[\s-]+/);
                return queryWords.some(
                  (qw) =>
                    lt === qw ||
                    tagWords.some((w) => w.startsWith(qw)) ||
                    (qw.length > 3 && lt.includes(qw)),
                );
              })) ||
            (p.tags &&
              typeof p.tags === "string" &&
              queryWords.some((qw) => p.tags.toLowerCase().includes(qw)));

          return nameMatch || brandMatch || tagsMatch;
        })();
      const matchesCategory =
        selectedCategory === "All" || p.category?.name === selectedCategory;
      const matchesOrigin =
        selectedOriginFilter === "All" || p.origin === selectedOriginFilter;
      const isNotSpecialOffer =
        !p.specialOfferType || p.specialOfferType === "None";
      return (
        matchesSearch && matchesCategory && matchesOrigin && isNotSpecialOffer
      );
    });
  }, [
    groupedProducts,
    deferredSearchQuery,
    selectedCategory,
    selectedOriginFilter,
  ]);

  const deferredFilteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const search = (deferredSearchQuery || "").toLowerCase();
      return (
        !search ||
        (v.businessName || "").toLowerCase().includes(search) ||
        (v.ownerName || "").toLowerCase().includes(search)
      );
    });
  }, [vendors, deferredSearchQuery]);

  const deferredFilteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const search = (deferredSearchQuery || "").toLowerCase();
      return (
        !search ||
        (c.name || "").toLowerCase().includes(search) ||
        (c.email || "").toLowerCase().includes(search) ||
        (c.mobile || "").toLowerCase().includes(search)
      );
    });
  }, [customers, deferredSearchQuery]);

  const deferredFilteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const search = (deferredSearchQuery || "").toLowerCase();
      return (
        !search ||
        (o.orderNumber || "").toLowerCase().includes(search) ||
        (o.customerName || "").toLowerCase().includes(search)
      );
    });
  }, [orders, deferredSearchQuery]);

  const fetchCustomerDetail = async (id) => {
    setDetailLoading(true);
    // setIsDetailOpen(true);
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
    // setIsVendorDetailOpen(true);
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
    navigate(`/admin/orders/${id}?type=${type || "Online"}`);
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const resp = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Order status updated to ${status}`);
        setSelectedOrder(data.data);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.data.id ? data.data : o)),
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error updating status");
    } finally {
      setUpdating(null);
    }
  };

  const fetchTransferDetail = async (id) => {
    setDetailLoading(true);
    setIsTransferDetailOpen(true);
    try {
      const resp = await fetch(`${API_URL}/stock-transfers/${id}`);
      const data = await resp.json();
      if (data.success) setViewingTransfer(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch transfer logistics.");
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

      // Validation: Discount must be lower than Base
      if (
        newProduct.discountPrice &&
        newProduct.price &&
        Number(newProduct.discountPrice) >= Number(newProduct.price)
      ) {
        setLoading(false);
        return toast.error(
          "Pricing Error: Discount price must be strictly less than the base price.",
        );
      }

      // Step 2: Create or Update product
      const basePayload = {
        ...newProduct,
        origin: newProduct.origin || null,
        price: Number(newProduct.price),
        tags: newProduct.tags
          ? newProduct.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        discountPrice:
          newProduct.discountPrice && newProduct.discountPrice !== "Optional"
            ? Number(newProduct.discountPrice)
            : null, // Send null to clear it in the DB
        imageUrls: finalImageUrls,
        ingredients: newProduct.ingredients || null,
        whyWeLoveIt: newProduct.whyWeLoveIt || null,
        benefits:
          productBenefits.filter((b) => b.text.trim()).length > 0
            ? productBenefits.filter((b) => b.text.trim())
            : null,
        howToUse: newProduct.howToUse || null,
        additionalInfo: newProduct.additionalInfo || null,
        faq:
          productFaq.filter((f) => f.q.trim() && f.a.trim()).length > 0
            ? productFaq.filter((f) => f.q.trim() && f.a.trim())
            : null,
        defaultMrp: productLabelDraft.enabled
          ? productLabelDraft.mrp || newProduct.price || null
          : undefined,
        defaultWeight: productLabelDraft.enabled
          ? productLabelDraft.weight || null
          : undefined,
        unit: productLabelDraft.enabled
          ? productLabelDraft.unit || null
          : undefined,
      };

      const payload = {
        ...basePayload,
        vendors: newProduct.vendors
          .filter((v) => v.vendorId)
          .map((v) => ({
            vendorId: v.vendorId,
            stock: Number(v.stock || 0),
          })),
      };

      const wasCreatingProduct = !editingProductId;
      const method = editingProductId ? "PUT" : "POST";
      const url = editingProductId
        ? `${API_URL}/admin/products/${editingProductId}`
        : `${API_URL}/admin/products`;

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!data.success)
        throw new Error(data.message || "Failed to save product");

      let labelCreated = false;

      if (data.data?.id) {
        const savedProduct = normalizeAdminProduct(data.data);
        setProducts((prev) => [
          savedProduct,
          ...prev.filter((product) => product.id !== savedProduct.id),
        ]);

        if (wasCreatingProduct && productLabelDraft.enabled) {
          const adminUser = JSON.parse(
            localStorage.getItem("adminUser") || "null",
          );
          const labelPayload = {
            productId: savedProduct.id,
            batchNo:
              productLabelDraft.batchNo.trim() ||
              buildAutoBatchNo(newProduct.name),
            mrp: productLabelDraft.mrp || newProduct.price || "",
            ingredients:
              productLabelDraft.ingredients || newProduct.ingredients || "",
            productionDate: productLabelDraft.productionDate || "",
            expiryDate: productLabelDraft.expiryDate || "",
            weight: productLabelDraft.weight || "",
            unit: productLabelDraft.unit || "",
            adminId: adminUser?.id,
          };
          const labelResp = await fetch(`${API_URL}/admin/product-labels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(labelPayload),
          });
          const labelData = await labelResp.json();

          if (labelData.success) {
            labelCreated = true;
          } else {
            toast.error(labelData.message || "Product saved, label failed.");
          }
        }
      }

      setNewProduct({
        name: "",
        brand: "",
        price: "",
        categoryName: "",
        description: "",
        tags: "",
        skinConcerns: [],
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
      setProductBenefits([{ icon: "✨", text: "" }]);
      setProductFaq([{ q: "", a: "" }]);
      setProductLabelDraft(createEmptyProductLabelDraft());
      setImageFiles({ primary: null, additional: [] });
      setHasMultipleImages(false);
      setEditingProductId(null);
      navigate("/admin/inventory");
      fetchDataForView("inventory");
      refreshProducts?.();
      toast.success(
        labelCreated
          ? "Product and label saved successfully!"
          : "Product saved successfully!",
      );
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
        refreshProducts?.();
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
        stock: Number(quickAddData.stock),
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
        body: JSON.stringify({
          ...newVendorData,
          approvalStatus: "APPROVED",
        }),
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
          password: "",
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

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/admin/vendors/${editingVendor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: editingVendor.businessName,
          ownerName: editingVendor.ownerName,
          contactNumber: editingVendor.contactNumber,
          email: editingVendor.email,
          businessCategory: editingVendor.businessCategory,
          storeAddress: editingVendor.storeAddress,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsEditVendorOpen(false);
        setEditingVendor(null);
        toast.success("Vendor updated successfully.");
        fetchDataForView("vendors");
      } else {
        toast.error(data.message || "Failed to update vendor.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdatePlatformQR = async () => {
    if (!platformQRFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("images", platformQRFile);
      const uploadResp = await fetch(
        `${API_URL.replace("/api", "")}/api/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const uploadData = await uploadResp.json();
      if (uploadData.success && uploadData.data.length > 0) {
        const qrUrl = uploadData.data[0];
        const resp = await fetch(`${API_URL}/admin/settings/platform`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "PLATFORM_QR", value: qrUrl }),
        });
        const data = await resp.json();
        if (data.success) {
          setPlatformSettings((prev) => ({ ...prev, PLATFORM_QR: qrUrl }));
          setPlatformQRFile(null);
          toast.success("Platform QR updated successfully.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update platform QR.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view, params = {}) => {
    setPreSelectedTransferSource(params.preSelectedSource || "");
    setPreSelectedTransferDest(params.preSelectedDest || "");
    setPreSelectedTransferItems(params.preSelectedItems || []);

    const resolvedView = view;
    navigate(resolvedView === "overview" ? "/admin" : `/admin/${resolvedView}`);
  };

  useEffect(() => {
    const handleViewChangeByEvent = (e) => {
      if (e.detail) {
        handleViewChange(e.detail);
      }
    };
    window.addEventListener("changeAdminView", handleViewChangeByEvent);
    return () =>
      window.removeEventListener("changeAdminView", handleViewChangeByEvent);
  }, []);

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

  if (loading && activeView === "overview")
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900" />
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-transparent text-stone-900">
        <Sidebar className="border-r border-stone-200/60 bg-white/90 backdrop-blur-xl shadow-[18px_0_60px_rgba(15,23,42,0.04)]">
          <SidebarHeader className="p-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-gradient-to-br from-pink-500 via-[#9a6bff] to-indigo-500 text-white font-black text-lg shadow-lg shadow-[#9a6bff]/30">
                <span className="text-transparent bg-clip-text bg-white">
                  O
                </span>
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
                      "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-300 group",
                      activeView === item.id
                        ? "bg-emerald-50 text-emerald-600 font-black shadow-sm shadow-pink-100/50"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-all",
                        activeView === item.id
                          ? "text-emerald-600 scale-110"
                          : "text-stone-400 group-hover:text-rose-500",
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
                  activeView === "home-page" || activeView === "offers"
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 w-full">
                      <LayoutGrid className="h-[18px] w-[18px] text-stone-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">
                        Storefront
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "home-page"}
                          onClick={() => handleViewChange("home-page")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "home-page"
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Hero Banner
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "offline-stores"}
                          onClick={() => handleViewChange("offline-stores")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "offline-stores"
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Offline Stores
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "watch-shop"}
                          onClick={() => handleViewChange("watch-shop")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "watch-shop"
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Watch & Shop
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendor-qrs"}
                          onClick={() => handleViewChange("vendor-qrs")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "vendor-qrs"
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Checkout QR
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "offers"}
                          onClick={() => handleViewChange("offers")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "offers"
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Promo Offers
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible
                defaultOpen={
                  activeView === "inventory" ||
                  activeView === "outlet-inventory"
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 w-full">
                      <Package className="h-[18px] w-[18px] text-stone-400 group-hover:text-emerald-600 transition-colors" />
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
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "inventory"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Products
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "product-labels"}
                          onClick={() => handleViewChange("product-labels")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "product-labels"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Product Labels
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "categories"}
                          onClick={() => handleViewChange("categories")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "categories"
                              ? "bg-emerald-50 text-emerald-600 font-bold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          Manage Categories
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "upcoming-drops"}
                          onClick={() => handleViewChange("upcoming-drops")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200 whitespace-nowrap",
                            activeView === "upcoming-drops"
                              ? "bg-emerald-50 text-pink-700 font-semibold"
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
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "special-offers"
                              ? "bg-emerald-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "special-offers" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Special Offers
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "value-bundles"}
                          onClick={() => handleViewChange("value-bundles")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "value-bundles"
                              ? "bg-emerald-50 text-pink-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "value-bundles" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Value Bundles
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "shop-by-origin"}
                          onClick={() => handleViewChange("shop-by-origin")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "shop-by-origin"
                              ? "bg-emerald-50 text-emerald-600 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "shop-by-origin" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Shop by Origin
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "stock-transfers"}
                  onClick={() => handleViewChange("stock-transfers")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-300 group",
                    activeView === "stock-transfers"
                      ? "bg-emerald-50 text-emerald-600 font-black shadow-sm"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <ArrowRightLeft
                    className={cn(
                      "h-[18px] w-[18px] transition-all",
                      activeView === "stock-transfers"
                        ? "text-emerald-600"
                        : "text-stone-400 group-hover:text-emerald-600",
                    )}
                  />
                  <span className="font-['Inter'] font-bold text-[13px] tracking-tight">
                    Stock Transfers
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "orders"}
                  onClick={() => handleViewChange("orders")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 group",
                    activeView === "orders"
                      ? "!bg-emerald-50 !text-pink-950 font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-pink-950",
                  )}
                >
                  <ShoppingCart
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      activeView === "orders"
                        ? "!text-emerald-600"
                        : "text-stone-400 group-hover:text-emerald-600",
                    )}
                  />
                  <span className="font-['Inter'] font-semibold text-[13px]">
                    Orders
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "abandoned-checkouts"}
                  onClick={() => handleViewChange("abandoned-checkouts")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 group",
                    activeView === "abandoned-checkouts"
                      ? "!bg-amber-50 !text-pink-950 font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-pink-950",
                  )}
                >
                  <Clock
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      activeView === "abandoned-checkouts"
                        ? "!text-amber-600"
                        : "text-stone-400 group-hover:text-amber-600",
                    )}
                  />
                  <span className="font-['Inter'] font-semibold text-[13px]">
                    Abandoned Carts
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-pink-950 w-full">
                      <Store className="h-[18px] w-[18px] text-stone-400 group-hover:text-emerald-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">
                        Outlet Network
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "outlet-inventory"}
                          onClick={() => handleViewChange("outlet-inventory")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "outlet-inventory"
                              ? "bg-emerald-50 text-emerald-600 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "outlet-inventory" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Network Stock
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendors"}
                          onClick={() => handleViewChange("vendors")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "vendors"
                              ? "bg-emerald-50 text-emerald-600 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendors" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Manage Outlets
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "out-of-stock"}
                          onClick={() => handleViewChange("out-of-stock")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "out-of-stock"
                              ? "bg-rose-50 text-rose-700 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "out-of-stock" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-600 mr-2" />
                          )}
                          <div className="flex items-center gap-2">
                            Stock Alerts
                            {products.filter((p) => (p.stock || 0) <= 0)
                              .length > 0 && (
                              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "vendor-analytics"}
                          onClick={() => handleViewChange("vendor-analytics")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "vendor-analytics"
                              ? "bg-emerald-50 text-emerald-600 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "vendor-analytics" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Sales Reports
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "offline-billing"}
                          onClick={() => handleViewChange("offline-billing")}
                          className={cn(
                            "font-['Inter'] font-medium text-[12px] py-3 px-3 rounded-full transition-all duration-200",
                            activeView === "offline-billing"
                              ? "bg-emerald-50 text-emerald-600 font-semibold"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "offline-billing" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Offline POS
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
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 group",
                    activeView === "coupons"
                      ? "!bg-emerald-50 !text-stone-900 font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <Ticket
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      activeView === "coupons"
                        ? "!text-emerald-600"
                        : "text-stone-400 group-hover:text-emerald-600",
                    )}
                  />
                  <span className="font-['Inter'] font-semibold text-[13px]">
                    Coupons
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible
                defaultOpen={
                  activeView === "customers" || activeView === "segments"
                }
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 w-full">
                      <UserPlus className="h-[18px] w-[18px] text-stone-400 group-hover:text-emerald-600 transition-colors" />
                      <span className="font-['Inter'] font-semibold text-[13px] flex-1 text-left">
                        Customers
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-stone-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-4 border-l-2 border-stone-100 ml-7 py-1 mt-1 space-y-0.5">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "customers"}
                          onClick={() => handleViewChange("customers")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "customers"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          All Customers
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeView === "segments"}
                          onClick={() => handleViewChange("segments")}
                          className={cn(
                            "font-['Inter'] font-bold text-[12px] py-3 px-3 rounded-full transition-all duration-300 whitespace-nowrap",
                            activeView === "segments"
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
                          )}
                        >
                          {activeView === "segments" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-2" />
                          )}
                          Segments
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Points */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "points"}
                  onClick={() => handleViewChange("points")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-300 group",
                    activeView === "points"
                      ? "bg-emerald-50 text-emerald-600 font-black shadow-sm shadow-pink-100/50"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <Coins
                    className={cn(
                      "h-[18px] w-[18px] transition-all",
                      activeView === "points"
                        ? "text-emerald-600 scale-110"
                        : "text-stone-400 group-hover:text-rose-500",
                    )}
                  />
                  <span className="font-['Inter'] font-bold text-[13px] tracking-tight">
                    Points
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "notifications"}
                  onClick={() => handleViewChange("notifications")}
                  className={cn(
                    "flex items-center gap-3 py-5 px-4 rounded-full transition-all duration-300 group",
                    activeView === "notifications"
                      ? "bg-indigo-50 text-indigo-600 font-black shadow-sm shadow-indigo-100/50"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                  )}
                >
                  <Bell
                    className={cn(
                      "h-[18px] w-[18px] transition-all",
                      activeView === "notifications"
                        ? "text-indigo-600"
                        : "text-stone-400 group-hover:text-indigo-600",
                    )}
                  />
                  <span className="font-['Inter'] font-bold text-[13px] tracking-tight">
                    Notifications
                  </span>
                  {adminNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[9px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-in zoom-in-50 duration-500">
                      {adminNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-stone-100 flex-shrink-0 bg-white">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-500 group/logout font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover/logout:-translate-x-1" />
              Logout
            </button>
          </SidebarFooter>
        </Sidebar>

        <div
          className="flex-1 min-w-0 min-h-0 h-full flex flex-col relative overflow-y-auto overflow-x-hidden z-0 bg-transparent"
          data-lenis-prevent
          data-lenis-prevent-wheel
        >
          <header className="h-[80px] bg-white/80 backdrop-blur-xl px-8 lg:px-12 flex items-center justify-between sticky top-0 z-[100] border-b border-stone-200/50 transition-all duration-500">
            {/* Left: Status & Sidebar Trigger */}
            <div className="flex items-center gap-8">
              <SidebarTrigger className="lg:hidden text-stone-900 hover:text-indigo-600 transition-colors" />
              <SystemClock />
            </div>

            {/* Middle: Search Bar (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-12 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-indigo-600 transition-all duration-300" />
              </div>
              <Input
                placeholder="Search protocol, items, or nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100/50 border-stone-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:bg-white focus-visible:border-indigo-500/50 pl-12 h-11 rounded-[5px] transition-all duration-300 placeholder:text-stone-400 placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-[0.1em] font-bold text-sm shadow-inner"
              />
            </div>

            {/* Right: Actions & Notifications */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-stone-100/50 border border-stone-200/60 rounded-xl p-1.5 shadow-inner">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-lg text-stone-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all relative group"
                    >
                      <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      {adminNotifications.filter((n) => !n.isRead).length >
                        0 && (
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[380px] p-0 rounded-2xl border-stone-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
                  >
                    <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">
                          Transmission Ledger
                        </span>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                          System Status: Nominal
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {adminNotifications.filter((n) => !n.isRead).length >
                          0 && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Bulk mark as read
                              try {
                                const unread = adminNotifications.filter(
                                  (n) => !n.isRead,
                                );
                                await Promise.all(
                                  unread.map((n) =>
                                    fetch(
                                      `${API_URL}/notifications/${n.id}/read`,
                                      { method: "PATCH" },
                                    ),
                                  ),
                                );
                                setAdminNotifications((prev) =>
                                  prev.map((n) => ({ ...n, isRead: true })),
                                );
                                toast.success("Ledger synchronized");
                              } catch (err) {}
                            }}
                            className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full transition-all"
                          >
                            Mark All
                          </button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="max-h-[480px]">
                      {adminNotifications.length === 0 ? (
                        <div className="py-20 px-10 text-center relative overflow-hidden group">
                          <div className="absolute inset-0 bg-linear-to-b from-stone-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative z-10">
                            <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                              <Bell className="h-8 w-8 text-stone-300" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-900 mb-2">
                              System Clear
                            </h3>
                            <p className="text-[10px] font-bold text-stone-400 leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest">
                              No active alerts in the current protocol window.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-stone-50">
                          {adminNotifications.slice(0, 8).map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) markAdminNotificationRead(n.id);
                                handleViewChange("notifications");
                              }}
                              className={cn(
                                "group flex items-start gap-4 p-5 text-left hover:bg-stone-50/80 transition-all duration-300 relative overflow-hidden",
                                !n.isRead && "bg-indigo-50/20",
                              )}
                            >
                              {!n.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                              )}
                              
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                                !n.isRead 
                                  ? "bg-indigo-50 border-indigo-100 text-indigo-600 scale-105 shadow-sm" 
                                  : "bg-stone-50 border-stone-100 text-stone-400 opacity-60"
                              )}>
                                {n.title?.toLowerCase().includes("order") ? (
                                  <ShoppingCart className="h-4 w-4" />
                                ) : n.title?.toLowerCase().includes("stock") ? (
                                  <AlertCircle className="h-4 w-4" />
                                ) : (
                                  <Bell className="h-4 w-4" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={cn(
                                    "text-[11px] font-black uppercase tracking-tight truncate",
                                    !n.isRead ? "text-stone-900" : "text-stone-500"
                                  )}>
                                    {n.title}
                                  </span>
                                  <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap bg-stone-100 px-2 py-0.5 rounded-full">
                                    <LiveTimeAgo updatedAt={n.createdAt} />
                                  </span>
                                </div>
                                <p className={cn(
                                  "text-[11px] font-medium leading-relaxed line-clamp-2 transition-colors",
                                  !n.isRead ? "text-stone-600" : "text-stone-400"
                                )}>
                                  {n.message}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <button
                      onClick={() => handleViewChange("notifications")}
                      className="w-full p-4 text-center bg-stone-50/50 hover:bg-stone-100/50 border-t border-stone-100 transition-all group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 group-hover:tracking-[0.3em] transition-all">
                        View All Transmissions
                      </span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="w-px h-4 bg-stone-200/60 mx-1" />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-stone-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all group"
                >
                  <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 w-full px-6 py-8 lg:px-8 xl:px-10">
            <div className="flex w-full flex-col gap-10">
              {activeView === "homepage-categories" && (
                <AdminHomepageCategories />
              )}
              {activeView === "categories" && <CategoryManager />}
              {activeView === "offline-billing" && <VendorOfflineBilling />}
              {activeView === "points" && <PointsSettings />}
              {activeView === "coupons" && <AdminCouponManager />}
              {activeView === "shop-by-origin" && <OriginManager />}
              {activeView === "origin-editor" && <OriginEditor />}

              {activeView === "notifications" && (
                <NotificationsSection
                  notifications={adminNotifications}
                  loading={notifLoading}
                  onMarkRead={markAdminNotificationRead}
                  onRefresh={fetchAdminNotifications}
                />
              )}

              {activeView === "stock-transfers" && (
                <StockTransferView
                  transfers={stockTransfers}
                  products={products}
                  onViewDetail={fetchTransferDetail}
                  onRefresh={() => fetchDataForView("stock-transfers")}
                  onCreateOpen={() => handleViewChange("create-transfer")}
                  vendors={vendors}
                  API_URL={API_URL}
                  formatMoney={formatMoney}
                />
              )}
              {activeView === "create-transfer" && (
                <CreateTransferView
                  vendors={vendors}
                  products={products}
                  API_URL={API_URL}
                  adminId={user?.id}
                  initialSourceId={preSelectedTransferSource}
                  initialDestId={preSelectedTransferDest}
                  initialItems={preSelectedTransferItems}
                  onSuccess={() => {
                    fetchDataForView("stock-transfers");
                    handleViewChange("stock-transfers");
                  }}
                  onCancel={() => handleViewChange("stock-transfers")}
                />
              )}

              {activeView === "abandoned-checkouts" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <h1
                        className={`${THEME.typography.headings.h1} bg-clip-text text-transparent bg-linear-to-r from-amber-600 to-orange-400 pb-1`}
                      >
                        Abandoned Checkouts
                      </h1>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Carts inactive beyond the set threshold — reach out and
                        recover.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 border border-amber-100 rounded-[5px] px-4 py-2 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                          Live Tracking
                        </span>
                      </div>
                      <select
                        value={abandonedThreshold}
                        onChange={(e) =>
                          setAbandonedThreshold(Number(e.target.value))
                        }
                        className="bg-white border border-stone-200 rounded-[5px] px-4 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
                      >
                        <option value={0}>Live (Anytime)</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={180}>3 hours</option>
                        <option value={360}>6 hours</option>
                        <option value={720}>12 hours</option>
                        <option value={1440}>24 hours</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAbandonedCarts(abandonedThreshold)}
                        className="rounded-[5px] text-[10px] font-black uppercase tracking-widest border-stone-200 hover:bg-stone-50 px-4 py-2 h-auto"
                      >
                        Refresh
                      </Button>
                    </div>
                  </header>

                  {/* KPI Summary Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[5px] bg-amber-100 flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Abandoned Carts
                          </p>
                          <p className="text-2xl font-black text-stone-900">
                            {abandonedCarts.length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[5px] bg-sky-100 flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Total Items at Risk
                          </p>
                          <p className="text-2xl font-black text-stone-900">
                            {abandonedCarts.reduce(
                              (sum, c) =>
                                sum +
                                (Array.isArray(c.items)
                                  ? c.items.reduce(
                                      (s, i) => s + (i.qty || 1),
                                      0,
                                    )
                                  : 0),
                              0,
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[5px] bg-emerald-100 flex items-center justify-center shrink-0">
                          <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Potential Revenue
                          </p>
                          <p className="text-2xl font-black text-stone-900">
                            {formatMoney(
                              abandonedCarts.reduce((sum, c) => {
                                if (!Array.isArray(c.items)) return sum;
                                return (
                                  sum +
                                  c.items.reduce(
                                    (s, i) =>
                                      s + (Number(i.price) || 0) * (i.qty || 1),
                                    0,
                                  )
                                );
                              }, 0),
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Data Table */}
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spinner className="h-8 w-8" />
                    </div>
                  ) : abandonedCarts.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-[5px] bg-white/70 backdrop-blur-xl">
                      <CardContent className="p-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-black text-stone-900 mb-1">
                          All Clear
                        </h3>
                        <p className="text-sm text-stone-500 font-medium">
                          No abandoned carts detected beyond the{" "}
                          {abandonedThreshold}-minute threshold.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[5px] overflow-hidden bg-white/70 backdrop-blur-xl">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-stone-50/80 border-b border-stone-100">
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Customer
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Contact
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Items
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Cart Value
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Last Active
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-stone-500 uppercase tracking-widest py-4 px-5">
                                Time Since
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {abandonedCarts.map((cart, index) => {
                              const items = Array.isArray(cart.items)
                                ? cart.items
                                : [];
                              const totalItems = items.reduce(
                                (s, i) => s + (i.qty || 1),
                                0,
                              );
                              const cartValue = items.reduce(
                                (s, i) =>
                                  s + (Number(i.price) || 0) * (i.qty || 1),
                                0,
                              );

                              return (
                                <TableRow
                                  key={cart._id || index}
                                  onClick={() => setSelectedAbandonedCart(cart)}
                                  className="border-stone-50 hover:bg-stone-50/50 transition-all cursor-pointer group h-20"
                                >
                                  <TableCell className="py-4 px-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-white text-[10px] font-black group-hover:scale-105 transition-all">
                                        {(cart.customer?.name || "G")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-black text-stone-900 leading-none group-hover:text-amber-600 transition-colors">
                                          {cart.customer?.name ||
                                            "Guest Checkout"}
                                        </span>
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5 opacity-60">
                                          SESSION_
                                          {cart._id?.slice(-8).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-5">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-stone-300" />
                                        <span className="text-[11px] font-bold text-stone-600 tracking-tight">
                                          {cart.customer?.mobile || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-stone-300" />
                                        <span className="text-[11px] font-medium text-stone-400 truncate max-w-[120px]">
                                          {cart.customer?.email || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-100 rounded-[5px]">
                                      <ShoppingBag className="h-3 w-3 text-stone-400" />
                                      <span className="text-xs font-black text-stone-700">
                                        {totalItems}{" "}
                                        {totalItems === 1 ? "Item" : "Items"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-5">
                                    <span className="text-base font-black text-stone-900 font-mono">
                                      {formatMoney(cartValue)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-4 px-5">
                                    <span className="text-xs font-medium text-stone-500">
                                      {new Date(
                                        cart.updatedAt,
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      ,{" "}
                                      {new Date(
                                        cart.updatedAt,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell className="py-4 px-5">
                                    <LiveTimeAgo
                                      updatedAt={cart.updatedAt}
                                      serverSkew={serverSkew}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}

                  {/* Info Note */}
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-[5px] flex items-start gap-4">
                    <div className="h-8 w-8 rounded-[5px] bg-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                      <Info className="h-4 w-4" />
                    </div>
                    <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                      This dashboard auto-refreshes every 60 seconds. Carts are
                      tracked only for logged-in customers. When a customer
                      completes checkout, their cart is automatically removed
                      from this list. Adjust the time threshold above to capture
                      carts abandoned for different durations.
                    </p>
                  </div>
                </div>
              )}
              {activeView === "out-of-stock" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <header className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h1
                        className={`${THEME.typography.headings.h1} bg-clip-text text-transparent bg-linear-to-r from-rose-600 to-rose-400 pb-1`}
                      >
                        Inventory Depletion Controls
                      </h1>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Critical tracking for products with zero or near-zero
                        stock levels.
                      </p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-[5px] px-4 py-2 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">
                        Live Alert Feed
                      </span>
                    </div>
                  </header>

                  <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[5px] overflow-hidden bg-white/70 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50/50">
                          <TableRow className="border-stone-100 h-16">
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              Product Module
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">
                              Stock Inventory
                            </TableHead>
                            <TableHead className="px-8 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">
                              Status
                            </TableHead>
                            <TableHead className="px-8 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              Command
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedProducts.filter((p) => (p.stock || 0) <= 0)
                            .length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-64 text-center"
                              >
                                <div className="flex flex-col items-center justify-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="h-8 w-8" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-stone-900 uppercase tracking-tighter">
                                      Inventory Optimized
                                    </h4>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                      No critical stock depletions detected.
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            groupedProducts
                              .filter((p) => (p.stock || 0) <= 0)
                              .map((p) => (
                                <TableRow
                                  key={p.id}
                                  className="border-stone-50 hover:bg-stone-50/50 transition-all duration-300"
                                >
                                  <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-[5px] bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                                        {p.imageUrls?.[0] ? (
                                          <img
                                            src={getMediaUrl(p.imageUrls[0])}
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-stone-300">
                                            IMG
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-black text-stone-900 text-sm truncate uppercase tracking-tight">
                                          {p.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                          {p.brand || "OMW Skincare"}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                      <span
                                        className={cn(
                                          "px-3 py-1 rounded-full border text-[10px] font-black transition-all",
                                          (p.stock || 0) <= 0
                                            ? "bg-rose-50 border-rose-100 text-rose-600 shadow-sm"
                                            : "bg-emerald-50 border-emerald-100 text-emerald-600",
                                        )}
                                      >
                                        {p.stock || 0} Units Current
                                      </span>
                                      <div className="relative w-24">
                                        <Input
                                          type="number"
                                          placeholder="+ Add"
                                          value={
                                            inlineStockChanges[p.id]?.stock ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            setInlineStockChanges((prev) => ({
                                              ...prev,
                                              [p.id]: {
                                                ...(prev[p.id] || { stock: 0 }),
                                                stock:
                                                  parseInt(e.target.value) || 0,
                                              },
                                            }))
                                          }
                                          className="h-8 bg-stone-50 border-stone-200 focus:border-rose-300 rounded-lg text-xs font-black text-center"
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 text-center">
                                    {inlineStockChanges[p.id] &&
                                    inlineStockChanges[p.id].stock > 0 ? (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-full px-3 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                        Ready to Sync
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-rose-100 text-rose-700 border-none rounded-full px-3 text-[9px] font-black uppercase tracking-widest">
                                        Depleted
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="px-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {inlineStockChanges[p.id]?.stock > 0 && (
                                        <Button
                                          onClick={() =>
                                            handleInlineRestock(
                                              p,
                                              inlineStockChanges[p.id]?.stock ||
                                                0,
                                            )
                                          }
                                          disabled={loading}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[5px] h-10 w-10 p-0 shadow-lg shadow-emerald-200 transition-all hover:scale-110 active:scale-90"
                                        >
                                          <Check className="h-5 w-5" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedRestockProduct(p);
                                          setRestockAmount({ stock: 0 });
                                          setIsRestockOpen(true);
                                        }}
                                        className="border-stone-200 text-stone-600 hover:bg-stone-50 rounded-[5px] h-10 w-10 p-0"
                                      >
                                        <Maximize2 className="h-4 w-4" />
                                      </Button>
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
              {activeView === "overview" && (
                <OverviewSection
                  stats={stats}
                  products={products}
                  vendors={vendors}
                  analyticsData={analyticsData}
                  selectedTimeRange={selectedTimeRange}
                  handleVendorAnalyticsFilterChange={
                    handleVendorAnalyticsFilterChange
                  }
                  formatMoney={formatMoney}
                  handleViewChange={handleViewChange}
                  setPreSelectedTransferSource={setPreSelectedTransferSource}
                  setPreSelectedTransferItems={setPreSelectedTransferItems}
                  deferredFilteredProducts={deferredFilteredProducts}
                  groupedProducts={groupedProducts}
                  getMediaUrl={getMediaUrl}
                  toast={toast}
                />
              )}

              {activeView === "home-page" && (
                <BannerManagementSection
                  banners={banners}
                  handleOpenAddBanner={handleOpenAddBanner}
                  handleEditBanner={handleEditBanner}
                  handleDeleteBanner={handleDeleteBanner}
                  handleToggleBanner={handleToggleBanner}
                  isAddBannerOpen={isAddBannerOpen}
                  setIsAddBannerOpen={setIsAddBannerOpen}
                  editingBannerId={editingBannerId}
                  bannerFormData={bannerFormData}
                  setBannerFormData={setBannerFormData}
                  handleFileUpload={handleFileUpload}
                  handleRemoveAsset={handleRemoveAsset}
                  handleSaveBanner={handleSaveBanner}
                  fileInputRef={fileInputRef}
                />
              )}

              {activeView === "watch-shop" && (
                <WatchShopManagementSection
                  watchShopItems={watchShopItems}
                  handleOpenAddWatch={handleOpenAddWatch}
                  handleDeleteWatch={handleDeleteWatch}
                  handleToggleWatch={handleToggleWatch}
                  isAddWatchOpen={isAddWatchOpen}
                  setIsAddWatchOpen={setIsAddWatchOpen}
                  editingWatchId={editingWatchId}
                  watchFormData={watchFormData}
                  setWatchFormData={setWatchFormData}
                  watchVideoFile={watchVideoFile}
                  setWatchVideoFile={setWatchVideoFile}
                  productSearchQuery={productSearchQuery}
                  setProductSearchQuery={setProductSearchQuery}
                  filteredProductOptions={filteredProductOptions}
                  handleSaveWatch={handleSaveWatch}
                  watchVideoInputRef={watchVideoInputRef}
                  loading={loading}
                />
              )}

              {activeView === "offline-stores" && (
                <OfflineStoresSection
                  offlineStores={offlineStores}
                  handleOpenAddStore={handleOpenAddStore}
                  handleDeleteStore={handleDeleteStore}
                  handleToggleStore={handleToggleStore}
                  isAddStoreOpen={isAddStoreOpen}
                  setIsAddStoreOpen={setIsAddStoreOpen}
                  editingStoreId={editingStoreId}
                  storeFormData={storeFormData}
                  setStoreFormData={setStoreFormData}
                  handleSaveStore={handleSaveStore}
                />
              )}

              {activeView === "offers" && (
                <OffersSection
                  offers={offers}
                  handleOpenAddOffer={handleOpenAddOffer}
                  handleDeleteOffer={handleDeleteOffer}
                  handleToggleOffer={handleToggleOffer}
                  isAddOfferOpen={isAddOfferOpen}
                  setIsAddOfferOpen={setIsAddOfferOpen}
                  editingOfferId={editingOfferId}
                  offerFormData={offerFormData}
                  setOfferFormData={setOfferFormData}
                  offerMainImageFile={offerMainImageFile}
                  setOfferMainImageFile={setOfferMainImageFile}
                  offerFreeImageFile={offerFreeImageFile}
                  setOfferFreeImageFile={setOfferFreeImageFile}
                  offerMainImageRef={offerMainImageRef}
                  offerFreeImageRef={offerFreeImageRef}
                  productSearchQuery={productSearchQuery}
                  setProductSearchQuery={setProductSearchQuery}
                  filteredProductOptions={filteredProductOptions}
                  handleSaveOffer={handleSaveOffer}
                  loading={loading}
                />
              )}

              {activeView === "inventory" && (
                <InventorySection
                  THEME={THEME}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                  handleCreateProductClick={handleCreateProductClick}
                  loading={loading}
                  deferredFilteredProducts={deferredFilteredProducts}
                  getMediaUrl={getMediaUrl}
                  setSelectedRestockProduct={setSelectedRestockProduct}
                  setIsRestockOpen={setIsRestockOpen}
                  handleEditProduct={handleEditProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  handleViewChange={handleViewChange}
                  vendors={vendors}
                />
              )}

              {activeView === "outlet-inventory" && <OutletInventorySection />}

              {activeView === "product-labels" && (
                <ProductLabelsSection products={products} vendors={vendors} />
              )}

              {activeView === "upcoming-drops" && <UpcomingDropsManager />}

              {activeView === "special-offers" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                  <header className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h1
                        className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.adminBrand} pb-1`}
                      >
                        Special Offer Curation
                      </h1>
                      <p className={`${THEME.typography.micro.muted}`}>
                        Strategically manage featured checkout deals to maximize
                        order values.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50/50 p-2 rounded-[5px] border border-indigo-100/50">
                      <div className="h-2 w-2 rounded-[5px] bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-[#151515] uppercase tracking-widest">
                        Live in Checkout
                      </span>
                    </div>
                  </header>

                  <div className="space-y-16">
                    {["Deal 1", "Deal 2", "Deal 3", "Deal 4"].map(
                      (slotName) => {
                        const slotProducts = products.filter(
                          (p) => p.specialOfferType === slotName,
                        );

                        return (
                          <div key={slotName} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                              <div
                                className={`h-11 w-11 rounded-[5px] bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-200`}
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
                              {slotProducts.map((deal, idx) => (
                                <div
                                  key={deal.id}
                                  className="relative group/slot h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                                >
                                  <div
                                    className={`absolute -inset-1 bg-linear-to-r from-emerald-500 to-teal-600 ${THEME.borders.radius.xl} blur opacity-5 group-hover/slot:opacity-20 transition duration-1000 group-hover/slot:duration-200`}
                                  ></div>
                                  <Card
                                    className={`relative bg-white border border-stone-200/50 ${THEME.borders.radius.xl} overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-1 flex flex-col p-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-emerald-100 group/card`}
                                  >
                                    <div
                                      className={`aspect-16/10 w-full ${THEME.borders.radius.xl} overflow-hidden bg-stone-50 border border-stone-100/50 relative mb-3 group/img shrink-0`}
                                    >
                                      <img
                                        src={
                                          deal.imageUrls?.[0]?.startsWith(
                                            "http",
                                          )
                                            ? deal.imageUrls[0]
                                            : `${API_URL.replace("/api", "")}${deal.imageUrls?.[0] || ""}` ||
                                              "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
                                        }
                                        alt={deal.name}
                                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                                      />
                                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                        <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                          {idx + 2}
                                        </div>
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
                                              price: deal.price,
                                              stock:
                                                deal.stock ||
                                                deal.stock ||
                                                "100",
                                              vendorId: deal.vendorId || "",
                                              imageUrl:
                                                deal.imageUrls?.[0] || "",
                                            });
                                            setIsQuickAddOpen(true);
                                          }}
                                          className="h-8 px-4 rounded-[5px] bg-white shadow-lg text-emerald-600 hover:bg-emerald-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
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
                                          className="h-8 w-8 p-0 rounded-[5px] shadow-lg font-black bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:scale-105"
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
                                  className={`relative bg-stone-50/30 border-stone-200/60 border-dashed border-2 ${THEME.borders.radius.xl} overflow-hidden flex-1 flex flex-col transition-all duration-300 hover:border-indigo-300 hover:bg-emerald-50/10`}
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
                                          price: "",
                                          stock: "100",
                                          vendorId: "",
                                        });
                                        setIsQuickAddOpen(true);
                                      }}
                                      className={`h-12 w-12 ${THEME.borders.radius.xl} bg-white border border-stone-200 flex items-center justify-center group/add cursor-pointer hover:bg-emerald-600 hover:border-pink-600 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 transition-all duration-300 shadow-sm`}
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
                      },
                    )}
                  </div>

                  <div className="mt-20 p-10 bg-stone-50 rounded-3xl border border-stone-100 flex items-start gap-6">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 shrink-0">
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
              {activeView === "value-bundles" && <ValueBundlesManager />}

              {activeView === "orders" && !subView && (
                <div className="space-y-8 animate-in fade-in">
                  <header>
                    <h1
                      className={`${THEME.typography.headings.h1} bg-clip-text text-transparent ${THEME.gradients.adminBrand} pb-1`}
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
                      <TabsList className="bg-stone-50/50 p-1 rounded-xl border border-stone-100 gap-1.5 h-auto w-fit">
                        <TabsTrigger
                          value="online"
                          className="rounded-lg px-8 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Online
                        </TabsTrigger>
                        <TabsTrigger
                          value="pre-order"
                          className="rounded-lg px-8 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Pre-Order
                        </TabsTrigger>
                        <TabsTrigger
                          value="offline"
                          className="rounded-lg px-8 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Offline
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex items-center gap-3">
                        <div className="relative group/search max-w-md">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            placeholder="TRANSACTION SEARCH..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-stone-200 rounded-xl py-2.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest w-[240px] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <TabsContent
                      value="online"
                      className="animate-in slide-in-from-bottom-2 duration-500"
                    >
                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-stone-200/50">
                        <Table>
                          <TableHeader className="bg-stone-50/50">
                            <TableRow className="border-stone-100/50 h-14">
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                ID_REF
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                CLIENT_META
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                ASSIGN VENDOR
                              </TableHead>
                              <TableHead className="px-6 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                SETTLEMENT
                              </TableHead>
                              <TableHead className="px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                PROTOCOL_STATUS
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              [1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="animate-pulse">
                                  <TableCell
                                    colSpan={5}
                                    className="h-20 bg-stone-50/10"
                                  />
                                </TableRow>
                              ))
                            ) : deferredFilteredOrders.filter(
                                (o) => o.type === "Online",
                              ).length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center p-32 text-stone-300 font-black uppercase tracking-[0.4em] text-[10px]"
                                >
                                  No Digital Transmissions Detected
                                </TableCell>
                              </TableRow>
                            ) : (
                              deferredFilteredOrders
                                .filter((o) => o.type === "Online")
                                .map((o) => (
                                  <TableRow
                                    key={o.id}
                                    onClick={() =>
                                      fetchOrderDetail(o.id, "Online")
                                    }
                                    className="border-stone-50 hover:bg-stone-50/50 transition-all duration-300 cursor-pointer group h-20"
                                  >
                                    <TableCell className="px-6">
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[12px] font-black text-stone-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                                            {o.orderNumber}
                                          </span>
                                          <div className="h-1 w-1 rounded-full bg-stone-200" />
                                          <span className="text-[10px] font-bold text-stone-300 italic uppercase">
                                            {o.status === "PLACED"
                                              ? "Syncing"
                                              : "Active"}
                                          </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <Calendar className="h-2.5 w-2.5" />
                                          {new Date(
                                            o.createdAt,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-stone-100 shadow-sm">
                                          <AvatarFallback className="bg-stone-950 text-white font-black text-[9px]">
                                            {(o.customerName ||
                                              o.customer?.name)?.[0] || "C"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[11px] font-black text-stone-800 uppercase tracking-tight">
                                            {o.customerName ||
                                              o.customer?.name ||
                                              "GUEST"}
                                          </span>
                                          {(o.customer?.mobile || o.mobile) && (
                                            <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                                              <Phone className="h-2 w-2 opacity-50" />
                                              {o.customer?.mobile || o.mobile}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-black text-stone-800 uppercase tracking-tight truncate max-w-[150px] flex items-center gap-1.5">
                                          <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                          {o.vendorName ||
                                            o.vendor?.businessName ||
                                            "VENDOR UNASSIGNED"}
                                        </span>
                                        <span className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                          <MapPin className="h-2.5 w-2.5 opacity-50" />
                                          {o.shippingAddress?.city || "SYSTEM"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                      <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-[15px] font-black text-stone-900 tracking-tighter">
                                          &#8377;
                                          {parseFloat(
                                            o.totalAmount,
                                          ).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </span>
                                        <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">
                                          Net Settlement
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <div className="flex justify-center">
                                        <Badge
                                          className={cn(
                                            "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 border-none rounded-md shadow-sm ring-1",
                                            o.status === "DELIVERED"
                                              ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10"
                                              : o.status === "PLACED"
                                                ? "bg-indigo-50 text-indigo-600 ring-indigo-500/10"
                                                : "bg-stone-50 text-stone-500 ring-stone-200",
                                          )}
                                        >
                                          {o.status}
                                        </Badge>
                                      </div>
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
                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-stone-200/50">
                        <Table>
                          <TableHeader className="bg-stone-50/50">
                            <TableRow className="border-stone-100/50 h-14">
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                RESERVATION_REF
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                CLIENT_META
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                TARGET_NODE
                              </TableHead>
                              <TableHead className="px-6 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                VALUE
                              </TableHead>
                              <TableHead className="px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                STATUS
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              [1, 2, 3].map((i) => (
                                <TableRow key={i} className="animate-pulse">
                                  <TableCell
                                    colSpan={5}
                                    className="h-20 bg-stone-50/10"
                                  />
                                </TableRow>
                              ))
                            ) : deferredFilteredOrders.filter(
                                (o) => o.type === "PreOrder",
                              ).length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center p-32 text-stone-300 font-black uppercase tracking-[0.4em] text-[10px]"
                                >
                                  No active reservations found
                                </TableCell>
                              </TableRow>
                            ) : (
                              deferredFilteredOrders
                                .filter((o) => o.type === "PreOrder")
                                .map((o) => (
                                  <TableRow
                                    key={o.id}
                                    onClick={() =>
                                      fetchOrderDetail(o.id, "PreOrder")
                                    }
                                    className="border-stone-50 hover:bg-stone-50/50 transition-all duration-300 cursor-pointer group h-20"
                                  >
                                    <TableCell className="px-6">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[12px] font-black text-stone-900 tracking-tight uppercase">
                                          {o.orderNumber}
                                        </span>
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <Calendar className="h-2.5 w-2.5" />
                                          {new Date(
                                            o.createdAt,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-stone-100 shadow-sm">
                                          <AvatarFallback className="bg-stone-950 text-white font-black text-[9px]">
                                            {(o.customerName ||
                                              o.customer?.name)?.[0] || "C"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[11px] font-black text-stone-800 uppercase tracking-tight">
                                            {o.customerName || o.customer?.name}
                                          </span>
                                          {(o.mobile || o.customer?.mobile) && (
                                            <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                                              <Phone className="h-2 w-2 opacity-50" />
                                              {o.mobile || o.customer?.mobile}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        {o.vendorName ||
                                          o.vendor?.businessName ||
                                          "UNASSIGNED"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                      <span className="text-[15px] font-black text-stone-900 tracking-tighter">
                                        &#8377;
                                        {parseFloat(
                                          o.totalAmount,
                                        ).toLocaleString()}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-6 text-center">
                                      <Badge className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-amber-50 text-amber-600 border-none ring-1 ring-amber-500/10">
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
                      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-stone-200/50">
                        <Table>
                          <TableHeader className="bg-stone-50/50">
                            <TableRow className="border-stone-100/50 h-14">
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                MANUAL_REF
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                CLIENT_META
                              </TableHead>
                              <TableHead className="px-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                AUTHORIZED_NODE
                              </TableHead>
                              <TableHead className="px-6 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                SETTLEMENT
                              </TableHead>
                              <TableHead className="px-6 text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                ARCHIVE_STATUS
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              [1, 2, 3].map((i) => (
                                <TableRow key={i} className="animate-pulse">
                                  <TableCell
                                    colSpan={5}
                                    className="h-20 bg-stone-50/10"
                                  />
                                </TableRow>
                              ))
                            ) : deferredFilteredOrders.filter(
                                (o) => o.type === "Offline",
                              ).length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center p-32 text-stone-300 font-black uppercase tracking-[0.4em] text-[10px]"
                                >
                                  No manual records found
                                </TableCell>
                              </TableRow>
                            ) : (
                              deferredFilteredOrders
                                .filter((o) => o.type === "Offline")
                                .map((o) => (
                                  <TableRow
                                    key={o.id}
                                    onClick={() =>
                                      fetchOrderDetail(o.id, "Offline")
                                    }
                                    className="border-stone-50 hover:bg-stone-50/50 transition-all duration-300 cursor-pointer group h-20"
                                  >
                                    <TableCell className="px-6">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[12px] font-black text-stone-900 tracking-tight uppercase">
                                          {o.orderNumber}
                                        </span>
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <Calendar className="h-2.5 w-2.5" />
                                          {new Date(
                                            o.createdAt,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-stone-100 shadow-sm">
                                          <AvatarFallback className="bg-stone-950 text-white font-black text-[9px]">
                                            {(o.customerName ||
                                              o.customer?.name)?.[0] || "C"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[11px] font-black text-stone-800 uppercase tracking-tight">
                                            {o.customerName || o.customer?.name}
                                          </span>
                                          {(o.mobile || o.customer?.mobile) && (
                                            <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                                              <Phone className="h-2 w-2 opacity-50" />
                                              {o.mobile || o.customer?.mobile}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                      <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                        {o.vendorName ||
                                          o.vendor?.businessName ||
                                          "INTERNAL"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                      <span className="text-[15px] font-black text-stone-900 tracking-tighter">
                                        &#8377;
                                        {parseFloat(
                                          o.totalAmount,
                                        ).toLocaleString()}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                      <Badge className="bg-stone-50 text-stone-400 border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg ring-1 ring-stone-200">
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

              {activeView === "orders" && subView && (
                <div className="space-y-8 animate-in fade-in">
                  <header className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/orders")}
                        className="h-10 w-10 p-0 rounded-xl bg-white border border-stone-100 shadow-sm hover:bg-stone-50"
                      >
                        <ChevronLeft className="h-5 w-5 text-stone-600" />
                      </Button>
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-stone-900">
                          Order Intelligence
                        </h1>
                        <p className="text-stone-400 text-sm font-medium mt-0.5">
                          Detailed transaction analysis and fulfillment control.
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white border-stone-100 text-stone-600 font-bold px-4 py-2 rounded-xl flex gap-2 items-center shadow-sm"
                    >
                      <ShieldCheck className="h-4 w-4 text-indigo-500" />
                      Secure & Verified
                    </Badge>
                  </header>

                  {!selectedOrder || selectedOrder.id !== subView ? (
                    <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-100 border-t-stone-900 mb-4" />
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        Synchronizing Order Data...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {/* Order Header Info */}
                      <header className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-50/20 blur-[80px] rounded-full -mr-16 -mt-16" />
                        <div className="flex justify-between items-start relative z-10">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Badge
                                className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border-none rounded-lg shadow-sm ring-1",
                                  selectedOrder.status === "PLACED"
                                    ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                                    : "bg-stone-100 text-stone-500 ring-stone-400/20",
                                )}
                              >
                                {selectedOrder.status}
                              </Badge>
                              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                <Navigation className="h-3 w-3" />
                                {selectedOrder.type || "Online"} Transmission
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.4em] ml-0.5">
                                Protocol Identifier
                              </p>
                              <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black tracking-tight uppercase leading-none text-stone-900">
                                  {selectedOrder.orderNumber}
                                </h2>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-stone-300 hover:text-stone-900"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedOrder.orderNumber,
                                    );
                                    toast.success("Order number copied");
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400">
                                <Calendar className="h-3.5 w-3.5" />
                                Placed on{" "}
                                {new Date(
                                  selectedOrder.createdAt,
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                                ,{" "}
                                {new Date(
                                  selectedOrder.createdAt,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-[#FAFBFF] p-4 rounded-2xl border border-indigo-50 shadow-inner min-w-[200px]">
                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">
                                Settlement Value
                              </p>
                              <div className="flex items-baseline justify-end gap-1.5 text-stone-900">
                                <span className="text-sm font-bold opacity-40">
                                  &#8377;
                                </span>
                                <span className="text-3xl font-black tracking-tight leading-none">
                                  {parseFloat(
                                    selectedOrder.totalAmount,
                                  ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-indigo-50/50">
                                <span className="text-[10px] font-black text-stone-400">
                                  INR CURRENCY
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </header>

                      <div className="grid grid-cols-12 gap-8">
                        {/* Main Info */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">
                          <section className="bg-white p-10 rounded-3xl border border-stone-100 shadow-sm space-y-10">
                            <div className="space-y-6">
                              <h3 className="text-xs font-black text-stone-900/40 uppercase tracking-[0.4em] flex items-center gap-3">
                                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                Logistics Registry
                              </h3>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
                                    Client Profile
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                      <AvatarFallback className="bg-stone-900 text-white font-black text-xs">
                                        {selectedOrder.customer?.name?.[0] ||
                                          "C"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-base font-black text-stone-900 uppercase tracking-tight">
                                        {selectedOrder.customer?.name}
                                      </p>
                                      <p className="text-[10px] font-bold text-stone-400 mt-0.5">
                                        {selectedOrder.customer?.mobile}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">
                                    Terminal Coordinates
                                  </p>
                                  {selectedOrder.shippingAddress ? (
                                    <div className="flex items-start gap-3">
                                      <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-black text-stone-900 uppercase leading-tight">
                                          {selectedOrder.shippingAddress.line1}
                                        </p>
                                        <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-tight">
                                          {selectedOrder.shippingAddress.city},{" "}
                                          {selectedOrder.shippingAddress.state}{" "}
                                          -{" "}
                                          {
                                            selectedOrder.shippingAddress
                                              .postalCode
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] font-bold text-rose-400 uppercase italic">
                                      Manual Routing Required
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-stone-50">
                              <h3 className="text-xs font-black text-stone-900/40 uppercase tracking-[0.4em] flex items-center gap-3">
                                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                Inventory Allocation
                              </h3>
                              <div className="space-y-4">
                                {selectedOrder.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-6 p-6 bg-stone-50/50 rounded-2xl border border-stone-100/50"
                                  >
                                    <div className="h-16 w-16 bg-white rounded-xl border border-stone-100 flex items-center justify-center p-2">
                                      {item.product?.imageUrls?.[0] ? (
                                        <img
                                          src={getMediaUrl(
                                            item.product.imageUrls[0],
                                          )}
                                          className="h-full w-full object-contain mix-blend-multiply"
                                        />
                                      ) : (
                                        <Package className="h-6 w-6 text-stone-200" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-black text-stone-900 uppercase tracking-tight truncate">
                                        {item.name}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {item.isFree && (
                                          <Badge className="bg-rose-100 text-rose-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-none shadow-sm">
                                            Free Gift
                                          </Badge>
                                        )}
                                        {item.offerType === "bogo" && (
                                          <Badge className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-none shadow-sm">
                                            BOGO Offer
                                          </Badge>
                                        )}
                                        {item.offerType &&
                                          item.offerType !== "bogo" && (
                                            <Badge className="bg-stone-100 text-stone-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-none shadow-sm">
                                              {item.offerType}
                                            </Badge>
                                          )}
                                      </div>
                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                        Unit: &#8377;
                                        {parseFloat(
                                          item.unitPrice,
                                        ).toLocaleString()}{" "}
                                        / Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-base font-black text-stone-900 tracking-tight">
                                        &#8377;
                                        {(
                                          parseFloat(item.unitPrice) *
                                          item.quantity
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                          <section className="bg-[#FAFBFF] p-6 rounded-2xl border border-indigo-50 shadow-sm flex flex-col gap-4">
                            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2 mb-2">
                              <ShieldCheck className="h-5 w-5 text-indigo-600" />
                              Action Protocol
                            </h3>

                            {/* Stage 1: Payment Verification */}
                            <div
                              className={cn(
                                "p-5 rounded-xl border transition-all duration-300",
                                selectedOrder.status === "PLACED"
                                  ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50"
                                  : "bg-white/60 border-stone-100",
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-indigo-600">
                                    01
                                  </span>
                                  <span className="text-xs font-bold text-stone-900">
                                    Payment Verification
                                  </span>
                                </div>
                                <Badge
                                  className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border-none rounded",
                                    selectedOrder.status !== "PLACED"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-stone-100 text-stone-500",
                                  )}
                                >
                                  {selectedOrder.status !== "PLACED"
                                    ? "COMPLETED"
                                    : "PENDING"}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-stone-500 font-medium ml-7 mb-4">
                                Verify payment authenticity and settlement
                                status.
                              </p>
                              {selectedOrder.status === "PLACED" && (
                                <Button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      selectedOrder.id,
                                      "PAYMENT_VERIFIED",
                                    )
                                  }
                                  disabled={updating}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg shadow-sm"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark
                                  Payment Verified
                                </Button>
                              )}
                            </div>

                            {/* Stage 2: Order Approval */}
                            <div
                              className={cn(
                                "p-5 rounded-xl border transition-all duration-300",
                                selectedOrder.status === "PAYMENT_VERIFIED"
                                  ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50"
                                  : "bg-white/60 border-stone-100",
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-indigo-600">
                                    02
                                  </span>
                                  <span className="text-xs font-bold text-stone-900">
                                    Administrative Approval
                                  </span>
                                </div>
                                <Badge
                                  className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border-none rounded",
                                    [
                                      "APPROVED",
                                      "CONFIRMED",
                                      "SHIPPED",
                                      "DELIVERED",
                                    ].includes(selectedOrder.status)
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-stone-100 text-stone-500",
                                  )}
                                >
                                  {[
                                    "APPROVED",
                                    "CONFIRMED",
                                    "SHIPPED",
                                    "DELIVERED",
                                  ].includes(selectedOrder.status)
                                    ? "COMPLETED"
                                    : "PENDING"}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-stone-500 font-medium ml-7 mb-4">
                                Review order details and approve for processing.
                              </p>
                              {selectedOrder.status === "PAYMENT_VERIFIED" && (
                                <Button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      selectedOrder.id,
                                      "APPROVED",
                                    )
                                  }
                                  disabled={updating}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg shadow-sm"
                                >
                                  Approve for Fulfillment
                                </Button>
                              )}
                            </div>

                            {/* Stage 3: Fulfillment Routing */}
                            <div
                              className={cn(
                                "p-5 rounded-xl border transition-all duration-300",
                                selectedOrder.status === "APPROVED"
                                  ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50"
                                  : "bg-white/60 border-stone-100",
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-indigo-600">
                                    03
                                  </span>
                                  <span className="text-xs font-bold text-stone-900">
                                    Fulfillment Routing
                                  </span>
                                </div>
                                <Badge
                                  className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border-none rounded",
                                    selectedOrder.vendorId
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-stone-100 text-stone-500",
                                  )}
                                >
                                  {selectedOrder.vendorId
                                    ? "COMPLETED"
                                    : "PENDING"}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-stone-500 font-medium ml-7 mb-4">
                                Route order to fulfillment center and begin
                                processing.
                              </p>

                              {selectedOrder.status === "APPROVED" && (
                                <div className="space-y-3 mt-4">
                                  <select
                                    value={fulfillmentVendorId}
                                    onChange={(e) =>
                                      setFulfillmentVendorId(e.target.value)
                                    }
                                    className="w-full h-10 bg-white rounded-lg border border-stone-200 px-3 text-[11px] font-bold text-stone-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
                                  >
                                    <option value="">
                                      Select Target Node...
                                    </option>
                                    {vendors
                                      .filter(
                                        (v) =>
                                          (v.approvalStatus || v.status) ===
                                          "APPROVED",
                                      )
                                      .map((v) => (
                                        <option key={v.id} value={v.id}>
                                          {v.businessName || v.name}
                                        </option>
                                      ))}
                                  </select>
                                  <Button
                                    onClick={handleSendToVendor}
                                    disabled={
                                      isFulfilling || !fulfillmentVendorId
                                    }
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-lg shadow-sm flex items-center justify-center gap-2"
                                  >
                                    {isFulfilling ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Send className="h-3 w-3" /> Authorize
                                        Deployment
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="bg-indigo-50/50 rounded-xl p-4 flex items-start gap-3 mt-2 border border-indigo-50">
                              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-medium text-indigo-900/70 leading-relaxed">
                                Complete all protocols in sequence to advance
                                order Status updates are recorded in real-time
                              </p>
                            </div>

                            <div className="flex items-center justify-around pt-6 pb-2">
                              <div className="flex flex-col items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                <span className="text-[9px] font-bold text-stone-500">
                                  Secure
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <Eye className="h-5 w-5 text-indigo-400" />
                                <span className="text-[9px] font-bold text-stone-500">
                                  Transparent
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-400" />
                                <span className="text-[9px] font-bold text-stone-500">
                                  Auditable
                                </span>
                              </div>
                            </div>
                          </section>

                          <section className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                              Fulfillment Dossier
                            </h3>
                            <Button
                              onClick={() => printThermalReceipt(selectedOrder)}
                              variant="outline"
                              className="w-full h-10 font-bold uppercase tracking-widest text-[10px] border-stone-200 text-stone-900 hover:bg-stone-50 rounded-lg gap-2"
                            >
                              <Printer className="h-4 w-4 text-stone-400" />
                              Print Transaction Audit
                            </Button>
                          </section>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === "vendors" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                  {!subView ? (
                    <>
                      <header className="flex items-center justify-between gap-6 mb-12">
                        <div className="flex flex-col">
                          <h1
                            className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.adminBrand} pb-1`}
                          >
                            Registered Vendors
                          </h1>
                          <p className={`${THEME.typography.micro.muted}`}>
                            Vendor lifecycle and compliance management.
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsAddVendorOpen(true)}
                          className="rounded-[5px] h-14 px-8 shadow-2xl shadow-stone-900/40 hover:bg-[#1a0b2e] font-black uppercase tracking-widest text-[10px] bg-stone-900 text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                          <UserPlus className="h-4 w-4" /> Add Direct Vendor
                        </Button>
                      </header>

                      <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[5px] overflow-hidden bg-white">
                        <div className="overflow-x-auto scrollbar-hide">
                          <Table>
                            <TableHeader className="bg-stone-50">
                              <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                                <TableHead className="px-4 py-6">
                                  Vendor Identity
                                </TableHead>
                                <TableHead className="px-4 py-6">
                                  Market Sector
                                </TableHead>
                                <TableHead className="px-4 py-6">
                                  Contact Authority
                                </TableHead>
                                <TableHead className="px-4 py-6 text-center">
                                  Compliance Status
                                </TableHead>
                                <TableHead className="px-4 py-6 text-right">
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
                                deferredFilteredVendors.map((v) => (
                                  <TableRow
                                    key={v.id}
                                    className="border-stone-50 hover:bg-stone-50/30"
                                  >
                                    <TableCell className="px-4 py-6 font-bold text-[#151515]">
                                      {v.businessName}
                                    </TableCell>
                                    <TableCell className="px-4 py-6 font-medium text-stone-500">
                                      {v.businessCategory}
                                    </TableCell>
                                    <TableCell className="px-4 py-6 text-stone-500 font-medium">
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
                                          "rounded-[5px] font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none shadow-sm flex items-center gap-2 w-fit mx-auto",
                                          v.approvalStatus === "APPROVED"
                                            ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
                                            : v.approvalStatus === "PENDING"
                                              ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                                              : "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20",
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            "h-1.5 w-1.5 rounded-[5px] animate-pulse",
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
                                          onClick={() => {
                                            const globalVendor = vendors.find(
                                              (v) =>
                                                v.businessName
                                                  .toLowerCase()
                                                  .includes("global"),
                                            );
                                            if (globalVendor) {
                                              setPreSelectedTransferSource(
                                                globalVendor.id,
                                              );
                                              setPreSelectedTransferDest(v.id);
                                              setPreSelectedTransferItems([]);
                                              handleViewChange(
                                                "create-transfer",
                                              );
                                            }
                                          }}
                                          className="h-8 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-[2px]"
                                          title="Send Stock from Global"
                                        >
                                          <PackagePlus className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            setResetPasswordVendor(v)
                                          }
                                          className="h-8 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-[2px]"
                                          title="Reset Password"
                                        >
                                          <Key className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingVendor(v);
                                            setIsEditVendorOpen(true);
                                          }}
                                          className="h-8 border-amber-100 bg-amber-50/50 hover:bg-amber-100 text-amber-600 text-xs font-bold rounded-[2px]"
                                          title="Edit Vendor Authority"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {v.approvalStatus === "PENDING" && (
                                          <Button
                                            size="sm"
                                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-[5px]"
                                            onClick={async () => {
                                              await fetch(
                                                `${API_URL}/admin/vendors/${v.id}/approve`,
                                                {
                                                  method: "PATCH",
                                                  headers: {
                                                    "Content-Type":
                                                      "application/json",
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
                                            className="w-[160px] rounded-[5px] font-bold bg-white text-xs"
                                          >
                                            <DropdownMenuItem
                                              onClick={() =>
                                                navigate(
                                                  `/admin/vendors/${v.id}`,
                                                )
                                              }
                                              className="cursor-pointer py-2 px-3 gap-2"
                                            >
                                              <Eye className="h-4 w-4" /> View
                                              Data
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
                        </div>
                      </Card>
                    </>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {detailLoading ? (
                        <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md rounded-[5px] border border-stone-100">
                          <div className="flex flex-col items-center gap-6">
                            <div className="h-12 w-12 animate-spin rounded-[5px] border-[3px] border-stone-100 border-t-stone-900 shadow-xl" />
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
                          <div className="flex flex-col flex-1 bg-[#f8fafc] -mx-6 -my-8 lg:-mx-8 lg:-my-10 xl:-mx-10 animate-in fade-in duration-500 relative z-50 overflow-hidden">
                            {/* Premium Light Header */}
                            <header className="p-6 lg:p-8 bg-white border-b border-stone-100 flex items-center justify-between shrink-0 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-32 opacity-[0.03] blur-3xl bg-blue-600 rounded-full -mr-16 -mt-16" />

                              <div className="relative z-10 flex items-center gap-6">
                                <div className="relative group">
                                  <Avatar className="h-16 w-16 ring-4 ring-blue-50 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:ring-blue-100">
                                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-600 text-white font-black text-xl">
                                      {selectedVendor.businessName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={cn(
                                      "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center shadow-lg",
                                      selectedVendor.approvalStatus ===
                                        "APPROVED"
                                        ? "bg-emerald-500"
                                        : "bg-amber-500",
                                    )}
                                  >
                                    <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                      {selectedVendor.businessName}
                                    </h2>
                                    <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-black px-2.5 py-0.5 text-[8px] uppercase tracking-widest rounded-full">
                                      {selectedVendor.businessCategory}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-5">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                      ID: VND-
                                      {selectedVendor.id
                                        .slice(0, 8)
                                        .toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                      Status: {selectedVendor.approvalStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 relative z-10">
                                <Button
                                  onClick={() => navigate("/admin/vendors")}
                                  className="h-10 flex items-center gap-2.5 px-5 bg-stone-900 text-white rounded-[8px] hover:bg-black transition-all shadow-lg shadow-stone-200/50"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    Back to Vendors
                                  </span>
                                </Button>
                              </div>
                            </header>

                            <ScrollArea className="flex-1">
                              <div className="p-12 space-y-12">
                                {/* Enhanced Analytics Grid */}
                                <div className="grid grid-cols-3 gap-6">
                                  <div className="p-6 bg-white rounded-[12px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-emerald-50 rounded-[10px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                                        <DollarSign className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                        Gross Revenue
                                      </p>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                                      &#8377;
                                      {selectedVendor.totalRevenue?.toLocaleString()}
                                    </p>
                                    <p className="text-[11px] font-bold text-emerald-600 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      LIFETIME YIELD
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>

                                  <div className="p-6 bg-white rounded-[12px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-blue-50 rounded-[10px] flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                                        <Package className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                        Inventory Nodes
                                      </p>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                                      {selectedVendor.products?.length || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-blue-600 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                      LIVE CATALOG ITEMS
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>

                                  <div className="p-6 bg-indigo-950 rounded-[12px] shadow-2xl shadow-indigo-950/20 text-white relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-white/10 rounded-[10px] flex items-center justify-center text-indigo-200 group-hover:scale-110 transition-transform duration-500">
                                        <Activity className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-indigo-300/60 uppercase tracking-[0.2em]">
                                        System Health
                                      </p>
                                    </div>
                                    <p className="text-xl font-black text-white tracking-tight leading-none uppercase">
                                      Operational
                                    </p>
                                    <p className="text-[11px] font-bold text-indigo-300 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                      NODE SYNC ACTIVE
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-white/10 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 gap-8">
                                  <div className="col-span-12 space-y-12">
                                    <section>
                                      <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.4em] mb-5 flex items-center gap-4">
                                        <span className="h-2 w-2 rounded-full bg-stone-900" />
                                        Vendor Details
                                      </h3>
                                      <div className="grid grid-cols-12 gap-6">
                                        <div className="col-span-3 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                          <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500">
                                              <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                                Email
                                              </p>
                                              <p className="text-[14px] font-bold text-stone-900 break-all">
                                                {selectedVendor.email || "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-span-3 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                          <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-500">
                                              <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                                Phone
                                              </p>
                                              <p className="text-[14px] font-bold text-stone-900">
                                                {selectedVendor.contactNumber ||
                                                  "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-span-6 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                          <div className="flex items-start gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500 shrink-0">
                                              <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                                Registered Address
                                              </p>
                                              <p className="text-[14px] font-bold text-stone-900 leading-relaxed">
                                                {selectedVendor.address ||
                                                  "No address data available"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </section>
                                  </div>

                                  <div className="col-span-12">
                                    <header className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                                      <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.4em] flex items-center gap-4">
                                        <span className="h-2 w-2 rounded-full bg-stone-900" />
                                        Order History
                                      </h3>
                                      <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-black text-[10px] px-4 py-1.5 rounded-full flex items-center gap-2">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                        {selectedVendor.orders?.length || 0}{" "}
                                        ORDERS
                                      </Badge>
                                    </header>

                                    <div className="bg-white rounded-[12px] border border-stone-100 shadow-xl overflow-hidden">
                                      <Table>
                                        <TableHeader className="bg-stone-50/50">
                                          <TableRow className="border-stone-100 hover:bg-transparent h-12">
                                            <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                              Order
                                            </TableHead>
                                            <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                              Items
                                            </TableHead>
                                            <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                              Customer
                                            </TableHead>
                                            <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">
                                              Status
                                            </TableHead>
                                            <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">
                                              Total
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedVendor.orders?.length > 0 ? (
                                            selectedVendor.orders.map(
                                              (order) => (
                                                <TableRow
                                                  key={order.orderNumber}
                                                  className="border-stone-50 h-20 hover:bg-stone-50/50 transition-all group cursor-pointer"
                                                  onClick={() =>
                                                    navigate(
                                                      `/admin/orders/${order.id}?type=Online`,
                                                    )
                                                  }
                                                >
                                                  <TableCell className="px-6">
                                                    <div className="flex flex-col">
                                                      <span className="text-sm font-black text-stone-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                                        #{order.orderNumber}
                                                      </span>
                                                      <span className="text-[10px] font-bold text-stone-400 mt-1">
                                                        {new Date(
                                                          order.createdAt,
                                                        )
                                                          .toLocaleDateString(
                                                            undefined,
                                                            {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                            },
                                                          )
                                                          .toUpperCase()}
                                                      </span>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell className="px-6">
                                                    <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                      {order.items
                                                        ?.slice(0, 3)
                                                        .map((item, idx) => (
                                                          <div
                                                            key={idx}
                                                            className="h-10 w-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white ring-1 ring-stone-100"
                                                          >
                                                            <img
                                                              src={getMediaUrl(
                                                                item.product
                                                                  ?.imageUrls?.[0],
                                                              )}
                                                              className="h-full w-full object-cover"
                                                              alt=""
                                                              onError={(e) => {
                                                                e.target.src =
                                                                  "https://via.placeholder.com/100?text=P";
                                                              }}
                                                            />
                                                          </div>
                                                        ))}
                                                      {order.items?.length >
                                                        3 && (
                                                        <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-md ring-1 ring-blue-100">
                                                          +
                                                          {order.items.length -
                                                            3}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell className="px-6">
                                                    <div className="flex items-center gap-3">
                                                      <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-black">
                                                          {order.customer?.name?.charAt(
                                                            0,
                                                          )}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-stone-900">
                                                          {order.customer?.name}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-stone-400 lowercase">
                                                          {
                                                            order.customer
                                                              ?.mobile
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell className="px-6 text-center">
                                                    <Badge
                                                      className={cn(
                                                        "rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5 border transition-all",
                                                        order.status ===
                                                          "DELIVERED"
                                                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm"
                                                          : order.status ===
                                                              "PLACED"
                                                            ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm"
                                                            : "bg-blue-50 text-blue-600 border-blue-100 shadow-sm",
                                                      )}
                                                    >
                                                      {order.status}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell className="px-6 text-right">
                                                    <span className="text-lg font-black text-stone-900 tracking-tighter">
                                                      &#8377;
                                                      {parseFloat(
                                                        order.totalAmount,
                                                      ).toLocaleString()}
                                                    </span>
                                                  </TableCell>
                                                </TableRow>
                                              ),
                                            )
                                          ) : (
                                            <TableRow>
                                              <TableCell
                                                colSpan={5}
                                                className="h-64 text-center"
                                              >
                                                <div className="flex flex-col items-center justify-center opacity-30 gap-3">
                                                  <History className="h-12 w-12 text-stone-300" />
                                                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400">
                                                    SECTOR ARCHIVE EMPTY
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
                              </div>
                            </ScrollArea>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeView === "vendor-qrs" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                  <header className="flex flex-col">
                    <h1
                      className={`${THEME.typography.headings.h1} uppercase leading-none mb-3 bg-clip-text text-transparent ${THEME.gradients.adminBrand} pb-1`}
                    >
                      Checkout QR
                    </h1>
                    <p className={`${THEME.typography.micro.muted}`}>
                      Configure the global payment gateway and QR code for all
                      online transactions.
                    </p>
                  </header>

                  <div className="max-w-2xl">
                    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[5px] overflow-hidden bg-white">
                      <div className="p-10 space-y-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                              <QrCode className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">
                                Platform Payment QR
                              </h3>
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                                This QR will be shown to all customers during
                                checkout
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                          <div className="space-y-4">
                            <div
                              className="aspect-square bg-stone-50 rounded-[5px] border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden relative group/qr cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all"
                              onClick={() =>
                                document
                                  .getElementById("platform-qr-upload")
                                  .click()
                              }
                            >
                              {platformQRFile ? (
                                <img
                                  src={URL.createObjectURL(platformQRFile)}
                                  className="w-full h-full object-contain p-4"
                                  alt="New Platform QR"
                                />
                              ) : platformSettings.PLATFORM_QR ? (
                                <img
                                  src={getMediaUrl(
                                    platformSettings.PLATFORM_QR,
                                  )}
                                  className="w-full h-full object-contain p-4"
                                  alt="Current Platform QR"
                                />
                              ) : (
                                <div className="text-center space-y-2">
                                  <UploadCloud className="h-8 w-8 mx-auto text-stone-300 group-hover/qr:text-emerald-500 transition-colors" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover/qr:text-emerald-600">
                                    Click to upload
                                  </p>
                                </div>
                              )}
                              <input
                                id="platform-qr-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  setPlatformQRFile(e.target.files[0])
                                }
                              />
                            </div>
                            {platformQRFile && (
                              <Button
                                onClick={handleUpdatePlatformQR}
                                disabled={loading}
                                className="w-full bg-stone-900 text-white rounded-[5px] font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-stone-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
                              >
                                {loading ? "Updating..." : "Save Platform QR"}
                              </Button>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-900">
                                Implementation Rules
                              </h4>
                              <ul className="space-y-3">
                                {[
                                  "Unified QR across all vendor orders",
                                  "Direct platform-to-merchant routing",
                                  "Manual verification by admin team",
                                  "Requires high-resolution assets",
                                ].map((rule, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center gap-3 text-[11px] font-bold text-stone-500"
                                  >
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {rule}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {!platformQRFile &&
                              platformSettings.PLATFORM_QR && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById("platform-qr-upload")
                                      .click()
                                  }
                                  className="w-full border-stone-200 text-stone-600 rounded-[5px] font-black uppercase tracking-widest text-[10px] h-12 hover:bg-stone-50 transition-all"
                                >
                                  Change Asset
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
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
                      <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-[5px] border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                          Range:
                        </span>
                        <div className="relative flex items-center min-w-[100px]">
                          <select
                            className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-emerald-600 outline-none truncate"
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
                            <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-emerald-600 transition-colors rotate-90" />
                          </div>
                        </div>
                      </div>

                      {/* Vendor Filter */}
                      <div className="group flex items-center bg-stone-50 hover:bg-white transition-all duration-300 rounded-[5px] border border-stone-200/60 hover:border-indigo-200 px-3 py-2 w-fit cursor-pointer animate-in fade-in zoom-in-95">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-2">
                          Source:
                        </span>
                        <div className="relative flex items-center min-w-[130px]">
                          <select
                            className="appearance-none bg-transparent border-none text-stone-900 font-bold text-xs focus:ring-0 cursor-pointer py-1 pl-1 pr-8 w-full hover:text-emerald-600 outline-none truncate"
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
                            <ChevronRight className="h-3 w-3 text-stone-500 group-hover:text-emerald-600 transition-colors rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-white rounded-[5px] shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-8 w-8 rounded-[5px] bg-blue-50 text-blue-600 flex items-center justify-center">
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
                          ? (analyticsData.totalSaleUnits / 1000).toFixed(1) +
                            "K"
                          : analyticsData?.totalSaleUnits || 0}
                      </h2>
                      <p className="text-[10px] font-medium text-stone-400 mt-1.5 leading-relaxed">
                        Consolidated volume across all verified partner nodes.
                      </p>
                    </div>

                    <div className="p-6 bg-white rounded-[5px] shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-8 w-8 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
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

                    <div className="p-6 bg-white rounded-[5px] shadow-sm border border-stone-100/40 group hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-8 w-8 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
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

                  <div className="grid grid-cols-12 gap-6 items-start">
                    <Card className="col-span-8 p-5 rounded-2xl border border-stone-100 shadow-sm bg-white overflow-hidden relative group">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          Revenue Distribution
                        </h3>
                      </div>

                      <RevenueReport
                        analyticsData={analyticsData}
                        formatMoney={formatMoney}
                      />
                    </Card>

                    <Card className="col-span-4 p-5 rounded-2xl border border-stone-100 shadow-sm bg-white overflow-hidden relative group">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-indigo-500" />
                          Product Performance
                        </h3>
                      </div>

                      <ScrollArea className="h-[280px] pr-4 -mr-4">
                        <div className="space-y-4 relative z-10 pb-4">
                          {analyticsData?.productPerformance &&
                          analyticsData.productPerformance.length > 0 ? (
                            analyticsData.productPerformance.map((s, i) => (
                              <div
                                key={i}
                                className="group/item cursor-pointer flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-all duration-300"
                                onClick={() => setSelectedTopProduct(s)}
                              >
                                <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-stone-50 border border-stone-100 shadow-sm transition-all">
                                  <img
                                    src={getMediaUrl(s.image)}
                                    className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                    alt={s.label}
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/100?text=P";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="text-[12px] font-bold text-stone-900 truncate leading-tight group-hover/item:text-indigo-600 transition-colors">
                                      {s.label}
                                    </span>
                                    <span className="text-[11px] font-bold text-stone-900 tabular-nums">
                                      {formatMoney(s.val)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-[3px] bg-stone-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-stone-900 rounded-full transition-all duration-1000 ease-out group-hover/item:bg-indigo-500"
                                        style={{
                                          width: `${Math.max(2, s.p)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest tabular-nums shrink-0">
                                      {s.qty} Units
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 opacity-30">
                              <Package className="h-10 w-10 text-stone-300 mb-3" />
                              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                                No Performance Data
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
                  {!subView ? (
                    <>
                      <div className="flex items-end justify-between">
                        <div>
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
                        </div>
                        {activeSegment && (
                          <div className="flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-2xl animate-in slide-in-from-right-4 duration-300">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              Filter:
                            </span>
                            <span className="text-[13px] font-black text-stone-900 tracking-tight">
                              {activeSegment.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-white text-stone-400 hover:text-red-500 transition-all ml-1"
                              onClick={() => {
                                setActiveSegment(null);
                                fetchDataForView("customers");
                              }}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        )}
                      </div>

                      <Card className="border-none shadow-sm rounded-[5px] overflow-hidden">
                        <Table>
                          <TableHeader className="bg-stone-50">
                            <TableRow className="border-stone-100 py-4 hover:bg-transparent">
                              <TableHead className="py-4 px-6 font-['Inter'] font-black text-[11px] text-stone-400 uppercase tracking-widest leading-none">
                                User Profile
                              </TableHead>
                              <TableHead className="py-4 px-6 font-['Inter'] font-black text-[11px] text-stone-400 uppercase tracking-widest leading-none">
                                Contact Access
                              </TableHead>
                              <TableHead className="py-4 px-6 text-center font-['Inter'] font-black text-[11px] text-stone-400 uppercase tracking-widest leading-none">
                                Reward Balance
                              </TableHead>
                              <TableHead className="py-4 px-6 text-center font-['Inter'] font-black text-[11px] text-stone-400 uppercase tracking-widest leading-none">
                                Acquisition Date
                              </TableHead>
                              <TableHead className="py-4 px-6 text-right font-['Inter'] font-black text-[11px] text-stone-400 uppercase tracking-widest leading-none">
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
                              deferredFilteredCustomers.map((c) => (
                                <TableRow
                                  key={c.id}
                                  className="border-stone-50 hover:bg-stone-50/50 transition-colors group"
                                >
                                  <TableCell className="py-5 px-6">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm overflow-hidden">
                                        <AvatarFallback className="bg-gradient-to-br from-[#9a6bff] to-indigo-600 text-white font-black text-sm uppercase">
                                          {c.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <span className="font-['Inter'] font-black text-[14px] text-stone-900 tracking-tight leading-tight group-hover:text-black transition-colors">
                                          {c.name}
                                        </span>
                                        <span className="font-['Inter'] font-black text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">
                                          {c.id.slice(-8).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-5 px-6">
                                    <div className="flex flex-col gap-1.5 justify-center">
                                      <div className="flex items-center gap-2 group/contact">
                                        <div className="h-5 w-5 rounded-md bg-stone-50 flex items-center justify-center">
                                          <Mail className="h-2.5 w-2.5 text-stone-400 group-hover/contact:text-[#9a6bff] transition-colors" />
                                        </div>
                                        <span className="text-[12px] font-bold text-stone-500 tracking-tight">
                                          {c.email || "No Email Provided"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 group/contact">
                                        <div className="h-5 w-5 rounded-md bg-stone-50 flex items-center justify-center">
                                          <Phone className="h-2.5 w-2.5 text-stone-400 group-hover/contact:text-emerald-500 transition-colors" />
                                        </div>
                                        <span className="text-[12px] font-bold text-stone-500 tracking-tight">
                                          {c.mobile}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-5 px-6 text-center">
                                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-purple-50/50 border border-purple-100/50 group-hover:bg-purple-50 transition-colors">
                                      <span className="font-['Inter'] font-black text-[12px] text-purple-900 tracking-tight">
                                        {c.rewardPoints} points
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-5 px-6 text-center font-['Inter'] font-bold text-stone-400 text-[13px] tracking-tight">
                                    {new Date(c.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </TableCell>
                                  <TableCell className="py-5 px-6 text-right">
                                    <div className="flex justify-end items-center">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-9 w-9 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="w-[180px] rounded-2xl p-1.5 shadow-2xl shadow-stone-200/50 border-stone-100"
                                        >
                                          <DropdownMenuItem
                                            onClick={() =>
                                              navigate(
                                                `/admin/customers/${c.id}`,
                                              )
                                            }
                                            className="cursor-pointer py-2.5 px-3 gap-3 rounded-xl font-bold font-['Inter'] text-[13px] text-stone-600 hover:text-stone-900 hover:bg-stone-50 focus:bg-stone-50 transition-colors"
                                          >
                                            <Eye className="h-4 w-4 text-[#9a6bff]" />{" "}
                                            View Detail Profile
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
                    </>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {detailLoading ? (
                        <div className="h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-md rounded-[5px] border border-stone-100">
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
                          <div className="flex flex-col flex-1 bg-[#f8fafc] -mx-6 -my-8 lg:-mx-8 lg:-my-10 xl:-mx-10 animate-in fade-in duration-500 relative z-50 overflow-hidden">
                            {/* Premium Light Header */}
                            <header className="p-6 lg:p-8 bg-white border-b border-stone-100 flex items-center justify-between shrink-0 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-32 opacity-[0.03] blur-3xl bg-indigo-600 rounded-full -mr-16 -mt-16" />

                              <div className="relative z-10 flex items-center gap-6">
                                <div className="relative group">
                                  <Avatar className="h-16 w-16 ring-4 ring-indigo-50 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:ring-indigo-100">
                                    <AvatarFallback className="bg-linear-to-br from-indigo-600 to-purple-600 text-white font-black text-xl">
                                      {selectedUser.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                    <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black tracking-tight text-stone-900">
                                      {selectedUser.name}
                                    </h2>
                                    <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-black px-2.5 py-0.5 text-[8px] uppercase tracking-widest rounded-full">
                                      Verified Tier 1
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-5">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                      ID: {selectedUser.id}
                                    </span>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                      Protocol: Secure-User-Node
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 relative z-10">
                                <Button
                                  onClick={() => navigate("/admin/customers")}
                                  className="h-10 flex items-center gap-2.5 px-5 bg-stone-900 text-white rounded-[8px] hover:bg-black transition-all shadow-lg shadow-stone-200/50"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    Back to Customers
                                  </span>
                                </Button>
                              </div>
                            </header>

                            <ScrollArea className="flex-1">
                              <div className="p-12 space-y-12">
                                {/* Enhanced Analytics Grid */}
                                <div className="grid grid-cols-3 gap-6">
                                  <div className="p-6 bg-white rounded-[12px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-emerald-50 rounded-[10px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                        Credits
                                      </p>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                                      {selectedUser.rewardPoints.toLocaleString()}
                                    </p>
                                    <p className="text-[11px] font-bold text-emerald-600 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      READY FOR REDEMPTION
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>

                                  <div className="p-6 bg-white rounded-[12px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-indigo-50 rounded-[10px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                                        <ShoppingCart className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                        Total Activity
                                      </p>
                                    </div>
                                    <p className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                                      {selectedUser.orders?.length || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-indigo-600 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                      EVENTS RECORDED
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>

                                  <div className="p-6 bg-white rounded-[12px] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="h-10 w-10 bg-purple-50 rounded-[10px] flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-500">
                                        <Calendar className="h-5 w-5" />
                                      </div>
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                        Acquisition
                                      </p>
                                    </div>
                                    <p className="text-xl font-black text-stone-900 tracking-tight leading-none">
                                      {new Date(selectedUser.createdAt)
                                        .toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "2-digit",
                                          year: "numeric",
                                        })
                                        .toUpperCase()}
                                    </p>
                                    <p className="text-[11px] font-bold text-purple-600 mt-4 flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                                      ACCOUNT VERIFIED
                                    </p>
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-purple-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                </div>

                                <div className="col-span-12 space-y-12">
                                  <section>
                                    <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.4em] mb-5 flex items-center gap-4">
                                      <span className="h-2 w-2 rounded-full bg-stone-900" />
                                      Contact Info
                                    </h3>
                                    <div className="grid grid-cols-12 gap-6">
                                      <div className="col-span-12 lg:col-span-6 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex items-center gap-5">
                                          <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                                            <Mail className="h-5 w-5" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                              Email
                                            </p>
                                            <p className="text-[14px] font-bold text-stone-900 truncate">
                                              {selectedUser.email || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col-span-12 lg:col-span-6 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex items-center gap-5">
                                          <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-500">
                                            <Phone className="h-5 w-5" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                              Phone
                                            </p>
                                            <p className="text-[14px] font-bold text-stone-900 truncate">
                                              {selectedUser.mobile || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col-span-12 p-6 bg-white rounded-[16px] border border-stone-100 shadow-sm group hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex items-start gap-5">
                                          <div className="h-12 w-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-500 shrink-0">
                                            <MapPin className="h-5 w-5" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">
                                              Primary Address
                                            </p>
                                            <p className="text-[14px] font-bold text-stone-900 leading-relaxed">
                                              {(() => {
                                                const formatAddr = (addr) => {
                                                  if (!addr) return null;
                                                  if (typeof addr === "string")
                                                    return addr;
                                                  // Handle array of addresses
                                                  if (Array.isArray(addr))
                                                    return formatAddr(addr[0]);

                                                  const parts = [
                                                    addr.line1 ||
                                                      addr.street ||
                                                      addr.addressLine1 ||
                                                      addr.address,
                                                    addr.city,
                                                    addr.state,
                                                    addr.postalCode ||
                                                      addr.pincode ||
                                                      addr.zip,
                                                  ].filter(
                                                    (p) =>
                                                      p &&
                                                      typeof p === "string",
                                                  );

                                                  if (parts.length > 0)
                                                    return parts.join(", ");

                                                  // Final fallback for unknown object structure: try to find any string value
                                                  const stringValues =
                                                    Object.values(addr).filter(
                                                      (v) =>
                                                        typeof v === "string" &&
                                                        v.length > 5,
                                                    );
                                                  return stringValues.length > 0
                                                    ? stringValues[0]
                                                    : null;
                                                };

                                                const profileAddr =
                                                  formatAddr(
                                                    selectedUser.address,
                                                  ) ||
                                                  formatAddr(
                                                    selectedUser.addresses,
                                                  ) ||
                                                  formatAddr(
                                                    selectedUser.shippingAddress,
                                                  ) ||
                                                  formatAddr(
                                                    selectedUser.userAddress,
                                                  ) ||
                                                  formatAddr(
                                                    selectedUser.profile
                                                      ?.address,
                                                  ) ||
                                                  formatAddr(
                                                    selectedUser.shipping
                                                      ?.address,
                                                  );

                                                if (profileAddr)
                                                  return profileAddr;

                                                // Fallback to most recent order with ANY kind of address data
                                                const orders =
                                                  selectedUser.orders || [];
                                                for (
                                                  let i = orders.length - 1;
                                                  i >= 0;
                                                  i--
                                                ) {
                                                  const o = orders[i];
                                                  const addr =
                                                    formatAddr(
                                                      o.shippingAddress,
                                                    ) ||
                                                    formatAddr(o.address) ||
                                                    formatAddr(
                                                      o.deliveryAddress,
                                                    ) ||
                                                    formatAddr(
                                                      o.shippingInfo?.address,
                                                    );
                                                  if (addr) return addr;
                                                }

                                                return "No primary address registered";
                                              })()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </section>
                                </div>

                                {/* Right Orders Registry */}
                                <div className="col-span-12">
                                  <header className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                                    <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.4em] flex items-center gap-4">
                                      <span className="h-2 w-2 rounded-full bg-stone-900" />
                                      Order History
                                    </h3>
                                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] px-4 py-1.5 rounded-full flex items-center gap-2">
                                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                      {selectedUser.orders?.length || 0} ORDERS
                                    </Badge>
                                  </header>

                                  <div className="bg-white rounded-[12px] border border-stone-100 shadow-xl overflow-hidden">
                                    <Table>
                                      <TableHeader className="bg-stone-50/50">
                                        <TableRow className="border-stone-100 hover:bg-transparent h-12">
                                          <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                            Order
                                          </TableHead>
                                          <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                            Items
                                          </TableHead>
                                          <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">
                                            Status
                                          </TableHead>
                                          <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">
                                            Total
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedUser.orders?.length > 0 ? (
                                          selectedUser.orders.map((order) => (
                                            <TableRow
                                              key={order.orderNumber}
                                              className="border-stone-50 h-20 hover:bg-stone-50/50 transition-all group cursor-pointer"
                                              onClick={() =>
                                                navigate(
                                                  `/admin/orders/${order.id}?type=Online`,
                                                )
                                              }
                                            >
                                              <TableCell className="px-6">
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-black text-stone-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    #{order.orderNumber}
                                                  </span>
                                                  <span className="text-[10px] font-bold text-stone-400 mt-1">
                                                    {new Date(order.createdAt)
                                                      .toLocaleDateString(
                                                        undefined,
                                                        {
                                                          month: "short",
                                                          day: "numeric",
                                                          year: "numeric",
                                                        },
                                                      )
                                                      .toUpperCase()}
                                                  </span>
                                                </div>
                                              </TableCell>
                                              <TableCell className="px-6">
                                                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                  {order.items
                                                    ?.slice(0, 4)
                                                    .map((item, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="h-11 w-11 rounded-full border-2 border-white shadow-md overflow-hidden bg-white ring-1 ring-stone-100"
                                                      >
                                                        <img
                                                          src={getMediaUrl(
                                                            item.product
                                                              ?.imageUrls?.[0],
                                                          )}
                                                          className="h-full w-full object-cover"
                                                          alt=""
                                                          onError={(e) => {
                                                            e.target.src =
                                                              "https://via.placeholder.com/100?text=P";
                                                          }}
                                                        />
                                                      </div>
                                                    ))}
                                                  {order.items?.length > 4 && (
                                                    <div className="h-11 w-11 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-md ring-1 ring-indigo-100">
                                                      +{order.items.length - 4}
                                                    </div>
                                                  )}
                                                </div>
                                              </TableCell>
                                              <TableCell className="px-6 text-center">
                                                <Badge
                                                  className={cn(
                                                    "rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5 border transition-all",
                                                    order.status === "DELIVERED"
                                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm"
                                                      : order.status ===
                                                          "PLACED"
                                                        ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm"
                                                        : "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm",
                                                  )}
                                                >
                                                  {order.status}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="px-6 text-right">
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
                                              className="h-64 text-center"
                                            >
                                              <div className="flex flex-col items-center justify-center opacity-30 gap-3">
                                                <Package className="h-12 w-12 text-stone-300" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400">
                                                  SECTOR ARCHIVE EMPTY
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
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeView === "segments" && (
                <div className="space-y-6 animate-in fade-in max-w-[800px]">
                  <header className="flex items-center gap-4">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                        <Search size={18} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter segments"
                        value={segmentSearch}
                        onChange={(e) => setSegmentSearch(e.target.value)}
                        className="w-full bg-[#f4f4f4] border-none rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium placeholder:text-stone-400 focus:ring-0 transition-all"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-[#f4f4f4] rounded-full h-[48px] w-[48px] hover:bg-stone-200"
                    >
                      <ArrowUpDown size={18} className="text-stone-900" />
                    </Button>
                  </header>

                  <div className="bg-white rounded-3xl overflow-hidden">
                    <div className="divide-y divide-stone-100">
                      {segmentsLoading ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="p-5 animate-pulse flex flex-col gap-2"
                          >
                            <div className="h-5 bg-stone-100 rounded-md w-1/3" />
                            <div className="h-3 bg-stone-100 rounded-md w-1/4" />
                          </div>
                        ))
                      ) : segmentsData?.segments ? (
                        segmentsData.segments
                          .filter((s) =>
                            s.name
                              .toLowerCase()
                              .includes(segmentSearch.toLowerCase()),
                          )
                          .map((segment) => {
                            const date = new Date(segment.updatedAt);
                            const now = new Date();
                            const isToday =
                              date.toDateString() === now.toDateString();
                            const isThisWeek =
                              now - date < 7 * 24 * 60 * 60 * 1000;

                            let dateStr = "";
                            if (isToday) {
                              dateStr = `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()}`;
                            } else if (isThisWeek) {
                              dateStr = `${date.toLocaleDateString("en-US", { weekday: "long" })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()}`;
                            } else {
                              dateStr = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()}`;
                            }

                            const getIcon = (id) => {
                              switch (id) {
                                case "added-to-companies":
                                  return <Building2 size={18} />;
                                case "not-added-to-companies":
                                  return <Users size={18} />;
                                case "purchased-at-least-once":
                                  return <ShoppingBag size={18} />;
                                case "email-subscribers":
                                  return <Mail size={18} />;
                                case "abandoned-checkouts-30d":
                                  return <Clock size={18} />;
                                case "purchased-more-than-once":
                                  return <RotateCcw size={18} />;
                                default:
                                  return <UserMinus size={18} />;
                              }
                            };

                            const getIconColor = (id) => {
                              switch (id) {
                                case "added-to-companies":
                                  return "text-blue-500 bg-blue-50";
                                case "not-added-to-companies":
                                  return "text-stone-500 bg-stone-50";
                                case "purchased-at-least-once":
                                  return "text-emerald-500 bg-emerald-50";
                                case "email-subscribers":
                                  return "text-[#9a6bff] bg-purple-50";
                                case "abandoned-checkouts-30d":
                                  return "text-amber-500 bg-amber-50";
                                case "purchased-more-than-once":
                                  return "text-pink-500 bg-pink-50";
                                default:
                                  return "text-rose-500 bg-rose-50";
                              }
                            };

                            return (
                              <div
                                key={segment.id}
                                onClick={() => {
                                  setActiveSegment({
                                    id: segment.id,
                                    name: segment.name,
                                  });
                                  handleViewChange("customers");
                                }}
                                className="p-6 hover:bg-stone-50/80 transition-all cursor-pointer group flex items-center gap-6"
                              >
                                <div
                                  className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                                    getIconColor(segment.id),
                                  )}
                                >
                                  {getIcon(segment.id)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-[16px] font-black text-stone-900 tracking-tight leading-tight group-hover:text-black">
                                    {segment.name}
                                  </h3>
                                  <p className="text-stone-400 font-bold text-[12px] mt-1 tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                                    Last computed {dateStr}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="bg-stone-100 text-stone-900 px-3 py-1.5 rounded-full text-[12px] font-black min-w-[45px] text-center shadow-sm group-hover:bg-black group-hover:text-white transition-all duration-300">
                                    {segment.count}
                                  </div>
                                  <ChevronRight
                                    size={16}
                                    className="text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all"
                                  />
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-10 text-center text-stone-400 font-bold uppercase tracking-widest text-xs">
                          No Segments Defined
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Product Full Page */}
              {activeView === "add-product" &&
                (() => {
                  const currentSnapshot = JSON.stringify({
                    prod: newProduct,
                    ben: productBenefits,
                    faq: productFaq,
                    label: productLabelDraft,
                  });
                  const hasChanges =
                    !initialProductState ||
                    currentSnapshot !== initialProductState ||
                    imageFiles.primary !== null ||
                    imageFiles.additional.length > 0;
                  return (
                    <div className="animate-in fade-in">
                      <form onSubmit={handleAddProduct}>
                        <div className="grid grid-cols-12 gap-8">
                          {/* Left Column */}
                          <div className="col-span-8 space-y-8">
                            <div
                              className={`bg-white rounded-[5px] border border-stone-200 shadow-sm p-10 space-y-10 transition-all hover:shadow-md`}
                            >
                              <div className="flex items-center justify-between border-b border-stone-100 pb-8">
                                <div className="flex items-center gap-5">
                                  <div
                                    className={`h-14 w-14 rounded-[12px] bg-[#f0ebff] flex items-center justify-center shadow-sm`}
                                  >
                                    <Package className="h-7 w-7 text-[#5b21b6]" />
                                  </div>
                                  <div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#1a1a1a]">
                                      Product Core details
                                    </h2>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">
                                      Primary identity & classification
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="submit"
                                    disabled={loading || !hasChanges}
                                    className="bg-[#151515] text-white rounded-[5px] px-6 py-3 h-auto text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:bg-black transition-all flex items-center gap-3"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                    Quick Save
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-10">
                                {/* Product Name - Full Width Row */}
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
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
                                    className={`rounded-[5px] h-14 border-stone-200 bg-white font-bold px-6 focus:ring-[#151515] transition-all text-sm w-full shadow-sm`}
                                    placeholder="e.g., Hydra Barrier Serum"
                                  />
                                </div>

                                {/* Brand & Category - 2 Col Grid Row */}
                                <div className="grid grid-cols-2 gap-10">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                        Brand
                                      </Label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setIsAddingNewBrand(!isAddingNewBrand)
                                        }
                                        className="text-[10px] font-black uppercase tracking-wider text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                                      >
                                        {isAddingNewBrand
                                          ? "Select Existing"
                                          : "+ Add New"}
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                        <Box className="h-5 w-5 text-stone-400" />
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
                                          className={`rounded-[5px] h-14 border-stone-200 bg-white font-bold pl-14 pr-6 focus:ring-[#151515] transition-all text-sm shadow-sm`}
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
                                            className={`w-full rounded-[5px] h-14 border border-stone-200 bg-white font-bold pl-14 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-[#151515] transition-all text-sm shadow-sm`}
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
                                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                        Category
                                      </Label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setIsAddingNewCategory(
                                            !isAddingNewCategory,
                                          )
                                        }
                                        className="text-[10px] font-black uppercase tracking-wider text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                                      >
                                        {isAddingNewCategory
                                          ? "Select Existing"
                                          : "+ Add New"}
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                        <LayoutGrid className="h-5 w-5 text-stone-400" />
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
                                          className={`rounded-[5px] h-14 border-stone-200 bg-white font-bold pl-14 pr-6 focus:ring-[#151515] transition-all text-sm shadow-sm`}
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
                                            className={`w-full rounded-[5px] h-14 border border-stone-200 bg-white font-bold pl-14 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-[#151515] transition-all text-sm shadow-sm`}
                                          >
                                            <option value="" disabled>
                                              Select Category
                                            </option>
                                            {categories.map((cat) => (
                                              <option
                                                key={cat.id}
                                                value={cat.name}
                                              >
                                                {cat.name}
                                              </option>
                                            ))}
                                          </select>
                                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Origin Selection */}
                                <div className="grid grid-cols-2 gap-10">
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
                                      Origin / Region
                                    </Label>
                                    <div className="relative">
                                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                        <Globe className="h-5 w-5 text-stone-400" />
                                      </div>
                                      <select
                                        value={
                                          newProduct.origin || "International"
                                        }
                                        onChange={(e) =>
                                          setNewProduct({
                                            ...newProduct,
                                            origin: e.target.value,
                                          })
                                        }
                                        className="w-full rounded-[5px] h-14 border border-stone-200 bg-white font-bold pl-14 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-[#151515] transition-all text-sm shadow-sm"
                                      >
                                        <option value="Korean">Korean</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Japanese">
                                          Japanese
                                        </option>
                                        <option value="US">US</option>
                                        <option value="International">
                                          International
                                        </option>
                                      </select>
                                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-stone-100">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] ml-1">
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
                                      className="h-10 px-5 text-[10px] uppercase font-black tracking-widest text-[#6366f1] bg-[#eef2ff] border border-[#e0e7ff] hover:bg-[#6366f1] hover:text-white rounded-[5px] transition-all flex items-center gap-2"
                                    >
                                      <Plus className="h-3.5 w-3.5" /> Add
                                      Vendor
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    {newProduct.vendors.map((v, idx) => {
                                      const selectedVendor = (
                                        vendors || []
                                      ).find((vnd) => vnd.id === v.vendorId);
                                      const isVendorAdmin =
                                        selectedVendor?.businessName?.toLowerCase() ===
                                          "admin stock" ||
                                        selectedVendor?.businessName?.toLowerCase() ===
                                          "omw global";

                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-4 bg-white p-2 rounded-[5px] border border-stone-200 shadow-sm"
                                        >
                                          <div className="h-12 w-12 rounded-[5px] bg-[#fdf2f8] flex items-center justify-center shrink-0">
                                            <Store className="h-5 w-5 text-[#be185d]" />
                                          </div>
                                          <div className="relative flex-1">
                                            <select
                                              required
                                              disabled={
                                                v.stock > 0 && v.vendorId !== ""
                                              }
                                              className={cn(
                                                "w-full h-12 bg-transparent px-2 text-sm font-bold focus:outline-none appearance-none transition-all",
                                                v.stock > 0 && v.vendorId !== ""
                                                  ? "opacity-50 cursor-not-allowed"
                                                  : "cursor-pointer",
                                              )}
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
                                                      otherV.vendorId ===
                                                        vnd.id,
                                                  );
                                                return (
                                                  <option
                                                    key={vnd.id}
                                                    value={vnd.id}
                                                    disabled={
                                                      isSelectedElsewhere
                                                    }
                                                  >
                                                    {vnd.businessName?.toLowerCase() ===
                                                    "omw global"
                                                      ? "Admin Stock"
                                                      : vnd.businessName}{" "}
                                                    {isSelectedElsewhere
                                                      ? "— Already Selected"
                                                      : ""}
                                                  </option>
                                                );
                                              })}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                          </div>
                                          <div
                                            className={cn(
                                              "w-[140px] flex items-center gap-3 bg-stone-50 px-4 h-12 rounded-[5px] border border-stone-100 transition-all",
                                              !isVendorAdmin && "opacity-70",
                                            )}
                                          >
                                            <span className="text-[10px] font-black text-stone-400 uppercase">
                                              Stock
                                            </span>
                                            <input
                                              type="text"
                                              readOnly={!isVendorAdmin}
                                              value={v.stock || "0"}
                                              onChange={(e) => {
                                                if (isVendorAdmin) {
                                                  const val =
                                                    e.target.value.replace(
                                                      /\D/g,
                                                      "",
                                                    );
                                                  const newVs = [
                                                    ...newProduct.vendors,
                                                  ];
                                                  newVs[idx] = {
                                                    ...newVs[idx],
                                                    stock: val,
                                                  };
                                                  setNewProduct({
                                                    ...newProduct,
                                                    vendors: newVs,
                                                  });
                                                }
                                              }}
                                              className={cn(
                                                "w-full bg-transparent text-sm font-black transition-all",
                                                isVendorAdmin
                                                  ? "text-stone-900 cursor-text"
                                                  : "text-stone-400 cursor-not-allowed",
                                              )}
                                            />
                                          </div>
                                          {!isVendorAdmin && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (!v.vendorId) {
                                                  toast.error(
                                                    "Please select a vendor first",
                                                  );
                                                  return;
                                                }
                                                const adminStockVendor = (
                                                  vendors || []
                                                ).find(
                                                  (ven) =>
                                                    ven.businessName?.toLowerCase() ===
                                                      "admin stock" ||
                                                    ven.businessName?.toLowerCase() ===
                                                      "omw global",
                                                );
                                                handleViewChange(
                                                  "create-transfer",
                                                  {
                                                    preSelectedSource:
                                                      adminStockVendor?.id,
                                                    preSelectedDest: v.vendorId,
                                                    preSelectedItems:
                                                      editingProductId
                                                        ? [
                                                            {
                                                              id: editingProductId,
                                                              name: newProduct.name,
                                                              transferQty: 1,
                                                              sourceStock:
                                                                Number(
                                                                  newProduct.vendors.find(
                                                                    (v_row) =>
                                                                      v_row.vendorId ===
                                                                      adminStockVendor?.id,
                                                                  )?.stock || 0,
                                                                ),
                                                            },
                                                          ]
                                                        : [],
                                                  },
                                                );
                                              }}
                                              className="h-12 px-4 text-[10px] uppercase font-black tracking-widest text-[#6366f1] bg-[#eef2ff] border border-[#e0e7ff] hover:bg-[#6366f1] hover:text-white rounded-[5px] transition-all flex items-center gap-2"
                                            >
                                              <ArrowRightLeft className="h-3.5 w-3.5" />{" "}
                                              Transfer
                                            </button>
                                          )}
                                          {newProduct.vendors.length > 1 &&
                                            idx !== 0 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (
                                                    window.confirm(
                                                      "Are you sure you want to remove this vendor stock entry? This will not delete the actual stock but will remove the association from this product.",
                                                    )
                                                  ) {
                                                    const newVs = [
                                                      ...newProduct.vendors,
                                                    ];
                                                    newVs.splice(idx, 1);
                                                    setNewProduct({
                                                      ...newProduct,
                                                      vendors: newVs,
                                                    });
                                                  }
                                                }}
                                                className="w-10 h-10 flex items-center justify-center text-stone-300 hover:text-rose-500 transition-all"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 pt-6">
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
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
                                        className={`w-full rounded-[5px] h-14 border border-stone-200 bg-white font-bold px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-[#151515] transition-all text-sm shadow-sm`}
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
                                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1 flex items-center gap-2">
                                      <Tag className="h-3 w-3 text-stone-400" />
                                      Product Tags
                                    </Label>
                                    <div className="min-h-[64px] p-3 flex flex-wrap gap-2.5 border border-stone-200 bg-white rounded-[5px] focus-within:ring-2 focus-within:ring-stone-900 focus-within:border-stone-900 transition-all shadow-sm">
                                      {newProduct.tags &&
                                        newProduct.tags
                                          .split(",")
                                          .map((t) => t.trim())
                                          .filter((t) => t)
                                          .map((tag, idx) => (
                                            <Badge
                                              key={idx}
                                              className="bg-[#1a1a1a] text-white rounded-[4px] px-3.5 py-2 text-[9px] uppercase font-black tracking-[0.1em] flex items-center gap-2.5 group hover:bg-rose-600 transition-all cursor-default border-none shadow-sm"
                                            >
                                              {tag}
                                              <X
                                                className="h-3 w-3 cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                  const currentTags =
                                                    newProduct.tags
                                                      .split(",")
                                                      .map((t) => t.trim())
                                                      .filter((t) => t);
                                                  const newTags =
                                                    currentTags.filter(
                                                      (t) => t !== tag,
                                                    );
                                                  setNewProduct({
                                                    ...newProduct,
                                                    tags: newTags.join(", "),
                                                  });
                                                }}
                                              />
                                            </Badge>
                                          ))}
                                      <input
                                        className="flex-1 min-w-[180px] bg-transparent outline-none text-sm font-bold px-2 py-1 placeholder:text-stone-300 placeholder:font-medium placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                                        placeholder={
                                          newProduct.tags
                                            ? ""
                                            : "ADD PRODUCT TAGS..."
                                        }
                                        value={tagInput}
                                        onChange={(e) =>
                                          setTagInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === ","
                                          ) {
                                            e.preventDefault();
                                            const tag = tagInput
                                              .trim()
                                              .replace(/,/g, "");
                                            if (tag) {
                                              const currentTags =
                                                newProduct.tags
                                                  ? newProduct.tags
                                                      .split(",")
                                                      .map((t) => t.trim())
                                                      .filter((t) => t)
                                                  : [];
                                              if (!currentTags.includes(tag)) {
                                                setNewProduct({
                                                  ...newProduct,
                                                  tags: [
                                                    ...currentTags,
                                                    tag,
                                                  ].join(", "),
                                                });
                                              }
                                            }
                                            setTagInput("");
                                          } else if (
                                            e.key === "Backspace" &&
                                            !tagInput &&
                                            newProduct.tags
                                          ) {
                                            const currentTags = newProduct.tags
                                              .split(",")
                                              .map((t) => t.trim())
                                              .filter((t) => t);
                                            if (currentTags.length > 0) {
                                              const newTags = currentTags.slice(
                                                0,
                                                -1,
                                              );
                                              setNewProduct({
                                                ...newProduct,
                                                tags: newTags.join(", "),
                                              });
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3 col-span-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
                                      Skin Concerns (Tags)
                                    </Label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-stone-50 border border-stone-100 rounded-[5px]">
                                      {[
                                        {
                                          key: "acne",
                                          label: "Acne & Breakouts",
                                        },
                                        {
                                          key: "dark-spots",
                                          label: "Dark Spots",
                                        },
                                        { key: "dullness", label: "Dullness" },
                                        {
                                          key: "hydration",
                                          label: "Hydration",
                                        },
                                        {
                                          key: "sensitive",
                                          label: "Sensitive Skin",
                                        },
                                        { key: "pores", label: "Pores" },
                                        {
                                          key: "oil-control",
                                          label: "Oil Control",
                                        },
                                        { key: "redness", label: "Redness" },
                                        {
                                          key: "anti-aging",
                                          label: "Anti-Aging",
                                        },
                                        { key: "sun", label: "Sun Protection" },
                                        {
                                          key: "uneven-tone",
                                          label: "Uneven Tone",
                                        },
                                      ].map((concern) => (
                                        <button
                                          key={concern.key}
                                          type="button"
                                          onClick={() => {
                                            const current =
                                              newProduct.skinConcerns || [];
                                            const next = current.includes(
                                              concern.key,
                                            )
                                              ? current.filter(
                                                  (k) => k !== concern.key,
                                                )
                                              : [...current, concern.key];
                                            setNewProduct({
                                              ...newProduct,
                                              skinConcerns: next,
                                            });
                                          }}
                                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            (
                                              newProduct.skinConcerns || []
                                            ).includes(concern.key)
                                              ? "bg-stone-900 text-white border-stone-900 shadow-md"
                                              : "bg-white text-stone-400 border-stone-200 hover:border-stone-400"
                                          }`}
                                        >
                                          {concern.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Attribute Toggles */}
                                  <div className="pt-8 border-t border-stone-50 flex flex-wrap items-center gap-10">
                                    <div className="flex items-center space-x-3 group cursor-pointer">
                                      <Switch
                                        id="new-arrival-toggle"
                                        checked={newProduct.newArrival}
                                        onCheckedChange={(val) =>
                                          setNewProduct({
                                            ...newProduct,
                                            newArrival: val,
                                          })
                                        }
                                        className="data-[state=checked]:bg-stone-900"
                                      />
                                      <Label
                                        htmlFor="new-arrival-toggle"
                                        className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors cursor-pointer"
                                      >
                                        New Arrival
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-3 group cursor-pointer">
                                      <Switch
                                        id="best-seller-toggle"
                                        checked={newProduct.bestSeller}
                                        onCheckedChange={(val) =>
                                          setNewProduct({
                                            ...newProduct,
                                            bestSeller: val,
                                          })
                                        }
                                        className="data-[state=checked]:bg-stone-900"
                                      />
                                      <Label
                                        htmlFor="best-seller-toggle"
                                        className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors cursor-pointer"
                                      >
                                        Best Seller
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-3 group cursor-pointer">
                                      <Switch
                                        id="trending-toggle"
                                        checked={newProduct.trending}
                                        onCheckedChange={(val) =>
                                          setNewProduct({
                                            ...newProduct,
                                            trending: val,
                                          })
                                        }
                                        className="data-[state=checked]:bg-stone-900"
                                      />
                                      <Label
                                        htmlFor="trending-toggle"
                                        className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors cursor-pointer"
                                      >
                                        Trending
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-[5px] border border-stone-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
                              <div className="p-6 border-b border-stone-100">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-[10px] bg-[#eef2ff] flex items-center justify-center shadow-sm">
                                    <Brain className="h-6 w-6 text-[#4338ca]" />
                                  </div>
                                  <div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#1a1a1a]">
                                      Product Intelligence
                                    </h2>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">
                                      Detailed formulation analysis
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
                                  className="border-stone-50 px-6"
                                >
                                  <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-[6px] bg-stone-50 flex items-center justify-center border border-stone-100">
                                        <FileText className="h-4 w-4 text-stone-400" />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-700">
                                        Product Description
                                      </span>
                                    </div>
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
                                      className="flex min-h-[150px] w-full rounded-[5px] border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                      placeholder="Enter comprehensive product story..."
                                    />
                                  </AccordionContent>
                                </AccordionItem>

                                {/* HOW TO USE */}
                                <AccordionItem
                                  value="how-to-use"
                                  className="border-stone-50 px-6"
                                >
                                  <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-[6px] bg-stone-50 flex items-center justify-center border border-stone-100">
                                        <Zap className="h-4 w-4 text-stone-400" />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-700">
                                        How to Use
                                      </span>
                                    </div>
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
                                      className="flex min-h-[150px] w-full rounded-[5px] border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                      placeholder="Step-by-step application protocol..."
                                    />
                                  </AccordionContent>
                                </AccordionItem>

                                {/* BENEFITS */}
                                <AccordionItem
                                  value="benefits"
                                  className="border-stone-50 px-6"
                                >
                                  <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-[6px] bg-stone-50 flex items-center justify-center border border-stone-100">
                                        <Sparkles className="h-4 w-4 text-stone-400" />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-700">
                                        Product Benefits
                                      </span>
                                    </div>
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
                                      className="flex min-h-[120px] w-full rounded-[5px] border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
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
                                          className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 bg-emerald-50/50 px-3 py-1 rounded-[5px] hover:bg-emerald-600 hover:text-white transition-all"
                                        >
                                          <Plus className="h-3 w-3" /> Add
                                          Outcome
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
                                              className="appearance-none rounded-[5px] h-12 border border-stone-200 bg-stone-50 font-bold w-16 text-center text-lg cursor-pointer hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900"
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
                                                const u = [...productBenefits];
                                                u[idx].text = e.target.value;
                                                setProductBenefits(u);
                                              }}
                                              className="rounded-[5px] h-12 border-stone-200 bg-stone-50 font-bold px-5 flex-1 focus:ring-stone-900 transition-all"
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
                                                className="h-12 w-12 flex items-center justify-center rounded-[5px] text-stone-300 hover:text-rose-500 hover:bg-rose-50 border border-stone-100 transition-all"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>

                                {/* INGREDIENTS */}
                                <AccordionItem
                                  value="ingredients"
                                  className="border-stone-50 px-6"
                                >
                                  <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-[6px] bg-stone-50 flex items-center justify-center border border-stone-100">
                                        <FlaskConical className="h-4 w-4 text-stone-400" />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-700">
                                        Ingredients Analysis
                                      </span>
                                    </div>
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
                                      className="flex min-h-[150px] w-full rounded-[5px] border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                      placeholder="Full formulation list (INCI format)..."
                                    />
                                  </AccordionContent>
                                </AccordionItem>

                                {/* INFO */}
                                <AccordionItem
                                  value="info"
                                  className="border-none px-6"
                                >
                                  <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="h-8 w-8 rounded-[6px] bg-stone-50 flex items-center justify-center border border-stone-100">
                                        <Info className="h-4 w-4 text-stone-400" />
                                      </div>
                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-700">
                                        Additional Information
                                      </span>
                                    </div>
                                  </AccordionTrigger>

                                  <AccordionContent className="pb-8 space-y-6">
                                    <div className="space-y-6">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-stone-400 italic">
                                          Frequently Asked Questions
                                        </h4>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setProductFaq([
                                              ...productFaq,
                                              { q: "", a: "" },
                                            ])
                                          }
                                          className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 bg-emerald-50/50 px-3 py-1 rounded-[5px] hover:bg-emerald-600 hover:text-white transition-all"
                                        >
                                          <Plus className="h-3 w-3" /> Add Pair
                                        </button>
                                      </div>
                                      <div className="space-y-4">
                                        {productFaq.map((faq, idx) => (
                                          <div
                                            key={idx}
                                            className="p-5 bg-stone-50/50 border border-stone-100 rounded-[5px] space-y-4 relative group"
                                          >
                                            <div className="space-y-1">
                                              <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                                                Question
                                              </label>
                                              <Input
                                                value={faq.q}
                                                onChange={(e) => {
                                                  const u = [...productFaq];
                                                  u[idx].q = e.target.value;
                                                  setProductFaq(u);
                                                }}
                                                placeholder="e.g., Is this safe for sensitive skin?"
                                                className="h-10 text-xs font-bold border-stone-100 bg-white"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                                                Answer
                                              </label>
                                              <textarea
                                                value={faq.a}
                                                onChange={(e) => {
                                                  const u = [...productFaq];
                                                  u[idx].a = e.target.value;
                                                  setProductFaq(u);
                                                }}
                                                placeholder="Detailed response..."
                                                className="w-full min-h-[80px] p-4 text-xs font-medium border border-stone-100 bg-white rounded-[5px] focus:outline-none focus:ring-1 focus:ring-stone-900"
                                              />
                                            </div>
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
                                                className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center text-stone-300 hover:text-rose-500 transition-colors"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="pt-4 border-t border-stone-100">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-2 block">
                                          Technical Notes (Legacy)
                                        </label>
                                        <textarea
                                          value={newProduct.additionalInfo}
                                          onChange={(e) =>
                                            setNewProduct({
                                              ...newProduct,
                                              additionalInfo: e.target.value,
                                            })
                                          }
                                          className="flex min-h-[100px] w-full rounded-[5px] border border-stone-200 bg-stone-50/50 px-6 py-5 text-sm font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 transition-all"
                                          placeholder="Regulatory details, pH level, shelf life etc..."
                                        />
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="col-span-4 space-y-8">
                            <div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-6 space-y-6 transition-all hover:shadow-md">
                              <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                                <div className="h-12 w-12 rounded-[10px] bg-[#fff1f2] flex items-center justify-center shadow-sm">
                                  <ImageIcon className="h-6 w-6 text-[#e11d48]" />
                                </div>
                                <div>
                                  <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#1a1a1a]">
                                    Product Media
                                  </h2>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">
                                    Visual assets & gallery
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
                                  Primary Image{" "}
                                  <span className="text-rose-500">*</span>
                                </Label>
                                <div
                                  onClick={() =>
                                    document
                                      .getElementById("primaryImageFP")
                                      .click()
                                  }
                                  className="relative h-48 rounded-[5px] border border-stone-200 bg-white flex flex-col items-center justify-center cursor-pointer group hover:border-[#6366f1] transition-all overflow-hidden shadow-sm"
                                >
                                  {imageFiles.primary ? (
                                    <>
                                      <img
                                        src={URL.createObjectURL(
                                          imageFiles.primary,
                                        )}
                                        className="h-full w-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-3 items-center justify-center transition-opacity">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-stone-900/80 px-3 py-1 rounded-[5px]">
                                          Primary Image
                                        </span>
                                        {imageFiles.additional.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const firstAdditional =
                                                imageFiles.additional[0];
                                              const remainingAdditional =
                                                imageFiles.additional.slice(1);
                                              setImageFiles({
                                                primary: firstAdditional,
                                                additional: [
                                                  imageFiles.primary,
                                                  ...remainingAdditional,
                                                ],
                                              });
                                            }}
                                            className="px-4 py-2 bg-white text-stone-900 text-[9px] font-black uppercase tracking-widest rounded-[5px] hover:bg-indigo-50 transition-all flex items-center gap-2"
                                          >
                                            <ArrowUpDown className="h-3 w-3" />{" "}
                                            Swap with Next
                                          </button>
                                        )}
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
                                      <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-3 items-center justify-center transition-opacity">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-stone-900/80 px-3 py-1 rounded-[5px]">
                                          Existing Primary
                                        </span>
                                        {(newProduct.existingImages.length >
                                          1 ||
                                          imageFiles.additional.length > 0) && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (
                                                newProduct.existingImages
                                                  .length > 1
                                              ) {
                                                const newExisting = [
                                                  ...newProduct.existingImages,
                                                ];
                                                [
                                                  newExisting[0],
                                                  newExisting[1],
                                                ] = [
                                                  newExisting[1],
                                                  newExisting[0],
                                                ];
                                                setNewProduct({
                                                  ...newProduct,
                                                  existingImages: newExisting,
                                                });
                                              } else {
                                                const firstAdd =
                                                  imageFiles.additional[0];
                                                const remAdd =
                                                  imageFiles.additional.slice(
                                                    1,
                                                  );
                                                const currentPrim =
                                                  newProduct.existingImages[0];
                                                setImageFiles({
                                                  primary: firstAdd,
                                                  additional: remAdd,
                                                });
                                                setNewProduct({
                                                  ...newProduct,
                                                  existingImages: [
                                                    currentPrim,
                                                    ...newProduct.existingImages.slice(
                                                      1,
                                                    ),
                                                  ],
                                                });
                                              }
                                            }}
                                            className="px-4 py-2 bg-white text-stone-900 text-[9px] font-black uppercase tracking-widest rounded-[5px] hover:bg-indigo-50 transition-all flex items-center gap-2"
                                          >
                                            <ArrowUpDown className="h-3 w-3" />{" "}
                                            Swap with Next
                                          </button>
                                        )}
                                        <span className="text-white/60 text-[8px] font-bold uppercase tracking-tighter">
                                          Click to Overwrite
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
                                  className="flex items-center gap-3 p-4 bg-stone-50 rounded-[5px] border border-stone-100 cursor-pointer"
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
                                        ? "bg-[#151515] border-[#151515]"
                                        : "bg-white border-stone-200",
                                    )}
                                  >
                                    {(hasMultipleImages ||
                                      (newProduct.existingImages &&
                                        newProduct.existingImages.length >
                                          1)) && (
                                      <Check className="h-3 w-3 text-white stroke-[4px]" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                    Include Multiple Images
                                  </span>
                                </div>

                                {(hasMultipleImages ||
                                  (newProduct.existingImages &&
                                    newProduct.existingImages.length > 1)) && (
                                  <div className="grid grid-cols-3 gap-3">
                                    {/* Display existing supplementary images */}
                                    {newProduct.existingImages &&
                                      newProduct.existingImages
                                        .slice(1)
                                        .map((url, idx) => (
                                          <div
                                            key={`exist-${idx}`}
                                            className="aspect-square rounded-[5px] overflow-hidden relative group border border-stone-100 hover:border-indigo-400 transition-all"
                                          >
                                            <img
                                              src={getMediaUrl(url)}
                                              className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[1px]">
                                              <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                                {idx + 2}
                                              </div>
                                              <div className="flex items-center gap-2 mb-2">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newExist = [
                                                      ...newProduct.existingImages,
                                                    ];
                                                    const currentPos = idx + 1;
                                                    [
                                                      newExist[currentPos],
                                                      newExist[currentPos - 1],
                                                    ] = [
                                                      newExist[currentPos - 1],
                                                      newExist[currentPos],
                                                    ];
                                                    setNewProduct({
                                                      ...newProduct,
                                                      existingImages: newExist,
                                                    });
                                                  }}
                                                  className="h-7 w-7 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                                                >
                                                  <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                {idx <
                                                  (newProduct.existingImages
                                                    ?.length || 0) -
                                                    2 && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      const newExist = [
                                                        ...newProduct.existingImages,
                                                      ];
                                                      const currentPos =
                                                        idx + 1;
                                                      [
                                                        newExist[currentPos],
                                                        newExist[
                                                          currentPos + 1
                                                        ],
                                                      ] = [
                                                        newExist[
                                                          currentPos + 1
                                                        ],
                                                        newExist[currentPos],
                                                      ];
                                                      setNewProduct({
                                                        ...newProduct,
                                                        existingImages:
                                                          newExist,
                                                      });
                                                    }}
                                                    className="h-7 w-7 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                                                  >
                                                    <ChevronRight className="h-4 w-4" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    {imageFiles.additional.map((file, idx) => (
                                      <div
                                        key={idx}
                                        className="aspect-square rounded-[5px] overflow-hidden relative group border border-stone-100"
                                      >
                                        <img
                                          src={URL.createObjectURL(file)}
                                          className="h-full w-full object-cover"
                                        />

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                            {idx +
                                              (newProduct.existingImages
                                                ?.length || 1) +
                                              1}
                                          </div>
                                          {/* Move Left */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (idx === 0) {
                                                const currentPrimary =
                                                  imageFiles.primary;
                                                const currentThis =
                                                  imageFiles.additional[idx];
                                                const others = [
                                                  ...imageFiles.additional,
                                                ];
                                                others[idx] = currentPrimary;
                                                setImageFiles({
                                                  primary: currentThis,
                                                  additional: others,
                                                });
                                              } else {
                                                const f = [
                                                  ...imageFiles.additional,
                                                ];
                                                [f[idx], f[idx - 1]] = [
                                                  f[idx - 1],
                                                  f[idx],
                                                ];
                                                setImageFiles({
                                                  ...imageFiles,
                                                  additional: f,
                                                });
                                              }
                                            }}
                                            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </button>

                                          {/* Move Right */}
                                          {idx <
                                            imageFiles.additional.length -
                                              1 && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const f = [
                                                  ...imageFiles.additional,
                                                ];
                                                [f[idx], f[idx + 1]] = [
                                                  f[idx + 1],
                                                  f[idx],
                                                ];
                                                setImageFiles({
                                                  ...imageFiles,
                                                  additional: f,
                                                });
                                              }}
                                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                            </button>
                                          )}

                                          {/* Delete Overlay */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const f = [
                                                ...imageFiles.additional,
                                              ];
                                              f.splice(idx, 1);
                                              setImageFiles({
                                                ...imageFiles,
                                                additional: f,
                                              });
                                            }}
                                            className="absolute inset-0 bg-rose-500/40 flex items-center justify-center backdrop-blur-[2px]"
                                          >
                                            <div className="h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                              <Trash2 className="h-4 w-4" />
                                            </div>
                                          </button>
                                        </div>
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
                                            .getElementById(
                                              "additionalImagesFP",
                                            )
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
                                        const files = Array.from(
                                          e.target.files,
                                        );
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

                            <div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-10 space-y-10 transition-all hover:shadow-md">
                              <div className="flex items-center gap-5 border-b border-stone-100 pb-8">
                                <div className="h-14 w-14 rounded-[12px] bg-[#ecfdf5] flex items-center justify-center shadow-sm">
                                  <DollarSign className="h-7 w-7 text-[#059669]" />
                                </div>
                                <div>
                                  <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#065f46]">
                                    Pricing Matrix
                                  </h2>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">
                                    Financial configuration
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-8">
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1">
                                    Base Price (&#8377;)
                                  </Label>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={newProduct.price || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewProduct({
                                        ...newProduct,
                                        price: val,
                                      });
                                    }}
                                    className="rounded-[5px] h-14 border-stone-200 bg-white font-bold px-6 focus:ring-[#151515] transition-all text-sm shadow-sm"
                                    placeholder="0.00"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                      Discount Price (&#8377;)
                                    </Label>
                                    {newProduct.discountPrice &&
                                      newProduct.price &&
                                      Number(newProduct.discountPrice) >=
                                        Number(newProduct.price) && (
                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                                          Invalid: Must be lower than base
                                        </span>
                                      )}
                                  </div>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={newProduct.discountPrice || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (
                                        val &&
                                        newProduct.price &&
                                        Number(val) >= Number(newProduct.price)
                                      ) {
                                        toast.error(
                                          "Discount price must be less than the base price",
                                          {
                                            id: "pricing-error", // Prevent multiple toasts
                                          },
                                        );
                                      }
                                      setNewProduct({
                                        ...newProduct,
                                        discountPrice: val,
                                      });
                                    }}
                                    className={cn(
                                      "rounded-[5px] h-14 border-stone-200 bg-white font-bold px-6 focus:ring-[#151515] transition-all text-sm shadow-sm",
                                      newProduct.discountPrice &&
                                        newProduct.price &&
                                        Number(newProduct.discountPrice) >=
                                          Number(newProduct.price) &&
                                        "border-rose-300 bg-rose-50/30 text-rose-600 focus:ring-rose-500",
                                    )}
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
                            variant="outline"
                            onClick={() => {
                              handleViewChange("inventory");
                              setNewProduct(emptyProduct);
                              setImageFiles({
                                primary: null,
                                additional: [],
                              });
                              setProductLabelDraft(
                                createEmptyProductLabelDraft(),
                              );
                            }}
                            className="flex-1 h-16 rounded-[5px] border border-stone-200 text-stone-900 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-stone-50 transition-all"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading || !hasChanges}
                            className="flex-[2] h-16 rounded-[5px] bg-[#151515] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/10 hover:bg-black transition-all flex items-center justify-center gap-3"
                          >
                            {loading ? (
                              <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                            ) : (
                              <FileCheck className="h-5 w-5" />
                            )}
                            {editingProductId
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

        {/* Manual Offline Sale Registry */}
        <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
          <DialogContent className="sm:max-w-2xl rounded-[5px] p-10 border-none shadow-2xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] blur-2xl bg-emerald-500 rounded-[5px] -mr-8 -mt-8" />
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
                    className="w-full h-12 bg-stone-50 border-stone-100 rounded-[5px] px-4 text-sm font-bold focus:ring-2 focus:ring-stone-900 transition-all outline-none"
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
                    className="h-12 bg-stone-50 border-stone-100 rounded-[5px] px-4 text-sm font-bold shadow-none"
                  />
                </div>
              </div>

              <div className="p-8 bg-stone-50 rounded-[5px] border border-stone-100 space-y-6">
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
                      className="w-full h-10 bg-white border-none rounded-[5px] text-xs font-bold shadow-sm px-3 outline-none"
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
                      className="h-10 bg-white border-none rounded-[5px] text-xs font-bold shadow-sm"
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
                      className="h-10 bg-white border-none rounded-[5px] text-xs font-bold shadow-sm"
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
                    <div className="h-2 w-2 rounded-[5px] bg-emerald-500 animate-pulse" />
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
                    className="h-12 rounded-[5px] px-8 text-[10px] font-black uppercase tracking-widest"
                  >
                    Abort
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 bg-stone-900 hover:bg-[#1a0b2e] text-white rounded-[5px] px-12 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-stone-900/20"
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-500 px-4"
            onClick={() => setSelectedTopProduct(null)}
          >
            <div
              className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

              <button
                onClick={() => setSelectedTopProduct(null)}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-stone-50 hover:bg-stone-100 transition-all cursor-pointer z-20 group"
              >
                <X className="h-5 w-5 text-stone-400 group-hover:text-stone-900 group-hover:rotate-90 transition-all duration-300" />
              </button>

              <div className="flex flex-col items-center relative z-10">
                <div className="w-full aspect-square max-w-[240px] rounded-[32px] bg-stone-50 border border-stone-100/80 mb-8 overflow-hidden flex items-center justify-center p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] relative group/img">
                  {selectedTopProduct.image ? (
                    <img
                      src={getMediaUrl(selectedTopProduct.image)}
                      alt={selectedTopProduct.label}
                      className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-700 ease-out drop-shadow-2xl"
                    />
                  ) : (
                    <Package className="h-20 w-20 text-stone-200" />
                  )}
                </div>

                <div className="text-center px-4 mb-8">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-2 block">
                    Product Spotlight
                  </span>
                  <h3 className="text-2xl font-bold text-stone-900 leading-tight">
                    {selectedTopProduct.label}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-stone-50/80 backdrop-blur-sm p-5 rounded-3xl border border-stone-100 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 duration-300">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Gross Revenue
                    </span>
                    <span className="text-lg font-black text-stone-900 tabular-nums">
                      {formatMoney(selectedTopProduct.val)}
                    </span>
                  </div>

                  <div className="bg-stone-50/80 backdrop-blur-sm p-5 rounded-3xl border border-stone-100 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 duration-300">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Total Units
                    </span>
                    <span className="text-lg font-black text-stone-900 tabular-nums">
                      {selectedTopProduct.qty}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 h-12 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 transition-all font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 duration-300"
                  onClick={() => setSelectedTopProduct(null)}
                >
                  Close Insights
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Removed Dialog for Order Detail */}
        {/* Add Direct Vendor Modal */}
        <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
          <DialogContent className="sm:max-w-2xl w-[95vw] h-fit max-h-[92vh] rounded-[24px] p-0 overflow-hidden border-none shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] bg-white flex flex-col [&>button]:hidden">
            <form
              onSubmit={handleAddVendor}
              className="flex flex-col h-full overflow-hidden"
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Vendor Creation Authority</DialogTitle>
                <DialogDescription>
                  Register and verify a new partner node within the merchant
                  network.
                </DialogDescription>
              </DialogHeader>

              {/* Simplified Header */}
              <header className="p-8 pb-6 bg-white border-b border-stone-100 relative shrink-0">
                <div className="absolute top-0 right-0 p-48 bg-emerald-500/5 blur-[120px] -mr-20 -mt-20 pointer-events-none" />

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all border border-stone-100/50 shadow-sm z-50"
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                      <UserPlus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-stone-900">
                        Add New Vendor
                      </h2>
                      <p className="text-stone-400 font-bold text-sm tracking-tight mt-1">
                        Enter partner details to initialize registry.
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              {/* Scrollable Content Area */}
              <ScrollArea className="flex-1 min-h-0 bg-white">
                <div className="p-8 py-6 space-y-8">
                  {/* Section: Identity */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Business Name{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
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
                        placeholder="e.g. OMW Skincare"
                        className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-stone-900 px-4"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Owner Name{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
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
                        placeholder="Legal Name"
                        className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-stone-900 px-4"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Contact Number{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
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
                        placeholder="+91 XXXXX XXXXX"
                        className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-stone-900 px-4"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
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
                        placeholder="admin@vendor.com"
                        className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-stone-900 px-4"
                      />
                    </div>

                    <div className="col-span-2 space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Login Password{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </Label>
                      <div className="relative group">
                        <Input
                          type="password"
                          value={newVendorData.password}
                          onChange={(e) =>
                            setNewVendorData({
                              ...newVendorData,
                              password: e.target.value,
                            })
                          }
                          required
                          placeholder="Set secure password"
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-stone-900 px-4 pr-12 shadow-inner"
                        />
                        <Lock className="h-4 w-4 text-stone-300 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Business Category{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
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
                        className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-stone-900 px-4"
                      />
                    </div>
                    <div className="col-span-2 space-y-2.5">
                      <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                        Store Address{" "}
                        <span className="text-rose-500 ml-0.5">*</span>
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
                        placeholder="Complete business address..."
                        className="w-full min-h-[100px] p-4 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Action Footer */}
              <footer className="p-6 px-8 bg-stone-50/80 backdrop-blur-md border-t border-stone-100 flex justify-end items-center shrink-0 z-10 gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="font-black uppercase tracking-widest text-[11px] text-stone-400 hover:text-stone-900 transition-all px-4 bg-transparent border-none outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-stone-900 hover:bg-black text-white rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-stone-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Vendor
                </Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Vendor Modal */}
        <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
          <DialogContent className="sm:max-w-2xl w-[95vw] h-fit max-h-[92vh] rounded-[24px] p-0 overflow-hidden border-none shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] bg-white flex flex-col [&>button]:hidden">
            {editingVendor && (
              <form
                onSubmit={handleUpdateVendor}
                className="flex flex-col h-full overflow-hidden"
              >
                <DialogHeader className="sr-only">
                  <DialogTitle>Edit Vendor Authority</DialogTitle>
                  <DialogDescription>
                    Update the configuration for an existing partner node.
                  </DialogDescription>
                </DialogHeader>

                <header className="p-8 pb-6 bg-white border-b border-stone-100 relative shrink-0">
                  <div className="absolute top-0 right-0 p-48 bg-amber-500/5 blur-[120px] -mr-20 -mt-20 pointer-events-none" />

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setIsEditVendorOpen(false)}
                    className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all border border-stone-100/50 shadow-sm z-50"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                        <Pencil className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-stone-900">
                          Edit Vendor
                        </h2>
                        <p className="text-stone-400 font-bold text-sm tracking-tight mt-1">
                          Update profile for{" "}
                          <span className="text-stone-900">
                            {editingVendor.businessName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </header>

                <ScrollArea className="flex-1 min-h-0 bg-white">
                  <div className="p-8 py-6 space-y-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Business Name{" "}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </Label>
                        <Input
                          value={editingVendor.businessName}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              businessName: e.target.value,
                            })
                          }
                          required
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-stone-900 px-4"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Owner Name{" "}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </Label>
                        <Input
                          value={editingVendor.ownerName}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              ownerName: e.target.value,
                            })
                          }
                          required
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-stone-900 px-4"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Contact Number{" "}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </Label>
                        <Input
                          value={editingVendor.contactNumber}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              contactNumber: e.target.value,
                            })
                          }
                          required
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-stone-900 px-4"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          value={editingVendor.email || ""}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              email: e.target.value,
                            })
                          }
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-stone-900 px-4"
                        />
                      </div>

                      <div className="col-span-2 space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Business Category{" "}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </Label>
                        <Input
                          value={editingVendor.businessCategory}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              businessCategory: e.target.value,
                            })
                          }
                          required
                          className="h-12 bg-stone-50/50 border-stone-200 rounded-xl focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-stone-900 px-4"
                        />
                      </div>
                      <div className="col-span-2 space-y-2.5">
                        <Label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                          Store Address{" "}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </Label>
                        <textarea
                          value={editingVendor.storeAddress}
                          onChange={(e) =>
                            setEditingVendor({
                              ...editingVendor,
                              storeAddress: e.target.value,
                            })
                          }
                          required
                          className="w-full min-h-[100px] p-4 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all resize-none shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <footer className="p-6 px-8 bg-stone-50/80 backdrop-blur-md border-t border-stone-100 flex justify-end items-center shrink-0 z-10 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditVendorOpen(false)}
                    className="font-black uppercase tracking-widest text-[11px] text-stone-400 hover:text-stone-900 transition-all px-4 bg-transparent border-none outline-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-stone-900 hover:bg-black text-white rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-stone-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Update Authority
                  </Button>
                </footer>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Add Product Dialog */}
        <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] flex flex-col max-h-[92vh]">
            <DialogHeader className="sr-only">
              <DialogTitle>Quick Add Product</DialogTitle>
              <DialogDescription>
                Fast product ingress for deal management.
              </DialogDescription>
            </DialogHeader>

            <header className="px-8 py-8 bg-stone-900 text-white relative shrink-0">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-stone-100" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Quick Add Product
                  </h2>
                </div>
              </div>
            </header>

            <ScrollArea className="flex-1 overflow-y-auto">
              <form onSubmit={handleQuickAddProduct} className="p-8 space-y-10">
                {/* Visual Section */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                    Product Image
                  </label>
                  <div
                    onClick={() =>
                      document.getElementById("quick-image-input").click()
                    }
                    className="aspect-video w-full border-2 border-stone-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-all overflow-hidden group/img bg-stone-50/50 relative"
                  >
                    {quickAddImage ? (
                      <img
                        src={URL.createObjectURL(quickAddImage)}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : quickAddData.imageUrl ? (
                      <img
                        src={
                          quickAddData.imageUrl.startsWith("http")
                            ? quickAddData.imageUrl
                            : `${API_URL.replace("/api", "")}${quickAddData.imageUrl}`
                        }
                        className="w-full h-full object-cover"
                        alt="Product Media"
                      />
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto">
                          <Camera className="h-5 w-5 text-stone-400" />
                        </div>
                        <p className="text-[12px] font-medium text-stone-400">
                          Click to upload media
                        </p>
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

                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Deal Selection
                    </label>
                    <select
                      value={currentSlotEditing}
                      onChange={(e) => setCurrentSlotEditing(e.target.value)}
                      className="w-full h-12 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 px-4 focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="Deal 1">Deal 1 (Primary Deal)</option>
                      <option value="Deal 2">Deal 2 (Secondary Deal)</option>
                      <option value="Deal 3">Deal 3 (Tertiary Deal)</option>
                      <option value="Deal 4">Deal 4 (Seasonal Deal)</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Product Name
                    </label>
                    <Input
                      required
                      placeholder="e.g. Barrier Cream"
                      value={quickAddData.name}
                      onChange={(e) =>
                        setQuickAddData({
                          ...quickAddData,
                          name: e.target.value,
                        })
                      }
                      className="h-12 bg-white border-stone-200 rounded-xl font-medium text-stone-900 px-4 focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Brand
                    </label>
                    <Input
                      required
                      placeholder="Brand"
                      value={quickAddData.brand}
                      onChange={(e) =>
                        setQuickAddData({
                          ...quickAddData,
                          brand: e.target.value,
                        })
                      }
                      className="h-12 bg-white border-stone-200 rounded-xl font-medium text-stone-900 px-4 focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Price
                    </label>
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
                      className="h-12 bg-white border-stone-200 rounded-xl font-medium text-stone-900 px-4 focus:ring-2 focus:ring-stone-900 transition-all text-sm"
                    />
                  </div>

                  <div className="col-span-2 space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Initial Stock Quota
                    </label>
                    <Input
                      readOnly
                      type="number"
                      value={quickAddData.stock || 0}
                      className="h-12 bg-stone-50 border-stone-200 rounded-xl font-medium text-stone-400 px-4 cursor-not-allowed text-sm"
                    />
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1 ml-1">
                      Stock must be added via "Stock Transfers" after creation
                    </p>
                  </div>
                </div>

                <footer className="pt-6 flex justify-end items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="text-stone-500 hover:text-stone-900 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {quickAddData.id ? "Update Product" : "Create Product"}
                  </Button>
                </footer>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Reset Vendor Password Dialog */}
        <Dialog
          open={!!resetPasswordVendor}
          onOpenChange={(open) => !open && setResetPasswordVendor(null)}
        >
          <DialogContent className="sm:max-w-md rounded-[5px] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <form onSubmit={handleResetVendorPassword}>
              <header className="p-8 pb-6 border-b border-stone-50 bg-white relative">
                <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 blur-3xl -mr-12 -mt-12" />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setResetPasswordVendor(null)}
                  className="absolute top-6 right-6 h-8 w-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-900 transition-colors border-none"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-[5px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                      Reset Authority
                    </h2>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">
                      Credential Lifecycle Protocol
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 px-5 py-4 bg-stone-50/50 rounded-[5px] border border-stone-100 relative z-10">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none">
                    Target Entity Identity
                  </span>
                  <span className="text-sm font-black text-indigo-600 tracking-tight flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    {resetPasswordVendor?.businessName}
                  </span>
                </div>
              </header>

              <div className="p-8 space-y-8 bg-white">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-stone-900 uppercase tracking-widest pl-1">
                    New Security Master Key{" "}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      required
                      type="password"
                      placeholder="Enter unique high-entropy key"
                      value={newVendorPassword}
                      onChange={(e) => setNewVendorPassword(e.target.value)}
                      className="h-14 bg-stone-50 border-stone-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-[5px] font-bold text-base px-5 shadow-inner transition-all pr-12"
                    />
                    <Lock className="h-5 w-5 text-stone-300 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest pl-1 leading-relaxed">
                    Set a new administrative access token for this authority
                    node.
                  </p>
                </div>
              </div>

              <footer className="p-8 bg-stone-50/50 border-t border-stone-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">
                      Awaiting Commit
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setResetPasswordVendor(null)}
                    className="font-black uppercase tracking-widest text-[10px] text-stone-400 hover:text-stone-900 transition-colors px-4 h-12 bg-transparent border-none outline-none cursor-pointer"
                  >
                    Abort
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-10 bg-stone-900 text-white font-black uppercase tracking-widest text-[10px] rounded-[5px] hover:bg-black transition-all shadow-xl shadow-stone-900/10 flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Commit Change
                  </Button>
                </div>
              </footer>
            </form>
          </DialogContent>
        </Dialog>

        <QuickRestockDialog
          open={isRestockOpen}
          onOpenChange={setIsRestockOpen}
          product={selectedRestockProduct}
          onRestock={handleRestockSubmit}
          loading={loading}
          vendors={vendors}
        />

        <AbandonedCartDetailModal
          open={!!selectedAbandonedCart}
          onOpenChange={(open) => !open && setSelectedAbandonedCart(null)}
          cart={selectedAbandonedCart}
          getMediaUrl={getMediaUrl}
          formatMoney={formatMoney}
          currentTime={currentTime}
          serverSkew={serverSkew}
        />

        {/* Stock Transfer Detail Modal */}
        <Dialog
          open={isTransferDetailOpen}
          onOpenChange={setIsTransferDetailOpen}
        >
          <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] flex flex-col max-h-[92vh] ring-1 ring-stone-200/50 [&>button]:hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Stock Transfer Details</DialogTitle>
              <DialogDescription>
                Itemized shipment manifest and logistics timeline.
              </DialogDescription>
            </DialogHeader>

            {detailLoading || !viewingTransfer ? (
              <div className="p-24 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-600 relative z-10" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                  Synchronizing Logistics...
                </p>
              </div>
            ) : (
              <>
                {/* Premium Workstation Header */}
                <div className="relative overflow-hidden bg-white border-b border-stone-100 px-8 py-6 shrink-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-20 -mt-20 pointer-events-none rounded-full" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -ml-20 -mb-20 pointer-events-none rounded-full" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 font-black text-[10px] tracking-[0.15em] uppercase bg-stone-900 text-white border-none shadow-lg shadow-stone-900/10 rounded-full"
                        >
                          Manifest #{viewingTransfer.id.slice(-8).toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              viewingTransfer.status === "COMPLETED"
                                ? "bg-emerald-500 animate-pulse"
                                : viewingTransfer.status === "DISPATCHED"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-stone-300",
                            )}
                          />
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                            Live Status: {viewingTransfer.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight text-stone-900 flex items-center gap-3">
                          Stock Transfer{" "}
                          <span className="text-indigo-600">Protocol</span>
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-stone-400 uppercase tracking-[0.1em]">
                          <Calendar className="h-3 w-3" />
                          <span>Initialized on</span>
                          <span className="text-stone-900 bg-stone-100/80 px-2 py-0.5 rounded-md font-black">
                            {new Date(
                              viewingTransfer.createdAt,
                            ).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsTransferDetailOpen(false)}
                      className="h-10 w-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all focus:outline-none"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#fcfcfc] min-h-0 custom-scrollbar">
                  <div className="p-8 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
                      {/* Left: Manifest Ledger */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                          <h3 className="text-[10px] font-black text-stone-900 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                              <Package className="h-4 w-4 text-indigo-600" />
                            </div>
                            Transfer Manifest
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {viewingTransfer.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="group relative overflow-hidden bg-white rounded-2xl border border-stone-200/60 shadow-sm p-4"
                            >
                              <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-xl bg-stone-50 border border-stone-100 p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                  {item.product?.image ||
                                  item.product?.imageUrls?.[0] ? (
                                    <img
                                      src={getMediaUrl(
                                        item.product.image ||
                                          item.product.imageUrls[0],
                                      )}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Box className="h-6 w-6 text-stone-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-[9px] font-bold tracking-[0.15em] text-stone-400 uppercase mb-0.5">
                                        {item.product?.category?.name ||
                                          "Inventory SKU"}
                                      </p>
                                      <h4 className="text-sm font-black text-stone-900 truncate">
                                        {item.product?.name ||
                                          item.product?.product?.name}
                                      </h4>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                                        Quantity
                                      </p>
                                      <p className="text-sm font-black text-indigo-600 tabular-nums">
                                        {item.quantity} units
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Logistics Workflow */}
                      <div className="lg:col-span-5 space-y-8">
                        {/* Vertical Transit Path */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-stone-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <div className="h-6 w-6 rounded-md bg-stone-50 flex items-center justify-center border border-stone-200">
                              <MapPin className="h-3.5 w-3.5 text-stone-600" />
                            </div>
                            Transit Path
                          </h3>

                          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-5 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center gap-0.5 shrink-0">
                                <div className="h-7 w-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-sm">
                                  <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <div className="w-px h-5 border-l border-dashed border-stone-300 transition-colors" />
                                <div className="h-5 w-5 rounded-full bg-white border border-stone-200 flex items-center justify-center">
                                  <ChevronDown className="h-3 w-3 text-stone-400" />
                                </div>
                                <div className="w-px h-5 border-l border-dashed border-stone-300 transition-colors" />
                                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                                  <Store className="h-3.5 w-3.5" />
                                </div>
                              </div>
                              <div className="flex flex-col justify-between min-w-0 gap-6 py-0.5">
                                <div>
                                  <p className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                                    From
                                  </p>
                                  <p className="text-sm font-black text-stone-900 tracking-tight truncate">
                                    {viewingTransfer.sourceVendor?.businessName?.toLowerCase() ===
                                    "omw global"
                                      ? "ADMIN STOCK"
                                      : viewingTransfer.sourceVendor
                                          ?.businessName || "Source Station"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">
                                    To
                                  </p>
                                  <p className="text-sm font-black text-stone-900 tracking-tight truncate">
                                    {viewingTransfer.destinationVendor?.businessName?.toLowerCase() ===
                                    "omw global"
                                      ? "ADMIN STOCK"
                                      : viewingTransfer.destinationVendor
                                          ?.businessName || "Target Terminal"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compact Status Ledger */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-stone-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <div className="h-6 w-6 rounded-md bg-stone-50 flex items-center justify-center border border-stone-200">
                              <History className="h-3.5 w-3.5 text-stone-600" />
                            </div>
                            Protocol Ledger
                          </h3>

                          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
                            <div
                              className={cn(
                                "px-5 py-3 font-black uppercase tracking-[0.2em] text-[10px] border-b flex items-center justify-between",
                                viewingTransfer.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : viewingTransfer.status === "DISPATCHED"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                    : "bg-stone-50 text-stone-500 border-stone-200",
                              )}
                            >
                              <span>STATUS: {viewingTransfer.status}</span>
                              <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            </div>

                            <div className="p-5 space-y-4">
                              {[
                                {
                                  label: "Initialized",
                                  date: viewingTransfer.createdAt,
                                  icon: Clock,
                                },
                                {
                                  label: "Dispatched",
                                  date: viewingTransfer.dispatchedAt,
                                  icon: Truck,
                                  color: "text-indigo-600",
                                },
                                {
                                  label: "Finalized",
                                  date: viewingTransfer.receivedAt,
                                  icon: CheckCircle2,
                                  color: "text-emerald-600",
                                },
                              ].map((phase, idx) => {
                                if (!phase.date) return null;
                                const PhaseIcon = phase.icon;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <PhaseIcon
                                        className={cn(
                                          "h-3.5 w-3.5",
                                          phase.color || "text-stone-400",
                                        )}
                                      />
                                      <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">
                                        {phase.label}
                                      </span>
                                    </div>
                                    <span
                                      className={cn(
                                        "text-[10px] font-black tabular-nums bg-stone-50 px-2 py-0.5 rounded-md",
                                        phase.color || "text-stone-900",
                                      )}
                                    >
                                      {new Date(phase.date).toLocaleString([], {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white border-t border-stone-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Secure Logistics Ledger
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsTransferDetailOpen(false)}
                    className="px-10 h-12 bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-stone-900/10 hover:-translate-y-1 active:translate-y-0"
                  >
                    Close Protocol
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

const statusLabelMapping = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DISPATCHED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100/50 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-indigo-100/50 text-indigo-700 border-indigo-200";
    case "DISPATCHED":
      return "bg-blue-100/50 text-blue-700 border-blue-200";
    case "COMPLETED":
      return "bg-emerald-100/50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-stone-100/50 text-stone-500 border-stone-200";
    default:
      return "bg-stone-100/50 text-stone-600 border-stone-200";
  }
};

const StockTransferView = ({
  transfers,
  products,
  onViewDetail,
  onRefresh,
  onCreateOpen,
  vendors,
  API_URL,
  formatMoney,
}) => {
  const [updating, setUpdating] = useState(null);

  const getProductSafe = (item) => {
    if (item.product?.name) return item.product.name;
    const cacheHit = products?.find((p) => p.id === item.productId);
    return cacheHit?.name || "Unknown SKU";
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const resp = await fetch(`${API_URL}/stock-transfers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Transfer status updated to ${status}`);
        onRefresh();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase italic">
            Stock <span className="text-emerald-600">Transfers</span>
          </h1>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">
            Outlet-to-Outlet Logistics Hub
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="rounded-[5px] font-black uppercase tracking-widest text-[10px] h-11 border-stone-200"
          >
            Refresh
          </Button>
          <Button
            onClick={onCreateOpen}
            className="bg-emerald-600 text-white rounded-[5px] font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-xl shadow-emerald-500/20"
          >
            Initiate Transfer
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {transfers.length === 0 ? (
          <div className="bg-white rounded-[5px] border border-stone-100 p-20 text-center">
            <div className="h-16 w-16 rounded-full bg-stone-50 mx-auto mb-4 flex items-center justify-center">
              <ArrowRightLeft className="h-8 w-8 text-stone-200" />
            </div>
            <h3 className="text-stone-400 font-black uppercase tracking-widest text-sm">
              No active logistics records
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-stone-100 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">
                      Transfer Identity
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">
                      Logistics Path
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">
                      Item Manifest
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] text-center">
                      Protocol Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] text-right">
                      System Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {transfers.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => onViewDetail(t.id)}
                      className="hover:bg-indigo-50/20 transition-all cursor-pointer group/row border-l-2 border-l-transparent hover:border-l-indigo-500"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 group-hover/row:bg-white group-hover/row:border-indigo-100 group-hover/row:text-indigo-600 group-hover/row:shadow-sm transition-all">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-stone-900 text-sm tracking-tight mb-0.5">
                              #{t.id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-[9px] text-stone-400 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(t.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-md bg-stone-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                              S
                            </div>
                            <span className="text-[11px] font-black text-stone-700 uppercase tracking-tight truncate max-w-[150px]">
                              {t.sourceVendor?.businessName?.toLowerCase() ===
                              "omw global"
                                ? "ADMIN STOCK"
                                : t.sourceVendor?.businessName ||
                                  "Unknown Station"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                              D
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tight truncate max-w-[150px]">
                              {t.destinationVendor?.businessName?.toLowerCase() ===
                              "omw global"
                                ? "ADMIN STOCK"
                                : t.destinationVendor?.businessName ||
                                  "Terminal Target"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1.5 min-w-[200px]">
                          {t.items?.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 text-[10px] border-b border-stone-50 pb-1.5 last:border-0 last:pb-0"
                            >
                              <span className="font-black text-stone-600 truncate max-w-[140px]">
                                {getProductSafe(item)}
                              </span>
                              <span className="font-black text-indigo-600 tabular-nums bg-indigo-50 px-1.5 py-0.5 rounded">
                                ×{item.quantity}
                              </span>
                            </div>
                          ))}
                          {t.items?.length > 2 && (
                            <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest pt-1 italic opacity-60">
                              + {t.items.length - 2} additional units in
                              manifest
                            </div>
                          )}
                          {!t.items || t.items.length === 0 ? (
                            <div className="text-[10px] text-stone-300 italic">
                              Empty Manifest
                            </div>
                          ) : (
                            <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center group/total">
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest group-hover/total:text-indigo-500 transition-colors">
                                Net Quantity
                              </span>
                              <span className="text-xs font-black text-stone-900 tabular-nums">
                                {t.items.reduce(
                                  (sum, item) => sum + (item.quantity || 0),
                                  0,
                                )}{" "}
                                SKUs
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div
                          className={cn(
                            "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] shadow-sm transition-all duration-500",
                            getStatusColor(t.status),
                          )}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          {statusLabelMapping[t.status] || t.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div
                          className="flex items-center justify-end gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {updating === t.id ? (
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest px-4">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing
                            </div>
                          ) : (
                            <>
                              {t.status === "PENDING" && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      updateStatus(t.id, "CANCELLED")
                                    }
                                    className="h-9 px-4 text-rose-500 font-black text-[9px] uppercase hover:bg-rose-50 rounded-lg"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateStatus(t.id, "APPROVED")
                                    }
                                    className="h-9 px-5 bg-stone-900 text-white font-black text-[9px] uppercase hover:bg-black shadow-lg shadow-stone-900/10 rounded-lg transition-all"
                                  >
                                    Approve
                                  </Button>
                                </div>
                              )}
                              {t.status === "APPROVED" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateStatus(t.id, "DISPATCHED")
                                  }
                                  className="h-9 px-6 bg-indigo-600 text-white font-black text-[9px] uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 rounded-lg transition-all"
                                >
                                  Dispatch Shipment
                                </Button>
                              )}
                              {t.status === "DISPATCHED" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateStatus(t.id, "COMPLETED")
                                  }
                                  className="h-9 px-6 bg-emerald-600 text-white font-black text-[9px] uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 rounded-lg transition-all"
                                >
                                  Finalize Receipt
                                </Button>
                              )}
                              {(t.status === "COMPLETED" ||
                                t.status === "CANCELLED") && (
                                <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest italic pr-2">
                                  Protocol Finalized
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateTransferView = ({
  vendors,
  products,
  API_URL,
  onSuccess,
  onCancel,
  adminId,
  initialSourceId = "",
  initialDestId = "",
  initialItems = [],
}) => {
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSourceId) setSourceId(initialSourceId);
    if (initialDestId) setDestId(initialDestId);
    if (initialItems.length > 0) setSelectedItems(initialItems);
  }, [initialSourceId, initialDestId, initialItems]);

  const sourceProducts = useMemo(() => {
    if (!sourceId) return [];
    return products
      .map((p) => {
        const records = p.stockRecords || p.bundledVendors || [];
        const sourceRecord = records.find(
          (r) => (r.vendorId || r.vendor?.id) === sourceId,
        );
        const sourceStock = sourceRecord
          ? sourceRecord.quantity || sourceRecord.stock || 0
          : 0;
        return { ...p, sourceStock };
      })
      .filter((p) => p.sourceStock > 0);
  }, [sourceId, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0)
      return toast.error("Select at least one item");
    if (sourceId === destId)
      return toast.error("Source and destination must be different");

    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/stock-transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVendorId: sourceId,
          destinationVendorId: destId,
          items: selectedItems.map((i) => ({
            productId: i.id,
            quantity: i.transferQty,
          })),
          notes: "Admin Initiated Transfer",
          adminId,
          status: vendors
            .find((v) => v.id === sourceId)
            ?.businessName?.toLowerCase()
            .includes("omw global")
            ? "DISPATCHED"
            : "PENDING",
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("Transfer initiated system-wide");
        onSuccess();
        setSourceId("");
        setDestId("");
        setSelectedItems([]);
      } else {
        toast.error(data.message || "Initiation failed");
      }
    } catch (err) {
      toast.error("Network instability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between gap-4 p-1">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="h-10 w-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all shadow-sm"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              New Stock <span className="text-emerald-600">Transfer</span>
            </h1>
            <p className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-60">
              Transfer inventory across your retail network
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="rounded-full font-black uppercase tracking-widest text-[10px] h-10 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !sourceId || !destId || selectedItems.length === 0
            }
            className="bg-stone-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] h-10 px-8 hover:bg-black transition-all shadow-lg shadow-stone-200"
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Confirm Transfer"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-hidden border border-stone-100">
            <CardHeader className="border-b border-stone-50 bg-stone-50/30 px-6 pt-4 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Store className="h-3.5 w-3.5" /> Distribution Points
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-stone-500 ml-1">
                    Origin Outlet
                  </Label>
                  <div className="relative">
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      required
                      className="w-full h-12 bg-white border border-stone-200 rounded-[8px] px-4 font-bold text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Origin...</option>
                      {vendors
                        .filter(
                          (v) =>
                            v.id !== destId &&
                            v.businessName?.toLowerCase() === "omw global",
                        )
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.businessName?.toLowerCase() === "omw global"
                              ? "ADMIN STOCK"
                              : v.businessName.toUpperCase()}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-stone-500 ml-1">
                    Destination Target
                  </Label>
                  <div className="relative">
                    <select
                      value={destId}
                      onChange={(e) => setDestId(e.target.value)}
                      required
                      className="w-full h-12 bg-white border border-stone-200 rounded-[8px] px-4 font-bold text-sm outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Target...</option>
                      {vendors
                        .filter(
                          (v) =>
                            v.id !== sourceId &&
                            v.businessName?.toLowerCase() !== "omw global",
                        )
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.businessName?.toLowerCase() === "omw global"
                              ? "ADMIN STOCK"
                              : v.businessName.toUpperCase()}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-hidden border border-stone-100">
            <CardHeader className="border-b border-stone-50 bg-stone-50/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-stone-900 flex items-center justify-center">
                    <Package className="h-3 w-3 text-white" />
                  </div>
                  Item Selection
                </CardTitle>
                {sourceId && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-black uppercase bg-stone-100 text-stone-600 border-none px-2 py-0.5 rounded-full"
                  >
                    {sourceProducts.length} IN STOCK
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-6 pb-6">
              {!sourceId ? (
                <div className="py-16 text-center bg-stone-50/50 rounded-[12px] border border-dashed border-stone-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                    Select origin to load inventory
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                    <input
                      type="text"
                      placeholder="SCAN OR SEARCH INVENTORY..."
                      className="w-full h-10 bg-stone-50 border border-stone-100 rounded-[6px] pl-10 pr-4 font-black text-[10px] uppercase tracking-widest outline-none focus:bg-white focus:border-stone-900 transition-all placeholder:text-stone-300 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {sourceProducts.map((p) => {
                      const isSelected = selectedItems.find(
                        (si) => si.id === p.id,
                      );
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isSelected) return;
                            if (p.sourceStock <= 0) {
                              toast.error("Insufficient stock at source");
                              return;
                            }
                            setSelectedItems([
                              ...selectedItems,
                              { ...p, transferQty: 1 },
                            ]);
                          }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border border-stone-100 transition-all cursor-pointer group",
                            isSelected
                              ? "bg-emerald-50 border-emerald-500/20"
                              : p.sourceStock <= 0
                                ? "opacity-50 cursor-not-allowed bg-stone-50"
                                : "bg-white hover:border-stone-300",
                          )}
                        >
                          <div className="h-12 w-12 rounded-lg bg-stone-50 border border-stone-100 overflow-hidden shrink-0">
                            {p.imageUrls?.[0] ? (
                              <img
                                src={getMediaUrl(p.imageUrls[0])}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-stone-900 text-xs uppercase truncate leading-none">
                              {p.name}
                            </p>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                              Source Stock:{" "}
                              <span className="text-stone-900">
                                {p.sourceStock}
                              </span>
                            </p>
                          </div>
                          {isSelected ? (
                            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <Plus className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-hidden border border-stone-100 sticky top-24">
            <CardHeader className="border-b border-stone-50 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-stone-900">
                  Manifest
                </CardTitle>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-[9px] font-bold uppercase tracking-wider text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-6 pt-0 space-y-4">
                {selectedItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">
                      No items selected
                    </p>
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0 gap-4"
                    >
                      <div className="h-12 w-12 rounded-lg bg-stone-50 border border-stone-100 overflow-hidden shrink-0">
                        {item.imageUrls?.[0] ? (
                          <img
                            src={getMediaUrl(item.imageUrls[0])}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[12px] font-black text-stone-900 leading-none">
                          {item.name}
                        </p>
                        <div className="flex flex-col gap-0.5 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                              Admin Reserve: {item.sourceStock}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                item.sourceStock - item.transferQty < 0
                                  ? "bg-rose-500 animate-pulse"
                                  : "bg-emerald-500",
                              )}
                            />
                            <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest">
                              Remaining:{" "}
                              {Math.max(0, item.sourceStock - item.transferQty)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (item.transferQty > 1) {
                              setSelectedItems(
                                selectedItems.map((si) =>
                                  si.id === item.id
                                    ? { ...si, transferQty: si.transferQty - 1 }
                                    : si,
                                ),
                              );
                            } else {
                              setSelectedItems(
                                selectedItems.filter((si) => si.id !== item.id),
                              );
                            }
                          }}
                          className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-black text-stone-900 min-w-[20px] text-center">
                          {item.transferQty}
                        </span>
                        <button
                          onClick={() => {
                            if (item.transferQty < (item.sourceStock || 1000)) {
                              setSelectedItems(
                                selectedItems.map((si) =>
                                  si.id === item.id
                                    ? { ...si, transferQty: si.transferQty + 1 }
                                    : si,
                                ),
                              );
                            } else {
                              toast.info("Limit reached");
                            }
                          }}
                          className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-stone-50/50 border-t border-stone-100 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                      Unique Products
                    </span>
                    <span className="text-[13px] font-black text-stone-600">
                      {selectedItems.length} SKUs
                    </span>
                  </div>

                  {destId && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                        Shipment Target
                      </span>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight truncate max-w-[150px]">
                        {vendors.find((v) => v.id === destId)?.businessName ||
                          "N/A"}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-stone-200/50 my-2" />

                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-black uppercase text-stone-900 tracking-widest">
                      Total Units
                    </span>
                    <span className="text-2xl font-black text-stone-900 tracking-tighter">
                      {selectedItems.reduce(
                        (sum, item) => sum + item.transferQty,
                        0,
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={selectedItems.length === 0 || loading}
                  className="w-full h-12 bg-[#151515] hover:bg-black text-white rounded-lg text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Transfer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
        .then((res) => res.json())
        .then((data) => {
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
