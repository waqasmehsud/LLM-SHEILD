import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Define Route Matchers
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/reset-password");
  const isAdminRoute =
    path.startsWith("/admin") ||
    path.startsWith("/api/dashboard/admin");

  const isIgnoredRoute =
    path.startsWith("/_next") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/auth/callback") ||
    path.includes(".") ||
    path === "/favicon.ico";

  if (isIgnoredRoute) {
    return supabaseResponse;
  }

  // 2. Protect Routes
  if (user) {
    // Authenticated user trying to access public auth pages (login/signup/reset-password)
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role-gating for admin routes
    if (isAdminRoute) {
      const role = user.user_metadata?.role || "user";
      if (role !== "admin") {
        if (path.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Forbidden: Admin access required" },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } else {
    // Unauthenticated user trying to access protected paths
    if (!isAuthRoute) {
      if (path.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Supports route matching filters.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
