-- Add missing UPDATE policies for analyses and matches tables
-- This fixes a security issue where RLS was enabled but UPDATE was not permitted

CREATE POLICY "own analyses update"
  ON public.analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own matches update"
  ON public.matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);