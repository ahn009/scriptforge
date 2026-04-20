import { Tone, VideoLength } from "./types";
import { WORD_TARGETS } from "./constants";

const TONE_DIRECTIVES: Record<Tone, string> = {
  dramatic: `DRAMATIC — Cinematic and emotionally charged. Vivid imagery, rhetorical questions, dramatic pauses marked as [PAUSE], tension/release dynamics. Think documentary narration meets theatrical storytelling. Build suspense. Make the audience FEEL something.`,
  neutral: `NEUTRAL — Clear, factual, and authoritative. Present information in a balanced way. Prioritize clarity and substance over flair. Use well-structured arguments and credible framing. Think high-quality educational content or a well-produced news documentary.`,
  uplifting: `UPLIFTING — Warm, hopeful, and genuinely inspiring. Highlight human achievement, progress, and possibility. Use encouraging language that motivates without being saccharine. End on a note that makes the viewer want to take action. Think motivational documentary meets TED Talk.`,
};

const STRUCTURE_GUIDES: Record<VideoLength, string> = {
  "1min": `SECTION SCHEMA for 1-MINUTE video:
- hook (1-2 sentences, instant grab)
- SECTION: "Core Message" (3-5 tight sentences)
- cta (1 sentence)`,

  "3min": `SECTION SCHEMA for 3-MINUTE video:
- hook (15-20 seconds spoken)
- SECTION: "Context" (set the scene)
- SECTION: "Main Point" (core argument)
- SECTION: "Key Takeaway"
- cta`,

  "5min": `SECTION SCHEMA for 5-MINUTE video:
- hook (strong opening)
- SECTION: "Introduction"
- SECTION: "The Story/Problem"
- SECTION: "Deep Dive"
- SECTION: "The Turning Point"
- conclusion
- cta`,

  "10min": `SECTION SCHEMA for 10-MINUTE video:
- hook
- SECTION: "Introduction"
- SECTION: "Chapter 1"
- SECTION: "Chapter 2"
- SECTION: "Chapter 3"
- SECTION: "Deep Dive"
- SECTION: "The Bigger Picture"
- conclusion
- cta`,
};

const HOOK_STRATEGIES = [
  "pattern-interrupt",
  "bold-claim",
  "relatable-pain",
  "story-opening",
  "question",
] as const;

const STRUCTURE_STRATEGIES = [
  "fast-punchy",
  "story-based",
  "problem-solution-twist",
  "contrarian-take",
  "list-revelation",
] as const;

/* ── Multi-script prompt (returns JSON with 3 variations) ────── */

export function buildMultiScriptSystemPrompt(tone: Tone, length: VideoLength): string {
  const wordTarget = WORD_TARGETS[length];
  const toneDir = TONE_DIRECTIVES[tone];
  const structureGuide = STRUCTURE_GUIDES[length];

  return `You are an elite short-form content strategist and viral scriptwriter.

Your task: generate 3 DISTINCT, HIGH-PERFORMING video script variations for the same idea.

## TONE
${toneDir}

## LENGTH
Each script must target exactly ${wordTarget.target} words (range: ${wordTarget.min}–${wordTarget.max}).
This is for a ${length.replace("min", "-minute")} video. Every word earns its place.

## STRUCTURE
${structureGuide}

## VARIATION RULES (CRITICAL)
Each of the 3 scripts MUST use a different hook strategy and different structural approach:

Hook strategies (use one per script, all different): ${HOOK_STRATEGIES.join(", ")}
Structure strategies (use one per script, all different): ${STRUCTURE_STRATEGIES.join(", ")}

Scripts A, B, C must feel like they were written by 3 different expert writers.
DO NOT reuse sentence structures, hook phrasing, or transitions across scripts.

## VIRAL SCORING
Score each script honestly:
- hook_strength (0–30): Does the first line stop a scroll?
- curiosity_gap (0–20): Does it create an information gap?
- retention_flow (0–20): Does pacing keep viewers watching?
- emotional_trigger (0–15): Does it create an emotional response?
- cta_strength (0–15): Is the call-to-action specific and compelling?
viral_score = sum of all five. Be accurate, not generous.

## WRITING RULES
- Write in natural spoken voice — this is voiceover/teleprompter copy
- Short sentences. Short paragraphs. Create rhythm.
- Vary sentence length for musicality
- Use [pause] type sections sparingly for dramatic beat moments
- Use [broll] type sections for visual direction hints
- DO NOT include timestamps, word counts, or meta-commentary

## OUTPUT FORMAT
Return ONLY valid JSON matching this exact schema. No markdown fences, no explanation.

{
  "scripts": [
    {
      "id": "A",
      "hook_type": "<one of the hook strategies>",
      "structure": "<one of the structure strategies>",
      "viral_score": <0-100>,
      "score_breakdown": {
        "hook_strength": <0-30>,
        "curiosity_gap": <0-20>,
        "retention_flow": <0-20>,
        "emotional_trigger": <0-15>,
        "cta_strength": <0-15>
      },
      "sections": [
        { "type": "hook", "text": "..." },
        { "type": "pause" },
        { "type": "section", "title": "...", "text": "..." },
        { "type": "broll", "text": "visual description..." },
        { "type": "conclusion", "text": "..." },
        { "type": "cta", "text": "..." }
      ]
    },
    { "id": "B", ... },
    { "id": "C", ... }
  ]
}`;
}

export function buildMultiScriptUserMessage(prompt: string): string {
  return `Create 3 distinct video scripts about: ${prompt}`;
}

// Backward-compatible aliases (used by existing tests)
export const buildSystemPrompt = buildMultiScriptSystemPrompt;
export function buildUserMessage(prompt: string): string {
  return `Create a video script about: ${prompt}`;
}
