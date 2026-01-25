"use client";

import { Button } from "@/components/ui/button";

type ListFiltersProps = {
  availableGroups: string[];
  availableTypes: string[];
  availableMonths: string[];
  groupValue: string;
  typeValue: string;
  monthValue: string;
  searchValue: string;
  onGroupChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
};

export default function ListFilters({
  availableGroups,
  availableTypes,
  availableMonths,
  groupValue,
  typeValue,
  monthValue,
  searchValue,
  onGroupChange,
  onTypeChange,
  onMonthChange,
  onSearchChange,
  onClear,
}: ListFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs uppercase tracking-wide text-slate-400">Search</label>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title or slug"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="text-xs uppercase tracking-wide text-slate-400">Group</label>
          <select
            value={groupValue}
            onChange={(event) => onGroupChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All</option>
            {availableGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-xs uppercase tracking-wide text-slate-400">Type</label>
          <select
            value={typeValue}
            onChange={(event) => onTypeChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-xs uppercase tracking-wide text-slate-400">Month</label>
          <select
            value={monthValue}
            onChange={(event) => onMonthChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <Button variant="outline" className="rounded-full" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  );
}
