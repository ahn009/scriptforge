# ScriptForge AI — Claude Code Configuration

## Behavioral Rules
- Do what has been asked; nothing more, nothing less
- ALWAYS prefer editing an existing file to creating a new one
- NEVER commit secrets or .env files
- Keep files under 500 lines
- Use typed interfaces for all public APIs

## Project Architecture
- Next.js App Router (TypeScript)
- Tailwind CSS + Framer Motion for styling/animation
- Google Gemini API (gemini-flash-latest) via server-side streaming route
- Streaming SSE responses (parsed server-side, relayed as text chunks)
- Mobile-first responsive design

## Design System: "Obsidian Editorial"
- Dark luxury aesthetic with warm amber accents
- Typography: Playfair Display (serif display) + DM Sans (body)
- Micro-interactions on every interactive element
- Glass morphism cards with noise texture backgrounds
- NO generic AI aesthetics (no purple gradients, no Inter font, no cookie-cutter layouts)

## File Organization
- `/app` — Pages and API routes
- `/components` — React components
- `/lib` — Utilities, types, constants, prompts
- `/public` — Static assets
