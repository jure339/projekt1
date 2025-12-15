import { NextResponse } from "next/server";
// + tvoj db import (postgres/prisma/whatever)

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Manjka ID." }, { status: 400 });
    }

    // TODO: tvoj delete iz baze
    // await sql`DELETE FROM games WHERE id = ${id}`

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/game/[id] error:", e);
    return NextResponse.json({ error: "Napaka pri brisanju." }, { status: 500 });
  }
}
