import { NextRequest, NextResponse } from "next/server";
import { withDatabaseErrors } from "@/lib/database-api";
import { getDbPool } from "@/lib/db";
import {
  getLearningDay,
  getPublicQuestions,
  PASS_THRESHOLD,
} from "@/lib/curriculum";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ day: string }> };
type AttemptRow = {
  id: string;
  status: "in_progress" | "completed";
  answers: Record<string, string>;
  score: number | null;
  passed: boolean | null;
  submitted_at: Date | null;
};

function publicAttempt(row: AttemptRow | undefined) {
  if (!row) return null;
  return {
    id: Number(row.id),
    status: row.status,
    answers: row.answers,
    score: row.score,
    passed: row.passed,
    submittedAt: row.submitted_at?.toISOString() ?? null,
  };
}

function readDay(value: string) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 4 ? day : null;
}

async function getAccess(day: number) {
  const pool = getDbPool();
  const { rows } = await pool.query<{
    current_day: number;
    placement_completed_at: Date | null;
  }>(
    `SELECT current_day, placement_completed_at
     FROM learner_profile
     WHERE id = 'owner'`,
  );
  const learner = rows[0];
  if (!learner?.placement_completed_at) {
    return { error: "Complete the placement assessment before opening the learning path.", status: 409 as const };
  }
  if (day > learner.current_day) {
    return {
      error: `Day ${day} is locked. Finish the previous day's lessons and score at least ${PASS_THRESHOLD}% on its checkpoint.`,
      status: 403 as const,
    };
  }
  return { pool, currentDay: learner.current_day };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return withDatabaseErrors(async () => {
    const dayNumber = readDay((await context.params).day);
    const day = dayNumber ? getLearningDay(dayNumber) : undefined;
    if (!day) return NextResponse.json({ error: "This learning day does not exist." }, { status: 404 });

    const access = await getAccess(day.day);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const lessonIds = day.lessons.map((lesson) => lesson.id);
    const [progressResult, attemptResult, dayResult] = await Promise.all([
      access.pool.query<{ lesson_id: string; status: string }>(
        `SELECT lesson_id, status
         FROM lesson_progress
         WHERE profile_id = 'owner' AND lesson_id = ANY($1::text[])`,
        [lessonIds],
      ),
      access.pool.query<AttemptRow>(
        `SELECT id, status, answers, score, passed, submitted_at
         FROM day_assessment_attempts
         WHERE profile_id = 'owner' AND day = $1
         ORDER BY started_at DESC, id DESC
         LIMIT 1`,
        [day.day],
      ),
      access.pool.query<{ best_score: number; passed_at: Date }>(
        `SELECT best_score, passed_at
         FROM learner_day_results
         WHERE profile_id = 'owner' AND day = $1`,
        [day.day],
      ),
    ]);

    const progress = new Map(
      progressResult.rows.map(({ lesson_id, status }) => [lesson_id, status]),
    );
    const complete = day.lessons.every(
      (lesson) => progress.get(lesson.id) === "completed",
    );
    const dayResultRow = dayResult.rows[0];

    return NextResponse.json({
      day: {
        day: day.day,
        title: day.title,
        topic: day.topic,
        lessons: day.lessons.map((lesson) => ({
          ...lesson,
          status: progress.get(lesson.id) ?? "not_started",
        })),
        questions: getPublicQuestions(day),
        passThreshold: PASS_THRESHOLD,
        allLessonsComplete: complete,
        bestScore: dayResultRow?.best_score ?? null,
        passedAt: dayResultRow?.passed_at.toISOString() ?? null,
        currentDay: access.currentDay,
        attempt: publicAttempt(attemptResult.rows[0]),
      },
    });
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withDatabaseErrors(async () => {
    const dayNumber = readDay((await context.params).day);
    const day = dayNumber ? getLearningDay(dayNumber) : undefined;
    if (!day) return NextResponse.json({ error: "This learning day does not exist." }, { status: 404 });

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
    const access = await getAccess(day.day);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    if (input.action === "start-lesson" || input.action === "finish-lesson") {
      const lessonIndex = day.lessons.findIndex((lesson) => lesson.id === input.lessonId);
      if (lessonIndex < 0) {
        return NextResponse.json({ error: "Choose a lesson in this day." }, { status: 400 });
      }
      const lesson = day.lessons[lessonIndex];
      if (input.action === "start-lesson" && lessonIndex > 0) {
        const previousLesson = day.lessons[lessonIndex - 1];
        const { rows } = await access.pool.query<{ status: string }>(
          `SELECT status FROM lesson_progress
           WHERE profile_id = 'owner' AND lesson_id = $1`,
          [previousLesson.id],
        );
        if (rows[0]?.status !== "completed") {
          return NextResponse.json(
            { error: `Finish "${previousLesson.title}" before starting this lesson.` },
            { status: 409 },
          );
        }
      }

      if (input.action === "start-lesson") {
        await access.pool.query(
          `INSERT INTO lesson_progress (profile_id, lesson_id, status)
           VALUES ('owner', $1, 'in_progress')
           ON CONFLICT (profile_id, lesson_id) DO UPDATE
           SET status = CASE
                 WHEN lesson_progress.status = 'completed' THEN 'completed'
                 ELSE 'in_progress'
               END,
               updated_at = NOW()`,
          [lesson.id],
        );
        return NextResponse.json({ started: true });
      }

      const { rowCount } = await access.pool.query(
        `UPDATE lesson_progress
         SET status = 'completed', finished_at = NOW(), updated_at = NOW()
         WHERE profile_id = 'owner' AND lesson_id = $1 AND status = 'in_progress'`,
        [lesson.id],
      );
      if (!rowCount) {
        return NextResponse.json({ error: "Start this lesson before completing it." }, { status: 409 });
      }
      return NextResponse.json({ completed: true });
    }

    if (input.action === "start-assessment") {
      const { rows } = await access.pool.query<{ lesson_id: string; status: string }>(
        `SELECT lesson_id, status
         FROM lesson_progress
         WHERE profile_id = 'owner' AND lesson_id = ANY($1::text[])`,
        [day.lessons.map((lesson) => lesson.id)],
      );
      const statusByLesson = new Map(rows.map(({ lesson_id, status }) => [lesson_id, status]));
      const missingLesson = day.lessons.find(
        (lesson) => statusByLesson.get(lesson.id) !== "completed",
      );
      if (missingLesson) {
        return NextResponse.json(
          { error: `Complete "${missingLesson.title}" before taking the day checkpoint.` },
          { status: 409 },
        );
      }
      const { rows: attemptRows } = await access.pool.query<AttemptRow>(
        `INSERT INTO day_assessment_attempts (profile_id, day)
         VALUES ('owner', $1)
         RETURNING id, status, answers, score, passed, submitted_at`,
        [day.day],
      );
      return NextResponse.json({ attempt: publicAttempt(attemptRows[0]) }, { status: 201 });
    }

    if (input.action === "answer") {
      const question = day.questions.find((item) => item.id === input.questionId);
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
      const { rows } = await access.pool.query<{ answers: Record<string, string> }>(
        `UPDATE day_assessment_attempts
         SET answers = answers || jsonb_build_object($3::text, $4::text),
             updated_at = NOW()
         WHERE id = $1 AND profile_id = 'owner' AND day = $2 AND status = 'in_progress'
         RETURNING answers`,
        [attemptId, day.day, question.id, input.choiceId],
      );
      if (!rows[0]) {
        return NextResponse.json({ error: "This day checkpoint attempt is no longer active." }, { status: 409 });
      }
      return NextResponse.json({ answers: rows[0].answers });
    }

    if (input.action === "submit-assessment") {
      const attemptId = Number(input.attemptId);
      if (!Number.isSafeInteger(attemptId) || attemptId < 1) {
        return NextResponse.json({ error: "A valid checkpoint attempt is required." }, { status: 400 });
      }

      const client = await access.pool.connect();
      try {
        await client.query("BEGIN");
        const { rows } = await client.query<AttemptRow>(
          `SELECT id, status, answers, score, passed, submitted_at
           FROM day_assessment_attempts
           WHERE id = $1 AND profile_id = 'owner' AND day = $2
           FOR UPDATE`,
          [attemptId, day.day],
        );
        const attempt = rows[0];
        if (!attempt || attempt.status !== "in_progress") {
          await client.query("ROLLBACK");
          return NextResponse.json({ error: "This day checkpoint attempt is no longer active." }, { status: 409 });
        }
        const complete =
          Object.keys(attempt.answers).length === day.questions.length &&
          day.questions.every((question) => typeof attempt.answers[question.id] === "string");
        if (!complete) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: `Answer all ${day.questions.length} checkpoint questions before submitting.` },
            { status: 400 },
          );
        }

        const correct = day.questions.filter(
          (question) => attempt.answers[question.id] === question.correctOptionId,
        ).length;
        const score = Math.round((correct / day.questions.length) * 100);
        const passed = score >= PASS_THRESHOLD;
        const submittedAt = new Date();
        const { rows: updatedRows } = await client.query<AttemptRow>(
          `UPDATE day_assessment_attempts
           SET status = 'completed', score = $2, passed = $3, submitted_at = $4, updated_at = $4
           WHERE id = $1
           RETURNING id, status, answers, score, passed, submitted_at`,
          [attemptId, score, passed, submittedAt],
        );

        if (passed) {
          await client.query(
            `INSERT INTO learner_day_results (profile_id, day, best_score, passed_at)
             VALUES ('owner', $1, $2, $3)
             ON CONFLICT (profile_id, day) DO UPDATE
             SET best_score = GREATEST(learner_day_results.best_score, EXCLUDED.best_score),
                 passed_at = LEAST(learner_day_results.passed_at, EXCLUDED.passed_at)`,
            [day.day, score, submittedAt],
          );
          await client.query(
            `UPDATE learner_profile
             SET current_day = GREATEST(current_day, LEAST($1, 4)), updated_at = $2
             WHERE id = 'owner'`,
            [day.day + 1, submittedAt],
          );
        }

        await client.query("COMMIT");
        return NextResponse.json({
          attempt: publicAttempt(updatedRows[0]),
          passThreshold: PASS_THRESHOLD,
          nextDayUnlocked: passed && day.day < 4,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return NextResponse.json({ error: "Choose a valid curriculum action." }, { status: 400 });
  });
}
