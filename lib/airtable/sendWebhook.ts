import type { AirtableWebhookPayload } from "@/lib/slack/mapSubmissionToAirtable";

export async function sendAirtableWebhook(payload: AirtableWebhookPayload) {
  const webhookUrl = process.env.AIRTABLE_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Missing AIRTABLE_WEBHOOK_URL");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Airtable webhook failed with ${response.status}: ${responseText}`);
  }
}
