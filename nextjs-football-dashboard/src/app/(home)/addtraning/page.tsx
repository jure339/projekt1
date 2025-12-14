"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/FormElements/InputGroup";
import { getUser, type StoredUser } from "@/lib/user-store";

type Payload = {
  ekipa_id: string;
  trener_id: string;
  zacetek: string; // ISO
  konec: string;   // ISO
  povrsina: string;
  opis: string | null;
};

export default function AddTrainingPage() {
  const router = useRouter();

  const [ekipaId, setEkipaId] = useState<string>("");
  const [trenerId, setTrenerId] = useState<string>("");

  // datetime-local format: YYYY-MM-DDTHH:mm
  const [zacetek, setZacetek] = useState<string>("");
  const [konec, setKonec] = useState<string>("");

  const [povrsina, setPovrsina] = useState<string>("umetna");
  const [opis, setOpis] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ preberi trenerja iz localStorage in nastavi ekipo (enako kot AddPlayer)
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

    setTrenerId(u.id);
    setEkipaId(u.ekipa_id);
  }, [router]);

  function toISOFromLocal(local: string) {
    // local: "YYYY-MM-DDTHH:mm" -> ISO (UTC)
    return new Date(local).toISOString();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!ekipaId || !trenerId) {
      setMsg("Ekipa ali trener ni nastavljen.");
      return;
    }

    if (!zacetek || !konec) {
      setMsg("Začetek in konec sta obvezna.");
      return;
    }

    const startISO = toISOFromLocal(zacetek);
    const endISO = toISOFromLocal(konec);

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      setMsg("Konec mora biti po začetku.");
      return;
    }

    setLoading(true);

    const payload: Payload = {
      ekipa_id: ekipaId,
      trener_id: trenerId,
      zacetek: startISO,
      konec: endISO,
      povrsina,
      opis: opis.trim() ? opis.trim() : null,
    };

    try {
      const res = await fetch("/api/treningi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju treninga.");
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
      <h1>Dodaj trening</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Ekipa zaklenjena (zaenkrat izpišemo ID, ker fetch za ime ti pada) */}
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
          label="Začetek"
          placeholder=""
          type="datetime-local"
          required
          value={zacetek}
          handleChange={(e) => setZacetek(e.target.value)}
          disabled={loading}
          active={!!zacetek}
          name="zacetek"
        />

        <InputGroup
          label="Konec"
          placeholder=""
          type="datetime-local"
          required
          value={konec}
          handleChange={(e) => setKonec(e.target.value)}
          disabled={loading}
          active={!!konec}
          name="konec"
        />

        <label className="text-body-sm font-medium text-dark dark:text-white">
          Površina
          <select
            value={povrsina}
            onChange={(e) => setPovrsina(e.target.value)}
            disabled={loading}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="umetna">Umetna</option>
            <option value="naravna">Naravna</option>
            <option value="dvorana">Dvorana</option>
            <option value="drugo">Drugo</option>
          </select>
        </label>

        <div>
          <label className="text-body-sm font-medium text-dark dark:text-white">
            Opis (opcijsko)
          </label>
          <textarea
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            disabled={loading}
            placeholder="npr. taktika, kondicija, zaključki..."
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            rows={4}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Shranjujem..." : "Dodaj trening"}
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
