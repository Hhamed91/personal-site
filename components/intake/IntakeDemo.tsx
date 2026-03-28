"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  CopyCheck,
  FileSpreadsheet,
  Inbox,
  Layers3,
  RefreshCcw,
  Send,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { importCsv, importFormSubmission, importWebhook } from "@/lib/intake/importers";
import { INITIAL_DEMO_STATE } from "@/lib/intake/demo-state";
import { samplePartnerCsvText, sampleWebhookPayloads } from "@/lib/intake/sample-data";
import { DEPARTMENTS, PRIORITIES, REQUEST_TYPES, STATUSES, type DemoState, type FieldSource, type RequestRecord } from "@/lib/intake/types";
import {
  DEFAULT_ASSIGNEES,
  formatDateLabel,
  getFieldSourceLabel,
  getPriorityTone,
  getRequestOwner,
  getSourceTone,
  getStatusTone,
  isoDate,
  makeId,
  summarizeState,
} from "@/lib/intake/utils";

type Persona = "lead" | "contributor" | "stakeholder";
type IntakeTab = "webhook" | "csv" | "form";

const toneClassMap: Record<string, string> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

function getWebhookSampleId(payload: (typeof sampleWebhookPayloads)[number]) {
  if ("ticket_id" in payload) return payload.ticket_id;
  if ("id" in payload) return payload.id;
  return payload.card_id;
}

function getWebhookSampleTitle(payload: (typeof sampleWebhookPayloads)[number]) {
  if ("task_name" in payload) return payload.task_name;
  if ("subject" in payload) return payload.subject;
  return payload.cardTitle;
}

function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClassMap;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClassMap[tone]}`}>
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="max-w-2xl text-sm text-slate-600">{description}</p>
    </div>
  );
}

export default function IntakeDemo() {
  const [state, setState] = useState<DemoState>(INITIAL_DEMO_STATE);
  const [persona, setPersona] = useState<Persona>("lead");
  const [intakeTab, setIntakeTab] = useState<IntakeTab>("webhook");
  const [webhookIndex, setWebhookIndex] = useState(0);
  const [csvText, setCsvText] = useState("");
  const [stakeholderEmail, setStakeholderEmail] = useState("ari.west@northstar.example");
  const [formInput, setFormInput] = useState({
    title: "German release blog refresh",
    description: "Refresh the release blog with Germany-specific messaging and launch CTA.",
    submittedByName: "Maya Chen",
    submittedByEmail: "maya.chen@northstar.example",
    departmentRaw: "Mktg",
    requestTypeRaw: "new content",
    priorityRaw: "",
    dateSubmittedRaw: "2026-03-27",
    dueDateRaw: "2026-04-05",
    notes: "Launch team wants this aligned to the reseller webinar and translation handoff.",
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(INITIAL_DEMO_STATE.selectedRequestId);
  const [overrideValues, setOverrideValues] = useState({
    department: "Marketing",
    requestType: "Blog Post",
    priority: "High",
    status: "Approved",
    assigneeEmail: DEFAULT_ASSIGNEES[0].email,
  });

  const summary = useMemo(() => summarizeState(state), [state]);
  const selectedRequest = state.requests.find((request) => request.id === selectedRequestId) ?? state.requests[0] ?? null;

  const contributorView = useMemo(() => {
    return state.requests.filter((request) => request.assignedToEmail === DEFAULT_ASSIGNEES[0].email);
  }, [state.requests]);

  const stakeholderRequests = useMemo(() => {
    return state.requests.filter((request) => request.submittedByEmail === stakeholderEmail);
  }, [stakeholderEmail, state.requests]);

  useEffect(() => {
    if (!selectedRequest) return;
    setOverrideValues({
      department: selectedRequest.finalDepartment,
      requestType: selectedRequest.finalRequestType,
      priority: selectedRequest.finalPriority,
      status: selectedRequest.status,
      assigneeEmail: selectedRequest.assignedToEmail ?? DEFAULT_ASSIGNEES[0].email,
    });
  }, [selectedRequest]);

  function appendOverrideEvent(requestId: string, message: string, eventCount: number) {
    return {
      id: makeId("evt", eventCount),
      requestId,
      type: "override" as const,
      actor: "Team Lead",
      message,
      createdAt: isoDate(new Date()),
    };
  }

  function handleWebhookImport() {
    const next = importWebhook(state, sampleWebhookPayloads[webhookIndex] as unknown as Record<string, unknown>, `Webhook sample ${webhookIndex + 1}`);
    setState(next);
    const newRequest = next.requests[0];
    if (newRequest) setSelectedRequestId(newRequest.id);
  }

  function handleCsvImport() {
    const payload = csvText.trim() ? csvText : samplePartnerCsvText;
    const next = importCsv(state, payload, csvText.trim() ? "Uploaded CSV" : "Sample partner CSV");
    setState(next);
    if (next.requests[0]) setSelectedRequestId(next.requests[0].id);
  }

  function handleFormImport() {
    const next = importFormSubmission(state, {
      source: "form",
      sourceRecordId: `FORM-${Date.now()}`,
      rawPayload: formInput,
      ...formInput,
    });
    setState(next);
    if (next.requests[0]) setSelectedRequestId(next.requests[0].id);
  }

  function applyOverride() {
    if (!selectedRequest) return;
    const assignee = DEFAULT_ASSIGNEES.find((person) => person.email === overrideValues.assigneeEmail) ?? DEFAULT_ASSIGNEES[0];

    setState((current) => {
      const nextRequests = current.requests.map((request) => {
        if (request.id !== selectedRequest.id) return request;

        return {
          ...request,
          finalDepartment: overrideValues.department as RequestRecord["finalDepartment"],
          finalRequestType: overrideValues.requestType as RequestRecord["finalRequestType"],
          finalPriority: overrideValues.priority as RequestRecord["finalPriority"],
          departmentSource: "human_override" as FieldSource,
          requestTypeSource: "human_override" as FieldSource,
          prioritySource: "human_override" as FieldSource,
          status: overrideValues.status as RequestRecord["status"],
          assignedToName: assignee.name,
          assignedToEmail: assignee.email,
          updatedAt: isoDate(new Date()),
        };
      });

      const event = appendOverrideEvent(
        selectedRequest.id,
        `Override applied: ${overrideValues.department} / ${overrideValues.requestType} / ${overrideValues.priority}`,
        current.counters.event
      );

      return {
        ...current,
        requests: nextRequests,
        events: [event, ...current.events],
        counters: {
          ...current.counters,
          event: current.counters.event + 1,
        },
      };
    });
  }

  function updateStatus(status: RequestRecord["status"]) {
    if (!selectedRequest) return;

    setState((current) => {
      const nextRequests = current.requests.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status,
              updatedAt: isoDate(new Date()),
            }
          : request
      );
      const event = appendOverrideEvent(selectedRequest.id, `Status updated to ${status}`, current.counters.event);

      return {
        ...current,
        requests: nextRequests,
        events: [event, ...current.events],
        counters: {
          ...current.counters,
          event: current.counters.event + 1,
        },
      };
    });
  }

  const teamLeadQueues = {
    needsReview: state.requests.filter((request) => request.status === "Needs Review"),
    lowConfidence: state.requests.filter((request) => request.aiConfidence < 0.68),
    urgent: state.requests.filter(
      (request) => request.finalPriority === "Critical" || request.finalPriority === "High"
    ),
    duplicates: state.sourceRecords.filter((record) => record.validationStatus === "duplicate"),
  };

  const pipelineSteps = [
    "Raw Input",
    "Validation",
    "Mapping",
    "Normalization",
    "Deduplication",
    "Canonical Request",
  ];

  const stakeholderOptions = Array.from(
    new Set(state.requests.map((request) => request.submittedByEmail))
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#f8fafc_45%,#fff7ed_100%)] p-8 text-white shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Interactive Demo</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
              Multi-source intake, AI triage, and persona-based workflow management in one demo surface.
            </h1>
            <p className="max-w-2xl text-sm text-slate-200">
              The demo simulates webhook, CSV, and native form intake; normalizes inconsistent records into a canonical request model; runs deterministic AI triage; and exposes separate views for triage managers, contributors, and stakeholders.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="sky">Prisma-ready schema</Badge>
              <Badge tone="amber">AI confidence review</Badge>
              <Badge tone="emerald">Role-based UX</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-semibold">{summary.totalRequests}</p>
              <p className="mt-1 text-sm text-slate-200">Canonical requests</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-semibold">{summary.duplicates}</p>
              <p className="mt-1 text-sm text-slate-200">Duplicates caught</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-semibold">{summary.lowConfidence}</p>
              <p className="mt-1 text-sm text-slate-200">Low-confidence queue</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-semibold">{state.runs.length}</p>
              <p className="mt-1 text-sm text-slate-200">Import runs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="space-y-4 px-6 pt-6">
            <SectionTitle
              eyebrow="Ingestion"
              title="Run the intake pipeline"
              description="Each source uses different field names and formats. Every submission flows through the same visible pipeline before reaching the canonical request model."
            />
            <div className="grid gap-3 md:grid-cols-6">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-medium text-slate-700"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                  <p className="mt-2">{step}</p>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {(["webhook", "csv", "form"] as IntakeTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setIntakeTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    intakeTab === tab
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tab === "webhook" ? "Webhook simulator" : tab === "csv" ? "CSV importer" : "Native form"}
                </button>
              ))}
            </div>

            {intakeTab === "webhook" && (
              <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <FileSpreadsheet className="size-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-700">Webhook payload samples</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {sampleWebhookPayloads.map((payload, index) => (
                    <button
                      key={getWebhookSampleId(payload)}
                      type="button"
                      onClick={() => setWebhookIndex(index)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        webhookIndex === index
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] opacity-70">Sample {index + 1}</p>
                      <p className="mt-2 text-sm font-medium">{getWebhookSampleTitle(payload)}</p>
                    </button>
                  ))}
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                  {JSON.stringify(sampleWebhookPayloads[webhookIndex], null, 2)}
                </pre>
                <Button onClick={handleWebhookImport} className="rounded-full">
                  <Send className="size-4" />
                  Send webhook payload
                </Button>
              </div>
            )}

            {intakeTab === "csv" && (
              <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-full" onClick={() => setCsvText(samplePartnerCsvText)}>
                    <CopyCheck className="size-4" />
                    Load sample partner CSV
                  </Button>
                  <Button onClick={handleCsvImport} className="rounded-full">
                    <Inbox className="size-4" />
                    Parse and import CSV
                  </Button>
                </div>
                <textarea
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                  placeholder="Paste CSV rows here or load the sample partner CSV."
                  className="min-h-56 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-700 outline-none ring-0"
                />
              </div>
            )}

            {intakeTab === "form" && (
              <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["title", "Title"],
                    ["submittedByName", "Submitter name"],
                    ["submittedByEmail", "Submitter email"],
                    ["departmentRaw", "Department"],
                    ["requestTypeRaw", "Request type"],
                    ["priorityRaw", "Priority"],
                    ["dateSubmittedRaw", "Submitted date"],
                    ["dueDateRaw", "Due date"],
                  ].map(([key, label]) => (
                    <label key={key} className="space-y-2 text-sm text-slate-700">
                      <span>{label}</span>
                      <input
                        value={formInput[key as keyof typeof formInput]}
                        onChange={(event) =>
                          setFormInput((current) => ({ ...current, [key]: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                      />
                    </label>
                  ))}
                </div>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Description</span>
                  <textarea
                    value={formInput.description}
                    onChange={(event) => setFormInput((current) => ({ ...current, description: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Notes</span>
                  <textarea
                    value={formInput.notes}
                    onChange={(event) => setFormInput((current) => ({ ...current, notes: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  />
                </label>
                <Button onClick={handleFormImport} className="rounded-full">
                  <Send className="size-4" />
                  Create native request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="px-6 pt-6">
            <SectionTitle
              eyebrow="Import Report"
              title="Run summary and row outcomes"
              description="The report surfaces imported rows, warnings, failures, and duplicates so the team lead can trust what landed in the system."
            />
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-900">{state.runs[0]?.rowsReceived ?? 0}</p>
                <p className="text-sm text-slate-500">Rows received</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-900">
                  {(state.runs[0]?.rowsImported ?? 0) + (state.runs[0]?.rowsWithWarnings ?? 0)}
                </p>
                <p className="text-sm text-slate-500">Rows imported</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-900">{state.runs[0]?.rowsWithWarnings ?? 0}</p>
                <p className="text-sm text-slate-500">Rows with warnings</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-900">
                  {(state.runs[0]?.rowsFailed ?? 0) + (state.runs[0]?.duplicatesDetected ?? 0)}
                </p>
                <p className="text-sm text-slate-500">Failed or duplicate</p>
              </div>
            </div>
            <div className="space-y-3">
              {(state.lastReport.length > 0 ? state.lastReport : INITIAL_DEMO_STATE.lastReport).map((row) => (
                <div
                  key={`${row.sourceRecordId}-${row.rowNumber}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        row.status === "valid"
                          ? "emerald"
                          : row.status === "warning"
                            ? "amber"
                            : row.status === "duplicate"
                              ? "rose"
                              : "slate"
                      }
                    >
                      {row.status}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Row {row.rowNumber}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{row.title}</p>
                  {row.warnings.length > 0 && (
                    <p className="mt-2 text-sm text-slate-500">{row.warnings[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="px-6 pt-6">
            <SectionTitle
              eyebrow="Role-Based Views"
              title="Switch personas"
              description="The same canonical data powers three different workflow views: triage manager, individual contributor, and stakeholder dashboard."
            />
            <div className="flex flex-wrap gap-2">
              {([
                ["lead", "Team Lead"],
                ["contributor", "Contributor"],
                ["stakeholder", "Stakeholder"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersona(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    persona === value
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {persona === "lead" && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <QueueCard icon={AlertTriangle} label="Needs review" value={teamLeadQueues.needsReview.length} />
                  <QueueCard icon={Bot} label="Low confidence" value={teamLeadQueues.lowConfidence.length} />
                  <QueueCard icon={Clock3} label="Urgent / critical" value={teamLeadQueues.urgent.length} />
                  <QueueCard icon={Layers3} label="Duplicates" value={teamLeadQueues.duplicates.length} />
                </div>
                <div className="space-y-3">
                  {state.requests.slice(0, 6).map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedRequestId(request.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedRequestId === request.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getSourceTone(request.source) as keyof typeof toneClassMap}>{request.source}</Badge>
                        <Badge tone={getPriorityTone(request.finalPriority) as keyof typeof toneClassMap}>{request.finalPriority}</Badge>
                        {request.aiConfidence < 0.68 && <Badge tone="amber">Low AI confidence</Badge>}
                      </div>
                      <p className="mt-3 font-medium">{request.title}</p>
                      <p className={`mt-1 text-sm ${selectedRequestId === request.id ? "text-slate-200" : "text-slate-500"}`}>
                        {request.finalDepartment} · {request.finalRequestType} · {request.status}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {persona === "contributor" && (
              <div className="space-y-3">
                {contributorView.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getPriorityTone(request.finalPriority) as keyof typeof toneClassMap}>{request.finalPriority}</Badge>
                      <Badge tone={getStatusTone(request.status) as keyof typeof toneClassMap}>{request.status}</Badge>
                    </div>
                    <p className="mt-3 font-medium text-slate-900">{request.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{request.aiSummary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                      Due {formatDateLabel(request.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {persona === "stakeholder" && (
              <div className="space-y-4">
                <label className="block text-sm text-slate-700">
                  <span className="mb-2 block">Requestor</span>
                  <select
                    value={stakeholderEmail}
                    onChange={(event) => setStakeholderEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  >
                    {stakeholderOptions.map((email) => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  {["New", "In Progress", "Completed"].map((status) => (
                    <div key={status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-900">
                        {stakeholderRequests.filter((request) => request.status === status).length}
                      </p>
                      <p className="text-sm text-slate-500">{status}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {stakeholderRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getStatusTone(request.status) as keyof typeof toneClassMap}>{request.status}</Badge>
                        <Badge tone={getPriorityTone(request.finalPriority) as keyof typeof toneClassMap}>{request.finalPriority}</Badge>
                      </div>
                      <p className="mt-3 font-medium text-slate-900">{request.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Owner: {getRequestOwner(request)} · Updated {formatDateLabel(request.updatedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="px-6 pt-6">
            <SectionTitle
              eyebrow="Request Detail"
              title={selectedRequest?.title ?? "Select a request"}
              description="Inspect raw source fields, AI output, field provenance, and manual overrides in a single review surface."
            />
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            {selectedRequest && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={getSourceTone(selectedRequest.source) as keyof typeof toneClassMap}>{selectedRequest.source}</Badge>
                  <Badge tone={getPriorityTone(selectedRequest.finalPriority) as keyof typeof toneClassMap}>{selectedRequest.finalPriority}</Badge>
                  <Badge tone={getStatusTone(selectedRequest.status) as keyof typeof toneClassMap}>{selectedRequest.status}</Badge>
                  {selectedRequest.aiConfidence < 0.68 && <Badge tone="amber">Confidence {Math.round(selectedRequest.aiConfidence * 100)}%</Badge>}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Bot className="size-4" />
                      <p className="text-sm font-medium">AI triage output</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{selectedRequest.aiSummary}</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>Department: {selectedRequest.aiDepartment}</p>
                      <p>Type: {selectedRequest.aiRequestType}</p>
                      <p>Priority: {selectedRequest.aiPriority}</p>
                      <p>Rationale: {selectedRequest.aiRationale}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Wand2 className="size-4" />
                      <p className="text-sm font-medium">Before vs after normalization</p>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <DiffRow
                        label="Department"
                        before={selectedRequest.normalizedDepartment}
                        after={`${selectedRequest.finalDepartment} · ${getFieldSourceLabel(selectedRequest.departmentSource)}`}
                      />
                      <DiffRow
                        label="Request type"
                        before={selectedRequest.normalizedRequestType}
                        after={`${selectedRequest.finalRequestType} · ${getFieldSourceLabel(selectedRequest.requestTypeSource)}`}
                      />
                      <DiffRow
                        label="Priority"
                        before={selectedRequest.priorityNormalized}
                        after={`${selectedRequest.finalPriority} · ${getFieldSourceLabel(selectedRequest.prioritySource)}`}
                      />
                      <DiffRow
                        label="Email"
                        before={selectedRequest.submittedByEmail}
                        after={`Owner ${getRequestOwner(selectedRequest)}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm font-medium text-slate-700">Team lead controls</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <SelectField
                        label="Department"
                        value={overrideValues.department}
                        options={DEPARTMENTS}
                        onChange={(value) => setOverrideValues((current) => ({ ...current, department: value }))}
                      />
                      <SelectField
                        label="Request type"
                        value={overrideValues.requestType}
                        options={REQUEST_TYPES}
                        onChange={(value) => setOverrideValues((current) => ({ ...current, requestType: value }))}
                      />
                      <SelectField
                        label="Priority"
                        value={overrideValues.priority}
                        options={PRIORITIES}
                        onChange={(value) => setOverrideValues((current) => ({ ...current, priority: value }))}
                      />
                      <SelectField
                        label="Status"
                        value={overrideValues.status}
                        options={STATUSES}
                        onChange={(value) => setOverrideValues((current) => ({ ...current, status: value }))}
                      />
                      <SelectField
                        label="Assignee"
                        value={overrideValues.assigneeEmail}
                        options={DEFAULT_ASSIGNEES.map((person) => person.email)}
                        onChange={(value) => setOverrideValues((current) => ({ ...current, assigneeEmail: value }))}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button className="rounded-full" onClick={applyOverride}>
                        <CheckCircle2 className="size-4" />
                        Apply override
                      </Button>
                      <Button variant="outline" className="rounded-full" onClick={() => updateStatus("Approved")}>
                        Approve
                      </Button>
                      <Button variant="outline" className="rounded-full" onClick={() => updateStatus("Rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-sm font-medium text-slate-700">Audit trail</p>
                    <div className="mt-4 space-y-3">
                      {state.events
                        .filter((event) => event.requestId === selectedRequest.id)
                        .slice(0, 4)
                        .map((event) => (
                          <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-sm font-medium text-slate-900">{event.message}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                              {event.actor} · {formatDateLabel(event.createdAt)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="px-6 pt-6">
            <SectionTitle
              eyebrow="Queue"
              title="Canonical intake queue"
              description="Every request preserves source data, normalized values, AI output, and final workflow state."
            />
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {state.requests.slice(0, 8).map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => setSelectedRequestId(request.id)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getSourceTone(request.source) as keyof typeof toneClassMap}>{request.source}</Badge>
                  <Badge tone={getStatusTone(request.status) as keyof typeof toneClassMap}>{request.status}</Badge>
                  <Badge tone={getPriorityTone(request.finalPriority) as keyof typeof toneClassMap}>{request.finalPriority}</Badge>
                  {request.validationStatus === "warning" && <Badge tone="amber">Warnings</Badge>}
                </div>
                <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{request.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {request.submittedByName} · {request.finalDepartment} · {request.finalRequestType}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    Due {formatDateLabel(request.dueDate)}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="px-6 pt-6">
            <SectionTitle
              eyebrow="History"
              title="Import runs"
              description="Run history gives operators a quick sanity check on what entered the system and how clean it was."
            />
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {state.runs.slice(0, 6).map((run) => (
              <div key={run.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getSourceTone(run.source) as keyof typeof toneClassMap}>{run.source}</Badge>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{run.label}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <p>Rows received: {run.rowsReceived}</p>
                  <p>Imported: {run.rowsImported + run.rowsWithWarnings}</p>
                  <p>Warnings: {run.rowsWithWarnings}</p>
                  <p>Duplicates: {run.duplicatesDetected}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="rounded-full" onClick={() => setState(INITIAL_DEMO_STATE)}>
              <RefreshCcw className="size-4" />
              Reset to seeded demo
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function QueueCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4" />
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DiffRow({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[0.8fr_1fr_1fr]">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-slate-500">{before}</p>
      <p className="font-medium text-slate-900">{after}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
