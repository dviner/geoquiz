import { NextResponse } from "next/server";
import { buildHistoryDays } from "@/lib/history";

export async function GET() {
  return NextResponse.json({ days: await buildHistoryDays() });
}
