import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — RankUp AI" },
      { name: "description", content: "Crée ton compte ou connecte-toi pour analyser ton gameplay Valorant." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: signupData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/home` },
        });
        if (error) throw error;
        if (signupData.user && !signupData.session) {
          toast.success("Email envoyé ! Vérifie ta boîte pour confirmer ton compte.");
          return;
        }
        toast.success("Compte créé !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/home" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google");
    if (result.error) toast.error("Échec de la connexion Google");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground px-6 py-8 max-w-md mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.25em] text-muted-foreground hover:text-foreground uppercase">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour
      </Link>

      <div className="mt-10">
        <h1 className="font-heading text-4xl font-bold uppercase">
          {mode === "signup" ? "Crée ton compte" : "Connecte-toi"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Sauvegarde ton historique et tes analyses."
            : "Retrouve ton historique et tes analyses."}
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-valorant-card border border-border px-4 py-3.5 text-foreground outline-none focus:border-valorant-red transition"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-valorant-card border border-border px-4 py-3.5 text-foreground outline-none focus:border-valorant-red transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm glow-red hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "..." : mode === "signup" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <button
          onClick={onGoogle}
          className="mt-4 w-full border border-border bg-valorant-card text-foreground py-3.5 clip-valorant-sm font-heading text-xs uppercase tracking-widest hover:border-valorant-red transition"
        >
          Continuer avec Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="text-foreground hover:text-valorant-red underline-offset-4 hover:underline"
          >
            {mode === "signup" ? "Se connecter" : "Crée ton compte"}
          </button>
        </p>

        {mode === "login" && (
          <p className="mt-3 text-center">
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-valorant-red underline-offset-4 hover:underline">
              Mot de passe oublié ?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
