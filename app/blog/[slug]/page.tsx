import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((entry) => entry.slug === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const olderPost =
    currentIndex >= 0 && currentIndex < posts.length - 1
      ? posts[currentIndex + 1]
      : null;
  const formattedDate = formatDate(post.date);

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      {/* ✅ Back Navigation */}
      <nav className="mb-6 text-sm text-gray-500 flex gap-4">
        <Link href="/" className="hover:underline">
          ← Home
        </Link>
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </nav>

      <h1 className="text-4xl font-bold mb-3">{post.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        {formattedDate && <span>{formattedDate}</span>}
        {post.readTime && <span>• {post.readTime} min read</span>}
      </div>

      {post.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-xs text-gray-500">
          {post.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <article
        className="prose prose-lg prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <nav className="mt-12 border-t pt-6">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
          Keep reading
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {olderPost ? (
            <Link
              href={`/blog/${olderPost.slug}`}
              className="flex-1 rounded-xl border p-4 hover:shadow"
            >
              <p className="text-xs font-semibold text-gray-400">Older post</p>
              <p className="text-lg font-semibold">{olderPost.title}</p>
            </Link>
          ) : (
            <div className="flex-1 rounded-xl border p-4 text-sm text-gray-400">
              This is the oldest post.
            </div>
          )}
          {newerPost ? (
            <Link
              href={`/blog/${newerPost.slug}`}
              className="flex-1 rounded-xl border p-4 text-right hover:shadow"
            >
              <p className="text-xs font-semibold text-gray-400">Newer post</p>
              <p className="text-lg font-semibold">{newerPost.title}</p>
            </Link>
          ) : (
            <div className="flex-1 rounded-xl border p-4 text-right text-sm text-gray-400">
              This is the most recent post.
            </div>
          )}
        </div>
      </nav>
    </main>
  );
}
