export type FilterState = {
  group: string;
  type: string;
  month: string;
  search: string;
};

export function getSlugGroup(slug: string | undefined | null): string {
  if (!slug) return "other";
  const [group] = slug.split("-");
  return group || "other";
}

export function getMonthKey(dateString: string | undefined | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

type FilterableItem = {
  slug?: string;
  id?: string;
  title?: string;
  name?: string;
  date?: string | null;
  createdAt?: string | null;
  tags?: string[];
  type?: string;
};

export function applyFilters<T extends FilterableItem>(
  items: T[],
  filters: Partial<FilterState>
): T[] {
  const groupFilter = filters.group && filters.group !== "all" ? filters.group : null;
  const typeFilter = filters.type && filters.type !== "all" ? filters.type : null;
  const monthFilter = filters.month && filters.month !== "all" ? filters.month : null;
  const searchFilter = filters.search?.trim().toLowerCase() || "";

  return items.filter((item) => {
    const slugValue = item.slug ?? item.id ?? "";
    const titleValue = item.title ?? item.name ?? "";

    if (groupFilter && getSlugGroup(slugValue) !== groupFilter) {
      return false;
    }

    if (typeFilter) {
      if (Array.isArray(item.tags)) {
        if (!item.tags.includes(typeFilter)) return false;
      } else if (item.type) {
        if (item.type !== typeFilter) return false;
      } else {
        return false;
      }
    }

    if (monthFilter) {
      const monthKey = getMonthKey(item.date ?? item.createdAt ?? null);
      if (monthKey !== monthFilter) return false;
    }

    if (searchFilter) {
      const haystack = `${titleValue} ${slugValue}`.toLowerCase();
      if (!haystack.includes(searchFilter)) return false;
    }

    return true;
  });
}
