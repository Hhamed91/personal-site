export function sortByDateDesc<T extends Record<string, unknown>>(
  items: T[],
  dateKey: keyof T
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[dateKey];
    const bValue = b[dateKey];

    const aTime = typeof aValue === "string" ? Date.parse(aValue) : NaN;
    const bTime = typeof bValue === "string" ? Date.parse(bValue) : NaN;

    const aScore = Number.isFinite(aTime) ? aTime : 0;
    const bScore = Number.isFinite(bTime) ? bTime : 0;

    return bScore - aScore;
  });
}
