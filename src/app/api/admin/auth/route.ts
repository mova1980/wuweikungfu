import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, tooManyFails, recordFail, clearFails } from "@/lib/adminAuth";

const ipOf = (req: NextRequest) =>
  (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

export async function POST(req: NextRequest) {
  const ip = ipOf(req);
  if (tooManyFails(ip)) {
    return NextResponse.json(
      { error: "تلاش بیش از حد — ۵ دقیقه صبر کنید" },
      { status: 429 }
    );
  }
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password || "");
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    recordFail(ip);
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  clearFails(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("wuwei_admin", "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h session
  });
  return res;
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
