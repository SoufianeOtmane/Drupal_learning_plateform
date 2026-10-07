import { NextRequest, NextResponse } from "next/server";
import { checkSameOrigin, createSession, hashPassword, parseCredentials, readJsonBody, withSessionCookie } from "@/lib/auth";
import { withDatabaseErrors } from "@/lib/database-api";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withDatabaseErrors(async () => {
    if (!checkSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    const parsedBody = await readJsonBody(request);
    if ("error" in parsedBody) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 });
    }
    const credentials = parseCredentials(parsedBody.body);
    if ("error" in credentials) {
      return NextResponse.json({ error: credentials.error }, { status: 400 });
    }
    if (credentials.password.length < 12) {
      return NextResponse.json({ error: "Use a password with at least 12 characters." }, { status: 400 });
    }

    const passwordHash = await hashPassword(credentials.password);
    const client = await getDbPool().connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{ id: string; email: string }>(
        `INSERT INTO learner_accounts (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email`,
        [credentials.email, passwordHash],
      );
      const account = rows[0];
      await client.query(
        `INSERT INTO learner_profile (id)
         VALUES ($1)`,
        [account.id],
      );
      await client.query(
        `INSERT INTO lesson_progress (profile_id, lesson_id, status)
         VALUES ($1, 'day-1-web-request', 'not_started')`,
        [account.id],
      );
      const token = await createSession(client, account.id);
      await client.query("COMMIT");
      return withSessionCookie(NextResponse.json({ user: account }, { status: 201 }), token);
    } catch (error) {
      await client.query("ROLLBACK");
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      throw error;
    } finally {
      client.release();
    }
  });
}
