import { NextRequest, NextResponse } from "next/server";

import { applyCors, err, okItem } from "@/lib/apiResponse";
import { projects } from "@/lib/projects";

export const revalidate = 300;

type RouteParams = {
  params: Promise<{ id: string }>;
};

const isSafeParam = (value: string | undefined) => {
  if (!value || !value.trim()) return false;
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    return false;
  }
  return true;
};

// Fetch a single project by id.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!isSafeParam(id)) {
    return applyCors(
      err("BAD_REQUEST", "Project id must be a non-empty string.", 400)
    );
  }

  const project = projects.find((entry) => entry.id === id);
  if (!project) {
    return applyCors(
      err("NOT_FOUND", "Project not found.", 404)
    );
  }

  return applyCors(okItem(project));
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }));
}
