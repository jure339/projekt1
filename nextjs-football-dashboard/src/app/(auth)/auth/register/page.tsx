"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/FormElements/InputGroup";

type Role = "igralec" | "trener";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("igralec");

  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [starost, setStarost] = useState<number>(16);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // igralec
  const [visina, setVisina] = useState<number | "">("");
  const [stevilka, setStevilka] = useState<number | "">("");
  const [pozicijaId, setPozicijaId] = useState("");

  // skupno
  const [ekipaId, setEkipaId] = useState("");

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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Vloga */}
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Vloga
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="igralec">Igralec</option>
            <option value="trener">Trener</option>
          </select>
        </label>

        <InputGroup
          label="Ime"
          placeholder="Vpiši ime"
          type="text"
          required
          value={ime}
          handleChange={(e) => setIme(e.target.value)}
          disabled={loading}
          active={!!ime}
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
        />

        <InputGroup
          label="Starost"
          placeholder="npr. 18"
          type="number"
          required
          value={String(starost)}
          handleChange={(e) => setStarost(Number(e.target.value))}
          disabled={loading}
          active
        />

        <InputGroup
          label="Ekipa ID (UUID)"
          placeholder="opcijsko"
          type="text"
          value={ekipaId}
          handleChange={(e) => setEkipaId(e.target.value)}
          disabled={loading}
          active={!!ekipaId}
        />

        {role === "igralec" && (
          <>
            <InputGroup
              label="Višina (cm)"
              placeholder="npr. 175"
              type="number"
              value={visina === "" ? "" : String(visina)}
              handleChange={(e) =>
                setVisina(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={loading}
              active={!!visina}
            />

            <InputGroup
              label="Številka dresa"
              placeholder="npr. 10"
              type="number"
              value={stevilka === "" ? "" : String(stevilka)}
              handleChange={(e) =>
                setStevilka(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={loading}
              active={!!stevilka}
            />

            <InputGroup
              label="Pozicija ID (UUID)"
              placeholder="opcijsko"
              type="text"
              value={pozicijaId}
              handleChange={(e) => setPozicijaId(e.target.value)}
              disabled={loading}
              active={!!pozicijaId}
            />
          </>
        )}

        <InputGroup
          label="Email"
          placeholder="email@example.com"
          type="email"
          required
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          active={!!email}
        />

        <InputGroup
          label="Geslo"
          placeholder="Vpiši geslo"
          type="password"
          required
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          active={!!password}
        />

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Shranjujem..." : "Ustvari račun"}
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
              <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Prijava
      </button>
      </form>


        




     
    </div>
  );
}
