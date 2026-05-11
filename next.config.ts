import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://formspree.io https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root to this app (otherwise Next picks D:\dev\Havok\package-lock.json).
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    // FR is the default locale (no prefix). EN gets the /en prefix.
    // Emit a bare-path variant for FR and a /en-prefixed variant for EN,
    // each with a wildcard counterpart to catch deep links.
    const PAIRS: Array<[string, string]> = [
      ["/cosmetics", "/rituals/botanical"],
      ["/textile",   "/rituals/heritage"],
      ["/food",      "/rituals/heritage"],
      ["/order",     "/contact"],
      ["/about",     "/story"],
    ];
    const out: Array<{ source: string; destination: string; permanent: true }> = [];
    for (const [from, to] of PAIRS) {
      out.push({ source: from,                 destination: to,                 permanent: true });
      out.push({ source: `${from}/:path*`,     destination: to,                 permanent: true });
      out.push({ source: `/en${from}`,         destination: `/en${to}`,         permanent: true });
      out.push({ source: `/en${from}/:path*`,  destination: `/en${to}`,         permanent: true });
    }
    return out;
  },
};

export default withNextIntl(nextConfig);
