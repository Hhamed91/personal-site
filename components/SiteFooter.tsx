import Link from "next/link";
import { ExternalLink, Github, Linkedin } from "lucide-react";

const LINKEDIN_URL = "https://www.linkedin.com/in/hazemhamed91/";
const GITHUB_URL = "https://github.com/Hhamed91";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col items-center gap-4">
        <p>Connect with me</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
          >
            <Linkedin className="size-4" aria-hidden="true" />
            <span>LinkedIn</span>
            <ExternalLink className="size-3 text-slate-400" aria-label="Opens in a new tab" />
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
          >
            <Github className="size-4" aria-hidden="true" />
            <span>GitHub</span>
            <ExternalLink className="size-3 text-slate-400" aria-label="Opens in a new tab" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
