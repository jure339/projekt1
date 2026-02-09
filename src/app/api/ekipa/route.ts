import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: 'igralec' | 'trener';
  email: string;
};

async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies(); // ✅ Next.js 15
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
    }
    if (payload.role !== 'trener') {
      return NextResponse.json({ error: 'Only coach can create a team.' }, { status: 403 });
    }

    const body = (await req.json()) as { ime?: string };
    const ime = String(body?.ime ?? '').trim();

    if (!ime) {
      return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });
    }

    // ✅ preberi trenerja
    const coachRows = await sql`
      SELECT id, ekipa_id
      FROM trenerji
      WHERE id = ${payload.sub}
      LIMIT 1;
    `;
    const coach = coachRows[0];

    if (!coach) {
      return NextResponse.json({ error: 'Coach does not exist.' }, { status: 404 });
    }

    // Če hočeš dovoliti samo eno ekipo:
    if (coach.ekipa_id) {
      return NextResponse.json({ error: 'Coach already has a team assigned.' }, { status: 409 });
    }

    const teamId = randomUUID();

    // ✅ transakcija: ustvari ekipo + dodeli trenerju
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO ekipe (id, ime)
        VALUES (${teamId}, ${ime});
      `;

      const updated = await tx`
        UPDATE trenerji
        SET ekipa_id = ${teamId}
        WHERE id = ${payload.sub}
        RETURNING id, ekipa_id;
      `;

      if (!updated[0]?.ekipa_id) {
        // če bi se iz kakršnegakoli razloga update “spregledal”
        throw new Error('Failed to assign team to coach.');
      }
    });

    // ✅ vrni posodobljenega trenerja
    const updatedCoachRows = await sql`
      SELECT id, ime, priimek, email, ekipa_id
      FROM trenerji
      WHERE id = ${payload.sub}
      LIMIT 1;
    `;

    return NextResponse.json(
      {
        success: true,
        team: { id: teamId, ime },
        coach: updatedCoachRows[0],
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('POST /api/ekipa error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to create team.' }, { status: 500 });
  }
}
