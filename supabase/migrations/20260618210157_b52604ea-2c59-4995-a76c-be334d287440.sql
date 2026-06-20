
-- Game enum
DO $$ BEGIN
  CREATE TYPE public.game_type AS ENUM ('valorant', 'lol');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add game column to riot_accounts
ALTER TABLE public.riot_accounts
  ADD COLUMN IF NOT EXISTS game public.game_type NOT NULL DEFAULT 'valorant';

-- Replace unique constraint user_id -> (user_id, game)
ALTER TABLE public.riot_accounts DROP CONSTRAINT IF EXISTS riot_accounts_user_id_key;
DO $$ BEGIN
  ALTER TABLE public.riot_accounts ADD CONSTRAINT riot_accounts_user_game_unique UNIQUE (user_id, game);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS game public.game_type NOT NULL DEFAULT 'valorant';

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS game public.game_type NOT NULL DEFAULT 'valorant';
