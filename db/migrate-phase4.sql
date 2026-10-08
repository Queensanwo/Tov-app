-- TOV Phase 4: screen time + cross-device continuity (PRD §10, PC04)
CREATE TABLE IF NOT EXISTS screen_time_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'combined' CHECK (scope IN ('combined','per_device')),
  device TEXT NOT NULL DEFAULT 'all',
  weekday_limit_sec INT NOT NULL DEFAULT 3600 CHECK (weekday_limit_sec >= 0),
  weekend_limit_sec INT NOT NULL DEFAULT 5400 CHECK (weekend_limit_sec >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, profile_id, device)
);
CREATE TABLE IF NOT EXISTS screen_time_usage (
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device TEXT NOT NULL DEFAULT 'all',
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  used_sec INT NOT NULL DEFAULT 0 CHECK (used_sec >= 0),
  PRIMARY KEY (family_id, profile_id, device, day)
);
CREATE TABLE IF NOT EXISTS continuity_state (
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_video_id TEXT,
  next_video_id TEXT,
  progress JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (family_id, profile_id)
);
ALTER TABLE screen_time_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_state ENABLE ROW LEVEL SECURITY;
