import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkSameOrigin, createSession, parseCredentials, readJsonBody, verifyPassword, verifyUnknownPassword, withSessionCookie } from "@/lib/auth";
import { withDatabaseErrors } from "@/lib/database-api";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

type AccountRow = {
  id: string;
  email: string;
  password_hash: string;
};

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

    const pool = getDbPool();
    const emailHash = createHash("sha256").update(credentials.email).digest("hex");
    await pool.query(
      `DELETE FROM learner_login_attempts
       WHERE attempted_at < NOW() - INTERVAL '1 day'`,
    );
    const { rows: recentAttempts } = await pool.query<{ attempts: string }>(
      `SELECT COUNT(*)::text AS attempts
       FROM learner_login_attempts
       WHERE email_hash = $1 AND attempted_at > NOW() - INTERVAL '15 minutes'`,
      [emailHash],
    );
    if (Number(recentAttempts[0]?.attempts ?? 0) >= 8) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Wait 15 minutes before trying again." },
        { status: 429 },
      );
    }

    const { rows } = await pool.query<AccountRow>(
      `SELECT id, email, password_hash
       FROM learner_accounts
       WHERE email = $1`,
      [credentials.email],
    );
    const account = rows[0];
    let validPassword = false;
    if (account) {
      validPassword = await verifyPassword(credentials.password, account.password_hash);
    } else {
      await verifyUnknownPassword(credentials.password);
    }
    if (!account || !validPassword) {
      await pool.query(
        `INSERT INTO learner_login_attempts (email_hash) VALUES ($1)`,
        [emailHash],
      );
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const token = await createSession(pool, account.id);
    await pool.query(
      `DELETE FROM learner_login_attempts WHERE email_hash = $1`,
      [emailHash],
    );
    return withSessionCookie(NextResponse.json({ user: { id: account.id, email: account.email } }), token);
  });
}
