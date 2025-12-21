import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = { sub: string; role: "igralec" | "trener"; email: string };

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

export async function GET() {
  try {
    const payload = await getAuthPayload();
    if (!payload) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    if (payload.role !== "trener") return NextResponse.json({ error: "Coach only." }, { status: 403 });

    const rows = await sql`
      SELECT id, ime, priimek, email, ekipa_id
      FROM trenerji
      WHERE id = ${payload.sub}
      LIMIT 1;
    `;

    const coach = rows[0];
    if (!coach) return NextResponse.json({ error: "Coach not found." }, { status: 404 });

    return NextResponse.json(
      { coach },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("GET /api/trenerji/moj-profil error:", e);
    return NextResponse.json({ error: "Failed to load coach." }, { status: 500 });
  }
}
