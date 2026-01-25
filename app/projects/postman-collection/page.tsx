import Link from "next/link";

import PostmanExplorer from "@/components/postman/PostmanExplorer";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://personal-site-ten-delta-48.vercel.app";
const COLLECTION_GITHUB_URL =
  "https://github.com/Hhamed91/personal-site/blob/main/postman/personal-site-public-api.postman_collection.json";
const ENVIRONMENT_GITHUB_URL =
  "https://github.com/Hhamed91/personal-site/blob/main/postman/personal-site-public-api.postman_environment.json";
const RUN_IN_POSTMAN_URL =
  "https://www.postman.com/run-collection/50690739-2bb3e133-7fe4-4bee-ba03-69329e607efe?env[base_url]=https://personal-site-ten-delta-48.vercel.app";
const GITHUB_REPO_URL = "https://github.com/Hhamed91/personal-site";
const COLLECTION_REPO_URL =
  "https://github.com/Hhamed91/personal-site-postman-collection";
const POSTMAN_README_URL =
  "https://github.com/Hhamed91/personal-site/blob/main/postman/README.md";

export default function PostmanCollectionPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#ffffff_60%)]">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <nav className="text-sm text-gray-500 flex flex-wrap gap-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
        </nav>

        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Public API + docs
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Personal Site Public API + Postman Collection
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            A clean, read-only API paired with a Postman collection that makes
            it easy to explore blogs and projects without authentication. The
            focus is clarity, documentation, and fast onboarding.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
            <p>
              All site changes are hosted in:{" "}
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:underline"
              >
                {GITHUB_REPO_URL}
              </a>
            </p>
            <p className="mt-2">
              The Postman collection repo is:{" "}
              <a
                href={COLLECTION_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:underline"
              >
                {COLLECTION_REPO_URL}
              </a>
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                What this project demonstrates
              </h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Clear public API boundaries with consistent schemas.</li>
                <li>Human-friendly documentation and usage steps.</li>
                <li>Postman collection design with examples and variables.</li>
                <li>Fast onboarding for developers exploring the site.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                API overview
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-700">Base URL</p>
                  <p className="mt-1">{BASE_URL}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-700">Health</p>
                  <p className="mt-1">GET /api/health</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-700">Blogs</p>
                  <p className="mt-1">GET /api/blogs</p>
                  <p>GET /api/blogs/&lbrace;slug&rbrace;</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-700">Projects</p>
                  <p className="mt-1">GET /api/projects</p>
                  <p>GET /api/projects/&lbrace;id&rbrace;</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                How to use
              </h2>
              <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                <li>Import the collection JSON into Postman.</li>
                <li>Set the <code>base_url</code> environment variable.</li>
                <li>Run the Blogs folder to preview metadata and content.</li>
                <li>Run the Projects folder to explore project details.</li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={COLLECTION_GITHUB_URL} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-full">
                    View collection JSON
                  </Button>
                </Link>
                <Link href={ENVIRONMENT_GITHUB_URL} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-full">
                    View environment JSON
                  </Button>
                </Link>
                <Link href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-full">
                    GitHub repo
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Download the Postman assets
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Grab the collection and environment files, or use the Postman
                run button once the collection is published.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/postman/personal-site-public-api.postman_collection.json">
                  <Button className="rounded-full">Download Collection</Button>
                </Link>
                <Link href="/postman/personal-site-public-api.postman_environment.json">
                  <Button variant="outline" className="rounded-full">
                    Download Environment
                  </Button>
                </Link>
              </div>
              <div className="mt-4">
                <a href={RUN_IN_POSTMAN_URL} target="_blank" rel="noreferrer">
                  <img
                    src="https://run.pstmn.io/button.svg"
                    alt="Run in Postman"
                  />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Usage instructions
              </h2>
              <p className="text-sm text-slate-600">
                All endpoints are public, read-only, and JSON-only. Use the
                collection examples as a reference for expected response
                schemas, status codes, and pagination metadata.
              </p>
              <div className="mt-4">
                <a
                  href={POSTMAN_README_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-sky-600 hover:underline"
                >
                  Read the Postman README
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                API reference quick links
              </h2>
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  Postman collections:{" "}
                  <a
                    href="https://learning.postman.com/docs/collections/use-collections/create-collections/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Documentation
                  </a>
                </p>
                <p>
                  Run in Postman button:{" "}
                  <a
                    href="https://learning.postman.com/docs/publishing-your-api/run-in-postman/creating-run-button/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Documentation
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <PostmanExplorer />
      </div>
    </main>
  );
}
