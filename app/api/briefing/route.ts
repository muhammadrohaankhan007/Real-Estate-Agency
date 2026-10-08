import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      success: true,
      message: 'Subscribed to Private Briefings. Karachi off-market alerts activated.',
      subscriberId,
      email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid payload.' },
      { status: 500 }
    );
  }
}
