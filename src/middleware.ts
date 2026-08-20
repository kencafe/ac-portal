import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Content-Security-Policy — SEC-002: script-src carries a per-request nonce
// instead of 'unsafe-inline' (closed 2 Medium ZAP findings). The nonce has to be
// minted here rather than in next.config.ts because next.config headers are
// static; Next reads the nonce back out of the *request* CSP header we set below
// and stamps it onto its own bootstrap/hydration scripts.
//
// 'strict-dynamic' is what makes that workable: it drops the host allowlist for
// scripts and instead trusts whatever the nonce'd bootstrap loads, which is how
// Next pulls its chunk files. Without it every chunk URL would need listing.
//
// style-src keeps 'unsafe-inline': Next inlines hydration <style> blocks and
// offers no nonce hook for them, so tightening that one is a separate job.
function cspFor(nonce: string | null): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "img-src 'self' data: https://cdn.simpleicons.org https://cdn.jsdelivr.net",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    nonce ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'` : "script-src 'self'",
    "connect-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// Web Crypto + btoa, not Buffer: middleware is bundled for the edge runtime even
// in the self-hosted standalone server, where Buffer is not guaranteed.
function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

// Host-based routing:
//  - blog.appcarrier.cloud (and blog-<env>.) → show the blog at "/"
//  - /cms is only served on the auth-protected CMS host (cms.appcarrier.cloud
//    / cms-<env>.); on any other host it redirects there so OpenShift login is
//    always enforced (the public route never serves the admin).
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const hostname = host.split(":")[0];
  const path = req.nextUrl.pathname;

  const nonce = makeNonce();
  const csp = cspFor(nonce);

  // Next parses the nonce out of the request-side CSP header; x-nonce is for
  // any component that needs to tag a script of its own.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const withNonce = { request: { headers: requestHeaders } };

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isBlogHost = hostname === "blog.appcarrier.cloud" || hostname.startsWith("blog-");
  const isCmsHost = hostname === "cms.appcarrier.cloud" || hostname.startsWith("cms-");

  // Blog subdomain root → blog list
  if (isBlogHost && path === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/blog";
    const res = NextResponse.rewrite(url, withNonce);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  // CMS host root → the admin app. oauth2-proxy lands the user on "/" after a
  // successful login, and the bare CMS host should show the CMS, not the
  // public homepage.
  if (isCmsHost && path === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/cms";
    const res = NextResponse.rewrite(url, withNonce);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  // Admin gate: /cms must be reached via the CMS host (behind oauth-proxy).
  if (path.startsWith("/cms") && !isCmsHost && !isLocal) {
    const cmsHost =
      hostname === "appcarrier.cloud"
        ? "cms.appcarrier.cloud"
        : hostname.endsWith(".appcarrier.cloud")
          ? "cms-" + hostname
          : hostname;
    if (cmsHost !== hostname) {
      const res = NextResponse.redirect(`https://${cmsHost}${path}${req.nextUrl.search}`, 307);
      res.headers.set("Content-Security-Policy", csp);
      return res;
    }
  }

  const res = NextResponse.next(withNonce);
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: ["/((?!_next/|assets/|favicon|api/).*)"],
};
