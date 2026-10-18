import { Resend } from 'resend';

// Initialize Resend Client with API Key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);

const PRIMARY_ADMIN = process.env.EMAIL_RECEIVER || 'realpropertyprimetime@gmail.com';
const FALLBACK_ACCOUNT_OWNER = 'mohammadrohaan00712@gmail.com';
const FROM_EMAIL = 'Prime Time Real Estate <onboarding@resend.dev>';

export interface AdvisoryLeadPayload {
  full_name: string;
  phone_whatsapp: string;
  location_phase: string;
  property_type: string;
  size_covered?: string;
  objectives_notes?: string;
  email?: string;
}

/**
 * Send High-Net-Worth Advisory Lead Alert to Admin via Resend
 * Supports sandbox mode fallback to registered account owner until custom domain is verified
 */
export async function sendLeadAlertEmail(lead: AdvisoryLeadPayload, leadId?: number | string) {
  const cleanPhone = lead.phone_whatsapp.replace(/[^0-9]/g, '');
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const telLink = cleanPhone ? `tel:+${cleanPhone}` : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111113; border: 1px solid rgba(212, 175, 55, 0.4); }
        .header { background: linear-gradient(180deg, #18181b 0%, #0a0a0a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); }
        .brand { font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.25em; color: #D4AF37; text-transform: uppercase; margin: 0; }
        .subbrand { font-size: 10px; letter-spacing: 0.3em; color: #a1a1aa; text-transform: uppercase; margin-top: 6px; }
        .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.5); color: #D4AF37; font-size: 10px; font-weight: bold; padding: 4px 12px; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 14px; }
        .content { padding: 32px 24px; }
        .lead-title { font-family: Georgia, serif; font-size: 22px; color: #ffffff; margin-top: 0; margin-bottom: 8px; font-weight: 300; }
        .lead-desc { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
        .table-box { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); }
        .table-box td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
        .label { color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; width: 35%; }
        .value { color: #ffffff; font-weight: 500; }
        .notes-box { background: rgba(0,0,0,0.5); border-left: 3px solid #D4AF37; padding: 14px 18px; margin-bottom: 28px; font-size: 13px; color: #d4d4d8; font-style: italic; line-height: 1.6; }
        .actions { text-align: center; margin-bottom: 30px; }
        .btn-gold { display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 24px; margin: 4px; }
        .btn-outline { display: inline-block; border: 1px solid rgba(255,255,255,0.3); color: #ffffff; text-decoration: none; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 24px; margin: 4px; }
        .footer { padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10px; color: #666666; letter-spacing: 0.08em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">REAL PROPERTY PRIME TIME</h1>
          <div class="subbrand">Private Client Advisory Desk • Karachi Luxury Portfolio</div>
          <div class="badge">CONFIDENTIAL VALUATION COMMISSION #${leadId || Date.now().toString(36).toUpperCase()}</div>
        </div>

        <div class="content">
          <h2 class="lead-title">New Mandate Valuation Request</h2>
          <p class="lead-desc">A prospective high-net-worth principal has commissioned a confidential valuation assessment via the web portal.</p>

          <table class="table-box">
            <tr>
              <td class="label">Principal Client</td>
              <td class="value">${lead.full_name}</td>
            </tr>
            <tr>
              <td class="label">Phone / WhatsApp</td>
              <td class="value" style="color: #D4AF37; font-family: monospace; font-size: 14px;">${lead.phone_whatsapp}</td>
            </tr>
            <tr>
              <td class="label">Cadastral Enclave</td>
              <td class="value">${lead.location_phase}</td>
            </tr>
            <tr>
              <td class="label">Asset Classification</td>
              <td class="value">${lead.property_type}</td>
            </tr>
            ${lead.size_covered ? `
            <tr>
              <td class="label">Covered Yardage</td>
              <td class="value">${lead.size_covered}</td>
            </tr>
            ` : ''}
            <tr>
              <td class="label">Submission Protocol</td>
              <td class="value" style="font-family: monospace; font-size: 11px; color: #10b981;">WGS84 Sub-Meter Verified • ${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; margin-bottom: 6px; font-weight: 600;">Confidential Objectives & Mandate Notes:</div>
          <div class="notes-box">
            "${lead.objectives_notes || 'No custom notes provided. Direct principal discussion requested.'}"
          </div>

          <div class="actions">
            ${waLink ? `<a href="${waLink}" class="btn-gold" target="_blank">Connect via WhatsApp</a>` : ''}
            ${telLink ? `<a href="${telLink}" class="btn-outline">Direct Phone Call</a>` : ''}
          </div>
        </div>

        <div class="footer">
          EST. 1998 • CURATED PRIVATE ADVISORY BY NADEEM SULEMANI<br>
          DHA KARACHI TRANSFER & TITLE VERIFIED PROTOCOL
        </div>
      </div>
    </body>
    </html>
  `;

  const replyTo = lead.email || (lead.phone_whatsapp.includes('@') ? lead.phone_whatsapp : undefined);
  const subject = `🏛️ [NEW ADVISORY MANDATE] Valuation Request: ${lead.full_name} (${lead.location_phase})`;

  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to: [PRIMARY_ADMIN],
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
    });

    const isSandboxError = (msg?: string) => {
      const lower = (msg || '').toLowerCase();
      return lower.includes('testing') || lower.includes('domain') || lower.includes('own email address');
    };

    if (res.error && isSandboxError(res.error.message)) {
      console.warn('Resend Sandbox Mode: Delivering test alert to registered account owner:', FALLBACK_ACCOUNT_OWNER);
      return await resend.emails.send({
        from: FROM_EMAIL,
        to: [FALLBACK_ACCOUNT_OWNER],
        ...(replyTo ? { replyTo } : {}),
        subject,
        html,
      });
    }

    return res;
  } catch (err: any) {
    const isSandboxError = (msg?: string) => {
      const lower = (msg || '').toLowerCase();
      return lower.includes('testing') || lower.includes('domain') || lower.includes('own email address');
    };

    if (isSandboxError(err?.message)) {
      console.warn('Resend Sandbox Mode: Exception caught, delivering to registered account owner:', FALLBACK_ACCOUNT_OWNER);
      return await resend.emails.send({
        from: FROM_EMAIL,
        to: [FALLBACK_ACCOUNT_OWNER],
        ...(replyTo ? { replyTo } : {}),
        subject,
        html,
      });
    }
    throw err;
  }
}

/**
 * Send Client Confirmation Email (if client provided email address) via Resend
 */
export async function sendClientConfirmationEmail(lead: AdvisoryLeadPayload, recipientEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111113; border: 1px solid rgba(212, 175, 55, 0.3); }
        .header { background: linear-gradient(180deg, #18181b 0%, #0a0a0a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.3); }
        .brand { font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.25em; color: #D4AF37; text-transform: uppercase; margin: 0; }
        .subbrand { font-size: 10px; letter-spacing: 0.3em; color: #a1a1aa; text-transform: uppercase; margin-top: 6px; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .title { font-family: Georgia, serif; font-size: 22px; color: #ffffff; font-weight: 300; margin-bottom: 16px; }
        .text { font-size: 14px; color: #d4d4d8; margin-bottom: 16px; font-weight: 300; }
        .specs-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(212, 175, 55, 0.25); padding: 18px; margin: 20px 0; font-size: 13px; }
        .specs-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .specs-label { color: #888888; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; }
        .specs-val { color: #D4AF37; font-weight: 500; }
        .btn-contact { display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 24px; margin-top: 10px; }
        .footer { padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10px; color: #666666; letter-spacing: 0.08em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">REAL PROPERTY PRIME TIME</h1>
          <div class="subbrand">Private Advisory Mandate Desk • Est. 1998</div>
        </div>

        <div class="content">
          <h2 class="title">Confidential Valuation Mandate Acknowledgment</h2>
          <p class="text">Dear ${lead.full_name},</p>
          <p class="text">
            Thank you for commissioning a confidential valuation assessment with Prime Time Real Estate. Your mandate for a <strong>${lead.property_type}</strong> in <strong>${lead.location_phase}</strong> has been assigned directly to Nadeem Sulemani and our senior cadastral advisory desk.
          </p>

          <div class="specs-card">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; margin-bottom: 10px; font-weight: 600;">Registered Mandate Summary:</div>
            <div class="specs-row">
              <span class="specs-label">Location Enclave:</span>
              <span class="specs-val">${lead.location_phase}</span>
            </div>
            <div class="specs-row">
              <span class="specs-label">Property Category:</span>
              <span class="specs-val">${lead.property_type}</span>
            </div>
            ${lead.size_covered ? `
            <div class="specs-row">
              <span class="specs-label">Covered Area / Yardage:</span>
              <span class="specs-val">${lead.size_covered}</span>
            </div>
            ` : ''}
            <div class="specs-row">
              <span class="specs-label">Protocol:</span>
              <span class="specs-val" style="color: #10b981;">Strict Non-Disclosure Protocol</span>
            </div>
          </div>

          <p class="text">
            Our advisory team will review current comparative cadastral transactions, Cantonment Board Clifton (CBC) valuations, and recent off-market trades before contacting you directly at <strong>${lead.phone_whatsapp}</strong>.
          </p>

          <p class="text">
            If your requirement is time-sensitive, you may initiate a direct consultation via WhatsApp below:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://wa.me/923008286662" class="btn-contact">Connect with Nadeem Sulemani</a>
          </div>
        </div>

        <div class="footer">
          REAL PROPERTY PRIME TIME • 25+ YEARS OF KARACHI LUXURY ADVISORY<br>
          CONFIDENTIAL COMMUNICATION • ALL RIGHTS RESERVED
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: `Confidential Mandate Receipt: Prime Time Real Estate Advisory Desk`,
      html,
    });
  } catch (err: any) {
    console.warn('Resend client confirmation notice (domain verification required for external recipients):', err?.message);
    return { data: null, error: err };
  }
}

/**
 * Send Newsletter Subscriber Alert to Admin via Resend
 */
export async function sendSubscriberAlertEmail(emailOrPhone: string, subscriberId?: number | string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ededed; }
        .container { max-width: 520px; margin: 0 auto; background-color: #111113; border: 1px solid rgba(212, 175, 55, 0.4); padding: 30px; }
        .brand { font-family: Georgia, serif; font-size: 18px; letter-spacing: 0.2em; color: #D4AF37; text-transform: uppercase; margin: 0 0 4px 0; }
        .subbrand { font-size: 9px; letter-spacing: 0.3em; color: #888; text-transform: uppercase; margin-bottom: 20px; }
        .box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 16px; margin: 16px 0; }
        .val { font-family: monospace; font-size: 15px; color: #D4AF37; font-weight: bold; }
        .footer { font-size: 9px; color: #555; text-align: center; margin-top: 24px; letter-spacing: 0.1em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="brand">REAL PROPERTY PRIME TIME</h1>
        <div class="subbrand">Private Off-Market Briefings Network</div>

        <h3 style="color: #ffffff; font-weight: 400; font-size: 16px;">New Briefings Subscriber Enrolled</h3>
        <p style="font-size: 12px; color: #aaa;">A new recipient has requested private dispatches on off-market villas, EMAAR releases, and DHA Phase 8 land movements.</p>

        <div class="box">
          <div style="font-size: 9px; text-transform: uppercase; color: #888; margin-bottom: 4px;">Verified Subscriber Contact:</div>
          <div class="val">${emailOrPhone}</div>
          <div style="font-size: 10px; color: #10b981; margin-top: 6px;">ID: #${subscriberId || 'NEW'} • Enrolled: ${new Date().toLocaleString()}</div>
        </div>

        <div class="footer">PRIME TIME REAL ESTATE • AUTOMATED TELEMETRY</div>
      </div>
    </body>
    </html>
  `;

  const subject = `📰 [NEW BRIEFING SUBSCRIBER] ${emailOrPhone}`;

  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to: [PRIMARY_ADMIN],
      subject,
      html,
    });

    const isSandboxError = (msg?: string) => {
      const lower = (msg || '').toLowerCase();
      return lower.includes('testing') || lower.includes('domain') || lower.includes('own email address');
    };

    if (res.error && isSandboxError(res.error.message)) {
      console.warn('Resend Sandbox Mode: Delivering subscriber alert to registered account owner:', FALLBACK_ACCOUNT_OWNER);
      return await resend.emails.send({
        from: FROM_EMAIL,
        to: [FALLBACK_ACCOUNT_OWNER],
        subject,
        html,
      });
    }

    return res;
  } catch (err: any) {
    const isSandboxError = (msg?: string) => {
      const lower = (msg || '').toLowerCase();
      return lower.includes('testing') || lower.includes('domain') || lower.includes('own email address');
    };

    if (isSandboxError(err?.message)) {
      console.warn('Resend Sandbox Mode: Exception caught, delivering subscriber alert to registered account owner:', FALLBACK_ACCOUNT_OWNER);
      return await resend.emails.send({
        from: FROM_EMAIL,
        to: [FALLBACK_ACCOUNT_OWNER],
        subject,
        html,
      });
    }
    throw err;
  }
}
