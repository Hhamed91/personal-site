import type { MappedRequestInput } from "@/lib/intake/types";

type SlackCommandPayload = {
  team_id?: string;
  team_domain?: string;
  channel_id?: string;
  channel_name?: string;
  user_id?: string;
  user_name?: string;
  command?: string;
  text?: string;
  trigger_id?: string;
  response_url?: string;
  api_app_id?: string;
};

const FIELD_ALIASES: Record<string, keyof ParsedCommandFields> = {
  dept: "departmentRaw",
  department: "departmentRaw",
  team: "departmentRaw",
  type: "requestTypeRaw",
  request_type: "requestTypeRaw",
  priority: "priorityRaw",
  due: "dueDateRaw",
  due_date: "dueDateRaw",
  notes: "notes",
  note: "notes",
  desc: "description",
  description: "description",
  title: "title",
};

type ParsedCommandFields = {
  title?: string;
  description?: string;
  departmentRaw?: string;
  requestTypeRaw?: string;
  priorityRaw?: string;
  dueDateRaw?: string;
  notes?: string;
};

function parseStructuredText(text: string) {
  const parts = text
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const parsed: ParsedCommandFields = {};

  parts.forEach((part, index) => {
    const kvMatch = part.match(/^([a-zA-Z_]+)\s*[:=]\s*(.+)$/);
    if (kvMatch) {
      const alias = FIELD_ALIASES[kvMatch[1].toLowerCase()];
      if (alias) parsed[alias] = kvMatch[2].trim();
      return;
    }

    if (index === 0 && !parsed.title) {
      parsed.title = part;
      return;
    }

    if (!parsed.description) {
      parsed.description = part;
      return;
    }

    parsed.notes = parsed.notes ? `${parsed.notes} ${part}` : part;
  });

  return parsed;
}

export function buildSlackMappedInput(payload: SlackCommandPayload): MappedRequestInput {
  const parsed = parseStructuredText(payload.text?.trim() ?? "");
  const title = parsed.title ?? payload.text?.trim() ?? "Slack intake request";
  const sourceRecordId = [
    payload.team_id ?? "team",
    payload.channel_id ?? "channel",
    payload.user_id ?? "user",
    Date.now().toString(),
  ].join("-");

  const notes = [
    parsed.notes,
    payload.channel_name ? `Submitted from #${payload.channel_name}` : null,
    payload.team_domain ? `Workspace: ${payload.team_domain}` : null,
    payload.command ? `Slack command: ${payload.command}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    source: "slack",
    sourceRecordId,
    title,
    description: parsed.description ?? payload.text?.trim() ?? title,
    submittedByName: payload.user_name ?? payload.user_id ?? "Slack user",
    submittedByEmail: payload.user_id ? `${payload.user_id.toLowerCase()}@slack-user.local` : undefined,
    departmentRaw: parsed.departmentRaw,
    requestTypeRaw: parsed.requestTypeRaw,
    priorityRaw: parsed.priorityRaw,
    dateSubmittedRaw: new Date().toISOString(),
    dueDateRaw: parsed.dueDateRaw,
    notes,
    rawPayload: payload as Record<string, unknown>,
  };
}

export function formatSlackUsageHint() {
  return "Use /intake Title | description | dept=Marketing | type=New Content | priority=High | due=2026-04-15";
}
