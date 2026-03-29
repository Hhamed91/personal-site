export const SLACK_MODAL_CALLBACK_ID = "intake_modal_submission";

export const SLACK_MODAL_FIELDS = {
  title: { blockId: "request_title", actionId: "value" },
  description: { blockId: "request_description", actionId: "value" },
  department: { blockId: "department", actionId: "value" },
  priority: { blockId: "priority", actionId: "value" },
  requestType: { blockId: "request_type", actionId: "value" },
  dueDate: { blockId: "due_date", actionId: "value" },
  requesterEmail: { blockId: "requester_email", actionId: "value" },
} as const;

export const DEPARTMENT_OPTIONS = [
  "Marketing",
  "Sales",
  "Product",
  "Customer Success",
  "Legal",
  "Engineering",
  "People Operations",
] as const;

export const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

export const REQUEST_TYPE_OPTIONS = [
  "New Content",
  "Update Existing",
  "Translation",
  "Design Asset",
  "Event Support",
  "Data Report",
] as const;

export type SlackCommandPayload = {
  command?: string;
  trigger_id?: string;
  user_id?: string;
  user_name?: string;
  channel_id?: string;
  channel_name?: string;
  team_id?: string;
  team_domain?: string;
  text?: string;
};
