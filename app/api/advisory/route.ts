import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendLeadAlertEmail, sendClientConfirmationEmail, AdvisoryLeadPayload } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      phone_whatsapp,
      location_phase,
      property_type,
      size_covered,
      objectives_notes,
      email,
    } = body;

    // 1. Mandatory Input Validation
    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Client full name is mandatory for confidential advisory registration.' },
        { status: 400 }
      );
    }

    if (!phone_whatsapp || !phone_whatsapp.trim()) {
      return NextResponse.json(
        { success: false, message: 'Direct phone or WhatsApp contact is mandatory.' },
        { status: 400 }
      );
    }

    if (!location_phase || !location_phase.trim()) {
      return NextResponse.json(
        { success: false, message: 'Location / Phase selection is required.' },
        { status: 400 }
      );
    }

    if (!property_type || !property_type.trim()) {
      return NextResponse.json(
        { success: false, message: 'Property classification type is required.' },
        { status: 400 }
      );
    }

    const leadPayload: AdvisoryLeadPayload = {
      full_name: full_name.trim(),
      phone_whatsapp: phone_whatsapp.trim(),
      location_phase: location_phase.trim(),
      property_type: property_type.trim(),
      size_covered: size_covered?.trim() || null,
      objectives_notes: objectives_notes?.trim() || null,
      email: email?.trim(),
    };

    // 2. Insert Lead Audit Trail into Supabase advisory_leads table
    let insertedLead: any = null;
    let dbNotice: string | null = null;

    try {
      const { data, error: dbError } = await supabase
        .from('advisory_leads')
        .insert([
          {
            full_name: leadPayload.full_name,
            phone_whatsapp: leadPayload.phone_whatsapp,
            location_phase: leadPayload.location_phase,
            property_type: leadPayload.property_type,
            size_covered: leadPayload.size_covered,
            objectives_notes: leadPayload.objectives_notes,
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.warn('Supabase advisory_leads insert warning:', dbError.message);
        dbNotice = 'Lead received. Execute supabase_advisory_migration.sql in Supabase SQL editor to enable persistent table audit trail.';
      } else {
        insertedLead = data;
      }
    } catch (err: any) {
      console.warn('Supabase connection warning:', err?.message);
    }

    const leadId = insertedLead?.id || `MANDATE-${Date.now().toString(36).toUpperCase()}`;

    // 3. Send Email Alert to Admin (realpropertyprimetime@gmail.com) via Resend
    let emailStatus: 'sent' | 'failed' = 'failed';
    try {
      const emailResult = await sendLeadAlertEmail(leadPayload, leadId);
      if (emailResult && (emailResult.data?.id || (emailResult as any).id)) {
        emailStatus = 'sent';
      }
    } catch (mailErr: any) {
      console.error('Resend dispatch error to admin:', mailErr?.message);
      emailStatus = 'failed';
    }

    // 4. Send Client Auto-Confirmation Email if Email Address Detected
    const clientEmail = (email && email.includes('@')) 
      ? email.trim() 
      : (phone_whatsapp && phone_whatsapp.includes('@')) 
      ? phone_whatsapp.trim() 
      : null;

    if (clientEmail) {
      try {
        await sendClientConfirmationEmail(leadPayload, clientEmail);
      } catch (clientMailErr: any) {
        console.warn('Client confirmation email notice:', clientMailErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Confidential valuation assessment scheduled. Nadeem Sulemani and our senior advisory desk have received your mandate dossier.',
      lead_id: leadId,
      email_status: emailStatus,
      db_notice: dbNotice,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Advisory API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process advisory mandate request.' },
      { status: 500 }
    );
  }
}
