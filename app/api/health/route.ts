import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  await getDbPool().query("SELECT 1");
  return NextResponse.json({ status: "ok" });
}
