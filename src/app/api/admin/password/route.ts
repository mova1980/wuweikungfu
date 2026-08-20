import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, setAdminPassword } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (req.cookies.get("wuwei_admin")?.value !== "granted") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let current = "";
  let next = "";
  try {
    const body = await req.json();
    current = String(body?.current || "");
    next = String(body?.next || "");
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!(await verifyAdminPassword(current))) {
    return NextResponse.json({ error: "رمز فعلی اشتباه است" }, { status: 403 });
  }
  if (next.length < 8 || next.length > 128) {
    return NextResponse.json({ error: "رمز جدید باید حداقل ۸ کاراکتر باشد" }, { status: 400 });
  }
  if (next === current) {
    return NextResponse.json({ error: "رمز جدید باید با رمز فعلی متفاوت باشد" }, { status: 400 });
  }

  try {
    await setAdminPassword(next);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "خطا در ذخیره‌سازی: " + String(e?.message || e).slice(0, 120) },
      { status: 500 }
    );
  }
}
