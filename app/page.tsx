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
  ArrowRight,
  Phone,
  Mail,
  Send,
  Award,
  Calendar,
  FileCheck2,
  ExternalLink,
  MessageSquare
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
  category: 'dha8' | 'waterfront' | 'dha67' | 'offplan';
  features: string[];
  imageUrl: string;
  isFeature: boolean;
  tag: string;
  badge?: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('The DHA Phase 8 Collection');
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // VIP Capture active tab
  const [captureTab, setCaptureTab] = useState<'valuation' | 'briefing'>('valuation');

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', interest: '' });
  const [accessForm, setAccessForm] = useState({ principalName: '', entity: '', phone: '', email: '' });
  const [valuationForm, setValuationForm] = useState({
    ownerName: '',
    phone: '',
    email: '',
    propertyLocation: 'DHA Phase 8',
    propertyType: 'Luxury Bungalow',
    sizeDetails: '500 Sq. Yards',
    notes: ''
  });
  const [briefingEmail, setBriefingEmail] = useState('');
  
  // Submission loadings
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValuationSubmitting, setIsValuationSubmitting] = useState(false);
  const [isBriefingSubmitting, setIsBriefingSubmitting] = useState(false);

  // Load properties from API
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
    }, 4500);
  };

  const handleEnquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          propertyId: selectedProperty,
          interest: enquiryForm.interest || 'Confidential Advisory Required',
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Enquiry registered [${data.referenceId}]. Senior advisor contacting you.`);
        setEnquireModalOpen(false);
        setEnquiryForm({ name: '', email: '', phone: '', interest: '' });
      } else {
        triggerToast(data.message || 'Submission error.');
      }
    } catch {
      triggerToast('Unable to connect to advisory desk.');
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
        triggerToast(`VIP Access Granted. Your Keycode: ${data.keycode}`);
        setAccessModalOpen(false);
        setAccessForm({ principalName: '', entity: '', phone: '', email: '' });
      } else {
        triggerToast(data.message || 'Verification error.');
      }
    } catch {
      triggerToast('Verification desk unreachable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValuationSubmitting(true);
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuationForm),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Valuation Mandate Received [${data.valuationId}]. Nadeem Sulemani will contact you.`);
        setValuationForm({
          ownerName: '',
          phone: '',
          email: '',
          propertyLocation: 'DHA Phase 8',
          propertyType: 'Luxury Bungalow',
          sizeDetails: '500 Sq. Yards',
          notes: ''
        });
      } else {
        triggerToast(data.message || 'Submission failed.');
      }
    } catch {
      triggerToast('Unable to transmit valuation request. Please try direct WhatsApp.');
    } finally {
      setIsValuationSubmitting(false);
    }
  };

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Default fallback properties for immediate server-rendering stability
  const defaultFeature: Property = {
    id: 'ghalib-villa',
    title: '500 Yards Ultra-Luxury Bungalow — Khayaban-e-Ghalib',
    location: 'DHA Phase 8 (Ghalib Area), Karachi',
    price: 'PKR 485 Million',
    specs: { area: '500 Sq. Yds', beds: 6, baths: 7, views: 'Zen Tropical Courtyard & Pool', parking: '4 Covered Bays' },
    category: 'dha8',
    features: ['Italian Travertine Stone Facade', 'Double-Height Glass Atrium', 'Private Temperature-Controlled Pool'],
    imageUrl: '/images/bungalow-ghalib.jpg',
    isFeature: true,
    tag: 'Flagship Residence',
    badge: 'Exclusive DHA Phase 8',
  };

  const defaultEmaar: Property = {
    id: 'emaar-pearl-tower',
    title: 'EMAAR Pearl Tower 2 — Sea-Facing 3-Bed Luxury Residence',
    location: 'Crescent Bay Waterfront, DHA Phase 8, Karachi',
    price: 'PKR 145 Million',
    specs: { area: '2,650 Sq. Ft', beds: 3, baths: 4, views: 'Panoramic Arabian Sea Horizon', parking: '2 Dedicated Bays' },
    category: 'waterfront',
    features: ['Direct Waterfront Promenade Access', 'Floor-to-Ceiling Coastal Glazing', 'Five-Star Concierge'],
    imageUrl: '/images/emaar-pearl-tower.jpg',
    isFeature: false,
    tag: 'Off-Plan & Waterfront',
    badge: 'EMAAR Official Specialist',
  };

  const defaultIttehad: Property = {
    id: 'ittehad-estate',
    title: 'Luxury 1,000 Yards Bungalow — Khayaban-e-Ittehad',
    location: 'Marina Corridor, DHA Phase 8 / Phase 7, Karachi',
    price: 'PKR 820 Million',
    specs: { area: '1,000 Sq. Yds', beds: 7, baths: 9, views: 'Reflecting Water Courtyard', parking: '8 Vehicles' },
    category: 'dha67',
    features: ['Cantilevered Architecture', 'Reflecting Pool', 'Private Elevator & Wellness Spa'],
    imageUrl: '/images/ittehad-estate.jpg',
    isFeature: false,
    tag: 'Private Compound',
    badge: '1,000 Yds Masterpiece',
  };

  const displayList = properties.length > 0 ? properties : [defaultFeature, defaultEmaar, defaultIttehad];
  
  const filteredProperties = activeCategory === 'all' 
    ? displayList 
    : displayList.filter(p => p.category === activeCategory || (activeCategory === 'waterfront' && p.id.includes('emaar')));

  const featureProperty = displayList.find(p => p.isFeature) || displayList[0] || defaultFeature;
  const secondaryProperties = displayList.filter(p => p.id !== featureProperty.id);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black">
      
      {/* ==================== 1. THE NAVBAR ==================== */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled ? 'bg-black/90 border-b border-white/10 shadow-2xl py-4' : 'bg-black/55 border-b border-white/[0.08] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between relative">
          
          {/* Brand Wordmark (Authentic Business Identity) */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#home" className="group flex flex-col text-left">
              <span className="font-cinzel text-lg sm:text-xl md:text-[22px] font-semibold tracking-[0.24em] text-[#D4AF37] transition-all duration-300 group-hover:brightness-125">
                REAL PROPERTY PRIME TIME
              </span>
              <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-400 font-sans mt-0.5 opacity-90 group-hover:text-amber-200 transition-colors">
                Est. 1998 • Karachi Luxury Advisory
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links (Preserving exact client routing) */}
          <nav className="hidden lg:flex items-center space-x-7">
            <a href="#home" className="text-[12px] font-medium tracking-[0.22em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#showcase" onClick={() => setActiveCategory('waterfront')} className="text-[12px] font-medium tracking-[0.22em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Off Plan Projects
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#showcase" onClick={() => setActiveCategory('all')} className="text-[12px] font-medium tracking-[0.22em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Property Listings
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#founder" className="text-[12px] font-medium tracking-[0.22em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#valuation" className="text-[12px] font-medium tracking-[0.22em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-300 relative py-1 group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Action Hub (Valuation + VIP Access) */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="#valuation"
              className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors"
            >
              Schedule Valuation
            </a>
            <button 
              onClick={() => setAccessModalOpen(true)}
              className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#D4AF37]/10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span>VIP Access</span>
            </button>
          </div>

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
              <a href="#showcase" onClick={() => { setActiveCategory('waterfront'); setMobileMenuOpen(false); }} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Off Plan Projects</a>
              <a href="#showcase" onClick={() => { setActiveCategory('all'); setMobileMenuOpen(false); }} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Property Listings</a>
              <a href="#founder" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">About Us (Leadership)</a>
              <a href="#valuation" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Contact Us</a>
              
              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                <a 
                  href="#valuation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase text-center"
                >
                  Schedule Private Valuation
                </a>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setAccessModalOpen(true); }}
                  className="w-full py-3 rounded-full border border-white/30 text-white font-medium text-xs tracking-wider uppercase"
                >
                  Request VIP Access
                </button>
              </div>
            </div>
          </div>
        )}
      </header>


      {/* ==================== 2. THE HERO SECTION ==================== */}
      <section id="home" className="relative min-h-screen w-full flex items-end justify-start overflow-hidden bg-black">
        
        {/* Hero Background Image Container (Edge-to-Edge 8K Visuals) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-mansion.jpg"
            alt="Ultra Luxury Mansion in DHA Phase 8 Karachi"
            fill
            priority
            className="object-cover object-center animate-subtle-zoom will-change-transform filter brightness-90"
          />

          {/* Dark Gradient Overlay for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/35"></div>
          
          {/* Top Vignette for Navbar Contrast */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/85 via-black/40 to-transparent"></div>
          
          {/* Left Shadow Gradient */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-4/5 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
        </div>

        {/* The Hero Copy (Elevating client's exact words) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-20 lg:pb-24 pt-32 sm:pt-40 flex flex-col justify-end">
          
          <div className="max-w-4xl space-y-6 sm:space-y-7">
            
            {/* Prestige Coordinates & Heritage Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 bg-black/60 border border-white/15 backdrop-blur-md px-4 py-2 rounded-full text-xs text-zinc-300">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]"></span>
              <span className="font-medium tracking-[0.22em] uppercase text-[10px] sm:text-[11px] text-[#D4AF37]">Est. 1998 • Luxury Real Estate Advisory</span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-300 tracking-wider">DHA (Phase 1–8) • Clifton • Emaar • HMR Specialist</span>
            </div>

            {/* Main Headline: Exactly their opening line, elevated */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-light leading-[1.05] tracking-tight text-white drop-shadow-2xl">
                Prime Properties. <br className="hidden sm:inline" />
                <span className="italic font-normal gold-gradient-text">Timeless Value.</span>
              </h1>
              
              {/* Single punchy editorial sentence */}
              <p className="font-sans text-base sm:text-lg md:text-xl text-zinc-300 font-light tracking-wide max-w-3xl leading-relaxed">
                Karachi’s most prestigious residential, commercial, and investment opportunities.
              </p>

              {/* Discreet advisory statement */}
              <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed max-w-2xl border-l-2 border-[#D4AF37]/50 pl-4 py-1">
                Led by Nadeem Sulemani, delivering discreet, transparent, and results-driven property solutions for buyers, sellers, and investors who expect excellence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
              
              <a
                href="#showcase"
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#e0be49] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Catalog</span>
                <ChevronRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="#valuation"
                className="group inline-flex items-center justify-center px-8 sm:px-10 py-4 rounded-full border border-white/30 text-white font-medium text-xs sm:text-sm tracking-[0.18em] uppercase backdrop-blur-sm bg-black/30 transition-all duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-black/60 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="mr-2.5 w-4 h-4 text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                <span>Schedule Valuation</span>
              </a>

              <a
                href="https://wa.me/923008286662?text=Hello%20Real%20Property%20Prime%20Time%2C%20I%20am%20inquiring%20about%20your%20luxury%20listings"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 rounded-full border border-emerald-500/30 text-emerald-400 font-medium text-xs tracking-wider uppercase bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400 transition-all"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Direct WhatsApp</span>
              </a>

            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/[0.12] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Market Leadership</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">Est. 1998 (27+ Yrs)</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Core Specialization</span>
              <span className="font-serif text-xl sm:text-2xl text-[#D4AF37] font-normal mt-1 block">DHA Phase 1–8 & Clifton</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Waterfront Desk</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">EMAAR & HMR Waterfront</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Client Discretion</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">100% Confidential</span>
            </div>
          </div>

        </div>

      </section>


      {/* ==================== 3. ASYMMETRICAL LISTINGS (IMMEDIATELY AFTER HERO) ==================== */}
      <section id="showcase" className="relative bg-[#0a0a0a] py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header with Category Switchers */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real Property Prime Time Portfolio</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-tight">
                Curated Residences <br />
                <span className="italic text-zinc-400">& Waterfront Flagships</span>
              </h2>
            </div>
            
            <div className="max-w-md">
              <p className="text-zinc-400 text-sm font-light leading-relaxed mb-4">
                DHA Phase 8 bungalows, Crescent Bay sea-facing apartments, and custom architectural estates personally vetted by Nadeem Sulemani.
              </p>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'all', label: 'All Catalog' },
                  { id: 'dha8', label: 'DHA Phase 8' },
                  { id: 'waterfront', label: 'EMAAR & Waterfront' },
                  { id: 'dha67', label: 'DHA Phase 6 & 7' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs tracking-wider uppercase transition-all duration-300 ${
                      activeCategory === cat.id
                        ? 'bg-[#D4AF37] text-neutral-950 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                        : 'border border-white/15 text-zinc-400 hover:text-white hover:border-white/35 bg-black/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ==================== ASYMMETRICAL SHOWCASE GRID ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Side (Col 7): Massive Vertical Feature Card */}
            <div className="lg:col-span-7 flex flex-col">
              <div 
                onClick={() => openEnquiryFor(featureProperty.title)}
                className="group relative w-full h-[620px] sm:h-[700px] lg:h-[780px] rounded-3xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all duration-500 shadow-2xl"
              >
                <Image
                  src={featureProperty.imageUrl}
                  alt={featureProperty.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Dark Gradient Fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85 opacity-90"></div>

                {/* Top Badges */}
                <div className="absolute top-6 left-6 z-10 flex items-center space-x-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">
                    {featureProperty.badge || featureProperty.tag}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] tracking-wider uppercase text-zinc-300">
                    Est. 1998 Verified
                  </span>
                </div>

                {/* Top Right Action Arrow */}
                <div className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="w-5 h-5" />
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-0 inset-x-0 p-7 sm:p-10 z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-zinc-300 flex items-center text-xs tracking-wider uppercase">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#D4AF37]" />
                      {featureProperty.location}
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37] font-normal">
                      {featureProperty.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-4xl font-light text-white leading-snug group-hover:text-amber-100 transition-colors">
                    {featureProperty.title}
                  </h3>

                  {/* Specs */}
                  <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-zinc-300 border-t border-white/10">
                    <span className="flex items-center space-x-1.5">
                      <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.area}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Bed className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.beds} Beds</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Bath className="w-4 h-4 text-[#D4AF37]" />
                      <span>{featureProperty.specs.baths} Baths</span>
                    </span>
                    <span className="text-zinc-400">• {featureProperty.specs.views}</span>
                  </div>

                  {/* Interactive Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEnquiryFor(featureProperty.title)}
                      className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase hover:bg-white transition-colors"
                    >
                      Enquire Privately
                    </button>
                    <a
                      href={`https://wa.me/923008286662?text=Inquiry%20regarding%20${encodeURIComponent(featureProperty.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-full border border-emerald-500/40 text-emerald-400 text-xs font-medium tracking-wider uppercase hover:bg-emerald-950/30 transition-colors flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href="tel:+923008286662"
                      className="px-4 py-2.5 rounded-full border border-white/20 text-zinc-300 text-xs font-medium tracking-wider uppercase hover:text-white hover:border-white/40 transition-colors flex items-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Advisor</span>
                    </a>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Side (Col 5): Two Stacked Horizontal Showcase Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              
              {secondaryProperties.slice(0, 2).map((property) => (
                <div 
                  key={property.id}
                  onClick={() => openEnquiryFor(property.title)}
                  className="group relative h-[300px] sm:h-[335px] lg:h-[374px] rounded-3xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-[#D4AF37]/50 transition-all duration-500 shadow-xl"
                >
                  <Image
                    src={property.imageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 opacity-90"></div>

                  {/* Badge */}
                  <div className="absolute top-5 left-5 z-10 flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">
                      {property.badge || property.tag}
                    </span>
                  </div>

                  <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                  {/* Card Content */}
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 z-10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center text-[11px]">
                        <MapPin className="w-3 h-3 mr-1 text-[#D4AF37]" />
                        {property.location}
                      </span>
                      <span className="font-serif text-xl sm:text-2xl text-[#D4AF37]">
                        {property.price}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-light text-white leading-snug group-hover:text-amber-100 transition-colors">
                      {property.title}
                    </h3>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-300 border-t border-white/10">
                      <span className="flex items-center space-x-1">
                        <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{property.specs.area}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{property.specs.beds} Beds</span>
                      </span>
                      <span className="text-zinc-400">• {property.specs.views}</span>
                    </div>

                    <div className="pt-2 flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEnquiryFor(property.title)}
                        className="text-[11px] uppercase tracking-wider text-[#D4AF37] hover:underline font-medium"
                      >
                        Enquire →
                      </button>
                      <span className="text-zinc-600">|</span>
                      <a
                        href={`https://wa.me/923008286662?text=Inquiry%20regarding%20${encodeURIComponent(property.title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] uppercase tracking-wider text-emerald-400 hover:underline font-medium"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* Full Grid of Remaining Properties */}
          {filteredProperties.length > 3 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(3).map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => openEnquiryFor(prop.title)}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/80 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={prop.imageUrl}
                      alt={prop.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 border border-[#D4AF37]/40 text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                      {prop.badge || prop.tag}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{prop.location}</span>
                      <span className="font-serif text-lg text-[#D4AF37]">{prop.price}</span>
                    </div>
                    <h4 className="font-serif text-lg text-white font-light line-clamp-1">{prop.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 border-t border-white/10 pt-3">
                      <span>{prop.specs.area}</span>
                      <span>• {prop.specs.beds} Beds</span>
                      <span>• {prop.specs.baths} Baths</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <button className="text-xs uppercase tracking-wider text-[#D4AF37] hover:underline">
                        View Details
                      </button>
                      <a
                        href={`https://wa.me/923008286662?text=Inquiry%20for%20${encodeURIComponent(prop.title)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-emerald-400 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp Desk
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discreet Verification Strip */}
          <div className="mt-16 p-7 sm:p-8 rounded-2xl bg-black/60 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl text-white">Confidential Off-Market Brokerage</h4>
                <p className="text-zinc-400 text-xs mt-0.5">High-profile properties transacted with strict non-disclosure protocols across DHA Phases 1–8, Clifton, and Emaar.</p>
              </div>
            </div>
            <button
              onClick={() => setAccessModalOpen(true)}
              className="px-6 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-xs uppercase tracking-widest font-semibold flex-shrink-0"
            >
              Request Private Access
            </button>
          </div>

        </div>
      </section>


      {/* ==================== 4. THE FOUNDER & HERITAGE SECTION ==================== */}
      {/* Magazine-Style Editorial Block (Architectural Digest standard) */}
      <section id="founder" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-12 bg-[#0c0c0d] border-t border-white/[0.08] overflow-hidden">
        
        {/* Ambient Warm Glow */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-[#9E7D17]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Eyebrow */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-[#D4AF37] inline-block">
              Founding Leadership • Est. 1998
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
              Two Decades of <br />
              <span className="italic font-normal gold-gradient-text">Market Authority</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-light tracking-wide max-w-lg mx-auto">
              Over 27 years of combined experience orchestrating high-value transactions in Karachi’s prime property corridors.
            </p>
          </div>

          {/* Magazine-Spread Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Portrait & Founder Badge (Col 5) */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-b from-[#18181b] to-black border border-white/10 shadow-2xl group">
                
                {/* Subtle Gold Frame accent */}
                <div className="absolute inset-3 border border-[#D4AF37]/25 rounded-2xl pointer-events-none z-20"></div>

                {/* Founder Cutout Photograph */}
                <div className="relative w-full h-full">
                  <Image
                    src="/images/founder-nadeem.png"
                    alt="Nadeem Sulemani — Founder & Owner of Real Property Prime Time"
                    fill
                    className="object-cover object-top filter brightness-100 contrast-105 transform group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>

                {/* Bottom Shadow Fade */}
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

                {/* Overlay Name Tag */}
                <div className="absolute bottom-6 inset-x-6 z-20 text-center">
                  <span className="font-serif text-2xl text-white block">Nadeem Sulemani</span>
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#D4AF37] font-medium block mt-1">
                    Founder & Owner
                  </span>
                  <span className="text-[10px] text-zinc-400 block tracking-wider mt-0.5">
                    Real Property Prime Time
                  </span>
                </div>

              </div>

              {/* Direct Founder Access Line */}
              <div className="mt-6 flex items-center space-x-3 bg-black/60 border border-white/10 px-5 py-2.5 rounded-full text-xs text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Personal Advisory Line:</span>
                <a href="tel:+923008286662" className="text-[#D4AF37] font-mono font-medium hover:underline">
                  +92 300 8286662
                </a>
              </div>
            </div>

            {/* Right Column: Editorial Narrative (Col 7) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Editorial Quote Callout */}
              <blockquote className="border-l-2 border-[#D4AF37] pl-6 sm:pl-8 py-2">
                <p className="font-serif text-xl sm:text-2xl md:text-3xl text-zinc-100 font-light italic leading-snug">
                  "Since founding Real Property Prime Time in 1998, we have built every milestone on trust, absolute discretion, and strategic advisory for buyers who demand excellence."
                </p>
                <footer className="mt-3 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  — Nadeem Sulemani
                </footer>
              </blockquote>

              {/* Authentic Paragraphs (Preserving their exact copy with high-end prose) */}
              <div className="space-y-5 text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
                <p>
                  With over two decades of real estate experience, <strong className="text-white font-medium">Nadeem Sulemani</strong> is a respected name in Karachi’s premium property market. Since establishing Real Property Prime Time in 1998, he has guided discerning families, corporate leaders, and international investors through Karachi’s most consequential real estate acquisitions.
                </p>
                <p>
                  Known for his in‑depth market knowledge of <strong className="text-white font-medium">all DHA phases (Phase 1–8), Clifton, Emaar Crescent Bay, and HMR Waterfront</strong>, Nadeem Sulemani personally oversees high‑value transactions. Every client receives strategic advice, accurate pricing, and seamless execution backed by real-time market data.
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  Whether negotiating an ultra-luxury bungalow in DHA Phase 8, securing a panoramic sea-facing residence at EMAAR Pearl Tower, or executing confidential multi-acre commercial positions, our advisory delivers results with zero friction.
                </p>
              </div>

              {/* Heritage Metric Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37]">1998</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">Established in Karachi</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-white">27+ Years</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">Proven Track Record</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37]">DHA 1–8</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">& Waterfront Specialist</span>
                </div>
              </div>

              {/* Consultation Action */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#valuation"
                  className="px-7 py-3.5 rounded-full bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase hover:bg-[#e0be49] transition-all shadow-lg"
                >
                  Schedule Private Valuation
                </a>
                <a
                  href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20would%20like%20to%20schedule%20a%20private%20property%20advisory%20session"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-full border border-white/20 text-white text-xs font-medium tracking-wider uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Message Nadeem Directly</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================== 5. THE VIP CAPTURE (VALUATION + BRIEFINGS) ==================== */}
      {/* Consolidating and elevating their valuation & updates forms */}
      <section id="valuation" className="relative py-28 sm:py-36 px-5 sm:px-8 border-t border-white/[0.08] bg-[#0a0a0a]">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="bg-[#121214] rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
            
            {/* Header Content with Exact Authentic Words */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Privileged Advisory Desk</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
                Schedule Your Private Property Valuation
              </h2>

              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">
                Backed by a qualified network of ready buyers, in-depth market intelligence, and a trusted reputation built since 1998 — we are the preferred choice for discerning property owners seeking accurate valuations and premium results.
              </p>

              {/* Mode Toggle Tabs */}
              <div className="inline-flex p-1.5 rounded-full bg-black/60 border border-white/10 mt-4">
                <button
                  type="button"
                  onClick={() => setCaptureTab('valuation')}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 ${
                    captureTab === 'valuation'
                      ? 'bg-[#D4AF37] text-neutral-950 font-semibold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Schedule Valuation
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureTab('briefing')}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 ${
                    captureTab === 'briefing'
                      ? 'bg-[#D4AF37] text-neutral-950 font-semibold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Stay Updated (Briefings)
                </button>
              </div>
            </div>

            {/* TAB 1: VALUATION FORM */}
            {captureTab === 'valuation' && (
              <form onSubmit={handleValuationSubmit} className="mt-10 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={valuationForm.ownerName}
                      onChange={(e) => setValuationForm({ ...valuationForm, ownerName: e.target.value })}
                      placeholder="e.g. Tariq Mansoor"
                      className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Direct Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={valuationForm.phone}
                      onChange={(e) => setValuationForm({ ...valuationForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Location
                    </label>
                    <select
                      value={valuationForm.propertyLocation}
                      onChange={(e) => setValuationForm({ ...valuationForm, propertyLocation: e.target.value })}
                      className="w-full bg-black/60 text-white text-sm rounded-xl px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    >
                      <option value="DHA Phase 8">DHA Phase 8</option>
                      <option value="EMAAR Crescent Bay">EMAAR Crescent Bay</option>
                      <option value="DHA Phase 6">DHA Phase 6</option>
                      <option value="DHA Phase 5">DHA Phase 5</option>
                      <option value="DHA Phase 7">DHA Phase 7</option>
                      <option value="Clifton (Blocks 1-9)">Clifton (Blocks 1-9)</option>
                      <option value="HMR Waterfront">HMR Waterfront</option>
                      <option value="DHA Phase 1–4">DHA Phase 1–4</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Property Type
                    </label>
                    <select
                      value={valuationForm.propertyType}
                      onChange={(e) => setValuationForm({ ...valuationForm, propertyType: e.target.value })}
                      className="w-full bg-black/60 text-white text-sm rounded-xl px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    >
                      <option value="Luxury Bungalow">Luxury Bungalow</option>
                      <option value="Waterfront Apartment">Waterfront Apartment</option>
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Commercial Building">Commercial Building</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Size / Specs
                    </label>
                    <input
                      type="text"
                      value={valuationForm.sizeDetails}
                      onChange={(e) => setValuationForm({ ...valuationForm, sizeDetails: e.target.value })}
                      placeholder="e.g. 500 Yds / 1000 Yds"
                      className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Confidential Notes / Valuation Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={valuationForm.notes}
                    onChange={(e) => setValuationForm({ ...valuationForm, notes: e.target.value })}
                    placeholder="Provide any details regarding condition, expected timeframe, or discretion preferences..."
                    className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] text-zinc-500 font-light flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5" />
                    Strict confidentiality guaranteed under non-disclosure terms.
                  </p>

                  <button
                    type="submit"
                    disabled={isValuationSubmitting}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <span>{isValuationSubmitting ? 'Submitting Request...' : 'Request Private Valuation'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}

            {/* TAB 2: STAY UPDATED (BRIEFINGS) */}
            {captureTab === 'briefing' && (
              <div className="mt-10 max-w-lg mx-auto space-y-6 text-center">
                <p className="text-zinc-400 text-sm font-light">
                  Latest insights and exclusive off-market updates from Karachi’s prime real estate market delivered directly to your private inbox.
                </p>

                <form onSubmit={handleBriefingSubmit} className="pt-2">
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={briefingEmail}
                      onChange={(e) => setBriefingEmail(e.target.value)}
                      placeholder="Enter your confidential email address"
                      className="w-full bg-black/70 text-white placeholder-zinc-500 text-sm sm:text-base rounded-full pl-6 pr-36 py-4 border border-white/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isBriefingSubmitting}
                      className="absolute right-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-neutral-950 hover:bg-[#e0be49] transition-all flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase disabled:opacity-50"
                    >
                      <span>{isBriefingSubmitting ? 'Sending...' : 'Get Updates'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-3 font-light">
                    Direct dispatches from Nadeem Sulemani • Zero spam • Unsubscribe anytime
                  </p>
                </form>

                <div className="pt-4 flex items-center justify-center space-x-4 text-xs text-zinc-400">
                  <span>Direct Inquiries:</span>
                  <a href="mailto:realpropertyprimetime@gmail.com" className="text-[#D4AF37] hover:underline">
                    realpropertyprimetime@gmail.com
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </section>


      {/* ==================== 6. THE MINIMALIST LUXURY FOOTER ==================== */}
      <footer className="bg-black py-16 sm:py-20 px-5 sm:px-8 lg:px-12 border-t border-white/10 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* Col 1 & 2: Brand & Heritage */}
            <div className="lg:col-span-2 space-y-4">
              <span className="font-cinzel text-xl sm:text-2xl tracking-[0.22em] text-[#D4AF37] block">
                REAL PROPERTY PRIME TIME
              </span>
              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
                Luxury real estate advisory established in 1998. Offering premium residential, commercial, and investment opportunities in Karachi’s most prestigious locations.
              </p>
              <div className="text-[11px] text-zinc-400 space-y-1">
                <p>• Led by Nadeem Sulemani</p>
                <p>• DHA Phases 1–8 • Clifton • Emaar • HMR Specialist</p>
              </div>
            </div>

            {/* Col 3: Quick Links */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Quick Links
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#home" className="hover:text-[#D4AF37] transition-colors">Home</a></li>
                <li><a href="#showcase" onClick={() => setActiveCategory('waterfront')} className="hover:text-[#D4AF37] transition-colors">Off Plan Projects</a></li>
                <li><a href="#showcase" onClick={() => setActiveCategory('all')} className="hover:text-[#D4AF37] transition-colors">Property Listings</a></li>
                <li><a href="#founder" className="hover:text-[#D4AF37] transition-colors">About Us (Leadership)</a></li>
                <li><a href="#valuation" className="hover:text-[#D4AF37] transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Col 4: Featured Properties */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Properties
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <button onClick={() => openEnquiryFor('EMAAR Pearl Tower 2')} className="text-left hover:text-[#D4AF37] transition-colors">
                    EMAAR Pearl Tower
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('Ultra-Luxury Bungalow DHA Phase 8')} className="text-left hover:text-[#D4AF37] transition-colors">
                    Ultra-Luxury Bungalow DHA Phase 8
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('Luxury 1000 Yards Bungalow DHA Phase 7')} className="text-left hover:text-[#D4AF37] transition-colors">
                    Luxury 1,000 Yards DHA Phase 7
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('500 Yards Bungalow DHA Phase 6')} className="text-left hover:text-[#D4AF37] transition-colors">
                    500 Yards Bungalow DHA Phase 6
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Direct Contact Info */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Contact Info
              </h5>
              <div className="space-y-2 text-zinc-300">
                <p>
                  <a href="tel:+923008286662" className="hover:text-[#D4AF37] transition-colors font-mono">
                    +92 300 8286662
                  </a>
                </p>
                <p>
                  <a href="tel:+923219777555" className="hover:text-[#D4AF37] transition-colors font-mono">
                    +92 321 9777555
                  </a>
                </p>
                <p>
                  <a href="mailto:realpropertyprimetime@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                    realpropertyprimetime@gmail.com
                  </a>
                </p>
              </div>

              {/* Social Channels */}
              <div className="pt-2 flex items-center space-x-3">
                <a
                  href="https://www.facebook.com/realpropertyprimetime"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-white/15 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors text-[11px]"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/real_property_prime_time"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full border border-white/15 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors text-[11px]"
                >
                  Instagram
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
            <p>© 2026 All Rights Reserved. Real Property Prime Time.</p>
            <p className="tracking-widest uppercase">
              Karachi Luxury Real Estate Advisory • Discretion • Integrity • Results
            </p>
          </div>

        </div>
      </footer>


      {/* ==================== FLOATING WHATSAPP ACTION ==================== */}
      <aside aria-label="Direct Advisory Desk" className="fixed bottom-6 right-6 z-40 flex items-center space-x-3">
        <a
          href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20interested%20in%20Karachi%20prime%20properties"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          aria-label="Direct WhatsApp with Nadeem Sulemani"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">
            WhatsApp Desk
          </span>
        </a>
      </aside>


      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toastMessage && (
        <aside aria-label="Live Notifications" className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-[#161618] border border-[#D4AF37]/50 text-white px-6 py-3.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center space-x-3 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium tracking-wide">{toastMessage}</span>
        </aside>
      )}


      {/* ==================== MODAL: ENQUIRE ==================== */}
      {enquireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#111] border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            
            <button 
              onClick={() => setEnquireModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-1">
                Confidential Inquiry
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                {selectedProperty}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your inquiry goes directly to Nadeem Sulemani & our senior brokerage desk.
              </p>
            </div>

            <form onSubmit={handleEnquireSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Phone / WhatsApp</label>
                  <input 
                    type="tel" 
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Acquisition Objective</label>
                <textarea 
                  rows={3}
                  value={enquiryForm.interest}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, interest: e.target.value })}
                  placeholder="Specific requirements or private viewing timeline..."
                  className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting...' : 'Submit Confidential Inquiry'}
              </button>
            </form>

          </div>
        </div>
      )}


      {/* ==================== MODAL: VIP ACCESS ==================== */}
      {accessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#111] border border-[#D4AF37]/35 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            
            <button 
              onClick={() => setAccessModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-1">
                Verified Principal Registry
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Request Private Access
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Gain access to unlisted off-market opportunities across DHA Phase 8, Clifton, and Emaar.
              </p>
            </div>

            <form onSubmit={handleAccessSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Principal Name *</label>
                <input 
                  type="text" 
                  required
                  value={accessForm.principalName}
                  onChange={(e) => setAccessForm({ ...accessForm, principalName: e.target.value })}
                  placeholder="e.g. Asad Hashmi"
                  className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Representing Entity / Family Office</label>
                <input 
                  type="text" 
                  value={accessForm.entity}
                  onChange={(e) => setAccessForm({ ...accessForm, entity: e.target.value })}
                  placeholder="Private Principal / Investment Entity"
                  className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={accessForm.email}
                    onChange={(e) => setAccessForm({ ...accessForm, email: e.target.value })}
                    placeholder="principal@domain.com"
                    className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={accessForm.phone}
                    onChange={(e) => setAccessForm({ ...accessForm, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full bg-black/60 text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Request VIP Credentials'}
              </button>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}
