import sql from "@/lib/db";

export async function getAttendanceData(timeFrame?: "monthly" | "yearly") {
  // 1) Vzamemo vse igralce
  const allPlayers = await sql`
    SELECT id FROM igralci
  `;
  const totalPlayers = allPlayers.length;

  // 2) Iz baze dobimo prisotnost
  // Če želiš mesečni ali letni filter, ga lahko dodaš pozneje.
  const attendance = await sql`
    SELECT COUNT(*)::int AS count
    FROM igralec_trening
    WHERE prisoten = true
  `;

  const presentCount = attendance[0].count;

  // 3) Izračun odstotka
  const percentage = presentCount / totalPlayers;

  return [
    {
      name: "Prisotni igralci",
      percentage: percentage,
      amount: presentCount,
    },
    {
      name: "Manjkajoči igralci",
      percentage: 1 - percentage,
      amount: totalPlayers - presentCount,
    },
  ];
}
