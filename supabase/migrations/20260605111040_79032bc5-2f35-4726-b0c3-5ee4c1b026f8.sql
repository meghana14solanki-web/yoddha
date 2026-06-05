
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS weight_goal_kg numeric,
  ADD COLUMN IF NOT EXISTS target_months integer,
  ADD COLUMN IF NOT EXISTS water_goal_ml integer NOT NULL DEFAULT 2500,
  ADD COLUMN IF NOT EXISTS protein_goal_g integer NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE TABLE IF NOT EXISTS public.goal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal text NOT NULL,
  plan jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_plans TO authenticated;
GRANT ALL ON public.goal_plans TO service_role;
ALTER TABLE public.goal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own plans" ON public.goal_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own coach messages" ON public.coach_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS coach_messages_user_created_idx ON public.coach_messages(user_id, created_at);
