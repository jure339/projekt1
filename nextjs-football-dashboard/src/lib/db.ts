import postgres from "postgres";
import { env } from "@/lib/config/env";

/**
 * PostgreSQL client (postgres.js).
 * SSL je nastavljen na 'require' zaradi Vercel/hosted DB-jev.
 */
const sql = postgres(env.POSTGRES_URL, {
  ssl: "require",
});

export default sql;
