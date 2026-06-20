import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCoachingReport, markTipInProgress } from "@/lib/rankup.functions";
import { runAnalysis } from "@/lib/analysis.functions";
import { Brain, ExternalLink, CheckCircle2, Clock, Dumbbell, Lightbulb, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/analysis")({
  component: AnalysisPage,
});

type Game = "valorant" | "lol";

const difficultyMeta: Record<string, { label: string; cls: string }> = {
  beginner: { label: "Débutant", cls: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40" },
  intermediate: { label: "Intermédiaire", cls: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  advanced: { label: "Avancé", cls: "bg-valorant-red/20 text-valorant-red border-valorant-red/40" },
};

function AnalysisPage() {
  const [game, setGame] = useState<Game>("valorant");
  const qc = useQueryClient();
  const fetchReport = useServerFn(getCoachingReport);
  const runFn = useServerFn(runAnalysis);
  const markFn = useServerFn(markTipInProgress);

  const { data: report } = useQuery({
    queryKey: ["coaching-report", game],
    queryFn: () => fetchReport({ data: { game } }),
  });

  const mut = useMutation({
    mutationFn: () => runFn({ data: { game } }),
    onSuccess: () => {
      toast.success("Analyse terminée !");
      qc.invalidateQueries({ queryKey: ["coaching-report", game] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markMut = useMutation({
    mutationFn: (tag: string) => markFn({ data: { tag } }),
    onSuccess: () => {
      toast.success("Exercice marqué en cours");
      qc.invalidateQueries({ queryKey: ["coaching-report", game] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cards = (report?.cards ?? []) as any[];
  const analysis = report?.analysis as any;
  const isLol = game === "lol";
  const accent = isLol ? "text-amber-400" : "text-valorant-red";
  const accentBg = isLol ? "bg-amber-500" : "bg-valorant-red";
  const accentGlow = isLol ? "shadow-[0_0_24px_rgba(245,158,11,0.35)]" : "glow-red";

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className={`font-heading text-[10px] tracking-[0.3em] uppercase ${accent}`}>Coach IA</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">Rapport de coaching</h1>
      </div>

      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">Choisis ton jeu</p>
        <div className="grid grid-cols-2 gap-2 bg-valorant-card border border-border p-1 clip-valorant-sm">
          {(["valorant", "lol"] as Game[]).map((g) => (
            <button key={g} onClick={() => setGame(g)}
              className={`py-2.5 font-heading text-xs uppercase tracking-widest transition ${
                game === g
                  ? g === "lol" ? "bg-amber-500 text-black" : "bg-valorant-red text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {g === "valorant" ? "Valorant" : "League of Legends"}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => mut.mutate()} disabled={mut.isPending}
        className={`w-full flex items-center justify-center gap-3 ${accentBg} ${isLol ? "text-black" : "text-white"} py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm ${accentGlow} hover:brightness-110 transition disabled:opacity-60`}>
        <Brain className="w-5 h-5" />
        {mut.isPending ? "Analyse en cours..." : "Lancer l'analyse"}
      </button>

      {analysis && (
        <div className="bg-valorant-card border border-border p-6 clip-valorant-sm text-center">
          <p className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Score de progression</p>
          <p className={`font-heading text-6xl font-bold ${accent} mt-2 text-glow`}>{analysis.progression_score}</p>
          <p className="text-xs text-muted-foreground mt-1">/ 100</p>
          {analysis.summary && <p className="text-sm text-foreground/80 mt-4">{analysis.summary}</p>}
        </div>
      )}

      {cards.length > 0 && (
        <div className="space-y-4">
          {cards.map((c) => {
            const meta = difficultyMeta[c.difficulty] ?? difficultyMeta.beginner;
            const status = c.progress?.status ?? "pending";
            return (
              <article key={c.tag} className="bg-valorant-card border border-border clip-valorant-sm p-5 space-y-4">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-heading text-[10px] tracking-widest px-1.5 py-0.5 uppercase border ${accent} border-current/40`}>{c.tag}</span>
                      <span className={`font-heading text-[10px] tracking-widest px-1.5 py-0.5 uppercase border ${meta.cls}`}>{meta.label}</span>
                      {status === "in_progress" && (
                        <span className="flex items-center gap-1 font-heading text-[10px] tracking-widest px-1.5 py-0.5 uppercase border border-sky-500/40 text-sky-400 bg-sky-500/10">
                          <Clock className="w-3 h-3" /> En cours
                        </span>
                      )}
                      {status === "resolved" && (
                        <span className="flex items-center gap-1 font-heading text-[10px] tracking-widest px-1.5 py-0.5 uppercase border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" /> Résolu
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-lg font-bold uppercase leading-tight">{c.problem}</h2>
                  </div>
                </header>

                <Block icon={<AlertTriangle className="w-3.5 h-3.5" />} color="text-valorant-red" label="Problème">{c.description}</Block>
                <Block icon={<Lightbulb className="w-3.5 h-3.5" />} color="text-amber-400" label="Pourquoi">{c.why}</Block>
                <Block icon={<CheckCircle2 className="w-3.5 h-3.5" />} color="text-emerald-400" label="Solution">{c.fix}</Block>
                <Block icon={<Dumbbell className="w-3.5 h-3.5" />} color="text-sky-400" label="Exercice">{c.training}</Block>

                <a href={c.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-border px-3 py-2.5 hover:border-valorant-red group">
                  <span className="text-lg">🎥</span>
                  <span className="flex-1 text-sm text-foreground/90 group-hover:text-valorant-red">{c.video_title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-valorant-red" />
                </a>

                {status !== "resolved" && (
                  <button onClick={() => markMut.mutate(c.tag)} disabled={markMut.isPending || status === "in_progress"}
                    className={`w-full ${status === "in_progress" ? "bg-secondary text-muted-foreground" : `${accentBg} ${isLol ? "text-black" : "text-white"}`} py-3 clip-valorant-sm font-heading text-xs uppercase tracking-widest disabled:opacity-60`}>
                    {status === "in_progress" ? "Exercice en cours — analyse 3 parties pour le résoudre" : "J'ai travaillé cet exercice"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!analysis && !mut.isPending && (
        <p className="text-sm text-muted-foreground text-center mt-10">
          Lance ta première analyse pour recevoir tes fiches de coaching personnalisées.
        </p>
      )}
    </div>
  );
}

function Block({ icon, color, label, children }: { icon: React.ReactNode; color: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
        {icon}
        <span className="font-heading text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">{children}</p>
    </div>
  );
}
