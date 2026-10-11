import { NextResponse } from 'next/server';

export interface Property {
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

const properties: Property[] = [
  {
    id: 'ghalib-villa',
    title: '500 Yards Ultra-Luxury Bungalow — Khayaban-e-Ghalib',
    location: 'DHA Phase 8 (Ghalib Area), Karachi',
    price: 'PKR 485 Million',
    specs: {
      area: '500 Sq. Yds',
      beds: 6,
      baths: 7,
      views: 'Zen Tropical Courtyard & Private Pool',
      parking: '4 Covered Bays',
    },
    category: 'dha8',
    features: [
      'Italian Travertine Stone Facade',
      'Double-Height Glass Atrium',
      'Integrated Smart Automation',
      'Private Temperature-Controlled Pool',
      'Basement Cinema & Lounge',
    ],
    imageUrl: '/images/bungalow-ghalib.jpg',
    isFeature: true,
    tag: 'Flagship Residence',
    badge: 'Exclusive DHA Phase 8',
  },
  {
    id: 'emaar-pearl-tower',
    title: 'EMAAR Pearl Tower 2 — Sea-Facing 3-Bed Luxury Residence',
    location: 'Crescent Bay Waterfront, DHA Phase 8, Karachi',
    price: 'PKR 145 Million',
    specs: {
      area: '2,650 Sq. Ft',
      beds: 3,
      baths: 4,
      views: 'Unobstructed Arabian Sea & Sunset Views',
      parking: '2 Dedicated Bays',
    },
    category: 'waterfront',
    features: [
      'Direct Waterfront Promenade Access',
      'Floor-to-Ceiling Coastal Glazing',
      'Private Resident Infinity Pool',
      'Five-Star Concierge & Security',
      'High Capital Appreciation Corridor',
    ],
    imageUrl: '/images/emaar-pearl-tower.jpg',
    isFeature: false,
    tag: 'Off-Plan & Waterfront',
    badge: 'EMAAR Official Specialist',
  },
  {
    id: 'faisal-waterfront',
    title: '800 Yards Coastal Villa — Khayaban-e-Faisal',
    location: 'Zone B Waterfront, DHA Phase 8, Karachi',
    price: 'PKR 650 Million',
    specs: {
      area: '800 Sq. Yds',
      beds: 5,
      baths: 6,
      views: 'Panoramic Arabian Sea Horizon',
      parking: '6 Supercar Bays',
    },
    category: 'dha8',
    features: [
      'Direct Private Beachfront Orientation',
      'Cantilevered Infinity Lap Pool',
      'Dark Anodized Bronze Panels',
      'German Designer Kitchen Systems',
    ],
    imageUrl: '/images/faisal-waterfront.jpg',
    isFeature: false,
    tag: 'Waterfront Estate',
    badge: 'Private Off-Market',
  },
  {
    id: 'ittehad-estate',
    title: 'Luxury 1,000 Yards Bungalow — Khayaban-e-Ittehad',
    location: 'Marina Corridor, DHA Phase 8 / Phase 7, Karachi',
    price: 'PKR 820 Million',
    specs: {
      area: '1,000 Sq. Yds',
      beds: 7,
      baths: 9,
      views: 'Reflecting Water Courtyard & Manicured Lawn',
      parking: '8 Vehicle Driveway',
    },
    category: 'dha67',
    features: [
      'Monumental Cantilevered Architecture',
      'Reflecting Pool & Zen Garden',
      'Rooftop Observatory & Lounge',
      'Private Elevator & Wellness Spa',
    ],
    imageUrl: '/images/ittehad-estate.jpg',
    isFeature: false,
    tag: 'Private Compound',
    badge: '1,000 Yds Masterpiece',
  },
  {
    id: 'phase6-bungalow',
    title: '500 Yards Contemporary Bungalow — DHA Phase 6',
    location: 'Prime Residential Avenue, DHA Phase 6, Karachi',
    price: 'PKR 390 Million',
    specs: {
      area: '500 Sq. Yds',
      beds: 5,
      baths: 6,
      views: 'Lush Landscaped Courtyard',
      parking: '3 Covered Bays',
    },
    category: 'dha67',
    features: [
      'Spanish Porcelain & Warm Teak Accents',
      'Imported Double-Glazed Openings',
      'Separate Dirty Kitchen & Maid Quarters',
      'Solar-Ready Hybrid Power Array',
    ],
    imageUrl: '/images/hero-mansion.jpg',
    isFeature: false,
    tag: 'Phase 6 Prime',
    badge: 'Immediate Possession',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: properties,
    count: properties.length,
    brokerage: 'Real Property Prime Time — Karachi Luxury Real Estate Advisory Est. 1998',
  });
}
