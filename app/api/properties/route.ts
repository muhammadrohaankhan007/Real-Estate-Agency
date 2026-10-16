import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase properties table schema
export interface Property {
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
  latitude?: number | null;
  longitude?: number | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zero-cache route segment configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase properties query error:', error);
      return NextResponse.json(
        { error: `Database Error: ${error.message}` },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    return NextResponse.json(data ?? [], {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Failed to query properties:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to query properties' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
