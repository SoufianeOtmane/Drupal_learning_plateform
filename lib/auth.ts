import "server-only";

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { getDbPool } from "@/lib/db";

export const SESSION_COOKIE = "drupal_learner_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthenticatedUser = {
  id: string;
  email: string;
};

type Queryable = Pick<PoolClient, "query">;

function derivePassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 32_768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await derivePassword(password, salt);
  return `scrypt$32768$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, cost, saltHex, expectedHex] = encodedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    cost !== "32768" ||
    !/^[a-f0-9]{32}$/i.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/i.test(expectedHex ?? "")
  ) {
    throw new Error("The stored password hash is invalid.");
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await derivePassword(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actual, expected);
}

export async function verifyUnknownPassword(password: string) {
  await derivePassword(password, Buffer.alloc(16, 0x5a));
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSessionToken(token) };
}

export async function createSession(
  client: Queryable,
  accountId: string,
) {
  const session = createSessionToken();
  await client.query(
    `INSERT INTO learner_sessions (token_hash, account_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
    [session.tokenHash, accountId],
  );
  return session.token;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  const { rows } = await getDbPool().query<AuthenticatedUser>(
    `SELECT account.id, account.email
     FROM learner_sessions AS session
     JOIN learner_accounts AS account ON account.id = session.account_id
     WHERE session.token_hash = $1 AND session.expires_at > NOW()`,
    [hashSessionToken(token)],
  );
  return rows[0] ?? null;
}

export function withSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function checkSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    (origin && origin !== request.nextUrl.origin) ||
    fetchSite === "cross-site"
  ) {
    return false;
  }
  return true;
}

export function parseCredentials(body: unknown) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Request body must be an object." } as const;
  }
  const input = body as Record<string, unknown>;
  if (typeof input.email !== "string" || typeof input.password !== "string") {
    return { error: "Enter an email address and password." } as const;
  }

  const email = input.email.trim().toLowerCase();
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { error: "Enter a valid email address." } as const;
  }
  if (input.password.length > 128) {
    return { error: "Passwords must be 128 characters or fewer." } as const;
  }
  return { email, password: input.password } as const;
}

export async function readJsonBody(request: NextRequest) {
  try {
    return { body: await request.json() as unknown } as const;
  } catch {
    return { error: "Request body must be valid JSON." } as const;
  }
}
