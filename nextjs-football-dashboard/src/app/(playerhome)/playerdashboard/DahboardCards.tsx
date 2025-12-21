"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

type Role = "igralec" | "trener";

type Props = {
  className?: string;
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

export default function DashboardCards({ className }: Props) {
  const [role, setRole] = useState<Role | null>(null);
  const [ekipaId, setEkipaId] = useState<string | null>(null);

  const [training, setTraining] = useState<Training | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // 1) Najprej ugotovi uporabnika (cookie-based)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        // ✅ kdo sem (iz cookie tokena)
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const meData = await safeReadJson(meRes);

        if (!meRes.ok) {
          setMsg(meData?.error ?? "Ni prijavljen.");
          return;
        }

        const u = meData?.user as { role: Role; ekipa_id?: string | null } | null;
        if (!u) {
          setMsg("Ni prijavljen.");
          return;
        }

        setRole(u.role);

        // ✅ trener: ekipa_id imaš že (če ga /api/auth/me vrača)
        if (u.role === "trener") {
          if (!u.ekipa_id) {
            setMsg("Trener nima ekipe.");
            return;
          }
          setEkipaId(u.ekipa_id);
          return;
        }

        // ✅ igralec: ekipa dobimo prek /api/igralci/moja-ekipa
        const ekRes = await fetch("/api/igralci/moja-ekipa", { cache: "no-store" });
        const ekData = await safeReadJson(ekRes);

        if (!ekRes.ok) {
          setMsg(ekData?.error ?? "Ne morem pridobiti ekipe igralca.");
          return;
        }

        const id = ekData?.ekipaId as string | undefined;
        if (!id) {
          setMsg("Igralec nima dodeljene ekipe.");
          return;
        }

        setEkipaId(id);
      } catch {
        setMsg("Napaka pri povezavi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Ko imamo ekipaId, naložimo training + game
  useEffect(() => {
    (async () => {
      if (!ekipaId) return;

      setLoading(true);
      setMsg(null);

      try {
        const [tRes, gRes] = await Promise.all([
          fetch(
            `/api/treningi/recent-traning?ekipaId=${encodeURIComponent(ekipaId)}`,
            { cache: "no-store" }
          ),
          // Če upcoming-game potrebuje ekipaId, ga dodaj tukaj:
          // fetch(`/api/game/upcoming-game?ekipaId=${encodeURIComponent(ekipaId)}`, { cache: "no-store" }),
          fetch(`/api/game/upcoming-game`, { cache: "no-store" }),
        ]);

        const tData = await safeReadJson(tRes);
        const gData = await safeReadJson(gRes);

        setTraining(tRes.ok ? tData?.training ?? null : null);
        setGame(gRes.ok ? gData?.game ?? null : null);

        if (!tRes.ok || !gRes.ok) {
          setMsg(
            tData?.error ??
              gData?.error ??
              "Napaka pri nalaganju podatkov."
          );
        }
      } catch {
        setMsg("Napaka pri povezavi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [ekipaId]);

  const card =
    "rounded-[14px] border border-stroke bg-white p-6 shadow-1 dark:border-primary/30 dark:bg-gray-dark dark:shadow-card";
  const title = "text-xl font-bold text-dark dark:text-white";
  const muted = "text-dark-6 dark:text-white/70";
  const btn =
    "inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90";

  const isTrainer = role === "trener";

  return (
    <div className={cn("col-span-12", className)}>
      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* TRAINING */}
        <div className={card}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className={title}>📅 Next Training</h3>

            {isTrainer && (
              <Link href="/addtraning" className={btn}>
                + Add
              </Link>
            )}
          </div>

          {loading ? (
            <p className={muted}>Loading...</p>
          ) : training ? (
            <>
              <div className="font-medium text-dark dark:text-white">
                {new Date(training.zacetek).toLocaleString()}
              </div>
              <div className={muted}>Surface: {training.povrsina}</div>
              {training.opis && <div className={muted}>{training.opis}</div>}
            </>
          ) : (
            <p className={cn("text-center", muted)}>No trainings</p>
          )}
        </div>

        {/* GAME */}
        <div className={card}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className={title}>⚽ Next Game</h3>

            {isTrainer && (
              <Link href="/addgame" className={btn}>
                + Add
              </Link>
            )}
          </div>

          {loading ? (
            <p className={muted}>Loading...</p>
          ) : game ? (
            <>
              <div className="font-medium text-dark dark:text-white">
                {new Date(game.cas_tekme).toLocaleString()}
              </div>

              <div className={muted}>
                {game.nasprotnik
                  ? `Opponent: ${game.nasprotnik}`
                  : "Opponent not set"}
              </div>

              {game.kraj && <div className={muted}>Location: {game.kraj}</div>}
            </>
          ) : (
            <p className={cn("text-center", muted)}>No games</p>
          )}
        </div>
      </div>
    </div>
  );
}
