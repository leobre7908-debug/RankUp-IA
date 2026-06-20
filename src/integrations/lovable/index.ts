// OAuth helpers using Supabase auth directly (no Lovable dependency)
import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google") => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/home`
            : undefined,
        },
      });
      return { error };
    },
  },
};
