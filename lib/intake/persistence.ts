import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { processMappedRecord } from "@/lib/intake/importers";
import type { DemoState, MappedRequestInput, RequestRecord } from "@/lib/intake/types";
import { isoDate, makeId } from "@/lib/intake/utils";

function fromPrismaStatus(
  status:
    | "New"
    | "NeedsReview"
    | "Approved"
    | "InProgress"
    | "InReview"
    | "Blocked"
    | "Completed"
    | "Rejected"
) {
  return status.replace(/([A-Z])/g, " $1").trim() as RequestRecord["status"];
}

function toPrismaStatus(status: RequestRecord["status"]) {
  return status.replace(/\s/g, "") as
    | "New"
    | "NeedsReview"
    | "Approved"
    | "InProgress"
    | "InReview"
    | "Blocked"
    | "Completed"
    | "Rejected";
}

async function loadCurrentState(): Promise<DemoState> {
  const [requests, sourceRecordCount, runCount, eventCount] = await Promise.all([
    db.request.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.sourceRecord.count(),
    db.ingestionRun.count(),
    db.requestEvent.count(),
  ]);

  return {
    requests: requests.map((request) => ({
      id: request.id,
      title: request.title,
      description: request.description,
      submittedByName: request.submittedByName,
      submittedByEmail: request.submittedByEmail,
      source: request.source,
      sourceRecordId: request.sourceRecordId,
      normalizedDepartment: request.finalDepartment as RequestRecord["normalizedDepartment"],
      normalizedRequestType: request.finalRequestType as RequestRecord["normalizedRequestType"],
      priorityOriginal: request.priorityOriginal,
      priorityNormalized: request.priorityNormalized as RequestRecord["priorityNormalized"],
      dateSubmitted: request.dateSubmitted.toISOString(),
      dueDate: request.dueDate?.toISOString() ?? null,
      status: fromPrismaStatus(request.status),
      notes: request.notes,
      aiSummary: request.aiSummary,
      aiDepartment: request.aiDepartment as RequestRecord["aiDepartment"],
      aiRequestType: request.aiRequestType as RequestRecord["aiRequestType"],
      aiPriority: request.aiPriority as RequestRecord["aiPriority"],
      aiConfidence: request.aiConfidence,
      aiRationale: request.aiRationale,
      finalDepartment: request.finalDepartment as RequestRecord["finalDepartment"],
      finalRequestType: request.finalRequestType as RequestRecord["finalRequestType"],
      finalPriority: request.finalPriority as RequestRecord["finalPriority"],
      departmentSource: request.departmentSource as RequestRecord["departmentSource"],
      requestTypeSource: request.requestTypeSource as RequestRecord["requestTypeSource"],
      prioritySource: request.prioritySource as RequestRecord["prioritySource"],
      duplicateOfRequestId: request.duplicateOfRequestId,
      validationStatus: request.validationStatus,
      validationErrors: request.validationErrors as string[],
      warnings: request.warnings as string[],
      assignedToName: null,
      assignedToEmail: null,
      requestorCompany: request.requestorCompany,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    })),
    sourceRecords: [],
    runs: [],
    events: [],
    lastReport: [],
    selectedRequestId: null,
    counters: {
      request: requests.length,
      sourceRecord: sourceRecordCount,
      run: runCount,
      event: eventCount,
    },
  };
}

export async function persistMappedInput(input: MappedRequestInput, label: string) {
  const state = await loadCurrentState();
  const processed = processMappedRecord(input, state, 1);
  const now = isoDate(new Date());
  const runId = makeId("run", state.counters.run);
  const eventId = makeId("evt", state.counters.event);

  await db.sourceRecord.create({
    data: {
      id: processed.sourceRecord.id,
      source: processed.sourceRecord.source,
      externalId: processed.sourceRecord.externalId,
      rawPayload: processed.sourceRecord.rawPayload as Prisma.InputJsonValue,
      mappedPayload: processed.sourceRecord.mappedPayload as Prisma.InputJsonValue,
      validationStatus: processed.sourceRecord.validationStatus,
      warnings: processed.sourceRecord.warnings as Prisma.InputJsonValue,
      duplicateOfRequestId: processed.sourceRecord.duplicateOfRequestId,
      createdAt: new Date(processed.sourceRecord.createdAt),
    },
  });

  if (processed.request) {
    await db.request.create({
      data: {
        id: processed.request.id,
        title: processed.request.title,
        description: processed.request.description,
        submittedByName: processed.request.submittedByName,
        submittedByEmail: processed.request.submittedByEmail,
        source: processed.request.source,
        sourceRecordId: processed.request.sourceRecordId,
        priorityOriginal: processed.request.priorityOriginal,
        priorityNormalized: processed.request.priorityNormalized,
        dateSubmitted: new Date(processed.request.dateSubmitted),
        dueDate: processed.request.dueDate ? new Date(processed.request.dueDate) : null,
        status: toPrismaStatus(processed.request.status),
        notes: processed.request.notes,
        aiSummary: processed.request.aiSummary,
        aiDepartment: processed.request.aiDepartment,
        aiRequestType: processed.request.aiRequestType,
        aiPriority: processed.request.aiPriority,
        aiConfidence: processed.request.aiConfidence,
        aiRationale: processed.request.aiRationale,
        finalDepartment: processed.request.finalDepartment,
        finalRequestType: processed.request.finalRequestType,
        finalPriority: processed.request.finalPriority,
        departmentSource: processed.request.departmentSource,
        requestTypeSource: processed.request.requestTypeSource,
        prioritySource: processed.request.prioritySource,
        duplicateOfRequestId: processed.request.duplicateOfRequestId,
        validationStatus: processed.request.validationStatus,
        validationErrors: processed.request.validationErrors as Prisma.InputJsonValue,
        warnings: processed.request.warnings as Prisma.InputJsonValue,
        requestorCompany: processed.request.requestorCompany,
        createdAt: new Date(processed.request.createdAt),
        updatedAt: new Date(processed.request.updatedAt),
        triageResults: {
          create: {
            provider: "mock-triage",
            summary: processed.request.aiSummary,
            department: processed.request.aiDepartment,
            requestType: processed.request.aiRequestType,
            priority: processed.request.aiPriority,
            confidence: processed.request.aiConfidence,
            rationale: processed.request.aiRationale,
          },
        },
      },
    });

    await db.requestEvent.create({
      data: {
        id: eventId,
        requestId: processed.request.id,
        type: "ingested",
        message: `${processed.request.source} intake created ${processed.request.id}`,
        createdAt: new Date(now),
      },
    });
  }

  await db.ingestionRun.create({
    data: {
      id: runId,
      source: input.source,
      label,
      startedAt: new Date(now),
      completedAt: new Date(now),
      rowsReceived: 1,
      rowsImported: processed.rowResult.status === "valid" ? 1 : 0,
      rowsWithWarnings: processed.rowResult.status === "warning" ? 1 : 0,
      rowsFailed: processed.rowResult.status === "failed" ? 1 : 0,
      duplicatesDetected: processed.rowResult.status === "duplicate" ? 1 : 0,
    },
  });

  return processed;
}
