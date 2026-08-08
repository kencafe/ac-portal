import { getIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

// Current signed-in user (from the oauth2-proxy headers) + a sign-out URL.
// oauth2-proxy (Keycloak OIDC) serves /oauth2/sign_out, which clears the
// session cookie; `rd` sends the user to the public site afterwards.
export async function GET() {
  const id = await getIdentity();
  return Response.json({
    ...id,
    signOutUrl: "/oauth2/sign_out?rd=" + encodeURIComponent("/"),
  });
}
