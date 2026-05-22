// Catch-all guard at /api/admin so Vercel does not auto-serve a
// directory listing of the route filenames under /api/admin/*. The
// individual admin lambdas (/api/admin/images/* etc.) are already
// auth-gated; this just prevents the route enumeration surface flagged
// by the security audit.

export function GET() {
  return new Response("Not Found", { status: 404 });
}

export function POST() {
  return new Response("Not Found", { status: 404 });
}
