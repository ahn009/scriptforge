"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy, Check, RefreshCw, Film, Megaphone } from "lucide-react";
import clsx from "clsx";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "@/lib/constants";
import type { Tone, VideoLength } from "@/lib/types";

interface ScriptViewerProps {
  script: string;
  isGenerating: boolean;
  tone: Tone | null;
  length: VideoLength | null;
  onReset: () => void;
  title?: string;
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

export default function ScriptViewer({ script, isGenerating, tone, length, onReset, title }: ScriptViewerProps) {
  const [copied, setCopied] = useState(false);
  const blocks = useMemo(() => parseScript(script), [script]);
  const wordCount = useMemo(() => countWords(script), [script]);
  const toneInfo = tone ? TONE_OPTIONS.find((t) => t.id === tone) : null;
  const lengthInfo = length ? LENGTH_OPTIONS.find((l) => l.id === length) : null;
  const lastBlockIndex = blocks.length - 1;

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Focus Reader Article */}
      <article
        className="w-full flex flex-col gap-10 p-10 md:p-16"
        style={{
          background: "var(--sf-article)",
          borderRadius: "0.125rem",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Article header */}
        <header
          className="flex flex-col gap-3 text-center pb-8"
          style={{ borderBottom: "1px solid var(--divider)" }}
        >
          <span
            className="text-[0.6875rem] uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            Generated Draft v1.0
          </span>
          {title && title.trim() && (
            <h1
              className="text-4xl md:text-5xl leading-[1.2]"
              style={{
                fontFamily: '"Newsreader", Georgia, serif',
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h1>
          )}
          {(toneInfo || lengthInfo) && (
            <p
              className="italic text-sm"
              style={{ color: "var(--text-secondary)", fontFamily: '"Inter", sans-serif' }}
            >
              {[lengthInfo && `Target: ${lengthInfo.label}`, toneInfo && `Tone: ${toneInfo.label}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </header>

        {/* Script content blocks */}
        <div className="flex flex-col gap-8 text-lg leading-[1.8]">
          {blocks.map((block, i) => {
            const isLast = i === lastBlockIndex && isGenerating;

            if (block.kind === "pause") {
              return (
                <div key={i} className="w-full my-2" aria-label="Dramatic pause">
                  <div style={{ height: "1px", background: "rgba(83,68,52,0.15)" }} />
                </div>
              );
            }

            if (block.kind === "broll") {
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4"
                  style={{
                    background: "var(--bg-base)",
                    borderLeft: `4px solid var(--sf-interactive)`,
                    borderRadius: "0.125rem",
                  }}
                >
                  <Film size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  <p
                    className="italic text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {block.text || "Visual direction"}
                  </p>
                </div>
              );
            }

            if (block.kind === "hook") {
              return (
                <div key={i} className="flex flex-col gap-3">
                  <h3
                    className="text-[0.6875rem] uppercase tracking-widest"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Opening Hook
                  </h3>
                  {splitParagraphs(block.text).map((p, pi, arr) => (
                    <p
                      key={pi}
                      className={clsx(
                        "text-3xl leading-snug",
                        isLast && pi === arr.length - 1 && "typing-cursor",
                      )}
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: '"Newsreader", Georgia, serif',
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              );
            }

            if (block.kind === "section") {
              return (
                <div key={i} className="flex flex-col gap-4">
                  <h2
                    className="font-bold text-xl uppercase tracking-wide"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {block.title}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {splitParagraphs(block.text).map((p, pi, arr) => (
                      <p
                        key={pi}
                        className={clsx(
                          "text-base leading-[1.85]",
                          isLast && pi === arr.length - 1 && "typing-cursor",
                        )}
                        style={{ color: "var(--text-primary)" }}
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
                <div key={i} className="flex flex-col gap-3">
                  <h3
                    className="text-[0.6875rem] uppercase tracking-widest"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Conclusion
                  </h3>
                  {splitParagraphs(block.text).map((p, pi, arr) => (
                    <p
                      key={pi}
                      className={clsx("text-base leading-[1.85]", isLast && pi === arr.length - 1 && "typing-cursor")}
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              );
            }

            if (block.kind === "cta") {
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-4 p-8"
                  style={{
                    background: "var(--sf-interactive)",
                    border: "1px solid var(--sf-raised)",
                    borderRadius: "0.125rem",
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Megaphone size={14} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
                    <span
                      className="text-[0.6875rem] uppercase tracking-widest"
                      style={{ color: "var(--accent)" }}
                    >
                      Call to Action
                    </span>
                  </div>
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
              );
            }

            return (
              <p
                key={i}
                className={clsx("text-base leading-[1.85]", isLast && "typing-cursor")}
                style={{ color: "var(--text-primary)" }}
              >
                {block.text}
              </p>
            );
          })}
        </div>

        {/* Footer: word count + actions */}
        {script && (
          <footer
            className="flex flex-wrap items-center gap-3 pt-6"
            style={{ borderTop: "1px solid var(--divider)" }}
          >
            <span
              className="text-[0.6875rem] uppercase tracking-widest mr-auto"
              style={{ color: "var(--text-muted)" }}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--sf-panel)",
                color: copied ? "var(--accent-uplifting)" : "var(--text-tertiary)",
                borderRadius: "0.125rem",
              }}
            >
              {copied ? (
                <><Check size={12} strokeWidth={2} /> Copied</>
              ) : (
                <><ClipboardCopy size={12} strokeWidth={1.75} /> Copy Script</>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--sf-panel)",
                color: "var(--text-muted)",
                borderRadius: "0.125rem",
              }}
            >
              <RefreshCw size={12} strokeWidth={1.75} />
              New Script
            </button>
          </footer>
        )}
      </article>
    </motion.section>
  );
}
