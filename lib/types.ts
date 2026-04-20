export type Tone = "dramatic" | "neutral" | "uplifting";
export type VideoLength = "1min" | "3min" | "5min" | "10min";
export type VariantId = "A" | "B" | "C";

export interface GenerateRequest {
  prompt: string;
  tone: Tone;
  length: VideoLength;
}

export interface ToneOption {
  id: Tone;
  label: string;
  description: string;
  icon: string;
  color: string;
  colorDim: string;
}

export interface LengthOption {
  id: VideoLength;
  label: string;
  wordTarget: number;
  wordRange: string;
  sections: string;
}

/* ── Multi-script types ──────────────────────────────────────── */

export interface ScriptSection {
  type: "hook" | "section" | "conclusion" | "cta" | "pause" | "broll";
  title?: string;
  text?: string;
}

export interface ScriptVariation {
  id: VariantId;
  hook_type: string;
  structure: string;
  viral_score: number;
  score_breakdown: {
    hook_strength: number;
    curiosity_gap: number;
    retention_flow: number;
    emotional_trigger: number;
    cta_strength: number;
  };
  sections: ScriptSection[];
}

export interface MultiScriptResponse {
  scripts: ScriptVariation[];
}

/** Convert a structured ScriptVariation back to the tagged-text format
 *  that ScriptViewer already parses. */
export function scriptVariationToText(script: ScriptVariation): string {
  return script.sections
    .map((s) => {
      if (s.type === "hook") return `[HOOK]\n${s.text ?? ""}`;
      if (s.type === "section") return `[SECTION: ${s.title ?? "Section"}]\n${s.text ?? ""}`;
      if (s.type === "conclusion") return `[CONCLUSION]\n${s.text ?? ""}`;
      if (s.type === "cta") return `[CTA]\n${s.text ?? ""}`;
      if (s.type === "pause") return `[PAUSE]`;
      if (s.type === "broll") return `[B-ROLL: ${s.text ?? ""}]`;
      return s.text ?? "";
    })
    .filter(Boolean)
    .join("\n\n");
}
