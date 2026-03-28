import type { Department, Priority, RequestType, WarningItem } from "@/lib/intake/types";
import { slugify, titleCase } from "@/lib/intake/utils";

const departmentMap: Record<string, Department> = {
  marketing: "Marketing",
  mktg: "Marketing",
  "cust-success": "Customer Success",
  "customer-success": "Customer Success",
  cs: "Customer Success",
  sales: "Sales",
  sls: "Sales",
  product: "Product",
  "prod-update": "Product",
  engineering: "Engineering",
  eng: "Engineering",
  docs: "Engineering",
  localization: "Localization",
  translation: "Localization",
  compliance: "Compliance",
  legal: "Compliance",
  design: "Design",
  operations: "Operations",
  ops: "Operations",
};

const requestTypeMap: Record<string, RequestType> = {
  "new-content": "Blog Post",
  "blog-post": "Blog Post",
  blog: "Blog Post",
  "case-study": "Case Study",
  translation: "Translation",
  "product-update": "Product Update",
  "update-existing": "Product Update",
  update: "Product Update",
  "design-asset": "Design Asset",
  "dashboard-mockup": "Dashboard Mockup",
  documentation: "Documentation",
  "api-docs": "Documentation",
  "compliance-checklist": "Compliance Review",
  "compliance-review": "Compliance Review",
  "webinar-invite-copy": "Webinar Copy",
  "webinar-copy": "Webinar Copy",
  "event-support": "Webinar Copy",
  "data-report": "Dashboard Mockup",
  announcement: "Announcement",
};

const priorityMap: Record<string, Priority> = {
  low: "Low",
  medium: "Medium",
  med: "Medium",
  high: "High",
  urgent: "High",
  critical: "Critical",
  blocker: "Critical",
  highest: "Critical",
};

function parseDateByParts(value: string) {
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const [, month, day, year] = slash;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00Z`);
  }

  const dash = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) {
    const [, first, second, year] = dash;
    return new Date(`${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}T12:00:00Z`);
  }

  return null;
}

export function normalizeDepartment(raw?: string) {
  if (!raw) return { value: "Needs Review" as Department, warnings: ["Missing department"] };

  const normalized = departmentMap[slugify(raw)];
  if (normalized) return { value: normalized, warnings: [] };

  return {
    value: "Needs Review" as Department,
    warnings: [`Unrecognized department "${raw}"`],
  };
}

export function normalizeRequestType(raw?: string) {
  if (!raw) return { value: "Needs Review" as RequestType, warnings: ["Missing request type"] };

  const normalized = requestTypeMap[slugify(raw)];
  if (normalized) return { value: normalized, warnings: [] };

  return {
    value: "Needs Review" as RequestType,
    warnings: [`Unrecognized request type "${raw}"`],
  };
}

export function normalizePriority(raw?: string) {
  if (!raw || !raw.trim()) {
    return {
      value: "Medium" as Priority,
      warnings: ["Missing priority, defaulted to Medium"],
      wasDefaulted: true,
    };
  }

  const normalized = priorityMap[slugify(raw)];
  if (normalized) {
    return { value: normalized, warnings: [], wasDefaulted: false };
  }

  return {
    value: "Needs Review" as Priority,
    warnings: [`Unrecognized priority "${raw}"`],
    wasDefaulted: false,
  };
}

export function normalizeEmail(rawEmail: string | undefined, fallbackName: string) {
  if (!rawEmail || !rawEmail.trim()) {
    return {
      value: `${slugify(fallbackName || "unknown") || "unknown"}@missing.local`,
      warnings: ["Missing email, generated placeholder"],
    };
  }

  const cleaned = rawEmail.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleaned)) {
    return {
      value: `${slugify(fallbackName || "unknown") || "unknown"}@invalid.local`,
      warnings: [`Invalid email "${rawEmail}", generated placeholder`],
    };
  }

  return { value: cleaned, warnings: [] };
}

export function normalizeName(rawName?: string) {
  if (!rawName || !rawName.trim()) {
    return { value: "Unknown Requestor", warnings: ["Missing submitter name"] };
  }

  return { value: titleCase(rawName.trim()), warnings: [] };
}

export function parseFlexibleDate(raw?: string, fieldLabel = "date") {
  if (!raw || !raw.trim()) {
    return { value: null, warnings: [`Missing ${fieldLabel}`] };
  }

  const native = new Date(raw);
  if (!Number.isNaN(native.getTime())) {
    return { value: native.toISOString(), warnings: [] };
  }

  const parsed = parseDateByParts(raw.trim());
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return { value: parsed.toISOString(), warnings: [] };
  }

  return { value: null, warnings: [`Invalid ${fieldLabel} "${raw}"`] };
}

export function compactWarnings(items: WarningItem[]) {
  return items.map((item) => `${item.field}: ${item.message}`);
}
