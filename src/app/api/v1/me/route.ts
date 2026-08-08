import { headers } from "next/headers";
import { getIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

const SSO = "https://sso.appcarrier.cloud";
const REALM = "ac-portal";
const CLIENT = "ac-portal-cms";

// Map the CMS host to its public site host so post-logout lands somewhere the
// user can see without being bounced back into a login.
function publicSite(host: string): string {
  const h = host.split(":")[0];
  if (h === "cms.appcarrier.cloud") return "https://appcarrier.cloud/";
  if (h.startsWith("cms-")) return `https://${h.slice(4)}/`; // cms-dev → dev
  return "https://appcarrier.cloud/";
}

// Current signed-in user (from the oauth2-proxy headers) + a sign-out URL.
// Sign-out must end BOTH sessions: oauth2-proxy clears its cookie, then `rd`
// forwards to Keycloak's RP-initiated logout so the SSO session ends too —
// otherwise reopening /cms silently re-authenticates.
export async function GET() {
  const id = await getIdentity();
  const host = (await headers()).get("host") || "cms.appcarrier.cloud";
  const post = publicSite(host);
  const kcLogout =
    `${SSO}/realms/${REALM}/protocol/openid-connect/logout` +
    `?client_id=${CLIENT}&post_logout_redirect_uri=${encodeURIComponent(post)}`;
  const signOutUrl = "/oauth2/sign_out?rd=" + encodeURIComponent(kcLogout);
  return Response.json({ ...id, signOutUrl });
}
