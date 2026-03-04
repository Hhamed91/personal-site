"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import ListFilters from "@/components/ListFilters";
import { applyFilters, getMonthKey, getSlugGroup } from "@/lib/filters";
import { sortByDateDesc } from "@/lib/sort";
import type { Project } from "@/lib/projects";

const PAGE_SIZE = 12;

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const [group, setGroup] = useState("all");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedProjects = useMemo(() => sortByDateDesc(projects, "createdAt"), [projects]);

  const availableGroups = useMemo(() => {
    const groups = new Set(sortedProjects.map((project) => getSlugGroup(project.id)));
    return Array.from(groups).sort();
  }, [sortedProjects]);

  const availableTypes = useMemo(() => {
    const types = new Set(sortedProjects.map((project) => project.type));
    return Array.from(types).sort();
  }, [sortedProjects]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sortedProjects.forEach((project) => {
      const monthKey = getMonthKey(project.createdAt ?? null);
      if (monthKey) months.add(monthKey);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [sortedProjects]);

  const filteredProjects = useMemo(
    () =>
      applyFilters(sortedProjects, {
        group,
        type,
        month,
        search,
      }),
    [sortedProjects, group, type, month, search]
  );

  const resetVisibleCount = () => {
    setVisibleCount(PAGE_SIZE);
  };

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredProjects.length;

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
          onGroupChange={(value) => {
            setGroup(value);
            resetVisibleCount();
          }}
          onTypeChange={(value) => {
            setType(value);
            resetVisibleCount();
          }}
          onMonthChange={(value) => {
            setMonth(value);
            resetVisibleCount();
          }}
          onSearchChange={(value) => {
            setSearch(value);
            resetVisibleCount();
          }}
          onClear={() => {
            setGroup("all");
            setType("all");
            setMonth("all");
            setSearch("");
            resetVisibleCount();
          }}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-gray-500">No projects match the current filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project) => {
              const formattedDate = formatDate(project.createdAt);

              return (
                <Link key={project.id} href={project.route}>
                  <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="uppercase tracking-wide">{project.type}</span>
                      {formattedDate && <span>{formattedDate}</span>}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mt-3 mb-2">
                      {project.name}
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">{project.description}</p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        {project.tags.map((tag) => (
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
