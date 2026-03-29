# Slack Intake Demo Recap

## What We Built

This project now includes a hidden backend-only Slack intake integration inside the existing Next.js app deployed on Vercel.

Flow:

`Slack slash command -> Slack modal -> Next.js API routes -> Airtable webhook -> existing Airtable intake / normalization / AI triage workflow`

There is no visible frontend UI for this feature yet. The implementation is intentionally minimal and production-safe for demo purposes.

## Backend Routes

- `POST /api/slack/commands`
  Verifies the Slack request signature and opens the intake modal with Slack `views.open`.
- `POST /api/slack/interactions`
  Verifies the Slack request signature, parses the modal submission, maps fields into the Airtable webhook payload, and sends the request to Airtable.

## Slack Intake UX

Slash command:

`/intake`

Modal fields:

- Request Title
- Description
- Department
- Priority
- Request Type
- Due Date
- Requester Email

Validation:

- Title required
- Description required
- Due Date optional
- Requester Email optional

## Airtable Payload Mapping

Slack modal values are mapped into this payload shape:

```json
{
  "subject": "Request Title",
  "body": "Description",
  "submitted_by": "Slack user display name",
  "contact_email": "Requester Email",
  "dept": "Department",
  "urgency": "Priority",
  "category_tag": "Request Type",
  "ticket_status": "Open",
  "target_date": "Due Date",
  "source_system": "Slack",
  "event_type": "request.created"
}
```

## Environment Variables

Required:

```bash
SLACK_SIGNING_SECRET=...
SLACK_BOT_TOKEN=...
AIRTABLE_WEBHOOK_URL=...
```

Optional for future Slack expansion:

```bash
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
```

## Slack Configuration

Configured request URLs:

- Slash command URL:
  `https://personal-site-ten-delta-48.vercel.app/api/slack/commands`
- Interactivity URL:
  `https://personal-site-ten-delta-48.vercel.app/api/slack/interactions`

## Key Implementation Files

- `app/api/slack/commands/route.ts`
- `app/api/slack/interactions/route.ts`
- `lib/slack/verifySlackSignature.ts`
- `lib/slack/openIntakeModal.ts`
- `lib/slack/mapSubmissionToAirtable.ts`
- `lib/airtable/sendWebhook.ts`
- `lib/slack/intake.ts`

## What This Demonstrates

This is a strong interview artifact because it shows:

- backend integration work inside an existing product codebase
- secure Slack request verification
- clean API route design in Next.js App Router
- pragmatic event-driven architecture
- integration with Airtable automation instead of overbuilding a custom admin system
- a realistic intake path that feeds an existing normalization and AI triage workflow

## Demo Script

1. Explain the operational problem: requests often originate in Slack, but downstream teams need structured intake.
2. Show that the website contains hidden backend routes instead of a visible UI for this phase.
3. Trigger `/intake` in Slack.
4. Walk through the modal fields and submit a sample request.
5. Show the confirmation: `Your intake request was sent to the Airtable workflow.`
6. Open Airtable and show that the automation ran and the row was created.
7. Explain that Airtable is acting as the intake handoff into the broader normalization and AI triage workflow.

## Final Outcome

The integration is working end to end in production:

- Slack command works
- modal opens
- submission succeeds
- Airtable webhook fires
- Airtable automation runs
- request row is created
