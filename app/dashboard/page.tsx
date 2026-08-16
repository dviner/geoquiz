import { getAllPersonStats } from "@/lib/stats";
import { buildHistoryDays } from "@/lib/history";
import { StatsGrid } from "@/components/StatsGrid";
import { HistoryTable } from "@/components/HistoryTable";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getAllPersonStats();
  const days = await buildHistoryDays();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-3 text-lg font-semibold">Stats</h1>
        <StatsGrid stats={stats} />
      </div>
      <div>
        <h1 className="mb-3 text-lg font-semibold">History</h1>
        <HistoryTable days={days} />
      </div>
    </div>
  );
}
