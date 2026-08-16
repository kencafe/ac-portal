import type { NextConfig } from "next";

// Content-Security-Policy — tightened for the DAST (OWASP ZAP) gate.
// Partner logos load from Simple Icons / jsDelivr (Devicon); fonts are
// self-hosted by next/font, so no external font/style origins are needed.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "img-src 'self' data: https://cdn.simpleicons.org https://cdn.jsdelivr.net",
  "font-src 'self' data:",
  // Next.js injects small inline runtime/style hydration payloads.
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
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
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
