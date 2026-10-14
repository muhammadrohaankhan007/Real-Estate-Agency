'use client';

import React, { useState, useEffect } from 'react';
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
  Camera
} from 'lucide-react';

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
  features?: string[];
  isFeature?: boolean;
  tag?: string;
  badge?: string;
  created_at?: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Modals state
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('The DHA Phase 8 Collection');
  
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
              features: item.features || [],
              isFeature: item.isFeature ?? (index === 0),
              tag: item.tag || 'Flagship Residence',
              badge: item.badge || 'Verified Mandate',
              created_at: item.created_at,
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

  const displayList = properties.length > 0 ? properties : [defaultFeature, defaultEmaar, defaultIttehad];
  
  const filteredProperties = activeCategory === 'all' 
    ? displayList 
    : displayList.filter(p => p.category === activeCategory || (activeCategory === 'waterfront' && String(p.id).toLowerCase().includes('emaar')));

  const activeList = filteredProperties.length > 0 ? filteredProperties : displayList;
  const featureProperty = activeList.find(p => p.isFeature) || activeList[0] || defaultFeature;
  const secondaryProperties = activeList.filter(p => p.id !== featureProperty.id);

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
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* ==================== 1. EDITORIAL NAVBAR ==================== */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-md ${
          scrolled ? 'bg-black/95 border-b border-white/10 shadow-2xl py-4' : 'bg-black/75 border-b border-white/[0.08] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between relative">
          
          {/* Clickable Brand Wordmark */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="#home" 
              aria-label="Real Property Prime Time Homepage" 
              className="group flex flex-col text-left focus:outline-none"
            >
              <span className="font-cinzel text-lg sm:text-xl md:text-[22px] font-semibold tracking-[0.24em] text-[#D4AF37] transition-all duration-300 group-hover:brightness-125">
                REAL PROPERTY PRIME TIME
              </span>
              <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-400 font-sans mt-0.5 opacity-90 group-hover:text-[#D4AF37] transition-colors">
                Est. 1998 • Karachi Luxury Advisory
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            <a href="#home" className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#showcase" onClick={() => setActiveCategory('waterfront')} className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              Off-Plan & Waterfront
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#showcase" onClick={() => setActiveCategory('all')} className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              Portfolio
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#founder" className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#advisory-faqs" className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              Advisory FAQ
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a href="#valuation" className="text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors duration-200 relative py-1 group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Action Hub (Sharp architectural buttons, no soft bubbly corners) */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-400 border border-amber-500/50 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-black px-3.5 py-2 rounded-none transition-all duration-200 shadow-sm"
              title="Secure Property Management Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN COMMAND</span>
            </Link>
            <a
              href="#valuation"
              className="text-[11px] font-medium tracking-[0.18em] uppercase text-zinc-300 hover:text-[#D4AF37] transition-colors px-3 py-2"
            >
              Schedule Valuation
            </a>
            <button 
              onClick={() => { setAccessErrors({}); setAccessModalOpen(true); }}
              className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] px-4 py-2 rounded-none transition-all duration-200 hover:bg-[#D4AF37]/10"
            >
              <Lock className="w-3 h-3 text-[#D4AF37]" />
              <span>Private Access</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-[#D4AF37] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl px-6 py-6 transition-all duration-200">
            <div className="flex flex-col space-y-4 text-center">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Home</a>
              <a href="#showcase" onClick={() => { setActiveCategory('waterfront'); setMobileMenuOpen(false); }} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Off-Plan & Waterfront</a>
              <a href="#showcase" onClick={() => { setActiveCategory('all'); setMobileMenuOpen(false); }} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Property Listings</a>
              <a href="#founder" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">About Us (Leadership)</a>
              <a href="#advisory-faqs" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Advisory & Legal FAQ</a>
              <a href="#valuation" onClick={() => setMobileMenuOpen(false)} className="text-[12px] font-medium tracking-[0.25em] uppercase text-zinc-200 hover:text-[#D4AF37] py-2">Contact Us</a>
              
              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 font-semibold text-xs tracking-wider uppercase text-center rounded-none transition-colors flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ADMIN COMMAND</span>
                </Link>
                <a 
                  href="#valuation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase text-center rounded-none"
                >
                  Schedule Private Valuation
                </a>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setAccessErrors({}); setAccessModalOpen(true); }}
                  className="w-full py-3 border border-[#D4AF37]/50 text-[#D4AF37] font-medium text-xs tracking-wider uppercase rounded-none"
                >
                  Request Private Access
                </button>
              </div>
            </div>
          </div>
        )}
      </header>


      {/* ==================== 2. THE HERO SECTION ==================== */}
      <section id="home" className="relative min-h-screen w-full flex items-end justify-start overflow-hidden bg-black">
        
        {/* Hero Background Image Container (Edge-to-Edge Optimized Visual) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-mansion.jpg"
            alt="Signature Architectural Mansion in DHA Phase 8 Karachi"
            fill
            priority
            className="object-cover object-center animate-subtle-zoom will-change-transform filter brightness-90"
          />

          {/* Dark Architectural Shading */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/35"></div>
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/85 via-black/40 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-full lg:w-4/5 bg-gradient-to-r from-black/90 via-black/55 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-20 lg:pb-24 pt-32 sm:pt-40 flex flex-col justify-end">
          
          <div className="max-w-4xl space-y-6 sm:space-y-7">
            
            {/* Heritage Coordinates */}
            <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 bg-black/80 border border-white/15 px-4 py-2 rounded-none text-xs text-zinc-300">
              <span className="inline-block w-2 h-2 bg-[#D4AF37]"></span>
              <span className="font-medium tracking-[0.22em] uppercase text-[10px] sm:text-[11px] text-[#D4AF37]">Est. 1998 • Karachi Luxury Advisory</span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="text-[10px] sm:text-[11px] text-zinc-300 tracking-wider">DHA Phases 1–8 • Clifton • Emaar Crescent Bay</span>
            </div>

            {/* Substantive Headline (No 3-word slogan) */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-light leading-[1.08] tracking-tight text-white drop-shadow-2xl">
                The Definitive Portfolio of Architectural Estates Across <br className="hidden sm:inline" />
                <span className="italic font-normal gold-gradient-text">DHA Phase 8 and Karachi Coastline</span>
              </h1>
              
              <p className="font-sans text-base sm:text-lg md:text-xl text-zinc-300 font-light tracking-wide max-w-3xl leading-relaxed">
                Direct principal representation for Karachi’s finest 500 & 1,000 square yard residential estates, waterfront apartments, and verified commercial positions.
              </p>

              <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed max-w-2xl border-l-2 border-[#D4AF37] pl-4 py-1">
                Founded and led by Nadeem Sulemani since 1998. Providing complete discretion, verified title diligence, and private transaction execution for discerning buyers, sellers, and expatriate family offices.
              </p>
            </div>

            {/* CTAs (Sharp architectural buttons) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
              
              <a
                href="#showcase"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs sm:text-sm tracking-[0.18em] uppercase transition-all duration-200 hover:bg-[#e0be49] rounded-none shadow-lg"
              >
                <span>Request Architectural Dossier</span>
                <ChevronRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="#valuation"
                className="group inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white font-medium text-xs sm:text-sm tracking-[0.18em] uppercase bg-black/40 transition-all duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-none"
              >
                <Calendar className="mr-2.5 w-4 h-4 text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                <span>Schedule Confidential Valuation</span>
              </a>

              <a
                href="https://wa.me/923008286662?text=Hello%20Real%20Property%20Prime%20Time%2C%20I%20am%20inquiring%20about%20your%20luxury%20listings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 border border-emerald-500/40 text-emerald-400 font-medium text-xs tracking-wider uppercase bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400 transition-all rounded-none"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Direct WhatsApp Advisory Desk</span>
              </a>

            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/[0.12] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Market Provenance</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">Established 1998 (27+ Years)</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Primary Corridor</span>
              <span className="font-serif text-xl sm:text-2xl text-[#D4AF37] font-normal mt-1 block">DHA Phase 8 (Zones A–E)</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Waterfront Desk</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">EMAAR Crescent Bay & HMR</span>
            </div>
            <div>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-medium">Confidentiality Protocol</span>
              <span className="font-serif text-xl sm:text-2xl text-white font-normal mt-1 block">Bilateral NDA Protection</span>
            </div>
          </div>

        </div>

      </section>


      {/* ==================== 3. ASYMMETRICAL PORTFOLIO (EDITORIAL SPREAD) ==================== */}
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
                    className={`px-4 py-2 text-xs tracking-wider uppercase transition-all duration-200 rounded-none ${
                      activeCategory === cat.id
                        ? 'bg-[#D4AF37] text-neutral-950 font-semibold shadow-md'
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
            
            {/* Left Side: Massive Vertical Feature Card */}
            <div className={`${secondaryProperties.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col`}>
              <Link 
                href={`/properties/${featureProperty.slug || featureProperty.id}`}
                className="group relative w-full h-[620px] sm:h-[700px] lg:h-[780px] overflow-hidden block border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-2xl rounded-none"
              >
                <Image
                  src={featureProperty.image_urls?.[0] || featureProperty.imageUrl || '/images/hero-mansion.jpg'}
                  alt={featureProperty.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85 opacity-90"></div>

                {/* Top Badges */}
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
                  <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-[10px] tracking-wider uppercase text-zinc-300 rounded-none">
                    Est. 1998 Verified
                  </span>
                </div>

                {/* Top Right Action Arrow */}
                <div className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/70 border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-200">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                {/* Bottom Overlay Info */}
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

                  {/* Specs */}
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
                    <span className="text-zinc-400">• {featureProperty.specs?.views || 'Curated Panorama'}</span>
                  </div>

                  {/* Interactive Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <span
                      className="px-5 py-2.5 bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase group-hover:bg-white transition-colors rounded-none inline-flex items-center gap-1.5"
                    >
                      <span>Explore Property Dossier</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <a
                      href={`https://wa.me/923008286662?text=Inquiry%20regarding%20${encodeURIComponent(featureProperty.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 border border-emerald-500/40 text-emerald-400 text-xs font-medium tracking-wider uppercase hover:bg-emerald-950/30 transition-colors flex items-center space-x-1.5 rounded-none z-20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Concierge</span>
                    </a>
                    <a
                      href="tel:+923008286662"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2.5 border border-white/20 text-zinc-300 text-xs font-medium tracking-wider uppercase hover:text-white hover:border-white/40 transition-colors flex items-center space-x-1.5 rounded-none z-20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Principal Advisor</span>
                    </a>
                  </div>

                </div>
              </Link>
            </div>

            {/* Right Side (Col 5): Two Stacked Horizontal Showcase Cards */}
            {secondaryProperties.length > 0 && (
              <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                
                {secondaryProperties.slice(0, 2).map((property) => (
                  <Link 
                    key={property.id}
                    href={`/properties/${property.slug || property.id}`}
                    className="group relative h-[300px] sm:h-[335px] lg:h-[374px] overflow-hidden block border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl rounded-none"
                  >
                    <Image
                      src={property.image_urls?.[0] || property.imageUrl || '/images/hero-mansion.jpg'}
                      alt={property.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 opacity-90"></div>

                    {/* Badges */}
                    <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-black/80 border border-[#D4AF37]/40 text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold rounded-none">
                        {property.badge || property.tag || 'Verified Mandate'}
                      </span>
                      {property.image_urls && property.image_urls.length > 1 && (
                        <span className="px-2.5 py-1 bg-black/90 border border-amber-500/40 text-[9px] tracking-wider uppercase text-amber-300 font-medium rounded-none flex items-center gap-1 shadow-md">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>{property.image_urls.length} PHOTOS</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-5 right-5 z-10 w-9 h-9 bg-black/70 border border-white/15 flex items-center justify-center text-white group-hover:text-black group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-200">
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
                          {property.demand ? (property.demand.toLowerCase().includes('pkr') ? property.demand : `PKR ${property.demand}`) : (property.price || 'Price on Application')}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-light text-white leading-snug group-hover:text-amber-100 transition-colors">
                        {property.title}
                      </h3>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-300 border-t border-white/10">
                        <span className="flex items-center space-x-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{property.size || property.specs?.area || 'Prime Area'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Bed className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{property.bedrooms ?? property.specs?.beds ?? 0} Beds</span>
                        </span>
                        <span className="text-zinc-400">• {property.specs?.views || 'Prime View'}</span>
                      </div>

                      <div className="pt-2 flex items-center space-x-4">
                        <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] group-hover:underline font-medium inline-flex items-center gap-1">
                          <span>View Full Dossier →</span>
                        </span>
                        <span className="text-zinc-600">|</span>
                        <a
                          href={`https://wa.me/923008286662?text=Inquiry%20regarding%20${encodeURIComponent(property.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] uppercase tracking-wider text-emerald-400 hover:underline font-medium z-20"
                        >
                          WhatsApp Desk
                        </a>
                      </div>
                    </div>
                  </Link>
                ))}

              </div>
            )}

          </div>

          {/* Full Grid of Remaining Properties */}
          {activeList.length > 3 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeList.slice(3).map((prop) => (
                <Link
                  key={prop.id}
                  href={`/properties/${prop.slug || prop.id}`}
                  className="group overflow-hidden block border border-white/10 bg-zinc-950 hover:border-[#D4AF37]/50 transition-all duration-200 shadow-lg rounded-none"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={prop.image_urls?.[0] || prop.imageUrl || '/images/hero-mansion.jpg'}
                      alt={prop.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-black/80 border border-[#D4AF37]/40 text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold rounded-none">
                        {prop.badge || prop.tag || 'Verified Mandate'}
                      </span>
                      {prop.image_urls && prop.image_urls.length > 1 && (
                        <span className="px-2 py-0.5 bg-black/90 border border-amber-500/40 text-[9px] tracking-wider uppercase text-amber-300 font-medium rounded-none flex items-center gap-1 shadow-md">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>{prop.image_urls.length} PHOTOS</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{prop.location}</span>
                      <span className="font-serif text-lg text-[#D4AF37]">
                        {prop.demand ? (prop.demand.toLowerCase().includes('pkr') ? prop.demand : `PKR ${prop.demand}`) : (prop.price || 'Price on Application')}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg text-white font-light line-clamp-1">{prop.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 border-t border-white/10 pt-3">
                      <span>{prop.size || prop.specs?.area || 'Prime Area'}</span>
                      <span>• {prop.bedrooms ?? prop.specs?.beds ?? 0} Beds</span>
                      <span>• {prop.bathrooms ?? prop.specs?.baths ?? 0} Baths</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider text-[#D4AF37] group-hover:underline font-medium">
                        View Dossier →
                      </span>
                      <a
                        href={`https://wa.me/923008286662?text=Inquiry%20for%20${encodeURIComponent(prop.title)}`}
                        className="text-xs text-emerald-400 hover:underline z-20"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        WhatsApp Desk
                      </a>
                    </div>
                  </div>
                </Link>
              ))}
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
                <div className="relative w-full h-full">
                  <Image
                    src="/images/founder-nadeem.png"
                    alt="Nadeem Sulemani — Founder & Principal Advisor of Real Property Prime Time"
                    fill
                    className="object-cover object-top filter brightness-100 contrast-105 transform group-hover:scale-[1.02] transition-transform duration-500"
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
                  key={idx} 
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


      {/* ==================== 6. CONFIDENTIAL MANDATE DESK (VALUATION & BRIEFINGS) ==================== */}
      <section id="valuation" className="relative py-28 sm:py-36 px-5 sm:px-8 border-t border-white/[0.08] bg-[#0c0c0d]">
        
        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="bg-[#121214] p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl rounded-none">
            
            {/* Header Content */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37]">
                <Award className="w-3.5 h-3.5" />
                <span>Private Advisory Mandate Desk</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
                Commission a Confidential Valuation Assessment for Your Prime Residence
              </h2>

              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">
                Backed by active ready buyers, authentic historical transaction data, and twenty-seven years of reputation in Karachi. We provide precise property assessments and private marketing strategies for discerning owners.
              </p>

              {/* Mode Toggle Tabs (Sharp architectural buttons) */}
              <div className="inline-flex p-1 bg-black border border-white/10 mt-4 rounded-none">
                <button
                  type="button"
                  onClick={() => setCaptureTab('valuation')}
                  className={`px-5 py-2 text-xs uppercase tracking-wider transition-all duration-200 rounded-none ${
                    captureTab === 'valuation'
                      ? 'bg-[#D4AF37] text-neutral-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Schedule Valuation
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureTab('briefing')}
                  className={`px-5 py-2 text-xs uppercase tracking-wider transition-all duration-200 rounded-none ${
                    captureTab === 'briefing'
                      ? 'bg-[#D4AF37] text-neutral-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Private Briefings
                </button>
              </div>
            </div>

            {/* TAB 1: VALUATION FORM */}
            {captureTab === 'valuation' && (
              <form onSubmit={handleValuationSubmit} className="mt-10 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={valuationForm.ownerName}
                      onChange={(e) => {
                        setValuationForm({ ...valuationForm, ownerName: e.target.value });
                        if (valuationErrors.ownerName) setValuationErrors({ ...valuationErrors, ownerName: undefined });
                      }}
                      placeholder="e.g. Tariq Mansoor"
                      className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
                    />
                    {valuationErrors.ownerName && (
                      <p className="text-red-400 text-xs flex items-center pt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {valuationErrors.ownerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Direct Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={valuationForm.phone}
                      onChange={(e) => {
                        setValuationForm({ ...valuationForm, phone: e.target.value });
                        if (valuationErrors.phone) setValuationErrors({ ...valuationErrors, phone: undefined });
                      }}
                      placeholder="+92 300 1234567"
                      className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all font-mono rounded-none"
                    />
                    {valuationErrors.phone && (
                      <p className="text-red-400 text-xs flex items-center pt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {valuationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Location / Phase
                    </label>
                    <select
                      value={valuationForm.propertyLocation}
                      onChange={(e) => setValuationForm({ ...valuationForm, propertyLocation: e.target.value })}
                      className="w-full bg-black text-white text-sm px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
                    >
                      <option value="DHA Phase 8 (Zone A)">DHA Phase 8 (Zone A)</option>
                      <option value="DHA Phase 8 (Zone B Waterfront)">DHA Phase 8 (Zone B Waterfront)</option>
                      <option value="DHA Phase 8 (Khayaban-e-Ghalib)">DHA Phase 8 (Khayaban-e-Ghalib)</option>
                      <option value="EMAAR Crescent Bay">EMAAR Crescent Bay</option>
                      <option value="DHA Phase 6 (Main Avenue)">DHA Phase 6 (Main Avenue)</option>
                      <option value="DHA Phase 7 / Khayaban-e-Ittehad">DHA Phase 7 / Khayaban-e-Ittehad</option>
                      <option value="DHA Phase 5">DHA Phase 5</option>
                      <option value="Clifton (Blocks 1–9)">Clifton (Blocks 1–9)</option>
                      <option value="HMR Waterfront">HMR Waterfront</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Property Type
                    </label>
                    <select
                      value={valuationForm.propertyType}
                      onChange={(e) => setValuationForm({ ...valuationForm, propertyType: e.target.value })}
                      className="w-full bg-black text-white text-sm px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
                    >
                      <option value="Luxury Bungalow">Luxury Bungalow</option>
                      <option value="Waterfront Apartment">Waterfront Apartment</option>
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Commercial Building">Commercial Building</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                      Plot / Unit Size
                    </label>
                    <input
                      type="text"
                      value={valuationForm.sizeDetails}
                      onChange={(e) => setValuationForm({ ...valuationForm, sizeDetails: e.target.value })}
                      placeholder="e.g. 500 Yds / 1,000 Yds"
                      className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3.5 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Confidential Objectives & Timing
                  </label>
                  <textarea
                    rows={3}
                    value={valuationForm.notes}
                    onChange={(e) => setValuationForm({ ...valuationForm, notes: e.target.value })}
                    placeholder="Specify architectural condition, desired sale timeline, or non-disclosure requirements..."
                    className="w-full bg-black text-white placeholder-zinc-600 text-sm px-4 py-3 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all resize-none rounded-none"
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
                    className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 rounded-none"
                  >
                    <span>{isValuationSubmitting ? 'Transmitting Request...' : 'Submit Valuation Mandate'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}

            {/* TAB 2: PRIVATE BRIEFINGS */}
            {captureTab === 'briefing' && (
              <div className="mt-10 max-w-lg mx-auto space-y-6 text-center">
                <p className="text-zinc-400 text-sm font-light">
                  Direct dispatches on newly listed off-market villas, EMAAR releases, and DHA Phase 8 land movements transmitted strictly to verified recipients.
                </p>

                <form onSubmit={handleBriefingSubmit} className="pt-2">
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={briefingEmail}
                      onChange={(e) => {
                        setBriefingEmail(e.target.value);
                        setBriefingError(null);
                      }}
                      placeholder="Enter confidential email address"
                      className="w-full bg-black text-white placeholder-zinc-500 text-sm sm:text-base pl-5 pr-36 py-4 border border-white/15 focus:outline-none focus:border-[#D4AF37] transition-all rounded-none"
                    />
                    <button
                      type="submit"
                      disabled={isBriefingSubmitting}
                      className="absolute right-1 px-5 py-3 bg-[#D4AF37] text-neutral-950 hover:bg-[#e0be49] transition-all flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase disabled:opacity-50 rounded-none"
                    >
                      <span>{isBriefingSubmitting ? 'Sending...' : 'Subscribe'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {briefingError && (
                    <p className="text-red-400 text-xs text-left mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {briefingError}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500 mt-3 font-light">
                    Direct dispatches from Nadeem Sulemani • Zero spam • Unsubscribe anytime
                  </p>
                </form>

                <div className="pt-4 flex items-center justify-center space-x-2 text-xs text-zinc-400">
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


      {/* ==================== FLOATING WHATSAPP ACTION (SHARP LUXURY ACCENT) ==================== */}
      <aside aria-label="Direct Advisory Desk" className="fixed bottom-6 right-6 z-40 flex items-center space-x-3">
        <a
          href="https://wa.me/923008286662?text=Hello%20Nadeem%20Sulemani%2C%20I%20am%20interested%20in%20Karachi%20prime%20properties"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-3 shadow-2xl transition-all duration-200 rounded-none border border-emerald-500/50"
          aria-label="Direct WhatsApp Advisory with Nadeem Sulemani"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">
            WhatsApp Advisory Desk
          </span>
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
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors"
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
                className="w-full py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50 rounded-none"
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
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors"
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
                className="w-full py-4 bg-[#D4AF37] text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-[#e0be49] transition-all disabled:opacity-50 rounded-none"
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
