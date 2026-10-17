import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendLeadAlertEmail, sendClientConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ownerName, phone, email, propertyLocation, propertyType, sizeDetails, notes } = body;

    if (!ownerName || !phone) {
      return NextResponse.json(
        { success: false, message: 'Owner name and direct contact number are required.' },
        { status: 400 }
      );
    }

    const valuationId = `VAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const leadPayload = {
      full_name: ownerName,
      phone_whatsapp: phone,
      location_phase: propertyLocation || 'DHA Phase 8',
      property_type: propertyType || 'Luxury Bungalow',
      size_covered: sizeDetails || null,
      objectives_notes: notes || null,
      email: email || null,
    };

    // Store in Supabase advisory_leads table
    try {
      await supabase.from('advisory_leads').insert([
        {
          full_name: leadPayload.full_name,
          phone_whatsapp: leadPayload.phone_whatsapp,
          location_phase: leadPayload.location_phase,
          property_type: leadPayload.property_type,
          size_covered: leadPayload.size_covered,
          objectives_notes: leadPayload.objectives_notes,
        }
      ]);
    } catch (dbErr) {
      console.warn('Supabase advisory_leads insert notice:', dbErr);
    }

    // Send Alert via Resend
    try {
      await sendLeadAlertEmail(leadPayload, valuationId);
      if (email && email.includes('@')) {
        await sendClientConfirmationEmail(leadPayload, email.trim());
      }
    } catch (mailErr) {
      console.warn('Resend alert dispatch notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Private property valuation request registered. Nadeem Sulemani and our senior advisory team will contact you confidentially.',
      valuationId,
      timestamp: new Date().toISOString(),
      details: { ownerName, phone, email, propertyLocation, propertyType, sizeDetails, notes },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process valuation request.' },
      { status: 500 }
    );
  }
}
