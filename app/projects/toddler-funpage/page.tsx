import Link from "next/link";
import { Archive, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Color Surprise",
    description:
      "The first card in the set. Tap it and it cycles through colors with cheerful copy that keeps toddlers engaged.",
    status: "Shipped",
  },
  {
    title: "Animal Sounds",
    description:
      "Coming up next: buttons that trigger quick animal sounds and matching emojis for sensory feedback.",
    status: "In progress",
  },
  {
    title: "Shape Builder",
    description:
      "Drag simple blocks to build a shape. Exploring pointer events + physics-lite interactions.",
    status: "Backlog",
  },
];

export default function ToddlerFunpageProject() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6 space-y-10">
      <nav className="text-sm text-gray-500 flex gap-4">
        <Link href="/" className="hover:underline">
          ← Home
        </Link>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4" />
            Fun Projects / Playground
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold text-gray-600">
            <Archive className="size-3" />
            Archived
          </span>
        </div>
        <h1 className="text-4xl font-bold">Toddler Funpage</h1>
        <p className="text-lg text-gray-600">
          A playful multi-card interface where toddlers can tap through short,
          interactive experiences. Built as a running log of UI patterns geared
          toward delightful micro-interactions.
        </p>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The live demo is archived because the Replit free plan expired and the
          hosted app was shut down.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" disabled>
            Demo archived
          </Button>
          <Link href="/projects">
            <Button variant="outline" className="rounded-full">
              Back to projects
            </Button>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Why build it?</h2>
        <p className="text-gray-600">
          I wanted a sandbox to prototype calm, low-stakes interactions. Instead
          of a single polished experience, this page grows card-by-card. Each
          card experiments with motion, audio, or tactile feedback that feels
          intuitive for toddlers (and fun for adults poking around).
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Card roadmap</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.title} className="rounded-2xl border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                  <span>{card.status}</span>
                  <span>Card concept</span>
                </div>
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Status</h2>
        <p className="text-gray-600">
          This project is archived for now. If I relaunch it on a new hosting
          plan, I&apos;ll reopen the demo and expand the card set.
        </p>
      </section>
    </main>
  );
}
