import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// GET – vrne vse dogodke za koledar
export async function GET() {
  const treningi = await sql`
    SELECT 
      id,
      cas_treninga AS start,
      'Trening' AS title,
      'trening' AS type,
      opis AS description
    FROM treningi
  `;

  const tekme = await sql`
    SELECT 
      t.id,
      t.cas_tekme AS start,
      CONCAT('Tekma - ', n.ime) AS title,
      'tekma' AS type,
      t.kraj AS description,
      t.nasprotnik_id
    FROM tekme t
    LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
  `;

  return NextResponse.json([...treningi, ...tekme]);
}

// POST – doda trening ali tekmo
export async function POST(req: Request) {
  const { type, date, description, nasprotnik_id } = await req.json();

  if (type === "trening") {
    const [row] = await sql`
      INSERT INTO treningi (id, cas_treninga, povrsina, opis)
      VALUES (gen_random_uuid(), ${date}, 'Igrisce', ${description})
      RETURNING id, cas_treninga
    `;

    return NextResponse.json({
      id: row.id,
      title: "Trening",
      start: row.cas_treninga,
      type: "trening",
      description,
    });
  }

  if (type === "tekma") {
    const [row] = await sql`
      INSERT INTO tekme (id, cas_tekme, kraj, nasprotnik_id)
      VALUES (gen_random_uuid(), ${date}, ${description}, ${nasprotnik_id})
      RETURNING id, cas_tekme
    `;

    return NextResponse.json({
      id: row.id,
      title: "Tekma",
      start: row.cas_tekme,
      type: "tekma",
      description,
      nasprotnik_id,
    });
  }

  return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
}
