import { NextResponse } from "next/server";

import { applyCors, okItem } from "@/lib/apiResponse";

// Health check endpoint for uptime monitoring.
export async function GET() {
  return applyCors(okItem({ status: "ok" }));
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }));
}
