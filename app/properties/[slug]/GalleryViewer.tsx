"use client";

import { useState, useEffect } from "react";
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

  // Automated 4.5-second cross-fade slideshow engine
  useEffect(() => {
    if (!isMounted || !isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isMounted, isPlaying, images.length]);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Primary Showroom Stage with Layered Opacity Cross-Fade Transitions */}
      <div className="relative w-full h-[440px] sm:h-[560px] md:h-[680px] overflow-hidden bg-black border border-white/10 group shadow-2xl">
        {images.map((img, idx) => {
          // SSR & pre-mount render index 0 deterministically to prevent hydration drift
          const isActive = isMounted ? idx === activeIndex : idx === 0;

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={img}
                alt={`${title} - Showroom Asset ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            </div>
          );
        })}

        {/* Ambient Architectural Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10"></div>

        {/* HUD Controls Header */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
          {/* Asset Counter */}
          <div className="bg-black/85 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] px-3.5 py-1.5 text-[10px] tracking-[0.25em] uppercase font-semibold flex items-center gap-2 shadow-lg">
            <Camera className="w-3.5 h-3.5" />
            <span>
              ASSET {isMounted ? activeIndex + 1 : 1} / {images.length}
            </span>
          </div>

          {/* Slideshow Play / Pause Controls */}
          {images.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
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
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous Showroom Asset"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/75 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next Showroom Asset"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/75 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Interactive Thumbnail Ribbon */}
      {images.length > 1 && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-zinc-400 font-mono">
            <span>Showroom Gallery Ribbon ({images.length} Total Assets)</span>
            <span>Click to Inspect Asset</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
            {images.map((img, idx) => {
              const isThumbActive = isMounted ? activeIndex === idx : idx === 0;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative h-16 sm:h-20 w-full overflow-hidden border transition-all duration-200 focus:outline-none ${
                    isThumbActive
                      ? "border-[#D4AF37] ring-1 ring-[#D4AF37] brightness-110 shadow-lg shadow-[#D4AF37]/20"
                      : "border-white/10 opacity-55 hover:opacity-100 hover:border-white/40"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Showroom Thumbnail ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {isThumbActive && (
                    <div className="absolute inset-0 bg-[#D4AF37]/15 pointer-events-none border border-[#D4AF37]"></div>
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
