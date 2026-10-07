import { NextRequest, NextResponse } from "next/server";
import { checkSameOrigin } from "@/lib/auth";
import { withAuthenticatedUser } from "@/lib/database-api";
import { getDbPool } from "@/lib/db";
import {
  getPublicPlacementQuestions,
  placementQuestions,
} from "@/lib/placement-questions";
import { scorePlacement, validatePlacementAnswers } from "@/lib/placement-scoring";

export const runtime = "nodejs";

type AttemptRow = {
  id: string;
  status: "in_progress" | "completed";
  answers: Record<string, string>;
  scores: ReturnType<typeof scorePlacement> | null;
  recommended_level: number | null;
  submitted_at: Date | null;
};

function publicAttempt(row: AttemptRow | undefined) {
  if (!row) return null;
  return {
    id: Number(row.id),
    status: row.status,
    answers: row.answers,
    result:
      row.scores && row.submitted_at
        ? { ...row.scores, submittedAt: row.submitted_at.toISOString() }
        : null,
  };
}

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const { rows } = await getDbPool().query<AttemptRow>(
      `SELECT id, status, answers, scores, recommended_level, submitted_at
       FROM placement_attempts
       WHERE profile_id = $1
       ORDER BY started_at DESC, id DESC
       LIMIT 1`,
      [user.id],
    );

    return NextResponse.json({
      questions: getPublicPlacementQuestions(),
      attempt: publicAttempt(rows[0]),
    }, { headers: { "Cache-Control": "private, no-store" } });
  });
}

export async function POST(request: NextRequest) {
  return withAuthenticatedUser(async (user) => {
    if (!checkSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const pool = getDbPool();

  if (input.action === "start") {
    const { rows } = await pool.query<AttemptRow>(
      `INSERT INTO placement_attempts (profile_id)
       VALUES ($1)
       RETURNING id, status, answers, scores, recommended_level, submitted_at`,
      [user.id],
    );
    return NextResponse.json({ attempt: publicAttempt(rows[0]) }, { status: 201 });
  }

  if (input.action === "answer") {
    const question = placementQuestions.find((item) => item.id === input.questionId);
    const attemptId = Number(input.attemptId);
    if (
      !Number.isSafeInteger(attemptId) ||
      attemptId < 1 ||
      !question ||
      typeof input.choiceId !== "string" ||
      !question.options.some((option) => option.id === input.choiceId)
    ) {
      return NextResponse.json({ error: "Choose a valid answer for this question." }, { status: 400 });
    }

    const { rows } = await pool.query<{ answers: Record<string, string> }>(
      `UPDATE placement_attempts
       SET answers = answers || jsonb_build_object($2::text, $3::text),
           updated_at = NOW()
       WHERE id = $1 AND profile_id = $4 AND status = 'in_progress'
       RETURNING answers`,
      [attemptId, question.id, input.choiceId, user.id],
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "This placement attempt is no longer active." }, { status: 409 });
    }
    return NextResponse.json({ answers: rows[0].answers });
  }

  if (input.action === "submit") {
    const attemptId = Number(input.attemptId);
    if (!Number.isSafeInteger(attemptId) || attemptId < 1) {
      return NextResponse.json({ error: "A valid placement attempt is required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<AttemptRow>(
        `SELECT id, status, answers, scores, recommended_level, submitted_at
         FROM placement_attempts
         WHERE id = $1 AND profile_id = $2
         FOR UPDATE`,
        [attemptId, user.id],
      );
      const attempt = rows[0];
      if (!attempt || attempt.status !== "in_progress") {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "This placement attempt is no longer active." }, { status: 409 });
      }
      if (!validatePlacementAnswers(attempt.answers)) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Answer all ${placementQuestions.length} questions before submitting.` },
          { status: 400 },
        );
      }

      const submittedAt = new Date();
      const result = scorePlacement(attempt.answers, submittedAt);
      const { rows: updatedRows } = await client.query<AttemptRow>(
        `UPDATE placement_attempts
         SET status = 'completed',
             scores = $2::jsonb,
             recommended_level = $3,
             submitted_at = $4,
             updated_at = $4
         WHERE id = $1 AND profile_id = $5
         RETURNING id, status, answers, scores, recommended_level, submitted_at`,
        [attemptId, JSON.stringify(result), result.recommendedLevel, submittedAt, user.id],
      );
      await client.query(
        `UPDATE learner_profile
         SET placement_completed_at = $1,
             recommended_level = $2,
             placement_scores = $3::jsonb,
             updated_at = $1
         WHERE id = $4`,
        [submittedAt, result.recommendedLevel, JSON.stringify(result), user.id],
      );
      await client.query("COMMIT");
      return NextResponse.json({ attempt: publicAttempt(updatedRows[0]) });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

    return NextResponse.json({ error: "Unknown placement action." }, { status: 400 });
  });
}
