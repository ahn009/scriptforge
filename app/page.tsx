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
      viewerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          tone,
          length,
        }),
      });

      if (!response.ok) {
        let message = "Generation failed.";
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          /* ignore */
        }
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
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setScript("");
    setError(null);
    setIsGenerating(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.55,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  return (
    <div className="relative min-h-screen w-full">
      <div className="ambient-glow-left" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 sm:px-6 md:px-8 pb-24">
        <Header />

        <div ref={formRef} className="space-y-7 md:space-y-8">
          <motion.div {...stagger(0.05)}>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={isGenerating}
            />
          </motion.div>

          <motion.div {...stagger(0.12)}>
            <ToneSelector
              value={tone}
              onChange={setTone}
              disabled={isGenerating}
            />
          </motion.div>

          <motion.div {...stagger(0.2)}>
            <LengthSelector
              value={length}
              onChange={setLength}
              disabled={isGenerating}
            />
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
              className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--accent-dramatic)]/30 bg-[var(--accent-dramatic-dim)] px-4 py-3"
              role="alert"
            >
              <AlertCircle
                size={18}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-[var(--accent-dramatic)]"
              />
              <div className="flex-1">
                <div className="text-[10px] font-body tracking-[0.2em] uppercase text-[var(--accent-dramatic)] mb-0.5">
                  Error
                </div>
                <div className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                  {error}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={viewerRef}>
          {hasOutput && (
            <ScriptViewer
              script={script}
              isGenerating={isGenerating}
              tone={tone}
              length={length}
              onReset={handleReset}
            />
          )}
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 md:mt-20"
        >
          <div className="border-t border-[var(--border-subtle)] pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-[11px] text-[var(--text-muted)] font-body">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Bank-grade encryption</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
            </div>
            <div className="text-center mt-5 text-xs text-[var(--text-muted)] font-body">
              Built for Blue Foxes AI Content Lab · Powered by Claude
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
