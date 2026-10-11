import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      success: true,
      message: 'Private property valuation request registered. Nadeem Sulemani and our senior advisory team will contact you confidentially.',
      valuationId,
      timestamp: new Date().toISOString(),
      details: { ownerName, phone, email, propertyLocation, propertyType, sizeDetails, notes },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process valuation request.' },
      { status: 500 }
    );
  }
}
