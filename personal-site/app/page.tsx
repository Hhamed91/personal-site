// This is a minimal Next.js 14+ App Router homepage component.
// Save as: app/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gray-50 p-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Hi, I'm Hazem 👋</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to my personal corner on the internet — where I share my projects,
          quick thoughts, and ways to reach me.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Link href="https://linkedin.com/in/hhamed91" target="_blank">
            <Button className="rounded-2xl shadow-md p-4 flex items-center gap-2">
              <Linkedin size={20} /> LinkedIn
            </Button>
          </Link>
          <Link href="https://github.com/hhamed91" target="_blank">
            <Button className="rounded-2xl shadow-md p-4 flex items-center gap-2">
              <Github size={20} /> GitHub
            </Button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">💡 Mini Blog</h2>
              <p className="text-gray-600 mb-4">
                Bite-sized posts on tech, experiments, and random learnings.
              </p>
              <Link href="/blog">
                <Button className="rounded-xl">Read Posts</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">🧪 Fun Projects</h2>
              <p className="text-gray-600 mb-4">
                Demos and prototypes I'm building for fun — AI, automation, or just cool hacks.
              </p>
              <Link href="/projects">
                <Button className="rounded-xl">View Projects</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </main>
  );
}
