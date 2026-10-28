"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  X,
  Camera, 
  ShieldCheck,
  Compass,
  Trash2,
  ExternalLink,
  Search,
  Building2,
  MapPin,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  FolderOpen,
  Edit3,
  Layers
} from "lucide-react";
import GisCoordinatePicker from "@/components/GisCoordinatePicker";

interface PropertyRecord {
  id: number;
  title: string;
  slug: string;
  category?: string | null;
  floor_number?: string | null;
  demand: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size: string | null;
  description: string | null;
  image_urls: string[];
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface ToastNotification {
  show: boolean;
  type: 'loading' | 'success' | 'error';
  title: string;
  message: string;
  assetCount?: number;
}

interface QueuedPreview {
  id: string;
  url: string;
  name: string;
  size: number;
}

const CATEGORY_OPTIONS = [
  "Bungalow",
  "Villa",
  "Apartment",
  "Condo",
  "Penthouse",
  "Townhouse",
  "Duplex",
  "Commercial Estate",
  "Plot"
];

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'publish' | 'inventory'>('publish');

  // Edit Mode Mandate State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Controlled Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bungalow");
  const [floorNumber, setFloorNumber] = useState("");
  const [demand, setDemand] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 24.7836,
    lng: 67.0622,
  });

  // Rebuilt Multi-Image Upload Queue States
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [existingHeroUrl, setExistingHeroUrl] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<QueuedPreview[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form Submission & Telemetry States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inventory & Deletion States
  const [inventory, setInventory] = useState<PropertyRecord[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Glassmorphic Toast Notification State
  const [toast, setToast] = useState<ToastNotification>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Strict hydration guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-dismiss non-loading toasts
  useEffect(() => {
    if (toast.show && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.type]);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  // Fetch portfolio inventory from API
  const fetchInventory = useCallback(async () => {
    setIsLoadingInventory(true);
    try {
      const res = await fetch(`/api/properties?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoadingInventory(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Memoized coordinate update callback
  const handleCoordinateChange = useCallback((coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
  }, []);

  // Clean form and exit edit mode
  const resetForm = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setCategory("Bungalow");
    setFloorNumber("");
    setDemand("");
    setLocation("");
    setSize("");
    setBedrooms("");
    setBathrooms("");
    setDescription("");
    setCoordinates({ lat: 24.7836, lng: 67.0622 });

    // Revoke any pending object URLs
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    galleryPreviews.forEach((p) => URL.revokeObjectURL(p.url));

    setHeroFile(null);
    setHeroPreview(null);
    setExistingHeroUrl(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGalleryUrls([]);

    if (heroInputRef.current) heroInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }, [heroPreview, galleryPreviews]);

  // Handle Hero Image Selection
  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      setHeroFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveHero = () => {
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroFile(null);
    setHeroPreview(null);
    if (heroInputRef.current) heroInputRef.current.value = "";
  };

  // Handle Multi Gallery File Selection (Enforcing Max 29 Gallery Assets)
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentTotalGallery = existingGalleryUrls.length + galleryFiles.length;
    const remainingSlots = 29 - currentTotalGallery;

    if (remainingSlots <= 0) {
      setToast({
        show: true,
        type: 'error',
        title: 'Gallery Quota Reached',
        message: 'Maximum 29 gallery assets allowed (30 total with Flagship Hero cover). Remove queued or existing photos to add new ones.',
      });
      e.target.value = "";
      return;
    }

    const filesToQueue = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setToast({
        show: true,
        type: 'error',
        title: 'Asset Quota Constrained',
        message: `Queued ${remainingSlots} photos. ${files.length - remainingSlots} files were omitted to respect the 29-gallery quota.`,
      });
    }

    const newPreviews: QueuedPreview[] = filesToQueue.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setGalleryFiles((prev) => [...prev, ...filesToQueue]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = ""; // Reset input so identical or additional files can be picked
  };

  const removeQueuedGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingGalleryUrl = (index: number) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Switch to Edit Mode Mandate from Portfolio Inventory
  const handleStartEdit = (prop: PropertyRecord) => {
    // Populate all form states
    setEditingId(prop.id);
    setTitle(prop.title || "");
    setCategory(prop.category || "Bungalow");
    setFloorNumber(prop.floor_number || "");
    setDemand(prop.demand || "");
    setLocation(prop.location || "");
    setSize(prop.size || "");
    setBedrooms(prop.bedrooms !== null && prop.bedrooms !== undefined ? String(prop.bedrooms) : "");
    setBathrooms(prop.bathrooms !== null && prop.bathrooms !== undefined ? String(prop.bathrooms) : "");
    setDescription(prop.description || "");
    setCoordinates({
      lat: typeof prop.latitude === "number" ? prop.latitude : 24.7836,
      lng: typeof prop.longitude === "number" ? prop.longitude : 67.0622,
    });

    // Populate existing Cloudinary assets
    if (Array.isArray(prop.image_urls) && prop.image_urls.length > 0) {
      setExistingHeroUrl(prop.image_urls[0]);
      setExistingGalleryUrls(prop.image_urls.slice(1));
    } else {
      setExistingHeroUrl(null);
      setExistingGalleryUrls([]);
    }

    // Clear local uncommitted file queues
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    galleryPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setHeroFile(null);
    setHeroPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);

    // Switch to Tab 1 (Mandate Studio)
    setActiveTab('publish');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setToast({
      show: true,
      type: 'success',
      title: 'Mandate Loaded for Editing',
      message: `Loaded "${prop.title}" (#${prop.id}) with ${prop.image_urls?.length || 0} stored visual assets. Adjust fields and click Save Changes.`,
    });
  };

  // Form submission handler: handles both POST (Create) and PUT (Edit)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Verification: Must have either a new Hero file or an existing Hero URL
    if (!heroFile && !existingHeroUrl) {
      setToast({
        show: true,
        type: 'error',
        title: 'Flagship Asset Required',
        message: 'Primary Hero Cover photo is mandatory for listing verification and showcase display.',
      });
      return;
    }

    // Capacity enforcement: max 29 gallery assets (30 total with Hero)
    const totalGalleryCount = existingGalleryUrls.length + galleryFiles.length;
    if (totalGalleryCount > 29) {
      setToast({
        show: true,
        type: 'error',
        title: 'Asset Quota Exceeded',
        message: `Maximum 29 gallery assets allowed (30 total assets with Hero cover). Current: ${totalGalleryCount} gallery assets.`,
      });
      return;
    }

    const formData = new FormData();

    if (editingId !== null) {
      formData.set('id', String(editingId));
    }

    formData.set('title', title);
    formData.set('category', category);
    formData.set('floor_number', (category === 'Apartment' || category === 'Condo' || category === 'Penthouse') ? floorNumber : '');
    formData.set('demand', demand);
    formData.set('location', location);
    formData.set('size', size);
    formData.set('bedrooms', bedrooms);
    formData.set('bathrooms', bathrooms);
    formData.set('description', description);
    formData.set('latitude', coordinates.lat.toFixed(6));
    formData.set('longitude', coordinates.lng.toFixed(6));

    // Append Hero image (new file if selected; or retained URL in edit mode)
    if (heroFile) {
      formData.append('image', heroFile);
    }
    if (existingHeroUrl) {
      formData.set('existing_hero_url', existingHeroUrl);
    }

    // Append retained gallery URLs
    formData.set('existing_gallery_urls', JSON.stringify(existingGalleryUrls));

    // Append newly selected gallery files
    galleryFiles.forEach((file) => {
      formData.append('gallery_images', file);
    });

    const isEditMode = editingId !== null;
    const totalActiveAssets = (heroFile || existingHeroUrl ? 1 : 0) + totalGalleryCount;

    setIsSubmitting(true);
    setToast({
      show: true,
      type: 'loading',
      title: isEditMode ? 'Updating Mandate & Merging Assets' : 'Encrypting & Concurrently Uploading',
      message: `${isEditMode ? 'Updating' : 'Publishing'} ${totalActiveAssets} visual assets with 1920x1080 master hero scaling & Cadastral GIS coordinates (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})...`,
      assetCount: totalActiveAssets,
    });

    try {
      const response = await fetch('/api/listings', {
        method: isEditMode ? 'PUT' : 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setToast({
          show: true,
          type: 'success',
          title: isEditMode ? 'Mandate Updated Successfully' : 'Mandate Published Successfully',
          message: data.message || `Property securely processed with ${totalActiveAssets} visual assets & GIS coordinates in portfolio desk.`,
          assetCount: totalActiveAssets,
        });

        resetForm();
        fetchInventory();
        if (isEditMode) {
          setActiveTab('inventory');
        }
      } else {
        setToast({
          show: true,
          type: 'error',
          title: isEditMode ? 'Update Execution Failed' : 'Publication Failed',
          message: data.error || `Server responded with status ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error: any) {
      console.error(error);
      setToast({
        show: true,
        type: 'error',
        title: 'Pipeline Network Error',
        message: error?.message || 'Unable to establish secure connection with portfolio database desk.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Deletion execution handler
  const executeDeletion = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setToast({
      show: true,
      type: 'loading',
      title: 'Executing Secure Deletion Suite',
      message: `Expunging "${deleteTarget.title}" (#${deleteTarget.id}) and purging Cloudinary visual assets...`,
    });

    try {
      const response = await fetch(`/api/listings?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setInventory((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setToast({
          show: true,
          type: 'success',
          title: 'Mandate Permanently Expunged',
          message: data.message || `Listing #${deleteTarget.id} was permanently removed.`,
        });
        setDeleteTarget(null);
        setDeleteConfirmText("");
      } else {
        setToast({
          show: true,
          type: 'error',
          title: 'Deletion Failed',
          message: data.error || 'Unable to delete listing.',
        });
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setToast({
        show: true,
        type: 'error',
        title: 'Deletion Pipeline Error',
        message: err?.message || 'Failed to communicate with portfolio database.',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // Memoized search filter for inventory
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return inventory;
    const q = inventorySearch.toLowerCase();
    return inventory.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.demand.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.floor_number && p.floor_number.toLowerCase().includes(q)) ||
        String(p.id).includes(q)
    );
  }, [inventory, inventorySearch]);

  const totalQueuedGallery = existingGalleryUrls.length + galleryFiles.length;
  const showFloorInput = category === "Apartment" || category === "Condo" || category === "Penthouse";

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-3.5 xs:p-5 sm:p-8 lg:p-12 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* ==================== GLASSMORPHIC TOAST BANNER ==================== */}
      {toast.show && (
        <div className="fixed top-4 sm:top-6 left-4 sm:left-auto right-4 sm:right-6 z-50 max-w-md w-auto sm:w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-5 backdrop-blur-xl border shadow-2xl transition-all duration-300 ${
              toast.type === 'loading'
                ? 'bg-black/95 border-[#D4AF37]/60 text-white shadow-[#D4AF37]/10'
                : toast.type === 'success'
                ? 'bg-black/95 border-emerald-500/60 text-white shadow-emerald-500/10'
                : 'bg-black/95 border-rose-500/60 text-white shadow-rose-500/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {toast.type === 'loading' && (
                    <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                  )}
                  {toast.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {toast.type === 'error' && (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-medium tracking-wide">
                      {toast.title}
                    </h4>
                    {toast.assetCount !== undefined && (
                      <span className="text-[10px] tracking-wider uppercase bg-white/10 px-2 py-0.5 border border-white/20 text-[#D4AF37]">
                        {toast.assetCount} ASSETS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    {toast.message}
                  </p>
                </div>
              </div>
              {toast.type !== 'loading' && (
                <button
                  onClick={dismissToast}
                  className="text-zinc-400 hover:text-white p-1 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECURE DELETION CONFIRMATION MODAL ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-[#111113] border border-rose-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => {
                setDeleteTarget(null);
                setDeleteConfirmText("");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400 border-b border-rose-500/20 pb-4">
              <div className="w-10 h-10 rounded-none bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-light text-white">
                  Confirm Permanent Expunction
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-mono">
                  Irreversible Portfolio Action
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-black/60 p-4 border border-white/10">
              <div className="flex items-center gap-3">
                {deleteTarget.image_urls?.[0] && (
                  <div className="relative w-16 h-12 flex-shrink-0 border border-white/20 overflow-hidden">
                    <img 
                      src={deleteTarget.image_urls[0]} 
                      alt={deleteTarget.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-sm font-medium text-white">{deleteTarget.title}</h4>
                  <p className="text-xs text-[#D4AF37] font-mono">{deleteTarget.demand}</p>
                  <p className="text-[10px] text-zinc-400">{deleteTarget.location}</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-white/10">
                Warning: Executing this will permanently purge the database record and expunge all {deleteTarget.image_urls?.length || 0} associated Cloudinary visual assets from the CDN.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-zinc-300 font-mono block">
                Type <span className="text-rose-400 font-bold">CONFIRM</span> to authorize deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full bg-black/80 border border-rose-500/40 p-3 text-sm font-mono text-white focus:border-rose-400 outline-none uppercase"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-3 text-xs uppercase tracking-wider border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeDeletion}
                disabled={deleteConfirmText.trim().toUpperCase() !== "CONFIRM" || isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:text-zinc-500 text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isDeleting ? "PURGING..." : "EXPUNGE MANDATE"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADMIN PORTAL HEADER ==================== */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono">
                Staff Principal Enterprise Desk
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-light tracking-wide text-white mt-1">
              Prime Time <span className="text-[#D4AF37]">Command Center</span>
            </h1>
            <p className="text-white/50 mt-1 text-xs">
              30 HD Asset Cloudinary Pipeline • Cadastral GIS Engine • Listing Edit & Deletion Suite
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 px-4 py-2.5 transition-colors self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Portfolio</span>
            </Link>
          </div>
        </div>

        {/* Prominent Enterprise Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 border-b border-white/15 pb-4 mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`px-4 xs:px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center sm:justify-start space-x-2.5 border ${
              activeTab === 'publish'
                ? 'bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {editingId !== null ? <Edit3 className="w-4 h-4 flex-shrink-0" /> : <PlusCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{editingId !== null ? `Tab 1: Edit Mandate #${editingId}` : 'Tab 1: Publish New Mandate'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 xs:px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center sm:justify-start space-x-2.5 border ${
              activeTab === 'inventory'
                ? 'bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Tab 2: Inventory & Edit Desk</span>
            <span className={`text-[10px] px-2 py-0.5 font-mono ml-auto sm:ml-0 ${activeTab === 'inventory' ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
              {inventory.length}
            </span>
          </button>
        </div>

        {/* ==================== TAB 1: MANDATE STUDIO (CREATE & EDIT) ==================== */}
        {activeTab === 'publish' && (
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6 sm:space-y-8 bg-white/[0.02] border border-white/10 p-4 xs:p-6 sm:p-10 rounded-xl backdrop-blur-md shadow-2xl"
          >
            {/* Active Edit Mode Mandate Banner */}
            {editingId !== null && (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] block font-semibold">
                      [EDIT MANDATE ACTIVE]
                    </span>
                    <h3 className="font-serif text-sm sm:text-base font-normal text-white">
                      Modifying Mandate #{editingId}: <span className="text-[#D4AF37]">{title || "Untitled Property"}</span>
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-mono text-zinc-300 hover:text-white border border-white/20 hover:border-white/40 px-3.5 py-1.5 transition-colors self-end sm:self-auto bg-black/40"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Exit Edit Mode</span>
                </button>
              </div>
            )}

            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-white font-light">
                  {editingId !== null ? `Edit Listing Specifications (#${editingId})` : "Property Mandate Registration"}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Populate architectural specifications, category classification, coordinates, and manage up to 30 HD visual assets.
                </p>
              </div>

              {editingId !== null && (
                <span className="text-[10px] font-mono px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 self-start sm:self-auto">
                  UPDATING EXISTING RECORD
                </span>
              )}
            </div>

            {/* Core Architectural Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Title */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Property Title *</label>
                <input 
                  name="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 500 Yards Ultra-Luxury Bungalow" 
                />
              </div>

              {/* Demand / Price */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Demand (PKR) *</label>
                <input 
                  name="demand" 
                  value={demand}
                  onChange={(e) => setDemand(e.target.value)}
                  required 
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 485,000,000" 
                />
              </div>

              {/* STEP 3: Category Dropdown */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium flex items-center justify-between">
                  <span>Category Classification *</span>
                  <span className="text-[9px] text-[#D4AF37] font-mono">SUPABASE INDEXED</span>
                </label>
                <select 
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat} className="bg-neutral-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 3: Conditional Floor Number Input (Rendered ONLY for Apartment, Condo, Penthouse) */}
              {showFloorInput ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-medium flex items-center justify-between">
                    <span>Floor Number / Level *</span>
                    <span className="text-[9px] text-zinc-400 font-mono">Multi-Story Unit</span>
                  </label>
                  <input 
                    name="floor_number" 
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    className="w-full bg-black/60 border border-[#D4AF37]/50 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                    placeholder="e.g. 14th Floor" 
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Cadastral Location Enclave *</label>
                  <input 
                    name="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                    placeholder="e.g. DHA Phase 8 (Khayaban-e-Ghalib), Karachi" 
                  />
                </div>
              )}

              {/* Location Enclave if Floor Input was shown */}
              {showFloorInput && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Cadastral Location Enclave *</label>
                  <input 
                    name="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                    placeholder="e.g. Emaar Crescent Bay / DHA Phase 8, Karachi" 
                  />
                </div>
              )}

              {/* Size / Area */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Size / Area</label>
                <input 
                  name="size" 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 500 Sq. Yds / 2,400 Sq. Ft." 
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bedrooms</label>
                  <input 
                    type="number" 
                    name="bedrooms" 
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                    placeholder="e.g. 5" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bathrooms</label>
                  <input 
                    type="number" 
                    name="bathrooms" 
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                    placeholder="e.g. 6" 
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Architectural Description & Specs</label>
              <textarea 
                name="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4} 
                className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                placeholder="Italian travertine stone facade, double-height glass atrium, private temperature-controlled pool, basement cinema lounge..." 
              />
            </div>

            {/* ==================== STEP 2: LEAFLET GIS COORDINATE MAP ENGINE ==================== */}
            <div className="pt-2">
              <GisCoordinatePicker
                latitude={coordinates.lat}
                longitude={coordinates.lng}
                locationLabel={location}
                onChange={handleCoordinateChange}
              />
            </div>

            {/* ==================== STEP 4: REBUILD MULTI-IMAGE UPLOAD QUEUE ==================== */}

            {/* 1. Flagship Hero Cover Photo */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>1. Flagship Hero Cover Photo (Master 1920x1080)</span>
                </label>

                {(heroFile || existingHeroUrl) && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                    {heroFile ? `NEW FILE: ${heroFile.name}` : "STORED CLOUDINARY COVER"}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-white/50">
                Primary showcase image. Transformed and constrained in Cloudinary to master 1920x1080 resolution (`crop: limit, quality: auto`).
              </p>

              {/* Dedicated Live Hero Preview Box */}
              <div className="border border-white/15 bg-black/40 rounded-xl p-4">
                {heroPreview ? (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-[#D4AF37]/60 group">
                    <img 
                      src={heroPreview} 
                      alt="Flagship Hero Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-mono tracking-wider font-semibold">
                      FLAGSHIP HERO COVER (QUEUED FILE)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveHero}
                      className="absolute top-3 right-3 bg-rose-600/90 hover:bg-rose-500 text-white p-1.5 rounded-full shadow-lg transition-colors"
                      title="Remove Queued Hero Cover"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 text-[10px] font-mono text-zinc-300">
                      {(heroFile!.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                ) : existingHeroUrl ? (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-white/30 group">
                    <img 
                      src={existingHeroUrl} 
                      alt="Current Flagship Hero Cover" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1 border border-white/30 text-white text-[10px] font-mono tracking-wider">
                      FLAGSHIP HERO COVER (CURRENT ASSET)
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-1 text-[10px] font-mono text-zinc-300">
                      Retained in Edit Mode unless replacement file chosen below
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-36 rounded-lg border-2 border-dashed border-white/15 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                    <Camera className="w-8 h-8 text-zinc-600" />
                    <span className="text-xs uppercase tracking-wider font-mono">
                      FLAGSHIP HERO COVER PREVIEW (SELECT FILE BELOW)
                    </span>
                  </div>
                )}

                <div className="mt-3">
                  <input 
                    ref={heroInputRef}
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    required={!existingHeroUrl}
                    onChange={handleHeroChange}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white/80 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* 2. Interior Gallery Photos & Queued Thumbnail Ribbon */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="text-xs uppercase tracking-widest text-white/90 font-semibold flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span>2. Interior Gallery Photos (Max 29 Gallery Assets)</span>
                </label>

                {/* Queue Counter Telemetry */}
                <span 
                  className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-md border ${
                    totalQueuedGallery > 29 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                      : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                  }`}
                >
                  {totalQueuedGallery} / 29 Gallery Assets Queued ({1 + totalQueuedGallery}/30 Total)
                </span>
              </div>

              <p className="text-[11px] text-white/50">
                Interior, aerial, and layout captures. Select multiple files simultaneously (max 29 interior assets). Individual thumbnails feature an instant `✕` delete button.
              </p>

              {/* Multi-file selector */}
              <input 
                ref={galleryInputRef}
                type="file" 
                name="gallery_images" 
                accept="image/*" 
                multiple 
                onChange={handleGalleryChange}
                disabled={totalQueuedGallery >= 29}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer transition-colors disabled:opacity-50" 
              />

              {/* Queued Thumbnail Ribbon Grid */}
              <div className="border border-white/15 bg-black/40 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-zinc-400">
                  <span>Queued Visual Asset Ribbon</span>
                  <span>{totalQueuedGallery} Assets Active</span>
                </div>

                {totalQueuedGallery === 0 ? (
                  <div className="py-8 text-center text-zinc-500 space-y-1">
                    <Layers className="w-6 h-6 mx-auto mb-1 text-zinc-600" />
                    <p className="text-xs font-mono">NO INTERIOR GALLERY ASSETS QUEUED</p>
                    <p className="text-[10px] text-zinc-600">Select photos above to preview and curate before publishing.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 max-h-96 overflow-y-auto pr-1">
                    {/* Retained Existing Gallery Assets in Edit Mode */}
                    {existingGalleryUrls.map((url, idx) => (
                      <div 
                        key={`existing-gallery-${idx}`}
                        className="group relative aspect-video bg-neutral-900 border border-white/20 rounded-lg overflow-hidden"
                      >
                        <img 
                          src={url} 
                          alt={`Existing asset ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono px-1 py-0.2 text-emerald-400 border border-emerald-500/30">
                          SAVED #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExistingGalleryUrl(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform group-hover:scale-110 touch-target-48"
                          title="Remove Stored Photo from Mandate"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Newly Queued Files */}
                    {galleryPreviews.map((preview, idx) => (
                      <div 
                        key={preview.id}
                        className="group relative aspect-video bg-neutral-900 border border-[#D4AF37]/40 rounded-lg overflow-hidden animate-in fade-in duration-200"
                      >
                        <img 
                          src={preview.url} 
                          alt={preview.name} 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-black/80 text-[8px] font-mono px-1 py-0.2 text-[#D4AF37] border border-[#D4AF37]/30">
                          QUEUED
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQueuedGalleryFile(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform group-hover:scale-110 touch-target-48"
                          title="Remove Queued Photo"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 right-1 bg-black/85 text-[8px] font-mono px-1 text-zinc-300 truncate max-w-[80px]">
                          {(preview.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Submit & Telemetry Action Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || totalQueuedGallery > 29} 
                className={`w-full font-semibold tracking-widest text-xs uppercase py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl ${
                  editingId !== null 
                    ? "bg-[#D4AF37] hover:bg-amber-400 text-black" 
                    : "bg-white hover:bg-[#D4AF37] text-black"
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isSubmitting 
                    ? (editingId !== null ? "UPDATING MANDATE & MERGING ASSETS..." : "CONCURRENTLY UPLOADING & PUBLISHING...") 
                    : totalQueuedGallery > 29 
                    ? "EXCEEDED LIMIT: REDUCE ASSETS (MAX 29 GALLERY)" 
                    : editingId !== null 
                    ? `SAVE CHANGES & UPDATE MANDATE #${editingId}` 
                    : `PUBLISH ${1 + totalQueuedGallery} ASSETS WITH GIS COORDINATES`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 2: PORTFOLIO INVENTORY & EDIT / DELETION SUITE ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Control Bar: Search & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.02] border border-white/10 p-4 rounded-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter by title, category, floor, enclave, price..."
                  className="w-full bg-black/80 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] outline-none rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={fetchInventory}
                  disabled={isLoadingInventory}
                  className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white border border-white/10 hover:border-white/30 px-3.5 py-2 transition-colors rounded-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventory ? 'animate-spin text-[#D4AF37]' : ''}`} />
                  <span>Refresh Inventory</span>
                </button>

                <span className="text-xs font-mono text-[#D4AF37] px-3 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                  {filteredInventory.length} Active Records
                </span>
              </div>
            </div>

            {/* Inventory Listing Records */}
            {isLoadingInventory && inventory.length === 0 ? (
              <div className="p-12 text-center border border-white/10 bg-black/40 rounded-xl">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400 font-mono">Querying Supabase Portfolio Desk...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-12 text-center border border-white/10 bg-black/40 rounded-xl space-y-2">
                <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-300 font-serif">No mandates match your criteria.</p>
                <p className="text-xs text-zinc-500">Try adjusting the search filter or publish a new property.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInventory.map((prop) => {
                  const hasGis =
                    typeof prop.latitude === "number" &&
                    typeof prop.longitude === "number";

                  return (
                    <div
                      key={`inventory-row-${prop.id}`}
                      className="group bg-white/[0.02] border border-white/10 hover:border-white/25 p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex-shrink-0 bg-black border border-white/15 rounded-lg overflow-hidden">
                          {prop.image_urls?.[0] ? (
                            <img
                              src={prop.image_urls[0]}
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/85 text-[8px] font-mono px-1 py-0.2 text-[#D4AF37]">
                            #{prop.id}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base sm:text-lg text-white font-normal">
                              {prop.title}
                            </h3>

                            {/* Category Badge */}
                            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
                              {prop.category || "Bungalow"}
                            </span>

                            {/* Floor Number Badge (if applicable) */}
                            {prop.floor_number && (
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-300">
                                {prop.floor_number}
                              </span>
                            )}

                            {hasGis ? (
                              <span className="inline-flex items-center space-x-1 text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                <Compass className="w-2.5 h-2.5" />
                                <span>GIS: {prop.latitude?.toFixed(4)}, {prop.longitude?.toFixed(4)}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-white/10">
                                GIS Pending
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#D4AF37] font-mono font-medium">
                            PKR {prop.demand}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              <span>{prop.location}</span>
                            </span>
                            {prop.size && <span>• {prop.size}</span>}
                            {prop.bedrooms && <span>• {prop.bedrooms} Beds</span>}
                            {prop.bathrooms && <span>• {prop.bathrooms} Baths</span>}
                            <span>• {prop.image_urls?.length || 0} Assets</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (EDIT, INSPECT, REMOVE) */}
                      <div className="flex items-center space-x-2 self-start sm:self-end md:self-center flex-wrap gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto">
                        {/* STEP 4: Full Listing Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(prop)}
                          className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 px-3.5 py-2 transition-all shadow-sm rounded-lg"
                          title={`Edit specifications for ${prop.title}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>✏️ EDIT</span>
                        </button>

                        <Link
                          href={`/properties/${prop.slug || prop.id}`}
                          target="_blank"
                          className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white border border-white/15 hover:border-white/40 px-3.5 py-2 transition-colors rounded-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Inspect</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(prop)}
                          className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider text-white bg-rose-600 hover:bg-rose-500 border border-rose-500 px-4 py-2 transition-all shadow-md shadow-rose-950/40 rounded-lg hover:brightness-110"
                          title={`Permanently expunge ${prop.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                          <span>[REMOVE LISTING]</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
