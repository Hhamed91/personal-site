import ProjectsList from "@/components/projects/ProjectsList";
import { projects } from "@/lib/projects";

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

      <ProjectsList projects={projects} />
    </main>
  );
}
