"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/user-store";
import { cn } from "@/lib/utils";

type RecentTraining = {
  id: string;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

type UpcomingGame = {
  id: string;
  cas_tekme: string;
  kraj: string | null;
  nasprotnik: string | null;
};

type DashboardCardsProps = {
  className?: string;
};

// ✅ varno branje JSON-a
async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return { data: null };

  try {
    return { data: JSON.parse(text) };
  } catch {
    return { data: null };
  }
}

export default function DashboardCards({ className }: DashboardCardsProps) {
  const [ekipaId, setEkipaId] = useState<string | null>(null);

  const [recentTraining, setRecentTraining] = useState<RecentTraining | null>(null);
  const [upcomingGame, setUpcomingGame] = useState<UpcomingGame | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // preberi trenerja
  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "trener" || !u.ekipa_id) {
      setLoading(false);
      return;
    }
    setEkipaId(u.ekipa_id);
  }, []);

  // fetch training + game
  useEffect(() => {
    (async () => {
      if (!ekipaId) return;

      setLoading(true);
      setMsg(null);

      try {
        const [tRes, gRes] = await Promise.all([
          fetch(`/api/treningi/recent-traning?ekipaId=${encodeURIComponent(ekipaId)}`, {
            cache: "no-store",
          }),
          fetch(`/api/game/upcoming-game`, { cache: "no-store" }),
        ]);

        const t = await safeReadJson(tRes);
        const g = await safeReadJson(gRes);

        if (!tRes.ok) {
          setMsg("Napaka pri nalaganju treninga.");
          setRecentTraining(null);
        } else {
          setRecentTraining(t.data?.training ?? null);
        }

        if (!gRes.ok) {
          setMsg((prev) => prev ?? "Napaka pri nalaganju tekem.");
          setUpcomingGame(null);
        } else {
          setUpcomingGame(g.data?.game ?? null);
        }
      } catch (e) {
        console.error(e);
        setMsg("Napaka pri povezavi.");
        setRecentTraining(null);
        setUpcomingGame(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [ekipaId]);

  return (
    <div className={cn("col-span-12", className)}>
      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ================= NEXT TRAINING ================= */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white">📅</span>
              <h3 className="text-xl font-bold text-white">Next Training</h3>
            </div>

            <Link
              href="/addtraning"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Add training
            </Link>
          </div>

          {loading ? (
            <p className="text-white/70">Loading...</p>
          ) : recentTraining ? (
            <div className="text-white/80">
              <div className="mb-2 font-medium text-white">
                {new Date(recentTraining.zacetek).toLocaleString()}
              </div>
              <div className="text-white/70">Surface: {recentTraining.povrsina}</div>
              {recentTraining.opis && (
                <div className="mt-2 text-white/70">{recentTraining.opis}</div>
              )}
            </div>
          ) : (
            <p className="mt-10 text-center text-white/70">
              No trainings scheduled yet
            </p>
          )}
        </div>

        {/* ================= NEXT GAME ================= */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white">⚽</span>
              <h3 className="text-xl font-bold text-white">Next Game</h3>
            </div>

            <Link
              href="/addgame"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Add game
            </Link>
          </div>

          {loading ? (
            <p className="text-white/70">Loading...</p>
          ) : upcomingGame ? (
            <div className="text-white/80">
              <div className="mb-2 font-medium text-white">
                {new Date(upcomingGame.cas_tekme).toLocaleString()}
              </div>
              <div className="text-white/70">
                {upcomingGame.nasprotnik
                  ? `Opponent: ${upcomingGame.nasprotnik}`
                  : "Opponent not set"}
              </div>
              {upcomingGame.kraj && (
                <div className="mt-2 text-white/70">
                  Location: {upcomingGame.kraj}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-10 text-center text-white/70">
              No games scheduled yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
