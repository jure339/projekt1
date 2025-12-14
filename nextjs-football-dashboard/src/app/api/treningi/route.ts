import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ekipa_id = String(body.ekipa_id ?? "").trim();
    const trener_id = String(body.trener_id ?? "").trim();
    const zacetek = String(body.zacetek ?? "").trim();
    const konec = String(body.konec ?? "").trim();
    const povrsina = String(body.povrsina ?? "").trim();
    const opis = body.opis === null || body.opis === undefined ? null : String(body.opis);

    if (!ekipa_id || !trener_id || !zacetek || !konec || !povrsina) {
      return Response.json(
        { error: "Ekipa, trener, začetek, konec in površina so obvezni." },
        { status: 400 }
      );
    }

    const start = new Date(zacetek);
    const end = new Date(konec);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return Response.json({ error: "Neveljaven datum/čas." }, { status: 400 });
    }

    if (end.getTime() <= start.getTime()) {
      return Response.json({ error: "Konec mora biti po začetku." }, { status: 400 });
    }

    const id = uuidv4();

    const inserted = await sql`
      INSERT INTO treningi
        (id, ekipa_id, trener_id, zacetek, konec, povrsina, opis)
      VALUES
        (${id}, ${ekipa_id}, ${trener_id}, ${start.toISOString()}, ${end.toISOString()}, ${povrsina}, ${opis})
      RETURNING id, ekipa_id, trener_id, zacetek::text, konec::text, povrsina, opis;
    `;

    return Response.json({ trening: inserted[0] }, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message ?? "Napaka." }, { status: 500 });
  }
}
