import postgres from 'postgres';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DB povezava + secret za preverjanje JWT.
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET in env.');

type TokenPayload = {
  sub: string;
  role: 'igralec' | 'trener';
  email: string;
};

// Prebere auth cookie in vrne payload, ce je token veljaven.
async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies(); // ✅ Next 15
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Dovoli samo trenerju.
async function requireCoach() {
  const payload = await getAuthPayload();
  if (!payload) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: 'Not logged in.' }, { status: 401 }),
    };
  }
  if (payload.role !== 'trener') {
    return {
      ok: false as const,
      res: NextResponse.json({ error: 'Coach only.' }, { status: 403 }),
    };
  }
  return { ok: true as const, payload };
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

// Nalozi tekmo, ce pripada trenerjevi ekipi.
async function loadGameForTeam(id: string, teamId: string) {
  const rows = await sql`
    SELECT
      t.id,
      t.cas_tekme::text as cas_tekme,
      t.kraj,
      t.nasprotnik_id,
      n.ime as nasprotnik_ime
    FROM tekme t
    LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
    WHERE t.id = ${id} AND t.ekipa_id = ${teamId}
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

// Vrne eno tekmo (samo trener + njegova ekipa).
export async function GET(_req: Request, ctx: any) {
  const auth = await requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing game id.' }, { status: 400 });

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId)
      return NextResponse.json({ error: 'Coach has no team assigned.' }, { status: 409 });

    const game = await loadGameForTeam(id, teamId);
    if (!game)
      return NextResponse.json({ error: 'Game not found (or not in your team).' }, { status: 404 });

    return NextResponse.json({ game }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('GET /api/game/[id] error:', e);
    return NextResponse.json({ error: 'Failed to load game.' }, { status: 500 });
  }
}

// Uredi tekmo (samo trener + njegova ekipa).
export async function PATCH(req: Request, ctx: any) {
  const auth = await requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing game id.' }, { status: 400 });

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId)
      return NextResponse.json({ error: 'Coach has no team assigned.' }, { status: 409 });

    // Beremo in validiramo body.
    const body = (await req.json()) as Partial<{
      cas_tekme: string;
      kraj: string | null;
      nasprotnik_id: string | null;
    }>;

    // ✅ flags: ali je polje sploh prisotno v body?
    const hasCas = typeof body.cas_tekme === 'string';
    const hasKraj = Object.prototype.hasOwnProperty.call(body, 'kraj');
    const hasOpp = Object.prototype.hasOwnProperty.call(body, 'nasprotnik_id');

    // ✅ vrednosti (nikoli undefined!)
    const casVal = hasCas ? String(body.cas_tekme) : ''; // uporabljeno samo če hasCas=true
    const krajVal = hasKraj
      ? body.kraj === null
        ? null
        : String(body.kraj ?? '').trim() || null
      : null;
    const oppVal = hasOpp
      ? body.nasprotnik_id === null
        ? null
        : String(body.nasprotnik_id ?? '').trim() || null
      : null;

    if (hasCas) {
      const d = new Date(casVal);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid date/time.' }, { status: 400 });
      }
    }

    // ✅ preveri, da je tekma res od njegove ekipe
    const existing = await loadGameForTeam(id, teamId);
    if (!existing) {
      return NextResponse.json({ error: 'Game not found (or not in your team).' }, { status: 404 });
    }

    // ✅ UPDATE brez undefined parametrov
    await sql`
      UPDATE tekme
      SET
        cas_tekme = CASE WHEN ${hasCas} THEN ${casVal}::timestamp ELSE cas_tekme END,
        kraj = CASE WHEN ${hasKraj} THEN ${krajVal} ELSE kraj END,
        nasprotnik_id = CASE WHEN ${hasOpp} THEN ${oppVal} ELSE nasprotnik_id END
      WHERE id = ${id} AND ekipa_id = ${teamId};
    `;

    const game = await loadGameForTeam(id, teamId);
    return NextResponse.json(
      { success: true, game },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('PATCH /api/game/[id] error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to save game.' }, { status: 500 });
  }
}

// Brisanje tekme (samo trener + njegova ekipa).
export async function DELETE(_req: Request, ctx: any) {
  const auth = await requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? '');
    if (!id) return NextResponse.json({ error: 'Missing game id.' }, { status: 400 });

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId)
      return NextResponse.json({ error: 'Coach has no team assigned.' }, { status: 409 });

    const result = await sql`
      DELETE FROM tekme
      WHERE id = ${id} AND ekipa_id = ${teamId};
    `;

    if (result.count === 0) {
      return NextResponse.json({ error: 'Game not found (or not in your team).' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error('DELETE /api/game/[id] error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to delete game.' }, { status: 500 });
  }
}
