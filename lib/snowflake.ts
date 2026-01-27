export type SnowflakeStyle = "Classic" | "Geometric" | "Soft" | "Spiky";

export type SnowflakeSettings = {
  symmetry: boolean;
  sizeMin: number;
  sizeMax: number;
  style: SnowflakeStyle;
  color?: string;
};

export type SnowflakeDesign = {
  seed: number;
  variant: number;
  symmetry: boolean;
  style: SnowflakeStyle;
  size: number;
  opacity: number;
  blur: number;
  rotation: number;
  arms: number;
  armAngles: number[];
  armLengths: number[];
  thickness: number;
  branches: number;
  branchAngle: number;
  branchLength: number;
  color: string;
};

const stylePresets: Record<
  SnowflakeStyle,
  {
    thickness: [number, number];
    blur: [number, number];
    branchAngle: [number, number];
    armBias: [number, number];
  }
> = {
  Classic: { thickness: [1, 2.1], blur: [0, 0.6], branchAngle: [24, 34], armBias: [0.9, 1.05] },
  Geometric: { thickness: [1.4, 2.6], blur: [0, 0.2], branchAngle: [36, 52], armBias: [0.85, 1.02] },
  Soft: { thickness: [0.9, 1.8], blur: [0.6, 1.4], branchAngle: [18, 26], armBias: [0.95, 1.1] },
  Spiky: { thickness: [1.2, 2.4], blur: [0, 0.4], branchAngle: [40, 58], armBias: [0.7, 0.95] },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const randRange = (rng: () => number, min: number, max: number) => min + (max - min) * rng();

const jitter = (rng: () => number, amount: number) => (rng() - 0.5) * amount;

// Builds a deterministic, SVG-friendly snowflake recipe from a seed + style inputs.
export const createSnowflakeDesign = (
  seed: number,
  settings: SnowflakeSettings,
  variant = 0,
): SnowflakeDesign => {
  const rng = mulberry32(seed + variant * 1013);
  const style = settings.style;
  const preset = stylePresets[style];

  const arms = Math.round(randRange(rng, 4, 8));
  const size = randRange(rng, settings.sizeMin, settings.sizeMax);
  const armLength = randRange(rng, 32, 46);
  const thickness = randRange(rng, preset.thickness[0], preset.thickness[1]);
  const branches = Math.round(randRange(rng, 0, 3));
  const branchAngle = randRange(rng, preset.branchAngle[0], preset.branchAngle[1]);
  const branchLength = randRange(rng, 8, 15);
  const rotation = randRange(rng, 0, 360);
  const opacity = clamp(randRange(rng, 0.6, 0.95), 0.35, 1);
  const blur = clamp(randRange(rng, preset.blur[0], preset.blur[1]), 0, 2);

  const armAngles: number[] = [];
  const armLengths: number[] = [];
  const step = 360 / arms;
  for (let i = 0; i < arms; i += 1) {
    const baseAngle = i * step;
    const angle = settings.symmetry ? baseAngle : baseAngle + jitter(rng, step * 0.35);
    armAngles.push(angle);
    const lengthBias = settings.symmetry ? 1 : randRange(rng, preset.armBias[0], preset.armBias[1]);
    armLengths.push(armLength * lengthBias);
  }

  const hue = Math.round(randRange(rng, 200, 216));
  const color = settings.color ?? `hsl(${hue} 60% 96%)`;

  return {
    seed,
    variant,
    symmetry: settings.symmetry,
    style,
    size,
    opacity,
    blur,
    rotation,
    arms,
    armAngles,
    armLengths,
    thickness,
    branches,
    branchAngle,
    branchLength,
    color,
  };
};
