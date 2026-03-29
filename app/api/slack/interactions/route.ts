import { NextResponse } from "next/server";

import { sendAirtableWebhook } from "@/lib/airtable/sendWebhook";
import {
  mapSubmissionToAirtable,
  type SlackViewSubmissionPayload,
} from "@/lib/slack/mapSubmissionToAirtable";
import { SLACK_MODAL_CALLBACK_ID } from "@/lib/slack/intake";
import { verifySlackSignature } from "@/lib/slack/verifySlackSignature";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret) {
    return NextResponse.json({ error: "Missing SLACK_SIGNING_SECRET" }, { status: 500 });
  }

  const isValid = verifySlackSignature({
    body: rawBody,
    timestamp: request.headers.get("x-slack-request-timestamp"),
    signature: request.headers.get("x-slack-signature"),
    signingSecret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid Slack signature" }, { status: 401 });
  }

  const formData = new URLSearchParams(rawBody);
  const payloadParam = formData.get("payload");

  if (!payloadParam) {
    return NextResponse.json({ error: "Missing Slack payload" }, { status: 400 });
  }

  let payload: SlackViewSubmissionPayload;

  try {
    payload = JSON.parse(payloadParam) as SlackViewSubmissionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid Slack payload" }, { status: 400 });
  }

  if (payload.type !== "view_submission" || payload.view.callback_id !== SLACK_MODAL_CALLBACK_ID) {
    return new NextResponse("", { status: 200 });
  }

  try {
    const airtablePayload = mapSubmissionToAirtable(payload);
    await sendAirtableWebhook(airtablePayload);

    return NextResponse.json(
      {
        response_action: "update",
        view: {
          type: "modal",
          callback_id: "intake_modal_submitted",
          clear_on_close: true,
          notify_on_close: false,
          title: {
            type: "plain_text",
            text: "Submitted",
          },
          close: {
            type: "plain_text",
            text: "Close",
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Your intake request was sent to the Airtable workflow.",
              },
            },
          ],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Slack interaction processing failed", error);

    return NextResponse.json(
      {
        response_action: "errors",
        errors: {
          request_title: "Submission failed. Please try again in a moment.",
        },
      },
      { status: 200 }
    );
  }
}
