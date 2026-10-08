-- TOV Phase 5: student learning paths (PRD §9, SL01-08)
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  start_level TEXT NOT NULL DEFAULT 'beginner',
  levels JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  progress JSONB NOT NULL DEFAULT '{"completed":[]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS learning_paths_family_profile_idx ON learning_paths (family_id, profile_id, updated_at DESC);
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
