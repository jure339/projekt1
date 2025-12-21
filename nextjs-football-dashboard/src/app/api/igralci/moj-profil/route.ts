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

function getAuthPayload() {
  const token = cookies().get("auth")?.value;
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

export async function GET() {
  try {
    const payload = getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }
    if (payload.role !== "igralec") {
      return NextResponse.json({ error: "Samo igralec." }, { status: 403 });
    }

    const player = await loadPlayerWithNames(payload.sub);
    if (!player) {
      return NextResponse.json({ error: "Igralec ne obstaja." }, { status: 404 });
    }

    return NextResponse.json(
      { player },
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
      return NextResponse.json({ error: "Samo igralec." }, { status: 403 });
    }

    const body = (await req.json()) as Partial<{
      ime: string;
      priimek: string;
      email: string;
      starost: number;
      visina: number | null;
      stevilka_dresa: number | null;
      pozicija_id: string | null;
    }>;

    // --- normalizacija ---
    const ime = typeof body.ime === "string" ? body.ime.trim() : undefined;
    const priimek = typeof body.priimek === "string" ? body.priimek.trim() : undefined;
    const email = typeof body.email === "string" ? body.email.trim() : undefined;

    const starost = body.starost === undefined ? undefined : Number(body.starost);
    const visina =
      body.visina === undefined ? undefined : body.visina === null ? null : Number(body.visina);
    const stevilka_dresa =
      body.stevilka_dresa === undefined
        ? undefined
        : body.stevilka_dresa === null
        ? null
        : Number(body.stevilka_dresa);

    // Pozicija: pomembno je razlikovati med:
    // - undefined (ne spreminjaj)
    // - null (nastavi NULL)
    // - string uuid (nastavi uuid)
    const pozicija_id =
      body.pozicija_id === undefined
        ? undefined
        : body.pozicija_id === null
        ? null
        : String(body.pozicija_id).trim();

    // --- validacije ---
    if (email !== undefined && !email.includes("@")) {
      return NextResponse.json({ error: "Neveljaven email." }, { status: 400 });
    }
    if (starost !== undefined && (!Number.isFinite(starost) || starost < 5 || starost > 90)) {
      return NextResponse.json({ error: "Neveljavna starost." }, { status: 400 });
    }
    if (
      visina !== undefined &&
      visina !== null &&
      (!Number.isFinite(visina) || visina < 80 || visina > 260)
    ) {
      return NextResponse.json({ error: "Neveljavna višina." }, { status: 400 });
    }
    if (
      stevilka_dresa !== undefined &&
      stevilka_dresa !== null &&
      (!Number.isFinite(stevilka_dresa) || stevilka_dresa < 0 || stevilka_dresa > 99)
    ) {
      return NextResponse.json({ error: "Neveljavna številka dresa." }, { status: 400 });
    }

    // --- UPDATE (brez COALESCE za pozicija_id!) ---
    // COALESCE pri pozicija_id je problem, ker ne moreš nastaviti NULL.
    await sql`
      UPDATE igralci
      SET
        ime = COALESCE(${ime}, ime),
        priimek = COALESCE(${priimek}, priimek),
        email = COALESCE(${email}, email),
        starost = COALESCE(${starost}, starost),
        visina = COALESCE(${visina}, visina),
        stevilka_dresa = COALESCE(${stevilka_dresa}, stevilka_dresa),
        pozicija_id =
          CASE
            WHEN ${pozicija_id}::text IS NULL THEN pozicija_id
            WHEN ${pozicija_id}::text = '' THEN pozicija_id
            ELSE ${pozicija_id}::uuid
          END
      WHERE id = ${payload.sub};
    `;

    // ⚠️ zgornji CASE pusti staro, če je undefined, ampak če želiš NULL moraš poslati `null`.
    // Ker `undefined` sploh ne pride v JSON, je ok.

    // ✅ če je pozicija_id v body eksplicitno null -> nastavi NULL (posebej)
    if (body.pozicija_id === null) {
      await sql`UPDATE igralci SET pozicija_id = NULL WHERE id = ${payload.sub};`;
    }

    const player = await loadPlayerWithNames(payload.sub);
    if (!player) {
      return NextResponse.json({ error: "Igralec ne obstaja." }, { status: 404 });
    }

    return NextResponse.json({ success: true, player }, { status: 200 });
  } catch (e: any) {
    const msg = String(e?.message ?? "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "Ta email je že v uporabi." }, { status: 409 });
    }

    console.error("PATCH /api/igralci/moj-profil error:", e);
    return NextResponse.json({ error: "Napaka pri shranjevanju profila." }, { status: 500 });
  }
}
