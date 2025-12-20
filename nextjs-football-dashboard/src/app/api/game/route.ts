import postgres from "postgres";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

/* =========================
   GET – seznam tekem
========================= */
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        t.id,
        t.cas_tekme::text,
        t.kraj,
        n.ime AS nasprotnik
      FROM tekme t
      LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
      ORDER BY t.cas_tekme ASC;
    `;

    return Response.json(
      { games: rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/game error:", e);
    return Response.json(
      { error: e?.message ?? "Napaka", games: [] },
      { status: 500 }
    );
  }
}

/* =========================
   POST – dodaj tekmo (INSERT)
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cas_tekme = body?.cas_tekme;
    const kraj = body?.kraj;
    const nasprotnik_id = body?.nasprotnik_id ?? null;

    if (!cas_tekme || !kraj) {
      return Response.json(
        { error: "Manjkajo obvezni podatki (cas_tekme ali kraj)." },
        { status: 400 }
      );
    }

    // ✅ ročno generiran ID (UUID string)
    const id = crypto.randomUUID();

    const inserted = await sql`
      INSERT INTO tekme (id, cas_tekme, kraj, nasprotnik_id)
      VALUES (${id}, ${cas_tekme}, ${kraj}, ${nasprotnik_id})
      RETURNING id;
    `;

    return Response.json(
      { success: true, id: inserted[0]?.id ?? id },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("POST /api/game error:", e);
    return Response.json(
      { error: e?.message ?? "Napaka pri shranjevanju tekme." },
      { status: 500 }
    );
  }
}
