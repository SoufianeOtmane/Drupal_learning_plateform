import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { withDatabaseErrors } from "@/lib/database-api";

export const runtime = "nodejs";

export async function GET() {
  return withDatabaseErrors(async () => {
    await getDbPool().query("SELECT 1");
    return NextResponse.json({ status: "ok" });
  });
}
