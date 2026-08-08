import { getIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

// Current signed-in user (from the oauth-proxy headers) + a sign-out URL.
// oauth-proxy serves /oauth/sign_out, which clears the session cookie; `rd`
// sends the user to the public site afterwards.
export async function GET() {
  const id = await getIdentity();
  return Response.json({
    ...id,
    signOutUrl: "/oauth/sign_out?rd=" + encodeURIComponent("/"),
  });
}
