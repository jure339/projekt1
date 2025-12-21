"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/lib/user-store";
import { cn } from "@/lib/utils";

type Training = {
  id: string;
  zacetek: string; // ISO
  konec: string;   // ISO
  povrsina: string;
  opis: string | null;
  ekipa_id?: string | null;
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

// helper: za <input type="datetime-local" />
function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EditTreningPage() {
  const params = useParams();
  const router = useRouter();

  const id = String((params as any)?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [training, setTraining] = useState<Training | null>(null);

  // form
  const [zacetek, setZacetek] = useState("");
  const [konec, setKonec] = useState("");
  const [povrsina, setPovrsina] = useState("");
  const [opis, setOpis] = useState("");

  useEffect(() => {
    // zaščita: samo trener
    const u = getUser();
    if (!u) {
      setMsg("Ni prijavljen.");
      setLoading(false);
      return;
    }
    if (u.role !== "trener") {
      setMsg("Nimaš dostopa (samo trener).");
      setLoading(false);
      return;
    }

    if (!id) {
      setMsg("Manjka ID treninga.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const res = await fetch(`/api/treningi/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        const data = await safeReadJson(res);

        if (!res.ok) {
          setMsg(data?.error ?? "Napaka pri nalaganju treninga.");
          setTraining(null);
          return;
        }

        const t = (data?.training ?? data) as Training; // odvisno kaj vrača endpoint
        setTraining(t);

        setZacetek(t.zacetek ? toDateTimeLocalValue(t.zacetek) : "");
        setKonec(t.konec ? toDateTimeLocalValue(t.konec) : "");
        setPovrsina(t.povrsina ?? "");
        setOpis(t.opis ?? "");
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

    if (!zacetek || !konec || !povrsina.trim()) {
      setMsg("Začetek, konec in površina so obvezni.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        zacetek: new Date(zacetek).toISOString(),
        konec: new Date(konec).toISOString(),
        povrsina: povrsina.trim(),
        opis: opis.trim() === "" ? null : opis.trim(),
      };

      const res = await fetch(`/api/treningi/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri shranjevanju.");
        return;
      }

      setMsg("Shranjeno ✅");

      // če želiš nazaj na seznam treningov:
      router.push("/treningi"); // ← popravi, če je tvoja pot drugačna
      router.refresh();
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

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">
        Uredi trening
      </h1>

      <div className={card}>
        {loading ? (
          <p className="text-dark-6 dark:text-white/70">Nalagam...</p>
        ) : training ? (
          <form onSubmit={onSave} className="grid gap-5">
            <div>
              <div className={label}>Začetek</div>
              <input
                className={input}
                type="datetime-local"
                value={zacetek}
                onChange={(e) => setZacetek(e.target.value)}
                required
              />
            </div>

            <div>
              <div className={label}>Konec</div>
              <input
                className={input}
                type="datetime-local"
                value={konec}
                onChange={(e) => setKonec(e.target.value)}
                required
              />
            </div>

            <div>
              <div className={label}>Površina</div>
              <input
                className={input}
                value={povrsina}
                onChange={(e) => setPovrsina(e.target.value)}
                placeholder="npr. trava / umetna / dvorana"
                required
              />
            </div>

            <div>
              <div className={label}>Opis</div>
              <textarea
                className={cn(input, "min-h-[120px]")}
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                placeholder="Opcijsko..."
              />
            </div>

            <button className={btn} disabled={saving} type="submit">
              {saving ? "Shranjujem..." : "Shrani"}
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
          <p className="text-red">{msg ?? "Trening ni na voljo."}</p>
        )}
      </div>
    </div>
  );
}
