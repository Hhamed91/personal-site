import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowUpRight, Database, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";

type Project = {
  slug: string;
  title: string;
  description: ReactNode;
  highlights: string[];
  status: string;
  resourceLink?: {
    href: string;
    label: string;
    external?: boolean;
  };
};

const projects: Project[] = [
  {
    slug: "text-to-sql-in-progress",
    title: "Text-to-SQL RFT Demo - In progress",
    description:
      "Follow Fireworks AI's reinforcement fine-tuning playbook to turn natural language prompts into production-ready SQL.",
    highlights: ["Reinforcement FT", "DuckDB + MCP", "Synthetic data"],
    status: "Hands-on walkthrough",
    resourceLink: {
      href: "https://docs.fireworks.ai/examples/text-to-sql",
      label: "Fireworks doc",
      external: true,
    },
  },
  {
    slug: "toddler-funpage",
    title: "Toddler Funpage",
    description: (
      <>
        Multi-card playground for toddler-friendly interactions. There&apos;s only
        one card so far, and you can try it over on the
        {" "}
        <Link
          href="https://toddler-funpage--hazemhamed9191.replit.app/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Replit demo
        </Link>
        .
      </>
    ),
    highlights: ["Next.js", "Playful UI", "Micro-interaction"],
    status: "Prototype log",
  },
];

export default function ProjectsPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-10 space-y-3">
        <p className="text-sm uppercase tracking-wide text-gray-400">Build Logs</p>
        <h1 className="text-4xl font-bold">Projects & Experiments</h1>
        <p className="text-gray-600 max-w-2xl">
          I document every experiment end-to-end so you can replay it. Each card
          below expands into the exact steps, commands, and architecture notes I
          used—no mystery glue code.
        </p>
      </header>

      <div className="grid gap-6">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
              <span className="inline-flex items-center gap-1 font-semibold text-gray-500">
                <Workflow className="size-4" />
                Playbook
              </span>
              <span className="inline-flex items-center gap-1">
                <Database className="size-4" />
                {project.status}
              </span>
            </div>
            <h2 className="text-2xl font-semibold mt-4 mb-2">{project.title}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-6">
              {project.highlights.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/projects/${project.slug}`}>
                <Button className="rounded-full">
                  Open walkthrough
                  <ArrowUpRight className="size-4" />
                </Button>
              </Link>
              {project.resourceLink && (
                <Link
                  href={project.resourceLink.href}
                  target={project.resourceLink.external ? "_blank" : undefined}
                  rel={project.resourceLink.external ? "noreferrer" : undefined}
                >
                  <Button variant="outline" className="rounded-full">
                    {project.resourceLink.label}
                  </Button>
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
