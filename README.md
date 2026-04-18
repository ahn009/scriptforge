# ScriptForge AI

> A production-grade AI video script generator with a cinematic editorial feel. Built for the Blue Foxes AI Content Lab Full Stack Developer take-home.

Paste an idea. Pick a tone. Pick a length. Get a streaming, broadcast-ready script — complete with `[HOOK]`, `[SECTION]`, `[PAUSE]`, `[B-ROLL]`, and `[CTA]` markers that the UI renders into a typographic reading experience.

## Live Demo

Deploy to Vercel (see below) and drop the URL here.

> _Add a screenshot to `/public/screenshot.png` and reference it here once deployed._

## Tech Stack

- **Framework** — Next.js (App Router) + TypeScript
- **Styling** — Tailwind CSS v4 (CSS-first `@theme`) + custom "Obsidian Editorial" design tokens
- **Animation** — Framer Motion (staggered reveals, spring selections, typing cursor)
- **Icons** — Lucide React
- **AI** — Google Gemini (`gemini-flash-latest`) via Google AI Studio's free API, server-side SSE streaming relayed as text chunks
- **Deployment** — Vercel (zero-config)

## Quick Start

```bash
# 1. Install dependencies
cd scriptforge
npm install

# 2. Add your Gemini API key (free from https://aistudio.google.com/)
cp .env.example .env.local
# then edit .env.local and set GEMINI_API_KEY=...

# 3. Run the dev server
npm run dev

# 4. Visit
open http://localhost:3000
```

## Scripts

| Command         | What it does                        |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start Next.js in development mode   |
| `npm run build` | Production build                    |
| `npm start`     | Run the production build            |
| `npm run lint`  | Lint the codebase                   |

## Architecture

```
scriptforge/
├── app/
│   ├── api/generate/route.ts   # Streaming Gemini endpoint (SSE parser, input validation, relayed text chunks)
│   ├── globals.css             # Obsidian Editorial design tokens + keyframes
│   ├── layout.tsx              # Root layout + metadata / OG tags
│   └── page.tsx                # Orchestrator — state, streaming consumer, error UI
├── components/
│   ├── Header.tsx              # Serif wordmark + ambient glow
│   ├── PromptInput.tsx         # Textarea with live character counter
│   ├── ToneSelector.tsx        # 3 glass cards with animated selection glow
│   ├── LengthSelector.tsx      # 4 amber pills with spring transitions
│   ├── GenerateButton.tsx      # Gradient CTA with pulse + state-swap animation
│   └── ScriptViewer.tsx        # Parses [TAGS] into typographic blocks, streams with a typing cursor
├── lib/
│   ├── types.ts                # Tone, VideoLength, ToneOption, LengthOption
│   ├── constants.ts            # TONE_OPTIONS, LENGTH_OPTIONS, WORD_TARGETS
│   └── prompts.ts              # buildSystemPrompt() — tone directives + length structure guides (used as Gemini systemInstruction)
├── .agents/config.toml         # Ruflo multi-agent workflow (architect → designer → engineer → reviewer)
├── CLAUDE.md                   # Behavioural rules for Claude Code
└── .env.local                  # GEMINI_API_KEY (never committed — `.env*` is gitignored)
```

### How streaming works

1. The browser `POST`s `{ prompt, tone, length }` to `/api/generate`.
2. The route validates inputs, builds a tone-aware system prompt + length-aware structure guide (`lib/prompts.ts`), and calls Gemini's `:streamGenerateContent?alt=sse` endpoint with the prompt as `systemInstruction`.
3. The server parses the upstream SSE events, extracts `candidates[0].content.parts[].text`, and relays raw text chunks through a `ReadableStream` to the client — so the browser never sees the API key or the Gemini wire format.
4. The client reads the stream via `response.body.getReader()` and appends to state, which re-parses the tagged script into live-rendered blocks with a typing cursor on the final paragraph.

## Design System — "Obsidian Editorial"

Dark, cinematic, editorial. No cookie-cutter AI aesthetic.

- **Palette** — deep `#0A0A0B` base, warm amber `#E8A849` accent, three tone accents (dramatic red `#E84855`, neutral blue `#6C8EBF`, uplifting green `#5DB075`).
- **Typography** — Playfair Display for display + labels, DM Sans for body.
- **Texture** — SVG fractal noise overlay + two radial gradient orbs for depth.
- **Glass** — `backdrop-filter: blur(20px)` on cards, hairline borders, amber focus rings.
- **Motion** — staggered reveals on load, spring selections, the final streaming paragraph carries a blinking amber cursor.

## Ruflo Agents Configuration

`.agents/config.toml` defines the four-agent workflow this project was structured around:

| Agent       | Role              | Responsibilities                                    |
| ----------- | ----------------- | --------------------------------------------------- |
| `architect` | system-architect  | Types, routing, project structure                   |
| `designer`  | ui-designer       | Design tokens, components, animations               |
| `engineer`  | backend-engineer  | API route, streaming, prompt engineering            |
| `reviewer`  | code-reviewer     | Responsive checks, a11y, edge cases, build verify   |

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel, pointing the project root at `scriptforge/`.
3. Add the `GEMINI_API_KEY` environment variable in Project Settings.
4. Deploy. That's it.

## Part 2 — How I Think

### Which repetitive tasks would I automate first?

The **content-to-multi-format pipeline** is the biggest time sink in any content team. A single video idea goes through: research → script → thumbnail copy → social captions → email newsletter → blog adaptation. Each step is manual, often done by the same person rewriting the same core message for different channels.

The second target is **performance feedback loops** — pulling analytics from YouTube Studio, cross-referencing with the content calendar, and figuring out what's working. That pattern recognition ("our dramatic history videos between 5–8 minutes are outperforming") is exactly what AI handles well.

### What AI tool would I build?

A **Content Multiplier** — paste a finalized video script or transcript, and it generates all derivative content in one click: YouTube description with SEO keywords, three tweet variations, Instagram caption, newsletter paragraph, blog post draft, and thumbnail text options. Each output is editable inline before export.

Under the hood: Claude with per-format system prompts that preserve the original tone and key messages while adapting structure and length for each platform. The tool stores past outputs to build a "style memory" over time.

### Why would this matter?

Content teams are bottlenecked at **distribution**, not creation. The script is the hard creative work; reformatting it for six platforms is high-effort, low-creativity labor that delays publishing and burns out writers. This tool cuts repurposing from hours to minutes, letting the team ship across all platforms the same day a video drops — which directly impacts reach and algorithm favorability.

---

Built with care for the Blue Foxes AI Content Lab take-home.

## Security notes

- `GEMINI_API_KEY` lives only in `.env.local`, which is matched by `.env*` in `.gitignore` and will never be committed.
- The key is read server-side in `app/api/generate/route.ts` and attached to the upstream Gemini request via the `X-goog-api-key` header. The browser never sees the key, the endpoint URL, or the Gemini response format — it only receives plain text chunks.
- If a key is ever accidentally pasted into a public channel, rotate it immediately in Google AI Studio.
