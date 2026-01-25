import { NextRequest, NextResponse } from "next/server";

import { applyCors, err, okItem } from "@/lib/apiResponse";
import { getPostBySlug } from "@/lib/mdx";

export const revalidate = 300;

type RouteParams = {
  params: Promise<{ slug: string }>;
};

const isSafeParam = (value: string | undefined) => {
  if (!value || !value.trim()) return false;
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    return false;
  }
  return true;
};

// Fetch a single blog post by slug.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!isSafeParam(slug)) {
    return applyCors(
      err("BAD_REQUEST", "Blog slug must be a non-empty string.", 400)
    );
  }

  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return applyCors(
        err("NOT_FOUND", "Blog post not found.", 404)
      );
    }
    return applyCors(okItem(post));
  } catch (error) {
    console.error("GET /api/blogs/[slug] failed", error);
    return applyCors(
      err("INTERNAL_ERROR", "Unable to load blog post.", 500)
    );
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }));
}
