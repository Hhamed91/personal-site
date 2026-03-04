"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { SnowflakeDesign, SnowflakeSettings, SnowflakeStyle } from "@/lib/snowflake";
import { createSnowflakeDesign } from "@/lib/snowflake";

type SnowFieldSettings = {
  count: number;
  fallSpeed: number;
  wind: number;
  sizeMin: number;
  sizeMax: number;
  symmetry: boolean;
  glow: boolean;
  style: SnowflakeStyle;
  color?: string;
};

type SnowFieldProps = {
  settings: SnowFieldSettings;
  regenerateKey: number;
  clearKey: number;
  paused: boolean;
};

type FlakeData = {
  id: string;
  seed: number;
  variant: number;
  design: SnowflakeDesign;
};

type MotionData = {
  x: number;
  y: number;
  speed: number;
  drift: number;
  phase: number;
  driftSpeed: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
};

const DEFAULT_BOUNDS = { width: 820, height: 520 };

const formatNumber = (value: number, digits = 2) => Number(value.toFixed(digits));

const createMotion = (width: number, height: number, size: number) => {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    speed: (0.5 + Math.random() * 0.9) * (size / 28),
    drift: 6 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
    driftSpeed: 0.6 + Math.random() * 1.2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 26,
    size,
  };
};

const buildFlakes = (settings: SnowFieldSettings, bounds: { width: number; height: number }) => {
  const flakes: FlakeData[] = [];
  const motions: MotionData[] = [];

  for (let i = 0; i < settings.count; i += 1) {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const design = createSnowflakeDesign(seed, {
      symmetry: settings.symmetry,
      sizeMin: settings.sizeMin,
      sizeMax: settings.sizeMax,
      style: settings.style,
      color: settings.color,
    });
    flakes.push({
      id: `${seed}-${i}`,
      seed,
      variant: 0,
      design,
    });
    motions.push(createMotion(bounds.width, bounds.height, design.size));
  }

  return { flakes, motions };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

const SnowflakeSvg = ({ design }: { design: SnowflakeDesign }) => {
  const center = 50;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g
        stroke={design.color}
        strokeWidth={design.thickness}
        strokeLinecap={design.style === "Soft" ? "round" : "square"}
        strokeOpacity={design.opacity}
      >
        {design.armAngles.map((angle, index) => {
          const rad = degToRad(angle);
          const length = design.armLengths[index];
          const x2 = center + Math.cos(rad) * length;
          const y2 = center + Math.sin(rad) * length;
          const branchCount = design.branches;
          const branchItems = [];
          for (let i = 1; i <= branchCount; i += 1) {
            const t = (length * i) / (branchCount + 1);
            const bx = center + Math.cos(rad) * t;
            const by = center + Math.sin(rad) * t;
            const angleOffset = (design.branchAngle * Math.PI) / 180;
            const left = rad - angleOffset;
            const right = rad + angleOffset;
            const branchLength = design.branchLength;
            branchItems.push(
              <line
                key={`branch-${index}-${i}-l`}
                x1={bx}
                y1={by}
                x2={bx + Math.cos(left) * branchLength}
                y2={by + Math.sin(left) * branchLength}
              />,
            );
            branchItems.push(
              <line
                key={`branch-${index}-${i}-r`}
                x1={bx}
                y1={by}
                x2={bx + Math.cos(right) * branchLength}
                y2={by + Math.sin(right) * branchLength}
              />,
            );
          }

          return (
            <g key={`arm-${angle}-${index}`}>
              <line x1={center} y1={center} x2={x2} y2={y2} />
              {branchItems}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default function SnowField({ settings, regenerateKey, clearKey, paused }: SnowFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flakesRef = useRef<HTMLDivElement[]>([]);
  const motionsRef = useRef<MotionData[]>([]);
  const animationRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const pausedRef = useRef(paused);
  const lastClearRef = useRef(0);

  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [flakes, setFlakes] = useState<FlakeData[]>([]);
  const [selected, setSelected] = useState<{
    flake: FlakeData;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setBounds({
        width: width || DEFAULT_BOUNDS.width,
        height: height || DEFAULT_BOUNDS.height,
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (clearKey > lastClearRef.current) {
      lastClearRef.current = clearKey;
      setFlakes([]);
      motionsRef.current = [];
      setSelected(null);
      return;
    }

    const { flakes: nextFlakes, motions } = buildFlakes(settings, bounds);
    setFlakes(nextFlakes);
    flakesRef.current = [];
    motionsRef.current = motions;
    setSelected(null);
  }, [
    settings.count,
    settings.sizeMin,
    settings.sizeMax,
    settings.symmetry,
    settings.style,
    settings.color,
    regenerateKey,
    clearKey,
    bounds.width,
    bounds.height,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    let lastTime = performance.now();
    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!pausedRef.current) {
        const { fallSpeed, wind } = settingsRef.current;
        const windFactor = wind * 0.02;
        const motion = motionsRef.current;
        const width = bounds.width || DEFAULT_BOUNDS.width;
        const height = bounds.height || DEFAULT_BOUNDS.height;

        for (let i = 0; i < motion.length; i += 1) {
          const item = motion[i];
          item.phase += item.driftSpeed * dt;
          const driftDelta = Math.sin(item.phase) * item.drift * dt;
          item.y += item.speed * fallSpeed * 60 * dt;
          item.x += (windFactor + driftDelta) * 60 * dt;
          item.rotation += item.rotationSpeed * dt;

          if (item.y > height + item.size) {
            item.y = -item.size;
            item.x = Math.random() * width;
          }
          if (item.x > width + item.size) item.x = -item.size;
          if (item.x < -item.size) item.x = width + item.size;

          const node = flakesRef.current[i];
          if (node) {
            node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg)`;
          }
        }
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [bounds.height, bounds.width]);

  const sharedSettings = useMemo<SnowflakeSettings>(
    () => ({
      symmetry: settings.symmetry,
      sizeMin: settings.sizeMin,
      sizeMax: settings.sizeMax,
      style: settings.style,
      color: settings.color,
    }),
    [settings],
  );

  const handleSelect = (event: PointerEvent<HTMLDivElement>, flake: FlakeData, index: number) => {
    event.stopPropagation();
    const container = containerRef.current?.getBoundingClientRect();
    const target = flakesRef.current[index]?.getBoundingClientRect();
    if (!container || !target) return;

    const x = clamp(target.left - container.left + target.width + 12, 12, bounds.width - 240);
    const y = clamp(target.top - container.top, 12, bounds.height - 160);

    setSelected({ flake, x, y });
  };

  const handleRegenerateSimilar = () => {
    if (!selected) return;
    const nextVariant = selected.flake.variant + 1;

    setFlakes((prev) =>
      prev.map((flake) =>
        flake.id === selected.flake.id
          ? {
              ...flake,
              variant: nextVariant,
              design: createSnowflakeDesign(flake.seed, sharedSettings, nextVariant),
            }
          : flake,
      ),
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[520px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(226,239,255,0.7)_45%,_rgba(206,226,255,0.35)_75%)] shadow-sm"
      onPointerDown={() => setSelected(null)}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      </div>
      {flakes.map((flake, index) => (
        <div
          key={flake.id}
          ref={(node) => {
            if (node) flakesRef.current[index] = node;
          }}
          className={`group absolute left-0 top-0 flex items-center justify-center ${
            settings.glow
              ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.65)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
              : "hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
          }`}
          style={{
            width: `${flake.design.size}px`,
            height: `${flake.design.size}px`,
            filter: flake.design.blur ? `blur(${flake.design.blur}px)` : undefined,
            transform: `translate3d(0, 0, 0) rotate(${flake.design.rotation}deg)`,
          }}
          onPointerDown={(event) => handleSelect(event, flake, index)}
          role="button"
          aria-label={`Snowflake ${flake.seed}`}
        >
          <div className="pointer-events-auto h-full w-full rounded-full ring-1 ring-transparent transition group-hover:ring-white/70">
            <SnowflakeSvg design={flake.design} />
          </div>
        </div>
      ))}
      {selected && (
        <div
          className="absolute z-20 w-56 rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur"
          style={{ left: `${selected.x}px`, top: `${selected.y}px` }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="text-sm font-semibold text-slate-700">Snowflake details</div>
          <div className="mt-2 space-y-1 text-slate-500">
            <div>Seed: {selected.flake.seed}</div>
            <div>Arms: {selected.flake.design.arms}</div>
            <div>Size: {formatNumber(selected.flake.design.size)}px</div>
            <div>Thickness: {formatNumber(selected.flake.design.thickness)}px</div>
            <div>Symmetry: {selected.flake.design.symmetry ? "On" : "Off"}</div>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={handleRegenerateSimilar}
          >
            Regenerate similar
          </button>
        </div>
      )}
    </div>
  );
}
