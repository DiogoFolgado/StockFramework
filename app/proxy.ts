import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute  = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // NextAuth v5 session cookie (dev = plain, prod = __Secure- prefix)
  const session =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!session;

  if (isApiRoute)                  return NextResponse.next();
  if (isAuthRoute && isLoggedIn)   return NextResponse.redirect(new URL("/", request.url));
  if (!isAuthRoute && !isLoggedIn) return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
