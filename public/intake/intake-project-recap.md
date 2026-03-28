# Multi-Source Intake & AI Triage Project Recap

## Overview

This project was built as a portfolio-ready demo for a personal website. The goal was to show practical product and engineering thinking around intake operations, data normalization, AI-assisted triage, and workflow design for an operations/content team.

The final output was not meant to be an Airtable clone. It was designed to feel like a thoughtful, production-style system demo that is easy to walk through in an interview.

## What The Ask Was

The original brief called for a polished project page plus a working demo application that could:

- ingest requests from multiple messy sources
- normalize them into a canonical request model
- store both raw and canonical data
- validate, map, deduplicate, and enrich requests
- apply AI-assisted triage
- support role-based workflow views
- tell a clear story about product decisions, tradeoffs, and recommended next steps

The requested intake sources were:

- webhook intake
- CSV import
- native internal form

Later, Slack was added as an additional intake path.

## What Was Built

The project was implemented in the existing personal site stack using:

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite for local/demo persistence

The system now includes:

- a portfolio project overview page
- a live demo page
- a canonical request schema with related entities
- ingestion logic for webhook, CSV, form, and Slack command intake
- normalization and validation utilities
- duplicate detection
- AI triage through a clean abstraction with deterministic demo behavior
- role-based views for triage manager, contributor, and stakeholder workflows
- sample data, sample webhook payloads, and sample CSV files

## Architecture Summary

The implementation separates UI from business logic so the project is easy to explain and extend.

Key areas:

- `app/projects/multi-source-intake-ai-triage/*` for the portfolio page and demo routes
- `components/intake/*` for the front-end UI
- `lib/intake/*` for normalization, validation, importers, dedupe, AI, persistence, and demo state
- `lib/slack/*` for Slack signature verification and command parsing
- `prisma/*` for schema and seed data
- `public/intake/*` for demo assets

The intake flow is:

Raw input -> validation -> field mapping -> normalization -> deduplication -> AI triage -> canonical request record

## What Was Done

### 1. Multi-source intake

Implemented intake paths for:

- webhook simulator with intentionally inconsistent payloads
- CSV import with sample file support and row-level results
- internal form for native intake
- Slack slash command as an additional intake source

Each path feeds into the same canonical processing flow.

### 2. Canonical data model

Designed a schema with more than one table so the demo shows realistic system modeling rather than a flat toy table.

Core entities include:

- requests
- source records
- ingestion runs
- request events
- departments
- request types
- users
- triage results
- assignments

The system keeps both:

- raw input payloads
- normalized canonical request records

### 3. Validation and normalization

Built utilities to handle:

- inconsistent department values like `Mktg`, `CS`, and `Cust Success`
- inconsistent request type naming and casing
- mixed date formats
- missing values
- fallback handling for missing priority
- email cleanup
- suspicious-record warnings
- duplicate detection based on overlapping title, submitter, and timing patterns

### 4. AI triage

Created a clean AI service layer that can support a real provider later. For the demo, the triage logic is deterministic and explainable.

Outputs include:

- AI summary
- predicted department
- predicted request type
- predicted priority
- confidence score
- rationale

The UI highlights low-confidence records and supports human override behavior in the workflow.

### 5. Role-based workflows

Built persona views for:

- Team Lead / Triage Manager
- Individual Contributor
- Stakeholder / Requestor

These views present different slices of the same request system in a way that reflects real operating workflows.

### 6. Portfolio storytelling

Added a project page that explains:

- the business problem
- architecture
- data model
- ingestion design
- AI triage approach
- workflow rationale
- product recommendations
- tradeoffs considered

## Issues Encountered And Fixes

### 1. Environment and package setup friction

There were setup issues around `pnpm` availability and Homebrew lock contention. The workable path ended up being using the existing `nvm` Node installation and Corepack-managed `pnpm` instead of forcing a separate global install.

Fix:

- used the Node binary from `~/.nvm/...`
- enabled Corepack
- activated `pnpm` through Corepack

### 2. Prisma schema engine failures

Prisma initially failed during `db push` with a generic schema engine error. The schema itself validated, so the issue was not the data model.

Fix:

- generated the client successfully
- isolated the problem to local SQLite creation/runtime behavior
- got the database initialized and then completed `prisma db push` and `prisma db seed`

### 3. TypeScript and build issues

A few strict typing and missing import problems surfaced during testing and build verification.

Examples:

- a missing icon import on the project page
- union access issues in intake demo state and webhook sample handling
- Prisma JSON typing issues in the seed script

Fix:

- tightened types in the intake data flow
- corrected discriminated union handling
- fixed the missing import
- aligned seed data with Prisma JSON expectations

### 4. Local build limitations

One local `pnpm build` run failed due to sandboxed network access when fetching Google Fonts. This was not an application logic failure.

Fix:

- confirmed the route and app code were valid
- treated the Google Fonts failure as an environment limitation rather than a project defect

### 5. Slack slash command timeout in production

The Slack slash command created requests successfully, but Slack still showed:

`/intake failed because the app did not respond`

This pointed to a response-time issue rather than a parsing or signature issue.

Root cause:

- Slack requires a fast acknowledgment
- the route still loaded heavier persistence code on cold start
- Vercel startup cost could exceed Slack's timeout window even if the request eventually completed

Fix:

- changed the Slack route to acknowledge immediately
- moved the heavier persistence work into a background step
- lazy-loaded the Prisma-backed persistence path inside the background task
- kept Slack signature verification in the lightweight request path

## What I Learned

### 1. Good demos still need production-minded boundaries

Even though this was a portfolio project, it benefited from real separation of concerns:

- ingestion
- normalization
- validation
- AI classification
- persistence
- persona-based UI

That made the project easier to explain and easier to fix when issues surfaced.

### 2. Intake systems are mostly about messy reality

The most interesting part was not rendering a table. It was showing how inconsistent operational inputs can be cleaned up, interpreted, and routed in a defensible way.

### 3. AI is more useful as an assistive layer than a magical answer

The strongest implementation pattern here was AI plus confidence plus human override, not AI-only automation.

### 4. External integrations fail at the edges

The Slack timeout issue reinforced that successful integrations are often more about operational details like response timing, signatures, retries, and environment behavior than about core business logic.

## Nice-To-Have Feature Enhancements

If this project were extended, the next valuable additions would be:

- Slack shortcut + modal intake instead of slash-command text parsing
- import run history UI with drill-down into row-level issues
- audit trail for manual overrides and assignment changes
- richer timeline view per request
- source-to-canonical mapping inspector for debugging transformations
- saved triage filters and queue presets
- notification rules for overdue, urgent, or low-confidence requests
- real AI provider integration behind the existing abstraction
- authentication and true role-based access controls
- analytics for intake volume, turnaround time, duplicate rate, and override rate

## Final Takeaway

This project ended up demonstrating more than front-end polish. It shows practical thinking across:

- systems design
- data modeling
- ingestion architecture
- validation and normalization
- AI-assisted operations workflows
- role-based UX
- production tradeoffs

That makes it useful both as a portfolio piece and as a concrete interview walkthrough.
