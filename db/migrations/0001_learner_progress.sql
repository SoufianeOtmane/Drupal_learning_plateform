CREATE TABLE learner_profile (
  id TEXT PRIMARY KEY CHECK (id = 'owner'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  placement_completed_at TIMESTAMPTZ,
  recommended_level SMALLINT CHECK (recommended_level BETWEEN 0 AND 5),
  placement_scores JSONB
);

INSERT INTO learner_profile (id)
VALUES ('owner')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE placement_attempts (
  id BIGSERIAL PRIMARY KEY,
  profile_id TEXT NOT NULL DEFAULT 'owner' REFERENCES learner_profile (id),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  answers JSONB NOT NULL DEFAULT '{}'::JSONB,
  scores JSONB,
  recommended_level SMALLINT CHECK (recommended_level BETWEEN 0 AND 5),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  CHECK (
    (status = 'in_progress' AND scores IS NULL AND submitted_at IS NULL)
    OR (status = 'completed' AND scores IS NOT NULL AND submitted_at IS NOT NULL)
  )
);

CREATE INDEX placement_attempts_profile_started_idx
  ON placement_attempts (profile_id, started_at DESC);

CREATE TABLE lesson_progress (
  profile_id TEXT NOT NULL DEFAULT 'owner' REFERENCES learner_profile (id),
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  practice_answer TEXT,
  practice_correct BOOLEAN,
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, lesson_id),
  CHECK (
    (status = 'completed' AND finished_at IS NOT NULL)
    OR (status <> 'completed' AND finished_at IS NULL)
  )
);

INSERT INTO lesson_progress (lesson_id)
VALUES ('day-1-web-request')
ON CONFLICT (profile_id, lesson_id) DO NOTHING;
