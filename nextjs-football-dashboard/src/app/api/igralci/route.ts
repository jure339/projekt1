import bcrypt from "bcryptjs";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ime = String(body.ime ?? "").trim();
    const priimek = String(body.priimek ?? "").trim();
    const starost = Number(body.starost);

    // ✅ OBVEZNO
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!ime || !priimek || !Number.isFinite(starost) || !email || !password) {
      return Response.json(
        { error: "Ime, priimek, starost, email in geslo so obvezni." },
        { status: 400 }
      );
    }

    const visina =
      body.visina === null || body.visina === undefined || body.visina === ""
        ? null
        : Number(body.visina);

    const stevilka_dresa =
      body.stevilka_dresa === null ||
      body.stevilka_dresa === undefined ||
      body.stevilka_dresa === ""
        ? null
        : Number(body.stevilka_dresa);

    const pozicija_id = body.pozicija_id ? String(body.pozicija_id) : null;
    const ekipa_id = body.ekipa_id ? String(body.ekipa_id) : null;

    // (opcijsko) minimalna validacija števil
    if (visina !== null && !Number.isFinite(visina)) {
      return Response.json({ error: "Višina mora biti številka." }, { status: 400 });
    }
    if (stevilka_dresa !== null && !Number.isFinite(stevilka_dresa)) {
      return Response.json({ error: "Številka dresa mora biti številka." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const inserted = await sql`
      INSERT INTO igralci
        (id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email, password, ekipa_id)
      VALUES
        (${id}, ${ime}, ${priimek}, ${starost}, ${visina}, ${pozicija_id}, ${stevilka_dresa}, ${email}, ${hashed}, ${ekipa_id})
      RETURNING
        id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email, ekipa_id;
    `;

    return Response.json({ igralec: inserted[0] }, { status: 201 });
  } catch (error: any) {
    const msg = String(error?.message ?? "Napaka.");

    // pogost primer: UNIQUE email
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return Response.json({ error: "Email je že v uporabi." }, { status: 409 });
    }

    return Response.json({ error: msg }, { status: 500 });
  }
}
