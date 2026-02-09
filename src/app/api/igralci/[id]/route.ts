import postgres from 'postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DB povezava za brisanje igralcev.
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Brisanje igralca + odstrani povezave v relacijskih tabelah.
export async function DELETE(_req: Request, ctx: any) {
  try {
    const id = String(ctx?.params?.id ?? '');

    if (!id) {
      return Response.json({ error: 'Manjka ID igralca.' }, { status: 400 });
    }

    // Če je id v bazi integer, raje:
    // const idNum = Number(id);
    // if (!Number.isFinite(idNum)) {
    //   return Response.json({ error: "Neveljaven ID igralca." }, { status: 400 });
    // }

    // Najprej pocistimo relacije, potem igralca.
    await sql`DELETE FROM igralec_trening WHERE igralec_id = ${id};`;
    await sql`DELETE FROM igralec_tekma WHERE igralec_id = ${id};`;

    const result = await sql`DELETE FROM igralci WHERE id = ${id};`;

    if (result.count === 0) {
      return Response.json({ error: 'Igralec ne obstaja ali je že izbrisan.' }, { status: 404 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error('DELETE /api/igralci/[id] error:', e);
    return Response.json({ error: e?.message ?? 'Napaka pri brisanju igralca.' }, { status: 500 });
  }
}
