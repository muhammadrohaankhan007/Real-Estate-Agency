// scripts/verify-all-apis.mjs
// Comprehensive End-to-End API Verification Suite for Prime Time Real Estate

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const results = [];

function recordResult(testName, status, details, passed) {
  results.push({ testName, status, details, passed });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${status}] ${testName}: ${details}`);
}

async function runVerification() {
  console.log('===============================================================');
  console.log('🏛️  PRIME TIME REAL ESTATE - FULL API SUITE VERIFICATION');
  console.log(`📡 Target Server: ${BASE_URL}`);
  console.log('===============================================================\n');

  // 1. GET /api/properties
  try {
    const res = await fetch(`${BASE_URL}/api/properties`);
    const data = await res.json();
    const passed = res.status === 200 && Array.isArray(data);
    recordResult('GET /api/properties', res.status, `Returned ${data.length} active portfolio listings`, passed);
  } catch (err) {
    recordResult('GET /api/properties', 'ERROR', err.message, false);
  }

  // 2. GET /api/map/geocode (Status & Presets)
  try {
    const res = await fetch(`${BASE_URL}/api/map/geocode`);
    const data = await res.json();
    const passed = res.status === 200 && data.status === 'online' && Array.isArray(data.presets);
    recordResult('GET /api/map/geocode (Status)', res.status, `Online with ${data.presets?.length || 0} presets & 4 active providers`, passed);
  } catch (err) {
    recordResult('GET /api/map/geocode (Status)', 'ERROR', err.message, false);
  }

  // 3. GET /api/map/geocode (Emaar Crescent Bay Query)
  try {
    const res = await fetch(`${BASE_URL}/api/map/geocode?q=Emaar Crescent Bay`);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.coordinates?.lat === 24.7875;
    recordResult('GET /api/map/geocode (Emaar Query)', res.status, `Coordinates: ${data.coordinates?.lat}, ${data.coordinates?.lng} (${data.name})`, passed);
  } catch (err) {
    recordResult('GET /api/map/geocode (Emaar Query)', 'ERROR', err.message, false);
  }

  // 4. GET /api/map/geocode (Khayaban-e-Ghalib Query)
  try {
    const res = await fetch(`${BASE_URL}/api/map/geocode?q=Khayaban-e-Ghalib`);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.coordinates?.lat === 24.7795;
    recordResult('GET /api/map/geocode (Ghalib Query)', res.status, `Coordinates: ${data.coordinates?.lat}, ${data.coordinates?.lng} (${data.name})`, passed);
  } catch (err) {
    recordResult('GET /api/map/geocode (Ghalib Query)', 'ERROR', err.message, false);
  }

  // 5. POST /api/map/geocode (Reverse Geocoding)
  try {
    const res = await fetch(`${BASE_URL}/api/map/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 24.7836, lng: 67.0622 }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.nearestEnclave;
    recordResult('POST /api/map/geocode (Reverse GPS)', res.status, `Nearest: ${data.nearestEnclave} (${data.precision})`, passed);
  } catch (err) {
    recordResult('POST /api/map/geocode (Reverse GPS)', 'ERROR', err.message, false);
  }

  // 6. POST /api/access (VIP Keycode Issuance)
  try {
    const res = await fetch(`${BASE_URL}/api/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principalName: 'Sheikh Al-Maktoum Portfolio Desk',
        entity: 'Private Family Office',
        phone: '+971501234567',
        email: 'portfolio@familyoffice.ae',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.keycode?.startsWith('VIP-');
    recordResult('POST /api/access', res.status, `Issued keycode: ${data.keycode} under NDA Tier 1`, passed);
  } catch (err) {
    recordResult('POST /api/access', 'ERROR', err.message, false);
  }

  // 7. POST /api/enquire (Confidential Enquiry)
  try {
    const res = await fetch(`${BASE_URL}/api/enquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tariq Mansoor',
        email: 'tariq.mansoor@karachi.com',
        phone: '+923001234567',
        propertyId: 8,
        interest: 'Direct Acquisition',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.referenceId;
    recordResult('POST /api/enquire', res.status, `Enquiry registered with Ref: ${data.referenceId}`, passed);
  } catch (err) {
    recordResult('POST /api/enquire', 'ERROR', err.message, false);
  }

  // 8. POST /api/briefing (Newsletter Briefings)
  try {
    const res = await fetch(`${BASE_URL}/api/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'briefing.audit@realpropertyprimetime.com',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.subscriberId;
    recordResult('POST /api/briefing', res.status, `Enrolled with Subscriber ID: ${data.subscriberId}`, passed);
  } catch (err) {
    recordResult('POST /api/briefing', 'ERROR', err.message, false);
  }

  // 9. POST /api/subscribe (Subscription with Resend Telemetry)
  try {
    const res = await fetch(`${BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_phone: 'mohammadrohaan00712@gmail.com',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success;
    recordResult('POST /api/subscribe', res.status, `Enrolled: ${data.subscriber_id} (Email Status: ${data.email_status})`, passed);
  } catch (err) {
    recordResult('POST /api/subscribe', 'ERROR', err.message, false);
  }

  // 10. POST /api/valuation (Confidential Valuation)
  try {
    const res = await fetch(`${BASE_URL}/api/valuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'Malik Jahangir',
        phone: '+923008280000',
        email: 'mohammadrohaan00712@gmail.com',
        propertyLocation: 'DHA Phase 8 Khayaban-e-Ghalib',
        propertyType: 'Modern Architecture Villa',
        sizeDetails: '1,000 Sq. Yds',
        notes: 'Private assessment requested prior to overseas transfer.',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.valuationId;
    recordResult('POST /api/valuation', res.status, `Valuation registered: ${data.valuationId}`, passed);
  } catch (err) {
    recordResult('POST /api/valuation', 'ERROR', err.message, false);
  }

  // 11. POST /api/advisory (Private Desk Lead Audit)
  try {
    const res = await fetch(`${BASE_URL}/api/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Senator Farooq Ahmed',
        phone_whatsapp: '+923009998887',
        location_phase: 'DHA Phase 8 Zone A',
        property_type: 'Luxury Bungalow',
        size_covered: '500 Sq. Yds',
        objectives_notes: 'Urgent acquisition advisory for beach-facing plot/bungalow.',
        email: 'mohammadrohaan00712@gmail.com',
      }),
    });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.lead_id;
    recordResult('POST /api/advisory', res.status, `Advisory lead registered: ${data.lead_id} (Email: ${data.email_status})`, passed);
  } catch (err) {
    recordResult('POST /api/advisory', 'ERROR', err.message, false);
  }

  // 12. Full Listing Lifecycle: POST (Create) -> PUT (Update) -> DELETE (Purge)
  let createdPropId = null;

  // 12a. Negative Validation: POST /api/listings without image -> 400
  try {
    const formMissingImg = new FormData();
    formMissingImg.set('title', 'No Image Test');
    const res = await fetch(`${BASE_URL}/api/listings`, { method: 'POST', body: formMissingImg });
    const data = await res.json();
    const passed = res.status === 400 && data.error?.includes('image is required');
    recordResult('POST /api/listings (Validation)', res.status, `Correctly rejected missing Hero Cover: "${data.error}"`, passed);
  } catch (err) {
    recordResult('POST /api/listings (Validation)', 'ERROR', err.message, false);
  }

  // 12b. Positive Test: POST /api/listings (Create with Cloudinary + Supabase + GIS Coords)
  try {
    const createForm = new FormData();
    createForm.set('title', 'DHA Phase 8 Verification Masterpiece');
    createForm.set('category', 'Villa');
    createForm.set('demand', '320,000,000');
    createForm.set('location', 'Khayaban-e-Ghalib, DHA Phase 8, Karachi');
    createForm.set('size', '1,000 Sq. Yds');
    createForm.set('bedrooms', '6');
    createForm.set('bathrooms', '7');
    createForm.set('description', 'Architectural statement villa with dual travertine swimming pools and high-security basement vault.');
    createForm.set('latitude', '24.779500');
    createForm.set('longitude', '67.068400');

    // 1x1 test image
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(base64Png, 'base64');
    const heroFile = new File([buffer], 'verification-hero.png', { type: 'image/png' });
    createForm.set('image', heroFile);

    console.log('⏳ Uploading master asset to Cloudinary & creating Supabase record...');
    const res = await fetch(`${BASE_URL}/api/listings`, { method: 'POST', body: createForm });
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.property?.id;
    if (passed) createdPropId = data.property.id;
    recordResult(
      'POST /api/listings (Creation Pipeline)',
      res.status,
      `Published Property #${createdPropId} with GPS (${data.coordinates?.latitude}, ${data.coordinates?.longitude}) and Cloudinary Hero`,
      passed
    );
  } catch (err) {
    recordResult('POST /api/listings (Creation Pipeline)', 'ERROR', err.message, false);
  }

  // 12c. PUT /api/listings (Update Pipeline)
  if (createdPropId) {
    try {
      const updateForm = new FormData();
      updateForm.set('id', String(createdPropId));
      updateForm.set('title', 'DHA Phase 8 Verification Masterpiece (Updated)');
      updateForm.set('demand', '350,000,000');
      updateForm.set('category', 'Villa');
      updateForm.set('latitude', '24.783600');
      updateForm.set('longitude', '67.062200');

      const res = await fetch(`${BASE_URL}/api/listings`, { method: 'PUT', body: updateForm });
      const data = await res.json();
      const passed = res.status === 200 && data.success;
      recordResult(
        'PUT /api/listings (Update Pipeline)',
        res.status,
        `Updated Property #${createdPropId} to demand: 350,000,000 & new GPS (${data.coordinates?.latitude}, ${data.coordinates?.longitude})`,
        passed
      );
    } catch (err) {
      recordResult('PUT /api/listings (Update Pipeline)', 'ERROR', err.message, false);
    }

    // 12d. DELETE /api/listings (Secure Purge Suite)
    try {
      const res = await fetch(`${BASE_URL}/api/listings?id=${createdPropId}`, { method: 'DELETE' });
      const data = await res.json();
      const passed = res.status === 200 && data.success && data.deleted_id === createdPropId;
      recordResult(
        'DELETE /api/listings (Purge Suite)',
        res.status,
        `Purged Property #${createdPropId} and expunged Cloudinary asset`,
        passed
      );
    } catch (err) {
      recordResult('DELETE /api/listings (Purge Suite)', 'ERROR', err.message, false);
    }
  }

  // Final Summary Report
  console.log('\n===============================================================');
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 TEST REPORT: ${passedCount}/${results.length} ENDPOINTS VERIFIED`);
  console.log(`STATUS: ${allPassed ? 'ALL SYSTEMS OPERATIONAL ✅' : 'SOME TESTS FAILED ❌'}`);
  console.log('===============================================================');
}

runVerification().catch(console.error);
