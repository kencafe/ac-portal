import type { NextConfig } from "next";

// Content-Security-Policy — tightened for the DAST (OWASP ZAP) gate.
// Partner logos load from Simple Icons / jsDelivr (Devicon); fonts are
// self-hosted by next/font, so no external font/style origins are needed.
//
// SEC-002: the CSP for anything that renders HTML now lives in src/middleware.ts,
// because script-src carries a per-request nonce and next.config headers are
// static. The copy below is the no-nonce fallback for the paths middleware does
// not run on (its matcher excludes _next/, assets/, favicon*, api/). The two
// sets are deliberately DISJOINT: if both applied to one response the browser
// would receive two CSP headers and enforce their intersection, which — a nonce
// policy intersected with an 'unsafe-inline' policy — blocks every script.
// Keep this list in sync with cspFor() in src/middleware.ts.
const staticCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "img-src 'self' data: https://cdn.simpleicons.org https://cdn.jsdelivr.net",
  "font-src 'self' data:",
  // Next.js injects small inline style hydration payloads.
  "style-src 'self' 'unsafe-inline'",
  // No inline script is ever served from these paths, so no nonce is needed.
  "script-src 'self'",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const cspOnly = [{ key: "Content-Security-Policy", value: staticCsp }];

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Cross-origin isolation (ZAP DAST W3). COEP=credentialless keeps public CDN
  // logos (simpleicons/jsdelivr) loading as no-cors <img> without needing CORP
  // on those responses; require-corp would break them. CORP=same-site allows
  // *.appcarrier.cloud subdomains to embed our own assets.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  async headers() {
    return [
      // Everything gets the non-CSP security headers.
      { source: "/(.*)", headers: securityHeaders },
      // CSP only for the paths middleware skips (see the note on staticCsp).
      { source: "/_next/:path*", headers: cspOnly },
      { source: "/assets/:path*", headers: cspOnly },
      { source: "/api/:path*", headers: cspOnly },
      { source: "/favicon.svg", headers: cspOnly },
      { source: "/favicon.ico", headers: cspOnly },
    ];
  },
};

export default nextConfig;
