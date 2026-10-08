-- TOV Phase 0 schema: family isolation + parent-first RBAC
-- Run via docker-compose (mounted to /docker-entrypoint-initdb.d)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- pgvector added in Phase 5 (learning dedup), not required for Phase 0
-- CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  auth_subject TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('parent_admin','trusted_adult','student','child_managed')),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('child','student')),
  age_range TEXT NOT NULL,
  clean_start BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_themes TEXT[] NOT NULL DEFAULT '{}',
  blocked_words TEXT[] NOT NULL DEFAULT '{}',
  uncertain_action TEXT NOT NULL DEFAULT 'skip_review' CHECK (uncertain_action IN ('skip_review','block','allow')),
  unsuitable_action TEXT NOT NULL DEFAULT 'skip_quiet' CHECK (unsuitable_action IN ('skip_quiet','block')),
  shorts_mode TEXT NOT NULL DEFAULT 'per_child' CHECK (shorts_mode IN ('allow','limit','block','per_child')),
  comments_allowed BOOLEAN NOT NULL DEFAULT false,
  live_requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE video_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  rule_version INT NOT NULL DEFAULT 1,
  verdict TEXT NOT NULL CHECK (verdict IN ('allow','skip','needs_review','blocked_long_pending')),
  reason TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, video_id, rule_version)
);

CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('watched','rejected','searched','request','report','remote_command')),
  video_id TEXT,
  detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON activity_events (family_id, profile_id, created_at DESC);

-- Strict isolation: enable RLS (policies added in Phase 1 when auth JWT wired)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
