'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Building2, 
  Compass, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  X, 
  ArrowUpRight, 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ChevronRight,
  Menu,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  specs: {
    area: string;
    beds: number;
    baths: number;
    views: string;
    parking: string;
  };
  features: string[];
  imageUrl: string;
  isFeature: boolean;
  tag: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('The DHA Phase 8 Collection');
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', interest: '' });
  const [accessForm, setAccessForm] = useState({ principalName: '', entity: '', phone: '', email: '' });
  const [briefingEmail, setBriefingEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBriefingSubmitting, setIsBriefingSubmitting] = useState(false);

  // Fetch properties from Node.js backend
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties');
        const json = await res.json();
        if (json.success && json.data) {
          setProperties(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch from properties API:', err);
      }
    }
    loadProperties();
  }, []);

  // Header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleEnquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enquiryForm,
          propertyId: selectedProperty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquireModalOpen(false);
        triggerToast(`Enquiry registered (${data.referenceId}). Dossier dispatched.`);
        setEnquiryForm({ name: '', email: '', phone: '', interest: '' });
      }
    } catch {
      triggerToast('Unable to transmit request. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      });
      const data = await res.json();
      if (data.success) {
        setAccessModalOpen(false);
        triggerToast(`Access Code: ${data.keycode}. Welcome to Privé Registry.`);
        setAccessForm({ principalName: '', entity: '', phone: '', email: '' });
      }
    } catch {
      triggerToast('Verification error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefingEmail) return;
    setIsBriefingSubmitting(true);
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: briefingEmail }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Subscribed to Private Briefings. Karachi off-market alerts active.');
        setBriefingEmail('');
      } else {
        triggerToast(data.message || 'Subscription failed.');
      }
    } catch {
      triggerToast('Unable to connect. Please try again.');
    } finally {
      setIsBriefingSubmitting(false);
    }
  };

  const openEnquiryFor = (title: string) => {
    setSelectedProperty(title);
    setEnquireModalOpen(true);
  };

  // Fallback properties for instant rendering while API resolves
  const featureProperty = properties[0] || {
    id: 'ghalib-villa',
    title: '500 Yards Ultra-Luxury — Khayaban-e-Ghalib',
    location: 'Zone A, DHA Phase 8, Karachi',
    price: 'PKR 485 Million',
    specs: { area: '500 Sq. Yds', beds: 6, baths: 7, views: 'Zen Tropical Courtyard', parking: '4 Covered Bays' },
    imageUrl: '/images/bungalow-ghalib.jpg',
    tag: 'Flagship Residence',
  };

  const horizontalProperty1 = properties[1] || {
    id: 'faisal-waterfront',
    title: '800 Yards Coastal Villa — Khayaban-e-Faisal',
    location: 'Zone B Waterfront, DHA Phase 8, Karachi',
    price: 'PKR 650 Million',
    specs: { area: '800 Sq. Yds', beds: 5, baths: 6, views: 'Panoramic Arabian Sea Horizon', parking: '6 Supercars' },
    imageUrl: '/images/faisal-waterfront.jpg',
    tag: 'Waterfront Estate',
  };

  const horizontalProperty2 = properties[2] || {
    id: 'ittehad-estate',
    title: '1,000 Yards Architectural Masterpiece — Khayaban-e-Ittehad',
    location: 'Marina Corridor, DHA Phase 8, Karachi',
    price: 'PKR 820 Million',
    specs: { area: '1,000 Sq. Yds', beds: 7, baths: 9, views: 'Reflecting Water Courtyard', parking: '8 Vehicles' },
    imageUrl: '/images/ittehad-estate.jpg',
    tag: 'Private Compound',
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black">
      
      {/* ==================== THE NAVBAR ==================== */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled ? 'bg-black/85 border-b border-white/10 shadow-2xl py-4' : 'bg-black/50 border-b border-white/[0.08] py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between relative">
          
          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-9 flex-1">
            <a href="#home" className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#showcase" className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Off-Plan Projects
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#navigation" className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Navigation
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Center Wordmark: Sleek serif wordmark "PRIME TIME" in warm metallic gold #D4AF37 */}
          <div className="flex-shrink-0 flex items-center justify-center lg:px-6">
            <a href="#home" className="group flex flex-col items-center text-center">
              <span className="font-cinzel text-xl sm:text-2xl md:text-[26px] font-semibold tracking-[0.32em] text-[#D4AF37] transition-all duration-300 group-hover:brightness-125">
                PRIME TIME
              </span>
              <span className="text-[9px] uppercase tracking-[0.45em] text-zinc-400 font-sans mt-0.5 opacity-80 group-hover:text-amber-200 transition-colors">
                Privé Brokerage
              </span>
            </a>
          </div>

          {/* Right Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center justify-end space-x-9 flex-1">
            <a href="#about" className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            
            {/* VIP Access Badge */}
            <button 
              onClick={() => setAccessModalOpen(true)}
              className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/35 hover:border-[#D4AF37] px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#D4AF37]/10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span>Access VIP</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-[#D4AF37] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl px-6 py-6 transition-all animate-in fade-in duration-300">
            <div className="flex flex-col space-y-4 text-center">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Home</a>
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Off-Plan Projects</a>
              <a href="#navigation" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Navigation</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">About Us</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Contact</a>
              
              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); openEnquiryFor('General Collection'); }}
                  className="w-full py-3 rounded-full bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase"
                >
                  Enquire Now
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setAccessModalOpen(true); }}
                  className="w-full py-3 rounded-full border border-white/30 text-white font-medium text-xs tracking-wider uppercase"
                >
                  Request Private Access
                </button>
              </div>
            </div>
          </div>
        )}
      </header>


      {/* ==================== THE HERO SECTION ==================== */}
      <section id="home" className="relative min-h-screen w-full flex items-end justify-start overflow-hidden bg-black">
        
        {/* Hero Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-mansion.jpg"
            alt="Modern luxury mansion at dusk in DHA Phase 8 Karachi"
            fill
            priority
            className="object-cover object-center animate-subtle-zoom will-change-transform filter brightness-95"
          />

          {/* Dark Gradient Overlay: Black at the bottom fading up so text is completely readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
          
          {/* Top Vignette for Navbar Contrast */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 via-black/30 to-transparent"></div>
          
          {/* Subtle Left Shadow */}
          <div className="absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-black/75 via-black/40 to-transparent"></div>
        </div>

        {/* The Hero Copy (Bottom-Left Aligned) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24 pt-36 flex flex-col justify-end">
          
          <div className="max-w-4xl space-y-6 sm:space-y-8">
            
            {/* Prestige Coordinates Pill */}
            <div className="inline-flex items-center space-x-3 bg-black/40 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-zinc-300">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"></span>
              <span className="font-medium tracking-[0.2em] uppercase text-[11px] text-zinc-300">Exclusive Waterfront Portfolio</span>
              <span className="text-zinc-600">|</span>
              <span className="font-mono text-[10px] text-zinc-400">Karachi Coastline • 24°46'N</span>
            </div>

            {/* Headline & Subheadline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-light leading-[1.05] tracking-tight text-white drop-shadow-2xl">
                The DHA Phase 8 <br className="hidden sm:inline" />
                <span className="italic font-normal gold-gradient-text">Collection.</span>
              </h1>
              
              <p className="font-sans text-base sm:text-lg md:text-xl text-zinc-300 font-light tracking-wide max-w-2xl leading-relaxed">
                A Curated Portfolio of Karachi's Finest Estates.
              </p>
            </div>

            {/* The CTA: Two buttons next to each other */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
              
              {/* Solid Gold/Sand Pill Button: "Enquire" */}
              <button
                onClick={() => openEnquiryFor('The DHA Phase 8 Collection')}
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#e0be49] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-black"
              >
                <span>Enquire</span>
                <ChevronRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* Transparent Outline Button: "Request Private Access" */}
              <button
                onClick={() => setAccessModalOpen(true)}
                className="group inline-flex items-center justify-center px-8 sm:px-10 py-4 rounded-full border border-white/30 text-white font-medium text-xs sm:text-sm tracking-[0.18em] uppercase backdrop-blur-sm bg-black/20 transition-all duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-black/50 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <KeyRound className="mr-2.5 w-4 h-4 text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                <span>Request Private Access</span>
              </button>

            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-white/[0.12] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Acres of Coastline</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">42+ Premier Plots</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Starting Valuation</span>
              <span className="font-serif text-xl sm:text-2xl text-[#D4AF37] font-normal mt-1 block">PKR 450 Million</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Architecture</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">Custom Contemporary</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Discretion</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">100% Confidential</span>
            </div>
          </div>

        </div>

      </section>


      {/* ==================== DARK-MODE ASYMMETRICAL PROPERTY SHOWCASE ==================== */}
      <section id="showcase" className="relative bg-[#0a0a0a] py-28 px-6 sm:px-8 lg:px-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Private Catalog • Off-Market</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-tight">
                Curated Residences <br />
                <span className="italic text-zinc-400">DHA Phase 8</span>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-zinc-400 text-sm font-light leading-relaxed mb-4">
                Strictly unlisted estates featuring custom cantilevered architecture, double-height glass atriums, and immediate waterfront orientation.
              </p>
              <div className="flex items-center space-x-4 text-[11px] uppercase tracking-widest text-[#D4AF37]">
                <span>Node.js Backend Synchronized</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
              </div>
            </div>
          </div>

          {/* ==================== ASYMMETRICAL LAYOUT ==================== */}
          {/* Left Side: Massive Vertical Feature Card | Right Side: Two Stacked Horizontal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* ----------------- LEFT SIDE (COL-SPAN-7 / MASSIVE VERTICAL FEATURE CARD) ----------------- */}
            <div className="lg:col-span-7 flex flex-col">
              <div 
                onClick={() => openEnquiryFor(featureProperty.title)}
                className="group relative w-full h-[640px] sm:h-[720px] lg:h-[820px] rounded-3xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl"
              >
                {/* High-Res Image with subtle hover scale effect */}
                <Image
                  src={featureProperty.imageUrl}
                  alt={featureProperty.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Dark Gradient Fade Over Image for Supreme Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 opacity-90"></div>

                {/* Top Corner Prestige Badge */}
                <div className="absolute top-6 left-6 z-10 flex items-center space-x-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                    {featureProperty.tag}
                  </span>
                  <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] tracking-widest uppercase text-zinc-300">
                    Zone A Waterfront
                  </span>
                </div>

                {/* Top Right Quick Action Icon */}
                <div className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>

                {/* Bottom Overlay: Title & Specs Directly Over The Image */}
                <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10 z-10 space-y-4">
                  
                  {/* Location & Price */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs tracking-wider">
                    <span className="flex items-center text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#D4AF37]" />
                      {featureProperty.location}
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl font-medium text-[#D4AF37] tracking-normal">
                      {featureProperty.price}
                    </span>
                  </div>

                  {/* Title (Prominent Serif / Editorial) */}
                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
                    {featureProperty.title}
                  </h3>

                  {/* Specs Direct Bar */}
                  <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-300 border-t border-white/15">
                    <div className="flex items-center space-x-1.5">
                      <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.area}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Bed className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.beds} Suites</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Bath className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.baths} Baths</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-zinc-400">
                      <span>• {featureProperty.specs.views}</span>
                    </div>
                  </div>

                  {/* Hover Callout Button */}
                  <div className="pt-2 flex items-center justify-between text-xs tracking-[0.2em] uppercase text-[#D4AF37]">
                    <span className="group-hover:translate-x-1 transition-transform inline-flex items-center font-medium">
                      Request Private Viewing & Dossier <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">DHA-8-V18B</span>
                  </div>

                </div>
              </div>
            </div>


            {/* ----------------- RIGHT SIDE (COL-SPAN-5 / TWO HORIZONTAL CARDS STACKED) ----------------- */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              
              {/* Stacked Horizontal Card 1: Khayaban-e-Faisal */}
              <div 
                onClick={() => openEnquiryFor(horizontalProperty1.title)}
                className="group relative w-full h-[380px] sm:h-[395px] rounded-3xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all duration-500 shadow-xl"
              >
                {/* High-Res Image with subtle scale */}
                <Image
                  src={horizontalProperty1.imageUrl}
                  alt={horizontalProperty1.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"></div>

                {/* Top Corner Badge */}
                <div className="absolute top-5 left-5 z-10 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">
                    {horizontalProperty1.tag}
                  </span>
                </div>

                {/* Top Right Arrow */}
                <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                {/* Bottom Overlay: Title & Specs Directly Over The Image */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 z-10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center text-[11px]">
                      <MapPin className="w-3 h-3 mr-1 text-[#D4AF37]" />
                      {horizontalProperty1.location}
                    </span>
                    <span className="font-serif text-xl sm:text-2xl text-[#D4AF37]">
                      {horizontalProperty1.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-2xl font-light text-white leading-snug">
                    {horizontalProperty1.title}
                  </h3>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-300 border-t border-white/10">
                    <span className="flex items-center space-x-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{horizontalProperty1.specs.area}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{horizontalProperty1.specs.beds} Beds</span>
                    </span>
                    <span className="text-zinc-400">• {horizontalProperty1.specs.views}</span>
                  </div>
                </div>
              </div>


              {/* Stacked Horizontal Card 2: Khayaban-e-Ittehad */}
              <div 
                onClick={() => openEnquiryFor(horizontalProperty2.title)}
                className="group relative w-full h-[380px] sm:h-[395px] rounded-3xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all duration-500 shadow-xl"
              >
                {/* High-Res Image with subtle scale */}
                <Image
                  src={horizontalProperty2.imageUrl}
                  alt={horizontalProperty2.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75"></div>

                {/* Top Corner Badge */}
                <div className="absolute top-5 left-5 z-10 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">
                    {horizontalProperty2.tag}
                  </span>
                </div>

                {/* Top Right Arrow */}
                <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                {/* Bottom Overlay: Title & Specs Directly Over The Image */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 z-10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center text-[11px]">
                      <MapPin className="w-3 h-3 mr-1 text-[#D4AF37]" />
                      {horizontalProperty2.location}
                    </span>
                    <span className="font-serif text-xl sm:text-2xl text-[#D4AF37]">
                      {horizontalProperty2.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-2xl font-light text-white leading-snug">
                    {horizontalProperty2.title}
                  </h3>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-300 border-t border-white/10">
                    <span className="flex items-center space-x-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{horizontalProperty2.specs.area}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{horizontalProperty2.specs.beds} Beds</span>
                    </span>
                    <span className="text-zinc-400">• {horizontalProperty2.specs.views}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Discreet Footer Note */}
          <div className="mt-16 p-8 rounded-2xl bg-black/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-white">Private Off-Market Verification</h4>
                <p className="text-zinc-400 text-xs">Only 24 verified principals admitted per quarter to safeguard listing confidentiality.</p>
              </div>
            </div>
            <button
              onClick={() => setAccessModalOpen(true)}
              className="px-6 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-xs uppercase tracking-widest font-semibold"
            >
              Verify Credentials
            </button>
          </div>

        </div>
      </section>


      {/* ==================== PRIVATE BRIEFINGS (LEAD CAPTURE) ==================== */}
      <section id="contact" className="relative py-24 sm:py-32 px-6 sm:px-8 border-t border-white/[0.08] bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#111] rounded-3xl p-10 sm:p-14 border border-white/[0.08] shadow-2xl text-center relative overflow-hidden">
            
            {/* Subtle Ambient Gold Aura in Background */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center space-x-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discreet Intelligence</span>
              </div>

              {/* Serif Heading */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
                Receive Private Briefings
              </h2>

              {/* Small Description */}
              <p className="text-zinc-400 text-sm sm:text-base font-light tracking-wide max-w-md mx-auto">
                Smooth, modern access to Karachi's off-market listings.
              </p>

              {/* Single Elegant Input Field with Minimalist Arrow Button Inside */}
              <form onSubmit={handleBriefingSubmit} className="pt-6">
                <div className="relative flex items-center max-w-lg mx-auto">
                  <input
                    type="email"
                    required
                    value={briefingEmail}
                    onChange={(e) => setBriefingEmail(e.target.value)}
                    placeholder="Enter your private email address"
                    className="w-full bg-black/60 text-white placeholder-zinc-500 text-sm sm:text-base rounded-full pl-6 pr-36 py-4 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={isBriefingSubmitting}
                    className="absolute right-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-neutral-950 hover:bg-[#e0be49] transition-all duration-300 flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase group disabled:opacity-50"
                  >
                    <span>{isBriefingSubmitting ? 'Sending...' : 'Subscribe'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 font-light">
                  Strict confidentiality guaranteed • Zero spam • Unsubscribe at any time
                </p>
              </form>

            </div>
          </div>
        </div>
      </section>


      {/* ==================== FOOTER ==================== */}
      <footer className="bg-black py-14 px-6 sm:px-8 border-t border-white/10 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="font-cinzel text-lg tracking-[0.25em] text-[#D4AF37]">PRIME TIME</span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="text-zinc-400 text-xs tracking-wider">The DHA Phase 8 Collection • Karachi</span>
          </div>

          <div className="flex items-center space-x-8 text-[11px] tracking-widest uppercase">
            <a href="#home" className="hover:text-[#D4AF37] transition-colors">Home</a>
            <a href="#showcase" className="hover:text-[#D4AF37] transition-colors">Portfolio</a>
            <button onClick={() => setAccessModalOpen(true)} className="hover:text-[#D4AF37] transition-colors">Private Access</button>
          </div>

          <p className="text-[11px] tracking-widest text-zinc-600">
            © 2026 PRIME TIME REAL ESTATE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>


      {/* ==================== MODAL: ENQUIRE ==================== */}
      {enquireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#141417] rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setEnquireModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">PRIME TIME Privé Brokerage</span>
              <h3 className="font-serif text-3xl text-white font-light mt-1">Acquisition Enquiry</h3>
              <p className="text-zinc-400 text-xs mt-1">Interest: <span className="text-[#D4AF37] font-medium">{selectedProperty}</span></p>
            </div>

            <form onSubmit={handleEnquireSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  required 
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  placeholder="e.g. Tariq Mansoor" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Confidential Email</label>
                <input 
                  type="email" 
                  required 
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  placeholder="name@domain.com" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Direct Phone / WhatsApp</label>
                <input 
                  type="tel" 
                  required 
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  placeholder="+92 300 1234567" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-4 py-4 rounded-full bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-[#e0be49] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting...' : 'Submit Confidential Enquiry'}
              </button>
            </form>

          </div>
        </div>
      )}


      {/* ==================== MODAL: REQUEST PRIVATE ACCESS ==================== */}
      {accessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#141417] rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setAccessModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">Vetted Client Portal</span>
              <h3 className="font-serif text-3xl text-white font-light mt-1">Request Private Access</h3>
              <p className="text-zinc-400 text-xs mt-1">Generate your discrete keycode for unlisted Phase 8 beachfront compounds.</p>
            </div>

            <form onSubmit={handleAccessSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Principal / Representative Name</label>
                <input 
                  type="text" 
                  required 
                  value={accessForm.principalName}
                  onChange={(e) => setAccessForm({ ...accessForm, principalName: e.target.value })}
                  placeholder="Principal Legal Name" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Family Office / Enterprise (Optional)</label>
                <input 
                  type="text" 
                  value={accessForm.entity}
                  onChange={(e) => setAccessForm({ ...accessForm, entity: e.target.value })}
                  placeholder="Family Office Name" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    required 
                    value={accessForm.phone}
                    onChange={(e) => setAccessForm({ ...accessForm, phone: e.target.value })}
                    placeholder="+92 ..." 
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={accessForm.email}
                    onChange={(e) => setAccessForm({ ...accessForm, email: e.target.value })}
                    placeholder="vip@..." 
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-4 py-4 rounded-full border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Authorize & Issue Keycode'}
              </button>
            </form>

          </div>
        </div>
      )}


      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#18181c] text-white px-6 py-4 rounded-2xl border border-[#D4AF37] flex items-center space-x-3 shadow-2xl">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
            <p className="text-xs tracking-wider uppercase font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

    </main>
  );
}
