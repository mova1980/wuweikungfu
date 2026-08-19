import { NextRequest, NextResponse } from "next/server";
import { dbStatus } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (req.cookies.get("wuwei_admin")?.value !== "granted") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await dbStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
