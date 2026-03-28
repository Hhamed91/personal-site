import { after, NextResponse } from "next/server";

import { buildSlackMappedInput, formatSlackUsageHint } from "@/lib/slack/intake";
import { verifySlackRequest } from "@/lib/slack/signature";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slackJson(message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      response_type: "ephemeral",
      text: message,
      ...extra,
    },
    { status: 200 }
  );
}

async function postSlackConfirmation(message: string) {
  const webhookUrl = process.env.SLACK_INCOMING_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
}

async function postToResponseUrl(responseUrl: string | undefined, message: string) {
  if (!responseUrl) return;

  await fetch(responseUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      response_type: "ephemeral",
      replace_original: false,
      text: message,
    }),
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret) {
    return NextResponse.json({ error: "Missing SLACK_SIGNING_SECRET" }, { status: 500 });
  }

  const isValid = verifySlackRequest({
    body: rawBody,
    timestamp: request.headers.get("x-slack-request-timestamp"),
    signature: request.headers.get("x-slack-signature"),
    signingSecret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid Slack signature" }, { status: 401 });
  }

  const payload = Object.fromEntries(new URLSearchParams(rawBody));

  if (payload.ssl_check === "1") {
    return new NextResponse("", { status: 200 });
  }

  if (!payload.text?.trim()) {
    return slackJson(`Missing intake details. ${formatSlackUsageHint()}`);
  }

  const mappedInput = buildSlackMappedInput(payload);
  const responseUrl = payload.response_url;

  after(async () => {
    try {
      const { persistMappedInput } = await import("@/lib/intake/persistence");
      const processed = await persistMappedInput(mappedInput, "Slack slash command");

      if (!processed.request) {
        await postToResponseUrl(
          responseUrl,
          `Slack intake was received but not imported. Status: ${processed.rowResult.status}.`
        );
        return;
      }

      const warningText =
        processed.rowResult.warnings.length > 0
          ? `Warnings: ${processed.rowResult.warnings.slice(0, 2).join("; ")}`
          : "No warnings.";

      const confirmationText = `Created ${processed.request.id}: ${processed.request.title}\n${processed.request.finalDepartment} · ${processed.request.finalRequestType} · ${processed.request.finalPriority}\n${warningText}`;

      await Promise.all([
        postToResponseUrl(responseUrl, confirmationText),
        postSlackConfirmation(
          `New intake request ${processed.request.id}: ${processed.request.title} (${processed.request.finalDepartment} / ${processed.request.finalRequestType} / ${processed.request.finalPriority})`
        ),
      ]);
    } catch (error) {
      console.error("Slack intake processing failed", error);
      await postToResponseUrl(
        responseUrl,
        "Slack intake was acknowledged, but processing failed on the server. Check app logs."
      );
    }
  });

  return slackJson("Processing your intake request...");
}
