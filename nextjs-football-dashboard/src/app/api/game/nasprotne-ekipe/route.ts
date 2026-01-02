import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: "igralec" | "trener";
  email: string;
};

async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

async function requireCoach() {
  const payload = await getAuthPayload();

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

// ✅ GET: list opponents
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, ime
      FROM nasprotne_ekipe
      ORDER BY ime ASC;
    `;

    return NextResponse.json(
      { teams: rows },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/game/nasprotne-ekipe error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to load opponents.", teams: [] },
      { status: 500 }
    );
  }
}

// ✅ POST: add opponent (coach only)
export async function POST(req: Request) {
  const auth = await requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const body = (await req.json()) as { ime?: string };
    const ime = String(body?.ime ?? "").trim();

    if (!ime) {
      return NextResponse.json(
        { error: "Opponent name is required." },
        { status: 400 }
      );
    }

    // optional: prevent duplicates by name
    const exists = await sql`
      SELECT id, ime
      FROM nasprotne_ekipe
      WHERE LOWER(ime) = LOWER(${ime})
      LIMIT 1;
    `;

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Opponent already exists.", opponent: exists[0] },
        { status: 409 }
      );
    }

    const id = randomUUID();

    await sql`
      INSERT INTO nasprotne_ekipe (id, ime)
      VALUES (${id}, ${ime});
    `;

    return NextResponse.json(
      { success: true, opponent: { id, ime } },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("POST /api/game/nasprotne-ekipe error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to create opponent." },
      { status: 500 }
    );
  }
}
