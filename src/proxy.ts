import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Reglas de acceso por rol — ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 35.
// admin: acceso total. seller: solo /dashboard (filtra su propia cartera dentro).
// client: solo /portal.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthRoute = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPortalRoute = pathname.startsWith("/portal");

  if (!session?.user) {
    if (isAuthRoute) return NextResponse.next();
    if (isAdminRoute || isDashboardRoute || isPortalRoute) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const role = session.user.role;

  if (isAuthRoute) {
    const home = role === "client" ? "/portal" : "/dashboard";
    return NextResponse.redirect(new URL(home, req.nextUrl.origin));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (isPortalRoute && role !== "client") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (isDashboardRoute && role === "client") {
    return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/portal/:path*", "/login"],
};
