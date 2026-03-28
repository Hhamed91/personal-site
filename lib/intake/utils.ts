import type { DemoState, FieldSource, RequestRecord, RequestStatus } from "@/lib/intake/types";

export const DEFAULT_ASSIGNEES = [
  { name: "Jordan Lee", email: "jordan@northstar.example" },
  { name: "Priya Raman", email: "priya@northstar.example" },
  { name: "Nina Alvarez", email: "nina@northstar.example" },
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeId(prefix: string, current: number) {
  return `${prefix}-${String(current + 1).padStart(3, "0")}`;
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isoDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString();
}

export function formatDateLabel(value: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getStatusTone(status: RequestStatus) {
  switch (status) {
    case "Completed":
      return "emerald";
    case "Blocked":
      return "rose";
    case "Needs Review":
      return "amber";
    case "In Progress":
    case "In Review":
      return "sky";
    case "Rejected":
      return "slate";
    default:
      return "violet";
  }
}

export function getSourceTone(source: string) {
  switch (source) {
    case "webhook":
      return "sky";
    case "csv":
      return "amber";
    case "form":
      return "emerald";
    case "slack":
      return "violet";
    default:
      return "slate";
  }
}

export function getPriorityTone(priority: RequestRecord["finalPriority"]) {
  switch (priority) {
    case "Critical":
      return "rose";
    case "High":
      return "orange";
    case "Medium":
      return "sky";
    case "Low":
      return "slate";
    default:
      return "amber";
  }
}

export function getFieldSourceLabel(value: FieldSource) {
  switch (value) {
    case "human_override":
      return "Human override";
    case "defaulted":
      return "Defaulted";
    case "ai":
      return "AI";
    default:
      return "Mapped";
  }
}

export function summarizeState(state: DemoState) {
  const duplicates = state.sourceRecords.filter((record) => record.validationStatus === "duplicate").length;
  const lowConfidence = state.requests.filter((request) => request.aiConfidence < 0.68).length;
  const urgent = state.requests.filter(
    (request) => request.finalPriority === "Critical" || request.finalPriority === "High"
  ).length;
  const needsReview = state.requests.filter((request) => request.status === "Needs Review").length;

  return {
    totalRequests: state.requests.length,
    duplicates,
    lowConfidence,
    urgent,
    needsReview,
  };
}

export function getRequestOwner(request: RequestRecord) {
  return request.assignedToName ?? "Unassigned";
}
