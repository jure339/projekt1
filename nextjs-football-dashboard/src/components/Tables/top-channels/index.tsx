import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getPlayers } from "../fetch";

export async function PlayersList({ className }: { className?: string }) {
  const players = await getPlayers();

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Players
      </h2>

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
          {players.map((player) => (
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
        </TableBody>
      </Table>
    </div>
  );
}
