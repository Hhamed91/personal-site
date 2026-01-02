import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type PostSummary = {
  slug: string;
  title: string;
  date: string | null;
  tags: string[];
  readTime: number | null;
};

export type Post = PostSummary & {
  contentHtml: string;
};

const postsDir = path.join(process.cwd(), "content/blog");

const toNumber = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : null;
};

/* ---------- BLOG INDEX ---------- */
export function getAllPosts(): PostSummary[] {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const files = fs.readdirSync(postsDir);

  const posts = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");

      const { data } = matter(fileContent);

      return {
        slug,
        title: data.title ?? "Building Your Agentic Applications the Well-Architected Way",
        date: data.date ?? null,
        tags: data.tags ?? [],
        readTime: toNumber(data.readTime),
      } satisfies PostSummary;
    });

  return posts.sort((a, b) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return bDate - aDate;
  });
}

/* ---------- SINGLE POST ---------- */
export async function getPostBySlug(slug: string): Promise<Post> {
  const filePath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  const processedContent = await remark().use(html).process(content);

  return {
    slug,
    title: data.title ?? "Building Your Agentic Applications the Well-Architected Way",
    date: data.date ?? null,
    tags: data.tags ?? [],
    readTime: toNumber(data.readTime),
    contentHtml: processedContent.toString(),
  } satisfies Post;
}
