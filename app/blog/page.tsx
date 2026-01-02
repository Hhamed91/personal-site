import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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
        <div className="space-y-6">
          {posts.map((post) => {
            const formattedDate = formatDate(post.date);

            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <div className="border rounded-xl p-6 hover:shadow-lg transition">
                  <h2 className="text-2xl font-semibold mb-1">{post.title}</h2>
                  <p className="text-sm text-gray-500 mb-3 flex flex-wrap gap-2">
                    {formattedDate && <span>{formattedDate}</span>}
                    {post.readTime && (
                      <span>
                        {formattedDate ? "• " : ""}
                        {post.readTime} min read
                      </span>
                    )}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
