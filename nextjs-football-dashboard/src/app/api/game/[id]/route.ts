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

async function loadGameForTeam(id: string, teamId: string) {
  // ⚠️ predpostavlja, da tabela tekme ima stolpec ekipa_id
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

export async function GET(_req: Request, ctx: any) {
  const auth = requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Missing game id." }, { status: 400 });
    }

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId) {
      return NextResponse.json(
        { error: "Coach has no team assigned." },
        { status: 409 }
      );
    }

    const game = await loadGameForTeam(id, teamId);
    if (!game) {
      // ali ne obstaja ali pa ni iz njegove ekipe
      return NextResponse.json(
        { error: "Game not found (or not in your team)." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { game },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("GET /api/game/[id] error:", e);
    return NextResponse.json(
      { error: "Failed to load game." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: any) {
  const auth = requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Missing game id." }, { status: 400 });
    }

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId) {
      return NextResponse.json(
        { error: "Coach has no team assigned." },
        { status: 409 }
      );
    }

    const body = (await req.json()) as Partial<{
      cas_tekme: string;
      kraj: string | null;
      nasprotnik_id: string | null;
    }>;

    const cas_tekme =
      typeof body.cas_tekme === "string" ? body.cas_tekme : undefined;

    const kraj =
      body.kraj === undefined
        ? undefined
        : body.kraj === null
        ? null
        : String(body.kraj).trim();

    const nasprotnik_id =
      body.nasprotnik_id === undefined
        ? undefined
        : body.nasprotnik_id === null
        ? null
        : String(body.nasprotnik_id).trim();

    if (cas_tekme !== undefined) {
      const d = new Date(cas_tekme);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Invalid date/time." },
          { status: 400 }
        );
      }
    }

    // ✅ preveri, da tekma obstaja IN je od njegove ekipe
    const existing = await loadGameForTeam(id, teamId);
    if (!existing) {
      return NextResponse.json(
        { error: "Game not found (or not in your team)." },
        { status: 404 }
      );
    }

    // ✅ update samo znotraj njegove ekipe
    await sql`
      UPDATE tekme
      SET
        cas_tekme = COALESCE(${cas_tekme}, cas_tekme),
        kraj = COALESCE(${kraj}, kraj),
        nasprotnik_id = COALESCE(${nasprotnik_id}, nasprotnik_id)
      WHERE id = ${id} AND ekipa_id = ${teamId};
    `;

    const game = await loadGameForTeam(id, teamId);
    return NextResponse.json({ success: true, game }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH /api/game/[id] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to save game." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: any) {
  const auth = requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Missing game id." }, { status: 400 });
    }

    const teamId = await getCoachTeamId(auth.payload.sub);
    if (!teamId) {
      return NextResponse.json(
        { error: "Coach has no team assigned." },
        { status: 409 }
      );
    }

    // ✅ delete samo če je iz njegove ekipe
    const result = await sql`
      DELETE FROM tekme
      WHERE id = ${id} AND ekipa_id = ${teamId};
    `;

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Game not found (or not in your team)." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/game/[id] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to delete game." },
      { status: 500 }
    );
  }
}
