"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import ToneSelector from "@/components/ToneSelector";
import LengthSelector from "@/components/LengthSelector";
import GenerateButton from "@/components/GenerateButton";
import ScriptViewer from "@/components/ScriptViewer";
import ScriptVariantTabs from "@/components/ScriptVariantTabs";
import type { Tone, VideoLength, ScriptVariation, VariantId } from "@/lib/types";
import { scriptVariationToText } from "@/lib/types";

const EXAMPLE_PROMPTS = [
  '"A motivational story about failure turning into success"',
  '"How one decision changed the course of human history"',
  '"The morning routine that 10x\'d my productivity"',
  '"Why most people never achieve their potential — and what to do about it"',
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Tone | null>(null);
  const [length, setLength] = useState<VideoLength | null>(null);
  const [scripts, setScripts] = useState<ScriptVariation[]>([]);
  const [activeId, setActiveId] = useState<VariantId>("A");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(prompt.trim() && tone && length);
  const hasOutput = scripts.length > 0 || isLoading;
  const activeScript = scripts.find((s) => s.id === activeId) ?? null;

  const missingField = !prompt.trim()
    ? "Add your idea above to continue"
    : !tone
    ? "Select a tone to continue"
    : !length
    ? "Choose a video length to continue"
    : null;

  async function handleGenerate() {
    if (!ready || isLoading) return;
    setIsLoading(true);
    setScripts([]);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), tone, length }),
      });
      let data: { scripts?: ScriptVariation[]; error?: string };
      try { data = await response.json(); } catch { throw new Error("Invalid server response."); }
      if (!response.ok) throw new Error(data.error ?? "Generation failed.");
      if (!data.scripts?.length) throw new Error("No scripts returned. Please try again.");
      setScripts(data.scripts);
      setActiveId("A");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setScripts([]);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <Header onReset={hasOutput ? handleReset : undefined} />

      {/* Split workspace */}
      <div className="relative flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Input ── */}
        <div
          className="w-full md:w-[42%] flex flex-col overflow-hidden shrink-0 border-b md:border-b-0 md:border-r"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Scrollable inputs area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">

            {/* Panel heading */}
            <div className="mb-8 flex-shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "var(--text-muted)" }}>
                Workspace
              </p>
              <h2 className="font-display text-2xl font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
                Build your script
              </h2>
            </div>

            {/* Inputs */}
            <div>
              <div className="pb-7">
                <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
              </div>
              <div className="border-t pt-7 pb-7" style={{ borderColor: "var(--border)" }}>
                <ToneSelector value={tone} onChange={setTone} disabled={isLoading} />
              </div>
              <div className="border-t pt-7" style={{ borderColor: "var(--border)" }}>
                <LengthSelector value={length} onChange={setLength} disabled={isLoading} />
              </div>
            </div>

          </div>

          {/* Button — pinned outside scroll, anchored to bottom */}
          <div className="shrink-0 p-6 lg:p-8 pt-0 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="pt-7">
              <GenerateButton
                onClick={handleGenerate}
                isGenerating={isLoading}
                disabled={!ready || isLoading}
                ready={ready}
                missingField={missingField}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                    className="mt-4 flex items-start gap-3 rounded-xl px-4 py-4"
                    style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.20)" }}
                    role="alert"
                  >
                    <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#dc2626" }}>Error</div>
                      <div className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{error}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Output ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in srgb, var(--bg-base) 40%, var(--bg-surface))",
          }}
        >
          <div className="max-w-3xl mx-auto p-6 lg:p-10 pb-16">
            {isLoading ? (
              <GeneratingState />
            ) : scripts.length > 0 && activeScript ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ScriptVariantTabs
                  scripts={scripts}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
                <ScriptViewer
                  key={activeId}
                  script={scriptVariationToText(activeScript)}
                  isGenerating={false}
                  tone={tone}
                  length={length}
                  onReset={handleReset}
                />
              </motion.div>
            ) : (
              <EmptyOutputState />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-6">
        {["A", "B", "C"].map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.08 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <span className="w-5 h-5 rounded-md shimmer" style={{ minWidth: 20 }} />
            <div className="w-6 h-2 rounded shimmer" />
            <div className="w-12 h-1 rounded-full shimmer" />
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="px-6 py-3.5 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
          <div className="w-16 h-5 rounded-full shimmer" />
          <div className="w-12 h-5 rounded-full shimmer" />
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            <div className="w-14 h-3 rounded shimmer" />
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-8">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--accent)", opacity: 0.6 }}>Hook</div>
            <div className="border-l-2 pl-5 space-y-2.5" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
              <div className="h-7 w-4/5 rounded-md shimmer" />
              <div className="h-7 w-3/5 rounded-md shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px shimmer" />
            <div className="w-10 h-3 rounded shimmer" />
            <div className="flex-1 h-px shimmer" />
          </div>
          <div className="pl-5 border-l-2 space-y-3" style={{ borderColor: "var(--border-strong)" }}>
            <div className="h-6 w-2/5 rounded-md shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-4 w-11/12 rounded shimmer" />
            <div className="h-4 w-4/5 rounded shimmer" />
          </div>
          <div className="pl-5 border-l-2 space-y-3" style={{ borderColor: "var(--border-strong)" }}>
            <div className="h-6 w-1/3 rounded-md shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-4 w-5/6 rounded shimmer" />
          </div>
        </div>
      </div>
      <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
        Generating 3 distinct scripts — this takes ~15 seconds
      </p>
    </div>
  );
}

function EmptyOutputState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex flex-col items-center justify-center h-full min-h-[320px] text-center px-6"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <Sparkles size={22} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.28 }}
        className="font-display text-2xl font-medium mb-3 leading-tight"
        style={{ color: "var(--text-secondary)" }}
      >
        Start with an idea
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.34 }}
        className="text-sm leading-relaxed max-w-sm mb-8"
        style={{ color: "var(--text-muted)" }}
      >
        Describe your video idea and we&apos;ll generate 3 high-performing script variations, each scored for viral potential.
      </motion.p>

      {/* Example prompts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.42 }}
        className="w-full max-w-sm space-y-2"
      >
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
          Example ideas
        </p>
        {EXAMPLE_PROMPTS.map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.48 + i * 0.06 }}
            className="text-left px-4 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-tertiary)",
            }}
          >
            {ex}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
