import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "wuwei2026";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("wuwei_admin", "granted", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  }
  return NextResponse.json({ error: "wrong password" }, { status: 401 });
}

/** Lightweight session check — used by the admin shell to kick out
 *  anyone viewing a cached admin page after logout (browser Back button). */
export async function GET(req: NextRequest) {
  const ok = req.cookies.get("wuwei_admin")?.value === "granted";
  const res = NextResponse.json(ok ? { ok: true } : { error: "unauthorized" }, { status: ok ? 200 : 401 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("wuwei_admin", "", { path: "/", maxAge: 0 });
  return res;
}
