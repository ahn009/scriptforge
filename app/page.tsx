"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
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

  const viewerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const ready = Boolean(prompt.trim() && tone && length);
  const hasOutput = Boolean(script) || isGenerating;

  async function handleGenerate() {
    if (!ready || isGenerating) return;
    setIsGenerating(true);
    setScript("");
    setError(null);
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <div className="page-bg flex flex-col items-center">
      <div className="w-full max-w-xl px-4 sm:px-6 pb-28">
        <Header />

        <div ref={formRef} className="space-y-5">
          <motion.div {...stagger(0.05)}>
            <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />
          </motion.div>

          <motion.div {...stagger(0.12)}>
            <ToneSelector value={tone} onChange={setTone} disabled={isGenerating} />
          </motion.div>

          <motion.div {...stagger(0.2)}>
            <LengthSelector value={length} onChange={setLength} disabled={isGenerating} />
          </motion.div>

          <motion.div {...stagger(0.28)}>
            <GenerateButton
              onClick={handleGenerate}
              isGenerating={isGenerating}
              disabled={!ready || isGenerating}
              ready={ready}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="mt-5 flex items-start gap-3 rounded-xl px-4 py-4"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}
              role="alert"
            >
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#dc2626" }}>Error</div>
                <div className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={viewerRef}>
          {hasOutput && (
            <ScriptViewer script={script} isGenerating={isGenerating} tone={tone} length={length} onReset={handleReset} />
          )}
        </div>

        <footer className="mt-16 pb-2 border-t pt-8" style={{ borderColor: "var(--border)" }}>
          <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Built for Blue Foxes AI Content Lab · Powered by Gemini
          </p>
        </footer>
      </div>
    </div>
  );
}
