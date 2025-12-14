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

// ✅ varno branje JSON-a iz response (ne vrže napake na prazno/HTML)
async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return { data: null, text: "" };

  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text }; // npr. HTML ali plain text
  }
}

export default function DashboardCards({ className }: DashboardCardsProps) {
  const [ekipaId, setEkipaId] = useState<string | null>(null);

  const [recentTraining, setRecentTraining] = useState<RecentTraining | null>(null);
  const [upcomingGame, setUpcomingGame] = useState<UpcomingGame | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "trener" || !u.ekipa_id) {
      setEkipaId(null);
      setLoading(false);
      return;
    }
    setEkipaId(u.ekipa_id);
  }, []);

  useEffect(() => {
    (async () => {
      if (!ekipaId) return;

      setLoading(true);
      setMsg(null);

      try {
        const tUrl = `/api/treningi/recent-traning?ekipaId=${encodeURIComponent(ekipaId)}`;
        const gUrl = `/api/game/upcoming-game`;

        const [tRes, gRes] = await Promise.all([
          fetch(tUrl, { cache: "no-store" }),
          fetch(gUrl, { cache: "no-store" }),
        ]);

        const t = await safeReadJson(tRes);
        const g = await safeReadJson(gRes);

        // 🔍 DEBUG (poglej v DevTools Console)
        if (!tRes.ok) {
          console.error("recent-training failed:", tRes.status, tRes.statusText, t.text?.slice(0, 200));
        }
        if (!gRes.ok) {
          console.error("upcoming-game failed:", gRes.status, gRes.statusText, g.text?.slice(0, 200));
        }

        // če response ni JSON, bo t.data null → ne crasha
        const tData: any = t.data;
        const gData: any = g.data;

        if (!tRes.ok) {
          setRecentTraining(null);
          setMsg(
            (tData?.error as string) ??
              `Napaka pri nalaganju treninga (${tRes.status}).`
          );
        } else {
          setRecentTraining((tData?.training as RecentTraining) ?? null);
        }

        if (!gRes.ok) {
          setUpcomingGame(null);
          setMsg((prev) => prev ?? (gData?.error as string) ?? `Napaka pri nalaganju tekem (${gRes.status}).`);
        } else {
          setUpcomingGame((gData?.game as UpcomingGame) ?? null);
        }
      } catch (err) {
        console.error("DashboardCards fetch error:", err);
        setMsg("Napaka pri povezavi (poglej Console za podrobnosti).");
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
        {/* Most Recent Training */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-white">📅</span>
            <h3 className="text-xl font-bold text-white">Next Training</h3>
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
            <p className="mt-10 text-center text-white/70">No trainings scheduled yet</p>
          )}
        </div>

        {/* Training Sessions */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Training Sessions</h3>
          </div>

          <Link
            href="/addtraning"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 font-semibold text-black"
          >
            📅 Add Training
          </Link>

          <p className="mt-10 text-center text-white/70">Create and manage your sessions</p>
        </div>

        {/* Games & Matches */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Games & Matches</h3>
          </div>

          <Link
            href="/dashboard/tekme/dodaj"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 font-semibold text-black"
          >
            ➕ Add Game
          </Link>

          {loading ? (
            <p className="mt-10 text-center text-white/70">Loading...</p>
          ) : upcomingGame ? (
            <div className="mt-8 text-center text-white/80">
              <div className="font-semibold text-white">
                {new Date(upcomingGame.cas_tekme).toLocaleString()}
              </div>
              <div className="text-white/70">
                {upcomingGame.nasprotnik ? `vs ${upcomingGame.nasprotnik}` : "Opponent not set"}
              </div>
              {upcomingGame.kraj && <div className="text-white/70">{upcomingGame.kraj}</div>}
            </div>
          ) : (
            <p className="mt-10 text-center text-white/70">No games scheduled yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          </div>

          <div className="grid gap-3">
            <Link
              href="/addplayer"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 font-semibold text-black"
            >
              👤 Add Player
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
