"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "igralec" | "trener";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("igralec");

  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [starost, setStarost] = useState<number>(16);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // dodatno za igralca
  const [visina, setVisina] = useState<number | "">("");
  const [stevilka, setStevilka] = useState<number | "">("");
  const [pozicijaId, setPozicijaId] = useState<string>("");

  // skupno
  const [ekipaId, setEkipaId] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const payload: any = {
      role,
      ime,
      priimek,
      starost: Number(starost),
      email,
      password,
      ekipa_id: ekipaId || null,
    };

    if (role === "igralec") {
      payload.visina = visina === "" ? null : Number(visina);
      payload.stevilka_dresa = stevilka === "" ? null : Number(stevilka);
      payload.pozicija_id = pozicijaId || null;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri registraciji.");
        return;
      }

      router.push("/auth/login");
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Registracija</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Vloga
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="igralec">Igralec</option>
            <option value="trener">Trener</option>
          </select>
        </label>

        <label>
          Ime
          <input value={ime} onChange={(e) => setIme(e.target.value)} required />
        </label>

        <label>
          Priimek
          <input value={priimek} onChange={(e) => setPriimek(e.target.value)} required />
        </label>

        <label>
          Starost
          <input
            value={starost}
            onChange={(e) => setStarost(Number(e.target.value))}
            type="number"
            min={10}
            max={80}
            required
          />
        </label>

        <label>
          Ekipa ID (UUID)
          <input value={ekipaId} onChange={(e) => setEkipaId(e.target.value)} placeholder="opcijsko" />
        </label>

        {role === "igralec" && (
          <>
            <label>
              Višina (cm)
              <input value={visina} onChange={(e) => setVisina(e.target.value === "" ? "" : Number(e.target.value))} type="number" />
            </label>

            <label>
              Številka dresa
              <input value={stevilka} onChange={(e) => setStevilka(e.target.value === "" ? "" : Number(e.target.value))} type="number" />
            </label>

            <label>
              Pozicija ID (UUID)
              <input value={pozicijaId} onChange={(e) => setPozicijaId(e.target.value)} placeholder="opcijsko" />
            </label>
          </>
        )}

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Geslo
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Shranjujem..." : "Ustvari račun"}
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        Že imaš račun? <a href="/auth/login">Prijava</a>
      </p>
    </div>
  );
}
