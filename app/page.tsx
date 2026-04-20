"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import ToneSelector from "@/components/ToneSelector";
import LengthSelector from "@/components/LengthSelector";
import GenerateButton from "@/components/GenerateButton";
import ScriptViewer from "@/components/ScriptViewer";
import type { Tone, VideoLength } from "@/lib/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Tone | null>(null);
  const [length, setLength] = useState<VideoLength | null>(null);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputPanelRef = useRef<HTMLDivElement>(null);

  const ready = Boolean(prompt.trim() && tone && length);
  const hasOutput = Boolean(script) || isGenerating;

  async function handleGenerate() {
    if (!ready || isGenerating) return;
    setIsGenerating(true);
    setScript("");
    setError(null);
    setTimeout(() => {
      outputPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), tone, length }),
      });
      if (!response.ok) {
        let message = "Generation failed.";
        try { const body = await response.json(); if (body?.error) message = body.error; } catch { /* ignore */ }
        throw new Error(message);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream.");
      let streamedError: string | null = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const errIdx = chunk.indexOf("[ERROR]");
        if (errIdx !== -1) {
          const before = chunk.slice(0, errIdx);
          if (before) setScript((prev) => prev + before);
          streamedError = chunk.slice(errIdx + "[ERROR]".length).trim();
          continue;
        }
        setScript((prev) => prev + chunk);
      }
      if (streamedError) throw new Error(streamedError);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setScript("");
    setError(null);
    setIsGenerating(false);
  }

  return (
    <div
      className="flex flex-col md:h-screen md:overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <Header onReset={hasOutput ? handleReset : undefined} />

      {/* Split workspace */}
      <div className="relative flex flex-col md:flex-row flex-1 pt-16 md:overflow-hidden">

        {/* ── LEFT PANEL: Input ── */}
        <div
          className="w-full md:w-[42%] md:overflow-y-auto md:border-r flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-6 lg:p-8 pb-16">

            {/* Panel heading */}
            <div className="mb-8">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Workspace
              </p>
              <h2
                className="font-display text-2xl font-medium leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Build your script
              </h2>
            </div>

            {/* Sections with dividers */}
            <div className="pb-7">
              <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />
            </div>

            <div className="border-t pt-7 pb-7" style={{ borderColor: "var(--border)" }}>
              <ToneSelector value={tone} onChange={setTone} disabled={isGenerating} />
            </div>

            <div className="border-t pt-7 pb-7" style={{ borderColor: "var(--border)" }}>
              <LengthSelector value={length} onChange={setLength} disabled={isGenerating} />
            </div>

            <div className="border-t pt-7" style={{ borderColor: "var(--border)" }}>
              <GenerateButton
                onClick={handleGenerate}
                isGenerating={isGenerating}
                disabled={!ready || isGenerating}
                ready={ready}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="mt-5 flex items-start gap-3 rounded-xl px-4 py-4"
                  style={{
                    background: "rgba(220,38,38,0.07)",
                    border: "1px solid rgba(220,38,38,0.20)",
                  }}
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

        {/* ── RIGHT PANEL: Output ── */}
        <div
          ref={outputPanelRef}
          className="flex-1 md:overflow-y-auto border-t md:border-t-0"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in srgb, var(--bg-base) 60%, var(--bg-surface))",
          }}
        >
          <div className="max-w-3xl mx-auto p-6 lg:p-10 pb-16">
            {hasOutput ? (
              <ScriptViewer
                script={script}
                isGenerating={isGenerating}
                tone={tone}
                length={length}
                onReset={handleReset}
              />
            ) : (
              <EmptyOutputState />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyOutputState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex flex-col items-center justify-center min-h-[320px] md:min-h-[calc(100vh-8rem)] text-center px-8"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
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
        Start with an idea.
        <br />
        <span style={{ color: "var(--text-tertiary)" }}>We&apos;ll turn it into a story.</span>
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.38 }}
        className="text-sm leading-relaxed max-w-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Fill in your idea, pick a tone and length, then hit Generate.
      </motion.p>
    </motion.div>
  );
}
