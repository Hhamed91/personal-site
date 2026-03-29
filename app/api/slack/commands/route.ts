import { NextResponse } from "next/server";

import type { SlackCommandPayload } from "@/lib/slack/intake";
import { openIntakeModal } from "@/lib/slack/openIntakeModal";
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

  const payload = Object.fromEntries(new URLSearchParams(rawBody)) as SlackCommandPayload & {
    ssl_check?: string;
  };

  if (payload.ssl_check === "1") {
    return new NextResponse("", { status: 200 });
  }

  try {
    await openIntakeModal(payload);
    return new NextResponse("", { status: 200 });
  } catch (error) {
    console.error("Slack modal open failed", error);
    return NextResponse.json(
      {
        response_type: "ephemeral",
        text: "Unable to open the intake modal right now.",
      },
      { status: 200 }
    );
  }
}
