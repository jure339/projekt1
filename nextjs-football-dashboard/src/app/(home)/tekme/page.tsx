"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Game = {
  id: string;
  cas_tekme: string;
  kraj: string | null;
  nasprotnik: string | null;
};

async function safeJson(res: Response) {
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export default function GamesListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/game", { cache: "no-store" });
      const data = await safeJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri nalaganju tekem.");
        setGames([]);
        return;
      }

      setGames(data?.games ?? []);
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Ali res želiš izbrisati to tekmo?")) return;

    const res = await fetch(`/api/game/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await safeJson(res);
      alert(data?.error ?? "Napaka pri brisanju.");
      return;
    }

    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="mx-auto mt-10 max-w-4xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Tekme</h1>
        <div className="flex gap-2">
          <Link
            href="/addgame"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            + Add game
          </Link>
          <button
            onClick={load}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark dark:border-dark-3 dark:text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <div className={cn("rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark dark:shadow-card")}>
        {loading ? (
          <p className="text-dark-6 dark:text-white/70">Loading...</p>
        ) : games.length === 0 ? (
          <p className="text-dark-6 dark:text-white/70">Ni tekem.</p>
        ) : (
          <div className="grid gap-3">
            {games.map((g) => (
              <div
                key={g.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-stroke p-4 dark:border-dark-3 md:flex-row md:items-center"
              >
                <div>
                  <div className="font-medium text-dark dark:text-white">
                    {new Date(g.cas_tekme).toLocaleString()}
                  </div>
                  <div className="text-sm text-dark-6 dark:text-white/70">
                    {g.nasprotnik ? `Opponent: ${g.nasprotnik}` : "Opponent not set"}
                    {g.kraj ? ` · Location: ${g.kraj}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(g.id)}
                  className="self-start rounded-lg bg-red px-4 py-2 text-sm font-medium text-white md:self-auto"
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
