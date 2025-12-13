"use client";

import { useEffect, useState } from "react";
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
  email: string;      // obvezno
  password: string;   // obvezno
  ekipa_id: string;   // obvezno (iz trenerja)
};

export default function DodajIgralcaPage() {
  const router = useRouter();

  const [ekipaId, setEkipaId] = useState<string>("");

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

  // ✅ preberi trenerja iz localStorage in nastavi ekipo
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

    if (!u.ekipa_id) {
      setMsg("Trener nima nastavljene ekipe (ekipa_id je NULL).");
      return;
    }

    setEkipaId(u.ekipa_id);
  }, [router]);

  // ✅ naloži pozicije za dropdown
  useEffect(() => {
    (async () => {
      setLoadingPozicije(true);
      try {
        const res = await fetch("/api/pozicije");
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju pozicij.");
          return;
        }

        setPozicije(data?.pozicije ?? []);
      } catch {
        setMsg("Napaka pri povezavi (pozicije).");
      } finally {
        setLoadingPozicije(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!ekipaId) {
      setMsg("Ekipa trenerja ni nastavljena.");
      return;
    }

    setLoading(true);

    const payload: Payload = {
      ime,
      priimek,
      starost: Number(starost),
      visina: visina === "" ? null : Number(visina),
      stevilka_dresa: stevilkaDresa === "" ? null : Number(stevilkaDresa),
      pozicija_id: pozicijaId || null,
      email,
      password,
      ekipa_id: ekipaId, // ✅ vedno iz trenerja
    };

    try {
      const res = await fetch("/api/igralci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju igralca.");
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
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>Dodaj igralca</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Ekipa zaklenjena */}
        <InputGroup
          label="Ekipa (zaklenjeno)"
          placeholder="Ekipa trenerja"
          type="text"
          required
          value={ekipaId}
          handleChange={() => {}}
          disabled
          active={!!ekipaId}
          name="ekipa_id"
        />

        <InputGroup
          label="Ime"
          placeholder="Vpiši ime"
          type="text"
          required
          value={ime}
          handleChange={(e) => setIme(e.target.value)}
          disabled={loading}
          active={!!ime}
          name="ime"
        />

        <InputGroup
          label="Priimek"
          placeholder="Vpiši priimek"
          type="text"
          required
          value={priimek}
          handleChange={(e) => setPriimek(e.target.value)}
          disabled={loading}
          active={!!priimek}
          name="priimek"
        />

        <InputGroup
          label="Starost"
          placeholder="npr. 16"
          type="number"
          required
          value={String(starost)}
          handleChange={(e) => setStarost(Number(e.target.value))}
          disabled={loading}
          active
          name="starost"
        />

        <InputGroup
          label="Višina (cm)"
          placeholder="opcijsko"
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
          label="Številka dresa"
          placeholder="opcijsko"
          type="number"
          value={stevilkaDresa === "" ? "" : String(stevilkaDresa)}
          handleChange={(e) =>
            setStevilkaDresa(e.target.value === "" ? "" : Number(e.target.value))
          }
          disabled={loading}
          active={stevilkaDresa !== ""}
          name="stevilka_dresa"
        />

        {/* Pozicija dropdown */}
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Pozicija
          <select
            value={pozicijaId}
            onChange={(e) => setPozicijaId(e.target.value)}
            disabled={loading || loadingPozicije}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">
              {loadingPozicije ? "Nalagam pozicije..." : "Izberi pozicijo (opcijsko)"}
            </option>

            {pozicije.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naziv}
                {p.kratica ? ` (${p.kratica})` : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Email + geslo obvezno */}
        <InputGroup
          label="Email"
          placeholder="email@primer.si"
          type="email"
          required
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          active={!!email}
          name="email"
        />

        <InputGroup
          label="Geslo"
          placeholder="Nastavi geslo"
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
          {loading ? "Shranjujem..." : "Dodaj igralca"}
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
