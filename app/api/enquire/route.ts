import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, propertyId, interest } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const referenceId = `PT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    return NextResponse.json({
      success: true,
      message: 'Confidential enquiry received. Private advisor will contact you within 2 hours.',
      referenceId,
      timestamp: new Date().toISOString(),
      details: { name, email, phone, propertyId, interest },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid payload.' },
      { status: 500 }
    );
  }
}
