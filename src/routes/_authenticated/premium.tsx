import { createFileRoute } from "@tanstack/react-router";
import { Crown, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/premium")({
  component: PremiumPage,
});

function PremiumPage() {
  const features = [
    "Analyses IA illimitées",
    "Rapports hebdomadaires automatiques",
    "Comparaison avec joueurs du même rang",
    "Suivi de progression avancé",
  ];

  return (
    <div className="space-y-6 slide-in">
      <div>
        <p className="font-heading text-[10px] tracking-[0.3em] text-valorant-red uppercase">Monétisation</p>
        <h1 className="font-heading text-3xl font-bold uppercase mt-1">Passe Premium</h1>
      </div>

      <div className="bg-valorant-card border border-valorant-red p-6 clip-valorant glow-red">
        <Crown className="w-8 h-8 text-valorant-red mb-3" />
        <p className="font-heading text-2xl font-bold uppercase">RankUp+</p>
        <p className="text-sm text-muted-foreground mt-1">Tout pour progresser plus vite.</p>

        <ul className="mt-6 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 text-valorant-red mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button disabled className="mt-6 w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm opacity-60">
          Bientôt disponible
        </button>
        <p className="text-[11px] text-muted-foreground mt-3 text-center">Paiement Stripe en cours d'intégration.</p>
      </div>
    </div>
  );
}
