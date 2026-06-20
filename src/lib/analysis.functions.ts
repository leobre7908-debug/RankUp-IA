import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({ game: z.enum(["valorant", "lol"]).default("valorant") });

export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY manquante.");

    const [{ data: account }, { data: matches }, { data: tips }, { data: progress }] = await Promise.all([
      context.supabase.from("riot_accounts").select("*").eq("user_id", context.userId).eq("game", data.game).maybeSingle(),
      context.supabase.from("matches").select("*").eq("user_id", context.userId).eq("game", data.game).order("played_at", { ascending: false }).limit(10),
      context.supabase.from("coaching_tips").select("*").eq("game", data.game),
      context.supabase.from("user_coaching_progress").select("*").eq("user_id", context.userId),
    ]);

    if (!account) throw new Error(`Aucun compte ${data.game === "valorant" ? "Valorant" : "League of Legends"} lié. Va dans Profil pour le lier.`);
    if (!tips || tips.length === 0) throw new Error("Base de coaching vide.");

    const gameLabel = data.game === "valorant" ? "Valorant" : "League of Legends";
    const stats = {
      game: gameLabel,
      riot_id: `${account.game_name}#${account.tag_line}`,
      region: account.region,
      rank: account.current_rank ?? "Non disponible",
      winrate: account.winrate ?? null,
      top_agent: account.top_agent ?? null,
      avg_kda: account.avg_kda ?? null,
      matches_count: matches?.length ?? 0,
      recent_matches: (matches ?? []).slice(0, 10).map((m: any) => ({
        agent: m.agent, map: m.map, result: m.result, kda: `${m.kills}/${m.deaths}/${m.assists}`,
      })),
    };

    const tipsCatalog = tips.map((t: any) => ({
      tag: t.tag,
      problem: t.problem,
      difficulty: t.difficulty,
    }));

    const resolvedTags = new Set((progress ?? []).filter((p: any) => p.status === "resolved").map((p: any) => p.tip_tag));
    const availableCatalog = tipsCatalog.filter((t) => !resolvedTags.has(t.tag));

    const prompt = `Tu es un coach IA expert ${gameLabel}. À partir des stats du joueur ci-dessous, identifie EXACTEMENT 3 faiblesses et associe chacune à un "tag" provenant de la liste ci-dessous (catalogue de coaching).

RÈGLES STRICTES:
- Réponds UNIQUEMENT en JSON valide.
- Tu DOIS choisir 3 tags parmi le catalogue (pas d'invention).
- Si les stats ne permettent pas de matching précis, choisis en priorité des tags de difficulté "beginner".
- Pas de doublons (3 tags distincts).
- Texte en français, court et actionnable.

CATALOGUE DISPONIBLE:
${JSON.stringify(availableCatalog, null, 2)}

SCHÉMA:
{
  "tags": ["TAG-XX","TAG-XX","TAG-XX"],
  "weaknesses": [3 phrases courtes (ordre = tags)],
  "tips": [3 conseils actionnables courts (ordre = tags)],
  "progression_score": entier 0-100,
  "summary": "1 phrase de synthèse"
}

STATS:
${JSON.stringify(stats, null, 2)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un coach esport. Tu réponds uniquement en JSON valide." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Trop de requêtes. Réessaie dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { throw new Error("Réponse IA invalide."); }

    const validTags = new Set(availableCatalog.map((t) => t.tag));
    const order: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
    let pickedTags: string[] = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: any) => typeof t === "string" && validTags.has(t))
      : [];
    pickedTags = Array.from(new Set(pickedTags)).slice(0, 3);

    // Fallback: complete with beginner tips if needed
    if (pickedTags.length < 3) {
      const fallback = [...availableCatalog]
        .filter((t) => !pickedTags.includes(t.tag))
        .sort((a, b) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9))
        .map((t) => t.tag);
      while (pickedTags.length < 3 && fallback.length) pickedTags.push(fallback.shift()!);
    }

    const weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 3) : [];
    const aiTips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [];
    const score = Math.max(0, Math.min(100, Number(parsed.progression_score) || 0));

    const { data: saved, error } = await context.supabase
      .from("analyses")
      .insert({
        user_id: context.userId,
        game: data.game,
        weaknesses,
        tips: aiTips,
        tip_tags: pickedTags,
        progression_score: score,
        summary: parsed.summary ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Progression updates
    const now = new Date().toISOString();
    for (const tag of pickedTags) {
      const existing = (progress ?? []).find((p: any) => p.tip_tag === tag);
      await context.supabase.from("user_coaching_progress").upsert(
        {
          user_id: context.userId,
          tip_tag: tag,
          status: existing?.status ?? "pending",
          last_detected_at: now,
          detections_since_progress: (existing?.detections_since_progress ?? 0) + 1,
          clean_analyses_since_progress: 0,
        },
        { onConflict: "user_id,tip_tag" },
      );
    }
    // For in_progress tips not detected: increment clean counter; resolve at >=3
    const inProgress = (progress ?? []).filter((p: any) => p.status === "in_progress" && !pickedTags.includes(p.tip_tag));
    for (const p of inProgress) {
      const next = (p.clean_analyses_since_progress ?? 0) + 1;
      await context.supabase
        .from("user_coaching_progress")
        .update({
          clean_analyses_since_progress: next,
          status: next >= 3 ? "resolved" : "in_progress",
        })
        .eq("id", p.id);
    }

    return saved;
  });
