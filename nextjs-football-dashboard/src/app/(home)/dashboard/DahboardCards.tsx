"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/user-store";
import { cn } from "@/lib/utils";

type Training = {
  id: string;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

type Game = {
  id: string;
  cas_tekme: string;
  kraj: string | null;
  nasprotnik: string | null;
};

type DashboardCardsProps = {
  className?: string;
};

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return { data: null as any };
  try {
    return { data: JSON.parse(text) as any };
  } catch {
    return { data: null as any };
  }
}

export default function DashboardCards({ className }: DashboardCardsProps) {
  const [ekipaId, setEkipaId] = useState<string | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "trener" || !u.ekipa_id) {
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
        const [tRes, gRes] = await Promise.all([
          fetch(`/api/treningi/recent-traning?ekipaId=${encodeURIComponent(ekipaId)}`, {
            cache: "no-store",
          }),
          fetch(`/api/game/upcoming-game`, { cache: "no-store" }),
        ]);

        const t = await safeReadJson(tRes);
        const g = await safeReadJson(gRes);

        if (!tRes.ok) {
          setTraining(null);
          setMsg(t.data?.error ?? `Napaka pri nalaganju treninga (${tRes.status}).`);
        } else {
          setTraining(t.data?.training ?? null);
        }

        if (!gRes.ok) {
          setGame(null);
          setMsg((prev) => prev ?? (g.data?.error ?? `Napaka pri nalaganju tekme (${gRes.status}).`));
        } else {
          setGame(g.data?.game ?? null);
        }
      } catch {
        setMsg("Napaka pri povezavi.");
        setTraining(null);
        setGame(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [ekipaId]);

  const cardClass =
    "rounded-[14px] border border-stroke bg-white p-6 shadow-1 " +
    "dark:border-primary/30 dark:bg-gray-dark dark:shadow-card";

  const titleClass = "text-xl font-bold text-dark dark:text-white";
  const mutedClass = "text-dark-6 dark:text-white/70";
  const bodyClass = "text-dark dark:text-white";

  const actionBtn =
    "inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90";

  return (
    <div className={cn("col-span-12", className)}>
      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Next Training */}
        <div className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={mutedClass}>📅</span>
              <h3 className={titleClass}>Next Training</h3>
            </div>

            <Link href="/addtraning" className={actionBtn}>
              + Add training
            </Link>
          </div>

          {loading ? (
            <p className={mutedClass}>Loading...</p>
          ) : training ? (
            <div className={bodyClass}>
              <div className="mb-2 font-medium">
                {new Date(training.zacetek).toLocaleString()}
              </div>
              <div className={mutedClass}>Surface: {training.povrsina}</div>
              {training.opis && <div className={cn("mt-2", mutedClass)}>{training.opis}</div>}
            </div>
          ) : (
            <p className={cn("mt-10 text-center", mutedClass)}>No trainings scheduled yet</p>
          )}
        </div>

        {/* Next Game */}
        <div className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={mutedClass}>⚽</span>
              <h3 className={titleClass}>Next Game</h3>
            </div>

            <Link href="/addgame" className={actionBtn}>
              + Add game
            </Link>
          </div>

          {loading ? (
            <p className={mutedClass}>Loading...</p>
          ) : game ? (
            <div className={bodyClass}>
              <div className="mb-2 font-medium">
                {new Date(game.cas_tekme).toLocaleString()}
              </div>
              <div className={mutedClass}>
                {game.nasprotnik ? `Opponent: ${game.nasprotnik}` : "Opponent not set"}
              </div>
              {game.kraj && <div className={cn("mt-2", mutedClass)}>Location: {game.kraj}</div>}
            </div>
          ) : (
            <p className={cn("mt-10 text-center", mutedClass)}>No games scheduled yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
