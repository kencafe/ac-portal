import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Serve the blog on its own subdomain: blog.appcarrier.cloud (and blog-<env>.)
// The root of that host shows the blog list; /blog/<slug> passes through.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const isBlogHost = host === "blog.appcarrier.cloud" || host.startsWith("blog-");
  if (isBlogHost && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/blog";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip static assets, Next internals, and API routes.
  matcher: ["/((?!_next/|assets/|favicon|api/).*)"],
};
