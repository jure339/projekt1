"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Game = {
  id: string;
  cas_tekme: string; // ISO/text
  kraj: string | null;
  nasprotnik_id: string | null;
  nasprotnik_ime: string | null;
};

type Opponent = { id: string; ime: string };

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toDatetimeLocal(value: string) {
  const dt = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [game, setGame] = useState<Game | null>(null);
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  const [cas, setCas] = useState("");
  const [kraj, setKraj] = useState("");
  const [nasprotnikId, setNasprotnikId] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const [gRes, oRes] = await Promise.all([
          fetch(`/api/game/${id}`, { cache: "no-store" }),
          // ✅ tvoj endpoint je v /api/game/nasprotne-ekipe
          fetch(`/api/game/nasprotne-ekipe`, { cache: "no-store" }),
        ]);

        const gData = await safeReadJson(gRes);
        const oData = await safeReadJson(oRes);

        if (!gRes.ok) {
          setMsg(gData?.error ?? "Napaka pri nalaganju tekme.");
          setGame(null);
          return;
        }

        const gg = gData?.game as Game;
        setGame(gg);

        setCas(toDatetimeLocal(gg.cas_tekme));
        setKraj(gg.kraj ?? "");
        setNasprotnikId(gg.nasprotnik_id ?? "");

        if (oRes.ok) setOpponents(oData?.teams ?? []);
      } catch {
        setMsg("Napaka pri povezavi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!cas.trim()) {
      setMsg("Čas tekme je obvezen.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/game/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cas_tekme: new Date(cas).toISOString(),
          kraj: kraj.trim() === "" ? null : kraj.trim(),
          nasprotnik_id: nasprotnikId.trim() === "" ? null : nasprotnikId.trim(),
        }),
      });

      const data = await safeReadJson(res);
      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju.");
        return;
      }

      // opcijsko: posodobi state, ni pa nujno ker greš nazaj
      const updated = data?.game as Game | undefined;
      if (updated) setGame(updated);

      setMsg("Shranjeno ✅");

      // ✅ po shranjevanju nazaj na seznam tekem
      router.push("/tekme"); // če imaš stran na /tekme, zamenjaj v "/tekme"
      router.refresh();
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Res želiš izbrisati tekmo?")) return;

    try {
      const res = await fetch(`/api/game/${id}`, { method: "DELETE" });
      const data = await safeReadJson(res);

      if (!res.ok) {
        alert(data?.error ?? "Napaka pri brisanju.");
        return;
      }

      // ✅ po brisanju nazaj na seznam tekem
      router.push("/game"); // če imaš stran na /tekme, zamenjaj v "/tekme"
      router.refresh();
    } catch {
      alert("Napaka pri povezavi.");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!game) return <div className="p-6">{msg ?? "Tekma ni na voljo."}</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Uredi tekmo
        </h1>

        <button
          onClick={onDelete}
          className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red/90"
        >
          Izbriši
        </button>
      </div>

      <form
        onSubmit={onSave}
        className="grid gap-4 rounded-lg border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark"
      >
        <label className="text-sm font-medium text-dark dark:text-white">
          Čas tekme
          <input
            className="mt-2 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            type="datetime-local"
            value={cas}
            onChange={(e) => setCas(e.target.value)}
            required
          />
        </label>

        <label className="text-sm font-medium text-dark dark:text-white">
          Kraj
          <input
            className="mt-2 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={kraj}
            onChange={(e) => setKraj(e.target.value)}
            placeholder="npr. Velenje"
          />
        </label>

        <label className="text-sm font-medium text-dark dark:text-white">
          Nasprotnik
          <select
            className="mt-2 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            value={nasprotnikId}
            onChange={(e) => setNasprotnikId(e.target.value)}
          >
            <option value="">— brez —</option>
            {opponents.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ime}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-dark-6 dark:text-white/70">
            Trenutno: {game.nasprotnik_ime ?? "—"}
          </p>
        </label>

        <button
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-3 font-medium text-white transition disabled:opacity-60"
          type="submit"
        >
          {saving ? "Shranjujem..." : "Shrani"}
        </button>

        {msg && <p className="text-sm text-dark-6 dark:text-white/70">{msg}</p>}
      </form>
    </div>
  );
}
