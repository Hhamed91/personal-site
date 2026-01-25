"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ListFilters from "@/components/ListFilters";
import { applyFilters, getMonthKey, getSlugGroup } from "@/lib/filters";
import { sortByDateDesc } from "@/lib/sort";
import type { BlogMeta } from "@/lib/mdx";

const PAGE_SIZE = 9;

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

export default function BlogList({ posts }: { posts: BlogMeta[] }) {
  const [group, setGroup] = useState("all");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedPosts = useMemo(() => sortByDateDesc(posts, "date"), [posts]);

  const availableGroups = useMemo(() => {
    const groups = new Set(sortedPosts.map((post) => getSlugGroup(post.slug)));
    return Array.from(groups).sort();
  }, [sortedPosts]);

  const availableTypes = useMemo(() => {
    const tags = new Set<string>();
    sortedPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [sortedPosts]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sortedPosts.forEach((post) => {
      const monthKey = getMonthKey(post.date);
      if (monthKey) months.add(monthKey);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [sortedPosts]);

  const filteredPosts = useMemo(
    () =>
      applyFilters(sortedPosts, {
        group,
        type,
        month,
        search,
      }),
    [sortedPosts, group, type, month, search]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [group, type, month, search]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredPosts.length;

  return (
    <div className="space-y-8">
      <div className="sticky top-4 z-10">
        <ListFilters
          availableGroups={availableGroups}
          availableTypes={availableTypes}
          availableMonths={availableMonths}
          groupValue={group}
          typeValue={type}
          monthValue={month}
          searchValue={search}
          onGroupChange={setGroup}
          onTypeChange={setType}
          onMonthChange={setMonth}
          onSearchChange={setSearch}
          onClear={() => {
            setGroup("all");
            setType("all");
            setMonth("all");
            setSearch("");
          }}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-gray-500">No posts match the current filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePosts.map((post) => {
              const formattedDate = formatDate(post.date);

              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      {post.title}
                    </h2>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2 mb-3">
                      {formattedDate && <span>{formattedDate}</span>}
                      {post.readTime && (
                        <span>{formattedDate ? "• " : ""}{post.readTime} min read</span>
                      )}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}
          </div>

          {canLoadMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
