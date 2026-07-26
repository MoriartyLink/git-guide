import { getSandbox } from "@cloudflare/sandbox";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";

export { Sandbox } from "@cloudflare/sandbox";

const TICKET_ISSUER = "learn-git-sandbox";
const TICKET_AUDIENCE = "terminal";
const TERMINAL_SESSION_ID = "learn-git-terminal";
const WORKSPACE = "/workspace/learn-git";

function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  return Boolean(origin && allowedOrigins(env).includes(origin));
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin");
  if (!origin || !allowedOrigins(env).includes(origin)) return {};
  return {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(
  request: Request,
  env: Env,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Cache-Control": "no-store",
    },
  });
}

function secretKey(env: Env): Uint8Array {
  if (env.TERMINAL_TICKET_SECRET.length < 32) {
    throw new Error("TERMINAL_TICKET_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(env.TERMINAL_TICKET_SECRET);
}

async function verifySupabaseAccessToken(request: Request, env: Env): Promise<string> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Missing access token");

  const issuer = `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1`;
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(authorization.slice(7), jwks, {
    audience: "authenticated",
    issuer,
  });
  if (!payload.sub) throw new Error("Access token has no subject");
  return payload.sub;
}

async function sandboxIdFor(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId));
  const suffix = Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `learn-git-${suffix}`;
}

async function createTicket(userId: string, env: Env): Promise<string> {
  return new SignJWT({ terminal: true })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(TICKET_ISSUER)
    .setAudience(TICKET_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(secretKey(env));
}

async function verifyTicket(ticket: string, env: Env): Promise<string> {
  const { payload } = await jwtVerify(ticket, secretKey(env), {
    audience: TICKET_AUDIENCE,
    issuer: TICKET_ISSUER,
  });
  if (!payload.sub || payload.terminal !== true) throw new Error("Invalid terminal ticket");
  return payload.sub;
}

function sandboxFor(env: Env, sandboxId: string) {
  return getSandbox(env.Sandbox, sandboxId, {
    enableDefaultSession: false,
    labels: { app: "learn-git", workload: "student-terminal" },
    sleepAfter: "10m",
    transport: "rpc",
  });
}

async function prepareTerminal(env: Env, userId: string): Promise<void> {
  const sandbox = sandboxFor(env, await sandboxIdFor(userId));
  await sandbox.mkdir(WORKSPACE, { recursive: true });

  let session;
  try {
    session = await sandbox.getSession(TERMINAL_SESSION_ID);
  } catch {
    try {
      session = await sandbox.createSession({
        commandTimeoutMs: 120_000,
        cwd: WORKSPACE,
        id: TERMINAL_SESSION_ID,
      });
    } catch {
      session = await sandbox.getSession(TERMINAL_SESSION_ID);
    }
  }

  await session.exec(
    'git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init -q && printf "# learnGit sandbox\\n" > README.md',
    { timeout: 20_000 },
  );
}

async function terminalResponse(request: Request, env: Env): Promise<Response> {
  if (!isAllowedOrigin(request, env)) return new Response("Origin not allowed", { status: 403 });
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("WebSocket upgrade required", { status: 426 });
  }

  const url = new URL(request.url);
  const ticket = url.searchParams.get("ticket");
  if (!ticket) return new Response("Missing terminal ticket", { status: 401 });

  try {
    const userId = await verifyTicket(ticket, env);
    const sandbox = sandboxFor(env, await sandboxIdFor(userId));
    const session = await sandbox.getSession(TERMINAL_SESSION_ID);
    return await session.terminal(request, { cols: 100, rows: 28 });
  } catch (error) {
    console.warn(JSON.stringify({ event: "terminal_upgrade_rejected", error: String(error) }));
    return new Response("Invalid or expired terminal ticket", { status: 401 });
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json(request, env, { ok: true, service: "learn-git-sandbox" });
    }

    if (url.pathname === "/ws/terminal") return terminalResponse(request, env);

    if (url.pathname === "/api/terminal/session" && request.method === "POST") {
      if (!isAllowedOrigin(request, env)) return json(request, env, { error: "Origin not allowed" }, 403);
      try {
        const userId = await verifySupabaseAccessToken(request, env);
        await prepareTerminal(env, userId);
        return json(request, env, { ticket: await createTicket(userId, env) });
      } catch (error) {
        console.warn(JSON.stringify({ event: "terminal_session_rejected", error: String(error) }));
        return json(request, env, { error: "Unable to create a terminal session" }, 401);
      }
    }

    if (url.pathname === "/api/terminal/session" && request.method === "DELETE") {
      if (!isAllowedOrigin(request, env)) return json(request, env, { error: "Origin not allowed" }, 403);
      try {
        const userId = await verifySupabaseAccessToken(request, env);
        const sandbox = sandboxFor(env, await sandboxIdFor(userId));
        await sandbox.destroy();
        return json(request, env, { ok: true });
      } catch (error) {
        console.warn(JSON.stringify({ event: "terminal_reset_rejected", error: String(error) }));
        return json(request, env, { error: "Unable to reset the terminal" }, 401);
      }
    }

    return json(request, env, { error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
