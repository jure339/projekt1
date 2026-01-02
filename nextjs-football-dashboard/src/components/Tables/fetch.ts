import postgres from "postgres";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: "igralec" | "trener";
  email: string;
};

async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

async function getTrainerTeamId(): Promise<string | null> {
  const payload = await getAuthPayload();
  if (!payload || payload.role !== "trener") return null;

  const rows = await sql`
    SELECT ekipa_id
    FROM trenerji
    WHERE id = ${payload.sub}
    LIMIT 1;
  `;

  return rows[0]?.ekipa_id ?? null;
}

export async function getPlayersPage(limit: number, offset: number) {
  const ekipaId = await getTrainerTeamId();
  if (!ekipaId) return [];

  const rows = await sql`
    SELECT
      i.id,
      i.ime,
      i.priimek,
      i.starost,
      COALESCE(p.naziv, '-') AS pozicija,
      COALESCE(e.ime, '-') AS ekipa
    FROM igralci i
    LEFT JOIN pozicije p ON p.id = i.pozicija_id
    LEFT JOIN ekipe e ON e.id = i.ekipa_id
    WHERE i.ekipa_id = ${ekipaId}
    ORDER BY i.priimek ASC, i.ime ASC
    LIMIT ${limit} OFFSET ${offset};
  `;

  return rows;
}

export async function getPlayersCount() {
  const ekipaId = await getTrainerTeamId();
  if (!ekipaId) return 0;

  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count
    FROM igralci
    WHERE ekipa_id = ${ekipaId};
  `;

  return Number(rows[0]?.count ?? 0);
}
