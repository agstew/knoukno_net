import { NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/ouestions",
  "/questions",
  "/example",
  "/answers",
  "/grade",
  "/grade-list",
  "/rated",
  "/rated-list",
  "/average",
  "/print",
  "/delete",
  "/change-password",
  "/admin",
  "/title",
  "/list"
];

export function proxy(req) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get("knoukno_token")?.value;
  const mustChangePassword = req.cookies.get("knoukno_force_change")?.value === "1";

  if (!token) {
    const url = new URL("/register", req.url);
    return NextResponse.redirect(url);
  }

  if (mustChangePassword && !pathname.startsWith("/change-password")) {
    const url = new URL("/change-password", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ouestions/:path*",
    "/questions/:path*",
    "/example/:path*",
    "/answers/:path*",
    "/grade/:path*",
    "/grade-list/:path*",
    "/rated/:path*",
    "/rated-list/:path*",
    "/average/:path*",
    "/print/:path*",
    "/delete/:path*",
    "/change-password/:path*",
    "/admin/:path*",
    "/title/:path*",
    "/list/:path*"
  ]
};
