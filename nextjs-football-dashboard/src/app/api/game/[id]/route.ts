import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return Response.json(
        { error: "Manjka ID tekme." },
        { status: 400 }
      );
    }

    // 🔍 preveri, ali tekma obstaja
    const exists = await sql`
      SELECT id FROM tekme WHERE id = ${id} LIMIT 1;
    `;

    if (exists.length === 0) {
      return Response.json(
        { error: "Tekma ne obstaja ali je že izbrisana." },
        { status: 404 }
      );
    }

    // ❌ izbriši tekmo
    await sql`
      DELETE FROM tekme WHERE id = ${id};
    `;

    return Response.json(
      { success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/game/[id] error:", error);

    return Response.json(
      { error: error?.message ?? "Napaka pri brisanju tekme." },
      { status: 500 }
    );
  }
}
