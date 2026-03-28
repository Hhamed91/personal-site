import { Prisma, PrismaClient } from "@prisma/client";
import { INITIAL_DEMO_STATE } from "../lib/intake/demo-state";
import { DEPARTMENTS, REQUEST_TYPES } from "../lib/intake/types";

const prisma = new PrismaClient();

async function main() {
  for (const department of DEPARTMENTS.filter((value) => value !== "Needs Review")) {
    await prisma.department.upsert({
      where: { name: department },
      update: {},
      create: { name: department },
    });
  }

  for (const requestType of REQUEST_TYPES.filter((value) => value !== "Needs Review")) {
    await prisma.requestType.upsert({
      where: { name: requestType },
      update: {},
      create: { name: requestType },
    });
  }

  await prisma.ingestionRun.deleteMany();
  await prisma.requestEvent.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.triageResult.deleteMany();
  await prisma.request.deleteMany();
  await prisma.sourceRecord.deleteMany();

  for (const record of INITIAL_DEMO_STATE.sourceRecords) {
    await prisma.sourceRecord.create({
      data: {
        id: record.id,
        source: record.source,
        externalId: record.externalId,
        rawPayload: record.rawPayload as Prisma.InputJsonValue,
        mappedPayload: record.mappedPayload as Prisma.InputJsonValue,
        validationStatus: record.validationStatus,
        warnings: record.warnings as Prisma.InputJsonValue,
        duplicateOfRequestId: record.duplicateOfRequestId,
        createdAt: new Date(record.createdAt),
      },
    });
  }

  for (const request of INITIAL_DEMO_STATE.requests) {
    const department =
      request.finalDepartment === "Needs Review"
        ? null
        : await prisma.department.findUnique({ where: { name: request.finalDepartment } });
    const requestType =
      request.finalRequestType === "Needs Review"
        ? null
        : await prisma.requestType.findUnique({ where: { name: request.finalRequestType } });

    await prisma.request.create({
      data: {
        id: request.id,
        title: request.title,
        description: request.description,
        submittedByName: request.submittedByName,
        submittedByEmail: request.submittedByEmail,
        source: request.source,
        sourceRecordId: request.sourceRecordId,
        departmentId: department?.id,
        requestTypeId: requestType?.id,
        priorityOriginal: request.priorityOriginal,
        priorityNormalized: request.priorityNormalized,
        dateSubmitted: new Date(request.dateSubmitted),
        dueDate: request.dueDate ? new Date(request.dueDate) : null,
        status: request.status.replace(/\s/g, "") as
          | "New"
          | "NeedsReview"
          | "Approved"
          | "InProgress"
          | "InReview"
          | "Blocked"
          | "Completed"
          | "Rejected",
        notes: request.notes,
        aiSummary: request.aiSummary,
        aiDepartment: request.aiDepartment,
        aiRequestType: request.aiRequestType,
        aiPriority: request.aiPriority,
        aiConfidence: request.aiConfidence,
        aiRationale: request.aiRationale,
        finalDepartment: request.finalDepartment,
        finalRequestType: request.finalRequestType,
        finalPriority: request.finalPriority,
        departmentSource: request.departmentSource,
        requestTypeSource: request.requestTypeSource,
        prioritySource: request.prioritySource,
        duplicateOfRequestId: request.duplicateOfRequestId,
        validationStatus: request.validationStatus,
        validationErrors: request.validationErrors as Prisma.InputJsonValue,
        warnings: request.warnings as Prisma.InputJsonValue,
        requestorCompany: request.requestorCompany,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),
        triageResults: {
          create: {
            provider: "mock-triage",
            summary: request.aiSummary,
            department: request.aiDepartment,
            requestType: request.aiRequestType,
            priority: request.aiPriority,
            confidence: request.aiConfidence,
            rationale: request.aiRationale,
          },
        },
      },
    });
  }

  for (const run of INITIAL_DEMO_STATE.runs) {
    await prisma.ingestionRun.create({
      data: {
        id: run.id,
        source: run.source,
        label: run.label,
        startedAt: new Date(run.startedAt),
        completedAt: new Date(run.completedAt),
        rowsReceived: run.rowsReceived,
        rowsImported: run.rowsImported,
        rowsWithWarnings: run.rowsWithWarnings,
        rowsFailed: run.rowsFailed,
        duplicatesDetected: run.duplicatesDetected,
      },
    });
  }

  for (const event of INITIAL_DEMO_STATE.events) {
    await prisma.requestEvent.create({
      data: {
        id: event.id,
        requestId: event.requestId,
        type: event.type,
        message: event.message,
        createdAt: new Date(event.createdAt),
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
