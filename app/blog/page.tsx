import Link from "next/link";

import BlogList from "@/components/blog/BlogList";
import { getAllPosts } from "@/lib/mdx";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <nav className="mb-8 flex items-center gap-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          ← Home
        </Link>
        <span aria-hidden="true">•</span>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-sm uppercase tracking-wide text-gray-400 mb-2">
          Mini Blog
        </p>
        <h1 className="text-4xl font-bold mb-3">Latest posts</h1>
        <p className="text-gray-600">
          Thoughts, notes, and experiments straight from the markdown files in{" "}
          <code className="mx-1 rounded bg-gray-100 px-2 py-0.5 text-sm">
            content/blog
          </code>
          {"."}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Check back soon!</p>
      ) : (
        <BlogList posts={posts} />
      )}
    </main>
  );
}
