import  sql  from "@/lib/db"; // tvoja povezava na PostgreSQL

export async function GET() {
  try {
    const igralci = await sql`
      SELECT 
        id,
        ime,
        priimek,
        pozicija_id AS pozicija,
        null AS slika
      FROM igralci;
    `;
    return new Response(JSON.stringify(igralci), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }
}
