"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function GamePage() {
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
        setMsg(data?.error ?? "Failed to load games.");
        setGames([]);
        return;
      }

      setGames(data?.games ?? []);
    } catch {
      setMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to delete this game?")) return;

    const res = await fetch(`/api/game/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await safeJson(res);
      alert(data?.error ?? "Delete failed.");
      return;
    }

    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4">
      <div className="rounded-[14px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Games
          </h1>

          <div className="flex gap-2">
            <Link
              href="/addgame"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              + Add game
            </Link>

            <button
              onClick={load}
              className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition dark:border-dark-3 dark:text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {msg && <p className="mb-4 text-sm text-red">{msg}</p>}

        <div className="grid grid-cols-12 border-b border-stroke pb-3 text-sm font-semibold uppercase text-dark-6 dark:border-dark-3 dark:text-white/70">
          <div className="col-span-4">Date & time</div>
          <div className="col-span-4">Opponent</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <p className="mt-4 text-dark-6 dark:text-white/70">Loading...</p>
        ) : games.length === 0 ? (
          <p className="mt-4 text-dark-6 dark:text-white/70">No games found.</p>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {games.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-12 items-center py-4 text-dark dark:text-white"
              >
                <div className="col-span-4 font-medium">
                  {new Date(g.cas_tekme).toLocaleString()}
                </div>

                <div className="col-span-4">{g.nasprotnik ?? "—"}</div>

                <div className="col-span-2">{g.kraj ?? "—"}</div>

                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    href={`/editgame/${g.id}`}
                    className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium transition hover:border-primary dark:border-dark-3"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => onDelete(g.id)}
                    className="rounded-lg bg-red px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
