import { NextResponse } from "next/server";
import { listVaultDir, getVaultFileContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p = searchParams.get("path") || "";
  const isRaw = searchParams.get("raw") === "1";
  try {
    if (isRaw) {
      const content = getVaultFileContent(p);
      if (content === null) return NextResponse.json({ error: "not found" }, { status: 404 });
      return NextResponse.json({ path: p, content });
    }
    return NextResponse.json({ path: p, entries: listVaultDir(p) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}