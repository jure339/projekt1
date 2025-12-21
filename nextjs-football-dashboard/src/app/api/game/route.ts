import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: "igralec" | "trener";
  email: string;
};

function getAuthPayload(): TokenPayload | null {
  const token = cookies().get("auth")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

function requireCoach() {
  const payload = getAuthPayload();
  if (!payload) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Not logged in." }, { status: 401 }),
    };
  }
  if (payload.role !== "trener") {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Coach only." }, { status: 403 }),
    };
  }
  return { ok: true as const, payload };
}

async function getCoachTeamId(coachId: string): Promise<string | null> {
  const rows = await sql`
    SELECT ekipa_id
    FROM trenerji
    WHERE id = ${coachId}
    LIMIT 1;
  `;
  return rows[0]?.ekipa_id ?? null;
}

export async function GET() {
  const auth = requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId) {
      return NextResponse.json(
        { error: "Coach has no team assigned.", games: [] },
        { status: 409 }
      );
    }

    const rows = await sql`
      SELECT
        t.id,
        t.cas_tekme::text as cas_tekme,
        t.kraj,
        n.ime as nasprotnik
      FROM tekme t
      LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
      WHERE t.ekipa_id = ${teamId}
      ORDER BY t.cas_tekme ASC;
    `;

    return NextResponse.json(
      { games: rows },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/game error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to load games.", games: [] },
      { status: 500 }
    );
  }
}
