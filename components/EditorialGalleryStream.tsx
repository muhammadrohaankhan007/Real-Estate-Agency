"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Sparkles,
  ZoomIn
} from "lucide-react";

interface EditorialGalleryStreamProps {
  images: string[];
  title: string;
}

export default function EditorialGalleryStream({
  images,
  title,
}: EditorialGalleryStreamProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalAssets = images && images.length > 0 ? images.length : 1;
  const assetList = images && images.length > 0 ? images : ["/images/hero-mansion.jpg"];

  // Open lightbox at specific index
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % totalAssets);
  }, [totalAssets]);

  const prevLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + totalAssets) % totalAssets);
  }, [totalAssets]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightboxImage();
      if (e.key === "ArrowLeft") prevLightboxImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextLightboxImage, prevLightboxImage]);

  // Track mobile snap carousel active slide
  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      setMobileActiveIndex(idx);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. MOBILE-ONLY HORIZONTAL SNAP CAROUSEL (< 768px Viewports)   */}
      {/* ============================================================== */}
      <div className="block md:hidden space-y-3">
        <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
          <div
            ref={mobileCarouselRef}
            onScroll={handleMobileScroll}
            className="flex snap-x snap-mandatory overflow-x-auto touch-pan-x no-scrollbar w-full"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {assetList.map((img, idx) => (
              <div
                key={`mobile-slide-${idx}-${img}`}
                onClick={() => openLightbox(idx)}
                className="w-full flex-shrink-0 snap-start relative aspect-[16/10] bg-neutral-950 cursor-pointer"
                style={{
                  contain: "layout paint",
                  transform: "translateZ(0)",
                }}
              >
                <Image
                  src={img}
                  alt={`${title} - Asset ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover object-center select-none"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Tap to expand prompt */}
                <div className="absolute bottom-3 right-3 z-10 bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-mono tracking-wider px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>TAP TO ENLARGE</span>
                </div>
              </div>
            ))}
          </div>

          {/* Asset Counter Overlay */}
          <div className="absolute top-3 left-3 z-10 bg-black/85 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider px-3 py-1 flex items-center gap-1.5 shadow-md">
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              ASSET {mobileActiveIndex + 1} / {totalAssets}
            </span>
          </div>
        </div>

        {/* Mobile Swipe Indicators & Thumbnail Strip */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
          <div className="flex items-center space-x-1.5 max-w-[220px] overflow-x-auto no-scrollbar py-1">
            {assetList.map((_, dotIdx) => (
              <span
                key={`mobile-dot-${dotIdx}`}
                className={`inline-block h-1.5 transition-all duration-200 rounded-full ${
                  dotIdx === mobileActiveIndex
                    ? "w-6 bg-[#D4AF37]"
                    : "w-1.5 bg-neutral-700"
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Swipe Horizontal • {totalAssets} Photos
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP CONTINUOUS VERTICAL VISUAL STREAM (>= 768px)         */}
      {/* ============================================================== */}
      <div className="hidden md:flex flex-col space-y-6">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-zinc-300 font-semibold">
              Curated Architectural Stream ({totalAssets} Total Assets)
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Click any photography frame to inspect full resolution
          </span>
        </div>

        <div className="flex flex-col space-y-6">
          {assetList.map((img, idx) => (
            <div
              key={`desktop-stream-${idx}-${img}`}
              onClick={() => openLightbox(idx)}
              className="group relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 transition-colors duration-200 shadow-2xl cursor-pointer"
              style={{
                contain: "layout paint",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src={img}
                alt={`${title} - Curated Asset ${idx + 1}`}
                fill
                priority={idx < 2}
                loading={idx < 2 ? "eager" : "lazy"}
                sizes="(max-width: 1024px) 95vw, 60vw"
                className="object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                style={{
                  transform: "translateZ(0)",
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              />

              {/* Architectural Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Asset Badge Header */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <div className="bg-black/90 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-white flex items-center space-x-2 shadow-lg">
                  <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    ASSET {String(idx + 1).padStart(2, "0")} / {String(totalAssets).padStart(2, "0")}
                  </span>
                </div>

                {idx === 0 && (
                  <div className="bg-[#D4AF37] text-neutral-950 px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    <span>FLAGSHIP HERO VIEW</span>
                  </div>
                )}
              </div>

              {/* Bottom Hover Action Prompt */}
              <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-black/90 backdrop-blur-md border border-amber-500/60 text-amber-300 px-4 py-2 text-xs font-mono tracking-wider uppercase flex items-center space-x-2 shadow-2xl">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>INSPECT FULL RESOLUTION</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ULTRA-LUXURY FULLSCREEN LIGHTBOX MODAL                      */}
      {/* ============================================================== */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between px-3.5 xs:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-30 gap-2 xs:gap-3">
            <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] xs:text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#D4AF37] block truncate">
                  High-Resolution Lightbox Examination
                </span>
                <h4 className="font-serif text-xs xs:text-sm sm:text-base text-white truncate max-w-md sm:max-w-xl">
                  {title}
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              <span className="text-xs font-mono text-zinc-400 tracking-widest hidden sm:inline-block">
                ASSET {lightboxIndex + 1} OF {totalAssets}
              </span>

              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close Lightbox"
                className="touch-target-48 p-2 xs:p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-zinc-300 hover:text-white border border-neutral-700 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Lightbox Stage */}
          <div className="relative flex-1 flex items-center justify-center p-2 xs:p-4 sm:p-8 overflow-hidden">
            <div
              className="relative w-full h-full max-w-6xl max-h-[82vh]"
              style={{ contain: "layout paint" }}
            >
              <Image
                src={assetList[lightboxIndex]}
                alt={`${title} - Lightbox View ${lightboxIndex + 1}`}
                fill
                priority
                sizes="100vw"
                className="object-contain object-center"
                style={{
                  transform: "translateZ(0)",
                  willChange: "transform, opacity",
                }}
              />
            </div>

            {/* Left Chevron */}
            {totalAssets > 1 && (
              <button
                type="button"
                onClick={prevLightboxImage}
                aria-label="Previous Image"
                className="touch-target-48 absolute left-2 xs:left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-[#D4AF37] text-white hover:text-black border border-neutral-700 hover:border-[#D4AF37] flex items-center justify-center transition-all backdrop-blur-md shadow-2xl"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Right Chevron */}
            {totalAssets > 1 && (
              <button
                type="button"
                onClick={nextLightboxImage}
                aria-label="Next Image"
                className="touch-target-48 absolute right-2 xs:right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-[#D4AF37] text-white hover:text-black border border-neutral-700 hover:border-[#D4AF37] flex items-center justify-center transition-all backdrop-blur-md shadow-2xl"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Filmstrip Ribbon in Lightbox */}
          {totalAssets > 1 && (
            <div className="border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-md p-2 xs:p-3 px-3 sm:px-6 z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar max-w-4xl mx-auto py-1">
                {assetList.map((thumb, tIdx) => (
                  <button
                    key={`lightbox-thumb-${tIdx}`}
                    type="button"
                    onClick={() => setLightboxIndex(tIdx)}
                    aria-label={`Jump to asset ${tIdx + 1}`}
                    className={`relative w-12 h-9 xs:w-14 xs:h-10 sm:w-16 sm:h-12 flex-shrink-0 rounded overflow-hidden border transition-all ${
                      tIdx === lightboxIndex
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105"
                        : "border-neutral-800 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={thumb}
                      alt={`Thumbnail ${tIdx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
