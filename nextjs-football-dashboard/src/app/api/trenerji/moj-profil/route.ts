import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = { sub: string; role: "igralec" | "trener"; email: string };

function getAuthPayload(): TokenPayload | null {
  const token = cookies().get("auth")?.value; // ✅ brez await
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

async function loadCoach(coachId: string) {
  const rows = await sql`
    SELECT id, ime, priimek, email, starost, ekipa_id
    FROM trenerji
    WHERE id = ${coachId}
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function GET() {
  try {
    const payload = getAuthPayload();
    if (!payload) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    if (payload.role !== "trener") return NextResponse.json({ error: "Coach only." }, { status: 403 });

    const coach = await loadCoach(payload.sub);
    if (!coach) return NextResponse.json({ error: "Coach not found." }, { status: 404 });

    return NextResponse.json(
      { coach },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/trenerji/moj-profil error:", e);
    return NextResponse.json({ error: e?.message ?? "Failed to load coach." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = getAuthPayload();
    if (!payload) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    if (payload.role !== "trener") return NextResponse.json({ error: "Coach only." }, { status: 403 });

    const body = (await req.json()) as Partial<{
      ime: string;
      priimek: string;
      email: string;
      starost: number;
      password: string;
    }>;

    const ime = typeof body.ime === "string" ? body.ime.trim() : undefined;
    const priimek = typeof body.priimek === "string" ? body.priimek.trim() : undefined;
    const email = typeof body.email === "string" ? body.email.trim() : undefined;

    const starost =
      body.starost === undefined ? undefined : Number(body.starost);

    const newPassword =
      typeof body.password === "string" ? body.password.trim() : undefined;

    // ✅ Validacije
    if (email !== undefined && !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (starost !== undefined && (!Number.isFinite(starost) || starost < 10 || starost > 100)) {
      return NextResponse.json({ error: "Invalid age." }, { status: 400 });
    }
    if (newPassword !== undefined && newPassword.length > 0 && newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const passwordHash =
      newPassword && newPassword.length > 0 ? await bcrypt.hash(newPassword, 10) : undefined;

    // ✅ Coach obstaja?
    const existing = await loadCoach(payload.sub);
    if (!existing) return NextResponse.json({ error: "Coach not found." }, { status: 404 });

    await sql`
      UPDATE trenerji
      SET
        ime = COALESCE(${ime ?? null}, ime),
        priimek = COALESCE(${priimek ?? null}, priimek),
        email = COALESCE(${email ?? null}, email),
        starost = COALESCE(${starost ?? null}, starost),
        password = COALESCE(${passwordHash ?? null}, password)
      WHERE id = ${payload.sub};
    `;

    const coach = await loadCoach(payload.sub);

    return NextResponse.json(
      { success: true, coach },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    const msg = String(e?.message ?? "");

    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "This email is already in use." }, { status: 409 });
    }

    console.error("PATCH /api/trenerji/moj-profil error:", e);
    // ✅ Zelo pomembno: vrni realen message, da vidiš, kaj je narobe
    return NextResponse.json({ error: msg || "Failed to save coach profile." }, { status: 500 });
  }
}
