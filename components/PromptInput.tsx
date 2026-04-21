"use client";

import { useEffect, useRef, useState } from "react";

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

  return (
    <div className="w-full">
      <label
        htmlFor="prompt"
        className="block text-[0.6875rem] font-medium uppercase tracking-widest mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        Prompt Idea
      </label>

      <div className="relative">
        <textarea
          ref={ref}
          id="prompt"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={`Describe the scene, characters, or core narrative thrust…\ne.g. "${EXAMPLES[exampleIdx]}"`}
          className="w-full p-4 text-sm resize-none focus:outline-none transition-colors duration-200"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "none",
            borderBottom: `2px solid ${value ? "var(--accent)" : "var(--text-muted)"}`,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "text",
            fontFamily: '"Inter", sans-serif',
            lineHeight: "1.6",
            minHeight: "130px",
          }}
          maxLength={maxLength}
          rows={5}
          onFocus={(e) => {
            e.currentTarget.style.borderBottomColor = "var(--accent)";
            e.currentTarget.style.background = "var(--sf-panel)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderBottomColor = value ? "var(--accent)" : "var(--text-muted)";
            e.currentTarget.style.background = "var(--bg-input)";
          }}
        />

        <span
          className="absolute bottom-3 right-3 text-[11px] tabular-nums pointer-events-none"
          style={{ color: nearLimit ? "var(--accent)" : "var(--text-muted)" }}
        >
          {count}/{maxLength}
        </span>
      </div>
    </div>
  );
}
