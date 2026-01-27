"use client";

import { useEffect, useState } from "react";
import { openCommandPalette } from "@/components/CommandPalette";

function detectPlatformLabel() {
  if (typeof navigator === "undefined") return "Ctrl K";
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  return isMac ? "⌘ K" : "Ctrl K";
}

export default function CommandKButton() {
  const [label, setLabel] = useState("Ctrl K");

  useEffect(() => {
    setLabel(detectPlatformLabel());
  }, []);

  return (
    <button
      type="button"
      onClick={() => openCommandPalette()}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      aria-label="Open command palette"
    >
      {label}
    </button>
  );
}
