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
  Lock,
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
      
      {/* 1. Floating Tubelight Navbar */}
      <NavBar items={NAV_ITEMS} />

      {/* 2. Top Header Brand Bar */}
      <header className="relative z-40 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-base sm:text-lg font-serif font-bold tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors uppercase">
            PRIME TIME
          </span>
          <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-400 uppercase">
            REAL ESTATE ADVISORY
          </span>
        </Link>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono text-neutral-400 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-400 rounded-md bg-neutral-950/60 backdrop-blur-md transition-all"
          >
            <Lock size={12} className="text-amber-500" />
            <span>ADMIN COMMAND</span>
          </Link>

          {onPrivateAccess ? (
            <button
              type="button"
              onClick={onPrivateAccess}
              className="px-4 py-2 text-xs font-mono font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-md transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              PRIVATE ACCESS
            </button>
          ) : (
            <Link
              href="#valuation"
              className="px-4 py-2 text-xs font-mono font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-md transition-all shadow-lg shadow-amber-500/10"
            >
              PRIVATE ACCESS
            </Link>
          )}
        </div>
      </header>

      {/* 3. Background Hero Image with Dark Luxury Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-villa.jpg"
          alt="Luxury Architectural Residence"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
        />
        {/* Multi-layer Dark Gradient Overlay for Maximum Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      </div>

      {/* 4. Main Editorial Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 my-auto w-full flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          
          {/* Eyebrow Category Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-amber-500/30 text-amber-400 text-[11px] font-mono tracking-widest uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DHA PHASE 8 & COASTLINE MANDATES
          </div>

          {/* Main Editorial Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-white leading-[1.08]">
            Extraordinary <br />
            <span className="italic font-normal text-amber-400 font-serif">Residences & Estates</span>
          </h1>

          {/* Clean 1-Sentence Subheadline */}
          <p className="text-base sm:text-lg text-neutral-300 font-sans font-light max-w-xl leading-relaxed">
            Direct principal representation for Karachi’s premier private villas, waterfront penthouses, and off-market positions across DHA Phase 8.
          </p>

          {/* Consolidate CTAs (Primary & Secondary) */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Primary Action */}
            <Link
              href="#portfolio"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 group"
            >
              <span>EXPLORE PORTFOLIO</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Action */}
            <Link
              href="#valuation"
              className="px-8 py-4 bg-neutral-950/80 hover:bg-neutral-900 text-white border border-neutral-800 hover:border-amber-500/40 font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span>SCHEDULE VALUATION</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 5. Minimal Footer Stat Strip */}
      <div className="relative z-10 border-t border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          <div>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">ESTABLISHED</p>
            <p className="text-sm font-serif font-bold text-amber-400">1998 (27+ Years)</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">PRIMARY CORRIDOR</p>
            <p className="text-sm font-serif font-bold text-white">DHA Phase 8 (Zones A–E)</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">WATERFRONT DESK</p>
            <p className="text-sm font-serif font-bold text-white">EMAAR & HMR Coastal</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">DISCRETION</p>
            <p className="text-sm font-serif font-bold text-amber-400">Bilateral NDA Protection</p>
          </div>
        </div>
      </div>

    </section>
  );
}
