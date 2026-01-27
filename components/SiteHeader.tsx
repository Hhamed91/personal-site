"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CommandKButton from "@/components/CommandKButton";
import BostonStatus from "@/components/BostonStatus";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-slate-200 bg-white/90">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <BostonStatus />

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "font-semibold text-slate-900"
                  : "hover:text-slate-900"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CommandKButton />
          <button
            type="button"
            className="md:hidden rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-3 text-sm text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href)
                    ? "font-semibold text-slate-900"
                    : "hover:text-slate-900"
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
