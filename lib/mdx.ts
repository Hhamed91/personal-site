import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type BlogMeta = {
  slug: string;
  title: string;
  date: string | null;
  tags: string[];
  readTime: number | null;
};

export type BlogPost = BlogMeta & {
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
export function getAllPosts(): BlogMeta[] {
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
      } satisfies BlogMeta;
    });

  return posts.sort((a, b) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return bDate - aDate;
  });
}

/* ---------- SINGLE POST ---------- */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
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
  } satisfies BlogPost;
}
