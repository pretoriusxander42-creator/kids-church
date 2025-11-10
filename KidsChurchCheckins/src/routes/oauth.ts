import express from "express";
import { Issuer, custom, generators, type Client } from "openid-client";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

type ProviderKey = "google" | "microsoft";

/**
 * Provider configurations (env-driven)
 * - discover issuer dynamically via openid-client
 * - keep a simple per-provider cache for the issuer/client
 */
const providerConfig: Record<
  ProviderKey,
  {
    envClientId: string;
    envClientSecret: string;
    envRedirectUri: string;
    issuerUrl: string;
  }
> = {
  google: {
    envClientId: process.env.GOOGLE_CLIENT_ID || "",
    envClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    envRedirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    issuerUrl: "https://accounts.google.com"
  },
  microsoft: {
    envClientId: process.env.MS_CLIENT_ID || "",
    envClientSecret: process.env.MS_CLIENT_SECRET || "",
    envRedirectUri: process.env.MS_REDIRECT_URI || "",
    issuerUrl: "https://login.microsoftonline.com/common/v2.0"
  }
};

const clientCache: Partial<Record<ProviderKey, Client>> = {};
const issuerCache: Partial<Record<ProviderKey, ReturnType<typeof Issuer.discover>>> = {};

// helper: ensure provider supported and configured
function assertProvider(provider: string): asserts provider is ProviderKey {
  if (provider !== "google" && provider !== "microsoft") {
    throw new Error("unsupported provider");
  }
  const cfg = providerConfig[provider];
  if (!cfg.envClientId || !cfg.envClientSecret || !cfg.envRedirectUri) {
    throw new Error(`OAuth for ${provider} is not configured in environment variables`);
  }
}

// create or return cached client
async function getClient(provider: ProviderKey) {
  if (clientCache[provider]) return clientCache[provider]!;
  // discover issuer
  const issuer = await Issuer.discover(providerConfig[provider].issuerUrl);
  issuerCache[provider] = issuer;
  const client = new issuer.Client({
    client_id: providerConfig[provider].envClientId,
    client_secret: providerConfig[provider].envClientSecret,
    redirect_uris: [providerConfig[provider].envRedirectUri],
    response_types: ["code"]
  });
  clientCache[provider] = client;
  return client;
}

/**
 * Start OAuth flow:
 * GET /auth/oauth/:provider/start
 * - redirect to provider authorization URL
 * - stores state in session for CSRF protection
 */
router.get("/:provider/start", async (req, res) => {
  try {
    const provider = String(req.params.provider || "").toLowerCase();
    assertProvider(provider);
    const p = provider as ProviderKey;
    const client = await getClient(p);

    // generate state + nonce for security
    const state = generators.state();
    const nonce = generators.nonce();
    // store in session to verify in callback
    if ((req as any).session) {
      (req as any).session.oauthState = state;
      (req as any).session.oauthNonce = nonce;
      (req as any).session.oauthProvider = p;
    }

    const url = client.authorizationUrl({
      scope: "openid email profile",
      state,
      nonce,
      // prefer offline_access if you'd like refresh tokens (subject to provider policies)
      // prompt: "consent"
    });

    // redirect user to provider for auth
    return res.redirect(url);
  } catch (err: any) {
    console.error("oauth start error", err?.message);
    return res.status(500).json({ error: err?.message || "oauth_start_failed" });
  }
});

/**
 * Callback handler:
 * GET /auth/oauth/:provider/callback
 *
 * - exchanges code for tokens
 * - fetches userinfo
 * - upserts user (stores oauthProvider & oauthSubject)
 * - issues our JWT and sets session token
 */
router.get("/:provider/callback", async (req, res) => {
  try {
    const provider = String(req.params.provider || "").toLowerCase();
    assertProvider(provider);
    const p = provider as ProviderKey;
    const client = await getClient(p);

    // verify state matches
    const sessionState = (req as any).session?.oauthState;
    const params = client.callbackParams(req);

    // perform token exchange and handshake
    const tokenSet = await client.callback(providerConfig[p].envRedirectUri, params, {
      state: sessionState
    });

    // fetch userinfo (some providers include profile in id_token, but userinfo is standard)
    let userinfo: any | null = null;
    try {
      userinfo = await client.userinfo(tokenSet.access_token as string);
    } catch (e) {
      // some providers may not support userinfo endpoint; fall back to id_token claims
      userinfo = tokenSet.claims ? tokenSet.claims() : null;
    }

    if (!userinfo) {
      return res.status(500).json({ error: "failed_fetch_userinfo" });
    }

    // provider unique id
    const providerSub = String(userinfo.sub || userinfo.id || "");
    const email = String(userinfo.email || userinfo.preferred_username || "");
    const name = String(userinfo.name || userinfo.given_name || email.split("@")[0]);

    if (!providerSub || !email) {
      return res.status(400).json({ error: "missing_userinfo_fields" });
    }

    // upsert user by email:
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        oauthProvider: p,
        oauthSubject: providerSub
      },
      create: {
        name,
        email,
        oauthProvider: p,
        oauthSubject: providerSub
      }
    });

    // issue our JWT
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "dev", {
      expiresIn: "8h"
    });

    // store token in session cookie for convenience
    if ((req as any).session) (req as any).session.token = token;

    // redirect back to app shell (frontend should read cookie or hit /auth/me)
    // you can change this to a configured frontend redirect URL if desired
    return res.redirect("/app");
  } catch (err: any) {
    console.error("oauth callback error", err);
    return res.status(500).json({ error: err?.message || "oauth_callback_failed" });
  }
});

export default router;