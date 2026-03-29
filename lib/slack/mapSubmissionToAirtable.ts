import { SLACK_MODAL_FIELDS } from "@/lib/slack/intake";

type SlackViewStateValue = {
  type: string;
  value?: string | null;
  selected_option?: {
    value: string;
  } | null;
  selected_date?: string | null;
};

type SlackViewSubmissionPayload = {
  type: "view_submission";
  user: {
    id: string;
    username?: string;
    name?: string;
  };
  view: {
    callback_id: string;
    private_metadata?: string;
    state: {
      values: Record<string, Record<string, SlackViewStateValue>>;
    };
  };
};

type SlackPrivateMetadata = {
  userId?: string;
  userName?: string;
  channelId?: string;
  channelName?: string;
  teamId?: string;
  teamDomain?: string;
  command?: string;
};

export type AirtableWebhookPayload = {
  subject: string;
  body: string;
  submitted_by: string;
  contact_email: string;
  dept: string;
  urgency: string;
  category_tag: string;
  ticket_status: "Open";
  target_date: string;
  source_system: "Slack";
  event_type: "request.created";
};

function readStateValue(
  values: SlackViewSubmissionPayload["view"]["state"]["values"],
  blockId: string,
  actionId: string
) {
  return values[blockId]?.[actionId];
}

function readTextValue(
  values: SlackViewSubmissionPayload["view"]["state"]["values"],
  blockId: string,
  actionId: string
) {
  return readStateValue(values, blockId, actionId)?.value?.trim() ?? "";
}

function readSelectValue(
  values: SlackViewSubmissionPayload["view"]["state"]["values"],
  blockId: string,
  actionId: string
) {
  return readStateValue(values, blockId, actionId)?.selected_option?.value?.trim() ?? "";
}

function readDateValue(
  values: SlackViewSubmissionPayload["view"]["state"]["values"],
  blockId: string,
  actionId: string
) {
  return readStateValue(values, blockId, actionId)?.selected_date?.trim() ?? "";
}

function parsePrivateMetadata(rawMetadata?: string): SlackPrivateMetadata {
  if (!rawMetadata) {
    return {};
  }

  try {
    return JSON.parse(rawMetadata) as SlackPrivateMetadata;
  } catch {
    return {};
  }
}

export function mapSubmissionToAirtable(payload: SlackViewSubmissionPayload): AirtableWebhookPayload {
  const values = payload.view.state.values;
  const metadata = parsePrivateMetadata(payload.view.private_metadata);
  const submittedBy =
    metadata.userName?.trim() || payload.user.username || payload.user.name || payload.user.id;

  return {
    subject: readTextValue(values, SLACK_MODAL_FIELDS.title.blockId, SLACK_MODAL_FIELDS.title.actionId),
    body: readTextValue(
      values,
      SLACK_MODAL_FIELDS.description.blockId,
      SLACK_MODAL_FIELDS.description.actionId
    ),
    submitted_by: submittedBy,
    contact_email: readTextValue(
      values,
      SLACK_MODAL_FIELDS.requesterEmail.blockId,
      SLACK_MODAL_FIELDS.requesterEmail.actionId
    ),
    dept: readSelectValue(
      values,
      SLACK_MODAL_FIELDS.department.blockId,
      SLACK_MODAL_FIELDS.department.actionId
    ),
    urgency: readSelectValue(
      values,
      SLACK_MODAL_FIELDS.priority.blockId,
      SLACK_MODAL_FIELDS.priority.actionId
    ),
    category_tag: readSelectValue(
      values,
      SLACK_MODAL_FIELDS.requestType.blockId,
      SLACK_MODAL_FIELDS.requestType.actionId
    ),
    ticket_status: "Open",
    target_date: readDateValue(
      values,
      SLACK_MODAL_FIELDS.dueDate.blockId,
      SLACK_MODAL_FIELDS.dueDate.actionId
    ),
    source_system: "Slack",
    event_type: "request.created",
  };
}

export type { SlackViewSubmissionPayload };
