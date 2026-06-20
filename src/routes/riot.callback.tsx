import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { linkRiotAccountOAuth } from "@/lib/riot-oauth.functions";
import { useEffect, useState } from "react";
import { Loader as Loader2, CircleCheck as CheckCircle, Circle as XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/riot/callback")({
  component: RiotCallbackPage,
});

function RiotCallbackPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const linkFn = useServerFn(linkRiotAccountOAuth);

  const mut = useMutation({
    mutationFn: (params: { code: string; state: string }) =>
      linkFn({ data: params }),
    onSuccess: (result) => {
      setStatus("success");
      toast.success(`Compte ${result.game === "valorant" ? "Valorant" : "League of Legends"} lié avec succès !`);
      qc.invalidateQueries({ queryKey: ["riot_account"] });
      setTimeout(() => {
        navigate({ to: "/profile" });
      }, 2000);
    },
    onError: (err: Error) => {
      setStatus("error");
      setErrorMsg(err.message);
      toast.error("Erreur lors de la liaison du compte");
    },
  });

  useEffect(() => {
    // Parse OAuth callback params on mount
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setStatus("error");
      setErrorMsg(errorDesc || error);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setErrorMsg("Paramètres de callback manquants");
      return;
    }

    // Trigger the OAuth completion
    mut.mutate({ code, state });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground px-6 py-8 max-w-md mx-auto flex flex-col items-center justify-center">
      {status === "loading" && (
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-valorant-red animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Connexion à Riot en cours...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="mt-4 font-heading text-lg uppercase">Compte lié !</p>
          <p className="text-sm text-muted-foreground mt-1">Redirection vers ton profil...</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <XCircle className="w-10 h-10 text-valorant-red mx-auto" />
          <p className="mt-4 font-heading text-lg uppercase">Erreur</p>
          <p className="text-sm text-muted-foreground mt-1">{errorMsg || "Une erreur est survenue"}</p>
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="mt-6 bg-valorant-red text-white px-6 py-3 clip-valorant-sm font-heading text-xs uppercase tracking-widest"
          >
            Retour au profil
          </button>
        </div>
      )}
    </div>
  );
}
