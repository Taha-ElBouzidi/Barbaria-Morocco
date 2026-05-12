import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/auth/callback"];

function isAdminProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) return false;
  return !ADMIN_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set up the Supabase response that we'll mutate cookies into.
  let supabaseResponse = NextResponse.next({ request });

  // Create the Supabase client tied to this request/response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // CRITICAL: refresh the session. Per Supabase docs, do NOT put any logic
  // between createServerClient and getUser; otherwise users may be randomly
  // logged out. getUser() validates against Supabase's auth server (unlike
  // getSession() which only reads cookies without server-side validation).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate protected /admin/* paths.
  if (isAdminProtectedPath(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Confirm user is registered in admin_users (role check beyond JWT).
    const { data: adminRow, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !adminRow) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "?error=unauthorized";
      return NextResponse.redirect(url);
    }

    // Authenticated admin — pass through. Skip next-intl on /admin/*.
    return supabaseResponse;
  }

  // All other /admin/* paths (e.g. /admin/login, /admin/auth/callback) skip
  // next-intl; no locale prefixes inside the admin shell.
  if (pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  // Public site: hand off to next-intl. Merge Supabase's cookies into the
  // intl response so any session-refresh writes survive.
  const intlResponse = intlMiddleware(request);

  for (const cookie of supabaseResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match everything except /api routes, Next internals, and static files.
    "/((?!api|_next/static|_next/image|_vercel|favicon\\.ico|.*\\..*).*)",
  ],
};
