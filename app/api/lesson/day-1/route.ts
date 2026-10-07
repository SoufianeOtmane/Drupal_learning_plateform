import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
  const { rows: profileRows } = await pool.query<{ placement_completed_at: Date | null }>(
    "SELECT placement_completed_at FROM learner_profile WHERE id = 'owner'",
  );
  if (!profileRows[0]?.placement_completed_at) {
    return NextResponse.json(
      { error: "Complete the placement assessment before starting the Day 1 lesson." },
      { status: 409 },
    );
  }

  if (input.action === "start") {
    await pool.query(
      `UPDATE lesson_progress
       SET status = CASE WHEN status = 'completed' THEN status ELSE 'in_progress' END,
           updated_at = NOW()
       WHERE profile_id = 'owner' AND lesson_id = 'day-1-web-request'`,
    );
    return NextResponse.json({ started: true });
  }

  if (
    input.action === "practice" &&
    (input.answer === "wrong-order" ||
      input.answer === "right-order" ||
      input.answer === "static-only")
  ) {
    const correct = input.answer === "right-order";
    const { rowCount } = await pool.query(
      `UPDATE lesson_progress
       SET practice_answer = $1,
           practice_correct = $2,
           updated_at = NOW()
       WHERE profile_id = 'owner' AND lesson_id = 'day-1-web-request'
         AND status = 'in_progress'`,
      [input.answer, correct],
    );
    if (!rowCount) {
      return NextResponse.json({ error: "Start the Day 1 lesson before saving practice." }, { status: 409 });
    }
    return NextResponse.json({ answer: input.answer, correct });
  }

  if (input.action === "finish") {
    const { rowCount } = await pool.query(
      `UPDATE lesson_progress
       SET status = 'completed', finished_at = NOW(), updated_at = NOW()
       WHERE profile_id = 'owner' AND lesson_id = 'day-1-web-request'
         AND status = 'in_progress'`,
    );
    if (!rowCount) {
      return NextResponse.json({ error: "Start the Day 1 lesson before finishing it." }, { status: 409 });
    }
    return NextResponse.json({ completed: true });
  }

  return NextResponse.json({ error: "Choose a valid lesson action." }, { status: 400 });
}
