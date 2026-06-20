import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Game = "valorant" | "lol";

function regionalRoute(region: string) {
  const r = region.toUpperCase();
  if (["EUW", "EUNE", "TR", "RU"].includes(r)) return "europe";
  if (["NA", "BR", "LAN", "LAS"].includes(r)) return "americas";
  if (["KR", "JP"].includes(r)) return "asia";
  if (["OCE", "PH", "SG", "TW", "TH", "VN"].includes(r)) return "sea";
  return "europe";
}

// HenrikDev region mapping for Valorant
function henrikRegion(region: string): "eu" | "na" | "ap" | "kr" | "latam" | "br" {
  const r = region.toUpperCase();
  if (["EUW", "EUNE", "TR", "RU"].includes(r)) return "eu";
  if (r === "BR") return "br";
  if (["LAN", "LAS"].includes(r)) return "latam";
  if (r === "NA") return "na";
  if (r === "KR") return "kr";
  return "ap";
}

async function fetchValorantStats(gameName: string, tagLine: string, region: string) {
  try {
    const url = `https://api.henrikdev.xyz/valorant/v3/mmr/${henrikRegion(region)}/pc/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const headers: Record<string, string> = {};
    if (process.env.HENRIKDEV_API_KEY) headers["Authorization"] = process.env.HENRIKDEV_API_KEY;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const json = await res.json();
    const current = json?.data?.current;
    return {
      rank: current?.tier?.name as string | undefined,
      rr: current?.rr as number | undefined,
    };
  } catch {
    return null;
  }
}

async function fetchLolStats(gameName: string, tagLine: string, region: string) {
  const key = process.env.RIOT_API_KEY;
  if (!key) return null;
  try {
    const regional = regionalRoute(region);
    const accRes = await fetch(
      `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": key } },
    );
    if (!accRes.ok) return null;
    const acc = await accRes.json();
    const platform = lolPlatform(region);
    const sumRes = await fetch(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${acc.puuid}`,
      { headers: { "X-Riot-Token": key } },
    );
    if (!sumRes.ok) return { puuid: acc.puuid, rank: undefined };
    const sum = await sumRes.json();
    const leagueRes = await fetch(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${sum.id}`,
      { headers: { "X-Riot-Token": key } },
    );
    if (!leagueRes.ok) return { puuid: acc.puuid, rank: undefined };
    const leagues = await leagueRes.json();
    const solo = Array.isArray(leagues) ? leagues.find((l: any) => l.queueType === "RANKED_SOLO_5x5") : null;
    return {
      puuid: acc.puuid,
      rank: solo ? `${solo.tier} ${solo.rank}` : undefined,
      winrate: solo ? Math.round((solo.wins / (solo.wins + solo.losses)) * 100) : undefined,
    };
  } catch {
    return null;
  }
}

function lolPlatform(region: string) {
  const r = region.toUpperCase();
  const map: Record<string, string> = {
    EUW: "euw1", EUNE: "eun1", NA: "na1", BR: "br1", KR: "kr",
    JP: "jp1", LAN: "la1", LAS: "la2", OCE: "oc1", TR: "tr1", RU: "ru",
  };
  return map[r] ?? "euw1";
}

const LinkInput = z.object({
  gameName: z.string().trim().min(1).max(32),
  tagLine: z.string().trim().min(1).max(10),
  region: z.string().trim().min(2).max(6),
  game: z.enum(["valorant", "lol"]).default("valorant"),
});

export const linkRiotAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LinkInput.parse(d))
  .handler(async ({ data, context }) => {
    let puuid: string | null = null;
    let currentRank: string | null = null;
    let winrate: number | null = null;

    if (data.game === "valorant") {
      const stats = await fetchValorantStats(data.gameName, data.tagLine, data.region);
      currentRank = stats?.rank ?? null;
    } else {
      const stats = await fetchLolStats(data.gameName, data.tagLine, data.region);
      puuid = stats?.puuid ?? null;
      currentRank = stats?.rank ?? null;
      winrate = stats?.winrate ?? null;
    }

    const { data: row, error } = await context.supabase
      .from("riot_accounts")
      .upsert(
        {
          user_id: context.userId,
          game: data.game,
          game_name: data.gameName,
          tag_line: data.tagLine,
          region: data.region.toUpperCase(),
          puuid,
          current_rank: currentRank,
          winrate,
        },
        { onConflict: "user_id,game" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const GameInput = z.object({ game: z.enum(["valorant", "lol"]).default("valorant") });

export const getRiotAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GameInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("riot_accounts")
      .select("*")
      .eq("user_id", context.userId)
      .eq("game", data.game)
      .maybeSingle();
    return row;
  });

export const getAllAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("riot_accounts")
      .select("*")
      .eq("user_id", context.userId);
    return data ?? [];
  });

export const getMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GameInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("matches")
      .select("*")
      .eq("user_id", context.userId)
      .eq("game", data.game)
      .order("played_at", { ascending: false, nullsFirst: false })
      .limit(10);
    return rows ?? [];
  });

export const getAnalyses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GameInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("analyses")
      .select("*")
      .eq("user_id", context.userId)
      .eq("game", data.game)
      .order("created_at", { ascending: false })
      .limit(10);
    return rows ?? [];
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const getCoachingReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GameInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { data: lastAnalysis } = await context.supabase
      .from("analyses")
      .select("*")
      .eq("user_id", context.userId)
      .eq("game", data.game)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const tags = Array.isArray((lastAnalysis as any)?.tip_tags) ? ((lastAnalysis as any).tip_tags as string[]) : [];
    if (tags.length === 0) return { analysis: lastAnalysis ?? null, cards: [] as any[] };

    const [{ data: tips }, { data: progress }] = await Promise.all([
      context.supabase.from("coaching_tips").select("*").in("tag", tags),
      context.supabase.from("user_coaching_progress").select("*").eq("user_id", context.userId).in("tip_tag", tags),
    ]);

    const order: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
    const cards = (tips ?? [])
      .map((t: any) => ({
        ...t,
        progress: (progress ?? []).find((p: any) => p.tip_tag === t.tag) ?? null,
      }))
      .sort((a: any, b: any) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9));

    return { analysis: lastAnalysis, cards };
  });

const TagInput = z.object({ tag: z.string().min(1).max(16) });

export const markTipInProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TagInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_coaching_progress")
      .upsert(
        {
          user_id: context.userId,
          tip_tag: data.tag,
          status: "in_progress",
          clean_analyses_since_progress: 0,
        },
        { onConflict: "user_id,tip_tag" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
