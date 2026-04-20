import { NextRequest } from "next/server";
import { buildMultiScriptSystemPrompt, buildMultiScriptUserMessage } from "@/lib/prompts";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength, MultiScriptResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TONES = new Set<Tone>(TONE_OPTIONS.map((t) => t.id));
const VALID_LENGTHS = new Set<VideoLength>(LENGTH_OPTIONS.map((l) => l.id));

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "Server is missing GEMINI_API_KEY. Add it to .env.local and restart." });
  }

  const systemPrompt = buildMultiScriptSystemPrompt(tone as Tone, length as VideoLength);
  const userMessage = buildMultiScriptUserMessage(trimmed);

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.92,
          topP: 0.95,
          maxOutputTokens: 16384,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error.";
    return json(502, { error: `Failed to reach Gemini: ${msg}` });
  }

  if (!upstream.ok) {
    let detail = `HTTP ${upstream.status}`;
    try {
      const text = await upstream.text();
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.error?.message || text.slice(0, 400);
      } catch {
        detail = text.slice(0, 400);
      }
    } catch { /* ignore */ }
    return json(upstream.status || 500, { error: `Gemini request failed: ${detail}` });
  }

  let responseData: unknown;
  try {
    responseData = await upstream.json();
  } catch {
    return json(502, { error: "Gemini returned unparseable response." });
  }

  const geminiJson = responseData as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
    error?: { message?: string };
  };

  if (geminiJson.error?.message) {
    return json(500, { error: geminiJson.error.message });
  }

  if (geminiJson.promptFeedback?.blockReason) {
    return json(400, { error: `Content blocked: ${geminiJson.promptFeedback.blockReason}` });
  }

  const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    return json(502, { error: "Gemini returned no content." });
  }

  let parsed: MultiScriptResponse;
  try {
    parsed = JSON.parse(extractJSON(rawText)) as MultiScriptResponse;
  } catch {
    return json(502, { error: "Failed to parse generated scripts. Please try again." });
  }

  if (!Array.isArray(parsed?.scripts) || parsed.scripts.length === 0) {
    return json(502, { error: "No scripts returned. Please try again." });
  }

  // Clamp viral scores and assign IDs defensively
  const ids = ["A", "B", "C"] as const;
  const scripts = parsed.scripts.slice(0, 3).map((s, i) => ({
    ...s,
    id: ids[i],
    viral_score: Math.min(100, Math.max(0, s.viral_score ?? 0)),
  }));

  return json(200, { scripts });
}
