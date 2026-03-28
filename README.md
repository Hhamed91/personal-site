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
- a Slack slash-command intake endpoint with optional incoming-webhook confirmation

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
- Slack slash command
  Accepts structured intake from Slack and persists it through the same validation, normalization, dedupe, and AI triage pipeline.

The canonical request record preserves:

- original source values
- normalized values
- AI outputs
- final values after manual override
- validation warnings
- import history and audit events

## Slack Intake Setup

Slack incoming webhooks are outbound only: they post messages from your app into Slack. They do not let Slack submit intake into your app. For Slack-originated intake, use a slash command or shortcut, and optionally use an incoming webhook to post confirmation back into Slack.

This project includes:

- `POST /api/slack/commands`
  Signed slash-command endpoint for Slack intake submissions.
- optional `SLACK_INCOMING_WEBHOOK_URL`
  Posts a confirmation message back to Slack after a request is created.

Required environment variables:

```bash
SLACK_SIGNING_SECRET=...
SLACK_INCOMING_WEBHOOK_URL=...
```

Recommended Slack app setup:

1. In Slack app settings, enable Incoming Webhooks and create a webhook for your intake-confirmation channel.
2. Create a slash command such as `/intake`.
3. Set its Request URL to `https://<your-public-host>/api/slack/commands`.
4. Reinstall the app after changing scopes or features.

Command format:

```text
/intake Title | description | dept=Marketing | type=New Content | priority=High | due=2026-04-15 | notes=Launch blocker
```

The endpoint verifies Slack signatures, parses the command text into canonical intake fields, stores the request, and optionally posts a confirmation message via incoming webhook.

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
