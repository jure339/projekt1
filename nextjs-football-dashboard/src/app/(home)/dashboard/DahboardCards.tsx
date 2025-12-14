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

export default function DashboardCards({ className }: DashboardCardsProps) {
  const [ekipaId, setEkipaId] = useState<string | null>(null);

  const [recentTraining, setRecentTraining] = useState<RecentTraining | null>(null);
  const [upcomingGame, setUpcomingGame] = useState<UpcomingGame | null>(null);

  const [loading, setLoading] = useState(true);

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
      try {
        const [tRes, gRes] = await Promise.all([
          fetch(`/api/dashboard/recent-training?ekipaId=${ekipaId}`),
          fetch(`/api/dashboard/upcoming-game`),
        ]);

        const tData = await tRes.json();
        const gData = await gRes.json();

        setRecentTraining(tRes.ok ? tData.training : null);
        setUpcomingGame(gRes.ok ? gData.game : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [ekipaId]);

  return (
    // ✅ ta wrapper omogoči, da se komponenta raztegne čez grid (col-span-12 v Home)
    <div className={cn("col-span-12", className)}>
      {/* notranji grid 2x2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Most Recent Training */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-white">📅</span>
            <h3 className="text-xl font-bold text-white">Most Recent Training</h3>
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

        {/* Your Players */}
        <div className="rounded-[14px] border border-primary/30 bg-gray-dark p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Your Players</h3>
          </div>

          <Link
            href="/addplayer"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 font-semibold text-black"
          >
            👤 Add Player
          </Link>

          <p className="mt-10 text-center text-white/70">
            Your players are shown in the Players page
          </p>
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

          <p className="mt-10 text-center text-white/70">No training sessions yet</p>
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
      </div>
    </div>
  );
}
