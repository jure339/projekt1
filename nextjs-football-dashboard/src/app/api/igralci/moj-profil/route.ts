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

async function loadPlayerWithNames(playerId: string) {
  const rows = await sql`
    SELECT
      i.id,
      i.ime,
      i.priimek,
      i.email,
      i.starost,
      i.visina,
      i.stevilka_dresa,

      i.ekipa_id,
      e.ime as ekipa_ime,

      i.pozicija_id,
      p.naziv as pozicija_naziv,
      p.kratica as pozicija_kratica
    FROM igralci i
    LEFT JOIN ekipe e ON e.id = i.ekipa_id
    LEFT JOIN pozicije p ON p.id = i.pozicija_id
    WHERE i.id = ${playerId}
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET() {
  try {
    const payload = await getAuthPayload();
    if (!payload) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    if (payload.role !== "igralec") return NextResponse.json({ error: "Player only." }, { status: 403 });

    const player = await loadPlayerWithNames(payload.sub);
    if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

    return NextResponse.json({ player }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("GET /api/igralci/moj-profil error:", e);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    if (payload.role !== "igralec") return NextResponse.json({ error: "Player only." }, { status: 403 });

    // varno preberi JSON
    let body: Partial<{
      ime: string;
      priimek: string;
      email: string;
      starost: number;
      visina: number | null;
      stevilka_dresa: number | null;
      pozicija_id: string | null;

      // ✅ novo geslo (opcijsko)
      password: string;
    }> = {};

    try {
      body = (await req.json()) ?? {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const hasIme = body.ime !== undefined;
    const hasPriimek = body.priimek !== undefined;
    const hasEmail = body.email !== undefined;
    const hasStarost = body.starost !== undefined;
    const hasVisina = body.visina !== undefined;
    const hasStevilka = body.stevilka_dresa !== undefined;
    const hasPozicijaRaw = body.pozicija_id !== undefined;

    // ✅ password: posodobi samo če je vpisan (ne prazen)
    const password = body.password !== undefined ? String(body.password ?? "") : "";
    const hasPassword = body.password !== undefined && password.trim().length > 0;

    const ime = hasIme ? String(body.ime ?? "").trim() : "";
    const priimek = hasPriimek ? String(body.priimek ?? "").trim() : "";
    const email = hasEmail ? String(body.email ?? "").trim() : "";

    const starost = hasStarost ? Number(body.starost) : 0;
    const visina = hasVisina ? (body.visina === null ? null : Number(body.visina)) : 0;
    const stevilka_dresa = hasStevilka
      ? body.stevilka_dresa === null
        ? null
        : Number(body.stevilka_dresa)
      : 0;

    // pozicija_id: 3 stanja
    let setPozNull = false;
    let setPozVal = false;
    let pozicijaUuid = "";

    if (hasPozicijaRaw) {
      if (body.pozicija_id === null) {
        setPozNull = true;
      } else {
        const p = String(body.pozicija_id ?? "").trim();
        if (p !== "") {
          if (!isUuid(p)) {
            return NextResponse.json({ error: "Invalid pozicija_id (must be UUID)." }, { status: 400 });
          }
          setPozVal = true;
          pozicijaUuid = p;
        }
      }
    }

    // validacije (brez dolžine gesla)
    if (hasIme && !ime) return NextResponse.json({ error: "First name is required." }, { status: 400 });
    if (hasPriimek && !priimek) return NextResponse.json({ error: "Last name is required." }, { status: 400 });

    if (hasEmail && email && !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (hasStarost && (!Number.isFinite(starost) || starost < 5 || starost > 90)) {
      return NextResponse.json({ error: "Invalid age." }, { status: 400 });
    }
    if (hasVisina && visina !== null && (!Number.isFinite(visina) || visina < 80 || visina > 260)) {
      return NextResponse.json({ error: "Invalid height." }, { status: 400 });
    }
    if (
      hasStevilka &&
      stevilka_dresa !== null &&
      (!Number.isFinite(stevilka_dresa) || stevilka_dresa < 0 || stevilka_dresa > 99)
    ) {
      return NextResponse.json({ error: "Invalid shirt number." }, { status: 400 });
    }

    const nothingToUpdate =
      !hasIme &&
      !hasPriimek &&
      !hasEmail &&
      !hasStarost &&
      !hasVisina &&
      !hasStevilka &&
      !hasPozicijaRaw &&
      !hasPassword;

    if (nothingToUpdate) {
      const player = await loadPlayerWithNames(payload.sub);
      return NextResponse.json({ success: true, player }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    await sql`
      UPDATE igralci
      SET
        ime = CASE WHEN ${hasIme} THEN ${ime} ELSE ime END,
        priimek = CASE WHEN ${hasPriimek} THEN ${priimek} ELSE priimek END,
        email = CASE WHEN ${hasEmail} THEN ${email} ELSE email END,
        starost = CASE WHEN ${hasStarost} THEN ${starost} ELSE starost END,
        visina = CASE WHEN ${hasVisina} THEN ${visina} ELSE visina END,
        stevilka_dresa = CASE WHEN ${hasStevilka} THEN ${stevilka_dresa} ELSE stevilka_dresa END,
        pozicija_id = CASE
          WHEN ${setPozNull} THEN NULL
          WHEN ${setPozVal} THEN ${pozicijaUuid}::uuid
          ELSE pozicija_id
        END,
        "password" = CASE
          WHEN ${hasPassword} THEN ${password}
          ELSE "password"
        END
      WHERE id = ${payload.sub};
    `;

    const player = await loadPlayerWithNames(payload.sub);
    if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

    return NextResponse.json({ success: true, player }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    const msg = String(e?.message ?? "");

    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }

    console.error("PATCH /api/igralci/moj-profil error:", e);
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}
