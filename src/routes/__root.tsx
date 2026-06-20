import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-valorant-red text-glow">404</h1>
        <p className="mt-4 text-sm text-muted-foreground uppercase tracking-widest">Page introuvable</p>
        <Link to="/" className="mt-6 inline-block bg-valorant-red text-white px-6 py-3 clip-valorant-sm font-heading font-bold uppercase tracking-wider text-sm">
          Retour
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-heading uppercase tracking-widest text-foreground">Erreur de chargement</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quelque chose s'est mal passé.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 bg-valorant-red text-white px-6 py-3 clip-valorant-sm font-heading font-bold uppercase tracking-wider text-sm"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RankUp AI — Coach Valorant" },
      { name: "description", content: "Analyse ta progression Valorant grâce à l'IA. Points faibles, conseils personnalisés et score de progression." },
      { property: "og:title", content: "RankUp AI — Coach Valorant" },
      { property: "og:description", content: "Analyse ta progression Valorant grâce à l'IA. Points faibles, conseils personnalisés et score de progression." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "RankUp AI — Coach Valorant" },
      { name: "twitter:description", content: "Analyse ta progression Valorant grâce à l'IA. Points faibles, conseils personnalisés et score de progression." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e2cf55b6-ae88-4f5f-bb9c-a6c54e4896a2" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e2cf55b6-ae88-4f5f-bb9c-a6c54e4896a2" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0A0A0A]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
