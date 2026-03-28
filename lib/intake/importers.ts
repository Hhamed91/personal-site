import {
  normalizeDepartment,
  normalizeEmail,
  normalizeName,
  normalizePriority,
  normalizeRequestType,
  parseFlexibleDate,
} from "@/lib/intake/normalization";
import { validateMappedRecord } from "@/lib/intake/validation";
import { findDuplicateRequest } from "@/lib/intake/dedupe";
import { runMockTriage } from "@/lib/intake/ai";
import type {
  DemoState,
  IngestionRun,
  MappedRequestInput,
  ProcessedRecord,
  RequestEvent,
  RequestRecord,
  RowResult,
  SourceRecord,
  SourceType,
} from "@/lib/intake/types";
import { DEFAULT_ASSIGNEES, isoDate, makeId } from "@/lib/intake/utils";

function asOptionalString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function parseRequester(value?: string) {
  if (!value) return { name: undefined, email: undefined };
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  return { name: value, email: undefined };
}

export function mapWebhookPayload(raw: Record<string, unknown>): MappedRequestInput {
  const requester = parseRequester(asOptionalString(raw.requester));

  return {
    source: "webhook",
    sourceRecordId: asOptionalString(raw.ticket_id ?? raw.id ?? raw.card_id) ?? "webhook-record",
    title: asOptionalString(raw.task_name ?? raw.subject ?? raw.cardTitle) ?? "",
    description: asOptionalString(raw.details ?? raw.description ?? raw.brief) ?? "",
    submittedByName: asOptionalString(raw.submitter_name ?? raw.owner_name) ?? requester.name,
    submittedByEmail: asOptionalString(raw.submitter_email ?? raw.owner_email) ?? requester.email,
    departmentRaw: asOptionalString(raw.team ?? raw.dept ?? raw.org_unit),
    requestTypeRaw: asOptionalString(raw.ask_type ?? raw.type ?? raw.request_kind),
    priorityRaw: asOptionalString(raw.importance ?? raw.priority ?? raw.urgency),
    dateSubmittedRaw: asOptionalString(raw.created ?? raw.submitted_at ?? raw.created_at),
    dueDateRaw: asOptionalString(raw.due ?? raw.needed_by ?? raw.deadline),
    notes: asOptionalString(raw.notes ?? raw.context ?? raw.comments),
    rawPayload: raw,
  };
}

function mapCsvRow(row: Record<string, string>): MappedRequestInput {
  const title = row.partner_request_id
    ? row.request_title
    : row["Request Name"];
  const sourceRecordId = row.partner_request_id || `csv-${row["Submitted By"] ?? "row"}-${title ?? "request"}`;

  return {
    source: "csv",
    sourceRecordId,
    title,
    description: row.details || row.Description,
    submittedByName: row.submitted_by || row["Submitted By"],
    submittedByEmail: row.email_address || row.Email,
    departmentRaw: row.group_name || row.Department,
    requestTypeRaw: row.category || row.Type,
    priorityRaw: row.priority || row.Priority,
    dateSubmittedRaw: row.submitted_on || row["Date Submitted"],
    dueDateRaw: row.target_date || row["Due Date"],
    notes: row.notes || row.Notes,
    rawPayload: row,
  };
}

export function mapFormSubmission(raw: MappedRequestInput): MappedRequestInput {
  return raw;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

export function parseCsvText(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = values[index] ?? "";
      return accumulator;
    }, {});
  });
}

function createRunSummary(
  currentState: DemoState,
  source: SourceType,
  label: string,
  rowResults: RowResult[]
): IngestionRun {
  const rowsImported = rowResults.filter((row) => row.status === "valid").length;
  const rowsWithWarnings = rowResults.filter((row) => row.status === "warning").length;
  const rowsFailed = rowResults.filter((row) => row.status === "failed").length;
  const duplicatesDetected = rowResults.filter((row) => row.status === "duplicate").length;
  const startedAt = isoDate(new Date());

  return {
    id: makeId("run", currentState.counters.run),
    source,
    label,
    startedAt,
    completedAt: startedAt,
    rowsReceived: rowResults.length,
    rowsImported,
    rowsWithWarnings,
    rowsFailed,
    duplicatesDetected,
  };
}

function chooseFinalValue<T extends RequestRecord["finalDepartment"] | RequestRecord["finalRequestType"] | RequestRecord["finalPriority"]>(
  normalized: T,
  aiValue: T,
  confidence: number,
  wasDefaulted = false
) {
  if (normalized === "Needs Review" && confidence >= 0.68) {
    return { value: aiValue, source: "ai" as const };
  }

  if (wasDefaulted && confidence >= 0.72) {
    return { value: aiValue, source: "ai" as const };
  }

  if (wasDefaulted) {
    return { value: normalized, source: "defaulted" as const };
  }

  return { value: normalized, source: "source" as const };
}

export function processMappedRecord(input: MappedRequestInput, state: DemoState, rowNumber: number): ProcessedRecord {
  const validation = validateMappedRecord(input);
  const name = normalizeName(input.submittedByName);
  const email = normalizeEmail(input.submittedByEmail, name.value);
  const department = normalizeDepartment(input.departmentRaw);
  const requestType = normalizeRequestType(input.requestTypeRaw);
  const priority = normalizePriority(input.priorityRaw);
  const submittedDate = parseFlexibleDate(input.dateSubmittedRaw, "submitted date");
  const dueDate = parseFlexibleDate(input.dueDateRaw, "due date");

  const warnings = [
    ...validation.warnings.map((warning) => `${warning.field}: ${warning.message}`),
    ...name.warnings,
    ...email.warnings,
    ...department.warnings,
    ...requestType.warnings,
    ...priority.warnings,
    ...submittedDate.warnings,
    ...dueDate.warnings,
  ];

  const mappedPayload = {
    title: input.title ?? null,
    description: input.description ?? null,
    submittedByName: name.value,
    submittedByEmail: email.value,
    departmentRaw: input.departmentRaw ?? null,
    requestTypeRaw: input.requestTypeRaw ?? null,
    priorityRaw: input.priorityRaw ?? null,
    dateSubmittedRaw: input.dateSubmittedRaw ?? null,
    dueDateRaw: input.dueDateRaw ?? null,
    notes: input.notes ?? null,
  };

  const sourceRecord: SourceRecord = {
    id: makeId("src", state.counters.sourceRecord),
    source: input.source,
    externalId: input.sourceRecordId,
    rawPayload: input.rawPayload,
    mappedPayload,
    validationStatus: "valid",
    warnings,
    duplicateOfRequestId: null,
    createdAt: isoDate(new Date()),
  };

  if (validation.errors.length > 0 || !input.title?.trim()) {
    sourceRecord.validationStatus = "failed";
    return {
      sourceRecord,
      rowResult: {
        rowNumber,
        sourceRecordId: sourceRecord.id,
        title: input.title ?? "Untitled request",
        status: "failed",
        warnings: [...validation.errors, ...warnings],
      },
    };
  }

  const triage = runMockTriage({
    title: input.title,
    description: input.description ?? input.notes ?? "",
    notes: input.notes ?? "",
  });

  const dateSubmitted = submittedDate.value ?? isoDate(new Date());
  const duplicate = findDuplicateRequest(
    {
      title: input.title,
      submittedByEmail: email.value,
      dateSubmitted,
    },
    state.requests
  );

  if (duplicate) {
    sourceRecord.validationStatus = "duplicate";
    sourceRecord.duplicateOfRequestId = duplicate.id;
    return {
      sourceRecord,
      rowResult: {
        rowNumber,
        sourceRecordId: sourceRecord.id,
        title: input.title,
        status: "duplicate",
        warnings: [`Duplicate of ${duplicate.id}`],
        duplicateOfRequestId: duplicate.id,
      },
    };
  }

  const finalDepartment = chooseFinalValue(department.value, triage.department, triage.confidence);
  const finalRequestType = chooseFinalValue(requestType.value, triage.requestType, triage.confidence);
  const finalPriority = chooseFinalValue(priority.value, triage.priority, triage.confidence, priority.wasDefaulted);
  const status = warnings.length > 0 || triage.confidence < 0.68 ? "Needs Review" : "New";
  sourceRecord.validationStatus = warnings.length > 0 ? "warning" : "valid";

  const request: RequestRecord = {
    id: makeId("req", state.counters.request),
    title: input.title,
    description: input.description ?? input.notes ?? "",
    submittedByName: name.value,
    submittedByEmail: email.value,
    source: input.source,
    sourceRecordId: sourceRecord.id,
    normalizedDepartment: department.value,
    normalizedRequestType: requestType.value,
    priorityOriginal: input.priorityRaw ?? "",
    priorityNormalized: priority.value,
    dateSubmitted,
    dueDate: dueDate.value,
    status,
    notes: input.notes ?? "",
    aiSummary: triage.summary,
    aiDepartment: triage.department,
    aiRequestType: triage.requestType,
    aiPriority: triage.priority,
    aiConfidence: triage.confidence,
    aiRationale: triage.rationale,
    finalDepartment: finalDepartment.value,
    finalRequestType: finalRequestType.value,
    finalPriority: finalPriority.value,
    departmentSource: finalDepartment.source,
    requestTypeSource: finalRequestType.source,
    prioritySource: finalPriority.source,
    duplicateOfRequestId: null,
    validationStatus: sourceRecord.validationStatus,
    validationErrors: validation.errors,
    warnings,
    assignedToName: warnings.length > 0 ? null : DEFAULT_ASSIGNEES[state.requests.length % DEFAULT_ASSIGNEES.length].name,
    assignedToEmail: warnings.length > 0 ? null : DEFAULT_ASSIGNEES[state.requests.length % DEFAULT_ASSIGNEES.length].email,
    requestorCompany: "Northstar",
    createdAt: isoDate(new Date()),
    updatedAt: isoDate(new Date()),
  };

  return {
    sourceRecord,
    request,
    rowResult: {
      rowNumber,
      sourceRecordId: sourceRecord.id,
      title: request.title,
      status: sourceRecord.validationStatus,
      warnings,
      requestId: request.id,
    },
  };
}

function applyProcessedRecord(state: DemoState, processed: ProcessedRecord) {
  const nextState: DemoState = {
    ...state,
    sourceRecords: [processed.sourceRecord, ...state.sourceRecords],
    lastReport: [processed.rowResult, ...state.lastReport].slice(0, 12),
    counters: {
      ...state.counters,
      sourceRecord: state.counters.sourceRecord + 1,
    },
  };

  if (!processed.request) {
    return nextState;
  }

  const event: RequestEvent = {
    id: makeId("evt", state.counters.event),
    requestId: processed.request.id,
    type: "ingested",
    actor: "System",
    message: `${processed.request.source} intake created ${processed.request.id}`,
    createdAt: isoDate(new Date()),
  };

  return {
    ...nextState,
    requests: [processed.request, ...state.requests],
    events: [event, ...state.events],
    selectedRequestId: state.selectedRequestId ?? processed.request.id,
    counters: {
      ...nextState.counters,
      request: state.counters.request + 1,
      event: state.counters.event + 1,
    },
  };
}

export function importWebhook(state: DemoState, raw: Record<string, unknown>, label = "Webhook simulator") {
  const processed = processMappedRecord(mapWebhookPayload(raw), state, 1);
  const nextState = applyProcessedRecord(state, processed);
  const run = createRunSummary(nextState, "webhook", label, [processed.rowResult]);

  return {
    ...nextState,
    runs: [run, ...nextState.runs],
    counters: {
      ...nextState.counters,
      run: nextState.counters.run + 1,
    },
  };
}

export function importFormSubmission(state: DemoState, raw: MappedRequestInput) {
  const processed = processMappedRecord(mapFormSubmission(raw), state, 1);
  const nextState = applyProcessedRecord(state, processed);
  const run = createRunSummary(nextState, "form", "Native intake form", [processed.rowResult]);

  return {
    ...nextState,
    runs: [run, ...nextState.runs],
    counters: {
      ...nextState.counters,
      run: nextState.counters.run + 1,
    },
  };
}

export function importCsv(state: DemoState, csvText: string, label = "CSV import") {
  const rows = parseCsvText(csvText);
  let nextState = state;
  const rowResults: RowResult[] = [];

  rows.forEach((row, index) => {
    const processed = processMappedRecord(mapCsvRow(row), nextState, index + 1);
    rowResults.push(processed.rowResult);
    nextState = applyProcessedRecord(nextState, processed);
  });

  const run = createRunSummary(nextState, "csv", label, rowResults);

  return {
    ...nextState,
    runs: [run, ...nextState.runs],
    lastReport: rowResults,
    counters: {
      ...nextState.counters,
      run: nextState.counters.run + 1,
    },
  };
}
