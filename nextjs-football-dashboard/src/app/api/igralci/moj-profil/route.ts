import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string; // igralci.id
  role: "igralec" | "trener";
  email: string;
};

function getAuthPayload() {
  const token = cookies().get("auth")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const payload = getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }
    if (payload.role !== "igralec") {
      return NextResponse.json({ error: "Dostop zavrnjen." }, { status: 403 });
    }

    const rows = await sql`
      SELECT id, ime, priimek, email, starost, pozicija
      FROM igralci
      WHERE id = ${payload.sub}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Igralec ne obstaja." }, { status: 404 });
    }

    return NextResponse.json(
      { player: rows[0] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("GET /api/igralci/moj-profil error:", e);
    return NextResponse.json({ error: "Napaka pri nalaganju profila." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }
    if (payload.role !== "igralec") {
      return NextResponse.json({ error: "Dostop zavrnjen." }, { status: 403 });
    }

    const body = (await req.json()) as Partial<{
      ime: string;
      priimek: string;
      email: string;
      starost: number;
      pozicija: string | null;
    }>;

    // osnovna validacija
    const ime = typeof body.ime === "string" ? body.ime.trim() : undefined;
    const priimek = typeof body.priimek === "string" ? body.priimek.trim() : undefined;
    const email = typeof body.email === "string" ? body.email.trim() : undefined;

    const starost =
      body.starost === null || body.starost === undefined
        ? undefined
        : Number(body.starost);

    const pozicija =
      body.pozicija === undefined ? undefined : (body.pozicija === null ? null : String(body.pozicija).trim());

    if (email !== undefined && !email.includes("@")) {
      return NextResponse.json({ error: "Neveljaven email." }, { status: 400 });
    }
    if (starost !== undefined && (!Number.isFinite(starost) || starost < 5 || starost > 90)) {
      return NextResponse.json({ error: "Neveljavna starost." }, { status: 400 });
    }

    // nič za posodobit?
    if (ime === undefined && priimek === undefined && email === undefined && starost === undefined && pozicija === undefined) {
      return NextResponse.json({ error: "Ni sprememb." }, { status: 400 });
    }

    // posodobi
    const rows = await sql`
      UPDATE igralci
      SET
        ime = COALESCE(${ime}, ime),
        priimek = COALESCE(${priimek}, priimek),
        email = COALESCE(${email}, email),
        starost = COALESCE(${starost}, starost),
        pozicija = COALESCE(${pozicija}, pozicija)
      WHERE id = ${payload.sub}
      RETURNING id, ime, priimek, email, starost, pozicija;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Igralec ne obstaja." }, { status: 404 });
    }

    return NextResponse.json({ success: true, player: rows[0] }, { status: 200 });
  } catch (e: any) {
    // če je email UNIQUE, bo tu pogosto prišla napaka
    const msg = String(e?.message ?? "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "Ta email je že v uporabi." }, { status: 409 });
    }

    console.error("PATCH /api/igralci/moj-profil error:", e);
    return NextResponse.json({ error: "Napaka pri shranjevanju profila." }, { status: 500 });
  }
}
