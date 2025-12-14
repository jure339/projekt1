import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, ime
      FROM nasprotne_ekipe
      ORDER BY ime ASC;
    `;

    return Response.json(
      { teams: rows },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/nasprotne-ekipe error:", e);
    return Response.json({ error: e.message ?? "Napaka." }, { status: 500 });
  }
}
