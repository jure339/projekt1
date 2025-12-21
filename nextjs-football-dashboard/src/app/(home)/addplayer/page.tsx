"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/FormElements/InputGroup";
import { getUser, type StoredUser } from "@/lib/user-store";

type Pozicija = {
  id: string;
  naziv: string;
  kratica: string | null;
};

type Payload = {
  ime: string;
  priimek: string;
  starost: number;
  visina: number | null;
  pozicija_id: string | null;
  stevilka_dresa: number | null;
  email: string;
  password: string;
  ekipa_id: string; // still sent as ID
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

/** Robust parsing: supports {pozicije:[]}, {positions:[]}, {data:[]}, or [] */
function normalizePositions(data: any): Pozicija[] {
  const raw =
    (data?.pozicije ??
      data?.positions ??
      data?.data ??
      data?.rows ??
      data) ?? [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((p: any) => ({
      id: String(p?.id ?? ""),
      // support naziv/name/position_name etc.
      naziv: String(p?.naziv ?? p?.name ?? p?.position ?? p?.title ?? ""),
      kratica:
        p?.kratica === undefined || p?.kratica === null
          ? null
          : String(p.kratica),
    }))
    .filter((p: Pozicija) => p.id && p.naziv);
}

export default function DodajIgralcaPage() {
  const router = useRouter();

  const [ekipaId, setEkipaId] = useState<string>("");
  const [ekipaIme, setEkipaIme] = useState<string>("");

  const [pozicije, setPozicije] = useState<Pozicija[]>([]);
  const [pozicijaId, setPozicijaId] = useState<string>("");

  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [starost, setStarost] = useState<number>(16);

  const [visina, setVisina] = useState<number | "">("");
  const [stevilkaDresa, setStevilkaDresa] = useState<number | "">("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPozicije, setLoadingPozicije] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const teamDisplayValue = useMemo(() => {
    if (loadingTeam) return "Loading...";
    return ekipaIme || ekipaId || "—";
  }, [loadingTeam, ekipaIme, ekipaId]);

  // ✅ read coach and set team id + load team name
  useEffect(() => {
    (async () => {
      const u: StoredUser | null = getUser();

      if (!u) {
        router.push("/auth/login");
        return;
      }

      if (u.role !== "trener") {
        router.push("/dashboard");
        return;
      }

      if (!u.ekipa_id) {
        setMsg("Coach has no team assigned.");
        return;
      }

      setEkipaId(u.ekipa_id);

      setLoadingTeam(true);
      try {
        const res = await fetch(`/api/ekipa/${u.ekipa_id}`, { cache: "no-store" });
        const data = await safeReadJson(res);

        if (!res.ok) {
          setEkipaIme("");
          return;
        }

        setEkipaIme(String(data?.ekipa?.ime ?? ""));
      } catch {
        setEkipaIme("");
      } finally {
        setLoadingTeam(false);
      }
    })();
  }, [router]);

  // ✅ load positions (robust)
  useEffect(() => {
    (async () => {
      setLoadingPozicije(true);

      try {
        const res = await fetch("/api/pozicije", { cache: "no-store" });
        const data = await safeReadJson(res);

        if (!res.ok) {
          setMsg(data?.error ?? "Error loading positions.");
          setPozicije([]);
          return;
        }

        const normalized = normalizePositions(data);
        setPozicije(normalized);

        // ✅ If current selected is not in list, reset it
        if (pozicijaId && !normalized.some((p) => p.id === pozicijaId)) {
          setPozicijaId("");
        }
      } catch {
        setMsg("Error connecting to server (positions).");
        setPozicije([]);
      } finally {
        setLoadingPozicije(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!ekipaId) {
      setMsg("Coach has no team assigned.");
      return;
    }

    setLoading(true);

    const payload: Payload = {
      ime: ime.trim(),
      priimek: priimek.trim(),
      starost: Number(starost),
      visina: visina === "" ? null : Number(visina),
      stevilka_dresa: stevilkaDresa === "" ? null : Number(stevilkaDresa),
      pozicija_id: pozicijaId ? pozicijaId : null,
      email: email.trim(),
      password,
      ekipa_id: ekipaId,
    };

    try {
      const res = await fetch("/api/igralci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Error adding player.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMsg("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>Add player</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Team locked - show NAME */}
        <InputGroup
          label="Team (locked)"
          placeholder="Coach's team"
          type="text"
          required
          value={teamDisplayValue}
          handleChange={() => {}}
          disabled
          active={!!ekipaId}
          name="ekipa_ime"
        />

        <InputGroup
          label="Name"
          placeholder="Name"
          type="text"
          required
          value={ime}
          handleChange={(e) => setIme(e.target.value)}
          disabled={loading}
          active={!!ime}
          name="ime"
        />

        <InputGroup
          label="Last Name"
          placeholder="Enter last name"
          type="text"
          required
          value={priimek}
          handleChange={(e) => setPriimek(e.target.value)}
          disabled={loading}
          active={!!priimek}
          name="priimek"
        />

        <InputGroup
          label="Age"
          placeholder="e.g. 16"
          type="number"
          required
          value={String(starost)}
          handleChange={(e) => setStarost(Number(e.target.value))}
          disabled={loading}
          active
          name="starost"
        />

        <InputGroup
          label="Height (cm)"
          placeholder="optional"
          type="number"
          value={visina === "" ? "" : String(visina)}
          handleChange={(e) =>
            setVisina(e.target.value === "" ? "" : Number(e.target.value))
          }
          disabled={loading}
          active={visina !== ""}
          name="visina"
        />

        <InputGroup
          label="Shirt Number"
          placeholder="optional"
          type="number"
          value={stevilkaDresa === "" ? "" : String(stevilkaDresa)}
          handleChange={(e) =>
            setStevilkaDresa(e.target.value === "" ? "" : Number(e.target.value))
          }
          disabled={loading}
          active={stevilkaDresa !== ""}
          name="stevilka_dresa"
        />

        {/* Position dropdown */}
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Position
          <select
            value={pozicijaId}
            onChange={(e) => setPozicijaId(e.target.value)}
            disabled={loading || loadingPozicije}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">
              {loadingPozicije
                ? "Loading positions..."
                : pozicije.length === 0
                ? "No positions found"
                : "Select position (optional)"}
            </option>

            {pozicije.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naziv}
                {p.kratica ? ` (${p.kratica})` : ""}
              </option>
            ))}
          </select>
        </label>

        <InputGroup
          label="Email"
          placeholder="email@gmail.com"
          type="email"
          required
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          active={!!email}
          name="email"
        />

        <InputGroup
          label="Password"
          placeholder="Set password"
          type="password"
          required
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          active={!!password}
          name="password"
        />

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add player"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Cancel
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
