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
      return Response.json({ error: "Manjka ID igralca." }, { status: 400 });
    }

    // ✅ Najprej pobriši povezave (če obstajajo)
    await sql`DELETE FROM igralec_trening WHERE igralec_id = ${id};`;
    await sql`DELETE FROM igralec_tekma WHERE igralec_id = ${id};`;

    // ✅ Nato izbriši igralca
    const result = await sql`DELETE FROM igralci WHERE id = ${id};`;

    if (result.count === 0) {
      return Response.json({ error: "Igralec ne obstaja ali je že izbrisan." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e: any) {
    console.error("DELETE /api/igralci/[id] error:", e);
    return Response.json(
      { error: e?.message ?? "Napaka pri brisanju igralca." },
      { status: 500 }
    );
  }
}
