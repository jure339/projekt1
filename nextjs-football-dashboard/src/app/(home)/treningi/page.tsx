"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/user-store";
import { cn } from "@/lib/utils";

type Training = {
  id: string;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function TrainingListPage() {
  const [ekipaId, setEkipaId] = useState<string | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      setMsg("Nisi prijavljen.");
      setLoading(false);
      return;
    }
    if (u.role !== "trener") {
      setMsg("Samo trener lahko vidi treninge.");
      setLoading(false);
      return;
    }
    if (!u.ekipa_id) {
      setMsg("Trener nima nastavljene ekipe.");
      setLoading(false);
      return;
    }
    setEkipaId(u.ekipa_id);
  }, []);

  async function loadTrainings(teamId: string) {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/treningi?ekipaId=${encodeURIComponent(teamId)}`, {
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setTrainings([]);
        setMsg(data?.error ?? `Napaka pri nalaganju treningov (${res.status}).`);
        return;
      }

      setTrainings(data?.trainings ?? []);
    } catch {
      setTrainings([]);
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ekipaId) return;
    loadTrainings(ekipaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ekipaId]);

  async function onDelete(id: string) {
    if (!confirm("Ali res želiš izbrisati ta trening?")) return;

    try {
      const res = await fetch(`/api/treningi/${id}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (!res.ok) {
        alert(data?.error ?? `Napaka pri brisanju (${res.status}).`);
        return;
      }

      setTrainings((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Napaka pri povezavi.");
    }
  }

  const cardClass =
    "rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark dark:shadow-card";
  const titleClass = "text-2xl font-bold text-dark dark:text-white";
  const mutedClass = "text-dark-6 dark:text-white/70";

  return (
    <div className="mx-auto mt-10 max-w-4xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className={titleClass}>Treningi</h1>

        <div className="flex gap-2">
          <Link
            href="/addtraning"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            + Add training
          </Link>

          <button
            onClick={() => ekipaId && loadTrainings(ekipaId)}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition hover:border-primary dark:border-dark-3 dark:text-white"
            disabled={!ekipaId || loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <div className={cardClass}>
        {loading ? (
          <p className={mutedClass}>Loading...</p>
        ) : trainings.length === 0 ? (
          <p className={mutedClass}>Ni treningov.</p>
        ) : (
          <div className="grid gap-3">
            {trainings.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-lg border border-stroke p-4 dark:border-dark-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium text-dark dark:text-white">
                    {new Date(t.zacetek).toLocaleString()} –{" "}
                    {new Date(t.konec).toLocaleString()}
                  </div>
                  <div className={cn("text-sm", mutedClass)}>
                    Surface: {t.povrsina}
                    {t.opis ? ` · ${t.opis}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(t.id)}
                  className="self-start rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:opacity-90 md:self-auto"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
