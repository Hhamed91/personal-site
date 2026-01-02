import Link from "next/link";
import { Hammer, HardHat, ArrowLeft, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TextToSqlInProgressPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 space-y-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-700 text-sm font-semibold">
        <HardHat className="size-4" />
        Construction zone
      </div>

      <header className="space-y-4">
        <h1 className="text-4xl font-bold">Text-to-SQL walkthrough incoming</h1>
        <p className="text-lg text-gray-600">
          I&apos;m currently wrangling agents, DuckDB, and way too many SELECT statements.
          Give me a moment to lay the bricks—no 404s, just honest WIP vibes.
        </p>
      </header>

      <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <Hammer className="size-16 text-gray-300" />
          </div>
          <p className="text-gray-600">
            The full build log will drop soon with schema planning, reward models, and
            all the glue code that usually gets skipped. Until then, you can peek at
            the Fireworks playbook I&apos;m following.
          </p>
          <Link
            href="https://docs.fireworks.ai/examples/text-to-sql"
            target="_blank"
            rel="noreferrer"
          >
            <Button className="rounded-full">
              View the reference doc
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/projects">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="size-4" />
            Back to projects
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="rounded-full">
            Return home
          </Button>
        </Link>
      </div>

      <p className="text-xs uppercase tracking-wide text-gray-400">
        ETA: as soon as the SQL stops hallucinating 😉
      </p>
    </main>
  );
}
