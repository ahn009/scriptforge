"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import clsx from "clsx";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function PromptInput({
  value,
  onChange,
  disabled = false,
  maxLength = 500,
}: PromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const count = value.length;
  const warn = count > 400 && count < maxLength;
  const danger = count >= maxLength;

  return (
    <div className="w-full">
      <label
        htmlFor="prompt"
        className="block font-display text-sm tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2"
      >
        <Sparkles size={14} className="text-[var(--accent-amber)]" />
        Your Content Idea
      </label>

      <div className="relative group">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow:
              "0 0 0 1px rgba(232,168,73,0.35), 0 0 28px rgba(232,168,73,0.12) inset",
          }}
        />
        <textarea
          ref={ref}
          id="prompt"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="What's your video about? e.g., The rise and fall of the Roman Empire..."
          className={clsx(
            "glass-card relative w-full min-h-[140px] px-5 py-4 pr-20 rounded-2xl",
            "font-body text-base leading-relaxed text-[var(--text-primary)]",
            "placeholder:italic placeholder:text-[var(--text-muted)]",
            "transition-all duration-200",
            "focus:outline-none",
            disabled && "opacity-60 cursor-not-allowed",
          )}
          style={{
            background: "rgba(30,30,35,0.55)",
          }}
          maxLength={maxLength}
          rows={5}
        />

        <div
          className={clsx(
            "pointer-events-none absolute bottom-3 right-4 text-xs font-body tabular-nums transition-colors",
            !warn && !danger && "text-[var(--text-tertiary)]",
            warn && "text-[var(--accent-amber)]",
            danger && "text-[var(--accent-dramatic)]",
          )}
        >
          {count} / {maxLength}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-body">
        <Lightbulb size={10} />
        <span>Pro tip: Include your target audience for better results</span>
      </div>
    </div>
  );
}
