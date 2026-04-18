"use client";

import { useEffect, useRef } from "react";
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
  const nearLimit = count > 400;

  return (
    <div className="w-full">
      <label
        htmlFor="prompt"
        className="block text-base font-semibold mb-2.5"
        style={{ color: "var(--text-primary)" }}
      >
        Your content idea
      </label>

      <div className="relative">
        <textarea
          ref={ref}
          id="prompt"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="What's your video about? e.g., The rise and fall of the Roman Empire, for a history-loving audience…"
          className={clsx(
            "w-full min-h-[150px] px-5 py-4 rounded-2xl",
            "text-base leading-relaxed",
            "border transition-all duration-150",
            "focus:outline-none focus:ring-2",
            "shadow-sm focus:shadow-md",
            disabled && "opacity-60 cursor-not-allowed",
          )}
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            borderColor: "var(--border)",
            "--tw-ring-color": "var(--border-focus)",
          } as React.CSSProperties}
          maxLength={maxLength}
          rows={5}
        />

        <span
          className="absolute bottom-3.5 right-4 text-sm tabular-nums"
          style={{ color: nearLimit ? "var(--accent)" : "var(--text-muted)" }}
        >
          {count}/{maxLength}
        </span>
      </div>

      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
        Tip: mention your target audience for better results
      </p>
    </div>
  );
}
