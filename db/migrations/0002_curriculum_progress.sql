ALTER TABLE learner_profile
  ADD COLUMN IF NOT EXISTS current_day SMALLINT NOT NULL DEFAULT 1
    CHECK (current_day BETWEEN 1 AND 31);

CREATE TABLE learner_day_results (
  profile_id TEXT NOT NULL DEFAULT 'owner' REFERENCES learner_profile (id),
  day SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 30),
  best_score SMALLINT NOT NULL CHECK (best_score BETWEEN 0 AND 100),
  passed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, day)
);

CREATE TABLE day_assessment_attempts (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL DEFAULT 'owner' REFERENCES learner_profile (id),
  day SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 30),
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),
  answers JSONB NOT NULL DEFAULT '{}'::JSONB,
  score SMALLINT CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  CHECK (
    (status = 'in_progress' AND score IS NULL AND passed IS NULL AND submitted_at IS NULL)
    OR (status = 'completed' AND score IS NOT NULL AND passed IS NOT NULL AND submitted_at IS NOT NULL)
  )
);

CREATE INDEX day_assessment_attempts_lookup_idx
  ON day_assessment_attempts (profile_id, day, started_at DESC);
