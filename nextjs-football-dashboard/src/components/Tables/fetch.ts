import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function getPlayers() {
  const players = await sql`
    SELECT 
      igralci.id,
      igralci.ime,
      igralci.priimek,
      igralci.starost,
      pozicije.naziv AS pozicija
    FROM igralci
    LEFT JOIN pozicije
    ON igralci.pozicija_id = pozicije.id
    ORDER BY igralci.ime;
  `;
  return players;
}
