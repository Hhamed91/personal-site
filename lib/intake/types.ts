export const DEPARTMENTS = [
  "Marketing",
  "Customer Success",
  "Sales",
  "Product",
  "Engineering",
  "Localization",
  "Compliance",
  "Design",
  "Operations",
  "Needs Review",
] as const;

export const REQUEST_TYPES = [
  "Blog Post",
  "Case Study",
  "Translation",
  "Product Update",
  "Design Asset",
  "Documentation",
  "Compliance Review",
  "Webinar Copy",
  "Announcement",
  "Dashboard Mockup",
  "Needs Review",
] as const;

export const PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
  "Needs Review",
] as const;

export const STATUSES = [
  "New",
  "Needs Review",
  "Approved",
  "In Progress",
  "In Review",
  "Blocked",
  "Completed",
  "Rejected",
] as const;

export const SOURCE_TYPES = ["webhook", "csv", "form", "slack"] as const;
export const VALIDATION_STATUSES = ["valid", "warning", "failed", "duplicate"] as const;
export const FIELD_SOURCES = ["source", "ai", "human_override", "defaulted"] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type RequestType = (typeof REQUEST_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type RequestStatus = (typeof STATUSES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];
export type FieldSource = (typeof FIELD_SOURCES)[number];

export type WarningItem = {
  field: string;
  message: string;
};

export type MappedRequestInput = {
  title?: string;
  description?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  departmentRaw?: string;
  requestTypeRaw?: string;
  priorityRaw?: string;
  statusRaw?: string;
  dateSubmittedRaw?: string;
  dueDateRaw?: string;
  notes?: string;
  source: SourceType;
  sourceRecordId: string;
  rawPayload: Record<string, unknown>;
};

export type TriageResult = {
  summary: string;
  department: Department;
  requestType: RequestType;
  priority: Priority;
  confidence: number;
  rationale: string;
};

export type RequestRecord = {
  id: string;
  title: string;
  description: string;
  submittedByName: string;
  submittedByEmail: string;
  source: SourceType;
  sourceRecordId: string;
  normalizedDepartment: Department;
  normalizedRequestType: RequestType;
  priorityOriginal: string;
  priorityNormalized: Priority;
  dateSubmitted: string;
  dueDate: string | null;
  status: RequestStatus;
  notes: string;
  aiSummary: string;
  aiDepartment: Department;
  aiRequestType: RequestType;
  aiPriority: Priority;
  aiConfidence: number;
  aiRationale: string;
  finalDepartment: Department;
  finalRequestType: RequestType;
  finalPriority: Priority;
  departmentSource: FieldSource;
  requestTypeSource: FieldSource;
  prioritySource: FieldSource;
  duplicateOfRequestId: string | null;
  validationStatus: ValidationStatus;
  validationErrors: string[];
  warnings: string[];
  assignedToName: string | null;
  assignedToEmail: string | null;
  requestorCompany: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SourceRecord = {
  id: string;
  source: SourceType;
  externalId: string;
  rawPayload: Record<string, unknown>;
  mappedPayload: Record<string, string | null>;
  validationStatus: ValidationStatus;
  warnings: string[];
  duplicateOfRequestId: string | null;
  createdAt: string;
};

export type IngestionRun = {
  id: string;
  source: SourceType;
  label: string;
  startedAt: string;
  completedAt: string;
  rowsReceived: number;
  rowsImported: number;
  rowsWithWarnings: number;
  rowsFailed: number;
  duplicatesDetected: number;
};

export type RequestEvent = {
  id: string;
  requestId: string;
  type: "ingested" | "assigned" | "override" | "comment";
  actor: string;
  message: string;
  createdAt: string;
};

export type RowResult = {
  rowNumber: number;
  sourceRecordId: string;
  title: string;
  status: ValidationStatus;
  warnings: string[];
  requestId?: string;
  duplicateOfRequestId?: string | null;
};

export type ProcessedRecord = {
  sourceRecord: SourceRecord;
  request?: RequestRecord;
  rowResult: RowResult;
};

export type DemoState = {
  requests: RequestRecord[];
  sourceRecords: SourceRecord[];
  runs: IngestionRun[];
  events: RequestEvent[];
  lastReport: RowResult[];
  selectedRequestId: string | null;
  counters: {
    request: number;
    sourceRecord: number;
    run: number;
    event: number;
  };
};
