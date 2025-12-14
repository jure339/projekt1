import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cas_tekme_raw = String(body.cas_tekme ?? "").trim();
    const kraj = body.kraj === null || body.kraj === undefined ? null : String(body.kraj);
    const nasprotnik_id =
      body.nasprotnik_id === null || body.nasprotnik_id === undefined || body.nasprotnik_id === ""
        ? null
        : String(body.nasprotnik_id);

    if (!cas_tekme_raw) {
      return Response.json({ error: "cas_tekme je obvezen." }, { status: 400 });
    }

    const d = new Date(cas_tekme_raw);
    if (!Number.isFinite(d.getTime())) {
      return Response.json({ error: "Neveljaven datum/čas." }, { status: 400 });
    }

    const id = uuidv4();

    const rows = await sql`
      INSERT INTO tekme (id, cas_tekme, kraj, nasprotnik_id)
      VALUES (${id}, ${d.toISOString()}, ${kraj}, ${nasprotnik_id})
      RETURNING id, cas_tekme::text, kraj, nasprotnik_id;
    `;

    return Response.json({ game: rows[0] }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/tekme error:", e);
    return Response.json({ error: e.message ?? "Napaka." }, { status: 500 });
  }
}
