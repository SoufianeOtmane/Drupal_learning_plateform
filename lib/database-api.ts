import { NextResponse } from "next/server";
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth";

export async function withDatabaseErrors(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("Database-backed API request failed.", error);
    const message =
      error instanceof Error &&
      error.message === "DATABASE_URL is required to access learner records outside local development."
        ? "DATABASE_URL is not configured. Set it or start the local PostgreSQL service with Docker Compose."
        : "The learner database could not be reached. Verify PostgreSQL is running and DATABASE_URL is correct.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function withAuthenticatedUser(
  handler: (user: AuthenticatedUser) => Promise<Response>,
): Promise<Response> {
  return withDatabaseErrors(async () => {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to access your learning progress." }, { status: 401 });
    }
    return handler(user);
  });
}
