import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Share2, 
  CheckCircle2,
  Building2,
  Compass,
  Sparkles
} from 'lucide-react';
import GalleryViewer from './GalleryViewer';
import PropertyGisMap from '@/components/PropertyGisMap';

// Enforce zero-cache directives
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Property {
  id: number;
  title: string;
  slug: string;
  category?: string | null;
  floor_number?: string | null;
  demand: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size: string | null;
  description: string | null;
  image_urls: string[];
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProperty(slugOrId: string): Promise<Property | null> {
  try {
    // 1. Try matching by slug
    const { data: propBySlug } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slugOrId)
      .maybeSingle();

    if (propBySlug) return propBySlug as Property;

    // 2. Fallback matching by numeric ID if slug is not found or is numeric
    const numericId = Number(slugOrId);
    if (!isNaN(numericId)) {
      const { data: propById } = await supabase
        .from('properties')
        .select('*')
        .eq('id', numericId)
        .maybeSingle();

      if (propById) return propById as Property;
    }

    return null;
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const property = await getProperty(params.slug);
  if (!property) {
    return {
      title: 'Property Not Found | Real Property Prime Time',
    };
  }

  const primaryImage = property.image_urls?.[0] || '/images/hero-mansion.jpg';
  const priceDisplay = property.demand
    ? property.demand.toLowerCase().includes('pkr')
      ? property.demand
      : `PKR ${property.demand}`
    : 'Price on Application';

  return {
    title: `${property.title} | ${priceDisplay} | Real Property Prime Time`,
    description:
      property.description?.slice(0, 160) ||
      `Ultra-luxury residence in ${property.location}. Curated advisory by Nadeem Sulemani.`,
    openGraph: {
      title: `${property.title} — ${property.location}`,
      description: property.description?.slice(0, 160) || `Exclusive mandate: ${priceDisplay}`,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const property = await getProperty(params.slug);

  if (!property) {
    notFound();
  }

  const images = property.image_urls && property.image_urls.length > 0
    ? property.image_urls
    : ['/images/hero-mansion.jpg'];

  const formattedDemand = property.demand
    ? property.demand.toLowerCase().includes('pkr')
      ? property.demand
      : `PKR ${property.demand}`
    : 'Price Upon Request';

  // Pre-populated WhatsApp concierge message telemetry
  const waTelemetry = encodeURIComponent(
    `Hello Nadeem Sulemani, I am inquiring regarding the private viewing for: "${property.title}" (Demand: ${formattedDemand}, Location: ${property.location}). Telemetry Reference: /properties/${property.slug}`
  );
  const waUrl = `https://wa.me/923008286662?text=${waTelemetry}`;


  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black">
      {/* ==================== 1. EDITORIAL HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-3.5 xs:px-5 sm:px-8 lg:px-12 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="group flex flex-col text-left min-w-0">
            <span className="font-cinzel text-sm xs:text-base sm:text-xl font-semibold tracking-[0.16em] sm:tracking-[0.24em] text-[#D4AF37] transition-all duration-300 group-hover:brightness-125 truncate">
              REAL PROPERTY PRIME TIME
            </span>
            <span className="text-[8px] xs:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.38em] text-zinc-400 font-sans mt-0.5 truncate">
              Est. 1998 • Karachi Luxury Advisory
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-400 border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-black px-3.5 py-2 transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Command</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 xs:space-x-2 text-[10px] xs:text-[11px] font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-zinc-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 px-2.5 xs:px-4 py-1.5 xs:py-2 transition-all duration-200 bg-black/40 flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">Back to Portfolio</span>
              <span className="xs:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN DETAIL CONTAINER ==================== */}
      <div className="max-w-7xl mx-auto px-3.5 xs:px-5 sm:px-8 lg:px-12 py-6 sm:py-12 pb-32 md:pb-20 space-y-8 sm:space-y-10">
        {/* Breadcrumb & Verification strip */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs text-zinc-400 border-b border-neutral-800 pb-4 sm:pb-5">
          <div className="flex items-center space-x-1.5 xs:space-x-2 font-mono text-[10px] xs:text-[11px] tracking-wider uppercase text-zinc-400 min-w-0">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors flex-shrink-0">
              Portfolio
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500 truncate max-w-[80px] xs:max-w-none">{property.location.split(',')[0]}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-[#D4AF37] truncate max-w-[120px] xs:max-w-xs">{property.title}</span>
          </div>

          <div className="self-start xs:self-auto inline-flex items-center space-x-2 text-[9px] xs:text-[10px] tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[#D4AF37] bg-neutral-900/90 border border-amber-500/40 px-2.5 xs:px-3 py-1 font-mono flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>DHA Sub-Lease & CBC Title Verified</span>
          </div>
        </div>

        {/* ==================== 3. SPLIT-PANEL ARCHITECTURE (60% / 40%) ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: EDITORIAL GALLERY STREAM (60% Width on Desktop: lg:col-span-7) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-10">
            {/* Visual Stream & Touch Snap Carousel */}
            <GalleryViewer images={images} title={property.title} />

            {/* Architectural Narrative & Provenance */}
            <div className="space-y-4 pt-6 border-t border-neutral-800">
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] font-mono text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Provenance & Architecture</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-tight">
                Architectural Engineering & Mandate Specifications
              </h2>

              <div className="text-zinc-300 font-light leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line border-l-2 border-[#D4AF37]/60 pl-5 bg-neutral-950/60 p-5 rounded-lg border border-neutral-800/80">
                {property.description || (
                  <p>
                    Personally vetted by Nadeem Sulemani. This prestigious Karachi residential asset features clear DHA Sub-Lease documentation, pristine architectural engineering, and confidential direct-owner terms.
                  </p>
                )}
              </div>
            </div>

            {/* Architectural Specs Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
              <div className="bg-[#121212] border border-neutral-800 p-3 xs:p-4 sm:p-5 text-center space-y-1 rounded-lg backdrop-blur-sm">
                <Maximize2 className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                <span className="text-[9px] xs:text-[10px] uppercase tracking-[0.18em] text-zinc-400 block font-mono">Yardage</span>
                <span className="font-serif text-base xs:text-lg sm:text-xl text-white font-light truncate block">
                  {property.size || 'Prime Size'}
                </span>
              </div>

              <div className="bg-[#121212] border border-neutral-800 p-3 xs:p-4 sm:p-5 text-center space-y-1 rounded-lg backdrop-blur-sm">
                <Bed className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                <span className="text-[9px] xs:text-[10px] uppercase tracking-[0.18em] text-zinc-400 block font-mono">Suites</span>
                <span className="font-serif text-base xs:text-lg sm:text-xl text-white font-light truncate block">
                  {property.bedrooms ? `${property.bedrooms} Beds` : 'Custom'}
                </span>
              </div>

              <div className="bg-[#121212] border border-neutral-800 p-3 xs:p-4 sm:p-5 text-center space-y-1 rounded-lg backdrop-blur-sm">
                <Bath className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                <span className="text-[9px] xs:text-[10px] uppercase tracking-[0.18em] text-zinc-400 block font-mono">Baths</span>
                <span className="font-serif text-base xs:text-lg sm:text-xl text-white font-light truncate block">
                  {property.bathrooms ? `${property.bathrooms} Luxury` : 'Designer'}
                </span>
              </div>

              <div className="bg-[#121212] border border-neutral-800 p-3 xs:p-4 sm:p-5 text-center space-y-1 rounded-lg backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                <span className="text-[9px] xs:text-[10px] uppercase tracking-[0.18em] text-zinc-400 block font-mono">Category</span>
                <span className="font-serif text-base xs:text-lg sm:text-xl text-white font-light truncate block">
                  {property.category || 'Mandate'}
                </span>
              </div>
            </div>

            {/* Legal Title & Due Diligence Banner */}
            <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif text-lg text-white font-normal">
                  Due Diligence & Cadastral Verification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>DHA Karachi Transfer & Cantonment Board Clifton (CBC) Verified</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>Special Power of Attorney (SPA) supported for Overseas Pakistani buyers</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>Zero encumbrances, zero third-party claims, clean title guaranteed</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>Confidential direct-principal negotiation supervised by Nadeem Sulemani</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: STICKY SPECIFICATIONS & INQUIRY DESK (40% Width: lg:col-span-5) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="bg-[#121212] border border-neutral-800 hover:border-amber-500/30 transition-colors p-4 xs:p-6 sm:p-7 space-y-6 rounded-xl shadow-2xl backdrop-blur-md">
              
              {/* Category, Floor, Title & Demand Header */}
              <div className="space-y-3.5 border-b border-neutral-800 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] tracking-wider uppercase bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-0.5 font-mono font-semibold">
                    {property.category || 'Bungalow'}
                  </span>
                  
                  {property.floor_number && (
                    <span className="text-[10px] tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 font-mono font-semibold">
                      {property.floor_number}
                    </span>
                  )}

                  <span className="text-[10px] tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 font-mono">
                    EST. 1998 MANDATE
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-tight break-words">
                  {property.title}
                </h1>

                <div className="flex items-center space-x-1.5 text-xs uppercase tracking-wider text-zinc-400 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </div>

                <div className="pt-2 bg-neutral-950/80 p-3.5 xs:p-4 rounded-lg border border-neutral-800/80">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 block font-mono">
                    Official Mandate Demand
                  </span>
                  <span className="font-serif text-2xl xs:text-3xl sm:text-4xl text-[#D4AF37] font-normal block mt-0.5 break-words">
                    {formattedDemand}
                  </span>
                  <span className="text-[9px] xs:text-[10px] text-zinc-500 tracking-wider uppercase block mt-1">
                    Direct Principal Negotiation • Private Terms
                  </span>
                </div>
              </div>

              {/* Direct CTA Triggers (Enforcing 48px touch targets) */}
              <div className="space-y-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target-48 w-full py-4 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-center rounded-lg shadow-xl shadow-[#D4AF37]/15"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SCHEDULE PRIVATE VIEWING</span>
                </a>

                <a
                  href={`https://wa.me/923008286662?text=Confidential%20Advisory%20Inquiry%20regarding%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target-48 w-full py-3.5 border border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-center rounded-lg"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>DIRECT WHATSAPP ADVISORY</span>
                </a>

                <a
                  href="tel:+923008286662"
                  className="touch-target-48 w-full py-3.5 border border-neutral-700 hover:border-white text-zinc-200 hover:text-white font-medium text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-center rounded-lg"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>DIRECT CALL: +92 300 8286662</span>
                </a>
              </div>

              {/* Embedded Cadastral GIS Leaflet Map */}
              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <PropertyGisMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  location={property.location}
                  demand={formattedDemand}
                />
              </div>

              {/* Advisory Guarantee Points */}
              <div className="pt-3 border-t border-neutral-800 space-y-2 text-xs text-zinc-400 font-light">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>Supervised by Nadeem Sulemani • Est. 1998</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>Confidentiality protected under bilateral NDA</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ==================== 4. PERSISTENT MOBILE ACTION BAR (< 768px Viewports) ==================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-neutral-950/95 backdrop-blur-lg border-t border-amber-500/30 md:hidden flex items-center gap-2.5 shadow-2xl">
        <a
          href="tel:+923008286662"
          className="touch-target-48 px-4 py-3 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 rounded-lg flex-shrink-0 transition-colors"
          title="Direct Telephone Concierge"
        >
          <Phone className="w-4 h-4 text-[#D4AF37]" />
          <span>CALL</span>
        </a>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target-48 flex-1 py-3 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 rounded-lg shadow-lg text-center transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WHATSAPP ADVISORY</span>
        </a>
      </div>
    </main>
  );
}

