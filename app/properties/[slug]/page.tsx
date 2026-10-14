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
  Compass
} from 'lucide-react';
import GalleryViewer from './GalleryViewer';

// Enforce zero-cache directives
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Property {
  id: number;
  title: string;
  slug: string;
  demand: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size: string | null;
  description: string | null;
  image_urls: string[];
  created_at: string;
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

  // Zero-API-key Google Maps embed URL
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    property.location
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-[#D4AF37] selection:text-black">
      {/* ==================== 1. EDITORIAL HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-5 sm:px-8 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex flex-col text-left">
            <span className="font-cinzel text-lg sm:text-xl font-semibold tracking-[0.24em] text-[#D4AF37] transition-all duration-300 group-hover:brightness-125">
              REAL PROPERTY PRIME TIME
            </span>
            <span className="text-[9px] uppercase tracking-[0.38em] text-zinc-400 font-sans mt-0.5">
              Est. 1998 • Karachi Luxury Advisory
            </span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-400 border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-black px-3.5 py-2 transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Command</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 px-4 py-2 transition-all duration-200 bg-black/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN DETAIL CONTAINER ==================== */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-12">
        {/* Breadcrumb & Verification strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-2 font-mono text-[11px] tracking-wider uppercase text-zinc-400">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Portfolio
            </Link>
            <span>/</span>
            <span className="text-zinc-500">{property.location.split(',')[0]}</span>
            <span>/</span>
            <span className="text-[#D4AF37] truncate max-w-xs">{property.title}</span>
          </div>

          <div className="inline-flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] bg-black/80 border border-[#D4AF37]/40 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DHA Sub-Lease & Title Verified</span>
          </div>
        </div>

        {/* Title & Headline Price Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{property.location}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight">
              {property.title}
            </h1>
          </div>

          <div className="bg-white/[0.02] border border-[#D4AF37]/30 p-6 sm:p-7 min-w-[280px] lg:text-right">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 block font-mono">
              Official Mandate Demand
            </span>
            <span className="font-serif text-3xl sm:text-4xl text-[#D4AF37] font-normal block mt-1">
              {formattedDemand}
            </span>
            <span className="text-[10px] text-zinc-500 tracking-wider uppercase mt-1 block">
              Direct Principal Negotiation
            </span>
          </div>
        </div>

        {/* ==================== 3. MULTI-ASSET HERO & GALLERY ==================== */}
        <GalleryViewer images={images} title={property.title} />

        {/* ==================== 4. ARCHITECTURAL SPECS GRID ==================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/[0.02] border border-white/10 p-5 sm:p-6 text-center space-y-1.5 backdrop-blur-sm">
            <Maximize2 className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block">Covered Yardage</span>
            <span className="font-serif text-xl sm:text-2xl text-white font-light">
              {property.size || 'Prime Size'}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-5 sm:p-6 text-center space-y-1.5 backdrop-blur-sm">
            <Bed className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block">Bedrooms</span>
            <span className="font-serif text-xl sm:text-2xl text-white font-light">
              {property.bedrooms ? `${property.bedrooms} Suites` : 'Custom Suites'}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-5 sm:p-6 text-center space-y-1.5 backdrop-blur-sm">
            <Bath className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block">Bathrooms</span>
            <span className="font-serif text-xl sm:text-2xl text-white font-light">
              {property.bathrooms ? `${property.bathrooms} Luxury Baths` : 'Designer Baths'}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-5 sm:p-6 text-center space-y-1.5 backdrop-blur-sm">
            <Building2 className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 block">Asset Category</span>
            <span className="font-serif text-xl sm:text-2xl text-white font-light">
              Signature Mandate
            </span>
          </div>
        </div>

        {/* ==================== 5. DETAILS & HIGH-NET-WORTH ACTION HUB ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (Col 7): Architectural Narrative & Location Map */}
          <div className="lg:col-span-7 space-y-10">
            {/* Description */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-tight">
                Architectural Specifications & Provenance
              </h2>
              <div className="text-zinc-300 font-light leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line border-l-2 border-[#D4AF37]/50 pl-5">
                {property.description || (
                  <p>
                    Personally vetted by Nadeem Sulemani. This prestigious Karachi residential asset features clear DHA Sub-Lease documentation, pristine architectural engineering, and confidential direct-owner terms.
                  </p>
                )}
              </div>
            </div>

            {/* GIS / Zero-API-Key Live Map Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl sm:text-2xl font-light text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#D4AF37]" />
                  <span>Cadastral GIS & Location Coordinates</span>
                </h3>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                  {property.location}
                </span>
              </div>
              <div className="relative w-full h-80 overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 contrast-125 brightness-90"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Location Coordinates for ${property.title}`}
                />
              </div>
            </div>
          </div>

          {/* Right Column (Col 5): High-Net-Worth Advisory Hub */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white/[0.02] border border-white/10 p-7 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              <div className="border-b border-white/10 pb-5">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold block">
                  Private Client Advisory Desk
                </span>
                <h3 className="font-serif text-2xl text-white mt-1">
                  Schedule Confidential Viewing
                </h3>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Direct private viewings are personally accompanied by Nadeem Sulemani under strict non-disclosure protocol.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#D4AF37] hover:bg-white text-black font-semibold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-center shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Schedule Private Viewing via WhatsApp</span>
                </a>

                <a
                  href="tel:+923008286662"
                  className="w-full py-4 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] text-zinc-200 font-medium text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-center"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>Direct Call: +92 300 8286662</span>
                </a>
              </div>

              {/* Advisory Guarantee Points */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-zinc-400">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
