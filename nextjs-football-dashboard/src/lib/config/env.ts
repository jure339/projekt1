/**
 * Centraliziran dostop do environment variables.
 * Prednost: vse env validacije so na enem mestu in ne "razmetane" po projektu.
 */
// Dobi env ali vrze napako, ce ni nastavljen.
function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

// Centralno mesto za vse obvezne env spremenljivke.
export const env = {
  JWT_SECRET: requireEnv("JWT_SECRET"),
  POSTGRES_URL: requireEnv("POSTGRES_URL"),
};
