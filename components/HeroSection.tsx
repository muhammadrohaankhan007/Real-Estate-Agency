"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavBar, NavItem } from "@/components/NavBar";
import {
  Home,
  Building2,
  Compass,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const NAV_ITEMS: NavItem[] = [
  { name: "Home", url: "#home", icon: Home },
  { name: "Portfolio", url: "#portfolio", icon: Building2 },
  { name: "Off-Plan", url: "#off-plan", icon: Compass },
  { name: "Advisory", url: "#valuation", icon: Briefcase },
  { name: "About", url: "#about", icon: ShieldCheck },
];

interface HeroSectionProps {
  onPrivateAccess?: () => void;
}

export default function HeroSection({ onPrivateAccess }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-hidden flex flex-col justify-between select-none">
      
      {/* 1. Fixed Luxury Navigation Header (Includes Fixed Brand Logo, Tubelight Menu & Actions) */}
      <NavBar items={NAV_ITEMS} onPrivateAccess={onPrivateAccess} />

      {/* 2. Vibrant Cinematic Architectural Background Image with Clean Scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hero-villa.jpg"
          alt="Karachi Luxury Architectural Villa DHA Phase 8"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_35%] opacity-85 scale-100 transition-transform duration-1000 ease-out"
        />

        {/* Directional Scrim: Strong contrast for text on left, open villa view on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10 sm:from-black/85 sm:via-black/45 sm:to-transparent" />

        {/* Top Vignette: Keeps fixed navbar crystal clear */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/85 via-black/30 to-transparent" />

        {/* Bottom Vignette: Soft luxury blend into the metric ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

        {/* Subtle Ambient Gold Depth Reflection */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/[0.05] rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3. Main Editorial Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-32 sm:pt-36 lg:pt-40 pb-16 my-auto w-full flex flex-col justify-center">
        <div className="max-w-3xl space-y-7">
          
          {/* Eyebrow Category Tag */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/35 text-[#D4AF37] text-[11px] font-sans font-semibold tracking-[0.25em] uppercase backdrop-blur-md shadow-lg shadow-black/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
              <span>DHA Phase 8 & Coastline Mandates</span>
            </div>
          </div>

          {/* Main Editorial Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-serif font-light tracking-tight text-white leading-[1.04]">
            Extraordinary <br />
            <span className="block mt-1 font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] leading-[1.1] bg-gradient-to-r from-[#FFF5D4] via-[#D4AF37] to-[#B38D28] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(212,175,55,0.25)]">
              Residences & Estates
            </span>
          </h1>

          {/* Editorial Subheadline with Enhanced Contrast & Balance */}
          <p className="text-base sm:text-lg md:text-[19px] text-zinc-200/95 font-sans font-light max-w-xl leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Direct principal representation for Karachi’s premier private villas, waterfront penthouses, and off-market positions across DHA Phase 8.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Primary Action */}
            <Link
              href="#portfolio"
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#E2C056] to-[#D4AF37] hover:brightness-110 text-neutral-950 font-sans font-semibold text-xs tracking-[0.16em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.45)] group cursor-pointer"
            >
              <span>Explore Portfolio</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-neutral-950" />
            </Link>

            {/* Secondary Action */}
            <Link
              href="#valuation"
              className="px-8 py-4 bg-black/50 hover:bg-white/[0.08] text-white border border-white/20 hover:border-[#D4AF37]/60 font-sans font-medium text-xs tracking-[0.16em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
            >
              <span>Schedule Valuation</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 4. Luxury Architectural Metric Strip */}
      <div className="relative z-10 border-t border-white/[0.08] bg-black/80 backdrop-blur-xl py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-left">
          <div className="md:border-r border-white/[0.08] md:pr-4">
            <p className="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-[0.24em]">ESTABLISHED</p>
            <p className="text-sm sm:text-base font-serif font-semibold tracking-wide text-[#D4AF37] mt-1">1998 (27+ Years)</p>
          </div>
          <div className="md:border-r border-white/[0.08] md:pr-4">
            <p className="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-[0.24em]">PRIMARY CORRIDOR</p>
            <p className="text-sm sm:text-base font-serif font-semibold tracking-wide text-zinc-100 mt-1">DHA Phase 8 (Zones A–E)</p>
          </div>
          <div className="md:border-r border-white/[0.08] md:pr-4">
            <p className="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-[0.24em]">WATERFRONT DESK</p>
            <p className="text-sm sm:text-base font-serif font-semibold tracking-wide text-zinc-100 mt-1">EMAAR & HMR Coastal</p>
          </div>
          <div>
            <p className="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-[0.24em]">DISCRETION</p>
            <p className="text-sm sm:text-base font-serif font-semibold tracking-wide text-[#D4AF37] mt-1">Bilateral NDA Protection</p>
          </div>
        </div>
      </div>

    </section>
  );
}
