-- ==============================================================================
-- Supabase Migration: Create nexus_active_state_sync Table with Realtime
-- Location: supabase/migrations/20261026000000_create_nexus_active_state_sync.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.nexus_active_state_sync (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_name TEXT NOT NULL,
  caller_role TEXT,
  speech_to_text TEXT NOT NULL,
  active_tone TEXT NOT NULL DEFAULT 'Professional',
  strategist_response TEXT NOT NULL,
  empath_response TEXT NOT NULL,
  ghost_response TEXT NOT NULL,
  synthesis_response TEXT NOT NULL,
  subtext_hidden_intent TEXT,
  subtext_friction TEXT,
  subtext_leverage TEXT,
  catch_me_up JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_nexus_sync_caller ON public.nexus_active_state_sync (caller_name);
CREATE INDEX IF NOT EXISTS idx_nexus_sync_created_at ON public.nexus_active_state_sync (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.nexus_active_state_sync ENABLE ROW LEVEL SECURITY;

-- Allow reading active state sync rows
DROP POLICY IF EXISTS "Allow select on nexus_active_state_sync" ON public.nexus_active_state_sync;
CREATE POLICY "Allow select on nexus_active_state_sync"
  ON public.nexus_active_state_sync FOR SELECT
  TO public USING (true);

-- Allow inserting active state sync rows
DROP POLICY IF EXISTS "Allow insert on nexus_active_state_sync" ON public.nexus_active_state_sync;
CREATE POLICY "Allow insert on nexus_active_state_sync"
  ON public.nexus_active_state_sync FOR INSERT
  TO public WITH CHECK (true);

-- Allow updating active state sync rows
DROP POLICY IF EXISTS "Allow update on nexus_active_state_sync" ON public.nexus_active_state_sync;
CREATE POLICY "Allow update on nexus_active_state_sync"
  ON public.nexus_active_state_sync FOR UPDATE
  TO public USING (true);

-- Enable Supabase Realtime broadcast for nexus_active_state_sync
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.nexus_active_state_sync;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
