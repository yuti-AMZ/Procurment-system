import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/", "/unauthorized"];

const rolePathPrefixes: Record<string, string[]> = {
  ADMIN: ["/dashboard/admin"],
  COMPANY_ADMIN: ["/dashboard/company-admin"],
  PROCUREMENT: ["/dashboard/procurement"],
  MANAGER: ["/dashboard/manager"],
  EMPLOYEE: ["/dashboard/employee"],
  SUPPLIER: ["/dashboard/supplier"],
  FINANCE_OFFICER: ["/dashboard/finance"],
  AUDITOR: ["/dashboard/audit"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/static")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value || "";
  const userCookie = request.cookies.get("user")?.value || "";

  if (!token || !userCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    if (!user.role || user.accountStatus !== "APPROVED") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    const allowedPrefixes = rolePathPrefixes[user.role as string] || [];
    const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
      || (pathname.startsWith("/dashboard") && !pathname.split("/")[2]);
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
