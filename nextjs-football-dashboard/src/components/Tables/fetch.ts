import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function getPlayersPage(limit: number, offset: number) {
  const rows = await sql`
    SELECT i.id, i.ime, i.priimek, i.starost, COALESCE(p.naziv, '-') AS pozicija
    FROM igralci i
    LEFT JOIN pozicije p ON p.id = i.pozicija_id
    ORDER BY i.priimek ASC, i.ime ASC
    LIMIT ${limit} OFFSET ${offset};
  `;
  return rows;
}

export async function getPlayersCount() {
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count FROM igralci;
  `;
  return Number(rows[0]?.count ?? 0);
}
