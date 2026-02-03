import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DB povezava + secret za preverjanje JWT.
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: 'igralec' | 'trener';
  email: string;
};

// Prebere auth cookie in vrne payload, ce je token veljaven.
async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Vrne ekipa_id za trenerja.
async function getCoachTeamId(coachId: string): Promise<string | null> {
  const rows = await sql`
    SELECT ekipa_id
    FROM trenerji
    WHERE id = ${coachId}
    LIMIT 1;
  `;
  return rows[0]?.ekipa_id ?? null;
}

/**
 * GET /api/game
 * Returns only games for the logged-in coach's team.
 */
// Vrne tekme trenutnega trenerja (samo njegova ekipa).
export async function GET() {
  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Not logged in.', games: [] }, { status: 401 });
    }
    if (payload.role !== 'trener') {
      return NextResponse.json({ error: 'Coach only.', games: [] }, { status: 403 });
    }

    const teamId = await getCoachTeamId(payload.sub);
    if (!teamId) {
      return NextResponse.json(
        { error: 'Coach has no team assigned.', games: [] },
        { status: 409 },
      );
    }

    const rows = await sql`
      SELECT
        t.id,
        t.cas_tekme::text AS cas_tekme,
        t.kraj,
        n.ime AS nasprotnik
      FROM tekme t
      LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
      WHERE t.ekipa_id = ${teamId}
      ORDER BY t.cas_tekme ASC;
    `;

    return NextResponse.json(
      { games: rows },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('GET /api/game error:', e);
    return NextResponse.json(
      { error: e?.message ?? 'Failed to load games.', games: [] },
      { status: 500 },
    );
  }
}

/**
 * POST /api/game
 * Creates a game and attaches it to the coach's team.
 */
// Ustvari tekmo za trenerjevo ekipo.
export async function POST(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
    }
    if (payload.role !== 'trener') {
      return NextResponse.json({ error: 'Coach only.' }, { status: 403 });
    }

    const teamId = await getCoachTeamId(payload.sub);
    if (!teamId) {
      return NextResponse.json({ error: 'Coach has no team assigned.' }, { status: 409 });
    }

    // Beremo in validiramo body.
    const body = (await req.json()) as Partial<{
      cas_tekme: string; // ISO
      kraj: string | null;
      nasprotnik_id: string | null;
    }>;

    const cas_tekme = typeof body.cas_tekme === 'string' ? body.cas_tekme : '';

    const kraj =
      body.kraj === null ? null : typeof body.kraj === 'string' ? body.kraj.trim() || null : null;

    const nasprotnik_id =
      body.nasprotnik_id === null
        ? null
        : typeof body.nasprotnik_id === 'string' && body.nasprotnik_id.trim()
          ? body.nasprotnik_id.trim()
          : null;

    if (!cas_tekme) {
      return NextResponse.json({ error: 'Game date & time is required.' }, { status: 400 });
    }

    const d = new Date(cas_tekme);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time.' }, { status: 400 });
    }

    const id = randomUUID();

    await sql`
      INSERT INTO tekme (id, ekipa_id, cas_tekme, kraj, nasprotnik_id)
      VALUES (${id}, ${teamId}, ${cas_tekme}, ${kraj}, ${nasprotnik_id});
    `;

    const rows = await sql`
      SELECT
        t.id,
        t.cas_tekme::text AS cas_tekme,
        t.kraj,
        t.nasprotnik_id,
        n.ime AS nasprotnik_ime
      FROM tekme t
      LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
      WHERE t.id = ${id}
      LIMIT 1;
    `;

    return NextResponse.json(
      { success: true, game: rows[0] },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('POST /api/game error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to create game.' }, { status: 500 });
  }
}
