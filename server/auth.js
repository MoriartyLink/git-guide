import { createRemoteJWKSet, jwtVerify } from "jose";

const supabaseUrl = (
  process.env.SUPABASE_URL || "https://hiedkdrurpjriccflyph.supabase.co"
).replace(/\/$/, "");
const issuer = `${supabaseUrl}/auth/v1`;
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

export async function verifySupabaseAccessToken(request) {
  const authorization = request.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing access token");
  }

  const { payload } = await jwtVerify(authorization.slice(7), jwks, {
    audience: "authenticated",
    issuer,
  });
  if (!payload.sub) throw new Error("Access token has no subject");
  return payload;
}
