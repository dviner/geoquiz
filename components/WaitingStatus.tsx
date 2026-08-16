import { DailyStatus } from "@/lib/types";

export function WaitingStatus({ status }: { status: DailyStatus }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-lg font-semibold">
        {status.answeredCount} of {status.totalCount} answered
      </p>
      {status.waitingOn.length > 0 && (
        <p className="mt-1 text-sm text-neutral-500">Waiting on: {status.waitingOn.join(", ")}</p>
      )}
      <p className="mt-3 text-xs text-neutral-400">
        Your answer is locked in. Results reveal once everyone has answered.
      </p>
    </div>
  );
}
