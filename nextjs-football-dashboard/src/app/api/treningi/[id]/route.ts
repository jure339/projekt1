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
      return Response.json({ error: "Manjka id." }, { status: 400 });
    }

    // Optional: preveri, ali obstaja
    const exists = await sql`SELECT id FROM treningi WHERE id = ${id} LIMIT 1;`;
    if (exists.length === 0) {
      return Response.json({ error: "Trening ne obstaja (ali je že izbrisan)." }, { status: 404 });
    }

    // Izbriši
    await sql`DELETE FROM treningi WHERE id = ${id};`;

    return Response.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/treningi/[id] error:", e);
    return Response.json(
      { error: e?.message ?? "Napaka pri brisanju treninga." },
      { status: 500 }
    );
  }
}
