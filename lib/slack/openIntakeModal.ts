import {
  DEPARTMENT_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  SLACK_MODAL_CALLBACK_ID,
  SLACK_MODAL_FIELDS,
  type SlackCommandPayload,
} from "@/lib/slack/intake";

type SlackApiSuccessResponse = {
  ok: true;
};

type SlackApiErrorResponse = {
  ok: false;
  error?: string;
};

function option(value: string) {
  return {
    text: {
      type: "plain_text" as const,
      text: value,
    },
    value,
  };
}

function plainTextInput(
  blockId: string,
  actionId: string,
  label: string,
  options?: {
    multiline?: boolean;
    optional?: boolean;
    placeholder?: string;
    initialValue?: string;
  }
) {
  return {
    type: "input" as const,
    block_id: blockId,
    optional: options?.optional ?? false,
    label: {
      type: "plain_text" as const,
      text: label,
    },
    element: {
      type: "plain_text_input" as const,
      action_id: actionId,
      multiline: options?.multiline ?? false,
      initial_value: options?.initialValue,
      placeholder: options?.placeholder
        ? {
            type: "plain_text" as const,
            text: options.placeholder,
          }
        : undefined,
    },
  };
}

function staticSelectInput(
  blockId: string,
  actionId: string,
  label: string,
  values: readonly string[],
  placeholder: string
) {
  return {
    type: "input" as const,
    block_id: blockId,
    label: {
      type: "plain_text" as const,
      text: label,
    },
    element: {
      type: "static_select" as const,
      action_id: actionId,
      placeholder: {
        type: "plain_text" as const,
        text: placeholder,
      },
      options: values.map(option),
    },
  };
}

function datePickerInput(blockId: string, actionId: string, label: string) {
  return {
    type: "input" as const,
    block_id: blockId,
    optional: true,
    label: {
      type: "plain_text" as const,
      text: label,
    },
    element: {
      type: "datepicker" as const,
      action_id: actionId,
      placeholder: {
        type: "plain_text" as const,
        text: "YYYY-MM-DD",
      },
    },
  };
}

export async function openIntakeModal(payload: SlackCommandPayload) {
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    throw new Error("Missing SLACK_BOT_TOKEN");
  }

  if (!payload.trigger_id) {
    throw new Error("Missing Slack trigger_id");
  }

  const response = await fetch("https://slack.com/api/views.open", {
    method: "POST",
    headers: {
      authorization: `Bearer ${botToken}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      trigger_id: payload.trigger_id,
      view: {
        type: "modal",
        callback_id: SLACK_MODAL_CALLBACK_ID,
        private_metadata: JSON.stringify({
          userId: payload.user_id ?? "",
          userName: payload.user_name ?? "",
          channelId: payload.channel_id ?? "",
          channelName: payload.channel_name ?? "",
          teamId: payload.team_id ?? "",
          teamDomain: payload.team_domain ?? "",
          command: payload.command ?? "",
        }),
        title: {
          type: "plain_text",
          text: "New Intake",
        },
        submit: {
          type: "plain_text",
          text: "Submit",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          plainTextInput(
            SLACK_MODAL_FIELDS.title.blockId,
            SLACK_MODAL_FIELDS.title.actionId,
            "Request Title",
            {
              initialValue: payload.text?.trim() || undefined,
              placeholder: "Short summary of the request",
            }
          ),
          plainTextInput(
            SLACK_MODAL_FIELDS.description.blockId,
            SLACK_MODAL_FIELDS.description.actionId,
            "Description",
            {
              multiline: true,
              placeholder: "What is needed, context, and any important details",
            }
          ),
          staticSelectInput(
            SLACK_MODAL_FIELDS.department.blockId,
            SLACK_MODAL_FIELDS.department.actionId,
            "Department",
            DEPARTMENT_OPTIONS,
            "Select a department"
          ),
          staticSelectInput(
            SLACK_MODAL_FIELDS.priority.blockId,
            SLACK_MODAL_FIELDS.priority.actionId,
            "Priority",
            PRIORITY_OPTIONS,
            "Select a priority"
          ),
          staticSelectInput(
            SLACK_MODAL_FIELDS.requestType.blockId,
            SLACK_MODAL_FIELDS.requestType.actionId,
            "Request Type",
            REQUEST_TYPE_OPTIONS,
            "Select a request type"
          ),
          datePickerInput(
            SLACK_MODAL_FIELDS.dueDate.blockId,
            SLACK_MODAL_FIELDS.dueDate.actionId,
            "Due Date"
          ),
          plainTextInput(
            SLACK_MODAL_FIELDS.requesterEmail.blockId,
            SLACK_MODAL_FIELDS.requesterEmail.actionId,
            "Requester Email",
            {
              optional: true,
              placeholder: "name@company.com",
            }
          ),
        ],
      },
    }),
  });

  const data = (await response.json()) as SlackApiSuccessResponse | SlackApiErrorResponse;

  if (!response.ok || !data.ok) {
    const errorMessage = "error" in data ? data.error : undefined;
    throw new Error(`Slack views.open failed${errorMessage ? `: ${errorMessage}` : ""}`);
  }
}
