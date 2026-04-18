import { ToneOption, LengthOption } from "./types";

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: "dramatic",
    label: "Dramatic",
    description: "Cinematic, emotionally charged, tension-driven",
    icon: "Flame",
    color: "var(--accent-dramatic)",
    colorDim: "var(--accent-dramatic-dim)",
  },
  {
    id: "neutral",
    label: "Neutral",
    description: "Balanced, informative, authoritative",
    icon: "Scale",
    color: "var(--accent-neutral)",
    colorDim: "var(--accent-neutral-dim)",
  },
  {
    id: "uplifting",
    label: "Uplifting",
    description: "Warm, inspiring, hopeful",
    icon: "Sparkles",
    color: "var(--accent-uplifting)",
    colorDim: "var(--accent-uplifting-dim)",
  },
];

export const LENGTH_OPTIONS: LengthOption[] = [
  {
    id: "1min",
    label: "1 min",
    wordTarget: 150,
    wordRange: "120–180",
    sections: "Hook → Core → CTA",
  },
  {
    id: "3min",
    label: "3 min",
    wordTarget: 450,
    wordRange: "380–520",
    sections: "Hook → 2 Sections → CTA",
  },
  {
    id: "5min",
    label: "5 min",
    wordTarget: 750,
    wordRange: "650–850",
    sections: "Hook → 4 Sections → Conclusion",
  },
  {
    id: "10min",
    label: "10 min",
    wordTarget: 1500,
    wordRange: "1300–1700",
    sections: "Hook → 6 Sections → Deep Dive → Conclusion",
  },
];

export const WORD_TARGETS: Record<
  string,
  { min: number; max: number; target: number }
> = {
  "1min": { min: 120, max: 180, target: 150 },
  "3min": { min: 380, max: 520, target: 450 },
  "5min": { min: 650, max: 850, target: 750 },
  "10min": { min: 1300, max: 1700, target: 1500 },
};
