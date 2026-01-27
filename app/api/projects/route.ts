import { NextResponse } from "next/server";

import { applyCors, err, okList } from "@/lib/apiResponse";
import { projects } from "@/lib/projects";

export const revalidate = 60;

// List project summaries.
export async function GET() {
  try {
    return applyCors(okList(projects));
  } catch (error) {
    console.error("GET /api/projects failed", error);
    return applyCors(
      err("INTERNAL_ERROR", "Unable to load projects.", 500)
    );
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }));
}
