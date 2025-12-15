import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return Response.json({ error: "Manjka ID ekipe." }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, ime
      FROM ekipe
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return Response.json({ error: "Ekipa ne obstaja." }, { status: 404 });
    }

    return Response.json({ ekipa: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/ekipa/[id] error:", error);
    return Response.json({ error: "Napaka pri nalaganju ekipe." }, { status: 500 });
  }
}
