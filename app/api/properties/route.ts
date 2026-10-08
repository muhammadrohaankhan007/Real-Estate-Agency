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
  features: string[];
  imageUrl: string;
  isFeature: boolean;
  tag: string;
}

const properties: Property[] = [
  {
    id: 'ghalib-villa',
    title: '500 Yards Ultra-Luxury — Khayaban-e-Ghalib',
    location: 'Zone A, DHA Phase 8, Karachi',
    price: 'PKR 485 Million',
    specs: {
      area: '500 Sq. Yds',
      beds: 6,
      baths: 7,
      views: 'Zen Tropical Courtyard',
      parking: '4 Covered Bays',
    },
    features: [
      'Italian Travertine Stone Facade',
      'Double-Height Glass Atrium',
      'Integrated Crestron Smart Home',
      'Private Temperature-Controlled Pool',
      'Basement Cinema & Cigar Lounge',
    ],
    imageUrl: '/images/bungalow-ghalib.jpg',
    isFeature: true,
    tag: 'Flagship Residence',
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
      parking: '6 Supercar Garage',
    },
    features: [
      'Direct Private Beachfront Access',
      'Cantilevered Infinity Lap Pool',
      'Dark Anodized Bronze Panels',
      'Sub-Zero & Wolf Chef Kitchen',
    ],
    imageUrl: '/images/faisal-waterfront.jpg',
    isFeature: false,
    tag: 'Waterfront Estate',
  },
  {
    id: 'ittehad-estate',
    title: '1,000 Yards Architectural Masterpiece — Khayaban-e-Ittehad',
    location: 'Marina Corridor, DHA Phase 8, Karachi',
    price: 'PKR 820 Million',
    specs: {
      area: '1,000 Sq. Yds',
      beds: 7,
      baths: 9,
      views: 'Reflecting Water Courtyard',
      parking: '8 Vehicle Driveway',
    },
    features: [
      'Floating Architectural Cantilevers',
      'Reflecting Pool & Stepping Stones',
      'Rooftop Sunset Lounge & Helipad Ready',
      'Private Elevator & Wellness Spa',
    ],
    imageUrl: '/images/ittehad-estate.jpg',
    isFeature: false,
    tag: 'Private Compound',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: properties,
    count: properties.length,
    brokerage: 'PRIME TIME Privé Brokerage Karachi',
  });
}
