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

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Extract JSON from a string that may contain markdown fences or extra text */
function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }
  return raw.trim();
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
  // Embed system instructions in user message — proxies often drop the `system` field
  const combinedMessage = `${systemPrompt}\n\n---\n\n${userTopic}`;

  const client = new Anthropic({
    apiKey: "dummy",
    baseURL: "https://claude-candidate-proxy.vagueae.workers.dev",
    defaultHeaders: {
      "x-candidate-token": candidateToken,
    },
  });

  const maxTokens = MAX_TOKENS_BY_LENGTH[length as VideoLength];

  async function callClaude(message: string): Promise<string> {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: message }],
    });
    const block = response.content[0];
    if (block.type !== "text" || !block.text) throw new Error("Empty response");
    return block.text;
  }

  // Retry up to 2 attempts on parse failure
  let rawText = "";
  let parsed: MultiScriptResponse | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      rawText = await callClaude(attempt === 1 ? combinedMessage : combinedMessage + "\n\nIMPORTANT: Respond with ONLY the JSON object. No explanation, no markdown, no code fences.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error.";
      return json(502, { error: `Failed to reach Claude: ${msg}` });
    }

    console.log(`[generate] attempt ${attempt} | length: ${rawText.length} | start: ${rawText.slice(0, 100)}`);

    try {
      parsed = JSON.parse(extractJSON(rawText)) as MultiScriptResponse;
      if (Array.isArray(parsed?.scripts) && parsed.scripts.length > 0) break;
      parsed = null;
    } catch {
      console.warn(`[generate] attempt ${attempt} parse failed. Raw: ${rawText.slice(0, 300)}`);
    }
  }

  if (!parsed || !Array.isArray(parsed.scripts) || parsed.scripts.length === 0) {
    return json(502, { error: "Failed to generate scripts. Please try again." });
  }

  if (!Array.isArray(parsed?.scripts) || parsed.scripts.length === 0) {
    return json(502, { error: "No scripts returned. Please try again." });
  }

  const ids = ["A", "B", "C"] as const;
  const scripts = parsed.scripts.slice(0, 3).map((s, i) => ({
    ...s,
    id: ids[i],
    viral_score: Math.min(100, Math.max(0, s.viral_score ?? 0)),
  }));

  return json(200, { scripts });
}
