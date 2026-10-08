import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { principalName, entity, phone, email } = body;

    if (!principalName || !email) {
      return NextResponse.json(
        { success: false, message: 'Representative name and email are required.' },
        { status: 400 }
      );
    }

    const keycode = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      message: 'Private access keycode issued under NDA protocols.',
      keycode,
      accessTier: 'Tier 1 Private Registry',
      principal: principalName,
      entity: entity || 'Private Principal',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid payload.' },
      { status: 500 }
    );
  }
}
