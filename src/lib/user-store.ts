export type StoredUser = {
  id: string;
  ime: string;
  priimek: string;
  email: string;
  ekipa_id: string | null;
  role: "igralec" | "trener";
};

const STORAGE_KEY = "logged_user";

/**
 * Helper: localStorage je na voljo samo v browserju.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Shrani prijavljenega uporabnika v localStorage.
 */
export function saveUser(user: StoredUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Prebere prijavljenega uporabnika iz localStorage.
 * Vrne null, če ni podatkov ali če je JSON pokvarjen.
 */
export function getUser(): StoredUser | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Odjavi uporabnika (pobriše localStorage).
 */
export function clearUser(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
