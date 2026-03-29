# Personal Site

This repository powers the personal site and includes a portfolio demo called `Multi-Source Intake & AI Triage System`.

## Project Purpose

The intake demo is designed to show practical product and systems thinking for a mid-size operations/content team. It demonstrates how to:

- ingest requests from multiple messy sources
- normalize them into a canonical model
- preserve raw payloads for debugging and trust
- enrich records with AI-assisted triage
- expose different workflow views by persona

The portfolio artifact includes:

- a project overview page at `/projects/multi-source-intake-ai-triage`
- an interactive demo at `/projects/multi-source-intake-ai-triage/demo`
- Prisma + SQLite schema and seed data
- sample webhook payloads and a partner CSV import
- a Slack slash-command + modal intake backend that forwards into Airtable

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

## Setup

1. Install dependencies.

```bash
pnpm install
```

2. Add a local database URL.

```bash
DATABASE_URL="file:./dev.db"
```

3. Generate Prisma client and create the database.

```bash
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

4. Start the app.

```bash
pnpm dev
```

Open `http://localhost:3000/projects/multi-source-intake-ai-triage`.

## Architecture

Core domain logic:

- `lib/intake/importers.ts`
  Source-specific adapters for webhook, CSV, and form intake.
- `lib/intake/validation.ts`
  Required-field checks and warning generation.
- `lib/intake/normalization.ts`
  Department, type, priority, email, and date normalization.
- `lib/intake/dedupe.ts`
  Duplicate detection using normalized title + submitter + submitted date.
- `lib/intake/ai.ts`
  Deterministic AI triage abstraction returning summary, routing, priority, confidence, and rationale.
- `lib/intake/demo-state.ts`
  Seeded state built through the same import pipeline used by the demo.

Persistence:

- `prisma/schema.prisma`
  Canonical schema for `Request`, `SourceRecord`, `IngestionRun`, `Department`, `RequestType`, `User`, `TriageResult`, `Assignment`, and `RequestEvent`.
- `prisma/seed.ts`
  Seeds the database from the demo fixtures.

UI:

- `app/projects/multi-source-intake-ai-triage/page.tsx`
  Project storytelling page.
- `app/projects/multi-source-intake-ai-triage/demo/page.tsx`
  Interactive demo page.
- `components/intake/*`
  Architecture diagram, live snapshot, and demo interface.

## How Ingestion Works

Every source follows the same pipeline:

`Raw Input -> Validation -> Mapping -> Normalization -> Deduplication -> Canonical Request`

Sources:

- Webhook simulator
  Handles intentionally inconsistent JSON payloads from a fake PM tool.
- CSV importer
  Parses batch uploads and returns row-level statuses: imported, warning, failed, duplicate.
- Native form
  Represents the structured internal path while still using the same downstream pipeline.
- Slack slash command + modal
  Captures intake in Slack, then posts a normalized webhook payload into Airtable automation for downstream intake, normalization, and AI triage.

The canonical request record preserves:

- original source values
- normalized values
- AI outputs
- final values after manual override
- validation warnings
- import history and audit events

## Slack Intake Setup

This project exposes two signed Slack backend routes:

- `POST /api/slack/commands`
  Verifies the slash-command request and opens the intake modal with `views.open`.
- `POST /api/slack/interactions`
  Verifies modal submissions, maps the form into the Airtable automation payload, and posts it to your Airtable webhook.

Required environment variables:

```bash
SLACK_SIGNING_SECRET=...
SLACK_BOT_TOKEN=...
AIRTABLE_WEBHOOK_URL=...
```

Optional environment variables kept for future Slack app expansion:

```bash
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
```

Slack app configuration:

1. Create a Slack app for the demo workspace.
2. Under `Slash Commands`, create `/intake`.
3. Set the slash command Request URL to `https://<your-domain>/api/slack/commands`.
4. Under `Interactivity & Shortcuts`, enable interactivity.
5. Set the Interactivity Request URL to `https://<your-domain>/api/slack/interactions`.
6. Under `OAuth & Permissions`, add the bot token scope `commands`.
7. Install or reinstall the app to the workspace and copy the bot token and signing secret into Vercel env vars.

Airtable automation setup:

1. Create an Airtable automation with trigger `When webhook received`.
2. Copy the generated webhook URL into `AIRTABLE_WEBHOOK_URL`.
3. Map the incoming JSON into your existing Airtable intake / normalization / AI triage automation.
4. Expect a payload shaped like:

```json
{
  "subject": "Request Title",
  "body": "Description",
  "submitted_by": "Slack user display name",
  "contact_email": "requester@example.com",
  "dept": "Marketing",
  "urgency": "High",
  "category_tag": "New Content",
  "ticket_status": "Open",
  "target_date": "2026-04-15",
  "source_system": "Slack",
  "event_type": "request.created"
}
```

Local testing:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then expose the app publicly for Slack, for example with a tunnel, and configure:

- Slash command URL: `https://<public-url>/api/slack/commands`
- Interactivity URL: `https://<public-url>/api/slack/interactions`

Flow summary:

`/intake` in Slack -> signed request to `/api/slack/commands` -> modal opens -> signed `view_submission` to `/api/slack/interactions` -> mapped JSON POST to Airtable webhook -> existing Airtable workflow continues downstream.

## How AI Triage Works

The demo uses a deterministic classifier instead of a live provider so the artifact stays reproducible and interview-friendly. The AI layer returns:

- summary
- predicted department
- predicted request type
- predicted priority
- confidence score
- rationale

The service boundary is intentionally clean so a real provider can replace it later without rewriting UI components.

## Tradeoffs

- SQLite keeps the demo easy to run locally; the Prisma schema can move to Postgres later.
- AI is deterministic for consistency and explainability, not realism.
- Persona views are simulated in the interface instead of auth-gated to keep the project self-contained.

## Sample Data

Seeded requests include:

- blog post request
- case study request
- translation request
- product changelog
- compliance checklist
- dashboard mockup
- API auth docs rewrite
- webinar invite copy
- customer win announcement
- duplicate submission example

Sample assets:

- `public/intake/sample-partner-upload.csv`
- `public/intake/webhook-samples/*.json`

## Demo Script

Use this walkthrough in interviews:

1. Start on the project overview page and frame the operational problem: fragmented intake causes duplicates, inconsistent metadata, and weak trust in the queue.
2. Walk through the architecture and explain why both raw source records and canonical requests are preserved.
3. Launch the demo and send a webhook payload to show source-specific mapping.
4. Load the sample CSV to show row-level import results, warnings, and duplicate detection.
5. Switch to the team lead view and apply a manual override on a low-confidence request.
6. Switch to contributor and stakeholder personas to show how the same canonical data supports different workflows.
7. End with the Slack-first intake recommendation and the proposed future architecture.
