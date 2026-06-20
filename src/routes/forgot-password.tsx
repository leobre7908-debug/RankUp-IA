import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — RankUp AI" },
      { name: "description", content: "Réinitialise ton mot de passe RankUp AI." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("E-mail envoyé !");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground px-6 py-8 max-w-md mx-auto">
      <Link to="/auth" className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.25em] text-muted-foreground hover:text-foreground uppercase">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour
      </Link>

      <div className="mt-10">
        <h1 className="font-heading text-4xl font-bold uppercase">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre ton e-mail, on t'envoie un lien pour réinitialiser ton mot de passe.
        </p>

        {sent ? (
          <div className="mt-10 p-6 bg-valorant-card border border-border clip-valorant-sm">
            <Mail className="w-8 h-8 text-valorant-red mb-3" />
            <h2 className="font-heading text-lg font-bold uppercase">E-mail envoyé</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si un compte existe pour <span className="text-foreground">{email}</span>, tu vas recevoir un lien de réinitialisation. Vérifie aussi tes spams.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex w-full justify-center bg-valorant-red text-white py-3.5 clip-valorant-sm font-heading font-bold uppercase tracking-widest text-sm hover:brightness-110 transition"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <div>
              <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-valorant-card border border-border px-4 py-3.5 text-foreground outline-none focus:border-valorant-red transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm glow-red hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
