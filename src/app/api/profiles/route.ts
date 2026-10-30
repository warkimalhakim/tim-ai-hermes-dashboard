import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = getProfiles();
    return NextResponse.json({ profiles });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}