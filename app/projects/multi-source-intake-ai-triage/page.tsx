import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Database,
  GitBranch,
  LayoutPanelLeft,
  MessageSquareMore,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import ArchitectureDiagram from "@/components/intake/ArchitectureDiagram";
import IntakeSnapshot from "@/components/intake/IntakeSnapshot";
import { Button } from "@/components/ui/button";

const schemaEntities = [
  "requests",
  "source_records",
  "ingestion_runs",
  "departments",
  "request_types",
  "users",
  "triage_results",
  "assignments",
  "request_events",
];

const productDecisions = [
  "Preserve both raw payloads and normalized records so debugging never depends on guesswork.",
  "Treat normalization and AI triage as separate layers so human operators can see which fields came from source mapping versus model inference.",
  "Bias the lead view toward exceptions: low confidence, duplicates, warnings, and urgent deadlines.",
  "Keep the demo deterministic with a mock AI provider abstraction so the architecture is interview-friendly and provider swap is trivial later.",
];

const tradeoffs = [
  "SQLite keeps the demo portable, but a real customer deployment would likely move the same Prisma schema to Postgres for concurrency and observability.",
  "The AI layer is deterministic by default to keep the portfolio artifact reproducible. That reduces realism compared with a live provider, but it improves explainability in an interview.",
  "The demo focuses on workflow depth over authentication. Personas are simulated instead of fully auth-gated to keep the project self-contained.",
];

export default function MultiSourceIntakeProjectPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#ffffff_50%,_#fff7ed_100%)]">
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <nav className="flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
        </nav>

        <header className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Portfolio Demo · Operations Systems</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Multi-Source Intake & AI Triage System
            </h1>
            <p className="max-w-3xl text-lg text-slate-600">
              A production-style demo for mid-size operations and content teams that consolidates messy requests from multiple channels, normalizes them into a canonical system of record, enriches them with AI, and exposes role-based workflow views for triage, execution, and visibility.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects/multi-source-intake-ai-triage/demo">
                <Button className="rounded-full">
                  Launch demo
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a
                href="https://github.com/hhamed91/personal-site"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              >
                View repo
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200">What this demonstrates</p>
            <div className="mt-5 grid gap-4">
              <Highlight icon={GitBranch} title="System design" description="Multiple source adapters, a canonical schema, and explicit pipeline stages." />
              <Highlight icon={Database} title="Data modeling" description="Raw source snapshots, normalized requests, triage outputs, runs, and audit events." />
              <Highlight icon={Bot} title="AI-assisted triage" description="Deterministic summary, routing, priority inference, and confidence-based review." />
              <Highlight icon={LayoutPanelLeft} title="Workflow UX" description="Different interfaces for triage managers, contributors, and stakeholders." />
            </div>
          </div>
        </header>

        <IntakeSnapshot />

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Problem</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Multi-channel intake sounds flexible until no one trusts the queue.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Operations and content teams often receive work through project-management tools, spreadsheet uploads, internal forms, and Slack threads. The result is predictable: duplicate submissions, inconsistent labels, missing priorities, and no shared definition of what a request actually is. This demo treats intake quality as a product problem, not just a form problem.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Why it matters</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">The value is operational clarity, not an Airtable clone.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The goal is to show how intake systems should absorb messy reality: retain source context, normalize what can be normalized, surface uncertainty where needed, and give each persona a view that matches the decisions they need to make.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Architecture</p>
            <h2 className="text-2xl font-semibold text-slate-900">A modular pipeline with explicit handoffs</h2>
            <p className="max-w-3xl text-sm text-slate-600">
              Intake sources map into a shared canonical model through validation, normalization, dedupe, and AI enrichment layers. The same records then power persona-specific workflow views without source-specific branching in the UI.
            </p>
          </div>
          <ArchitectureDiagram />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Data Model</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Canonical request plus supporting operational tables</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-3">
              {schemaEntities.map((entity) => (
                <div key={entity} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  {entity}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              The schema keeps both the original source record and the canonical request, which is critical for debugging mapping errors, explaining overrides, and building operator trust. Prisma + SQLite keeps the demo portable, while the schema shape stays ready for Postgres later.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ingestion Sources</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Three intentionally messy entry points</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <SourceCallout title="Webhook simulator" description="Simulates third-party PM payloads with variant keys like `task_name`, `subject`, and `cardTitle` plus mixed date formats and priority casing." />
              <SourceCallout title="CSV importer" description="Parses partner spreadsheet uploads, emits row-level statuses, and catches duplicates against the canonical request table." />
              <SourceCallout title="Native form" description="Represents the cleanest path, while still routing through the same validation, normalization, and AI layers." />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">AI Triage Design</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Swap-friendly service boundary, deterministic demo mode</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The AI layer predicts summary, department, request type, and priority from title, description, and notes. Confidence scores drive the review queue. The current demo uses a local deterministic classifier so the artifact stays reproducible, but the code is shaped so a live provider can replace it without changing the UI contract.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Role-Based Workflows</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Views optimized for decisions, not just data access</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <PersonaCallout icon={ShieldCheck} title="Team Lead / Triage Manager" description="Needs-review queue, low-confidence AI results, duplicate signals, and override controls." />
              <PersonaCallout icon={UserRound} title="Individual Contributor" description="Assigned work, due dates, and request context without triage noise." />
              <PersonaCallout icon={MessageSquareMore} title="Stakeholder / Requestor" description="Simple dashboard view of submitted requests, owners, and status progress." />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Key Product Decisions</p>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              {productDecisions.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tradeoffs Considered</p>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              {tradeoffs.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Slack Recommendation</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">What I would recommend to a real customer next</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <RecommendationStep
              title="Why intake is breaking down"
              description="Slack often contains the richest context first, but formal entry happens later in fragmented tools, which creates lag, duplicate submissions, and missing detail."
            />
            <RecommendationStep
              title="Recommended future architecture"
              description="Slack message shortcut → structured modal → intake API → source record created → canonical request + triage result → channel confirmation."
            />
            <RecommendationStep
              title="Implementation phases"
              description="Start with structured modals for high-volume teams, then add thread-to-request linking, automated reminders, and channel-specific analytics."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Recommendation</p>
          <h2 className="mt-3 text-3xl font-semibold">This is the kind of system I would pitch as an operational foundation, not just a workflow tool.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            For a real customer, I would prioritize cleaner intake contracts, a durable event history, explicit ownership rules, and a Slack-first front door. The system becomes more valuable as the team grows because it reduces queue ambiguity, accelerates triage, and preserves institutional context.
          </p>
          <div className="mt-6">
            <Link href="/projects/multi-source-intake-ai-triage/demo">
              <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
                Open working demo
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Highlight({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GitBranch;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-sky-200" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

function SourceCallout({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}

function PersonaCallout({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-slate-500" />
        <p className="font-medium text-slate-900">{title}</p>
      </div>
      <p className="mt-2">{description}</p>
    </div>
  );
}

function RecommendationStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
