import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { Home, User, Brain, History, Crown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import logo from "@/assets/rankup-logo.png.asset.json";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const nav = [
    { to: "/home" as const, label: "Accueil", icon: Home },
    { to: "/profile" as const, label: "Profil", icon: User },
    { to: "/analysis" as const, label: "Analyse", icon: Brain },
    { to: "/history" as const, label: "Historique", icon: History },
    { to: "/premium" as const, label: "Premium", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground pb-24 max-w-md mx-auto">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/home" className="flex items-center gap-2">
          <img src={logo.url} alt="RankUp AI" className="w-7 h-7 object-contain" />
          <span className="font-heading font-bold text-base tracking-[0.18em]">
            RANK<span className="text-valorant-red">UP</span>
          </span>
        </Link>
        <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-valorant-red transition" aria-label="Déconnexion">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="px-6 py-6">{children}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0A] border-t border-border z-50">
        <div className="grid grid-cols-5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-heading uppercase tracking-widest transition ${
                  active ? "text-valorant-red" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-valorant-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading uppercase tracking-wider">Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu devras te reconnecter pour accéder à tes analyses et ton historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-heading text-xs uppercase tracking-widest">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-valorant-red hover:brightness-110 font-heading text-xs uppercase tracking-widest">
              Déconnexion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
