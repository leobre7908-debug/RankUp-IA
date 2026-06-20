-- OAuth state table for CSRF protection during Riot OAuth flow
CREATE TABLE IF NOT EXISTS public.riot_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state text NOT NULL UNIQUE,
  game text NOT NULL CHECK (game IN ('valorant', 'lol')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE public.riot_oauth_states ENABLE ROW LEVEL SECURITY;

-- Policies: users can only manage their own states
CREATE POLICY "own states select" ON public.riot_oauth_states
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "own states insert" ON public.riot_oauth_states
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own states delete" ON public.riot_oauth_states
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX idx_riot_oauth_states_state ON public.riot_oauth_states(state);
CREATE INDEX idx_riot_oauth_states_expires ON public.riot_oauth_states(expires_at);

-- Auto-cleanup expired states (optional maintenance)
-- Note: In production, you'd want a cron job or pg_cron to clean old states