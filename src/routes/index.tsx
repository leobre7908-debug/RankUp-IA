import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, TrendingUp, Zap, ArrowRight, ShieldCheck, Crosshair } from "lucide-react";
import logo from "@/assets/rankup-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RankUp AI — Coach IA pour Valorant & League of Legends" },
      { name: "description", content: "Analyse ta progression Valorant et LoL avec l'IA. Points faibles, conseils ciblés et score de progression personnalisé." },
      { property: "og:title", content: "RankUp AI — Coach IA Valorant & LoL" },
      { property: "og:description", content: "Connecte ton Riot ID. L'IA décortique ton gameplay et te livre un plan d'action." },
      { property: "og:image", content: logo.url },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "linear-gradient(rgba(255,70,85,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,70,85,.6) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-valorant-red/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-[320px] h-[320px] rounded-full bg-valorant-red/10 blur-[120px]" />

      <div className="relative max-w-md mx-auto px-6">
        {/* Header */}
        <header className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2.5">
            <img src={logo.url} alt="RankUp AI" className="w-9 h-9 object-contain" />
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base tracking-[0.18em]">
                RANK<span className="text-valorant-red">UP</span>
              </span>
              <span className="font-heading text-[9px] tracking-[0.3em] text-valorant-red border border-valorant-red/60 px-1.5 py-0.5">BETA</span>
            </div>
          </div>
          <Link to="/auth" className="font-heading text-[11px] tracking-[0.25em] text-muted-foreground hover:text-foreground uppercase">
            Connexion
          </Link>
        </header>

        {/* Hero */}
        <main className="pt-12 pb-10">
          <div className="flex items-center gap-2 mb-5">
            <Crosshair className="w-3.5 h-3.5 text-valorant-red" />
            <p className="font-heading text-[10px] tracking-[0.35em] text-valorant-red uppercase">Coach IA Compétitif</p>
          </div>

          <h1 className="font-heading text-[44px] sm:text-5xl font-bold leading-[1.02] uppercase">
            Domine ton<br/>
            <span className="text-valorant-red text-glow">classement</span><br/>
            avec l'IA
          </h1>

          <p className="mt-5 text-muted-foreground text-[15px] leading-relaxed">
            Connecte ton compte <span className="text-foreground font-semibold">Valorant</span> ou <span className="text-foreground font-semibold">League of Legends</span>. Notre IA analyse tes parties, repère tes erreurs et te donne un plan d'action concret.
          </p>

          {/* Features grid */}
          <div className="mt-9 grid grid-cols-3 gap-2.5">
            <FeatureCard icon={<Target className="w-4 h-4" />} title="Analyse IA" desc="Faiblesses détectées" />
            <FeatureCard icon={<TrendingUp className="w-4 h-4" />} title="Progression" desc="Score personnalisé" />
            <FeatureCard icon={<Zap className="w-4 h-4" />} title="Conseils pros" desc="Tips ciblés" />
          </div>

          {/* Social proof */}
          <div className="mt-6 relative overflow-hidden border border-border bg-valorant-card clip-valorant-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-valorant-card via-transparent to-valorant-red/20" />
            <div className="relative p-5 flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-lg leading-none">+2 400 joueurs</p>
                <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-widest">analysés cette semaine</p>
              </div>
              <div className="flex -space-x-2">
                {["#ff4655", "#7c3aed", "#06b6d4"].map((c) => (
                  <div key={c} className="w-8 h-8 rounded-full border-2 border-valorant-card" style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #000)` }} />
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <Link
            to="/auth"
            className="mt-8 flex items-center justify-center gap-3 w-full bg-valorant-red text-white py-5 clip-valorant font-heading font-bold uppercase tracking-[0.2em] text-sm glow-red hover:brightness-110 transition"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/auth"
            className="mt-3 flex items-center justify-center w-full border border-border bg-transparent py-4 clip-valorant-sm font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground hover:border-valorant-red transition"
          >
            J'ai déjà un compte
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aucune clé Riot stockée chez toi · 100% sécurisé</span>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-valorant-card border border-border clip-valorant-sm p-3.5 text-center">
      <div className="w-8 h-8 mx-auto bg-valorant-red/10 border border-valorant-red/30 flex items-center justify-center text-valorant-red clip-valorant-sm">
        {icon}
      </div>
      <h3 className="mt-2.5 font-heading font-bold text-[11px] uppercase tracking-wider">{title}</h3>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}
