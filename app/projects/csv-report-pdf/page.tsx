import Link from "next/link";
import { ArrowLeft, Download, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pdfSections = [
  {
    title: "Summary",
    description: "Rows processed, rows fixed, warnings, and any rows skipped.",
  },
  {
    title: "Column stats",
    description: "Missing percentage, unique counts, and quick win suggestions.",
  },
  {
    title: "Potential misalignment",
    description: "Highlights suspect data like out-of-range amounts or mismatched enums.",
  },
  {
    title: "Sample of fixed rows",
    description: "Before/after rows so stakeholders can see what changed.",
  },
];

const pythonFlow = [
  "Parse CSV with pandas, normalize headers, and coerce types.",
  "Validate rows with a lightweight schema + custom business rules.",
  "Aggregate stats + “misalignment” findings.",
  "Render a polished PDF via ReportLab (same template every time).",
  "Optionally dump a cleaned CSV for downstream tools.",
];

export default function CsvReportPdfProject() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <nav className="flex gap-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          ← Home
        </Link>
        <span aria-hidden="true">•</span>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </nav>

      <header className="space-y-4 text-left">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
          <Sparkles className="size-4" />
          Automations / Reporting
        </p>
        <h1 className="text-4xl font-bold">CSV → Clean Report PDF</h1>
        <p className="text-lg text-gray-600">
          A tiny Python assembly line that ingests a CSV, cleans it, and spits out an
          impressive PDF artifact (plus a cleaned CSV). Great as a “Download report”
          CTA when you want to prove the pipeline can reason about data—not just
          render UI.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/samples/csv-report/orders.csv">
            <Button className="rounded-full">
              <Download className="size-4" />
              Grab sample CSV
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="size-4" />
              Back to projects
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {pdfSections.map((section) => (
          <Card key={section.title} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 space-y-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Python core</h2>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-3 text-gray-700">
            <p>
              The whole thing stays in Python so deployment is simple—pandas for data,
              pydantic-esque validators, and ReportLab for the PDF canvas.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              {pythonFlow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sample report values</h2>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-4 text-sm text-gray-600">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                  Summary
                </p>
                <p>Rows processed: 1,000</p>
                <p>Rows fixed: 78</p>
                <p>Warnings: 6</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                  Column stats (Amount)
                </p>
                <p>Missing: 2.4%</p>
                <p>Unique values: 356</p>
                <p>Out-of-range detections: 4</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                Potential misalignment
              </p>
              <ul className="list-disc list-inside">
                <li>3 rows with “completed” status but zero amount</li>
                <li>12 rows missing ISO-formatted timestamps</li>
                <li>5 rows with uppercase country codes that don’t match ISO-2</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
                Fixed rows preview
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">Order ID</th>
                      <th className="p-2 border">Before</th>
                      <th className="p-2 border">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">1043</td>
                      <td className="p-2 border">amount=&ldquo;TBD&rdquo;</td>
                      <td className="p-2 border">amount=0 (flagged)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">1109</td>
                      <td className="p-2 border">country=USA</td>
                      <td className="p-2 border">country=US</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">1188</td>
                      <td className="p-2 border">status=done</td>
                      <td className="p-2 border">status=completed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Website angle</h2>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 space-y-3 text-gray-600">
            <p>
              Embed the tool behind a CTA (“Drop a CSV, get a PDF”). Using the sample
              data keeps onboarding lightweight, and the downloaded PDF doubles as a
              portfolio artifact that looks enterprise-ready.
            </p>
            <div className="rounded-xl bg-gray-50 p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="size-4" />
                Artifacts produced
              </div>
              <ul className="list-disc list-inside">
                <li>PDF report (ReportLab)</li>
                <li>Cleaned CSV with normalized headers + patched rows</li>
                <li>JSON payload for dashboards (optional)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
