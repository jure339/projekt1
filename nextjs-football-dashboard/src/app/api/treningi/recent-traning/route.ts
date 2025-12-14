import postgres from "postgres";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ekipaId = searchParams.get("ekipaId");
    if (!ekipaId) return Response.json({ error: "Missing ekipaId" }, { status: 400 });

    const rows = await sql`
      SELECT id, zacetek::text, konec::text, povrsina, opis
      FROM treningi
      WHERE ekipa_id = ${ekipaId}
      ORDER BY zacetek DESC
      LIMIT 1;
    `;

    return Response.json({ training: rows[0] ?? null });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "Napaka" }, { status: 500 });
  }
}
