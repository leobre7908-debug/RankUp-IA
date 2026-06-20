import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRiotAccount } from "@/lib/rankup.functions";
import { getRiotOAuthUrl } from "@/lib/riot-oauth.functions";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Link2, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

type Game = "valorant" | "lol";

function ProfilePage() {
  const [game, setGame] = useState<Game>("valorant");
  const qc = useQueryClient();
  const fetchAccount = useServerFn(getRiotAccount);
  const getOAuthUrl = useServerFn(getRiotOAuthUrl);

  const { data: account } = useQuery({
    queryKey: ["riot_account", game],
    queryFn: () => fetchAccount({ data: { game } }),
  });

  const oauthMut = useMutation({
    mutationFn: () => getOAuthUrl({ data: { game } }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.authUrl) {
        window.location.href = result.authUrl;
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-valorant-red uppercase">Profil joueur</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">Tes comptes</h1>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-valorant-card border border-border p-1 clip-valorant-sm">
        {(["valorant", "lol"] as Game[]).map((g) => (
          <button
            key={g}
            onClick={() => setGame(g)}
            className={`py-2.5 font-heading text-xs uppercase tracking-widest transition ${
              game === g ? "bg-valorant-red text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {g === "valorant" ? "Valorant" : "League of Legends"}
          </button>
        ))}
      </div>

      {!account ? (
        <div className="bg-valorant-card border border-border p-6 clip-valorant-sm space-y-4">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-valorant-red" />
            <div>
              <p className="font-heading text-sm uppercase tracking-wider">
                {game === "valorant" ? "Valorant" : "League of Legends"}
              </p>
              <p className="text-xs text-muted-foreground">Aucun compte lié</p>
            </div>
          </div>

          <button
            onClick={() => oauthMut.mutate()}
            disabled={oauthMut.isPending}
            className="w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm glow-red hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {oauthMut.isPending ? (
              "Connexion..."
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Se connecter avec Riot
              </>
            )}
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            Connexion sécurisée via Riot Sign-On. Tes identifiants ne sont jamais stockés.
          </p>
        </div>
      ) : (
        <div className="bg-valorant-card border border-border p-6 clip-valorant-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-valorant-red" />
              <div>
                <p className="font-heading font-bold text-lg">{account.game_name}#{account.tag_line}</p>
                <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5">{account.region}</span>
              </div>
            </div>
            <button
              onClick={() => oauthMut.mutate()}
              disabled={oauthMut.isPending}
              className="text-muted-foreground hover:text-valorant-red transition"
              title="Rafraîchir via Riot"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <Row label="Rang actuel" value={account.current_rank ?? "Non classé"} />
            <Row label="Winrate" value={account.winrate != null ? `${account.winrate}%` : "—"} />
            {game === "valorant" && <Row label="Agent principal" value={account.top_agent ?? "—"} />}
            <Row label="KDA moyen" value={account.avg_kda != null ? String(account.avg_kda) : "—"} />
          </div>
        </div>
      )}

      <div className="bg-valorant-card border border-border p-4 clip-valorant-sm">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Sécurité</strong> — Ton compte Riot est lié via OAuth 2.0. Nous stockons uniquement ton Riot ID et tes stats publiques.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground uppercase tracking-widest text-[11px] font-heading">{label}</span>
      <span className="font-heading font-bold">{value}</span>
    </div>
  );
}
