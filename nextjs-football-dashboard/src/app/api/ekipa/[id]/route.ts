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

export default function DodajIgralcaPage() {
  const router = useRouter();

  // 🔒 ekipa (ID gre samo v payload, ime gre v UI)
  const [ekipaId, setEkipaId] = useState<string>("");
  const [imeEkipe, setImeEkipe] = useState<string>("");

  // pozicije
  const [pozicije, setPozicije] = useState<Pozicija[]>([]);
  const [pozicijaId, setPozicijaId] = useState<string>("");

  // podatki igralca
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [starost, setStarost] = useState<number>(16);
  const [visina, setVisina] = useState<number | "">("");
  const [stevilkaDresa, setStevilkaDresa] = useState<number | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     1️⃣ Trener + ekipa
     =============================== */
  useEffect(() => {
    const user: StoredUser | null = getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "trener") {
      router.push("/dashboard");
      return;
    }

    if (!user.ekipa_id) {
      setMsg("Trener nima nastavljene ekipe.");
      return;
    }

    setEkipaId(user.ekipa_id);

    // ⬇️ pridobi IME ekipe
    (async () => {
      try {
        const res = await fetch(`/api/ekipe/${user.ekipa_id}`);
        const data = await res.json();

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju ekipe.");
          return;
        }

        setImeEkipe(data.ekipa.ime);
      } catch {
        setMsg("Napaka pri povezavi (ekipa).");
      }
    })();
  }, [router]);

  /* ===============================
     2️⃣ Pozicije (dropdown)
     =============================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pozicije");
        const data = await res.json();

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju pozicij.");
          return;
        }

        setPozicije(data.pozicije);
      } catch {
        setMsg("Napaka pri povezavi (pozicije).");
      }
    })();
  }, []);

  /* ===============================
     3️⃣ Submit
     =============================== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    setLoading(true);

    try {
      const res = await fetch("/api/igralci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime,
          priimek,
          starost,
          visina: visina === "" ? null : Number(visina),
          stevilka_dresa: stevilkaDresa === "" ? null : Number(stevilkaDresa),
          pozicija_id: pozicijaId || null,
          email,
          password,
          ekipa_id: ekipaId, // 🔒 samo tukaj!
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju igralca.");
        return;
      }

      router.push("/dashboard/igralci");
      router.refresh();
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
     =============================== */
  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>Dodaj igralca</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* ✅ SAMO IME EKIPE – NIKJER ID */}
        <InputGroup
          label="Ekipa"
          placeholder="Ekipa trenerja"
          type="text"
          value={imeEkipe}
          handleChange={() => {}}
          disabled
          active={!!imeEkipe}
        />

        <InputGroup label="Ime" type="text" required value={ime} handleChange={(e) => setIme(e.target.value)} />
        <InputGroup label="Priimek" type="text" required value={priimek} handleChange={(e) => setPriimek(e.target.value)} />
        <InputGroup label="Starost" type="number" required value={String(starost)} handleChange={(e) => setStarost(Number(e.target.value))} />
        <InputGroup label="Višina (cm)" type="number" value={visina === "" ? "" : String(visina)} handleChange={(e) => setVisina(e.target.value === "" ? "" : Number(e.target.value))} />
        <InputGroup label="Številka dresa" type="number" value={stevilkaDresa === "" ? "" : String(stevilkaDresa)} handleChange={(e) => setStevilkaDresa(e.target.value === "" ? "" : Number(e.target.value))} />

        {/* Pozicija */}
        <label>
          Pozicija
          <select value={pozicijaId} onChange={(e) => setPozicijaId(e.target.value)}>
            <option value="">Izberi pozicijo</option>
            {pozicije.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naziv} {p.kratica ? `(${p.kratica})` : ""}
              </option>
            ))}
          </select>
        </label>

        <InputGroup label="Email" type="email" required value={email} handleChange={(e) => setEmail(e.target.value)} />
        <InputGroup label="Geslo" type="password" required value={password} handleChange={(e) => setPassword(e.target.value)} />

        <button disabled={loading} type="submit">
          {loading ? "Shranjujem..." : "Dodaj igralca"}
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
