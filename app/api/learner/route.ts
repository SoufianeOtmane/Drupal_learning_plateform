import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import type { LearnerState, PlacementSummary } from "@/lib/learner-types";

export const runtime = "nodejs";

export async function GET() {
  const { rows } = await getDbPool().query<{
    placement_completed_at: Date | null;
    recommended_level: number | null;
    placement_scores: PlacementSummary | null;
    lesson_status: LearnerState["lesson"]["status"] | null;
    practice_answer: string | null;
    practice_correct: boolean | null;
    finished_at: Date | null;
  }>(
    `SELECT
       profile.placement_completed_at,
       profile.recommended_level,
       profile.placement_scores,
       lesson.status AS lesson_status,
       lesson.practice_answer,
       lesson.practice_correct,
       lesson.finished_at
     FROM learner_profile AS profile
     LEFT JOIN lesson_progress AS lesson
       ON lesson.profile_id = profile.id AND lesson.lesson_id = 'day-1-web-request'
     WHERE profile.id = 'owner'`,
  );

  const row = rows[0];
  if (!row) throw new Error("The learner profile has not been initialized.");

  const placement =
    row.placement_scores && row.placement_completed_at && row.recommended_level !== null
      ? {
          ...row.placement_scores,
          recommendedLevel: row.recommended_level,
          submittedAt: row.placement_completed_at.toISOString(),
        }
      : null;

  return NextResponse.json({
    placement,
    lesson: {
      id: "day-1-web-request",
      status: row.lesson_status ?? "not_started",
      practiceAnswer: row.practice_answer,
      practiceCorrect: row.practice_correct,
      finishedAt: row.finished_at?.toISOString() ?? null,
    },
  } satisfies LearnerState);
}
