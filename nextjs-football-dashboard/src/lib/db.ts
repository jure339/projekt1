import postgres from "postgres";
import { env } from "@/lib/config/env";

/**
 * PostgreSQL client (postgres.js).
 * SSL je nastavljen na 'require' zaradi Vercel/hosted DB-jev.
 * Uporabi se kot centralni SQL klient v API routah.
 */
const sql = postgres(env.POSTGRES_URL, {
  ssl: "require",
});

export default sql;
