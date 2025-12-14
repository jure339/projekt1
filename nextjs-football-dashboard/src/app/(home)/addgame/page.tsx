"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/FormElements/InputGroup";
import { getUser, type StoredUser } from "@/lib/user-store";

type NasprotnaEkipa = {
  id: string;
  ime: string;
};

type Payload = {
  cas_tekme: string; // ISO
  kraj: string | null;
  nasprotnik_id: string | null;
};

export default function AddGamePage() {
  const router = useRouter();

  const [casTekme, setCasTekme] = useState<string>(""); // datetime-local
  const [kraj, setKraj] = useState<string>("");

  const [nasprotniki, setNasprotniki] = useState<NasprotnaEkipa[]>([]);
  const [nasprotnikId, setNasprotnikId] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOpp, setLoadingOpp] = useState(false);

  // ✅ samo trener
  useEffect(() => {
    const u: StoredUser | null = getUser();
    if (!u) {
      router.push("/auth/login");
      return;
    }
    if (u.role !== "trener") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  // ✅ naloži nasprotnike za dropdown
  useEffect(() => {
    (async () => {
      setLoadingOpp(true);
      setMsg(null);

      try {
        const res = await fetch("/api/game/nasprotne-ekipe", { cache: "no-store" });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju nasprotnikov.");
          return;
        }

        setNasprotniki(data?.teams ?? []);
      } catch {
        setMsg("Napaka pri povezavi (nasprotniki).");
      } finally {
        setLoadingOpp(false);
      }
    })();
  }, []);

  function toISOFromLocal(local: string) {
    return new Date(local).toISOString();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!casTekme) {
      setMsg("Datum in čas tekme sta obvezna.");
      return;
    }

    setLoading(true);

    const payload: Payload = {
      cas_tekme: toISOFromLocal(casTekme),
      kraj: kraj.trim() ? kraj.trim() : null,
      nasprotnik_id: nasprotnikId || null,
    };

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju tekme.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "40px auto", padding: 16 }}>
      <h1>Dodaj tekmo</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <InputGroup
          label="Datum in čas tekme"
          placeholder=""
          type="datetime-local"
          required
          value={casTekme}
          handleChange={(e) => setCasTekme(e.target.value)}
          disabled={loading}
          active={!!casTekme}
          name="cas_tekme"
        />

        <InputGroup
          label="Kraj (opcijsko)"
          placeholder="npr. Velenje, stadion Rudar"
          type="text"
          value={kraj}
          handleChange={(e) => setKraj(e.target.value)}
          disabled={loading}
          active={!!kraj}
          name="kraj"
        />

        {/* Nasprotnik dropdown */}
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Nasprotnik (opcijsko)
          <select
            value={nasprotnikId}
            onChange={(e) => setNasprotnikId(e.target.value)}
            disabled={loading || loadingOpp}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">
              {loadingOpp ? "Nalagam nasprotnike..." : "Izberi nasprotnika"}
            </option>

            {nasprotniki.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ime}
              </option>
            ))}
          </select>
        </label>

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Shranjujem..." : "Dodaj tekmo"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Prekliči
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
