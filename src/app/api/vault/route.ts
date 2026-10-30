import { NextResponse } from "next/server";
import { getContentSummary, getWikiPages } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      content: getContentSummary(),
      wiki: getWikiPages(),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}