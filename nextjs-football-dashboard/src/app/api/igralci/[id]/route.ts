import postgres from "postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/igralci/[id]">
) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return Response.json({ error: "Manjka ID igralca." }, { status: 400 });
    }

    // Če je id v bazi integer, raje:
    // const idNum = Number(id);
    // if (!Number.isFinite(idNum)) {
    //   return Response.json({ error: "Neveljaven ID igralca." }, { status: 400 });
    // }

    await sql`DELETE FROM igralec_trening WHERE igralec_id = ${id};`;
    await sql`DELETE FROM igralec_tekma WHERE igralec_id = ${id};`;

    const result = await sql`DELETE FROM igralci WHERE id = ${id};`;

    if (result.count === 0) {
      return Response.json(
        { error: "Igralec ne obstaja ali je že izbrisan." },
        { status: 404 }
      );
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/igralci/[id] error:", e);
    return Response.json(
      { error: e?.message ?? "Napaka pri brisanju igralca." },
      { status: 500 }
    );
  }
}
