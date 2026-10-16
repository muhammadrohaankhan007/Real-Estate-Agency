"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FolderOpen
} from "lucide-react";
import GisCoordinatePicker from "@/components/GisCoordinatePicker";

interface PropertyRecord {
  id: number;
  title: string;
  slug: string;
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

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'publish' | 'inventory'>('publish');

  // Publication Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [heroFileName, setHeroFileName] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 24.7836,
    lng: 67.0622,
  });

  // Inventory & Deletion States
  const [inventory, setInventory] = useState<PropertyRecord[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Integrated Glassmorphic Toast Notification State
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

  // Memoized search filter for inventory
  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return inventory;
    const q = inventorySearch.toLowerCase();
    return inventory.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.demand.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [inventory, inventorySearch]);

  // Form submission handler with GIS telemetry
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const heroFile = formData.get('image') as File | null;
    if (!heroFile || heroFile.size === 0) {
      setToast({
        show: true,
        type: 'error',
        title: 'Flagship Asset Required',
        message: 'Primary Hero Cover photo is mandatory for listing verification and showcase display.',
      });
      return;
    }

    const galleryFilesRaw = formData.getAll('gallery_images') as File[];
    const validGalleryFiles = galleryFilesRaw.filter(
      (f) => f && f.size > 0 && f.name && f.name !== 'undefined'
    );

    // Client-side 30-asset capacity enforcement (1 Hero + max 29 Gallery)
    if (validGalleryFiles.length > 29) {
      setToast({
        show: true,
        type: 'error',
        title: 'Asset Quota Exceeded',
        message: `Maximum 29 interior photos allowed (30 total assets with Hero cover). You have selected ${validGalleryFiles.length} photos.`,
      });
      return;
    }

    // Attach exact GIS coordinates
    formData.set('latitude', coordinates.lat.toFixed(6));
    formData.set('longitude', coordinates.lng.toFixed(6));

    const totalAssets = 1 + validGalleryFiles.length;

    setIsSubmitting(true);
    setToast({
      show: true,
      type: 'loading',
      title: 'Encrypting & Concurrently Uploading',
      message: `Processing ${totalAssets} HD visual assets with 1920x1080 master hero scaling & Cadastral GIS coordinates (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})...`,
      assetCount: totalAssets,
    });

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setToast({
          show: true,
          type: 'success',
          title: 'Mandate Published Successfully',
          message: data.message || `Property securely published with ${totalAssets} visual assets & GIS coordinates to Supabase portfolio.`,
          assetCount: totalAssets,
        });
        form.reset();
        setGalleryCount(0);
        setHeroFileName("");
        // Refresh inventory
        fetchInventory();
      } else {
        setToast({
          show: true,
          type: 'error',
          title: 'Publication Failed',
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
        // Optimistically remove from state
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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 sm:p-8 lg:p-12 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* ==================== GLASSMORPHIC TOAST BANNER ==================== */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
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
                    {toast.assetCount && (
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
              30 HD Asset Cloudinary Pipeline • Cadastral GIS Engine • Secure Deletion Suite
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
        <div className="flex flex-wrap items-center gap-3 border-b border-white/15 pb-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold transition-all flex items-center space-x-2.5 border ${
              activeTab === 'publish'
                ? 'bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tab 1: Publish New Mandate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold transition-all flex items-center space-x-2.5 border ${
              activeTab === 'inventory'
                ? 'bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Tab 2: Portfolio Inventory & Deletion Manager</span>
            <span className={`text-[10px] px-2 py-0.5 font-mono ${activeTab === 'inventory' ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
              {inventory.length}
            </span>
          </button>
        </div>

        {/* ==================== TAB 1: MANDATE PUBLICATION STUDIO ==================== */}
        {activeTab === 'publish' && (
          <form 
            onSubmit={handleSubmit} 
            className="space-y-8 bg-white/[0.02] border border-white/10 p-6 sm:p-10 rounded-none backdrop-blur-md shadow-2xl"
          >
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-serif text-xl sm:text-2xl text-white font-light">
                Property Mandate Registration
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Populate architectural specifications, coordinates, and upload up to 30 high-resolution visual assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Property Title *</label>
                <input 
                  name="title" 
                  required 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 500 Yards Ultra-Luxury Bungalow" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Demand (PKR) *</label>
                <input 
                  name="demand" 
                  required 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 485,000,000" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Cadastral Location Enclave *</label>
                <input 
                  name="location" 
                  required 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. DHA Phase 8 (Khayaban-e-Ghalib), Karachi" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Size / Area</label>
                <input 
                  name="size" 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 500 Sq. Yds / 1000 Sq. Yds" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bedrooms</label>
                <input 
                  type="number" 
                  name="bedrooms" 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 6" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bathrooms</label>
                <input 
                  type="number" 
                  name="bathrooms" 
                  className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                  placeholder="e.g. 7" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Architectural Description & Specs</label>
              <textarea 
                name="description" 
                rows={4} 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors text-sm" 
                placeholder="Italian travertine stone facade, double-height glass atrium, private temperature-controlled pool, basement cinema lounge..." 
              />
            </div>

            {/* ==================== GIS COORDINATE MAP ENGINE ==================== */}
            <div className="pt-2">
              <GisCoordinatePicker
                latitude={coordinates.lat}
                longitude={coordinates.lng}
                onChange={handleCoordinateChange}
              />
            </div>

            {/* ==================== 1. MAIN HERO COVER IMAGE ==================== */}
            <div className="space-y-2 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>1. Main Hero Cover Photo (Required — Master 1920x1080)</span>
                </label>
                {heroFileName && (
                  <span className="text-[11px] text-zinc-400 truncate max-w-xs">{heroFileName}</span>
                )}
              </div>
              <p className="text-[11px] text-white/50">
                Flagship master asset automatically scaled to 1920x1080 resolution. Displayed on the homepage showcase and detail header.
              </p>
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                required 
                onChange={(e) => setHeroFileName(e.target.files?.[0]?.name || "")}
                className="w-full bg-black/60 border border-white/10 rounded-none p-3 text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer transition-colors" 
              />
            </div>

            {/* ==================== 2. INTERIOR & GALLERY PHOTOS ==================== */}
            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-white/90 font-semibold flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-zinc-400" />
                  <span>2. Interior & Gallery Photos (Up to 29 Assets, Max 30 Total)</span>
                </label>
                {galleryCount > 0 && (
                  <span 
                    className={`text-[11px] font-medium px-2.5 py-1 border ${
                      galleryCount > 29 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                        : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                    }`}
                  >
                    {galleryCount} / 29 gallery assets queued ({1 + galleryCount}/30 total)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50">
                Hold Shift or Ctrl to select multiple images (courtyard, bedrooms, kitchens, baths, aerials, floorplans). Max 29 photos.
              </p>
              <input 
                type="file" 
                name="gallery_images" 
                accept="image/*" 
                multiple 
                onChange={(e) => setGalleryCount(e.target.files?.length || 0)}
                className="w-full bg-black/60 border border-white/10 rounded-none p-3 text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer transition-colors" 
              />
              {galleryCount > 29 && (
                <p className="text-xs text-rose-400 font-mono pt-1">
                  ⚠ Exceeded limit: Maximum 29 gallery photos permitted. Please adjust your selection before publishing.
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || galleryCount > 29} 
              className="w-full mt-8 bg-white hover:bg-[#D4AF37] text-black font-semibold tracking-widest text-xs uppercase py-4 rounded-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting 
                  ? "CONCURRENTLY UPLOADING & PUBLISHING..." 
                  : galleryCount > 29 
                  ? "REDUCE ASSETS (MAX 29 GALLERY)" 
                  : `PUBLISH ${1 + galleryCount} ASSETS WITH GIS COORDINATES`}
              </span>
            </button>
          </form>
        )}

        {/* ==================== TAB 2: PORTFOLIO INVENTORY & SECURE DELETION SUITE ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Control Bar: Search & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.02] border border-white/10 p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter by title, enclave, price, or ID..."
                  className="w-full bg-black/80 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={fetchInventory}
                  disabled={isLoadingInventory}
                  className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white border border-white/10 hover:border-white/30 px-3.5 py-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventory ? 'animate-spin text-[#D4AF37]' : ''}`} />
                  <span>Refresh Inventory</span>
                </button>

                <span className="text-xs font-mono text-[#D4AF37] px-3 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  {filteredInventory.length} Active Records
                </span>
              </div>
            </div>

            {/* Inventory Listing Records */}
            {isLoadingInventory && inventory.length === 0 ? (
              <div className="p-12 text-center border border-white/10 bg-black/40">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400 font-mono">Querying Supabase Portfolio Desk...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-12 text-center border border-white/10 bg-black/40 space-y-2">
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
                      className="group bg-white/[0.02] border border-white/10 hover:border-white/25 p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex-shrink-0 bg-black border border-white/15 overflow-hidden">
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

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 self-end md:self-center">
                        <Link
                          href={`/properties/${prop.slug || prop.id}`}
                          target="_blank"
                          className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white border border-white/15 hover:border-white/40 px-3.5 py-2 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Inspect</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(prop)}
                          className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider text-white bg-rose-600 hover:bg-rose-500 border border-rose-500 px-4 py-2 transition-all shadow-md shadow-rose-950/40 rounded-none hover:brightness-110"
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
