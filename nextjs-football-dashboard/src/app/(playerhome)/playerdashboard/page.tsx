import { createTimeFrameExtractor } from '@/utils/timeframe-extractor';
import DashboardCards from './DahboardCards';

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function PlayerDashboard({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;

  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
      {/* ✅ Kartice čez celo stran */}
      <DashboardCards className="col-span-12 xl:col-span-12" />
    </div>
  );
}
