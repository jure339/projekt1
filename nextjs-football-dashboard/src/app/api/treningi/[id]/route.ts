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

function requireCoach() {
  const payload = getAuthPayload();
  if (!payload) {
    return { ok: false as const, res: NextResponse.json({ error: "Ni prijavljen." }, { status: 401 }) };
  }
  if (payload.role !== "trener") {
    return { ok: false as const, res: NextResponse.json({ error: "Samo trener." }, { status: 403 }) };
  }
  return { ok: true as const, payload };
}

async function loadTraining(id: string) {
  const rows = await sql`
    SELECT
      id,
      zacetek::text as zacetek,
      konec::text as konec,
      povrsina,
      opis
    FROM treningi
    WHERE id = ${id}
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
      return NextResponse.json({ error: "Manjka ID treninga." }, { status: 400 });
    }

    const training = await loadTraining(id);
    if (!training) {
      return NextResponse.json({ error: "Trening ne obstaja." }, { status: 404 });
    }

    return NextResponse.json(
      { training },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("GET /api/treningi/[id] error:", e);
    return NextResponse.json({ error: "Napaka pri nalaganju treninga." }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: any) {
  const auth = requireCoach();
  if (!auth.ok) return auth.res;

  try {
    const id = String(ctx?.params?.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Manjka ID treninga." }, { status: 400 });
    }

    const body = (await req.json()) as Partial<{
      zacetek: string;
      konec: string;
      povrsina: string;
      opis: string | null;
    }>;

    const zacetek = typeof body.zacetek === "string" ? body.zacetek : undefined;
    const konec = typeof body.konec === "string" ? body.konec : undefined;
    const povrsina = typeof body.povrsina === "string" ? body.povrsina.trim() : undefined;
    const opis =
      body.opis === undefined ? undefined : body.opis === null ? null : String(body.opis).trim();

    if (zacetek !== undefined) {
      const d = new Date(zacetek);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Neveljaven začetek." }, { status: 400 });
      }
    }

    if (konec !== undefined) {
      const d = new Date(konec);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Neveljaven konec." }, { status: 400 });
      }
    }

    if (zacetek !== undefined && konec !== undefined) {
      const a = new Date(zacetek).getTime();
      const b = new Date(konec).getTime();
      if (a >= b) {
        return NextResponse.json({ error: "Konec mora biti po začetku." }, { status: 400 });
      }
    }

    const exists = await sql`SELECT id FROM treningi WHERE id = ${id} LIMIT 1;`;
    if (exists.length === 0) {
      return NextResponse.json({ error: "Trening ne obstaja." }, { status: 404 });
    }

    await sql`
      UPDATE treningi
      SET
        zacetek = COALESCE(${zacetek}, zacetek),
        konec = COALESCE(${konec}, konec),
        povrsina = COALESCE(${povrsina}, povrsina),
        opis = COALESCE(${opis}, opis)
      WHERE id = ${id};
    `;

    const training = await loadTraining(id);
    return NextResponse.json({ success: true, training }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH /api/treningi/[id] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Napaka pri shranjevanju treninga." },
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
      return NextResponse.json({ error: "Manjka id." }, { status: 400 });
    }

    const exists = await sql`SELECT id FROM treningi WHERE id = ${id} LIMIT 1;`;
    if (exists.length === 0) {
      return NextResponse.json(
        { error: "Trening ne obstaja (ali je že izbrisan)." },
        { status: 404 }
      );
    }

    await sql`DELETE FROM treningi WHERE id = ${id};`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/treningi/[id] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Napaka pri brisanju treninga." },
      { status: 500 }
    );
  }
}
