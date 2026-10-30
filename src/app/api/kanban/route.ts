import { NextResponse } from "next/server";
import { getKanbanTasks, getKanbanStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = getKanbanTasks();
    const stats = getKanbanStats();
    return NextResponse.json({ tasks, stats });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}