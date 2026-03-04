"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CommandItem = {
  id: string;
  label: string;
  keywords: string[];
  action: () => void;
};

const OPEN_EVENT = "command-palette-open";

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export default function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const openPalette = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setIsMounted(true);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "home",
        label: "Go to Home",
        keywords: ["home", "index", "start"],
        action: () => router.push("/"),
      },
      {
        id: "blog",
        label: "Go to Blog",
        keywords: ["blog", "posts", "writing"],
        action: () => router.push("/blog"),
      },
      {
        id: "projects",
        label: "Go to project",
        keywords: ["projects", "work", "portfolio"],
        action: () => router.push("/projects"),
      },
      {
        id: "linkedin",
        label: "Open Linked",
        keywords: ["linkedin", "social", "profile"],
        action: () =>
          window.open(
            "https://www.linkedin.com/in/hazemhamed91/",
            "_blank",
            "noopener,noreferrer"
          ),
      },
      {
        id: "github",
        label: "open Github",
        keywords: ["github", "code", "repo"],
        action: () =>
          window.open(
            "https://github.com/Hhamed91",
            "_blank",
            "noopener,noreferrer"
          ),
      },
    ],
    [router]
  );

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;
    return commands.filter((command) => {
      const labelMatch = command.label.toLowerCase().includes(normalizedQuery);
      const keywordMatch = command.keywords.some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery)
      );
      return labelMatch || keywordMatch;
    });
  }, [commands, query]);

  useEffect(() => {
    itemRefs.current = [];
  }, [filteredCommands]);

  useEffect(() => {
    const handleOpenEvent = () => {
      openPalette();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      const modifier = isMacPlatform() ? event.metaKey : event.ctrlKey;
      if (modifier && isK) {
        event.preventDefault();
        openPalette();
      }
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener(OPEN_EVENT, handleOpenEvent);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpenEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, openPalette]);

  const closePalette = () => {
    setIsOpen(false);
    setQuery("");
  };

  const handleSelect = (index: number) => {
    const selected = filteredCommands[index];
    if (!selected) return;
    closePalette();
    selected.action();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        Math.min(prev + 1, Math.max(filteredCommands.length - 1, 0))
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(activeIndex);
    }

    if (event.key === "Tab") {
      const focusable = [
        inputRef.current,
        ...itemRefs.current.filter(Boolean),
      ].filter(Boolean) as HTMLElement[];

      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement
      );
      const nextIndex = event.shiftKey
        ? (currentIndex - 1 + focusable.length) % focusable.length
        : (currentIndex + 1) % focusable.length;

      event.preventDefault();
      focusable[nextIndex]?.focus();
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 px-4 pt-24 backdrop-blur-sm transition-opacity duration-150 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closePalette();
        }
      }}
      onTransitionEnd={() => {
        if (!isOpen) setIsMounted(false);
      }}
      aria-hidden={!isOpen}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl transition-transform duration-150 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
            placeholder="Type a command ..."
            className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto px-2 py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No matches
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  type="button"
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => handleSelect(index)}
                  onKeyDown={handleKeyDown}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {command.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          ↑↓ navigate&nbsp;&nbsp;&nbsp;Enter select&nbsp;&nbsp;&nbsp;Esc close
        </div>
      </div>
    </div>
  );
}

export function openCommandPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}
