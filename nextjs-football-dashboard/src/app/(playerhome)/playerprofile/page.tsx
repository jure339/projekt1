"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

  // form state
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [email, setEmail] = useState("");
  const [starost, setStarost] = useState<string>(""); // required
  const [visina, setVisina] = useState<string>("");
  const [dres, setDres] = useState<string>("");
  const [pozicijaId, setPozicijaId] = useState<string>(""); // optional uuid

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const res = await fetch("/api/igralci/moj-profil", {
          cache: "no-store",
        });
        const data = await safeReadJson(res);

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju profila.");
          return;
        }

        const p = data?.player as PlayerProfile;
        setProfile(p);

        setIme(p.ime ?? "");
        setPriimek(p.priimek ?? "");
        setEmail(p.email ?? "");
        setStarost(String(p.starost ?? ""));
        setVisina(p.visina === null ? "" : String(p.visina));
        setDres(p.stevilka_dresa === null ? "" : String(p.stevilka_dresa));
        setPozicijaId(p.pozicija_id ?? "");
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
      const payload = {
        ime: ime.trim(),
        priimek: priimek.trim(),
        email: email.trim(),
        starost: Number(starost),
        visina: visina.trim() === "" ? null : Number(visina),
        stevilka_dresa: dres.trim() === "" ? null : Number(dres),
        pozicija_id: pozicijaId.trim() === "" ? null : pozicijaId.trim(),
      };

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

      // ✅ API vrača player z JOIN imeni (ekipa_ime, pozicija_naziv...)
      setProfile(data?.player ?? null);
      setMsg("Profil shranjen ✅");
    } catch {
      setMsg("Napaka pri povezavi.");
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

  const metaLine = "text-sm text-dark-6 dark:text-white/70";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">
        Moj profil
      </h1>

      <div className={card}>
        {loading ? (
          <p className="text-dark-6 dark:text-white/70">Loading...</p>
        ) : profile ? (
          <form onSubmit={onSave} className="grid gap-5">
            {/* ✅ Prikaz imena ekipe + pozicije */}
            <div className={metaLine}>
              Ekipa: {profile.ekipa_ime ?? "—"}
              <br />
              Pozicija:{" "}
              {profile.pozicija_naziv
                ? `${profile.pozicija_naziv}${
                    profile.pozicija_kratica
                      ? ` (${profile.pozicija_kratica})`
                      : ""
                  }`
                : "—"}
            </div>

            <div>
              <div className={label}>Ime</div>
              <input
                className={input}
                value={ime}
                onChange={(e) => setIme(e.target.value)}
                required
              />
            </div>

            <div>
              <div className={label}>Priimek</div>
              <input
                className={input}
                value={priimek}
                onChange={(e) => setPriimek(e.target.value)}
                required
              />
            </div>

            <div>
              <div className={label}>Email</div>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className={label}>Starost (obvezno)</div>
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
              <div className={label}>Višina (cm)</div>
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
              <div className={label}>Številka dresa</div>
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
              <div className={label}>Pozicija (ID / UUID)</div>
              <input
                className={input}
                value={pozicijaId}
                onChange={(e) => setPozicijaId(e.target.value)}
                placeholder="pusti prazno za brez"
              />
              <p className="mt-2 text-xs text-dark-6 dark:text-white/70">
                Trenutno je to UUID. Če želiš dropdown s pozicijami, ti naredim
                endpoint + select.
              </p>
            </div>

            <button className={btn} disabled={saving} type="submit">
              {saving ? "Shranjujem..." : "Shrani spremembe"}
            </button>

            {msg && (
              <p
                className={cn(
                  "text-sm",
                  msg.includes("✅") ? "text-green-600" : "text-red"
                )}
              >
                {msg}
              </p>
            )}
          </form>
        ) : (
          <p className="text-red">{msg ?? "Profil ni na voljo."}</p>
        )}
      </div>
    </div>
  );
}
