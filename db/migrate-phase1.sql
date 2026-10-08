-- TOV Phase 1 migration: YouTube account link + Quick Setup defaults
ALTER TABLE families ADD COLUMN IF NOT EXISTS youtube_account_mode TEXT NOT NULL DEFAULT 'shared'
  CHECK (youtube_account_mode IN ('shared','separate'));
