"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";

interface ToastNotification {
  show: boolean;
  type: 'loading' | 'success' | 'error';
  title: string;
  message: string;
  assetCount?: number;
}

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [heroFileName, setHeroFileName] = useState<string>("");

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

  const dismissToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

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

    const totalAssets = 1 + validGalleryFiles.length;

    setIsSubmitting(true);
    setToast({
      show: true,
      type: 'loading',
      title: 'Encrypting & Concurrently Uploading',
      message: `Processing ${totalAssets} HD visual ${totalAssets === 1 ? 'asset' : 'assets'} with 1920x1080 master hero scaling...`,
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
          message: data.message || `Property securely published with ${totalAssets} visual assets to Supabase portfolio.`,
          assetCount: totalAssets,
        });
        form.reset();
        setGalleryCount(0);
        setHeroFileName("");
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 sm:p-10 font-sans selection:bg-[#D4AF37] selection:text-black">
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

      {/* ==================== ADMIN PORTAL INTERFACE ==================== */}
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-light tracking-wide text-white">
              Prime Time <span className="text-[#D4AF37]">Command</span>
            </h1>
            <p className="text-white/50 mt-1.5 text-sm">
              30 HD Multi-Asset Enterprise Property Management Portal
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 px-4 py-2.5 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portfolio</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] border border-white/10 p-6 sm:p-10 rounded-none backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Property Title</label>
              <input 
                name="title" 
                required 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. 500 Yards Ultra-Luxury Bungalow" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Demand (PKR)</label>
              <input 
                name="demand" 
                required 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. 485,000,000" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Location</label>
              <input 
                name="location" 
                required 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. DHA Phase 8 (Khayaban-e-Ghalib), Karachi" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Size / Area</label>
              <input 
                name="size" 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. 500 Sq. Yds / 1000 Sq. Yds" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bedrooms</label>
              <input 
                type="number" 
                name="bedrooms" 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. 6" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Bathrooms</label>
              <input 
                type="number" 
                name="bathrooms" 
                className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
                placeholder="e.g. 7" 
              />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <label className="text-xs uppercase tracking-widest text-white/70 font-medium">Architectural Description & Specs</label>
            <textarea 
              name="description" 
              rows={4} 
              className="w-full bg-black/60 border border-white/10 rounded-none p-3.5 text-white focus:border-[#D4AF37] outline-none transition-colors" 
              placeholder="Italian travertine stone facade, double-height glass atrium, private temperature-controlled pool, basement cinema lounge..." 
            />
          </div>

          {/* 1. Main Hero Cover Image (Required) */}
          <div className="space-y-2 pt-4 border-t border-white/10">
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

          {/* 2. Interior & Gallery Photos (Multi-Asset - Up to 29 photos) */}
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
            className="w-full mt-8 bg-white hover:bg-[#D4AF37] text-black font-semibold tracking-widest text-xs uppercase py-4 rounded-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {isSubmitting 
                ? "CONCURRENTLY UPLOADING & PUBLISHING..." 
                : galleryCount > 29 
                ? "REDUCE ASSETS (MAX 29 GALLERY)" 
                : `PUBLISH ${1 + galleryCount} ASSETS TO PORTFOLIO`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
