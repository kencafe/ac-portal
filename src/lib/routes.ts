// Route helpers — the design source linked to .dc.html files; here we map to
// real Next.js App Router paths.

export const routes = {
  home: "/",
  services: "/#services",
  about: "/#about",
  serviceDetail: (slug: string) => `/dich-vu/${slug}`,
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  cms: "/cms",
};

// Rewrite a raw href from the extracted design data into a real route.
export function rewriteHref(href: string): string {
  if (!href) return "#";
  if (href.startsWith("FPTIS NS Service Detail")) {
    const hash = href.split("#")[1] ?? "";
    return hash ? routes.serviceDetail(hash) : routes.services;
  }
  if (href.startsWith("FPTIS NS Blog")) {
    const hash = href.split("#")[1] ?? "";
    return hash ? routes.blogPost(hash) : routes.blog;
  }
  if (href.startsWith("FPTIS NS Landing")) {
    const hash = href.split("#")[1];
    return hash ? `/#${hash}` : "/";
  }
  if (href === "#top") return "/";
  return href;
}
