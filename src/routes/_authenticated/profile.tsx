import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRiotAccount, linkRiotAccount } from "@/lib/rankup.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const REGIONS = ["EUW", "EUNE", "NA", "BR", "KR", "JP", "OCE", "LAN", "LAS"];

type Game = "valorant" | "lol";

function ProfilePage() {
  const [game, setGame] = useState<Game>("valorant");
  const qc = useQueryClient();
  const fetchAccount = useServerFn(getRiotAccount);
  const linkFn = useServerFn(linkRiotAccount);
  const { data: account } = useQuery({
    queryKey: ["riot_account", game],
    queryFn: () => fetchAccount({ data: { game } }),
  });

  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState("EUW");

  useEffect(() => {
    if (account) {
      setGameName(account.game_name);
      setTagLine(account.tag_line);
      setRegion(account.region);
    } else {
      setGameName(""); setTagLine(""); setRegion("EUW");
    }
  }, [account, game]);

  const mut = useMutation({
    mutationFn: (d: { gameName: string; tagLine: string; region: string }) =>
      linkFn({ data: { ...d, game } }),
    onSuccess: () => {
      toast.success("Compte lié !");
      qc.invalidateQueries({ queryKey: ["riot_account", game] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-valorant-red uppercase">Profil joueur</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">Tes comptes</h1>
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

      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate({ gameName, tagLine, region }); }}
        className="space-y-5"
      >
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Pseudo</label>
            <input value={gameName} onChange={(e) => setGameName(e.target.value)} required
              className="mt-2 w-full bg-valorant-card border border-border px-4 py-3 outline-none focus:border-valorant-red" />
          </div>
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Tag</label>
            <div className="mt-2 flex items-center bg-valorant-card border border-border px-3 py-3 focus-within:border-valorant-red">
              <span className="text-muted-foreground mr-1">#</span>
              <input value={tagLine} onChange={(e) => setTagLine(e.target.value)} required maxLength={5}
                className="w-16 bg-transparent outline-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Région</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="mt-2 w-full bg-valorant-card border border-border px-4 py-3 outline-none focus:border-valorant-red">
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <button type="submit" disabled={mut.isPending}
          className="w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm glow-red hover:brightness-110 transition disabled:opacity-60">
          {mut.isPending ? "..." : account ? "Mettre à jour" : "Lier mon compte"}
        </button>
      </form>

      {account && (
        <div className="bg-valorant-card border border-border p-5 clip-valorant-sm space-y-2">
          <Row label="Rang actuel" value={account.current_rank ?? "—"} />
          <Row label="Winrate" value={account.winrate != null ? `${account.winrate}%` : "—"} />
          {game === "valorant" && <Row label="Agent principal" value={account.top_agent ?? "—"} />}
          <Row label="KDA moyen" value={account.avg_kda != null ? String(account.avg_kda) : "—"} />
        </div>
      )}
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
