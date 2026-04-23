"use client";

import { useState, useEffect } from "react";
import type { Tone, VideoLength, ScriptVariation, VariantId } from "@/lib/types";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";

const TOPIC_EXAMPLES = [
  "Why sleep matters more than exercise for fat loss…",
  "The dark history behind Cleopatra's rise to power…",
  "5 habits that completely changed my life in 30 days…",
  "Why most people quit the gym by February…",
  "The science of why we procrastinate everything…",
  "How one decision changed the course of history…",
];

function useCyclingPlaceholder() {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    const target = TOPIC_EXAMPLES[idx];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (charIdx < target.length) {
        t = setTimeout(() => { setText(target.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 55);
      } else {
        t = setTimeout(() => setPhase("pausing"), 1800);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("deleting"), 100);
    } else {
      if (charIdx > 0) {
        t = setTimeout(() => { setText(target.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 28);
      } else {
        setIdx(i => (i + 1) % TOPIC_EXAMPLES.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [phase, charIdx, idx]);

  return text;
}

/* ── Theme ────────────────────────────────────────────────────── */

type Theme = "light" | "dark";
type ThemeColors = Record<string, string>;

const T = {
  light: {
    pageBg:         "#f5f4ed",
    panelBg:        "#f5f4ed",
    card:           "#faf9f5",
    cardBorder:     "#f0eee6",
    inputBg:        "#faf9f5",
    inputBorder:    "#e8e6dc",
    border:         "#e8e6dc",
    text:           "#141413",
    textSub:        "#5e5d59",
    textMuted:      "#87867f",
    textDim:        "#b0aea5",
    activeBtn:      "#141413",
    activeBtnBdr:   "#30302e",
    activeBtnText:  "#faf9f5",
    activeBtnSub:   "#b0aea5",
    inactiveBtn:    "#faf9f5",
    inactiveBtnBdr: "#e8e6dc",
    scoreTrack:     "#e8e6dc",
    headerBg:       "#f5f4ed",
    headerBorder:   "#e8e6dc",
    toggleBg:       "#f0eee6",
    toggleIcon:     "#5e5d59",
    emptyIcon:      "#f0eee6",
    errorBg:        "#fdf2f2",
    errorBdr:       "#f5cece",
    errorText:      "#b53333",
    hookBg:         "#fdf6f2",
    hookBdr:        "#f0ddd4",
  },
  dark: {
    pageBg:         "#141413",
    panelBg:        "#1a1a18",
    card:           "#30302e",
    cardBorder:     "#3d3d3a",
    inputBg:        "#30302e",
    inputBorder:    "#4d4c48",
    border:         "#30302e",
    text:           "#faf9f5",
    textSub:        "#b0aea5",
    textMuted:      "#87867f",
    textDim:        "#5e5d59",
    activeBtn:      "#faf9f5",
    activeBtnBdr:   "#e8e6dc",
    activeBtnText:  "#141413",
    activeBtnSub:   "#5e5d59",
    inactiveBtn:    "#30302e",
    inactiveBtnBdr: "#4d4c48",
    scoreTrack:     "#4d4c48",
    headerBg:       "#141413",
    headerBorder:   "#30302e",
    toggleBg:       "#30302e",
    toggleIcon:     "#b0aea5",
    emptyIcon:      "#30302e",
    errorBg:        "#2a1a1a",
    errorBdr:       "#5c2222",
    errorText:      "#d97757",
    hookBg:         "#2a1e1a",
    hookBdr:        "#4a2e24",
  },
} as const;

/* ── Score bar ───────────────────────────────────────────────── */

function ScoreBar({
  label,
  value,
  textMuted,
  textSub,
  scoreTrack,
}: {
  label: string;
  value: number;
  textMuted: string;
  textSub: string;
  scoreTrack: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-32 shrink-0" style={{ color: textMuted }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: scoreTrack }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: "#c96442" }}
        />
      </div>
      <span className="text-xs font-medium w-7 text-right" style={{ color: textSub }}>{value}</span>
    </div>
  );
}

/* ── Section tag pill ─────────────────────────────────────────── */

const TAG_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  hook:       { bg: "#f5ebe6", text: "#c96442", label: "Hook" },
  section:    { bg: "#f0eee6", text: "#5e5d59", label: "Section" },
  conclusion: { bg: "#eef0e8", text: "#4a5340", label: "Conclusion" },
  cta:        { bg: "#fce8e8", text: "#b53333", label: "Call to Action" },
  pause:      { bg: "#f0eee6", text: "#87867f", label: "Pause" },
  broll:      { bg: "#e8ecf0", text: "#3d5a72", label: "B-Roll" },
};

function SectionPill({ type }: { type: string }) {
  const s = TAG_COLORS[type] ?? TAG_COLORS.section;
  return (
    <span
      className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

/* ── Script viewer ────────────────────────────────────────────── */

function ScriptViewer({ script, c }: { script: ScriptVariation; c: ThemeColors }) {
  const [copied, setCopied] = useState(false);
  const bd = script.score_breakdown;

  const scriptText = script.sections
    .filter((s) => s.type !== "pause" && s.type !== "broll")
    .map((s) => {
      if (s.type === "hook") return `[HOOK]\n${s.text ?? ""}`;
      if (s.type === "section") return `[${s.title ?? "Section"}]\n${s.text ?? ""}`;
      if (s.type === "conclusion") return `[CONCLUSION]\n${s.text ?? ""}`;
      if (s.type === "cta") return `[CALL TO ACTION]\n${s.text ?? ""}`;
      return s.text ?? "";
    })
    .filter(Boolean)
    .join("\n\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = scriptText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl p-5 border"
        style={{ backgroundColor: c.card, borderColor: c.cardBorder }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium tracking-wide uppercase mb-0.5" style={{ color: c.textMuted }}>
              Viral Score
            </p>
            <p
              className="text-4xl font-medium"
              style={{ fontFamily: "Georgia, serif", color: c.text, lineHeight: 1.1 }}
            >
              {script.viral_score}
              <span className="text-lg" style={{ color: c.textMuted }}>/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border cursor-pointer"
              style={{
                backgroundColor: copied ? "#1a3a28" : c.inputBg,
                borderColor:     copied ? "#2d6b44" : c.border,
                color:           copied ? "#6fcf97" : c.textSub,
              }}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy script
                </>
              )}
            </button>
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: c.textMuted }}>{script.hook_type}</p>
              <p className="text-xs font-medium" style={{ color: c.textSub }}>{script.structure}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ScoreBar label="Hook Strength"     value={bd.hook_strength}     textMuted={c.textMuted} textSub={c.textSub} scoreTrack={c.scoreTrack} />
          <ScoreBar label="Curiosity Gap"     value={bd.curiosity_gap}     textMuted={c.textMuted} textSub={c.textSub} scoreTrack={c.scoreTrack} />
          <ScoreBar label="Retention Flow"    value={bd.retention_flow}    textMuted={c.textMuted} textSub={c.textSub} scoreTrack={c.scoreTrack} />
          <ScoreBar label="Emotional Trigger" value={bd.emotional_trigger} textMuted={c.textMuted} textSub={c.textSub} scoreTrack={c.scoreTrack} />
          <ScoreBar label="CTA Strength"      value={bd.cta_strength}      textMuted={c.textMuted} textSub={c.textSub} scoreTrack={c.scoreTrack} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {script.sections.map((section, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: section.type === "hook" ? c.hookBg : c.card,
              borderColor:     section.type === "hook" ? c.hookBdr : c.cardBorder,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <SectionPill type={section.type} />
              {section.title && (
                <span className="text-xs" style={{ color: c.textMuted }}>{section.title}</span>
              )}
            </div>
            {section.type === "pause" ? (
              <p className="text-sm italic" style={{ color: c.textMuted }}>[pause]</p>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: c.textSub }}>{section.text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Variant tab ─────────────────────────────────────────────── */

function VariantTab({
  id, active, score, onClick, c,
}: {
  id: VariantId; active: boolean; score: number; onClick: () => void; c: ThemeColors;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: active ? c.activeBtn      : c.inactiveBtn,
        color:           active ? c.activeBtnText  : c.textSub,
        boxShadow:       active ? `0 0 0 1px ${c.activeBtnBdr}` : "0 0 0 1px transparent",
      }}
    >
      <span className="text-xs font-medium tracking-widest uppercase">Variant</span>
      <span className="text-lg font-medium" style={{ fontFamily: "Georgia, serif" }}>{id}</span>
      <span className="text-xs opacity-70">{score}/100</span>
    </button>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

function EmptyState({ c }: { c: ThemeColors }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: c.emptyIcon }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <div>
        <p className="text-xl font-medium mb-1" style={{ fontFamily: "Georgia, serif", color: c.text }}>
          Your scripts will appear here
        </p>
        <p className="text-sm max-w-xs" style={{ color: c.textMuted }}>
          Fill in your topic, choose a tone and length, then generate three unique script variations.
        </p>
      </div>
    </div>
  );
}

/* ── Generating state ────────────────────────────────────────── */

function GeneratingState({ c }: { c: ThemeColors }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderTopColor: "#c96442", borderRightColor: c.scoreTrack, borderBottomColor: c.scoreTrack, borderLeftColor: c.scoreTrack }}
        />
      </div>
      <div>
        <p className="text-xl font-medium mb-1" style={{ fontFamily: "Georgia, serif", color: c.text }}>
          Crafting your scripts
        </p>
        <p className="text-sm" style={{ color: c.textMuted }}>Generating three unique variations…</p>
      </div>
    </div>
  );
}

/* ── Theme toggle icon ──────────────────────────────────────── */

function SunIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function Home() {
  const [theme, setTheme]           = useState<Theme>("dark");
  const [prompt, setPrompt]         = useState("");
  const [tone, setTone]             = useState<Tone>("dramatic");
  const [length, setLength]         = useState<VideoLength>("3min");
  const [scripts, setScripts]       = useState<ScriptVariation[]>([]);
  const [activeVariant, setActive]  = useState<VariantId>("A");
  const [appState, setAppState]     = useState<"idle" | "generating" | "done" | "error">("idle");
  const [error, setError]           = useState<string | null>(null);

  const animatedPlaceholder = useCyclingPlaceholder();
  const c = T[theme];
  const activeScript = scripts.find((s) => s.id === activeVariant) ?? scripts[0];
  const canGenerate = appState !== "generating" && prompt.trim().length >= 3;

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed.length < 3) return;
    setAppState("generating");
    setError(null);
    setScripts([]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 75000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, tone, length }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setScripts(data.scripts);
      setActive("A");
      setAppState("done");
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
      setAppState("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.pageBg }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: c.headerBg, borderColor: c.headerBorder }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#c96442" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#faf9f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-lg font-medium" style={{ fontFamily: "Georgia, serif", color: c.text }}>
            ScriptForge AI
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <p className="text-sm hidden sm:block" style={{ color: c.textMuted }}>
            Three variations, scored for virality
          </p>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer border"
            style={{
              backgroundColor: c.toggleBg,
              borderColor: c.border,
              boxShadow: `0 0 0 1px transparent`,
            }}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light"
              ? <MoonIcon color={c.toggleIcon} />
              : <SunIcon  color={c.toggleIcon} />}
          </button>
        </div>
      </header>

      {/* ── Main layout ────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">

        {/* ── Left: Input panel ──────────────────────────────── */}
        <div
          className="w-full md:w-[420px] lg:w-[460px] shrink-0 flex flex-col border-r overflow-y-auto"
          style={{ borderColor: c.border, backgroundColor: c.panelBg }}
        >
          <div className="flex flex-col gap-6 p-6 lg:p-8">

            {/* Heading */}
            <div>
              <h1
                className="text-3xl font-medium mb-1.5"
                style={{ fontFamily: "Georgia, serif", color: c.text, lineHeight: 1.2 }}
              >
                Craft your script
              </h1>
              <p className="text-sm" style={{ color: c.textMuted, lineHeight: 1.6 }}>
                Describe your video topic and we'll generate three unique, viral-optimised scripts.
              </p>
            </div>

            {/* Prompt textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: c.textSub }}>Your topic</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={animatedPlaceholder}
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm border transition-all duration-150"
                style={{
                  backgroundColor: c.inputBg,
                  color: c.text,
                  borderColor: c.inputBorder,
                  lineHeight: 1.6,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3898ec";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(56,152,236,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = c.inputBorder;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <div className="flex justify-end">
                <span className="text-xs" style={{ color: c.textMuted }}>{prompt.length}/500</span>
              </div>
            </div>

            {/* Tone selector */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium" style={{ color: c.textSub }}>Tone</label>
              <div className="flex flex-col gap-2">
                {TONE_OPTIONS.map((opt) => {
                  const active = tone === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTone(opt.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: active ? c.activeBtn      : c.inactiveBtn,
                        borderColor:     active ? c.activeBtnBdr   : c.inactiveBtnBdr,
                        boxShadow:       active ? `0 0 0 1px ${c.activeBtnBdr}` : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: active ? (theme === "dark" ? "#4d4c48" : "#30302e") : c.emptyIcon }}
                      >
                        {opt.id === "dramatic"  && <span style={{ fontSize: 15 }}>🔥</span>}
                        {opt.id === "neutral"   && <span style={{ fontSize: 15 }}>⚖️</span>}
                        {opt.id === "uplifting" && <span style={{ fontSize: 15 }}>✨</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: active ? c.activeBtnText : c.text }}>
                          {opt.label}
                        </span>
                        <span className="text-xs" style={{ color: active ? c.activeBtnSub : c.textMuted }}>
                          {opt.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length selector */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium" style={{ color: c.textSub }}>Length</label>
              <div className="grid grid-cols-2 gap-2">
                {LENGTH_OPTIONS.map((opt) => {
                  const active = length === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setLength(opt.id)}
                      className="flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer text-left"
                      style={{
                        backgroundColor: active ? c.activeBtn      : c.inactiveBtn,
                        borderColor:     active ? c.activeBtnBdr   : c.inactiveBtnBdr,
                        boxShadow:       active ? `0 0 0 1px ${c.activeBtnBdr}` : "none",
                      }}
                    >
                      <span
                        className="text-base font-medium"
                        style={{ fontFamily: "Georgia, serif", color: active ? c.activeBtnText : c.text }}
                      >
                        {opt.label}
                      </span>
                      <span className="text-xs" style={{ color: active ? c.activeBtnSub : c.textMuted }}>
                        ~{opt.wordRange} words
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-3 px-6 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: canGenerate ? "#c96442"  : c.scoreTrack,
                color:           canGenerate ? "#faf9f5"  : c.textMuted,
                boxShadow:       canGenerate ? "0 0 0 1px #c96442" : "none",
                cursor:          canGenerate ? "pointer"  : "not-allowed",
              }}
            >
              {appState === "generating" ? "Generating…" : "Generate Scripts"}
            </button>

            {/* Error */}
            {appState === "error" && error && (
              <div
                className="rounded-xl px-4 py-3 text-sm border"
                style={{ backgroundColor: c.errorBg, borderColor: c.errorBdr, color: c.errorText }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Output panel ─────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: c.pageBg }}>
          {appState === "idle"      && <EmptyState       c={c} />}
          {appState === "generating" && <GeneratingState c={c} />}
          {(appState === "done" || appState === "error") && scripts.length > 0 && (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Variant tabs */}
              <div
                className="flex items-center gap-2 px-6 py-4 border-b shrink-0"
                style={{ borderColor: c.border }}
              >
                <span className="text-xs font-medium mr-1" style={{ color: c.textMuted }}>Variant</span>
                {scripts.map((s) => (
                  <VariantTab
                    key={s.id}
                    id={s.id}
                    active={activeVariant === s.id}
                    score={s.viral_score}
                    onClick={() => setActive(s.id)}
                    c={c}
                  />
                ))}
              </div>

              {/* Script content */}
              {activeScript && (
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <ScriptViewer script={activeScript} c={c} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
