import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkSameOrigin, clearSessionCookie, hashSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { withDatabaseErrors } from "@/lib/database-api";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withDatabaseErrors(async () => {
    if (!checkSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      await getDbPool().query(
        `DELETE FROM learner_sessions WHERE token_hash = $1`,
        [hashSessionToken(token)],
      );
    }
    return clearSessionCookie(NextResponse.json({ signedOut: true }));
  });
}
