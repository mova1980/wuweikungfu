import { NextRequest, NextResponse } from "next/server";

const locales = ["fa", "en", "zh"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin auth guard
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("wuwei_admin")?.value;
    if (token !== "granted") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // never cache admin pages — prevents the browser Back button from
    // showing the panel after logout
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/images") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    return NextResponse.redirect(new URL(`/fa${pathname === "/" ? "" : pathname}`, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
