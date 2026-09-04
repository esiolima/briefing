import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.TEMP_DISABLE_AUTH === "true") {
  return NextResponse.next();
}

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if ((isAdminRoute && !isLoginRoute) || isAdminApi) {
    const token = request.cookies.get("mb_admin_session")?.value;
    const session = token ? verifyAdminSession(token) : null;

    if (!session) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
