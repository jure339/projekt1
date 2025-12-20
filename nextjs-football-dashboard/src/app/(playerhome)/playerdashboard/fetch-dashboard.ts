import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export type RecentTraining = {
  id: string;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

export type UpcomingGame = {
  id: string;
  cas_tekme: string;
  kraj: string | null;
  nasprotnik: string | null;
};

export async function getMostRecentTraining(ekipaId: string) {
  const rows = await sql<RecentTraining[]>`
    SELECT id, zacetek::text, konec::text, povrsina, opis
    FROM treningi
    WHERE ekipa_id = ${ekipaId}
    ORDER BY zacetek DESC
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function getTrainingsCount(ekipaId: string) {
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count
    FROM treningi
    WHERE ekipa_id = ${ekipaId};
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getUpcomingGame() {
  const rows = await sql<UpcomingGame[]>`
    SELECT t.id,
           t.cas_tekme::text,
           t.kraj,
           n.ime as nasprotnik
    FROM tekme t
    LEFT JOIN nasprotne_ekipe n ON n.id = t.nasprotnik_id
    WHERE t.cas_tekme >= NOW()
    ORDER BY t.cas_tekme ASC
    LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function getGamesCount() {
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count
    FROM tekme;
  `;
  return Number(rows[0]?.count ?? 0);
}
