import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      ORDER BY t.cas_tekme ASC;
    `;

    return Response.json({ games: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/game error:", e);
    return Response.json({ error: e.message ?? "Napaka", games: [] }, { status: 500 });
  }
}
