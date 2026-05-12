import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PUBLIC_PATHS = ["/admin/login"];

function isAdminProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) return false;
  return !ADMIN_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

// Custom header used to pass the validated user.id from middleware to
// downstream Server Components (e.g., the admin layout). This avoids a
// second supabase.auth.getUser() call in the layout, which would race with
// the middleware's call and consume the rolling refresh token in flight.
// See: https://github.com/supabase/ssr/issues/68 and Supabase Next.js docs.
const USER_ID_HEADER = "x-bb-user-id";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip any client-injected value of our internal header so it can't be
  // spoofed before middleware sets the trusted value.
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.delete(USER_ID_HEADER);

  // Set up the Supabase response that we'll mutate cookies into.
  let supabaseResponse = NextResponse.next({ request: { headers: upstreamHeaders } });

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
          supabaseResponse = NextResponse.next({
            request: { headers: upstreamHeaders },
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // CRITICAL: refresh the session here, in middleware only. Server Components
  // must NOT call getUser() — they read the trusted user.id from headers
  // instead. This avoids the rolling-refresh-token race condition where
  // two Supabase clients try to refresh the same access token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set the trusted user-id header (or leave unset). Downstream layouts and
  // RSCs read this via headers().get(USER_ID_HEADER) to avoid getUser races.
  if (user) {
    upstreamHeaders.set(USER_ID_HEADER, user.id);
    supabaseResponse = NextResponse.next({
      request: { headers: upstreamHeaders },
    });
    // Re-attach any cookies that were set during getUser()'s refresh.
    for (const cookie of request.cookies.getAll()) {
      supabaseResponse.cookies.set(cookie);
    }
  }

  // Gate protected /admin/* paths — just check session presence.
  // admin_users membership is verified by the layout (using the header above).
  if (isAdminProtectedPath(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // All other /admin/* paths (e.g. /admin/login) skip next-intl; no locale
  // prefixes inside the admin shell.
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
