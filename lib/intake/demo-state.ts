import { importCsv, importFormSubmission, importWebhook } from "@/lib/intake/importers";
import { initialImportOrder, sampleFormSubmissions, samplePartnerCsvText } from "@/lib/intake/sample-data";
import type { DemoState, RequestRecord } from "@/lib/intake/types";

export const EMPTY_DEMO_STATE: DemoState = {
  requests: [],
  sourceRecords: [],
  runs: [],
  events: [],
  lastReport: [],
  selectedRequestId: null,
  counters: {
    request: 0,
    sourceRecord: 0,
    run: 0,
    event: 0,
  },
};

function getSeedWebhookLabel(payload: (typeof initialImportOrder)[number]["payload"]) {
  if ("ticket_id" in payload) return payload.ticket_id;
  if ("id" in payload) return payload.id;
  if ("card_id" in payload) return payload.card_id;
  return "webhook";
}

function seededTimestamp(offset: number) {
  return new Date(Date.UTC(2026, 2, 27, 14, offset, 0)).toISOString();
}

function postSeedAdjustments(requests: RequestRecord[]) {
  return requests.map((request, index) => {
    if (request.title === "API auth docs rewrite") {
      return {
        ...request,
        status: "In Progress" as const,
      };
    }

    if (request.title === "Customer win announcement") {
      return {
        ...request,
        status: "Approved" as const,
      };
    }

    if (request.title === "Enterprise compliance checklist refresh") {
      return {
        ...request,
        status: "In Review" as const,
      };
    }

    if (index === 0) {
      return {
        ...request,
        status: "Blocked" as const,
      };
    }

    return request;
  });
}

function stabilizeSeedState(state: DemoState): DemoState {
  return {
    ...state,
    requests: postSeedAdjustments(
      state.requests.map((request, index) => ({
        ...request,
        createdAt: seededTimestamp(index),
        updatedAt: seededTimestamp(index + 1),
      }))
    ),
    sourceRecords: state.sourceRecords.map((record, index) => ({
      ...record,
      createdAt: seededTimestamp(index),
    })),
    runs: state.runs.map((run, index) => ({
      ...run,
      startedAt: seededTimestamp(index),
      completedAt: seededTimestamp(index + 1),
    })),
    events: state.events.map((event, index) => ({
      ...event,
      createdAt: seededTimestamp(index),
    })),
  };
}

export function buildInitialDemoState() {
  let state = EMPTY_DEMO_STATE;

  initialImportOrder.forEach((entry) => {
    if (entry.source === "webhook") {
      state = importWebhook(state, entry.payload, `Seed ${getSeedWebhookLabel(entry.payload)}`);
      return;
    }

    state = importFormSubmission(state, entry.payload);
  });

  state = importCsv(state, samplePartnerCsvText, "Seed partner CSV");

  return stabilizeSeedState(state);
}

export const INITIAL_DEMO_STATE = buildInitialDemoState();

export const EMPTY_FORM_SUBMISSION = sampleFormSubmissions[0];
