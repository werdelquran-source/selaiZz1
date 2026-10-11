import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/vendor") && role !== "VENDOR" && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/vendor/:path*", "/admin/:path*"] };
