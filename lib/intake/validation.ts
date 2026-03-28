import type { MappedRequestInput, WarningItem } from "@/lib/intake/types";

export function validateMappedRecord(input: MappedRequestInput) {
  const errors: string[] = [];
  const warnings: WarningItem[] = [];

  if (!input.title?.trim()) {
    errors.push("Missing title");
  }

  if (!input.description?.trim() && !input.notes?.trim()) {
    errors.push("Missing description and notes");
  }

  if (!input.submittedByName?.trim()) {
    warnings.push({ field: "submittedByName", message: "Submitter name not provided" });
  }

  if (!input.departmentRaw?.trim()) {
    warnings.push({ field: "department", message: "Department not provided" });
  }

  if (!input.requestTypeRaw?.trim()) {
    warnings.push({ field: "requestType", message: "Request type not provided" });
  }

  if (!input.dateSubmittedRaw?.trim()) {
    warnings.push({ field: "dateSubmitted", message: "Submission date missing" });
  }

  return { errors, warnings };
}
