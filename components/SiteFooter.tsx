import Link from "next/link";

const LINKEDIN_URL = "https://linkedin.com/in/YOUR_LINKEDIN";
const GITHUB_URL = "https://github.com/Hhamed91";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <p>Connect with me:</p>
        <div className="flex items-center gap-4">
          <Link href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </Link>
          <Link href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
