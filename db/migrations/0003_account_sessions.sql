CREATE TABLE learner_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (email = LOWER(email)),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX learner_accounts_email_lower_idx
  ON learner_accounts (LOWER(email));

CREATE TABLE learner_sessions (
  token_hash TEXT PRIMARY KEY CHECK (length(token_hash) = 64),
  account_id UUID NOT NULL REFERENCES learner_accounts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX learner_sessions_expiration_idx
  ON learner_sessions (expires_at);

CREATE TABLE learner_login_attempts (
  email_hash TEXT NOT NULL CHECK (length(email_hash) = 64),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX learner_login_attempts_lookup_idx
  ON learner_login_attempts (email_hash, attempted_at DESC);

DELETE FROM day_assessment_attempts;
DELETE FROM learner_day_results;
DELETE FROM lesson_progress;
DELETE FROM placement_attempts;
DELETE FROM learner_profile;

ALTER TABLE learner_profile
  DROP CONSTRAINT IF EXISTS learner_profile_id_check;

ALTER TABLE placement_attempts
  ALTER COLUMN profile_id DROP DEFAULT;

ALTER TABLE lesson_progress
  ALTER COLUMN profile_id DROP DEFAULT;

ALTER TABLE learner_day_results
  ALTER COLUMN profile_id DROP DEFAULT;

ALTER TABLE day_assessment_attempts
  ALTER COLUMN profile_id DROP DEFAULT;
