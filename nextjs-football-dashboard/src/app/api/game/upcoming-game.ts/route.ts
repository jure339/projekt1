import postgres from "postgres";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET() {
  try {
    const rows = await sql`
      SELECT t.id,
             t.cas_tekme::text,
             t.kraj,
             n.ime as nasprotnik
      FROM tekme t
      LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
      WHERE t.cas_tekme >= NOW()
      ORDER BY t.cas_tekme ASC
      LIMIT 1;
    `;

    return Response.json({ game: rows[0] ?? null });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "Napaka" }, { status: 500 });
  }
}
