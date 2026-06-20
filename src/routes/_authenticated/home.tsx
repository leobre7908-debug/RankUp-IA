import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRiotAccount, getAnalyses } from "@/lib/rankup.functions";
import { Brain, ArrowRight, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  const fetchAccount = useServerFn(getRiotAccount);
  const fetchAnalyses = useServerFn(getAnalyses);

  const { data: account } = useQuery({ queryKey: ["riot_account", "valorant"], queryFn: () => fetchAccount({ data: { game: "valorant" } }) });
  const { data: analyses } = useQuery({ queryKey: ["analyses", "valorant"], queryFn: () => fetchAnalyses({ data: { game: "valorant" } }) });
  const last = analyses?.[0];

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-valorant-red uppercase">Tableau de bord</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">
          {account ? `Bienvenue ${account.game_name}` : "Bienvenue agent"}
        </h1>
      </div>

      {!account && (
        <Link to="/profile" className="block bg-valorant-card border border-border p-5 clip-valorant-sm hover:border-valorant-red transition">
          <p className="font-heading uppercase tracking-wider text-sm">Connecte ton Riot ID</p>
          <p className="text-xs text-muted-foreground mt-1">Pour démarrer ta première analyse.</p>
        </Link>
      )}

      {account && (
        <div className="bg-valorant-card border border-border p-5 clip-valorant-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Riot ID</p>
              <p className="font-heading font-bold text-lg mt-1">{account.game_name}#{account.tag_line}</p>
            </div>
            <span className="font-heading text-xs text-valorant-red border border-valorant-red px-2 py-1 uppercase tracking-widest">{account.region}</span>
          </div>
        </div>
      )}

      <Link
        to="/analysis"
        className="flex items-center justify-between bg-valorant-red text-white p-5 clip-valorant glow-red hover:brightness-110 transition"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <div>
            <p className="font-heading font-bold uppercase tracking-wider text-sm">Lancer une analyse IA</p>
            <p className="text-xs opacity-80 mt-0.5">Points faibles + conseils + score</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5" />
      </Link>

      {last && (
        <div className="bg-valorant-card border border-border p-5 clip-valorant-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Dernière analyse</p>
            <p className="font-heading text-2xl font-bold text-valorant-red text-glow">{last.progression_score}</p>
          </div>
          {last.summary && <p className="text-sm text-foreground/80">{last.summary}</p>}
        </div>
      )}

      <Link to="/premium" className="flex items-center gap-3 border border-border p-4 clip-valorant-sm hover:border-valorant-red transition">
        <Crown className="w-5 h-5 text-valorant-red" />
        <div>
          <p className="font-heading text-sm uppercase tracking-wider">Passer Premium</p>
          <p className="text-xs text-muted-foreground">Analyses illimitées et plus.</p>
        </div>
      </Link>
    </div>
  );
}
