-- TOV Phase 3: TV/device sessions for remote control (PRD §10)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device TEXT NOT NULL DEFAULT 'tv',
  mode TEXT NOT NULL DEFAULT 'child' CHECK (mode IN ('child','learning')),
  current_video_id TEXT,
  status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing','paused','stopped')),
  remaining_sec INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_family_profile_idx ON sessions (family_id, profile_id, updated_at DESC);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
