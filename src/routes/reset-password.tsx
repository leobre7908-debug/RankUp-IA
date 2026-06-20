import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — RankUp AI" },
      { name: "description", content: "Définis un nouveau mot de passe." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when arriving via the email link
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also accept an existing session as ready (some flows)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Mot de passe trop court (min 6)");
    if (password !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour !");
      navigate({ to: "/home" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground px-6 py-8 max-w-md mx-auto">
      <div className="mt-10">
        <h1 className="font-heading text-4xl font-bold uppercase">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready ? "Choisis un nouveau mot de passe sécurisé." : "Vérification du lien de réinitialisation..."}
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-valorant-card border border-border px-4 py-3.5 text-foreground outline-none focus:border-valorant-red transition"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Confirmer</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full bg-valorant-card border border-border px-4 py-3.5 text-foreground outline-none focus:border-valorant-red transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-valorant-red text-white py-4 clip-valorant font-heading font-bold uppercase tracking-widest text-sm glow-red hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );
}
