"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCopy,
  Check,
  RefreshCw,
  Clock,
  Film,
  Megaphone,
} from "lucide-react";
import clsx from "clsx";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength } from "@/lib/types";

interface ScriptViewerProps {
  script: string;
  isGenerating: boolean;
  tone: Tone | null;
  length: VideoLength | null;
  onReset: () => void;
}

type Block =
  | { kind: "hook"; text: string }
  | { kind: "section"; title: string; text: string }
  | { kind: "conclusion"; text: string }
  | { kind: "cta"; text: string }
  | { kind: "pause" }
  | { kind: "broll"; text: string }
  | { kind: "paragraph"; text: string };

const TAG_REGEX =
  /\[(HOOK|CORE|CONCLUSION|CTA|PAUSE|B-ROLL(?::[^\]]*)?|SECTION(?::[^\]]*)?)\]/gi;

function parseScript(raw: string): Block[] {
  if (!raw.trim()) return [];

  const blocks: Block[] = [];
  const matches: { tag: string; index: number; length: number }[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(TAG_REGEX);
  while ((m = re.exec(raw)) !== null) {
    matches.push({ tag: m[1], index: m.index, length: m[0].length });
  }

  if (matches.length === 0) {
    raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
    return blocks;
  }

  // content before first tag
  const preText = raw.slice(0, matches[0].index).trim();
  if (preText) {
    preText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const contentStart = current.index + current.length;
    const contentEnd = next ? next.index : raw.length;
    const content = raw.slice(contentStart, contentEnd).trim();

    const tagUpper = current.tag.toUpperCase();

    if (tagUpper === "PAUSE") {
      blocks.push({ kind: "pause" });
      if (content) {
        content
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
      }
      continue;
    }

    if (tagUpper.startsWith("B-ROLL")) {
      const description = tagUpper.includes(":")
        ? current.tag.split(":").slice(1).join(":").trim()
        : "";
      blocks.push({ kind: "broll", text: description });
      if (content) {
        content
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
      }
      continue;
    }

    if (tagUpper === "HOOK" || tagUpper === "CORE") {
      blocks.push({ kind: "hook", text: content });
      continue;
    }

    if (tagUpper === "CONCLUSION") {
      blocks.push({ kind: "conclusion", text: content });
      continue;
    }

    if (tagUpper === "CTA") {
      blocks.push({ kind: "cta", text: content });
      continue;
    }

    if (tagUpper.startsWith("SECTION")) {
      const rawTag = current.tag;
      const title = rawTag.includes(":")
        ? rawTag.split(":").slice(1).join(":").trim()
        : "Section";
      blocks.push({ kind: "section", title, text: content });
      continue;
    }
  }

  return blocks;
}

function countWords(text: string): number {
  const stripped = text.replace(/\[(?:[^\]]+)\]/g, " ");
  return stripped.split(/\s+/).filter(Boolean).length;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ScriptViewer({
  script,
  isGenerating,
  tone,
  length,
  onReset,
}: ScriptViewerProps) {
  const [copied, setCopied] = useState(false);

  const blocks = useMemo(() => parseScript(script), [script]);
  const wordCount = useMemo(() => countWords(script), [script]);

  const toneInfo = tone ? TONE_OPTIONS.find((t) => t.id === tone) : null;
  const lengthInfo = length
    ? LENGTH_OPTIONS.find((l) => l.id === length)
    : null;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      const plain = script.replace(/\[(?:[^\]]+)\]/g, "").trim();
      await navigator.clipboard.writeText(plain || script);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }

  const lastBlockIndex = blocks.length - 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full mt-10 md:mt-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-24 w-3/4"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,168,73,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="glass-card relative rounded-2xl overflow-hidden">
        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 px-4 md:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
          {toneInfo && (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-body"
              style={{
                background: toneInfo.colorDim,
                color: "var(--text-primary)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: toneInfo.color }}
              />
              {toneInfo.label}
            </div>
          )}
          {lengthInfo && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body bg-[var(--bg-card)] text-[var(--text-secondary)]">
              <Clock size={12} strokeWidth={2} />
              {lengthInfo.label}
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-xs font-body tabular-nums text-[var(--text-tertiary)]">
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full",
                isGenerating
                  ? "bg-[var(--accent-amber)] animate-pulse"
                  : "bg-[var(--text-tertiary)]",
              )}
            />
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </div>
        </div>

        {/* Content area */}
        <div className="px-5 md:px-10 py-8 md:py-12">
          {blocks.length === 0 && isGenerating && (
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded shimmer" />
              <div className="h-4 w-5/6 rounded shimmer" />
              <div className="h-4 w-3/4 rounded shimmer" />
            </div>
          )}

          <article className="space-y-6 md:space-y-7">
            {blocks.map((block, i) => {
              const isLast = i === lastBlockIndex && isGenerating;
              if (block.kind === "pause") {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-3 py-2 select-none"
                    aria-label="Dramatic pause"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]/60" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]/60" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]/60" />
                  </div>
                );
              }

              if (block.kind === "broll") {
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--accent-neutral-dim)] px-4 py-3"
                  >
                    <Film
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 text-[var(--accent-neutral)] shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-[10px] font-body tracking-[0.2em] uppercase text-[var(--accent-neutral)] mb-1">
                        B-Roll
                      </div>
                      <div className="font-body italic text-sm text-[var(--text-secondary)] leading-relaxed">
                        {block.text || "Visual direction"}
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.kind === "hook") {
                return (
                  <div key={i} className="relative">
                    <div className="text-[10px] font-display tracking-[0.3em] uppercase text-[var(--accent-amber)] mb-3">
                      Hook
                    </div>
                    {splitParagraphs(block.text).map((p, pi, arr) => (
                      <p
                        key={pi}
                        className={clsx(
                          "font-display text-xl md:text-2xl leading-[1.5] text-[var(--text-primary)]",
                          pi < arr.length - 1 && "mb-3",
                          isLast && pi === arr.length - 1 && "typing-cursor",
                        )}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                );
              }

              if (block.kind === "section") {
                return (
                  <div
                    key={i}
                    className="relative pl-5 border-l-2 border-[var(--accent-amber)]/70"
                  >
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-3 leading-tight">
                      {block.title}
                    </h3>
                    <div className="space-y-4">
                      {splitParagraphs(block.text).map((p, pi, arr) => (
                        <p
                          key={pi}
                          className={clsx(
                            "font-body text-[15px] md:text-base leading-[1.8] text-[var(--text-secondary)]",
                            isLast && pi === arr.length - 1 && "typing-cursor",
                          )}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.kind === "conclusion") {
                return (
                  <div key={i} className="relative">
                    <div className="text-[10px] font-display tracking-[0.3em] uppercase text-[var(--text-secondary)] mb-3">
                      Conclusion
                    </div>
                    <div className="space-y-4">
                      {splitParagraphs(block.text).map((p, pi, arr) => (
                        <p
                          key={pi}
                          className={clsx(
                            "font-body text-[15px] md:text-base leading-[1.8] text-[var(--text-secondary)]",
                            isLast && pi === arr.length - 1 && "typing-cursor",
                          )}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.kind === "cta") {
                return (
                  <div
                    key={i}
                    className="relative rounded-xl border-l-4 border-[var(--accent-amber)] bg-[var(--accent-amber-dim)] px-5 py-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone
                        size={14}
                        strokeWidth={2.2}
                        className="text-[var(--accent-amber)]"
                      />
                      <span className="text-[10px] font-display tracking-[0.3em] uppercase text-[var(--accent-amber)]">
                        Call to Action
                      </span>
                    </div>
                    {splitParagraphs(block.text).map((p, pi, arr) => (
                      <p
                        key={pi}
                        className={clsx(
                          "font-body text-[15px] md:text-base leading-[1.75] text-[var(--text-primary)]",
                          pi < arr.length - 1 && "mb-3",
                          isLast && pi === arr.length - 1 && "typing-cursor",
                        )}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                );
              }

              // paragraph
              return (
                <p
                  key={i}
                  className={clsx(
                    "font-body text-[15px] md:text-base leading-[1.8] text-[var(--text-secondary)]",
                    isLast && "typing-cursor",
                  )}
                >
                  {block.text}
                </p>
              );
            })}
          </article>
        </div>

        {/* Action bar */}
        {script && (
          <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isGenerating}
              className={clsx(
                "group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body",
                "border border-[var(--border-medium)] bg-transparent text-[var(--text-primary)]",
                "hover:bg-[var(--bg-card-hover)] transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              )}
            >
              {copied ? (
                <>
                  <Check
                    size={15}
                    strokeWidth={2.3}
                    className="text-[var(--accent-uplifting)]"
                  />
                  <span className="text-[var(--accent-uplifting)]">Copied</span>
                </>
              ) : (
                <>
                  <ClipboardCopy size={15} strokeWidth={2.2} />
                  Copy Script
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={isGenerating}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body",
                "border border-[var(--border-medium)] bg-transparent text-[var(--text-secondary)]",
                "hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              )}
            >
              <RefreshCw size={14} strokeWidth={2.2} />
              New Script
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
