"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const EXAMPLES = [
  "What if I told you the Roman Empire never actually fell…",
  "A 5-step morning routine that changed 1 million lives",
  "Why 95% of people fail at building habits — and what actually works",
  "The untold story of Tesla: brilliance, betrayal, and obsession",
  "How a 22-year-old built a $10M business with zero funding",
];

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
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    if (disabled) return;
    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % EXAMPLES.length);
    }, 3500);
    return () => clearInterval(id);
  }, [disabled]);

  const count = value.length;
  const nearLimit = count > 400;
  const isEmpty = count === 0;

  return (
    <div className="w-full">
      <label
        htmlFor="prompt"
        className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Your content idea
        <span className="ml-1.5 text-[9px] font-medium" style={{ color: "var(--accent)", opacity: 0.8 }}>
          required
        </span>
      </label>

      <div className="relative">
        <textarea
          ref={ref}
          id="prompt"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={`e.g. "${EXAMPLES[exampleIdx]}"`}
          className={clsx(
            "w-full min-h-[140px] px-4 py-4 rounded-2xl",
            "text-base leading-relaxed",
            "border shadow-sm transition-all duration-200",
            "focus:outline-none",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            borderColor: isEmpty ? "var(--border)" : "var(--accent-border)",
            boxShadow: isEmpty
              ? "none"
              : "0 0 0 3px rgba(245,158,11,0.10)",
          } as React.CSSProperties}
          maxLength={maxLength}
          rows={5}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-border)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = value ? "var(--accent-border)" : "var(--border)";
            e.currentTarget.style.boxShadow = value ? "0 0 0 3px rgba(245,158,11,0.08)" : "none";
          }}
        />

        <span
          className="absolute bottom-3.5 right-4 text-xs tabular-nums pointer-events-none"
          style={{ color: nearLimit ? "var(--accent)" : "var(--text-muted)" }}
        >
          {count}/{maxLength}
        </span>
      </div>

      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        {value ? "Tip: mention your target audience for better results" : "Describe the topic, story, or idea for your video"}
      </p>
    </div>
  );
}
