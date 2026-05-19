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
      // 'unsafe-eval' was dropped from script-src, no app code uses
      // eval/new Function. 'unsafe-inline' stays for now because Next
      // emits inline boot scripts; future work: nonce + strict-dynamic.
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
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
    // Photo defaults to quality=88 for heroes. Whitelist both 75 (next/image
    // default) and 88 so Next stops warning on every render.
    qualities: [75, 88],
    // Storage paths are content-stable; cache the optimized variants for a
    // year so we don't re-encode on every cold edge node.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Allow next/image to optimize images served from the project's
    // Supabase Storage bucket. Without this remotePatterns entry the
    // optimizer 400s on any uploaded hero image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co").hostname,
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
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
    //
    // The /rituals/[world] public pages were retired (the storefront's
    // browse flow lives at /products/[category]); the three world URLs
    // get permanently redirected to the closest category. Heritage
    // ritual has no flat-product surface so it lands on the homepage.
    const PAIRS: Array<[string, string]> = [
      ["/cosmetics", "/products/cosmetiques"],
      ["/textile",   "/products/epicerie_fine"],
      ["/food",      "/products/epicerie_fine"],
      ["/order",     "/contact"],
      ["/about",     "/story"],
      ["/rituals/hammam",    "/products/cosmetiques"],
      ["/rituals/botanical", "/products/cosmetiques"],
      ["/rituals/heritage",  "/"],
      ["/rituals",           "/products/cosmetiques"],
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
