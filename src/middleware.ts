import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Host-based routing:
//  - blog.appcarrier.cloud (and blog-<env>.) → show the blog at "/"
//  - /cms is only served on the auth-protected CMS host (cms.appcarrier.cloud
//    / cms-<env>.); on any other host it redirects there so OpenShift login is
//    always enforced (the public route never serves the admin).
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const hostname = host.split(":")[0];
  const path = req.nextUrl.pathname;

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isBlogHost = hostname === "blog.appcarrier.cloud" || hostname.startsWith("blog-");
  const isCmsHost = hostname === "cms.appcarrier.cloud" || hostname.startsWith("cms-");

  // Blog subdomain root → blog list
  if (isBlogHost && path === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/blog";
    return NextResponse.rewrite(url);
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
      return NextResponse.redirect(`https://${cmsHost}${path}${req.nextUrl.search}`, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|assets/|favicon|api/).*)"],
};
