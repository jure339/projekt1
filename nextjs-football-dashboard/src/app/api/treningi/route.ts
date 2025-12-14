import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ekipaId = searchParams.get("ekipaId");

    if (!ekipaId) {
      return Response.json({ error: "Missing ekipaId", trainings: [] }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, zacetek::text, konec::text, povrsina, opis
      FROM treningi
      WHERE ekipa_id = ${ekipaId}
      ORDER BY zacetek ASC;
    `;

    return Response.json({ trainings: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/treningi error:", e);
    return Response.json({ error: e.message ?? "Napaka", trainings: [] }, { status: 500 });
  }
}

// (če POST že imaš, pusti svojega; če ga nimaš, ga lahko dodaš nazaj)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = uuidv4();
    const ekipa_id = String(body.ekipa_id ?? "");
    const trener_id = String(body.trener_id ?? "");
    const zacetek = String(body.zacetek ?? "");
    const konec = String(body.konec ?? "");
    const povrsina = String(body.povrsina ?? "");
    const opis = body.opis ? String(body.opis) : null;

    if (!ekipa_id || !zacetek || !konec || !povrsina) {
      return Response.json({ error: "Manjkajo podatki." }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO treningi (id, ekipa_id, trener_id, zacetek, konec, povrsina, opis)
      VALUES (${id}, ${ekipa_id}, ${trener_id}, ${zacetek}, ${konec}, ${povrsina}, ${opis})
      RETURNING id;
    `;

    return Response.json({ training: rows[0] }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/treningi error:", e);
    return Response.json({ error: e.message ?? "Napaka" }, { status: 500 });
  }
}
