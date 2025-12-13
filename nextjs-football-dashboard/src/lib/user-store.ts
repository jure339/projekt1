export type StoredUser = {
  id: string;
  ime: string;
  priimek: string;
  email: string;
  ekipa_id: string | null;
  role: "igralec" | "trener";
};

const KEY = "logged_user";

/* ===============================
   SHRANI UPORABNIKA
   =============================== */
export function saveUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

/* ===============================
   PREBERI UPORABNIKA
   =============================== */
export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/* ===============================
   ODJAVA
   =============================== */
export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
