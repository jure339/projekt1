import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ekipaId = searchParams.get("ekipaId");

    if (!ekipaId) {
      return Response.json({ training: null, error: "Missing ekipaId" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, zacetek::text, konec::text, povrsina, opis
      FROM treningi
      WHERE ekipa_id = ${ekipaId}
        AND zacetek >= NOW()
      ORDER BY zacetek ASC
      LIMIT 1;
    `;

    return Response.json(
      { training: rows[0] ?? null },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("upcoming training error:", e);
    return Response.json({ training: null, error: e.message ?? "Napaka" }, { status: 500 });
  }
}
