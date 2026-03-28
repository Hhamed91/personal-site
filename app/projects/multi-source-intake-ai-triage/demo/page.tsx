import Link from "next/link";

import IntakeDemo from "@/components/intake/IntakeDemo";

export default function IntakeDemoPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#ffffff_55%,_#fff7ed_100%)]">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-12">
        <nav className="flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <Link href="/projects/multi-source-intake-ai-triage" className="hover:underline">
            Intake project
          </Link>
        </nav>

        <IntakeDemo />
      </div>
    </main>
  );
}
