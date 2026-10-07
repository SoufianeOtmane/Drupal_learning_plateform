import { NextResponse } from "next/server";

export async function withDatabaseErrors(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
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
