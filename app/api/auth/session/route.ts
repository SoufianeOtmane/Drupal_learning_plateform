import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { withDatabaseErrors } from "@/lib/database-api";

export const runtime = "nodejs";

export async function GET() {
  return withDatabaseErrors(async () => {
    const user = await getAuthenticatedUser();
    return NextResponse.json(
      { user },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  });
}
