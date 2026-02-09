import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Auth status se ne cache-a, vedno sveže preverjanje.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables.');
}

type AuthPayload = {
  sub: string;
  role: 'igralec' | 'trener';
  email: string;
};

// Vrne payload iz JWT cookie-ja ali 401.
export async function GET() {
  try {
    // ✅ cookies() je async v Next 15
    // V Next 15 je cookies() async.
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    // Brez tokena ni prijave.
    if (!token) {
      return NextResponse.json({ error: 'Ni prijavljen.' }, { status: 401 });
    }

    let payload: AuthPayload;

    try {
      payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      // Neveljaven ali pretečen token.
      return NextResponse.json({ error: 'Neveljaven token.' }, { status: 401 });
    }

    return NextResponse.json(
      { user: payload },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    // Globalni fallback za nepričakovane napake.
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ error: 'Napaka na strežniku.' }, { status: 500 });
  }
}
