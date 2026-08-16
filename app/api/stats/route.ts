import { NextResponse } from "next/server";
import { getAllPersonStats } from "@/lib/stats";

export async function GET() {
  return NextResponse.json({ stats: await getAllPersonStats() });
}
