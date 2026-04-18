import { NextRequest } from "next/server";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TONES = new Set<Tone>(TONE_OPTIONS.map((t) => t.id));
const VALID_LENGTHS = new Set<VideoLength>(LENGTH_OPTIONS.map((l) => l.id));

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type GeminiStreamEvent = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
      role?: string;
    };
    finishReason?: string;
    index?: number;
  }>;
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
  promptFeedback?: {
    blockReason?: string;
  };
};

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

  if (typeof prompt !== "string") {
    return json(400, { error: "Prompt is required." });
  }
  const trimmed = prompt.trim();
  if (trimmed.length < 3) {
    return json(400, {
      error: "Prompt is too short. Give us at least 3 characters to work with.",
    });
  }
  if (trimmed.length > 500) {
    return json(400, { error: "Prompt must be 500 characters or fewer." });
  }

  if (typeof tone !== "string" || !VALID_TONES.has(tone as Tone)) {
    return json(400, { error: "Select a valid tone." });
  }
  if (typeof length !== "string" || !VALID_LENGTHS.has(length as VideoLength)) {
    return json(400, { error: "Select a valid length." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, {
      error:
        "Server is missing GEMINI_API_KEY. Add it to .env.local and restart the dev server.",
    });
  }

  const systemPrompt = buildSystemPrompt(tone as Tone, length as VideoLength);
  const userMessage = buildUserMessage(trimmed);

  let upstream: Response;
  try {
    upstream = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
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
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
          // Disable Gemini 3 Flash's "thinking" tokens — they consume the
          // output budget and delay the first visible chunk. For script
          // generation we want fast, direct prose.
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error.";
    return json(502, { error: `Failed to reach Gemini: ${msg}` });
  }

  if (!upstream.ok || !upstream.body) {
    let detail = `HTTP ${upstream.status}`;
    try {
      const text = await upstream.text();
      try {
        const parsed = JSON.parse(text);
        detail = parsed?.error?.message || text.slice(0, 400);
      } catch {
        detail = text.slice(0, 400);
      }
    } catch {
      /* ignore */
    }
    return json(upstream.status || 500, {
      error: `Gemini request failed: ${detail}`,
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.startsWith("data:")) return;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;

        let parsed: GeminiStreamEvent;
        try {
          parsed = JSON.parse(payload);
        } catch {
          return;
        }

        if (parsed.error?.message) {
          controller.enqueue(
            encoder.encode(`\n\n[ERROR] ${parsed.error.message}`),
          );
          return;
        }

        if (parsed.promptFeedback?.blockReason) {
          controller.enqueue(
            encoder.encode(
              `\n\n[ERROR] Content blocked: ${parsed.promptFeedback.blockReason}`,
            ),
          );
          return;
        }

        const parts = parsed.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (typeof part.text === "string" && part.text.length > 0) {
            controller.enqueue(encoder.encode(part.text));
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process only complete lines. Keep the trailing partial line
          // (if any) in the buffer for the next iteration.
          const lastNewline = buffer.lastIndexOf("\n");
          if (lastNewline === -1) continue;

          const completed = buffer.slice(0, lastNewline);
          buffer = buffer.slice(lastNewline + 1);

          for (const raw of completed.split(/\r?\n/)) {
            const line = raw.trim();
            if (line) processLine(line);
          }
        }

        // Flush any remaining buffered line.
        const tail = buffer.trim();
        if (tail) processLine(tail);

        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream failed.";
        try {
          controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        } catch {
          /* ignore */
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
