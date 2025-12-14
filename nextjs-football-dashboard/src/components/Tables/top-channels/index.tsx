import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getPlayersPage, getPlayersCount } from "../fetch";

const PAGE_SIZE = 5;

export async function PlayersList({
  className,
  page = 1,
}: {
  className?: string;
  page?: number;
}) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const offset = (safePage - 1) * PAGE_SIZE;

  const [players, total] = await Promise.all([
    getPlayersPage(PAGE_SIZE, offset),
    getPlayersCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);

  // za “1 2 3 4 5” (max 5 gumbov)
  const windowSize = 5;
  const start = Math.max(1, safePage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  const startFixed = Math.max(1, end - windowSize + 1);

  const pages = [];
  for (let p = startFixed; p <= end; p++) pages.push(p);

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className
      )}
    >
      {/* Header + gumb */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Players
        </h2>

        <Link
          href="/addplayer"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          + Add player
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">First Name</TableHead>
            <TableHead className="!text-left">Last Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Position</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {players.map((player: any) => (
            <TableRow
              className="text-center text-base font-medium text-dark dark:text-white"
              key={player.id}
            >
              <TableCell className="!text-left">{player.ime}</TableCell>
              <TableCell className="!text-left">{player.priimek}</TableCell>
              <TableCell>{player.starost}</TableCell>
              <TableCell>{player.pozicija}</TableCell>
            </TableRow>
          ))}

          {players.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-dark dark:text-white">
                No players
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* PAGINACIJA */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-dark-6 dark:text-white/70">
          Page {safePage} / {totalPages} · Total: {total}
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`?page=${prevPage}`}
            aria-disabled={safePage === 1}
            className={cn(
              "rounded-lg border border-stroke px-3 py-1.5 text-sm text-dark transition dark:border-dark-3 dark:text-white",
              safePage === 1 && "pointer-events-none opacity-50"
            )}
          >
            Prev
          </Link>

          {pages.map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={cn(
                "rounded-lg border border-stroke px-3 py-1.5 text-sm transition dark:border-dark-3",
                p === safePage
                  ? "bg-primary text-white border-primary"
                  : "text-dark hover:border-primary dark:text-white"
              )}
            >
              {p}
            </Link>
          ))}

          <Link
            href={`?page=${nextPage}`}
            aria-disabled={safePage === totalPages}
            className={cn(
              "rounded-lg border border-stroke px-3 py-1.5 text-sm text-dark transition dark:border-dark-3 dark:text-white",
              safePage === totalPages && "pointer-events-none opacity-50"
            )}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
