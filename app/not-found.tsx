import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      {/* Editorial Navigation Masthead */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-md px-6 sm:px-12 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex flex-col text-left">
            <span className="font-cinzel text-lg sm:text-xl font-semibold tracking-[0.24em] text-[#D4AF37] group-hover:brightness-125 transition-all">
              REAL PROPERTY PRIME TIME
            </span>
            <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-400 font-sans mt-0.5">
              Est. 1998 • Karachi Luxury Advisory
            </span>
          </Link>

          <Link
            href="/"
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </header>

      {/* 404 Centerpiece */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          
          {/* Status Coordinate Tag */}
          <div className="inline-flex items-center space-x-2.5 border border-[#D4AF37]/30 bg-black/80 px-4 py-1.5 text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">
            <span className="w-1.5 h-1.5 bg-[#D4AF37]"></span>
            <span>Error 404 • Status: Portfolio Unlisted</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-tight">
              Residence Unlisted or <br />
              <span className="italic gold-gradient-text">Privately Concluded</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
              The requested property dossier, off-market concept, or briefing URL is no longer available on our public registry. Prime listings are frequently acquired through confidential private mandates.
            </p>
          </div>

          {/* Action CTAs (Sharp architectural buttons, no soft bubbly corners) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#e0be49] transition-all"
            >
              Explore Active Portfolio
            </Link>

            <Link
              href="/#valuation"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/20 text-white font-medium text-xs tracking-[0.2em] uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all bg-black/40"
            >
              Schedule Valuation
            </Link>

            <a
              href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20inquiring%20about%20a%20specific%20unlisted%20property"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 border border-emerald-500/40 text-emerald-400 font-medium text-xs tracking-[0.18em] uppercase hover:bg-emerald-950/30 transition-all flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>

          {/* Discreet Direct Assistance */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Strict Client Discretion</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span>Direct Line:</span>
            <a href="tel:+923008286662" className="text-[#D4AF37] hover:underline font-mono">
              +92 300 8286662
            </a>
            <span className="text-zinc-600">•</span>
            <a href="mailto:realpropertyprimetime@gmail.com" className="text-zinc-300 hover:text-[#D4AF37] hover:underline">
              realpropertyprimetime@gmail.com
            </a>
          </div>

        </div>
      </section>

      {/* Architectural Footer */}
      <footer className="border-t border-white/[0.08] bg-black py-8 px-6 text-center text-[11px] text-zinc-600">
        <p>© {new Date().getFullYear()} Real Property Prime Time. Karachi Luxury Real Estate Advisory Est. 1998.</p>
      </footer>
    </main>
  );
}
