"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface GalleryViewerProps {
  images: string[];
  title: string;
}

export default function GalleryViewer({ images, title }: GalleryViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Strict hydration guard: ensure SSR markup matches initial client mount exactly
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalImages = images?.length || 0;

  // Memoized navigation handlers to prevent unnecessary re-render propagation
  const nextImage = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevImage = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const selectImage = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  const toggleSlideshow = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Automated 4.5-second cross-fade slideshow engine with RAF-friendly interval
  useEffect(() => {
    if (!isMounted || !isPlaying || totalImages <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalImages);
    }, 4500);

    return () => clearInterval(interval);
  }, [isMounted, isPlaying, totalImages]);

  // Keyboard navigation for power users (Left / Right arrow keys)
  useEffect(() => {
    if (!isMounted || totalImages <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, totalImages, nextImage, prevImage]);

  if (!images || totalImages === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Primary Showroom Stage with Fixed Aspect Ratio & GPU Acceleration */}
      <div 
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:h-[680px] overflow-hidden bg-black border border-white/10 group shadow-2xl"
        style={{ contain: 'layout paint' }}
      >
        {images.map((img, idx) => {
          // SSR & pre-mount render index 0 deterministically to prevent hydration drift
          const isActive = isMounted ? idx === activeIndex : idx === 0;

          return (
            <div
              key={`gallery-main-${idx}-${img}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{
                transform: "translateZ(0)",
                willChange: "opacity, transform",
                backfaceVisibility: "hidden",
              }}
            >
              <Image
                src={img}
                alt={`${title} - Showroom Asset ${idx + 1}`}
                fill
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1200px"
                className="object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{
                  transform: "translateZ(0)",
                  willChange: "transform",
                }}
              />
            </div>
          );
        })}

        {/* Ambient Architectural Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

        {/* HUD Controls Header */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
          {/* Asset Counter */}
          <div className="bg-black/85 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] px-3.5 py-1.5 text-[10px] tracking-[0.25em] uppercase font-semibold flex items-center gap-2 shadow-lg">
            <Camera className="w-3.5 h-3.5" />
            <span>
              ASSET {isMounted ? activeIndex + 1 : 1} / {totalImages}
            </span>
          </div>

          {/* Slideshow Play / Pause Controls */}
          {totalImages > 1 && (
            <button
              onClick={toggleSlideshow}
              type="button"
              aria-label={isPlaying ? "Pause Showroom Slideshow" : "Play Showroom Slideshow"}
              className={`backdrop-blur-md border px-3 py-1.5 text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-all duration-200 ${
                isPlaying
                  ? "bg-black/80 border-amber-500/40 text-amber-300 hover:border-amber-400"
                  : "bg-black/80 border-white/20 text-zinc-300 hover:text-white hover:border-white/40"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#D4AF37]" />
                  <span>Auto-Fade 4.5s Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#D4AF37]" />
                  <span>Slideshow Paused</span>
                </>
              )}
            </button>
          )}

          {(isMounted ? activeIndex === 0 : true) && (
            <span className="hidden sm:inline-block bg-white/10 backdrop-blur-md border border-white/20 text-zinc-200 px-3 py-1.5 text-[10px] tracking-wider uppercase">
              Master 1920x1080 Flagship View
            </span>
          )}
        </div>

        {/* Next & Previous Navigation Buttons */}
        {totalImages > 1 && (
          <>
            <button
              onClick={prevImage}
              type="button"
              aria-label="Previous Showroom Asset"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/75 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              style={{ transform: "translateY(-50%) translateZ(0)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              type="button"
              aria-label="Next Showroom Asset"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/75 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
              style={{ transform: "translateY(-50%) translateZ(0)" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Interactive Thumbnail Ribbon */}
      {totalImages > 1 && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-zinc-400 font-mono">
            <span>Showroom Gallery Ribbon ({totalImages} Total Assets)</span>
            <span>Click to Inspect Asset</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
            {images.map((img, idx) => {
              const isThumbActive = isMounted ? activeIndex === idx : idx === 0;

              return (
                <button
                  key={`gallery-thumb-${idx}-${img}`}
                  onClick={() => selectImage(idx)}
                  type="button"
                  aria-label={`View Asset ${idx + 1}`}
                  className={`group relative h-16 sm:h-20 w-full overflow-hidden border transition-all duration-200 focus:outline-none ${
                    isThumbActive
                      ? "border-[#D4AF37] ring-1 ring-[#D4AF37] brightness-110 shadow-lg shadow-[#D4AF37]/20"
                      : "border-white/10 opacity-55 hover:opacity-100 hover:border-white/40"
                  }`}
                  style={{ transform: "translateZ(0)" }}
                >
                  <Image
                    src={img}
                    alt={`Showroom Thumbnail ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 120px"
                    loading="lazy"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                    style={{ transform: "translateZ(0)" }}
                  />
                  {isThumbActive && (
                    <div className="absolute inset-0 bg-[#D4AF37]/15 pointer-events-none border border-[#D4AF37]" />
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-mono px-1 py-0.5 text-zinc-300 border border-white/10">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
