import postgres from "postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Manjka ID ekipe." }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, ime
      FROM ekipe
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Ekipa ne obstaja." }, { status: 404 });
    }

    return NextResponse.json({ ekipa: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/ekipa/[id] error:", error);
    return NextResponse.json(
      { error: "Napaka pri nalaganju ekipe." },
      { status: 500 }
    );
  }
}
