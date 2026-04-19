"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy, Check, RefreshCw, Clock, Film, Megaphone } from "lucide-react";
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
    raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
    return blocks;
  }

  const preText = raw.slice(0, matches[0].index).trim();
  if (preText) {
    preText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
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
        content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
          .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
      }
      continue;
    }
    if (tagUpper.startsWith("B-ROLL")) {
      const description = tagUpper.includes(":") ? current.tag.split(":").slice(1).join(":").trim() : "";
      blocks.push({ kind: "broll", text: description });
      if (content) {
        content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
          .forEach((p) => blocks.push({ kind: "paragraph", text: p }));
      }
      continue;
    }
    if (tagUpper === "HOOK" || tagUpper === "CORE") { blocks.push({ kind: "hook", text: content }); continue; }
    if (tagUpper === "CONCLUSION") { blocks.push({ kind: "conclusion", text: content }); continue; }
    if (tagUpper === "CTA") { blocks.push({ kind: "cta", text: content }); continue; }
    if (tagUpper.startsWith("SECTION")) {
      const title = current.tag.includes(":") ? current.tag.split(":").slice(1).join(":").trim() : "Section";
      blocks.push({ kind: "section", title, text: content });
      continue;
    }
  }
  return blocks;
}

function countWords(text: string): number {
  return text.replace(/\[(?:[^\]]+)\]/g, " ").split(/\s+/).filter(Boolean).length;
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export default function ScriptViewer({ script, isGenerating, tone, length, onReset }: ScriptViewerProps) {
  const [copied, setCopied] = useState(false);
  const blocks = useMemo(() => parseScript(script), [script]);
  const wordCount = useMemo(() => countWords(script), [script]);
  const toneInfo = tone ? TONE_OPTIONS.find((t) => t.id === tone) : null;
  const lengthInfo = length ? LENGTH_OPTIONS.find((l) => l.id === length) : null;

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
    } catch { /* ignore */ }
  }

  const lastBlockIndex = blocks.length - 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full mt-12"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Metadata bar */}
        <div
          className="flex flex-wrap items-center gap-2 px-5 sm:px-8 py-3.5 border-b"
          style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
        >
          {toneInfo && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
              {toneInfo.label}
            </span>
          )}
          {lengthInfo && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
            >
              <Clock size={11} strokeWidth={2} />
              {lengthInfo.label}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
            <span
              className={clsx("h-1.5 w-1.5 rounded-full", isGenerating && "animate-pulse")}
              style={{ background: isGenerating ? "var(--accent)" : "var(--border-strong)" }}
            />
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {blocks.length === 0 && isGenerating && (
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded-md shimmer" />
              <div className="h-4 w-5/6 rounded-md shimmer" />
              <div className="h-4 w-3/4 rounded-md shimmer" />
              <div className="h-4 w-4/5 rounded-md shimmer" />
            </div>
          )}

          <article className="space-y-4">
            {blocks.map((block, i) => {
              const isLast = i === lastBlockIndex && isGenerating;

              if (block.kind === "pause") {
                return (
                  <div key={i} className="flex items-center gap-2 py-1" aria-label="Dramatic pause">
                    {[0, 1, 2].map((j) => (
                      <span key={j} className="h-1 w-1 rounded-full" style={{ background: "var(--border-strong)" }} />
                    ))}
                  </div>
                );
              }

              if (block.kind === "broll") {
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
                  >
                    <Film size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>B-Roll</div>
                      <p className="text-base italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {block.text || "Visual direction"}
                      </p>
                    </div>
                  </div>
                );
              }

              if (block.kind === "hook") {
                return (
                  <div key={i}>
                    <div className="text-[10px] font-medium uppercase tracking-widest mb-2.5" style={{ color: "var(--accent)" }}>
                      Hook
                    </div>
                    {splitParagraphs(block.text).map((p, pi, arr) => (
                      <p
                        key={pi}
                        className={clsx(
                          "font-display text-2xl md:text-3xl leading-[1.4]",
                          pi < arr.length - 1 && "mb-3",
                          isLast && pi === arr.length - 1 && "typing-cursor",
                        )}
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                );
              }

              if (block.kind === "section") {
                return (
                  <div key={i} className="pl-4 border-l-2" style={{ borderColor: "var(--accent)" }}>
                    <h3 className="font-display text-xl md:text-2xl leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
                      {block.title}
                    </h3>
                    <div className="space-y-3">
                      {splitParagraphs(block.text).map((p, pi, arr) => (
                        <p
                          key={pi}
                          className={clsx(
                            "text-base leading-[1.8]",
                            isLast && pi === arr.length - 1 && "typing-cursor",
                          )}
                          style={{ color: "var(--text-secondary)" }}
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
                  <div key={i}>
                    <div className="text-[10px] font-medium uppercase tracking-widest mb-2.5" style={{ color: "var(--text-muted)" }}>
                      Conclusion
                    </div>
                    <div className="space-y-3">
                      {splitParagraphs(block.text).map((p, pi, arr) => (
                        <p
                          key={pi}
                          className={clsx("text-base leading-[1.8]", isLast && pi === arr.length - 1 && "typing-cursor")}
                          style={{ color: "var(--text-secondary)" }}
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
                    className="rounded-xl px-4 py-4"
                    style={{ background: "var(--accent-light)", border: "1px solid var(--accent-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone size={13} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
                      <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                        Call to Action
                      </span>
                    </div>
                    {splitParagraphs(block.text).map((p, pi, arr) => (
                      <p
                        key={pi}
                        className={clsx("text-base leading-[1.75]", pi < arr.length - 1 && "mb-2", isLast && pi === arr.length - 1 && "typing-cursor")}
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                );
              }

              return (
                <p
                  key={i}
                  className={clsx("text-base leading-[1.8]", isLast && "typing-cursor")}
                  style={{ color: "var(--text-secondary)" }}
                >
                  {block.text}
                </p>
              );
            })}
          </article>
        </div>

        {/* Action bar */}
        {script && (
          <div
            className="flex flex-wrap items-center gap-2 px-5 sm:px-8 py-3.5 border-t"
            style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
          >
            <button
              type="button"
              onClick={handleCopy}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2} style={{ color: "#16a34a" }} />
                  <span style={{ color: "#16a34a" }}>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy size={14} strokeWidth={1.75} />
                  Copy script
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-tertiary)" }}
            >
              <RefreshCw size={13} strokeWidth={1.75} />
              New script
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
