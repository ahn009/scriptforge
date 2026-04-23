import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMultiScriptSystemPrompt, buildMultiScriptUserMessage } from "@/lib/prompts";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength, MultiScriptResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VALID_TONES = new Set<Tone>(TONE_OPTIONS.map((t) => t.id));
const VALID_LENGTHS = new Set<VideoLength>(LENGTH_OPTIONS.map((l) => l.id));

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

const MAX_TOKENS_BY_LENGTH: Record<VideoLength, number> = {
  "1min":  1500,
  "3min":  3000,
  "5min":  5000,
  "10min": 8000,
};

const PREFILL = '{"scripts":[';

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidResponse(p: unknown): p is MultiScriptResponse {
  return (
    typeof p === "object" && p !== null &&
    Array.isArray((p as MultiScriptResponse).scripts) &&
    (p as MultiScriptResponse).scripts.length > 0
  );
}

// Handles: direct JSON, markdown fences, preamble text, trailing text, truncated JSON
function extractScripts(raw: string): MultiScriptResponse | null {
  // Strip markdown code fences (model sometimes wraps JSON in ```json...```)
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  const tryParse = (s: string): MultiScriptResponse | null => {
    try {
      const p = JSON.parse(s);
      return isValidResponse(p) ? p : null;
    } catch { return null; }
  };

  // 1. Direct parse (prefill worked, no preamble)
  const direct = tryParse(cleaned);
  if (direct) return direct;

  // 2. Find {"scripts": anywhere — handles preamble before JSON
  const idx = cleaned.indexOf('{"scripts"');
  if (idx !== -1) {
    const from = cleaned.slice(idx);

    // 2a. Brace-count to extract exact JSON object — handles trailing text after JSON
    let depth = 0;
    let endIdx = -1;
    for (let i = 0; i < from.length; i++) {
      if (from[i] === "{") depth++;
      else if (from[i] === "}") { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    if (endIdx !== -1) {
      const exact = tryParse(from.slice(0, endIdx));
      if (exact) return exact;
    }

    // 2b. JSON truncated by max_tokens — try closing suffixes to salvage partial output
    for (const close of [']}', '"]}', '"}]}', '"]}]}']) {
      const r = tryParse(from + close);
      if (r) return r;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const { prompt, tone, length } = (body ?? {}) as {
    prompt?: unknown;
    tone?: unknown;
    length?: unknown;
  };

  if (typeof prompt !== "string") return json(400, { error: "Prompt is required." });
  const trimmed = prompt.trim();
  if (trimmed.length < 3) return json(400, { error: "Prompt is too short. Give us at least 3 characters." });
  if (trimmed.length > 500) return json(400, { error: "Prompt must be 500 characters or fewer." });
  if (typeof tone !== "string" || !VALID_TONES.has(tone as Tone)) return json(400, { error: "Select a valid tone." });
  if (typeof length !== "string" || !VALID_LENGTHS.has(length as VideoLength)) return json(400, { error: "Select a valid length." });

  const candidateToken = process.env.CANDIDATE_TOKEN;
  if (!candidateToken) {
    return json(500, { error: "Server is missing CANDIDATE_TOKEN. Add it to .env.local and restart." });
  }

  const systemPrompt = buildMultiScriptSystemPrompt(tone as Tone, length as VideoLength);
  const userTopic = buildMultiScriptUserMessage(trimmed);
  const combinedMessage = `${systemPrompt}\n\n---\n\n${userTopic}`;

  const client = new Anthropic({
    apiKey: "dummy",
    baseURL: "https://claude-candidate-proxy.vagueae.workers.dev",
    defaultHeaders: {
      "x-candidate-token": candidateToken,
    },
  });

  const maxTokens = MAX_TOKENS_BY_LENGTH[length as VideoLength];

  // Assistant prefill forces model to begin response with valid JSON — no preamble possible
  async function callClaude(): Promise<string> {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "user",      content: combinedMessage },
        { role: "assistant", content: PREFILL },
      ],
    });
    const block = response.content[0];
    if (block.type !== "text" || !block.text) throw new Error("Empty response");
    // Model continues from PREFILL — prepend it to reconstruct full JSON
    return PREFILL + block.text;
  }

  let rawText = "";
  let parsed: MultiScriptResponse | null = null;
  let lastNetworkError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      rawText = await callClaude();
    } catch (err) {
      lastNetworkError = err instanceof Error ? err.message : "Network error.";
      console.warn(`[generate] attempt ${attempt} network error: ${lastNetworkError}`);
      continue; // retry instead of returning immediately
    }

    console.log(`[generate] attempt ${attempt} | len: ${rawText.length} | start: ${rawText.slice(0, 100)}`);

    parsed = extractScripts(rawText);
    if (parsed) break;

    console.warn(`[generate] attempt ${attempt} parse failed. tail: ${rawText.slice(-300)}`);
  }

  if (!parsed || !Array.isArray(parsed.scripts) || parsed.scripts.length === 0) {
    const detail = lastNetworkError ? ` (${lastNetworkError})` : "";
    return json(502, { error: `Failed to generate scripts. Please try again.${detail}` });
  }

  const ids = ["A", "B", "C"] as const;
  const scripts = parsed.scripts.slice(0, 3).map((s, i) => ({
    ...s,
    id: ids[i],
    viral_score: Math.min(100, Math.max(0, s.viral_score ?? 0)),
  }));

  return json(200, { scripts });
}
