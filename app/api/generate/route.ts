import { NextRequest } from "next/server";
import { buildMultiScriptSystemPrompt, buildMultiScriptUserMessage } from "@/lib/prompts";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength, MultiScriptResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VALID_TONES = new Set<Tone>(TONE_OPTIONS.map((t) => t.id));
const VALID_LENGTHS = new Set<VideoLength>(LENGTH_OPTIONS.map((l) => l.id));

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4";

const MAX_TOKENS_BY_LENGTH: Record<VideoLength, number> = {
  "1min": 1500,
  "3min": 3000,
  "5min": 5000,
  "10min": 8000,
};

const LOW_BUDGET_TOKEN_BUFFER = 32;
const MIN_RETRY_MAX_TOKENS = 500;
const PREFILL = '{"scripts":[';

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function affordableMaxTokensFromError(message: string): number | null {
  const match = message.match(/can only afford\s+(\d+)/i);
  if (!match) return null;

  const affordable = Number.parseInt(match[1], 10);
  if (!Number.isFinite(affordable) || affordable <= LOW_BUDGET_TOKEN_BUFFER) {
    return null;
  }

  return affordable - LOW_BUDGET_TOKEN_BUFFER;
}

function configuredMaxTokens(length: VideoLength): number {
  const requested = MAX_TOKENS_BY_LENGTH[length];
  const configuredCap = Number.parseInt(process.env.OPENROUTER_MAX_TOKENS ?? "", 10);

  if (!Number.isFinite(configuredCap) || configuredCap <= 0) {
    return requested;
  }

  return Math.min(requested, configuredCap);
}

export function addResponseBudgetOverride(
  systemPrompt: string,
  responseMaxTokens: number,
  recommendedMaxTokens: number,
) {
  if (responseMaxTokens >= recommendedMaxTokens) return systemPrompt;

  const perScriptWords =
    responseMaxTokens < 1000 ? 65 :
    responseMaxTokens < 1600 ? 100 :
    140;

  return `${systemPrompt}

## RESPONSE BUDGET OVERRIDE
The available completion budget is ${responseMaxTokens} tokens. Complete valid JSON is more important than exact word targets.
Return all 3 scripts, but keep each script to ${perScriptWords} words or fewer with 3-4 sections each.
Avoid optional b-roll sections unless they are essential.`;
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

  // 2. Find {"scripts": anywhere, handles preamble before JSON
  const idx = cleaned.indexOf('{"scripts"');
  if (idx !== -1) {
    const from = cleaned.slice(idx);

    // 2a. Brace-count to extract exact JSON object, handles trailing text after JSON
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

    // 2b. JSON truncated by max_tokens, try closing suffixes to salvage partial output
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

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    return json(500, { error: "Server is missing OPENROUTER_API_KEY. Add it to .env.local and restart." });
  }

  const systemPrompt = buildMultiScriptSystemPrompt(tone as Tone, length as VideoLength);
  const userTopic = buildMultiScriptUserMessage(trimmed);
  const recommendedMaxTokens = MAX_TOKENS_BY_LENGTH[length as VideoLength];
  let responseMaxTokens = configuredMaxTokens(length as VideoLength);

  async function callOpenRouter(): Promise<string> {
    const promptForAttempt = addResponseBudgetOverride(
      systemPrompt,
      responseMaxTokens,
      recommendedMaxTokens,
    );

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "ScriptForge AI",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: responseMaxTokens,
        temperature: 0.8,
        messages: [
          { role: "system", content: promptForAttempt },
          { role: "user", content: userTopic },
          { role: "assistant", content: PREFILL },
        ],
      }),
    });

    const data = await response.json().catch(() => null) as OpenRouterResponse | null;

    if (!response.ok) {
      throw new Error(data?.error?.message ?? `OpenRouter request failed with status ${response.status}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    // Model continues from PREFILL, prepend it to reconstruct full JSON.
    return content.startsWith(PREFILL) ? content : PREFILL + content;
  }

  let rawText = "";
  let parsed: MultiScriptResponse | null = null;
  let lastNetworkError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      rawText = await callOpenRouter();
    } catch (err) {
      lastNetworkError = err instanceof Error ? err.message : "Network error.";
      console.warn(`[generate] attempt ${attempt} network error: ${lastNetworkError}`);

      const affordableMaxTokens = affordableMaxTokensFromError(lastNetworkError);
      if (affordableMaxTokens !== null && affordableMaxTokens < responseMaxTokens) {
        if (affordableMaxTokens < MIN_RETRY_MAX_TOKENS) {
          return json(402, {
            error: `OpenRouter balance only allows about ${affordableMaxTokens + LOW_BUDGET_TOKEN_BUFFER} output tokens. Add credits or choose a shorter length.`,
          });
        }

        responseMaxTokens = affordableMaxTokens;
        console.warn(`[generate] retrying with reduced max_tokens: ${responseMaxTokens}`);
      }

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
