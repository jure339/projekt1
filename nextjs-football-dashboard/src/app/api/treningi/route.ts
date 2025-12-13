import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const CreateTreningSchema = z.object({
  ekipa_id: z.string().uuid(),
  trener_id: z.string().uuid().nullable().optional(),
  zacetek: z.string(), // ISO ali "YYYY-MM-DD HH:mm:ss"
  konec: z.string(),
  povrsina: z.string().min(1),
  opis: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const ekipa_id = searchParams.get("ekipa_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!ekipa_id) {
    return NextResponse.json({ error: "Missing ekipa_id" }, { status: 400 });
  }

  // filtriranje po času je optional, ampak zelo uporabno za koledar
  if (from && to) {
    const rows = await sql`
      SELECT id, ekipa_id, trener_id, zacetek, konec, povrsina, opis
      FROM treningi
      WHERE ekipa_id = ${ekipa_id}
        AND zacetek < ${to}
        AND konec > ${from}
      ORDER BY zacetek ASC
    `;
    return NextResponse.json(rows);
  }

  const rows = await sql`
    SELECT id, ekipa_id, trener_id, zacetek, konec, povrsina, opis
    FROM treningi
    WHERE ekipa_id = ${ekipa_id}
    ORDER BY zacetek ASC
  `;

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateTreningSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const t = parsed.data;

  const [created] = await sql`
    INSERT INTO treningi (id, ekipa_id, trener_id, zacetek, konec, povrsina, opis)
    VALUES (gen_random_uuid(), ${t.ekipa_id}, ${t.trener_id ?? null}, ${t.zacetek}, ${t.konec}, ${t.povrsina}, ${t.opis ?? null})
    RETURNING id, ekipa_id, trener_id, zacetek, konec, povrsina, opis
  `;

  return NextResponse.json(created, { status: 201 });
}
