import { NextResponse } from "next/server";

import { applyCors, err, okList } from "@/lib/apiResponse";
import { getAllPosts } from "@/lib/mdx";

export const revalidate = 60;

// List blog metadata.
export async function GET() {
  try {
    const posts = getAllPosts();
    return applyCors(okList(posts));
  } catch (error) {
    console.error("GET /api/blogs failed", error);
    return applyCors(
      err("INTERNAL_ERROR", "Unable to load blog posts.", 500)
    );
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }));
}
