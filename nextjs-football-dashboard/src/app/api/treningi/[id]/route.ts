import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const PatchSchema = z.object({
  zacetek: z.string().optional(),
  konec: z.string().optional(),
  povrsina: z.string().min(1).optional(),
  opis: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const p = parsed.data;

  const [updated] = await sql`
    UPDATE treningi
    SET
      zacetek = COALESCE(${p.zacetek ?? null}, zacetek),
      konec = COALESCE(${p.konec ?? null}, konec),
      povrsina = COALESCE(${p.povrsina ?? null}, povrsina),
      opis = COALESCE(${p.opis ?? null}, opis)
    WHERE id = ${id}
    RETURNING id, ekipa_id, trener_id, zacetek, konec, povrsina, opis
  `;

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;

  const result = await sql`
    DELETE FROM treningi
    WHERE id = ${id}
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
