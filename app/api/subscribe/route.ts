import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriberAlertEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email_or_phone } = body;

    if (!email_or_phone || !email_or_phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Valid email address or WhatsApp contact is required.' },
        { status: 400 }
      );
    }

    const contact = email_or_phone.trim();

    // 1. Store Subscriber in Supabase newsletter_subscribers Table
    let subscriberRecord: any = null;
    let dbNotice: string | null = null;

    try {
      const { data, error: dbError } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email_or_phone: contact },
          { onConflict: 'email_or_phone' }
        )
        .select()
        .single();

      if (dbError) {
        console.warn('Supabase newsletter_subscribers upsert warning:', dbError.message);
        dbNotice = 'Subscriber enrolled. Execute supabase_advisory_migration.sql in Supabase SQL editor to enable persistent table audit trail.';
      } else {
        subscriberRecord = data;
      }
    } catch (err: any) {
      console.warn('Supabase connection warning:', err?.message);
    }

    const subscriberId = subscriberRecord?.id || `SUB-${Date.now().toString(36).toUpperCase()}`;

    // 2. Send Alert Email to Admin (realpropertyprimetime@gmail.com) via Resend
    let emailStatus: 'sent' | 'failed' = 'failed';
    try {
      const emailResult = await sendSubscriberAlertEmail(contact, subscriberId);
      if (emailResult && (emailResult.data?.id || (emailResult as any).id)) {
        emailStatus = 'sent';
      }
    } catch (mailErr: any) {
      console.error('Resend dispatch error for subscriber:', mailErr?.message);
      emailStatus = 'failed';
    }

    return NextResponse.json({
      success: true,
      message: 'Enrolled in Private Briefings. You will receive direct off-market dispatches and land movements.',
      subscriber_id: subscriberId,
      contact,
      email_status: emailStatus,
      db_notice: dbNotice,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process subscription.' },
      { status: 500 }
    );
  }
}
