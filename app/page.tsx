'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Compass, 
  KeyRound, 
  ShieldCheck, 
  X, 
  ArrowUpRight, 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Menu, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  Mail, 
  Send, 
  Calendar, 
  FileCheck2, 
  ExternalLink, 
  MessageSquare, 
  Lock, 
  Layers, 
  Award,
  Camera,
  Play,
  Pause,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import PrivateAdvisoryDesk from '@/components/PrivateAdvisoryDesk';
import HeroSection from '@/components/HeroSection';

export interface Property {
  id: number | string;
  title: string;
  slug?: string;
  demand?: string;
  price?: string;
  location: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: string | null;
  description?: string | null;
  image_urls?: string[];
  imageUrl?: string;
  specs?: {
    area: string;
    beds: number;
    baths: number;
    views: string;
    parking?: string;
  };
  category?: 'dha8' | 'waterfront' | 'dha67' | 'offplan' | string;
  rawCategory?: string | null;
  floor_number?: string | null;
  features?: string[];
  isFeature?: boolean;
  tag?: string;
  badge?: string;
  created_at?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Modals state
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('The DHA Phase 8 Collection');
  
  // Continuous Revolving Portfolio Showcase State
  const [showcaseMode, setShowcaseMode] = useState<'revolving' | 'grid'>('revolving');
  const [revolvingIndex, setRevolvingIndex] = useState<number>(0);
  const [isRevolvingPaused, setIsRevolvingPaused] = useState<boolean>(false);
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // VIP Capture active tab
  const [captureTab, setCaptureTab] = useState<'valuation' | 'briefing'>('valuation');

  // Active FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', interest: '' });
  const [enquiryErrors, setEnquiryErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const [accessForm, setAccessForm] = useState({ principalName: '', entity: '', phone: '', email: '', agreeNda: false });
  const [accessErrors, setAccessErrors] = useState<{ principalName?: string; email?: string; phone?: string; agreeNda?: string }>({});

  const [valuationForm, setValuationForm] = useState({
    ownerName: '',
    phone: '',
    email: '',
    propertyLocation: 'DHA Phase 8 (Zone A)',
    propertyType: 'Luxury Bungalow',
    sizeDetails: '500 Sq. Yards',
    notes: ''
  });
  const [valuationErrors, setValuationErrors] = useState<{ ownerName?: string; phone?: string; email?: string }>({});

  const [briefingEmail, setBriefingEmail] = useState('');
  const [briefingError, setBriefingError] = useState<string | null>(null);
  
  // Submission loadings
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValuationSubmitting, setIsValuationSubmitting] = useState(false);
  const [isBriefingSubmitting, setIsBriefingSubmitting] = useState(false);

  // Load properties from API with zero-cache enforcement
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch(`/api/properties?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (!res.ok) {
          throw new Error(`Properties request failed: ${res.status}`);
        }
        const json = await res.json();
        const rawList: any[] = Array.isArray(json) ? json : (json.data || []);
        if (rawList.length > 0) {
          const mapped: Property[] = rawList.map((item: any, index: number) => {
            const primaryImage = (item.image_urls && item.image_urls.length > 0) 
              ? item.image_urls[0] 
              : (item.imageUrl || '/images/hero-mansion.jpg');
            
            const displayPrice = item.demand
              ? (item.demand.toString().toLowerCase().includes('pkr') ? item.demand : `PKR ${item.demand}`)
              : (item.price || 'Price on Application');

            // Category detection based on location/title
            let category: string = item.category || 'dha8';
            const loc = (item.location || '').toLowerCase();
            const tit = (item.title || '').toLowerCase();
            if (loc.includes('waterfront') || loc.includes('emaar') || loc.includes('crescent') || tit.includes('waterfront') || tit.includes('emaar')) {
              category = 'waterfront';
            } else if (loc.includes('phase 6') || loc.includes('phase 7') || tit.includes('phase 6') || tit.includes('phase 7')) {
              category = 'dha67';
            }

            return {
              id: item.id,
              title: item.title,
              slug: item.slug || String(item.id),
              demand: item.demand,
              price: displayPrice,
              location: item.location,
              bedrooms: item.bedrooms,
              bathrooms: item.bathrooms,
              size: item.size,
              description: item.description,
              image_urls: item.image_urls || [primaryImage],
              imageUrl: primaryImage,
              specs: {
                area: item.size || item.specs?.area || 'Prime Yardage',
                beds: item.bedrooms ?? item.specs?.beds ?? 0,
                baths: item.bathrooms ?? item.specs?.baths ?? 0,
                views: item.specs?.views || 'Prime Coastal & Urban Views',
                parking: item.specs?.parking || 'Covered Bays',
              },
              category: category as any,
              rawCategory: item.category ?? null,
              floor_number: item.floor_number ?? null,
              features: item.features || [],
              isFeature: item.isFeature ?? (index === 0),
              tag: item.tag || 'Flagship Residence',
              badge: item.badge || 'Verified Mandate',
              created_at: item.created_at,
              latitude: item.latitude ?? null,
              longitude: item.longitude ?? null,
            };
          });
          setProperties(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch from properties API:', err);
      }
    }
    loadProperties();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEnquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; phone?: string } = {};

    if (!enquiryForm.name.trim()) errors.name = 'Please provide your full legal name.';
    if (!enquiryForm.email.trim() || !validateEmail(enquiryForm.email)) {
      errors.email = 'Please provide a valid private email address.';
    }
    if (!enquiryForm.phone.trim()) {
      errors.phone = 'Please provide your direct contact or WhatsApp number.';
    }

    if (Object.keys(errors).length > 0) {
      setEnquiryErrors(errors);
      return;
    }
    setEnquiryErrors({});

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
        triggerToast(`Dossier Request Registered [${data.referenceId}]. Senior advisor contacting you.`);
        setEnquireModalOpen(false);
        setEnquiryForm({ name: '', email: '', phone: '', interest: '' });
      } else {
        triggerToast(data.message || 'Error processing request.');
      }
    } catch {
      triggerToast('Unable to connect to advisory desk. Please use direct telephone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { principalName?: string; email?: string; phone?: string; agreeNda?: string } = {};

    if (!accessForm.principalName.trim()) errors.principalName = 'Principal representative name is required.';
    if (!accessForm.email.trim() || !validateEmail(accessForm.email)) {
      errors.email = 'Valid corporate or private office email required.';
    }
    if (!accessForm.phone.trim()) errors.phone = 'Direct telephone required for identity verification.';
    if (!accessForm.agreeNda) errors.agreeNda = 'You must acknowledge the non-disclosure agreement.';

    if (Object.keys(errors).length > 0) {
      setAccessErrors(errors);
      return;
    }
    setAccessErrors({});

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Confidential Access Granted. Your Private Keycode: ${data.keycode}`);
        setAccessModalOpen(false);
        setAccessForm({ principalName: '', entity: '', phone: '', email: '', agreeNda: false });
      } else {
        triggerToast(data.message || 'Identity verification failed.');
      }
    } catch {
      triggerToast('Advisory registry currently unreachable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { ownerName?: string; phone?: string; email?: string } = {};

    if (!valuationForm.ownerName.trim()) errors.ownerName = 'Property owner name is required.';
    if (!valuationForm.phone.trim()) errors.phone = 'Direct telephone or WhatsApp number is required.';
    if (valuationForm.email && !validateEmail(valuationForm.email)) {
      errors.email = 'Please provide a valid email format.';
    }

    if (Object.keys(errors).length > 0) {
      setValuationErrors(errors);
      return;
    }
    setValuationErrors({});

    setIsValuationSubmitting(true);
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valuationForm),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Valuation Mandate Transmitted [${data.valuationId}]. Nadeem Sulemani will contact you.`);
        setValuationForm({
          ownerName: '',
          phone: '',
          email: '',
          propertyLocation: 'DHA Phase 8 (Zone A)',
          propertyType: 'Luxury Bungalow',
          sizeDetails: '500 Sq. Yards',
          notes: ''
        });
      } else {
        triggerToast(data.message || 'Valuation submission failed.');
      }
    } catch {
      triggerToast('Unable to transmit valuation request. Please use direct WhatsApp.');
    } finally {
      setIsValuationSubmitting(false);
    }
  };

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefingEmail.trim() || !validateEmail(briefingEmail)) {
      setBriefingError('Please enter a valid confidential email address.');
      return;
    }
    setBriefingError(null);

    setIsBriefingSubmitting(true);
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: briefingEmail }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Registered for Confidential Karachi Off-Market Briefings.');
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
    setEnquiryErrors({});
    setEnquireModalOpen(true);
  };

  // Default fallback properties for immediate server rendering
  const defaultFeature: Property = {
    id: 'ghalib-villa',
    title: '500 Yards Architectural Masterpiece — Khayaban-e-Ghalib',
    location: 'DHA Phase 8 (Zone A), Karachi',
    price: 'PKR 485 Million',
    specs: { area: '500 Sq. Yds', beds: 6, baths: 7, views: 'Private Internal Atrium & Heated Lap Pool', parking: '4 Covered Bays' },
    category: 'dha8',
    features: ['Italian Travertine Stone Facade', 'Double-Height Structural Glass Atrium', 'Private Temperature-Controlled Pool'],
    imageUrl: '/images/bungalow-ghalib.jpg',
    isFeature: true,
    tag: 'Flagship Residence',
    badge: 'Exclusive DHA Phase 8',
  };

  const defaultEmaar: Property = {
    id: 'emaar-pearl-tower',
    title: 'EMAAR Pearl Tower 2 — Direct Sea-Facing Luxury Residence',
    location: 'Crescent Bay Waterfront, DHA Phase 8, Karachi',
    price: 'PKR 145 Million',
    specs: { area: '2,650 Sq. Ft', beds: 3, baths: 4, views: 'Unobstructed Arabian Sea & Sunset Views', parking: '2 Dedicated Bays' },
    category: 'waterfront',
    features: ['Direct Waterfront Promenade Access', 'Floor-to-Ceiling Coastal Glazing', 'Five-Star Concierge'],
    imageUrl: '/images/emaar-pearl-tower.jpg',
    isFeature: false,
    tag: 'Waterfront Living',
    badge: 'EMAAR Official Specialist',
  };

  const defaultIttehad: Property = {
    id: 'ittehad-estate',
    title: '1,000 Yards Contemporary Compound — Khayaban-e-Ittehad',
    location: 'Marina Corridor, DHA Phase 8, Karachi',
    price: 'PKR 820 Million',
    specs: { area: '1,000 Sq. Yds', beds: 7, baths: 9, views: 'Reflecting Water Courtyard & Manicured Lawn', parking: '8 Vehicle Driveway' },
    category: 'dha67',
    features: ['Cantilevered Architecture', 'Reflecting Pool', 'Private Elevator & Wellness Spa'],
    imageUrl: '/images/ittehad-estate.jpg',
    isFeature: false,
    tag: 'Private Compound',
    badge: '1,000 Yds Masterpiece',
  };

  const displayList = useMemo(() => {
    return properties.length > 0 ? properties : [defaultFeature, defaultEmaar, defaultIttehad];
  }, [properties]);
  
  const filteredProperties = useMemo(() => {
    return activeCategory === 'all' 
      ? displayList 
      : displayList.filter(p => p.category === activeCategory || (activeCategory === 'waterfront' && String(p.id).toLowerCase().includes('emaar')));
  }, [displayList, activeCategory]);

  const activeList = useMemo(() => {
    return filteredProperties.length > 0 ? filteredProperties : displayList;
  }, [filteredProperties, displayList]);

  const featureProperty = useMemo(() => {
    return activeList.find(p => p.isFeature) || activeList[0] || defaultFeature;
  }, [activeList]);

  const secondaryProperties = useMemo(() => {
    return activeList.filter(p => p.id !== featureProperty.id);
  }, [activeList, featureProperty.id]);

  // 4.5-Second Continuous Cross-Fade Revolving Showcase Engine
  useEffect(() => {
    if (!isMounted || isRevolvingPaused || showcaseMode !== 'revolving') return;
    if (!activeList || activeList.length <= 1) return;

    const timer = setInterval(() => {
      setRevolvingIndex((prev) => (prev + 1) % activeList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isMounted, isRevolvingPaused, showcaseMode, activeList]);

  // Reset revolving index when active category filter changes
  useEffect(() => {
    setRevolvingIndex(0);
  }, [activeCategory]);

  const nextRevolvingSlide = useCallback(() => {
    if (!activeList || activeList.length <= 1) return;
    setRevolvingIndex((prev) => (prev + 1) % activeList.length);
  }, [activeList]);

  const prevRevolvingSlide = useCallback(() => {
    if (!activeList || activeList.length <= 1) return;
    setRevolvingIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
  }, [activeList]);

  const goToRevolvingSlide = useCallback((index: number) => {
    setRevolvingIndex(index);
  }, []);

  // Substantive FAQ questions addressing genuine Karachi legal, title, and tax realities
  const faqs = [
    {
      q: 'How does Real Property Prime Time verify DHA title deeds and CBC clearance prior to acquisition?',
      a: 'Every property under our mandate undergoes rigorous multi-tier verification before any client presentation. We confirm the original Sub-Lease and Allotment Transfer Letter directly with the Pakistan Defence Officers Housing Authority (DHA Karachi) Transfer & Record Branch. Simultaneously, we inspect municipal tax clearance receipts with the Cantonment Board Clifton (CBC), verify site demarcation against approved building plans, and ensure zero existing encumbrances, litigation, or bank mortgages.'
    },
    {
      q: 'What protocols protect high-profile sellers and buyers during off-market transactions?',
      a: 'We operate under bilateral Non-Disclosure Agreements (NDAs). Off-market estates in DHA Phase 8 and Emaar are never advertised publicly or posted to general portals. Prospective purchasers must submit verified principal credentials before receiving the full architectural dossier, survey map, or owner pricing. All physical viewings are privately accompanied by Nadeem Sulemani to guarantee total discretion.'
    },
    {
      q: 'Can Overseas Pakistani expatriates execute acquisitions or divestments through Power of Attorney?',
      a: 'Yes. A substantial portion of our private client registry consists of expatriates residing in the United Kingdom, UAE, United States, and Canada. We facilitate legitimate Special Power of Attorney (SPA) procedures attested by the respective Pakistan Embassy or High Commission, followed by Ministry of Foreign Affairs (MOFA) attestation and DHA Karachi registration, enabling complete remote closing and legal fund repatriation through State Bank of Pakistan banking channels.'
    },
    {
      q: 'What are the current transfer fees, Advance Tax, and Capital Gains Tax considerations for DHA Phase 8 in 2026?',
      a: 'Property transfers in DHA Karachi are subject to federal and provincial levies based on active FBR valuation tables and filer/non-filer status. Transactions include DHA Transfer Fees (calculated by plot category and square yardage), Cantonment Board Clifton transfer duties, Section 236K Advance Tax for purchasers, and Section 236C withholding for sellers. Our advisory desk provides an exact, transparent cost-sheet prior to token deposit so there are never hidden transactional surprises.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black overflow-x-hidden pb-24 md:pb-0">
      
      {/* ==================== 1 & 2. LUXURY TUBELIGHT NAVBAR & HERO SECTION ==================== */}
      <HeroSection onPrivateAccess={() => { setAccessErrors({}); setAccessModalOpen(true); }} />


      {/* ==================== 3. ASYMMETRICAL PORTFOLIO (EDITORIAL SPREAD) ==================== */}
      <div id="portfolio" className="scroll-mt-24" />
      <div id="off-plan" className="scroll-mt-24" />
      <section id="showcase" className="relative bg-[#0a0a0a] py-24 sm:py-32 px-5 sm:px-8 lg:px-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header with Category Switchers */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Prime Time Curated Mandates</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-tight">
                Signature Residential Portfolio: <br />
                <span className="italic text-zinc-400">DHA Phase 8 Bungalows & Crescent Bay Flagships</span>
              </h2>
            </div>
            
            <div className="max-w-md">
              <p className="text-zinc-400 text-sm font-light leading-relaxed mb-4">
                Personally inspected and vetted by Nadeem Sulemani. Every estate features verified DHA sub-lease documentation, clear demarcation, and direct owner terms.
              </p>
              
              {/* Category Filters (Sharp architectural tabs) */}
              {/* Category Filters (Quiet luxury tabs with 48px touch targets) */}
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
                    className={`touch-target-48 px-5 py-3 text-xs tracking-wider uppercase transition-all duration-200 rounded-none flex items-center justify-center font-mono ${
                      activeCategory === cat.id
                        ? 'bg-[#D4AF37] text-neutral-950 font-bold shadow-md shadow-[#D4AF37]/20 border border-[#D4AF37]'
                        : 'border border-neutral-800 text-zinc-400 hover:text-white hover:border-amber-500/40 bg-neutral-900/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Showcase Motion Mode Switcher with 48px Touch Targets */}
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Showcase Engine:</span>
                <div className="inline-flex bg-neutral-950 border border-neutral-800 p-1">
                  <button
                    type="button"
                    onClick={() => setShowcaseMode('revolving')}
                    className={`touch-target-48 px-4 py-2.5 text-[11px] uppercase tracking-wider font-medium flex items-center space-x-1.5 transition-all ${
                      showcaseMode === 'revolving'
                        ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Continuous Showroom Motion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowcaseMode('grid')}
                    className={`touch-target-48 px-4 py-2.5 text-[11px] uppercase tracking-wider font-medium flex items-center space-x-1.5 transition-all ${
                      showcaseMode === 'grid'
                        ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Full Grid View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 1. CONTINUOUS REVOLVING PORTFOLIO SHOWCASE ==================== */}
          {showcaseMode === 'revolving' ? (
            <div className="space-y-6">
              {/* Main Revolving Showroom Stage */}
              <div
                className="relative w-full h-[580px] sm:h-[660px] lg:h-[740px] overflow-hidden bg-black border border-neutral-800 group shadow-2xl"
                style={{ contain: 'layout paint' }}
                onMouseEnter={() => setIsRevolvingPaused(true)}
                onMouseLeave={() => setIsRevolvingPaused(false)}
                onTouchStart={() => setIsRevolvingPaused(true)}
                onTouchEnd={() => setIsRevolvingPaused(false)}
              >
                {activeList.map((property, idx) => {
                  const isActive = isMounted ? idx === revolvingIndex : idx === 0;
                  const displayDemand = property.demand 
                    ? (property.demand.toLowerCase().includes('pkr') ? property.demand : `PKR ${property.demand}`)
                    : (property.price || 'Price Upon Application');

                  return (
                    <div
                      key={`revolving-slide-${property.id}-${idx}`}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        isActive
                          ? "opacity-100 z-10 scale-100 pointer-events-auto"
                          : "opacity-0 z-0 scale-[1.03] pointer-events-none"
                      }`}
                      style={{
                        transform: "translateZ(0)",
                        willChange: "opacity, transform",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <Image
                        src={property.image_urls?.[0] || property.imageUrl || '/images/hero-mansion.jpg'}
                        alt={property.title}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1280px) 100vw, 1400px"
                        className="object-cover object-center transform transition-transform duration-[8000ms] ease-out group-hover:scale-105"
                        style={{ 
                          transform: "translateZ(0)",
                          backfaceVisibility: "hidden",
                        }}
                      />

                      {/* Ambient Architectural Vignette Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 opacity-90 pointer-events-none" />

                      {/* Top Verification Badges */}
                      <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
                        <span className="px-3.5 py-1.5 bg-black/85 border border-[#D4AF37]/50 text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold rounded-none">
                          {property.badge || property.tag || 'Verified Mandate'}
                        </span>
                        {property.image_urls && property.image_urls.length > 1 && (
                          <span className="px-3 py-1.5 bg-black/90 border border-amber-500/40 text-[10px] tracking-wider uppercase text-amber-300 font-medium rounded-none flex items-center gap-1.5 shadow-md">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>{property.image_urls.length} PHOTOS</span>
                          </span>
                        )}
                        {typeof property.latitude === 'number' && typeof property.longitude === 'number' ? (
                          <span className="px-3 py-1.5 bg-black/90 border border-emerald-500/40 text-[10px] tracking-wider uppercase text-emerald-400 font-medium rounded-none flex items-center gap-1.5 shadow-md">
                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                            <span>GIS: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-[10px] tracking-wider uppercase text-zinc-300 rounded-none">
                            Est. 1998 Verified
                          </span>
                        )}
                      </div>

                      {/* Top Right Live Motion HUD */}
                      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                        <div className="bg-black/90 backdrop-blur-md border border-neutral-700/80 px-3.5 py-2 text-[10px] tracking-wider font-mono text-zinc-300 flex items-center space-x-2">
                          <span className="text-[#D4AF37] font-bold">
                            MANDATE {isMounted ? revolvingIndex + 1 : 1} / {activeList.length}
                          </span>
                          <span className="text-zinc-600">|</span>
                          {isRevolvingPaused ? (
                            <span className="text-amber-400 flex items-center gap-1 font-medium">
                              <Pause className="w-3 h-3 text-[#D4AF37]" />
                              <span>PAUSED ON HOVER/TOUCH</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>4.5s MOTION ACTIVE</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsRevolvingPaused((prev) => !prev);
                          }}
                          className="touch-target-48 w-10 h-10 min-w-[48px] min-h-[48px] bg-black/85 hover:bg-[#D4AF37] hover:text-black border border-neutral-700 hover:border-[#D4AF37] flex items-center justify-center text-white transition-colors"
                          title={isRevolvingPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
                        >
                          {isRevolvingPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Bottom Overlay Information */}
                      <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 z-20 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-zinc-300 flex items-center text-xs tracking-wider uppercase font-mono">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#D4AF37]" />
                            {property.location}
                          </span>
                          <span className="font-serif text-2xl sm:text-4xl text-[#D4AF37] font-normal">
                            {displayDemand}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
                          {property.title}
                        </h3>

                        {/* Specs Ribbon */}
                        <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-zinc-300 border-t border-neutral-800">
                          <span className="flex items-center space-x-1.5">
                            <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                            <span>{property.size || property.specs?.area || 'Prime Yardage'}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Bed className="w-4 h-4 text-[#D4AF37]" />
                            <span>{property.bedrooms ?? property.specs?.beds ?? 0} Bedrooms</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Bath className="w-4 h-4 text-[#D4AF37]" />
                            <span>{property.bathrooms ?? property.specs?.baths ?? 0} Bathrooms</span>
                          </span>
                          <span className="text-zinc-400">• {property.specs?.views || 'Prime Coastal & Urban Views'}</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <Link
                            href={`/properties/${property.slug || property.id}`}
                            className="touch-target-48 px-6 py-3.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-semibold tracking-wider uppercase transition-all rounded-none inline-flex items-center gap-1.5 shadow-lg"
                          >
                            <span>Explore Property Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>

                          <a
                            href={`https://wa.me/923008286662?text=Inquiry%20regarding%20${encodeURIComponent(property.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="touch-target-48 px-5 py-3.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 text-xs font-medium tracking-wider uppercase transition-colors flex items-center space-x-1.5 rounded-none"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Concierge</span>
                          </a>

                          <a
                            href="tel:+923008286662"
                            className="touch-target-48 px-5 py-3.5 border border-neutral-700 text-zinc-300 hover:text-white hover:border-neutral-500 text-xs font-medium tracking-wider uppercase transition-colors flex items-center space-x-1.5 rounded-none"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Direct Advisor Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Left & Right Chevron Navigation Controls (Enforcing 48px touch targets) */}
                {activeList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevRevolvingSlide}
                      aria-label="Previous property"
                      className="touch-target-48 absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 min-w-[48px] min-h-[48px] bg-black/80 hover:bg-[#D4AF37] hover:text-black text-white border border-neutral-700 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={nextRevolvingSlide}
                      aria-label="Next property"
                      className="touch-target-48 absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 min-w-[48px] min-h-[48px] bg-black/80 hover:bg-[#D4AF37] hover:text-black text-white border border-neutral-700 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Active Slide Indicators / Progress Track */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  {activeList.map((prop, idx) => {
                    const isDotActive = isMounted ? idx === revolvingIndex : idx === 0;
                    return (
                      <button
                        key={`indicator-dot-${prop.id}-${idx}`}
                        type="button"
                        onClick={() => goToRevolvingSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}: ${prop.title}`}
                        className={`h-2.5 transition-all duration-300 rounded-none touch-target-48 flex items-center justify-center p-1 ${
                          isDotActive
                            ? "w-10 bg-[#D4AF37] shadow-sm shadow-[#D4AF37]/50"
                            : "w-4 bg-white/20 hover:bg-white/50"
                        }`}
                      >
                        <span className="sr-only">Slide {idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                  Auto-Cycles Every 4.5s • Hover or Touch to Pause
                </div>
              </div>

              {/* Filmstrip Quick Selector Ribbon */}
              <div className="pt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                  Filmstrip Mandate Ribbon ({activeList.length} Estates Loaded):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {activeList.map((prop, idx) => {
                    const isCardActive = isMounted ? idx === revolvingIndex : idx === 0;
                    return (
                      <button
                        key={`filmstrip-${prop.id}-${idx}`}
                        type="button"
                        onClick={() => goToRevolvingSlide(idx)}
                        className={`text-left p-2 border transition-all duration-200 group overflow-hidden bg-black/60 ${
                          isCardActive
                            ? "border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/15"
                            : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="relative h-20 w-full overflow-hidden mb-2 bg-zinc-900">
                          <Image
                            src={prop.image_urls?.[0] || prop.imageUrl || '/images/hero-mansion.jpg'}
                            alt={prop.title}
                            fill
                            sizes="180px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isCardActive && (
                            <div className="absolute inset-0 bg-[#D4AF37]/20 border border-[#D4AF37] pointer-events-none" />
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-mono px-1 py-0.5 text-zinc-300">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="font-serif text-xs text-white truncate line-clamp-1">{prop.title}</h4>
                        <p className="text-[10px] text-[#D4AF37] font-mono mt-0.5 truncate">{prop.demand ? (prop.demand.toLowerCase().includes('pkr') ? prop.demand : `PKR ${prop.demand}`) : 'POA'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ==================== 2. FULL GRID VIEW ==================== */
            <div>
              {/* Asymmetrical Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Side: Feature Card */}
                <div className={`${secondaryProperties.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col`}>
                  <Link 
                    href={`/properties/${featureProperty.slug || featureProperty.id}`}
                    className="group relative w-full h-[620px] sm:h-[700px] lg:h-[780px] overflow-hidden block border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-2xl rounded-none"
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <Image
                      src={featureProperty.image_urls?.[0] || featureProperty.imageUrl || '/images/hero-mansion.jpg'}
                      alt={featureProperty.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85 opacity-90"></div>

                    <div className="absolute top-6 left-6 z-10 flex flex-wrap items-center gap-2">
                      <span className="px-3.5 py-1.5 bg-black/80 border border-[#D4AF37]/50 text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold rounded-none">
                        {featureProperty.badge || featureProperty.tag || 'Verified Mandate'}
                      </span>
                      {featureProperty.image_urls && featureProperty.image_urls.length > 1 && (
                        <span className="px-3 py-1.5 bg-black/90 border border-amber-500/40 text-[10px] tracking-wider uppercase text-amber-300 font-medium rounded-none flex items-center gap-1.5 shadow-md">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>{featureProperty.image_urls.length} PHOTOS</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/70 border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-200">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-7 sm:p-10 z-10 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-zinc-300 flex items-center text-xs tracking-wider uppercase">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#D4AF37]" />
                          {featureProperty.location}
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37] font-normal">
                          {featureProperty.demand ? (featureProperty.demand.toLowerCase().includes('pkr') ? featureProperty.demand : `PKR ${featureProperty.demand}`) : (featureProperty.price || 'Price on Application')}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl sm:text-4xl font-light text-white leading-snug group-hover:text-amber-100 transition-colors">
                        {featureProperty.title}
                      </h3>

                      <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-zinc-300 border-t border-white/10">
                        <span className="flex items-center space-x-1.5">
                          <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                          <span>{featureProperty.size || featureProperty.specs?.area || 'Prime Area'}</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <Bed className="w-4 h-4 text-[#D4AF37]" />
                          <span>{featureProperty.bedrooms ?? featureProperty.specs?.beds ?? 0} Bedrooms</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <Bath className="w-4 h-4 text-[#D4AF37]" />
                          <span>{featureProperty.bathrooms ?? featureProperty.specs?.baths ?? 0} Bathrooms</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Right Side: Secondary Cards */}
                {secondaryProperties.length > 0 && (
                  <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                    {secondaryProperties.slice(0, 2).map((property) => (
                      <Link 
                        key={property.id}
                        href={`/properties/${property.slug || property.id}`}
                        className="group relative h-[300px] sm:h-[335px] lg:h-[374px] overflow-hidden block border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl rounded-none"
                        style={{ transform: 'translateZ(0)' }}
                      >
                        <Image
                          src={property.image_urls?.[0] || property.imageUrl || '/images/hero-mansion.jpg'}
                          alt={property.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 opacity-90"></div>

                        <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 bg-black/80 border border-[#D4AF37]/40 text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold rounded-none">
                            {property.badge || property.tag || 'Verified Mandate'}
                          </span>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 z-10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 text-[11px]">{property.location}</span>
                            <span className="font-serif text-xl sm:text-2xl text-[#D4AF37]">
                              {property.demand ? (property.demand.toLowerCase().includes('pkr') ? property.demand : `PKR ${property.demand}`) : 'POA'}
                            </span>
                          </div>
                          <h3 className="font-serif text-xl sm:text-2xl font-light text-white leading-snug">{property.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Remaining Grid */}
              {activeList.length > 3 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeList.slice(3).map((prop) => (
                    <Link
                      key={prop.id}
                      href={`/properties/${prop.slug || prop.id}`}
                      className="group overflow-hidden block border border-white/10 bg-zinc-950 hover:border-[#D4AF37]/50 transition-all duration-200 shadow-lg rounded-none"
                    >
                      <div className="relative h-60 w-full overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                        <Image
                          src={prop.image_urls?.[0] || prop.imageUrl || '/images/hero-mansion.jpg'}
                          alt={prop.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">{prop.location}</span>
                          <span className="font-serif text-lg text-[#D4AF37]">
                            {prop.demand ? (prop.demand.toLowerCase().includes('pkr') ? prop.demand : `PKR ${prop.demand}`) : 'POA'}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg text-white font-light line-clamp-1">{prop.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Discreet Verification Strip */}
          <div className="mt-16 p-7 sm:p-8 rounded-none bg-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl text-white">Confidential Off-Market Brokerage Mandates</h4>
                <p className="text-zinc-400 text-xs mt-0.5">High-profile properties transacted with strict non-disclosure protocols across DHA Phases 1–8, Clifton, and Emaar.</p>
              </div>
            </div>
            <button
              onClick={() => { setAccessErrors({}); setAccessModalOpen(true); }}
              className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-xs uppercase tracking-widest font-semibold flex-shrink-0 rounded-none"
            >
              Request Private Access
            </button>
          </div>

        </div>
      </section>


      {/* ==================== 4. THE FOUNDER & HERITAGE (EDITORIAL PROFILE) ==================== */}
      <div id="about" className="scroll-mt-24" />
      <section id="founder" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-12 bg-[#0c0c0d] border-t border-white/[0.08] overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Eyebrow */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-[#D4AF37] inline-block">
              Executive Leadership • Established 1998
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
              Twenty-Seven Years of Direct Principal Advisory in <br />
              <span className="italic font-normal gold-gradient-text">Karachi’s Elite Property Corridors</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-light tracking-wide max-w-lg mx-auto">
              Guided by market integrity, strict confidentiality, and unmatched historical transaction knowledge across DHA Karachi.
            </p>
          </div>

          {/* Magazine-Spread Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Portrait & Founder Badge (Col 5) */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-[4/5] overflow-hidden bg-black border border-white/10 shadow-2xl group rounded-none">
                
                {/* Subtle Gold Frame accent */}
                <div className="absolute inset-3 border border-[#D4AF37]/30 pointer-events-none z-20"></div>

                {/* Founder Cutout Photograph */}
                <div className="relative w-full h-full" style={{ transform: 'translateZ(0)' }}>
                  <Image
                    src="/images/founder-nadeem.png"
                    alt="Nadeem Sulemani — Founder & Principal Advisor of Real Property Prime Time"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover object-top filter brightness-100 contrast-105 transform group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ transform: 'translateZ(0)' }}
                  />
                </div>

                {/* Bottom Fade */}
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

                {/* Overlay Name Tag */}
                <div className="absolute bottom-6 inset-x-6 z-20 text-center">
                  <span className="font-serif text-2xl text-white block">Nadeem Sulemani</span>
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#D4AF37] font-medium block mt-1">
                    Founder & Principal Advisor
                  </span>
                  <span className="text-[10px] text-zinc-400 block tracking-wider mt-0.5">
                    Real Property Prime Time • Est. 1998
                  </span>
                </div>

              </div>

              {/* Direct Founder Access Line */}
              <div className="mt-6 flex items-center space-x-3 bg-black border border-white/10 px-5 py-2.5 rounded-none text-xs text-zinc-300">
                <span className="w-2 h-2 bg-emerald-400"></span>
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
                  "Since founding Real Property Prime Time in 1998, we have built every client relationship upon verifiable facts, absolute discretion, and uncompromising protection of our principals' capital."
                </p>
                <footer className="mt-3 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  — Nadeem Sulemani
                </footer>
              </blockquote>

              {/* Authentic Paragraphs */}
              <div className="space-y-5 text-zinc-300 font-light text-sm sm:text-base leading-relaxed">
                <p>
                  With more than two and a half decades in the Karachi property landscape, <strong className="text-white font-medium">Nadeem Sulemani</strong> represents private family offices, Pakistani expatriates in London, Dubai, and North America, and industrial business leaders seeking blue-chip real estate in DHA and Clifton.
                </p>
                <p>
                  Specializing in <strong className="text-white font-medium">DHA Phase 8 (Zones A–E), Khayaban-e-Ghalib, Khayaban-e-Faisal, Khayaban-e-Ittehad, EMAAR Crescent Bay, and HMR Waterfront</strong>, our advisory focuses strictly on legally verified sub-lease assets with documented title history.
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm">
                  We don’t distribute generic mass-market inventory. Instead, we structure confidential acquisitions, coordinate official DHA transfer protocols, and provide independent valuation benchmarks rooted in current FBR tables and actual on-ground executed transactions.
                </p>
              </div>

              {/* Provenance Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37]">1998</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">Established in Karachi</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-white">27+ Years</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">Unbroken Advisory Track Record</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-2xl sm:text-3xl text-[#D4AF37]">DHA 1–8</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block font-medium">& Waterfront Specialist</span>
                </div>
              </div>

              {/* Consultation Actions */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#valuation"
                  className="px-7 py-3.5 bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase hover:bg-[#e0be49] transition-all rounded-none shadow-lg"
                >
                  Schedule Private Valuation
                </a>
                <a
                  href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20would%20like%20to%20schedule%20a%20private%20property%20advisory%20session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 border border-white/20 text-white text-xs font-medium tracking-wider uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center space-x-2 rounded-none bg-black/40"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Message Nadeem Directly</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================== 5. SUBSTANTIVE ADVISORY FAQ SECTION ==================== */}
      <section id="advisory-faqs" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 bg-[#0a0a0a] border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-[#D4AF37]">
              Legal, Title & Tax Intelligence
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white tracking-tight">
              Essential Advisory Protocols for High-Net-Worth Principals
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
              Clear answers to the legal, procedural, and tax questions that serious investors, sellers, and expatriates navigate in Karachi.
            </p>
          </div>

          {/* Accordion Container */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={faq.q || `faq-${idx}`} 
                  className="border border-white/10 bg-black/60 transition-colors duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-lg sm:text-xl text-white font-normal leading-snug">
                      {faq.q}
                    </span>
                    <span className={`p-1.5 border border-white/20 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#D4AF37] border-[#D4AF37]' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-zinc-300 text-sm leading-relaxed border-t border-white/[0.08] font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ==================== 6. PRIVATE ADVISORY MANDATE DESK (VALUATION & BRIEFINGS) ==================== */}
      <PrivateAdvisoryDesk />


      {/* ==================== 7. ARCHITECTURAL LUXURY FOOTER ==================== */}
      <footer className="bg-black py-16 sm:py-20 px-5 sm:px-8 lg:px-12 border-t border-white/10 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* Col 1 & 2: Clickable Brand Logo & Provenance */}
            <div className="lg:col-span-2 space-y-4">
              <a 
                href="#home" 
                aria-label="Real Property Prime Time Homepage"
                className="group inline-block focus:outline-none"
              >
                <span className="font-cinzel text-xl sm:text-2xl tracking-[0.22em] text-[#D4AF37] block group-hover:brightness-125 transition-all">
                  REAL PROPERTY PRIME TIME
                </span>
                <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-500 font-sans block mt-1">
                  Karachi Luxury Real Estate Advisory • Est. 1998
                </span>
              </a>

              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
                Specialized brokerage established in 1998 under the leadership of Nadeem Sulemani. Serving discerning families and private investors with verified DHA Phase 8 and waterfront assets.
              </p>

              <div className="text-[11px] text-zinc-400 space-y-1 pt-1">
                <p>• Principal: Nadeem Sulemani (27+ Yrs Karachi Experience)</p>
                <p>• Corridors: DHA Phases 1–8, Clifton, Emaar Crescent Bay, HMR</p>
              </div>
            </div>

            {/* Col 3: Verified Navigation Links */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Navigation
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#home" className="hover:text-[#D4AF37] transition-colors">Home</a></li>
                <li><a href="#showcase" onClick={() => setActiveCategory('waterfront')} className="hover:text-[#D4AF37] transition-colors">Off-Plan & Waterfront</a></li>
                <li><a href="#showcase" onClick={() => setActiveCategory('all')} className="hover:text-[#D4AF37] transition-colors">Signature Portfolio</a></li>
                <li><a href="#founder" className="hover:text-[#D4AF37] transition-colors">About Us (Leadership)</a></li>
                <li><a href="#advisory-faqs" className="hover:text-[#D4AF37] transition-colors">Legal & Tax FAQ</a></li>
                <li><a href="#valuation" className="hover:text-[#D4AF37] transition-colors">Schedule Valuation</a></li>
              </ul>
            </div>

            {/* Col 4: Featured Verified Assets */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Featured Assets
              </h5>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <button onClick={() => openEnquiryFor('EMAAR Pearl Tower 2')} className="text-left hover:text-[#D4AF37] transition-colors">
                    EMAAR Pearl Tower 2
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('500 Yards Ultra-Luxury Bungalow DHA Phase 8')} className="text-left hover:text-[#D4AF37] transition-colors">
                    500 Yds Khayaban-e-Ghalib
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('800 Yards Coastal Villa Khayaban-e-Faisal')} className="text-left hover:text-[#D4AF37] transition-colors">
                    800 Yds Khayaban-e-Faisal
                  </button>
                </li>
                <li>
                  <button onClick={() => openEnquiryFor('1,000 Yards Luxury Bungalow DHA Phase 7/8')} className="text-left hover:text-[#D4AF37] transition-colors">
                    1,000 Yds Khayaban-e-Ittehad
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Clickable Direct Contact & Email */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold">
                Direct Contact
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
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-white/15 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors text-[11px] rounded-none"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/real_property_prime_time"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-white/15 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors text-[11px] rounded-none"
                >
                  Instagram
                </a>
              </div>
            </div>

          </div>

          {/* Dynamic Copyright Year */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <p>© {new Date().getFullYear()} Real Property Prime Time. All Rights Reserved.</p>
            <p className="tracking-widest uppercase">
              Karachi Luxury Real Estate Advisory • Discretion • Verifiable Provenance • Results
            </p>
          </div>

        </div>
      </footer>


      {/* ==================== FLOATING WHATSAPP ACTION (DESKTOP) ==================== */}
      <aside aria-label="Direct Advisory Desk" className="hidden md:flex fixed bottom-6 right-6 z-40 items-center">
        <a
          href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20interested%20in%20Karachi%20prime%20properties"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 bg-[#0e0e12]/90 hover:bg-[#15151a] px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] transition-all duration-300 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] backdrop-blur-xl"
          aria-label="Direct WhatsApp Advisory with Nadeem Sulemani"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold tracking-wider uppercase font-sans text-neutral-200 group-hover:text-[#D4AF37] transition-colors">
            Advisory Desk
          </span>
        </a>
      </aside>

      {/* ==================== PERSISTENT MOBILE ACTION BAR (< 768px Viewports) ==================== */}
      <aside 
        aria-label="Direct Mobile Concierge" 
        className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-neutral-950/90 backdrop-blur-lg border-t border-amber-500/30 md:hidden flex items-center gap-2.5 shadow-2xl"
      >
        <a
          href="tel:+923008286662"
          className="touch-target-48 px-4 py-3 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 rounded-lg flex-shrink-0 transition-colors"
          title="Direct Telephone Concierge"
        >
          <Phone className="w-4 h-4 text-[#D4AF37]" />
          <span>CALL</span>
        </a>

        <a
          href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20inquiring%20about%20Karachi%20prime%20luxury%20estates"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target-48 flex-1 py-3 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 rounded-lg shadow-lg text-center transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WHATSAPP ADVISORY</span>
        </a>
      </aside>


      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toastMessage && (
        <aside aria-label="Notifications" className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-[#161618] border border-[#D4AF37] text-white px-6 py-3.5 shadow-2xl flex items-center space-x-3 rounded-none">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium tracking-wide">{toastMessage}</span>
        </aside>
      )}


      {/* ==================== MODAL: ENQUIRE ==================== */}
      {enquireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#111] border border-white/20 p-8 sm:p-10 shadow-2xl space-y-6 rounded-none">
            
            <button 
              onClick={() => setEnquireModalOpen(false)}
              className="touch-target-48 absolute top-6 right-6 w-12 h-12 flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
              aria-label="Close modal"
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
                Your dossier request is routed directly to Nadeem Sulemani and our senior brokerage desk.
              </p>
            </div>

            <form onSubmit={handleEnquireSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Full Legal Name *</label>
                <input 
                  type="text" 
                  required
                  value={enquiryForm.name}
                  onChange={(e) => {
                    setEnquiryForm({ ...enquiryForm, name: e.target.value });
                    if (enquiryErrors.name) setEnquiryErrors({ ...enquiryErrors, name: undefined });
                  }}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none"
                />
                {enquiryErrors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {enquiryErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={enquiryForm.email}
                    onChange={(e) => {
                      setEnquiryForm({ ...enquiryForm, email: e.target.value });
                      if (enquiryErrors.email) setEnquiryErrors({ ...enquiryErrors, email: undefined });
                    }}
                    placeholder="name@domain.com"
                    className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none"
                  />
                  {enquiryErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {enquiryErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Phone / WhatsApp *</label>
                  <input 
                    type="tel" 
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => {
                      setEnquiryForm({ ...enquiryForm, phone: e.target.value });
                      if (enquiryErrors.phone) setEnquiryErrors({ ...enquiryErrors, phone: undefined });
                    }}
                    placeholder="+92 300 1234567"
                    className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none font-mono"
                  />
                  {enquiryErrors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {enquiryErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Acquisition Objective</label>
                <textarea 
                  rows={3}
                  value={enquiryForm.interest}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, interest: e.target.value })}
                  placeholder="Specify particular square yardage, preferred street, or private viewing timeline..."
                  className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] resize-none rounded-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="touch-target-48 w-full py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50 rounded-none shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center"
              >
                {isSubmitting ? 'Transmitting Request...' : 'Submit Confidential Inquiry'}
              </button>
            </form>

          </div>
        </div>
      )}


      {/* ==================== MODAL: VIP ACCESS ==================== */}
      {accessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#111] border border-[#D4AF37]/50 p-8 sm:p-10 shadow-2xl space-y-6 rounded-none">
            
            <button 
              onClick={() => setAccessModalOpen(false)}
              className="touch-target-48 absolute top-6 right-6 w-12 h-12 flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-1">
                Verified Principal Registry
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Request Private Access Credentials
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Gain verified access to unlisted off-market opportunities across DHA Phase 8, Clifton, and Emaar Crescent Bay.
              </p>
            </div>

            <form onSubmit={handleAccessSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Principal / Representative Name *</label>
                <input 
                  type="text" 
                  required
                  value={accessForm.principalName}
                  onChange={(e) => {
                    setAccessForm({ ...accessForm, principalName: e.target.value });
                    if (accessErrors.principalName) setAccessErrors({ ...accessErrors, principalName: undefined });
                  }}
                  placeholder="e.g. Asad Hashmi"
                  className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none"
                />
                {accessErrors.principalName && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {accessErrors.principalName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Representing Family Office / Entity</label>
                <input 
                  type="text" 
                  value={accessForm.entity}
                  onChange={(e) => setAccessForm({ ...accessForm, entity: e.target.value })}
                  placeholder="Private Principal / Investment Entity (Optional)"
                  className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Private Email *</label>
                  <input 
                    type="email" 
                    required
                    value={accessForm.email}
                    onChange={(e) => {
                      setAccessForm({ ...accessForm, email: e.target.value });
                      if (accessErrors.email) setAccessErrors({ ...accessErrors, email: undefined });
                    }}
                    placeholder="principal@domain.com"
                    className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none"
                  />
                  {accessErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {accessErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1.5">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={accessForm.phone}
                    onChange={(e) => {
                      setAccessForm({ ...accessForm, phone: e.target.value });
                      if (accessErrors.phone) setAccessErrors({ ...accessErrors, phone: undefined });
                    }}
                    placeholder="+92 300 0000000"
                    className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] rounded-none font-mono"
                  />
                  {accessErrors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {accessErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start space-x-2 text-[11px] text-zinc-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={accessForm.agreeNda}
                    onChange={(e) => {
                      setAccessForm({ ...accessForm, agreeNda: e.target.checked });
                      if (accessErrors.agreeNda) setAccessErrors({ ...accessErrors, agreeNda: undefined });
                    }}
                    className="mt-0.5 rounded-none bg-black border-white/30 text-[#D4AF37] focus:ring-0" 
                  />
                  <span>I acknowledge that off-market property dossiers are governed by strict bilateral non-disclosure protocols.</span>
                </label>
                {accessErrors.agreeNda && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {accessErrors.agreeNda}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="touch-target-48 w-full py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50 rounded-none shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Authorize & Request Access Keycode'}
              </button>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}
