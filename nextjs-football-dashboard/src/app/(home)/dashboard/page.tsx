import { AttendanceDonut } from "@/components/Charts/used-devices";
import { PlayersList } from "@/components/Tables/top-channels";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import DashboardCards from "./DahboardCards";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
    page?: string; // ✅ dodano
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame, page } = await searchParams;

  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  // ✅ izračun strani (privzeto 1)
  const currentPage = page ? Math.max(1, Number(page)) : 1;

  return (
    <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
      {/* če rabiš donut, ga lahko vrneš nazaj */}
      {/* <AttendanceDonut
        className="col-span-12 xl:col-span-5"
        key={extractTimeFrame("attendance_overview")}
        timeFrame={extractTimeFrame("attendance_overview")?.split(":")[1]}
      /> */}

      <DashboardCards className="col-span-12" />

      {/* ✅ zdaj bo paginacija delala */}
      <PlayersList className="col-span-12" page={currentPage} />
    </div>
  );
}
