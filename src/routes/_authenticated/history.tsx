import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMatches } from "@/lib/rankup.functions";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

type Game = "valorant" | "lol";

function HistoryPage() {
  const [game, setGame] = useState<Game>("valorant");
  const fetchMatches = useServerFn(getMatches);
  const { data: matches } = useQuery({
    queryKey: ["matches", game],
    queryFn: () => fetchMatches({ data: { game } }),
  });

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-valorant-red uppercase">10 dernières parties</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">Historique</h1>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-valorant-card border border-border p-1 clip-valorant-sm">
        {(["valorant", "lol"] as Game[]).map((g) => (
          <button key={g} onClick={() => setGame(g)}
            className={`py-2.5 font-heading text-xs uppercase tracking-widest transition ${
              game === g ? "bg-valorant-red text-white" : "text-muted-foreground hover:text-foreground"
            }`}>
            {g === "valorant" ? "Valorant" : "League of Legends"}
          </button>
        ))}
      </div>

      {(!matches || matches.length === 0) && (
        <p className="text-sm text-muted-foreground text-center mt-10">
          Aucune partie enregistrée pour le moment.
        </p>
      )}

      <div className="space-y-2">
        {matches?.map((m) => {
          const won = m.result === "WIN" || m.result === "Victoire";
          return (
            <div key={m.id} className={`bg-valorant-card border-l-4 ${won ? "border-valorant-red" : "border-border"} border-y border-r border-border p-4 clip-valorant-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold uppercase tracking-wider text-sm">{m.agent ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{m.map ?? "—"} · {m.mode ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className={`font-heading text-xs uppercase tracking-widest ${won ? "text-valorant-red" : "text-muted-foreground"}`}>
                    {m.result ?? "—"}
                  </p>
                  <p className="font-heading font-bold text-sm mt-0.5">
                    {m.kills}/{m.deaths}/{m.assists}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
