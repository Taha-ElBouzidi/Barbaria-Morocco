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
  // spoofed before middleware sets the trusted value below.
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.delete(USER_ID_HEADER);

  // Initial response. setAll (called inside getUser when tokens refresh)
  // writes Set-Cookie headers DIRECTLY onto this response object —
  // we never re-create the response or copy cookies by name/value, which
  // would strip critical options (maxAge, httpOnly, secure, sameSite).
  let supabaseResponse = NextResponse.next({
    request: { headers: upstreamHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror to request cookies so any subsequent SDK calls in this
          // same middleware invocation see the refreshed tokens.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          // Write Set-Cookie headers to the existing response (preserves
          // all cookie options). Do NOT recreate supabaseResponse here.
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // The ONLY getUser() call in the app. Layouts/RSCs read user.id from the
  // trusted header below, never via their own getUser(). This is what kills
  // the rolling-refresh-token race that was logging users out on nav.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If authenticated, rebuild the response with the trusted user-id header
  // so downstream RSCs can read it. Preserve cookies by copying Set-Cookie
  // HEADERS verbatim (preserves maxAge/httpOnly/secure/sameSite — critical;
  // copying via ResponseCookies.set(name, value) would lose those options
  // and the browser would treat the session as ephemeral / mis-scoped).
  if (user) {
    upstreamHeaders.set(USER_ID_HEADER, user.id);
    const responseWithHeader = NextResponse.next({
      request: { headers: upstreamHeaders },
    });
    for (const setCookie of supabaseResponse.headers.getSetCookie()) {
      responseWithHeader.headers.append("Set-Cookie", setCookie);
    }
    supabaseResponse = responseWithHeader;
  }

  // Gate protected /admin/* paths. Middleware only checks session presence;
  // admin_users membership is verified by the layout via the header above.
  if (isAdminProtectedPath(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // /admin/login (and friends) skip next-intl entirely.
  if (pathname.startsWith("/admin")) {
    return supabaseResponse;
  }

  // /api/* — set the trusted user-id header for /api/admin/* handlers
  // that gate with requireAdmin(), but never run next-intl on API
  // routes (intl would try to redirect to a localised path and break
  // POST/PATCH/DELETE). The handler decides whether to require auth.
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  // Public site: hand to next-intl. Carry over Set-Cookie headers so any
  // session refresh that happened in middleware survives the handoff.
  const intlResponse = intlMiddleware(request);
  for (const setCookie of supabaseResponse.headers.getSetCookie()) {
    intlResponse.headers.append("Set-Cookie", setCookie);
  }
  return intlResponse;
}

export const config = {
  matcher: [
    // Run on every route except Next internals and static files. /api/*
    // is INCLUDED so /api/admin/* handlers receive the trusted user-id
    // header that requireAdmin reads; without this the matcher excluded
    // /api/ and admin uploads always 401'd "Unauthorized".
    "/((?!_next/static|_next/image|_vercel|favicon\\.ico|.*\\..*).*)",
  ],
};
