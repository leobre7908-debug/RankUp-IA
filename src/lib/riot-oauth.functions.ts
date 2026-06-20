import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const STATE_TTL_SECONDS = 300; // 5 minutes

type Game = "valorant" | "lol";

function getRiotRegionFromGame(game: Game): string {
  // Use asia as default regional routing for account API
  // The riot-account API works globally regardless of player region
  return "asia";
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("RIOT_CLIENT_ID ou RIOT_CLIENT_SECRET non configurés");
  }

  const res = await fetch("https://auth.riotgames.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Token exchange failed:", res.status, text);
    throw new Error(`Token exchange failed: ${res.status}`);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  }>;
}

async function getAccountInfo(accessToken: string) {
  const res = await fetch("https://asia.api.riotgames.com/riot/account/v1/accounts/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to get account info: ${res.status}`);
  }

  return res.json() as Promise<{
    puuid: string;
    gameName: string;
    tagLine: string;
  }>;
}

// Generate OAuth state token (stored in Supabase for verification)
async function generateState(userId: string, game: Game, supabase: any): Promise<string> {
  const state = `${game}_${crypto.randomUUID()}`;

  // Store state temporarily (will be verified in callback)
  const { error } = await supabase.from("riot_oauth_states").insert({
    user_id: userId,
    state,
    game,
    expires_at: new Date(Date.now() + STATE_TTL_SECONDS * 1000).toISOString(),
  });

  if (error) {
    // Table might not exist - we'll handle this gracefully
    console.error("Failed to store OAuth state:", error.message);
  }

  return state;
}

// Server function to get OAuth authorization URL
export const getRiotOAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ game: z.enum(["valorant", "lol"]).default("valorant") }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const clientId = process.env.RIOT_CLIENT_ID;
    if (!clientId) {
      return { error: "RIOT_CLIENT_ID non configuré. L'admin doit configurer les identifiants Riot." };
    }

    const redirectUri = `${process.env.RIOT_REDIRECT_URI ?? `${process.env.URL ?? "http://localhost:3000"}/riot/callback`}`;

    // Generate state for CSRF protection
    const state = await generateState(context.userId, data.game, context.supabase);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid",
      state,
    });

    const authUrl = `https://auth.riotgames.com/authorize?${params.toString()}`;

    return { authUrl };
  });

// Input for linking account via OAuth
const LinkOAuthInput = z.object({
  code: z.string(),
  state: z.string(),
});

// Server function to complete OAuth flow (called from callback)
export const linkRiotAccountOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => LinkOAuthInput.parse(d))
  .handler(async ({ data, context }) => {
    const clientId = process.env.RIOT_CLIENT_ID;
    const clientSecret = process.env.RIOT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("RIOT_CLIENT_ID ou RIOT_CLIENT_SECRET non configurés");
    }

    // Verify state
    const { data: stateRow } = await context.supabase
      .from("riot_oauth_states")
      .select("*")
      .eq("state", data.state)
      .eq("user_id", context.userId)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!stateRow) {
      throw new Error("State invalide ou expiré. Réessaie de te connecter.");
    }

    const game = stateRow.game as Game;
    const redirectUri = `${process.env.RIOT_REDIRECT_URI ?? `${process.env.URL ?? "http://localhost:3000"}/riot/callback`}`;

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(data.code, redirectUri);

    // Get account info using access token
    const accountInfo = await getAccountInfo(tokenData.access_token);

    // Clean up state
    await context.supabase.from("riot_oauth_states").delete().eq("state", data.state);

    // Store/update riot account
    const { data: saved, error } = await context.supabase
      .from("riot_accounts")
      .upsert(
        {
          user_id: context.userId,
          game,
          game_name: accountInfo.gameName,
          tag_line: accountInfo.tagLine,
          region: "EUW", // Default region, user can change later if needed
          puuid: accountInfo.puuid,
        },
        { onConflict: "user_id,game" },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { account: saved, game };
  });
