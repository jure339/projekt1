import { AttendanceDonut } from "@/components/Charts/used-devices"; 
import { PlayersList } from "@/components/Tables/top-channels";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { redirect } from "next/navigation";
import DashboardCards from "./DahboardCards";





type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">



       <DashboardCards className="col-span-12" />
        <PlayersList 
          className="col-span-12 xl:col-span-7"
        />


      </div>
    </>
  );
}
