import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, naziv, kratica
      FROM pozicije
      ORDER BY naziv ASC;
    `;

    return Response.json({ pozicije: rows }, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error.message ?? "Napaka." }, { status: 500 });
  }
}
