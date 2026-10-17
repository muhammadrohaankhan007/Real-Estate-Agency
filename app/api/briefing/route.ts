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
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email address required.' },
        { status: 400 }
      );
    }

    const subscriberId = `BRIEF-${Date.now().toString(36).toUpperCase()}`;

    // Store in Supabase newsletter_subscribers
    try {
      await supabase.from('newsletter_subscribers').upsert(
        { email_or_phone: email.trim() },
        { onConflict: 'email_or_phone' }
      );
    } catch (dbErr) {
      console.warn('Supabase newsletter_subscribers notice:', dbErr);
    }

    // Send Alert via Resend
    try {
      await sendSubscriberAlertEmail(email.trim(), subscriberId);
    } catch (mailErr) {
      console.warn('Resend subscriber alert notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to Private Briefings. Karachi off-market alerts activated.',
      subscriberId,
      email,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Invalid payload.' },
      { status: 500 }
    );
  }
}
