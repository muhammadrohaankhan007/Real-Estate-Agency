"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LucideIcon, Lock, Menu, X, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  onPrivateAccess?: () => void;
}

export function NavBar({ items, className, onPrivateAccess }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || "Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (name: string) => {
    setActiveTab(name);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full select-none",
        isScrolled
          ? "bg-[#0a0a0a]/92 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-[0_10px_30px_rgba(0,0,0,0.85)] py-3 sm:py-3.5"
          : "bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b border-white/[0.06] backdrop-blur-sm py-4 sm:py-5",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* ==================== 1. FIXED LUXURY BRAND LOGO ==================== */}
        <Link
          href="#home"
          onClick={() => handleNavClick("Home")}
          className="flex items-center gap-3 group focus:outline-none flex-shrink-0"
          aria-label="Prime Time Real Estate Advisory Homepage"
        >
          {/* Bespoke Geometric Gold Monogram Crest */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 64 64"
              className="w-full h-full drop-shadow-[0_2px_10px_rgba(212,175,55,0.35)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="64" height="64" rx="3" fill="#0d0d0f" stroke="#D4AF37" strokeWidth="1.5" />
              <rect x="5" y="5" width="54" height="54" rx="2" fill="none" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.5" />
              {/* Corner Notches */}
              <line x1="4" y1="12" x2="12" y2="4" stroke="#D4AF37" strokeWidth="1.2" />
              <line x1="52" y1="4" x2="60" y2="12" stroke="#D4AF37" strokeWidth="1.2" />
              <line x1="4" y1="52" x2="12" y2="60" stroke="#D4AF37" strokeWidth="1.2" />
              <line x1="52" y1="60" x2="60" y2="52" stroke="#D4AF37" strokeWidth="1.2" />
              {/* Monogram PT */}
              <text
                x="32"
                y="38.5"
                fontFamily="var(--font-cinzel), Georgia, serif"
                fontSize="22"
                fontWeight="700"
                fill="#D4AF37"
                textAnchor="middle"
                letterSpacing="1.5"
              >
                PT
              </text>
              {/* Diamond Finial */}
              <polygon points="32,45.5 34.5,48 32,50.5 29.5,48" fill="#D4AF37" />
            </svg>
          </div>

          {/* Typography */}
          <div className="flex flex-col min-w-0">
            <span className="font-cinzel text-sm xs:text-base sm:text-lg font-bold tracking-[0.16em] xs:tracking-[0.22em] text-white group-hover:text-[#D4AF37] transition-colors uppercase leading-none truncate">
              PRIME TIME
            </span>
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-sans font-semibold tracking-[0.18em] xs:tracking-[0.26em] text-[#D4AF37]/90 uppercase mt-1 leading-none">
              <span className="hidden xs:inline">REAL ESTATE </span>ADVISORY • EST. 1998
            </span>
          </div>
        </Link>

        {/* ==================== 2. CENTER TUBELIGHT NAVIGATION ==================== */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1 bg-black/60 border border-white/10 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-2xl shadow-black/80"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={() => handleNavClick(item.name)}
                className={cn(
                  "relative cursor-pointer text-xs font-sans tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 select-none",
                  isActive
                    ? "text-[#D4AF37] font-semibold"
                    : "text-neutral-300 hover:text-white hover:bg-white/5 font-normal"
                )}
              >
                <Icon size={14} className={isActive ? "text-[#D4AF37]" : "text-neutral-400"} />
                <span>{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="tubelight-lamp"
                    className="absolute inset-0 w-full bg-[#D4AF37]/10 rounded-full -z-10 border border-[#D4AF37]/35 shadow-[inset_0_0_12px_rgba(212,175,55,0.15)]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  >
                    {/* Top Tubelight Glow Lamp */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37] rounded-t-full shadow-[0_-2px_8px_#D4AF37]">
                      <div className="absolute w-10 h-3 bg-[#D4AF37]/25 rounded-full blur-md -top-1.5 -left-1" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ==================== 3. RIGHT ACTION CONTROLS ==================== */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Command Link */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-sans font-medium tracking-wider text-neutral-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 rounded-sm bg-black/40 backdrop-blur-md transition-all uppercase"
          >
            <Lock size={12} className="text-[#D4AF37]" />
            <span>Admin</span>
          </Link>

          {/* Private Access CTA */}
          {onPrivateAccess ? (
            <button
              type="button"
              onClick={onPrivateAccess}
              className="px-2.5 xs:px-4 sm:px-5 py-1.5 sm:py-2 text-[10px] xs:text-xs font-sans font-semibold tracking-wider text-neutral-950 bg-gradient-to-r from-[#D4AF37] via-[#E2C056] to-[#D4AF37] hover:brightness-110 rounded-sm shadow-[0_2px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_2px_22px_rgba(212,175,55,0.45)] transition-all cursor-pointer uppercase flex-shrink-0"
            >
              Private Access
            </button>
          ) : (
            <Link
              href="#valuation"
              className="px-2.5 xs:px-4 sm:px-5 py-1.5 sm:py-2 text-[10px] xs:text-xs font-sans font-semibold tracking-wider text-neutral-950 bg-gradient-to-r from-[#D4AF37] via-[#E2C056] to-[#D4AF37] hover:brightness-110 rounded-sm shadow-[0_2px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_2px_22px_rgba(212,175,55,0.45)] transition-all uppercase flex-shrink-0"
            >
              Private Access
            </Link>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-neutral-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 rounded-sm bg-black/40 backdrop-blur-md transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* ==================== 4. MOBILE SLIDEOUT LUXURY DRAWER ==================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden w-full bg-[#0d0d10]/98 backdrop-blur-2xl border-b border-[#D4AF37]/30 px-5 sm:px-6 py-5 sm:py-6 mt-3 shadow-2xl max-h-[calc(100vh-75px)] overflow-y-auto"
          >
            <div className="flex flex-col space-y-3">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;

                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    onClick={() => handleNavClick(item.name)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-sm text-sm uppercase tracking-wider font-sans transition-all",
                      isActive
                        ? "bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37]"
                        : "text-neutral-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-[#D4AF37]" : "text-neutral-400"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 text-neutral-300 hover:text-white text-xs font-sans uppercase tracking-wider rounded-sm bg-black/40"
                >
                  <Lock size={14} className="text-[#D4AF37]" />
                  <span>Admin Portal</span>
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:+923008286662"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 uppercase tracking-wider rounded-sm"
                  >
                    <Phone size={13} className="text-[#D4AF37]" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20interested%20in%20Karachi%20prime%20properties"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 uppercase tracking-wider rounded-sm"
                  >
                    <MessageSquare size={13} className="text-[#D4AF37]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
