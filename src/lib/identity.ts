// Who is signed in. Identity comes from the OpenShift oauth-proxy sidecar that
// fronts the CMS route: with `--pass-user-headers=true` it injects the request
// headers below. Locally (no proxy) we fall back to a dev identity with full
// rights so the CMS is usable without a cluster.
//
// Roles are derived from OpenShift Groups (blog-*). Group forwarding depends on
// the proxy config; when groups are absent the user is treated as a plain
// authenticated user (read/write drafts) — destructive/publish actions are
// gated server-side by RBAC (see src/lib/rbac.ts / API guards).

import { headers } from "next/headers";

export type Role =
  | "Quản trị" | "Kiểm duyệt" | "Biên tập" | "Biên dịch" | "Tác giả" | "Người dùng";

export type Identity = {
  authenticated: boolean;
  user: string;
  email: string;
  groups: string[];
  role: Role;
  isAdmin: boolean;
  initials: string;
};

// Highest-privilege role wins. Names match the Keycloak realm roles
// (realm `ac-portal`), delivered by oauth2-proxy as the `groups` claim →
// X-Forwarded-Groups. Plural aliases kept for backward-compat with the
// earlier OpenShift-group naming.
const GROUP_ROLE: [string, Role][] = [
  ["blog-admin", "Quản trị"],
  ["blog-admins", "Quản trị"],
  ["blog-publisher", "Kiểm duyệt"],
  ["blog-publishers", "Kiểm duyệt"],
  ["blog-editor", "Biên tập"],
  ["blog-editors", "Biên tập"],
  ["blog-translator", "Biên dịch"],
  ["blog-translators", "Biên dịch"],
  ["blog-author", "Tác giả"],
  ["blog-authors", "Tác giả"],
];

function initialsOf(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[.\s_-]+/).filter(Boolean);
  const s = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "");
  return (s || "NS").toUpperCase().slice(0, 3);
}

// True if the signed-in user holds any of the given roles.
export function hasRole(id: Identity, roles: Role[]): boolean {
  return roles.includes(id.role);
}

// Convenience role sets for content actions.
export const CAN_WRITE: Role[] = ["Quản trị", "Kiểm duyệt", "Biên tập", "Tác giả"];
export const CAN_PUBLISH: Role[] = ["Quản trị", "Kiểm duyệt"];
export const CAN_DELETE: Role[] = ["Quản trị"];

// The CMS host is the ONLY host whose requests pass through the oauth2-proxy
// sidecar, so it is the only host whose X-Forwarded-* headers mean anything.
// Mirrors the host test in src/middleware.ts — keep the two in sync.
function isCmsHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "cms.appcarrier.cloud" || h.startsWith("cms-");
}

export async function getIdentity(): Promise<Identity> {
  const h = await headers();
  // SECURITY (SEC-001): the X-Forwarded-* identity headers are only meaningful
  // when the request actually passed through the oauth2-proxy sidecar, which
  // sets them from a verified Keycloak token. A request that reaches the app
  // container directly can FORGE them and grant itself blog-admin.
  //
  // This used to be gated on TRUST_FORWARDED_AUTH=1, set per deployment. That
  // is unsound wherever ONE deployment serves both the public site and the CMS
  // — which is exactly the dev/staging topology: svc ac-portal → app :3000
  // (no proxy) and svc ac-portal-cms → sidecar :8080 both select the same pod,
  // and they share one ConfigMap. The flag therefore switched trust on for the
  // public path too, and a forged X-Forwarded-Groups: blog-admin against
  // https://dev.appcarrier.cloud/api/v1/subscribers returned 200 with lead PII.
  //
  // Trust is now decided per REQUEST by host, so it holds under either topology
  // (prod's split deployments included) and cannot be re-opened by config. It
  // fails CLOSED: if the proxy ever stopped passing the original Host header,
  // the host would not match and the CMS would lose its privileges rather than
  // the public site gaining them.
  const trustForwarded = isCmsHost(h.get("host") || "");
  // oauth2-proxy sets X-Forwarded-User to the OIDC `sub` (an opaque UUID for
  // Keycloak), while the human-readable login name arrives in
  // X-Forwarded-Preferred-Username (from the token's `preferred_username`
  // claim). Prefer the username for display; fall back to the sub, then email.
  const user = trustForwarded
    ? h.get("x-forwarded-preferred-username") ||
      h.get("x-forwarded-user") ||
      h.get("x-forwarded-email") ||
      ""
    : "";
  const email = trustForwarded ? h.get("x-forwarded-email") || "" : "";
  const groups = trustForwarded
    ? (h.get("x-forwarded-groups") || "").split(/[,\s]+/).filter(Boolean)
    : [];

  // No usable proxy headers. Two very different cases:
  //  - Local dev (no oauth2-proxy in front): grant admin for convenience.
  //  - In-cluster: treat as UNAUTHENTICATED. Never admin, or anyone could hit
  //    mutating endpoints via the public host.
  if (!user && !email) {
    const localDev = process.env.NODE_ENV !== "production" || process.env.CMS_LOCAL_ADMIN === "1";
    if (localDev) {
      return { authenticated: false, user: "local-dev", email: "", groups: [], role: "Quản trị", isAdmin: true, initials: "DEV" };
    }
    return { authenticated: false, user: "", email: "", groups: [], role: "Người dùng", isAdmin: false, initials: "NS" };
  }

  const name = user || email;
  let role: Role = "Người dùng";
  for (const [g, r] of GROUP_ROLE) {
    if (groups.includes(g)) {
      role = r;
      break;
    }
  }
  return {
    authenticated: true,
    user: name,
    email,
    groups,
    role,
    isAdmin: role === "Quản trị",
    initials: initialsOf(name),
  };
}
