"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Sparkles, Plus } from "lucide-react";
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

/* ─── Sidebar Nav ──────────────────────────────────────────── */
function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Nav panel */}
      <nav
        className="fixed left-0 top-0 h-screen z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          background: "var(--sf-nav)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="px-8 pt-8 pb-6 flex flex-col gap-1">
          <span
            className="text-xl"
            style={{
              fontFamily: '"Newsreader", Georgia, serif',
              color: "#f59e0b",
              fontStyle: "italic",
            }}
          >
            ScriptForge AI
          </span>
          <span className="text-[11px] uppercase tracking-[0.05em]" style={{ color: "var(--text-muted)" }}>
            Premium AI Suite
          </span>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col mt-2">
          {/* Active: The Forge */}
          <a
            href="#"
            className="flex items-center gap-4 py-4 px-8 border-r-2 transition-all font-medium"
            style={{
              color: "#f59e0b",
              borderColor: "#f59e0b",
              background: "linear-gradient(to right, rgba(245,158,11,0.07), transparent)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
              <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.05em]">The Forge</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-4 py-3.5 px-8 transition-colors hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.05em]">Manuscripts</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-4 py-3.5 px-8 transition-colors hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.05em]">Directives</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-4 py-3.5 px-8 transition-colors hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
              <path d="M20 6h-2.18c.07-.44.18-.88.18-1.35C18 2.53 15.5 1 13 1c-1.35 0-2.56.5-3.43 1.34C8.31 1.5 7.1 1 5.83 1 4.07 1 2 2.14 2 4.65 2 7.3 4.24 8.97 7.57 12H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7v1H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h7c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-7v-1h7c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-3.57c3.33-3.03 5.57-4.7 5.57-7.35C20 7.43 20 6.06 20 6z" />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.05em]">Archive</span>
          </a>
        </div>

        {/* Bottom — create new + support */}
        <div className="p-6 flex flex-col gap-3" style={{ borderTop: "1px solid var(--divider)" }}>
          <button
            type="button"
            className="w-full flex items-center justify-between py-3 px-4 text-[11px] uppercase tracking-[0.05em] transition-colors hover:opacity-80 cursor-pointer"
            style={{
              background: "var(--sf-interactive)",
              color: "var(--text-secondary)",
              borderRadius: "0.125rem",
            }}
          >
            Create New Script
            <Plus size={14} strokeWidth={1.75} />
          </button>

          <div className="flex flex-col gap-1 mt-2">
            <a href="#" className="flex items-center gap-3 py-2 px-2 text-[11px] uppercase tracking-[0.05em] transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              Support
            </a>
            <a href="#" className="flex items-center gap-3 py-2 px-2 text-[11px] uppercase tracking-[0.05em] transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              Account
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

/* ─── Mobile Bottom Nav ──────────────────────────────────── */
function MobileBottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 z-50"
      style={{ background: "rgba(19,19,20,0.95)", backdropFilter: "blur(20px)" }}
    >
      <a href="#" className="flex flex-col items-center gap-1 py-2 px-5" style={{ color: "var(--text-muted)" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        <span className="text-[10px] uppercase font-bold tracking-tighter">Input</span>
      </a>
      <a href="#" className="flex flex-col items-center gap-1 py-2 px-5" style={{ color: "#f59e0b" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
        <span className="text-[10px] uppercase font-bold tracking-tighter">Stage</span>
      </a>
      <a href="#" className="flex flex-col items-center gap-1 py-2 px-5" style={{ color: "var(--text-muted)" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8V9zm0 3h4v2h-4v-2zm0-6h8v2h-8V6z" />
        </svg>
        <span className="text-[10px] uppercase font-bold tracking-tighter">Library</span>
      </a>
    </nav>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "var(--sf-canvas)" }}
    >
      {/* Sidebar */}
      <SideNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — shifts right when sidebar is open on desktop */}
      <div
        className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? "16rem" : "0" }}
      >
        <Header
          onReset={hasOutput ? handleReset : undefined}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {/* Two-panel workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── LEFT PANEL: Directive Parameters ── */}
          <aside
            className="w-full md:w-[35%] flex flex-col h-full overflow-hidden shrink-0"
            style={{
              background: "var(--sf-panel)",
              boxShadow: "20px 0 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Scrollable inputs */}
            <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-10">
              {/* Panel heading */}
              <div className="space-y-2">
                <h2
                  className="text-2xl leading-tight"
                  style={{
                    fontFamily: '"Newsreader", Georgia, serif',
                    color: "var(--text-primary)",
                  }}
                >
                  Directive Parameters
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Define the structural core of your manuscript.
                </p>
              </div>

              <PromptInput value={prompt} onChange={setPrompt} disabled={isLoading} />
              <ToneSelector value={tone} onChange={setTone} disabled={isLoading} />
              <LengthSelector value={length} onChange={setLength} disabled={isLoading} />
            </div>

            {/* Generate CTA — pinned to bottom */}
            <div
              className="shrink-0 px-8 py-6"
              style={{ borderTop: "1px solid var(--divider)", background: "var(--sf-panel)" }}
            >
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
                    className="mt-4 flex items-start gap-3 px-4 py-4"
                    style={{
                      background: "rgba(220,38,38,0.07)",
                      border: "1px solid rgba(220,38,38,0.18)",
                      borderRadius: "0.125rem",
                    }}
                    role="alert"
                  >
                    <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                    <div>
                      <div
                        className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "#f87171" }}
                      >
                        Error
                      </div>
                      <div className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                        {error}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* ── RIGHT PANEL: The Stage ── */}
          <section
            className="flex-1 h-full overflow-y-auto"
            style={{ background: "var(--sf-canvas)" }}
          >
            <div className="flex justify-center px-6 py-10 md:px-12 md:py-16 lg:px-20 lg:py-20 pb-28">
              <div className="w-full max-w-[720px]">
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
          </section>

        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

/* ─── Generating skeleton ────────────────────────────────── */
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
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: "var(--sf-panel)" }}
          >
            <span className="w-5 h-5 shimmer" style={{ borderRadius: "0.125rem", minWidth: 20 }} />
            <div className="w-6 h-2 rounded shimmer" />
            <div className="w-10 h-1 rounded shimmer" />
          </motion.div>
        ))}
      </div>

      <div
        className="flex flex-col gap-10 p-8 md:p-14"
        style={{ background: "var(--sf-article)", boxShadow: "0px 20px 40px rgba(0,0,0,0.4)" }}
      >
        <div className="flex flex-col items-center gap-3 pb-8" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div className="w-36 h-2.5 rounded shimmer" />
          <div className="w-48 h-3 rounded shimmer" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-24 h-2 rounded shimmer" />
          <div className="h-8 w-full rounded shimmer" />
          <div className="h-8 w-4/5 rounded shimmer" />
        </div>
        <div style={{ height: "1px", background: "var(--divider)" }} />
        <div className="flex flex-col gap-3">
          <div className="h-5 w-2/5 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-11/12 rounded shimmer" />
          <div className="h-4 w-4/5 rounded shimmer" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-5 w-1/3 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-5/6 rounded shimmer" />
        </div>
      </div>

      <p className="text-center text-[11px] uppercase tracking-[0.06em] mt-2" style={{ color: "var(--text-muted)" }}>
        Generating 3 distinct scripts — this takes ~15 seconds
      </p>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
function EmptyOutputState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center justify-center min-h-[520px] text-center px-8"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-12 h-12 flex items-center justify-center mb-10"
        style={{ background: "var(--sf-panel)" }}
      >
        <Sparkles size={20} strokeWidth={1.5} style={{ color: "#f59e0b" }} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mb-4"
        style={{
          fontFamily: '"Newsreader", Georgia, serif',
          fontSize: "2rem",
          lineHeight: "1.2",
          color: "var(--text-secondary)",
        }}
      >
        The Stage is Empty
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.32 }}
        className="text-sm leading-[1.8] max-w-xs mb-12"
        style={{ color: "var(--text-tertiary)" }}
      >
        Set your directive parameters on the left, then forge your manuscript. Three distinct script variations, each scored for viral potential.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <p className="text-[0.6875rem] uppercase tracking-[0.08em] mb-5" style={{ color: "var(--text-muted)" }}>
          Example Ideas
        </p>
        <div className="flex flex-col gap-2.5">
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.46 + i * 0.06 }}
              className="text-left px-5 py-3.5 text-sm leading-relaxed"
              style={{
                background: "var(--sf-panel)",
                color: "var(--text-tertiary)",
                borderLeft: "2px solid var(--sf-raised)",
              }}
            >
              {ex}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
