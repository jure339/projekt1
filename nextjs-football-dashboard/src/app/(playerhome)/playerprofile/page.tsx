"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Position = {
  id: string;
  naziv: string;
  kratica: string | null;
};

type PlayerProfile = {
  id: string;
  ime: string;
  priimek: string;
  email: string;
  starost: number;
  visina: number | null;
  stevilka_dresa: number | null;

  ekipa_id: string | null;
  ekipa_ime: string | null;

  pozicija_id: string | null;
  pozicija_naziv: string | null;
  pozicija_kratica: string | null;
};

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function PlayerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  // form state
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [email, setEmail] = useState("");
  const [starost, setStarost] = useState<string>("");
  const [visina, setVisina] = useState<string>("");
  const [dres, setDres] = useState<string>("");

  // ✅ password (optional) - samo 1x
  const [password, setPassword] = useState("");

  // dropdown value: "" pomeni "Brez pozicije"
  const [pozicijaValue, setPozicijaValue] = useState<string>("");

  const currentPosLabel = useMemo(() => {
    if (!profile) return "—";
    if (!profile.pozicija_naziv) return "—";
    return `${profile.pozicija_naziv}${profile.pozicija_kratica ? ` (${profile.pozicija_kratica})` : ""}`;
  }, [profile]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const [profileRes, positionsRes] = await Promise.all([
          fetch("/api/igralci/moj-profil", { cache: "no-store" }),
          fetch("/api/pozicije", { cache: "no-store" }),
        ]);

        const profileData = await safeReadJson(profileRes);
        const positionsData = await safeReadJson(positionsRes);

        if (!profileRes.ok) {
          setMsg(profileData?.error ?? "Napaka pri nalaganju profila.");
          return;
        }

        const p = profileData?.player as PlayerProfile;
        setProfile(p);

        setIme(p.ime ?? "");
        setPriimek(p.priimek ?? "");
        setEmail(p.email ?? "");
        setStarost(String(p.starost ?? ""));
        setVisina(p.visina === null ? "" : String(p.visina));
        setDres(p.stevilka_dresa === null ? "" : String(p.stevilka_dresa));

        setPozicijaValue(p.pozicija_id ?? "");

        // ✅ reset password
        setPassword("");

        if (positionsRes.ok) {
          setPositions((positionsData?.positions ?? []) as Position[]);
        } else {
          setPositions([]);
        }
      } catch {
        setMsg("Napaka pri povezavi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!starost.trim()) {
      setMsg("Starost je obvezna.");
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        ime: ime.trim(),
        priimek: priimek.trim(),
        email: email.trim(),
        starost: Number(starost),
        visina: visina.trim() === "" ? null : Number(visina),
        stevilka_dresa: dres.trim() === "" ? null : Number(dres),
        pozicija_id: pozicijaValue === "" ? null : pozicijaValue,
      };

      // ✅ dodaj password samo, če je vpisan (brez dodatnih pravil)
      if (password.trim().length > 0) {
        payload.password = password;
      }

      const res = await fetch("/api/igralci/moj-profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju.");
        return;
      }

      const updated = (data?.player ?? data?.updated ?? data?.profile) as PlayerProfile;
      if (updated) {
        setProfile(updated);
        setPozicijaValue(updated.pozicija_id ?? "");
      }

      // ✅ po uspehu pobriši polje za geslo
      setPassword("");

      setMsg("Profile saved ✅");
    } catch {
      setMsg("Error connecting.");
    } finally {
      setSaving(false);
    }
  }

  const card =
    "rounded-[14px] border border-stroke bg-white p-6 shadow-1 dark:border-primary/30 dark:bg-gray-dark dark:shadow-card";
  const label = "text-body-sm font-medium text-dark dark:text-white";
  const input =
    "mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";
  const btn =
    "inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 font-medium text-white transition disabled:opacity-60";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">My profile</h1>

      <div className={card}>
        {loading ? (
          <p className="text-dark-6 dark:text-white/70">Loading...</p>
        ) : profile ? (
          <form onSubmit={onSave} className="grid gap-5">
            <div className="text-sm text-dark-6 dark:text-white/70">
              Team: {profile.ekipa_ime ?? "—"}
              <br />
              Current position: {currentPosLabel}
            </div>

            <div>
              <div className={label}>Name</div>
              <input className={input} value={ime} onChange={(e) => setIme(e.target.value)} required />
            </div>

            <div>
              <div className={label}>Last name</div>
              <input className={input} value={priimek} onChange={(e) => setPriimek(e.target.value)} required />
            </div>

            <div>
              <div className={label}>Email</div>
              <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <div className={label}>Age (required)</div>
              <input
                className={input}
                type="number"
                value={starost}
                onChange={(e) => setStarost(e.target.value)}
                min={5}
                max={90}
                required
              />
            </div>

            <div>
              <div className={label}>Height (cm)</div>
              <input
                className={input}
                type="number"
                value={visina}
                onChange={(e) => setVisina(e.target.value)}
                placeholder="npr. 178"
                min={80}
                max={260}
              />
            </div>

            <div>
              <div className={label}>Jersey number</div>
              <input
                className={input}
                type="number"
                value={dres}
                onChange={(e) => setDres(e.target.value)}
                placeholder="npr. 10"
                min={0}
                max={99}
              />
            </div>

            <div>
              <div className={label}>Position</div>
              <select className={input} value={pozicijaValue} onChange={(e) => setPozicijaValue(e.target.value)}>
                <option value="">No position</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.naziv}
                    {p.kratica ? ` (${p.kratica})` : ""}
                  </option>
                ))}
              </select>

              {positions.length === 0 && (
                <p className="mt-2 text-xs text-dark-6 dark:text-white/70">
                  Positions could not be loaded (endpoint /api/pozicije). Profile still works.
                </p>
              )}
            </div>

            {/* ✅ Password change (optional) - samo 1 polje */}
            <div>
              <div className="mb-2 text-sm font-semibold text-dark dark:text-white">Change password (optional)</div>

              <div>
                <div className={label}>New password</div>
                <input
                  className={input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep current"
                  autoComplete="new-password"
                />
              </div>

            </div>

            <button className={btn} disabled={saving} type="submit">
              {saving ? "Saving..." : "Save changes"}
            </button>

            {msg && <p className={cn("text-sm", msg.includes("✅") ? "text-green-600" : "text-red")}>{msg}</p>}
          </form>
        ) : (
          <p className="text-red">{msg ?? "Profil ni na voljo."}</p>
        )}
      </div>
    </div>
  );
}
