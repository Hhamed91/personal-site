"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";

import SnowField from "@/components/SnowField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SnowflakeStyle } from "@/lib/snowflake";

type Settings = {
  count: number;
  fallSpeed: number;
  wind: number;
  sizeMin: number;
  sizeMax: number;
  symmetry: boolean;
  glow: boolean;
  style: SnowflakeStyle;
  color: string;
};

const styles: SnowflakeStyle[] = ["Classic", "Geometric", "Soft", "Spiky"];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function SnowParticleLabPage() {
  const [settings, setSettings] = useState<Settings>({
    count: 140,
    fallSpeed: 1,
    wind: 4,
    sizeMin: 14,
    sizeMax: 40,
    symmetry: true,
    glow: true,
    style: "Classic",
    color: "#f2f7ff",
  });
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [clearKey, setClearKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.code === "KeyR") {
        event.preventDefault();
        setRegenerateKey((value) => value + 1);
      }
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const shareJson = useMemo(
    () =>
      JSON.stringify(
        {
          flakeCount: settings.count,
          fallSpeed: settings.fallSpeed,
          wind: settings.wind,
          sizeRange: [settings.sizeMin, settings.sizeMax],
          symmetry: settings.symmetry,
          glow: settings.glow,
          style: settings.style,
          color: settings.color,
        },
        null,
        2,
      ),
    [settings],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="space-y-4">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Interactive demo</p>
          <h1 className="text-4xl font-bold text-gray-900">Snow Particle Lab</h1>
          <p className="max-w-3xl text-lg text-gray-600">
            Snowflakes are uniquely fascinating — this playground lets you generate and animate snow particles with
            randomized geometry.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <Card className="border-slate-200/80 bg-white/80 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Snowfield</p>
                  <p>Hover to glow, click for details. R = randomize, Space = pause.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button className="rounded-full" onClick={() => setRegenerateKey((value) => value + 1)}>
                    Generate New Batch
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setPaused((value) => !value)}
                  >
                    {paused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setClearKey((value) => value + 1)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <SnowField settings={settings} regenerateKey={regenerateKey} clearKey={clearKey} paused={paused} />
        </section>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Controls</p>
                <h2 className="text-lg font-semibold text-gray-800">Particle controls</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <label className="space-y-2">
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Flake Count</span>
                    <span>{settings.count}</span>
                  </span>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={10}
                    value={settings.count}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, count: Number(event.target.value) }))
                    }
                    className="w-full accent-slate-700"
                  />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Fall Speed</span>
                    <span>{settings.fallSpeed.toFixed(1)}x</span>
                  </span>
                  <input
                    type="range"
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    value={settings.fallSpeed}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, fallSpeed: Number(event.target.value) }))
                    }
                    className="w-full accent-slate-700"
                  />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Wind</span>
                    <span>{settings.wind.toFixed(0)}</span>
                  </span>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    step={1}
                    value={settings.wind}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, wind: Number(event.target.value) }))
                    }
                    className="w-full accent-slate-700"
                  />
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Size Range</span>
                    <span>
                      {settings.sizeMin}px – {settings.sizeMax}px
                    </span>
                  </div>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Min</span>
                    <input
                      type="range"
                      min={8}
                      max={60}
                      step={1}
                      value={settings.sizeMin}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setSettings((prev) => ({
                          ...prev,
                          sizeMin: value,
                          sizeMax: clamp(prev.sizeMax, value, 60),
                        }));
                      }}
                      className="w-full accent-slate-700"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Max</span>
                    <input
                      type="range"
                      min={8}
                      max={60}
                      step={1}
                      value={settings.sizeMax}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setSettings((prev) => ({
                          ...prev,
                          sizeMax: value,
                          sizeMin: clamp(prev.sizeMin, 8, value),
                        }));
                      }}
                      className="w-full accent-slate-700"
                    />
                  </label>
                </div>
                <label className="flex items-center justify-between gap-4">
                  <span className="font-medium text-gray-700">Symmetry Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.symmetry}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, symmetry: event.target.checked }))
                    }
                    className="size-5 accent-slate-700"
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="font-medium text-gray-700">Glow</span>
                  <input
                    type="checkbox"
                    checked={settings.glow}
                    onChange={(event) => setSettings((prev) => ({ ...prev, glow: event.target.checked }))}
                    className="size-5 accent-slate-700"
                  />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Style</span>
                    <span>{settings.style}</span>
                  </span>
                  <select
                    value={settings.style}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, style: event.target.value as SnowflakeStyle }))
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    {styles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Snowflake Color</span>
                    <span className="font-mono text-xs text-gray-500">{settings.color.toUpperCase()}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(event) => setSettings((prev) => ({ ...prev, color: event.target.value }))}
                      className="h-10 w-12 rounded-md border border-slate-200 bg-white"
                      aria-label="Snowflake color picker"
                    />
                    <input
                      type="text"
                      value={settings.color}
                      onChange={(event) => setSettings((prev) => ({ ...prev, color: event.target.value }))}
                      className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-slate-400 focus:outline-none"
                      placeholder="#4287f5"
                    />
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Share</p>
                <h2 className="text-lg font-semibold text-gray-800">Settings snapshot</h2>
              </div>
              <textarea
                readOnly
                value={shareJson}
                className="h-40 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600"
              />
              <Button variant="outline" className="w-full rounded-full" onClick={handleCopy}>
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy settings"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
