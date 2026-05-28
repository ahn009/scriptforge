# ScriptForge AI

> A production-grade AI video script generator with a cinematic editorial interface. Paste an idea, choose a tone and length, and generate three polished script options with hooks, sections, B-roll notes, pauses, CTAs, and viral score metadata.

## Tech Stack

- **Framework**: Next.js App Router, React, TypeScript
- **Styling**: Tailwind CSS v4 with custom editorial design tokens
- **Animation/UI**: Framer Motion, Lucide React, next-themes
- **AI Provider**: OpenRouter Chat Completions API
- **Default Model**: `anthropic/claude-sonnet-4`
- **Testing**: Vitest unit tests and Playwright e2e tests
- **Deployment**: Vercel

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create local env file
cp .env.example .env.local

# 3. Add your OpenRouter key
# OPENROUTER_API_KEY=sk-or-v1-...

# 4. Run locally
npm run dev
```

Open <http://localhost:3000>.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Server-side OpenRouter API key. Never expose this in client code. |
| `OPENROUTER_MODEL` | No | Model used by `/api/generate`. Defaults to `anthropic/claude-sonnet-4`. |
| `NEXT_PUBLIC_SITE_URL` | No | Sent as OpenRouter `HTTP-Referer`. Defaults locally to `http://localhost:3000`. |

Example:

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-sonnet-4
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server after building |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run test:all` | Run unit and e2e tests |
| `npm run verify` | Run lint, build, unit tests, and e2e tests |

## Project Structure

```text
scriptforge/
├── app/
│   ├── api/generate/route.ts  # Server-only OpenRouter endpoint wrapper
│   ├── globals.css            # Global styles and Tailwind theme tokens
│   ├── layout.tsx             # Root metadata/layout
│   ├── page.tsx               # Main script-generation UI
│   └── providers.tsx          # App-level providers
├── lib/
│   ├── constants.ts           # Tone and length options
│   ├── prompts.ts             # Prompt builders for multi-script output
│   └── types.ts               # Shared TypeScript types
├── public/                    # Static assets
├── tests/
│   ├── e2e/                   # Playwright tests
│   └── unit/                  # Vitest tests
├── .env.example               # Safe env template
├── eslint.config.mjs          # ESLint config
├── playwright.config.ts       # Playwright config
├── vitest.config.ts           # Vitest config
└── package.json
```

## How Generation Works

1. The browser sends `{ prompt, tone, length }` to `POST /api/generate`.
2. The route validates the request body and rejects invalid prompt, tone, or length values.
3. `lib/prompts.ts` builds a tone-aware system prompt and a topic-specific user message.
4. The server calls OpenRouter's OpenAI-compatible `/chat/completions` endpoint with `anthropic/claude-sonnet-4` by default.
5. The model is asked to produce JSON beginning with `{"scripts":[`.
6. The route extracts and validates the JSON, clamps viral scores, and returns up to three script options.

The API key stays server-side in `.env.local`. The browser never receives the key or raw OpenRouter response.

## Design System

ScriptForge uses a warm editorial style inspired by premium writing tools:

- Parchment/light and dark workspace themes
- Serif display typography for editorial tone
- Warm neutral surfaces and borders
- Red, blue, and green accents for tone-specific script options
- Animated prompt placeholder, theme transitions, and script result cards

## Repository Hygiene

The repository intentionally tracks only source, tests, public assets, and safe configuration. The following are ignored and should not be pushed:

- `.env.local` and all real env files
- `node_modules/`, `.next/`, build output, coverage, and test artifacts
- Playwright reports and screenshots
- Local AI-agent/tooling folders such as `.claude/`, `.claude-flow/`, `.agents/`, and `agents/`
- Generated design/code-analysis artifacts such as `design/`, `design-images/`, `graphify-out/`, and `DESIGN.md`
- Ad-hoc local scripts such as `test-llm.js`, especially because they can contain secrets

If a secret is ever committed or shared publicly, rotate it immediately in OpenRouter.

## Deployment on Vercel

1. Push the cleaned repository to GitHub.
2. Import the project in Vercel.
3. Add `OPENROUTER_API_KEY` in Vercel Project Settings.
4. Optionally add `OPENROUTER_MODEL=anthropic/claude-sonnet-4`.
5. Deploy.

## Notes

- `.env.example` is safe to commit and documents required variables.
- `.env.local` is ignored and should contain your real OpenRouter key.
- The default model was verified through OpenRouter without starting the dev server.
